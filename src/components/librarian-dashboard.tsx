
'use client';

import { useState, useEffect } from 'react';
import { books as initialBooks, checkouts as initialCheckouts, users, checkoutRequests as initialCheckoutRequests } from '@/lib/data';
import type { Book as BookType, Checkout, User as UserType } from '@/lib/types';
import { Book, ListChecks, Search, User, Calendar, MoreHorizontal, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/book-card';
import { BookDetailsDialog } from './book-details-dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { UserDetailsTooltip } from './user-details-tooltip';
import { useToast } from '@/hooks/use-toast';

export function LibrarianDashboard() {
  const [books, setBooks] = useState<BookType[]>(initialBooks);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutRequests, setCheckoutRequests] = useState<Checkout[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>(books);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [selectedCheckout, setSelectedCheckout] = useState<Checkout | null>(null);
  const [username, setUsername] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);

    // Load state from localStorage or use initial data
    const storedBooks = localStorage.getItem('books');
    const storedCheckouts = localStorage.getItem('checkouts');
    const storedCheckoutRequests = localStorage.getItem('checkoutRequests');
    
    setBooks(storedBooks ? JSON.parse(storedBooks) : initialBooks);
    setCheckouts(storedCheckouts ? JSON.parse(storedCheckouts) : initialCheckouts);
    setCheckoutRequests(storedCheckoutRequests ? JSON.parse(storedCheckoutRequests) : initialCheckoutRequests);
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('checkouts', JSON.stringify(checkouts));
  }, [checkouts]);

  useEffect(() => {
    localStorage.setItem('checkoutRequests', JSON.stringify(checkoutRequests));
  }, [checkoutRequests]);


  useEffect(() => {
    setFilteredBooks(
      books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.genre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, books]);


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
    // 1. Find the book and check stock
    const bookToCheckout = getBook(requestToApprove.bookId);
    if (!bookToCheckout || bookToCheckout.stock === 0) {
      toast({
        variant: 'destructive',
        title: 'Error de aprobación',
        description: `El libro "${bookToCheckout?.title}" no está disponible.`,
      });
      // Optional: remove the request if the book is gone
      setCheckoutRequests(prev => prev.filter(r => r.bookId !== requestToApprove.bookId || r.userId !== requestToApprove.userId));
      return;
    }

    // 2. Decrement stock
    const updatedBooks = books.map(b => 
      b.id === requestToApprove.bookId ? { ...b, stock: b.stock - 1 } : b
    );
    setBooks(updatedBooks);

    // 3. Move request from pending to approved checkouts
    const approvedCheckout: Checkout = { ...requestToApprove, status: 'approved' };
    setCheckouts(prev => [...prev, approvedCheckout]);
    setCheckoutRequests(prev => prev.filter(r => r.bookId !== requestToApprove.bookId || r.userId !== requestToApprove.userId));
    
    handleCloseDialog();
    
    toast({
      title: '✅ Préstamo Aprobado',
      description: `El préstamo de "${bookToCheckout.title}" a ${requestToApprove.userId} ha sido confirmado.`,
    });
  };

  const handleSuccessfulCheckout = (bookId: number, checkoutData: {userId: string; dueDate: string}) => {
    const bookToCheckout = getBook(bookId);
     if (!bookToCheckout || bookToCheckout.stock === 0) {
      toast({
        variant: 'destructive',
        title: 'Error de aprobación',
        description: `El libro "${bookToCheckout?.title}" no está disponible.`,
      });
      return;
    }

    // 1. Decrement stock
    const updatedBooks = books.map(b => 
      b.id === bookId ? { ...b, stock: b.stock - 1 } : b
    );
    setBooks(updatedBooks);

    // 2. Add directly to approved checkouts
    const newCheckout: Checkout = {
      ...checkoutData,
      bookId: bookId,
      status: 'approved',
    };
    const updatedCheckouts = [...checkouts, newCheckout];
    setCheckouts(updatedCheckouts);
  };

  return (
    <>
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
        <Tabs defaultValue="catalog">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="catalog"><Book className="mr-2 h-4 w-4" />Catálogo</TabsTrigger>
            <TabsTrigger value="requests">
                <Bell className="mr-2 h-4 w-4" />
                Solicitudes
                {checkoutRequests.length > 0 && (
                    <Badge variant="destructive" className="ml-2 animate-pulse">{checkoutRequests.length}</Badge>
                )}
            </TabsTrigger>
            <TabsTrigger value="checkouts"><ListChecks className="mr-2 h-4 w-4" />Préstamos Activos</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Catálogo de la Biblioteca</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título, autor, o género..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredBooks.map((book) => (
                        <BookCard key={book.id} book={book} onClick={() => handleOpenDialog(book)} />
                    ))}
                </div>
                {filteredBooks.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No se encontraron libros para &quot;{searchTerm}&quot;.</p>
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
    </>
  );
}
