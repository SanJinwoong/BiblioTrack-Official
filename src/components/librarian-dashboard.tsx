
'use client';

import { useState, useEffect } from 'react';
import { books, checkouts } from '@/lib/data';
import type { Book as BookType, Checkout } from '@/lib/types';
import { Book, ListChecks, Search, User, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/book-card';
import { BookDetailsDialog } from './book-details-dialog';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function LibrarianDashboard() {
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
    const results = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchTerm]);


  const getBook = (bookId: number) => {
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


  return (
    <>
    <BookDetailsDialog 
        book={selectedBook} 
        checkout={selectedCheckout}
        open={!!selectedBook} 
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        onSuccessfulCheckout={() => {}} // No action for librarian
        username={username}
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
                                    <div className='flex items-center gap-2 mb-2'>
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                      </Avatar>
                                      <p className="text-xs font-medium truncate">{checkout.userId}</p>
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
