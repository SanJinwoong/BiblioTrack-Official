
'use client';

import { useState, useEffect } from 'react';
import type { Book as BookType, Checkout, User as UserType, Category } from '@/lib/types';
import { Book, ListChecks, Search, User, Bell, BookCopy, PlusCircle, Users, UserX, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCard } from './book-card';
import { BookDetailsDialog } from './book-details-dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { AddBookDialog } from './add-book-dialog';
import { DashboardHeader } from './dashboard-header';
import { SettingsDialog } from './settings-dialog';
import { isPast, parseISO, differenceInDays } from 'date-fns';
import { UserLoanCard } from './user-loan-card';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

export function LibrarianDashboard() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutRequests, setCheckoutRequests] = useState<Checkout[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [deactivatedUserSearchTerm, setDeactivatedUserSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [selectedCheckout, setSelectedCheckout] = useState<Checkout | null>(null);
  const [username, setUsername] = useState('');
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<BookType | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);

    const unsubscribes = [
      onSnapshot(collection(db, 'books'), snapshot => {
        setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookType)))
      }),
      onSnapshot(collection(db, 'categories'), snapshot => 
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)))
      ),
      onSnapshot(collection(db, 'checkouts'), snapshot => 
        setCheckouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkout)))
      ),
      onSnapshot(collection(db, 'checkoutRequests'), snapshot =>
        setCheckoutRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkout)))
      ),
      onSnapshot(collection(db, 'users'), snapshot =>
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType)))
      ),
    ];
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  useEffect(() => {
    // Automatic deactivation logic
    const checkOverdueAccounts = async () => {
      const gracePeriod = 7; // days
      const now = new Date();
      const overdueUsersToDeactivate = new Set<string>();

      checkouts.forEach(checkout => {
        const dueDate = parseISO(checkout.dueDate);
        if (isPast(dueDate) && differenceInDays(now, dueDate) > gracePeriod) {
          overdueUsersToDeactivate.add(checkout.userId);
        }
      });
      
      if (overdueUsersToDeactivate.size > 0) {
        const batch = writeBatch(db);
        let deactivatedCount = 0;
        
        users.forEach(user => {
          const userIdentifier = user.username;
          if (overdueUsersToDeactivate.has(userIdentifier) && user.status === 'active') {
            const userRef = doc(db, 'users', user.id);
            batch.update(userRef, { status: 'deactivated' });
            deactivatedCount++;
          }
        });

        if (deactivatedCount > 0) {
          await batch.commit();
          toast({
            title: 'Cuentas Desactivadas Automáticamente',
            description: `${deactivatedCount} cuenta(s) han sido desactivadas por préstamos vencidos.`,
          });
        }
      }
    };

    const timer = setTimeout(checkOverdueAccounts, 5000); // Run after 5s to ensure data is loaded
    return () => clearTimeout(timer);

  }, [checkouts, users, toast]);


  useEffect(() => {
    const results = books.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredBooks(results);
  }, [searchTerm, selectedCategory, books]);


  const getBook = (bookId: string): BookType | undefined => {
    return books.find(b => b.id === bookId);
  };

  const getUser = (userId: string): UserType | undefined => {
      return users.find(u => u.username === userId || u.id === userId);
  }
  
  const handleOpenDialog = (book: BookType, checkout: Checkout | null = null) => {
    setSelectedBook(book);
    setSelectedCheckout(checkout);
  };

  const handleCloseDialog = () => {
    setSelectedBook(null);
    setSelectedCheckout(null);
  };

  const handleApproveRequest = async (requestToApprove: any) => {
    const bookToCheckout = getBook(requestToApprove.bookId);
    if (!bookToCheckout || bookToCheckout.stock === 0) {
      toast({ variant: 'destructive', title: 'Error de aprobación', description: `El libro "${bookToCheckout?.title}" no está disponible.` });
      await deleteDoc(doc(db, 'checkoutRequests', requestToApprove.id));
      return;
    }
    
    const batch = writeBatch(db);

    const bookRef = doc(db, 'books', requestToApprove.bookId);
    batch.update(bookRef, { stock: bookToCheckout.stock - 1 });
    
    const checkoutRef = doc(collection(db, 'checkouts'));
    const { id, ...requestData } = requestToApprove;
    batch.set(checkoutRef, { ...requestData, status: 'approved' });

    const requestRef = doc(db, 'checkoutRequests', requestToApprove.id);
    batch.delete(requestRef);
    
    await batch.commit();

    handleCloseDialog();
    toast({ title: '✅ Préstamo Aprobado', description: `El préstamo de "${bookToCheckout.title}" a ${requestToApprove.userId} ha sido confirmado.` });
  };

  const handleSuccessfulCheckout = async (bookId: string, checkoutData: {userId: string; dueDate: string}) => {
    const bookToCheckout = getBook(bookId);
     if (!bookToCheckout || bookToCheckout.stock === 0) {
      toast({ variant: 'destructive', title: 'Error de aprobación', description: `El libro "${bookToCheckout?.title}" no está disponible.` });
      return;
    }

    const batch = writeBatch(db);
    const bookRef = doc(db, 'books', bookId);
    batch.update(bookRef, { stock: bookToCheckout.stock - 1 });

    const newCheckout: Omit<Checkout, 'id'> = { ...checkoutData, bookId: bookId, status: 'approved' };
    const checkoutRef = doc(collection(db, 'checkouts'));
    batch.set(checkoutRef, newCheckout);
    
    await batch.commit();
  };
  
  const handleAddNewBook = async (newBookData: Omit<BookType, 'id'>) => {
    const docRef = await addDoc(collection(db, 'books'), newBookData);
    setBooks(prev => [...prev, { ...newBookData, id: docRef.id }]);
    toast({ title: '📖 ¡Libro Añadido!', description: `"${newBookData.title}" ha sido añadido al catálogo.` });
  };

  const handleUpdateBook = async (updatedBook: BookType) => {
    const { id, ...bookData } = updatedBook;
    const bookRef = doc(db, 'books', id);
    await updateDoc(bookRef, bookData);
    toast({ title: '📘 ¡Libro Actualizado!', description: `"${updatedBook.title}" ha sido actualizado.` });
  };
  
  const handleOpenAddBookDialog = () => {
    setBookToEdit(null);
    setIsAddBookDialogOpen(true);
  };
  
  const handleOpenEditBookDialog = (book: BookType) => {
    setBookToEdit(book);
    setIsAddBookDialogOpen(true);
  };

  const handleDeleteBook = async (bookId: string) => {
    await deleteDoc(doc(db, 'books', bookId));
    toast({ title: '🗑️ Libro Eliminado', description: 'El libro ha sido eliminado del catálogo.' });
  };

  const handleReturnBook = async (checkoutToReturn: any) => {
    const batch = writeBatch(db);

    const book = getBook(checkoutToReturn.bookId);
    if(book) {
        const bookRef = doc(db, 'books', checkoutToReturn.bookId);
        batch.update(bookRef, { stock: book.stock + 1 });
    }

    const checkoutRef = doc(db, 'checkouts', checkoutToReturn.id);
    batch.delete(checkoutRef);
    
    const userToUpdate = users.find(u => u.username === checkoutToReturn.userId);

    if (userToUpdate && userToUpdate.status === 'deactivated') {
        const otherCheckoutsQuery = query(collection(db, 'checkouts'), where('userId', '==', checkoutToReturn.userId));
        const otherCheckoutsSnapshot = await getDocs(otherCheckoutsQuery);
        const otherCheckouts = otherCheckoutsSnapshot.docs.map(d => d.data() as Checkout).filter(c => c.id !== checkoutToReturn.id);
        const hasOtherOverdueBooks = otherCheckouts.some(c => isPast(parseISO(c.dueDate)));

        if (!hasOtherOverdueBooks) {
            const userRef = doc(db, 'users', userToUpdate.id);
            batch.update(userRef, { status: 'active' });
        }
    }

    await batch.commit();
    toast({ title: '✅ Libro Devuelto', description: `El libro ha sido marcado como devuelto.` });
  };

  const handleUserStatusChange = async (userId: string, reactivate: boolean) => {
    const user = users.find(u => u.username === userId || u.id === userId);
    if (!user) return;
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, { status: reactivate ? 'active' : 'deactivated' });
    
    toast({
        title: reactivate ? '👤 Cuenta Reactivada' : '🚫 Cuenta Desactivada',
        description: `La cuenta de ${user?.name || userId} ha sido ${reactivate ? 'reactivada' : 'desactivada'}.`,
    });
  };

  const activeCheckouts = checkouts.filter(c => c.status === 'approved');
  const overdueCheckouts = activeCheckouts.filter(c => isPast(parseISO(c.dueDate)));
  const atRiskCheckouts = activeCheckouts.filter(c => {
    const dueDate = parseISO(c.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diff = differenceInDays(dueDate, today);
    return diff >= 0 && diff <= 3;
  });

  const clientUsers = users.filter(u => u.role === 'client');
  const activeUsers = clientUsers.filter(u => u.status === 'active');
  const deactivatedUsers = users.filter(u => u.status === 'deactivated');

  const loansByUser = checkouts.reduce((acc, checkout) => {
      const user = getUser(checkout.userId);
      if (!user) return acc;

      const userIdentifier = user.id;
      if (!acc[userIdentifier]) {
          acc[userIdentifier] = {
              user: user,
              loans: []
          };
      }
      const book = getBook(checkout.bookId);
      if (book) {
          acc[userIdentifier].loans.push({ ...checkout, book });
      }
      return acc;
  }, {} as Record<string, { user: UserType; loans: (Checkout & { book: BookType })[] }>);

  const userLoanGroups = Object.values(loansByUser).map(group => {
      let status: 'deactivated' | 'overdue' | 'active' = 'active';

      if (group.user.status === 'deactivated') {
          status = 'deactivated';
      } else if (group.loans.some(loan => isPast(parseISO(loan.dueDate)))) {
          status = 'overdue';
      }

      return { ...group, status };
  });

  const usersWithOverdueLoans = new Set(overdueCheckouts.map(c => c.userId));
  
  const deactivatedUserGroups = userLoanGroups
    .filter(g => g.status === 'deactivated')
    .filter(g => 
        g.user.name?.toLowerCase().includes(deactivatedUserSearchTerm.toLowerCase()) ||
        g.user.username.toLowerCase().includes(deactivatedUserSearchTerm.toLowerCase())
    );

  const activeAndAtRiskCheckouts = activeCheckouts.filter(checkout => {
      const user = getUser(checkout.userId);
      return user?.status !== 'deactivated';
  });


  return (
    <>
      <DashboardHeader onAddNewBook={handleOpenAddBookDialog} onSettingsClick={() => setIsSettingsDialogOpen(true)} />
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <AddBookDialog
          open={isAddBookDialogOpen}
          onOpenChange={setIsAddBookDialogOpen}
          onBookAdded={handleAddNewBook}
          onBookUpdated={handleUpdateBook}
          bookToEdit={bookToEdit}
          categories={categories}
        />
       <SettingsDialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
          books={books}
          categories={categories}
          setCategories={() => {}}
          onEditBook={handleOpenEditBookDialog}
          onDeleteBook={handleDeleteBook}
        />
        <BookDetailsDialog 
            book={selectedBook} 
            checkout={selectedCheckout}
            open={!!selectedBook} 
            onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
            onSuccessfulCheckout={handleSuccessfulCheckout}
            onApproveRequest={handleApproveRequest}
            onReturnBook={handleReturnBook}
            onDeactivateUser={(userId) => handleUserStatusChange(userId, false)}
            username={username}
            role="librarian"
          />
          <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">Panel del Bibliotecario</h1>
                <p className="text-muted-foreground">Gestiona el catálogo, las solicitudes y los usuarios.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeUsers.length}</div>
                        <p className="text-xs text-muted-foreground">de {clientUsers.length} usuarios totales</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Préstamos en Riesgo</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{atRiskCheckouts.length}</div>
                        <p className="text-xs text-muted-foreground">Préstamos a punto de vencer</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Préstamos Vencidos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usersWithOverdueLoans.size}</div>
                        <p className="text-xs text-muted-foreground">Usuarios con préstamos vencidos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cuentas Desactivadas</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deactivatedUsers.length}</div>
                        <p className="text-xs text-muted-foreground">Usuarios con acceso restringido</p>
                    </CardContent>
                </Card>
            </div>


            <Tabs defaultValue="search">
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="search"><Search className="mr-2 h-4 w-4" />Buscar</TabsTrigger>
                <TabsTrigger value="requests">
                    <Bell className="mr-2 h-4 w-4" />
                    Solicitudes
                    {checkoutRequests.length > 0 && (
                        <Badge variant="destructive" className="ml-2 animate-pulse">{checkoutRequests.length}</Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="checkouts">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Préstamos
                  {deactivatedUserGroups.length > 0 && (
                      <Badge variant="destructive" className="ml-2 animate-pulse">{deactivatedUserGroups.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="search" className="mt-4">
                 <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Buscar en el Catálogo</CardTitle>
                     <CardDescription>Busca por título, autor o filtra por categoría.</CardDescription>
                      <div className="relative w-full max-w-sm pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="relative pt-4">
                        <Carousel opts={{ align: 'start', dragFree: false }} className="w-full">
                          <CarouselContent className="-ml-2">
                             <CarouselItem className="basis-auto pl-2">
                                <Button
                                  variant={!selectedCategory ? 'default' : 'secondary'}
                                  size="sm"
                                  onClick={() => setSelectedCategory(null)}
                                >
                                  Todos
                                </Button>
                              </CarouselItem>
                            {categories.map((category) => (
                              <CarouselItem key={category.id} className="basis-auto pl-2">
                                <Button
                                  variant={selectedCategory === category.name ? 'default' : 'secondary'}
                                  size="sm"
                                  onClick={() => setSelectedCategory(category.name)}
                                >
                                  {category.name}
                                </Button>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      </div>
                  </CardHeader>
                  <CardContent>
                    {books.length === 0 ? (
                       <div className="text-center py-16">
                        <BookCopy className="mx-auto h-12 w-12 text-muted-foreground"/>
                        <h3 className="mt-4 text-lg font-medium">No hay libros en el catálogo</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Empieza añadiendo un libro a la biblioteca.</p>
                        <Button className="mt-4" onClick={handleOpenAddBookDialog}><PlusCircle className="mr-2 h-4 w-4" /> Añadir Primer Libro</Button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredBooks.map((book) => (
                                <BookCard key={book.id} book={book} onClick={() => handleOpenDialog(book)} />
                            ))}
                        </div>
                        {filteredBooks.length === 0 && (
                            <p className="text-muted-foreground text-center py-8">
                              {selectedCategory 
                                ? `No se encontraron libros para "${searchTerm}" en la categoría "${selectedCategory}".`
                                : `No se encontraron libros para "${searchTerm}".`
                              }
                            </p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Solicitudes de Préstamo Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {checkoutRequests.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {checkoutRequests.map((request) => {
                                    const book = getBook(request.bookId);
                                    if (!book) return null;
                                    
                                    const user = getUser(request.userId);
                                    return (
                                        <BookCard key={`${request.id}`} book={book} onClick={() => handleOpenDialog(book, request)}>
                                            <div className="p-3 border-t mt-auto text-center">
                                                <p className="text-xs font-semibold text-primary mb-2">Solicitado por:</p>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <User className="h-4 w-4" />
                                                    <p className="text-sm font-medium truncate">{user?.name || request.userId}</p>
                                                </div>
                                            </div>
                                        </BookCard>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No hay solicitudes de préstamo pendientes.</p>
                        )}
                    </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="checkouts" className="mt-4">
                    <Tabs defaultValue="active">
                        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
                            <TabsTrigger value="active">Préstamos Activos</TabsTrigger>
                            <TabsTrigger value="deactivated">
                                Cuentas Desactivadas
                                {deactivatedUserGroups.length > 0 && (
                                    <Badge variant="destructive" className="ml-2 animate-pulse">{deactivatedUserGroups.length}</Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="active" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline">Préstamos Activos y Vencidos</CardTitle>
                                    <CardDescription>Libros prestados a usuarios con cuentas activas.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {activeAndAtRiskCheckouts.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {activeAndAtRiskCheckouts.map((checkout) => {
                                                const book = getBook(checkout.bookId);
                                                if (!book) return null;
                                                const isOverdue = isPast(parseISO(checkout.dueDate));
                                                
                                                return (
                                                    <BookCard key={`${checkout.id}`} book={book} onClick={() => handleOpenDialog(book, checkout)} isLoan={true} isOverdue={isOverdue}>
                                                        <div className="p-3 border-t mt-auto text-center">
                                                            <p className="text-xs font-semibold text-primary mb-2">Prestado a:</p>
                                                            <div className='flex items-center justify-center gap-2'>
                                                                <User className="h-4 w-4" />
                                                                <p className="text-sm font-medium truncate">{getUser(checkout.userId)?.name || checkout.userId}</p>
                                                            </div>
                                                        </div>
                                                    </BookCard>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">No hay préstamos activos.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="deactivated" className="mt-4">
                             <Card>
                                <CardHeader>
                                    <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-4'>
                                        <div>
                                            <CardTitle className="font-headline">Usuarios con Cuentas Desactivadas</CardTitle>
                                            <CardDescription>Estos usuarios tienen préstamos vencidos y su acceso está restringido.</CardDescription>
                                        </div>
                                        <div className="relative w-full sm:max-w-xs">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input
                                            placeholder="Buscar por nombre o matrícula..."
                                            value={deactivatedUserSearchTerm}
                                            onChange={(e) => setDeactivatedUserSearchTerm(e.target.value)}
                                            className="pl-10"
                                          />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {deactivatedUserGroups.length > 0 ? (
                                        <div className="space-y-4">
                                            {deactivatedUserGroups.map(group => (
                                                <UserLoanCard 
                                                    key={group.user.id}
                                                    user={group.user}
                                                    loans={group.loans}
                                                    onReactivateAccount={() => handleUserStatusChange(group.user.id, true)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">No hay cuentas desactivadas actualmente.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </div>
    </>
  );
}
