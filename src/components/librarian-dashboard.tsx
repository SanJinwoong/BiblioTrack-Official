
'use client';

import { useState, useEffect } from 'react';
import { books as initialBooks, checkouts as initialCheckouts, users } from '@/lib/data';
import type { Book as BookType, Checkout, User as UserType } from '@/lib/types';
import { Book, ListChecks, Search, User, Calendar, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/book-card';
import { BookDetailsDialog } from './book-details-dialog';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from './ui/dropdown-menu';
import { UserDetailsTooltip } from './user-details-tooltip';

export function LibrarianDashboard() {
  const [books, setBooks] = useState<BookType[]>(initialBooks);
  const [checkouts, setCheckouts] = useState<Checkout[]>(initialCheckouts);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>(books);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [selectedCheckout, setSelectedCheckout] = useState<Checkout | null>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);
  }, []);

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

  const handleSuccessfulCheckout = (bookId: number, checkoutData: {userId: string; dueDate: string}) => {
    // 1. Decrement stock
    const updatedBooks = books.map(b => 
      b.id === bookId ? { ...b, stock: b.stock - 1 } : b
    );
    setBooks(updatedBooks);

    // 2. Add to checkouts
    const newCheckout: Checkout = {
      userId: checkoutData.userId,
      bookId: bookId,
      dueDate: checkoutData.dueDate,
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
        username={username}
        role="librarian"
      />
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Librarian Dashboard</h1>
        <Tabs defaultValue="catalog">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="catalog"><Book className="mr-2 h-4 w-4" />Catalog Management</TabsTrigger>
            <TabsTrigger value="checkouts"><ListChecks className="mr-2 h-4 w-4" />User Checkouts</TabsTrigger>
          </TabsList>
          <TabsContent value="catalog" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Library Catalog</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, author, or genre..."
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
                    <p className="text-muted-foreground text-center py-8">No books found for &quot;{searchTerm}&quot;.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="checkouts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">All Checked Out Books</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {checkouts.map((checkout) => {
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
                                      
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuSub>
                                              <DropdownMenuSubTrigger>
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Ver detalles del usuario</span>
                                              </DropdownMenuSubTrigger>
                                              <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <UserDetailsTooltip userId={checkout.userId} />
                                                </DropdownMenuSubContent>
                                              </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                        </DropdownMenuContent>
                                      </DropdownMenu>

                                    </div>
                                    <div className='flex items-center gap-2'>
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">Due: {checkout.dueDate}</p>
                                    </div>
                                </div>
                            </BookCard>
                        )
                    })}
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
