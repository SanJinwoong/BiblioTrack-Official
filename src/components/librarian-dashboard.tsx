
'use client';

import { useState, useEffect } from 'react';
import { books as initialBooks, checkouts as initialCheckouts, users as initialUsers, checkoutRequests as initialCheckoutRequests, categories as initialCategories } from '@/lib/data';
import type { Book as BookType, Checkout, User as UserType, Category } from '@/lib/types';
import { Book, ListChecks, Search, User, Calendar, MoreHorizontal, Bell, BookCopy, PlusCircle, Users, UserX, AlertTriangle, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCard } from './book-card';
import { BookDetailsDialog } from './book-details-dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { UserDetailsTooltip } from './user-details-tooltip';
import { useToast } from '@/hooks/use-toast';
import { AddBookDialog } from './add-book-dialog';
import { DashboardHeader } from './dashboard-header';
import { SettingsDialog } from './settings-dialog';
import { isPast, parseISO, differenceInDays } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function LibrarianDashboard() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutRequests, setCheckoutRequests] = useState<Checkout[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [activeLoansSubTab, setActiveLoansSubTab] = useState('active');

  const [searchTerm, setSearchTerm] = useState('');
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
    // This effect runs once on component mount to safely initialize state from localStorage.
    const loadState = (key: string, setter: Function, initialState: any) => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
                const parsedValue = JSON.parse(storedValue);
                 if (Array.isArray(parsedValue) && parsedValue.length > 0) {
                    setter(parsedValue);
                    return; // Data loaded from storage, exit
                }
            }
            // If no data in storage or it's an empty array, initialize and save
            setter(initialState);
            localStorage.setItem(key, JSON.stringify(initialState));
        } catch (error) {
            console.error(`Failed to load state for ${key}:`, error);
            setter(initialState);
        }
    };

    loadState('books', setBooks, initialBooks);
    loadState('categories', setCategories, initialCategories);
    loadState('checkouts', setCheckouts, initialCheckouts);
    loadState('checkoutRequests', setCheckoutRequests, initialCheckoutRequests);
    loadState('users', setUsers, initialUsers);
    
    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);
  }, []);


  useEffect(() => { if (books.length > 0) localStorage.setItem('books', JSON.stringify(books)); }, [books]);
  useEffect(() => { if (categories.length > 0) localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { if (checkouts.length > 0) localStorage.setItem('checkouts', JSON.stringify(checkouts)); }, [checkouts]);
  useEffect(() => { if (checkoutRequests.length > 0) localStorage.setItem('checkoutRequests', JSON.stringify(checkoutRequests)); }, [checkoutRequests]);
  useEffect(() => { if (users.length > 0) localStorage.setItem('users', JSON.stringify(users)); }, [users]);


  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'books' && e.newValue) setBooks(JSON.parse(e.newValue));
      if (e.key === 'categories' && e.newValue) setCategories(JSON.parse(e.newValue));
      if (e.key === 'checkouts' && e.newValue) setCheckouts(JSON.parse(e.newValue));
      if (e.key === 'checkoutRequests' && e.newValue) setCheckoutRequests(JSON.parse(e.newValue));
      if (e.key === 'users' && e.newValue) setUsers(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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


  const getBook = (bookId: number): BookType | undefined => {
    return books.find(b => b.id === bookId);
  };
  
  const handleOpenDialog = (book: BookType, checkout: Checkout | null = null) => {
    setSelectedBook(book);
    setSelectedCheckout(checkout);
  };

  const handleCloseDialog = () => {
    setSelectedBook(null);
    setSelectedCheckout(null);
  };

  const handleApproveRequest = (requestToApprove: Checkout) => {
    const bookToCheckout = getBook(requestToApprove.bookId);
    if (!bookToCheckout || bookToCheckout.stock === 0) {
      toast({ variant: 'destructive', title: 'Error de aprobación', description: `El libro "${bookToCheckout?.title}" no está disponible.` });
      setCheckoutRequests(prev => prev.filter(r => r.bookId !== requestToApprove.bookId || r.userId !== requestToApprove.userId));
      return;
    }

    const updatedBooks = books.map(b => b.id === requestToApprove.bookId ? { ...b, stock: b.stock - 1 } : b);
    setBooks(updatedBooks);
    const approvedCheckout: Checkout = { ...requestToApprove, status: 'approved' };
    setCheckouts(prev => [...prev, approvedCheckout]);
    setCheckoutRequests(prev => prev.filter(r => r.bookId !== requestToApprove.bookId || r.userId !== requestToApprove.userId));
    
    handleCloseDialog();
    toast({ title: '✅ Préstamo Aprobado', description: `El préstamo de "${bookToCheckout.title}" a ${requestToApprove.userId} ha sido confirmado.` });
  };

  const handleSuccessfulCheckout = (bookId: number, checkoutData: {userId: string; dueDate: string}) => {
    const bookToCheckout = getBook(bookId);
     if (!bookToCheckout || bookToCheckout.stock === 0) {
      toast({ variant: 'destructive', title: 'Error de aprobación', description: `El libro "${bookToCheckout?.title}" no está disponible.` });
      return;
    }
    const updatedBooks = books.map(b => b.id === bookId ? { ...b, stock: b.stock - 1 } : b);
    setBooks(updatedBooks);
    const newCheckout: Checkout = { ...checkoutData, bookId: bookId, status: 'approved' };
    setCheckouts(prev => [...prev, newCheckout]);
  };
  
  const handleAddNewBook = (newBookData: Omit<BookType, 'id'>) => {
    const newBook: BookType = { ...newBookData, id: Math.max(...books.map(b => b.id), 0) + 1 };
    setBooks(prev => [...prev, newBook]);
    toast({ title: '📖 ¡Libro Añadido!', description: `"${newBook.title}" ha sido añadido al catálogo.` });
  };

  const handleUpdateBook = (updatedBook: BookType) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
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

  const handleDeleteBook = (bookId: number) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    // Also remove any checkouts or requests associated with this book
    setCheckouts(prev => prev.filter(c => c.bookId !== bookId));
    setCheckoutRequests(prev => prev.filter(r => r.bookId !== bookId));
    toast({ title: '🗑️ Libro Eliminado', description: 'El libro ha sido eliminado del catálogo.' });
  };

  const handleReturnBook = (checkoutToReturn: Checkout) => {
    // 1. Increment book stock
    const updatedBooks = books.map(b => 
      b.id === checkoutToReturn.bookId ? { ...b, stock: b.stock + 1 } : b
    );
    setBooks(updatedBooks);

    // 2. Remove from checkouts
    const updatedCheckouts = checkouts.filter(c => 
      !(c.bookId === checkoutToReturn.bookId && c.userId === checkoutToReturn.userId)
    );
    setCheckouts(updatedCheckouts);

    // 3. Reactivate user if they have no other overdue books
    const otherCheckouts = updatedCheckouts.filter(c => c.userId === checkoutToReturn.userId);
    const hasOtherOverdueBooks = otherCheckouts.some(c => isPast(parseISO(c.dueDate)));
    
    const userToUpdate = users.find(u => u.username === `${checkoutToReturn.userId}@alumnos.uat.edu.mx` || u.username === checkoutToReturn.userId);

    if (userToUpdate && userToUpdate.status === 'deactivated' && !hasOtherOverdueBooks) {
        handleUserStatusChange(checkoutToReturn.userId, true);
        localStorage.setItem('justReactivated', 'true');
    }
    
    toast({ title: '✅ Libro Devuelto', description: `El libro ha sido marcado como devuelto.` });
  };

  const handleUserStatusChange = (userId: string, reactivate: boolean) => {
    const fullUsername = userId.includes('@') ? userId : `${userId}@alumnos.uat.edu.mx`;
    const updatedUsers = users.map(u => 
      u.username === fullUsername ? { ...u, status: reactivate ? 'active' : 'deactivated' } : u
    );
    setUsers(updatedUsers);
    
    toast({
        title: reactivate ? '👤 Cuenta Reactivada' : '🚫 Cuenta Desactivada',
        description: `La cuenta de ${userId} ha sido ${reactivate ? 'reactivada' : 'desactivada'}.`,
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

  const activeUsers = users.filter(u => u.status === 'active');
  const deactivatedUsers = users.filter(u => u.status === 'deactivated');
  const deactivatedUsernames = deactivatedUsers.map(u => u.username.split('@')[0]);

  // Loans for deactivated users
  const deactivatedCheckouts = activeCheckouts.filter(c => deactivatedUsernames.includes(c.userId));
  
  // Group checkouts by user for the deactivated view
  const deactivatedCheckoutsByUser = deactivatedUsers.map(user => {
    const userIdentifier = user.username.split('@')[0];
    const checkoutsForUser = activeCheckouts.filter(c => c.userId === userIdentifier);
    return {
      user,
      checkouts: checkoutsForUser.map(c => ({...c, book: getBook(c.bookId)}))
                                .filter(c => c.book)
                                .sort((a,b) => differenceInDays(new Date(), parseISO(b.dueDate)) - differenceInDays(new Date(), parseISO(a.dueDate)))
    };
  }).filter(group => group.checkouts.length > 0);


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
          setCategories={setCategories}
          onEditBook={handleOpenEditBookDialog}
          onDeleteBook={handleDeleteBook}
          users={users}
          onUserStatusChange={handleUserStatusChange}
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
                        <p className="text-xs text-muted-foreground">de {users.filter(u=> u.role === 'client').length} usuarios totales</p>
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
                        <div className="text-2xl font-bold">{overdueCheckouts.length}</div>
                        <p className="text-xs text-muted-foreground">Requieren acción inmediata</p>
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
                  {overdueCheckouts.length > 0 && (
                      <Badge variant="destructive" className="ml-2 animate-pulse">{overdueCheckouts.length}</Badge>
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
                      <div className="flex flex-wrap gap-2 pt-4">
                        <Button
                          variant={!selectedCategory ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => setSelectedCategory(null)}
                        >
                          Todos
                        </Button>
                        {categories.map((category) => (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.name ? 'default' : 'secondary'}
                            size="sm"
                            onClick={() => setSelectedCategory(category.name)}
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                  </CardHeader>
                  <CardContent>
                    {books.length === 0 ? (
                       <div className="text-center py-16">
                        <BookCopy className="mx-auto h-12 w-12 text-muted-foreground"/>
                        <h3 className="mt-4 text-lg font-medium">No Books in Catalog</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Get started by adding a book to the library.</p>
                        <Button className="mt-4" onClick={handleOpenAddBookDialog}><PlusCircle className="mr-2 h-4 w-4" /> Add First Book</Button>
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
                                    
                                    return (
                                        <BookCard key={`${request.userId}-${request.bookId}`} book={book} onClick={() => handleOpenDialog(book, request)}>
                                            <div className="p-3 border-t mt-auto text-center">
                                                <p className="text-xs font-semibold text-primary mb-2">Solicitado por:</p>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <Avatar className="h-6 w-6 shrink-0">
                                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                                    </Avatar>
                                                    <p className="text-sm font-medium truncate">{request.userId}</p>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Todos los Libros Prestados</CardTitle>
                    <div className="flex items-center border-b border-gray-200">
                        <button onClick={() => setActiveLoansSubTab('active')} className={`py-2 px-4 text-sm font-medium ${activeLoansSubTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Activos</button>
                        <button onClick={() => setActiveLoansSubTab('at-risk')} className={`py-2 px-4 text-sm font-medium ${activeLoansSubTab === 'at-risk' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>En Riesgo</button>
                        <button onClick={() => setActiveLoansSubTab('overdue')} className={`py-2 px-4 text-sm font-medium ${activeLoansSubTab === 'overdue' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Vencidos</button>
                        <button onClick={() => setActiveLoansSubTab('deactivated')} className={`py-2 px-4 text-sm font-medium ${activeLoansSubTab === 'deactivated' ? 'border-b-2 border-destructive text-destructive' : 'text-muted-foreground'}`}>Cuentas Desactivadas</button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeLoansSubTab === 'deactivated' ? (
                       <div className="space-y-4">
                        {deactivatedCheckoutsByUser.length > 0 ? deactivatedCheckoutsByUser.map(({ user, checkouts }) => (
                            <Card key={user.username} className="bg-destructive/5 border-destructive/30">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base">{user.name}</CardTitle>
                                            <CardDescription>{user.email}</CardDescription>
                                        </div>
                                    </div>
                                    <Button onClick={() => setIsSettingsDialogOpen(true)}>Gestionar Cuenta</Button>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-semibold mb-2">Libros Vencidos:</p>
                                    <Accordion type="single" collapsible className="w-full">
                                      {checkouts.map((checkout, index) => (
                                        <AccordionItem value={`item-${index}`} key={checkout.bookId}>
                                          <AccordionTrigger className="text-sm hover:no-underline">
                                            <div className="flex items-center gap-4">
                                              <BookCopy className="h-4 w-4 text-muted-foreground" />
                                              <span>{checkout.book?.title}</span>
                                              <Badge variant="destructive">Vencido hace {differenceInDays(new Date(), parseISO(checkout.dueDate))} días</Badge>
                                            </div>
                                          </AccordionTrigger>
                                          <AccordionContent className="pl-8 text-xs text-muted-foreground">
                                              <p>Fecha de entrega: {checkout.dueDate}</p>
                                          </AccordionContent>
                                        </AccordionItem>
                                      ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        )) : <p className="text-muted-foreground text-center py-8">No hay cuentas desactivadas con préstamos vencidos.</p>}
                       </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {(activeLoansSubTab === 'active' ? activeCheckouts.filter(c => !isPast(parseISO(c.dueDate))) :
                          activeLoansSubTab === 'at-risk' ? atRiskCheckouts :
                          overdueCheckouts).map((checkout) => {
                            const book = getBook(checkout.bookId);
                            if (!book) return null;
                            const isOverdue = isPast(parseISO(checkout.dueDate));
                            
                            return (
                                <BookCard 
                                  key={`${checkout.userId}-${checkout.bookId}`} 
                                  book={book} 
                                  onClick={() => handleOpenDialog(book, checkout)}
                                  isLoan={true}
                                  isOverdue={isOverdue}
                                >
                                    <div className="p-3 border-t mt-auto">
                                        <div className='flex items-center justify-between gap-2 mb-2'>
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            <Avatar className="h-6 w-6 shrink-0">
                                              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                            </Avatar>
                                            <p className="text-xs font-medium truncate">{checkout.userId}</p>
                                          </div>
                                          
                                          <UserDetailsTooltip userId={checkout.userId}>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                          </UserDetailsTooltip>

                                        </div>
                                        <div className='flex items-center justify-between gap-2'>
                                          <div className='flex items-center gap-2'>
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Vence: {checkout.dueDate}</p>
                                          </div>
                                        </div>
                                    </div>
                                </BookCard>
                            )
                        })}
                      </div>
                    )}

                    {activeLoansSubTab !== 'deactivated' && activeCheckouts.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">No hay libros en esta categoría.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
    </>
  );
}
