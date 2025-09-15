
'use client';

import { useState, useEffect } from 'react';
import { books as initialBooks, checkouts as initialCheckouts, users, checkoutRequests as initialCheckoutRequests, categories as initialCategories } from '@/lib/data';
import type { Book as BookType, Checkout, User as UserType, Category } from '@/lib/types';
import { Book, ListChecks, Search, User, Calendar, MoreHorizontal, Bell, BookCopy, PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/book-card';
import { BookDetailsDialog } from './book-details-dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { UserDetailsTooltip } from './user-details-tooltip';
import { useToast } from '@/hooks/use-toast';
import { AddBookDialog } from './add-book-dialog';
import { DashboardHeader } from './dashboard-header';
import { SettingsDialog } from './settings-dialog';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

export function LibrarianDashboard() {
  const [books, setBooks] = useState<BookType[]>(() => {
    if (typeof window === 'undefined') return initialBooks;
    const storedBooks = localStorage.getItem('books');
    return storedBooks ? JSON.parse(storedBooks) : initialBooks;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window === 'undefined') return initialCategories;
    const storedCategories = localStorage.getItem('categories');
    return storedCategories ? JSON.parse(storedCategories) : initialCategories;
  });
  const [checkouts, setCheckouts] = useState<Checkout[]>(() => {
    if (typeof window === 'undefined') return initialCheckouts;
    const storedCheckouts = localStorage.getItem('checkouts');
    return storedCheckouts ? JSON.parse(storedCheckouts) : initialCheckouts;
  });
  const [checkoutRequests, setCheckoutRequests] = useState<Checkout[]>(() => {
    if (typeof window === 'undefined') return initialCheckoutRequests;
    const storedCheckoutRequests = localStorage.getItem('checkoutRequests');
    return storedCheckoutRequests ? JSON.parse(storedCheckoutRequests) : initialCheckoutRequests;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>(books);
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
  }, []);

  useEffect(() => { localStorage.setItem('books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('checkouts', JSON.stringify(checkouts)); }, [checkouts]);
  useEffect(() => { localStorage.setItem('checkoutRequests', JSON.stringify(checkoutRequests)); }, [checkoutRequests]);

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
    if (window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      setBooks(prev => prev.filter(b => b.id !== bookId));
      // Also remove any checkouts or requests associated with this book
      setCheckouts(prev => prev.filter(c => c.bookId !== bookId));
      setCheckoutRequests(prev => prev.filter(r => r.bookId !== bookId));
      toast({ title: '🗑️ Libro Eliminado', description: 'El libro ha sido eliminado del catálogo.' });
    }
  };

  return (
    <>
      <DashboardHeader onAddNewBook={handleOpenAddBookDialog} onSettingsClick={() => setIsSettingsDialogOpen(true)} />
      <div className="container mx-auto p-4 md:p-8">
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
        />
        <BookDetailsDialog 
            book={selectedBook} 
            checkout={selectedCheckout}
            open={!!selectedBook} 
            onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
            onSuccessfulCheckout={handleSuccessfulCheckout}
            onApproveRequest={handleApproveRequest}
            username={username}
            role="librarian"
          />
          <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Librarian Dashboard</h1>
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
                <TabsTrigger value="checkouts"><ListChecks className="mr-2 h-4 w-4" />Préstamos Activos</TabsTrigger>
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
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {checkouts.filter(c => c.status === 'approved').map((checkout) => {
                            const book = getBook(checkout.bookId);
                            if (!book) return null;
                            
                            return (
                                <BookCard key={`${checkout.userId}-${checkout.bookId}`} book={book} onClick={() => handleOpenDialog(book, checkout)}>
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
                                        <div className='flex items-center gap-2'>
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                          <p className="text-xs text-muted-foreground">Vence: {checkout.dueDate}</p>
                                        </div>
                                    </div>
                                </BookCard>
                            )
                        })}
                    </div>
                    {checkouts.filter(c => c.status === 'approved').length === 0 && (
                        <p className="text-muted-foreground text-center py-8">No hay libros prestados actualmente.</p>
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
