'use client';

import { useState, useEffect } from 'react';
import { books, checkouts } from '@/lib/data';
import type { Book as BookType } from '@/lib/types';
import { Book, ListChecks, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/book-card';
import { BookDetailsDialog } from './book-details-dialog';

export function LibrarianDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>(books);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);

  useEffect(() => {
    const results = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchTerm]);


  const getBookTitle = (bookId: number) => {
    return books.find(b => b.id === bookId)?.title || 'Unknown Book';
  };

  return (
    <>
    <BookDetailsDialog 
        book={selectedBook} 
        open={!!selectedBook} 
        onOpenChange={(isOpen) => !isOpen && setSelectedBook(null)}
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
                        <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkouts.map((checkout) => (
                      <TableRow key={`${checkout.userId}-${checkout.bookId}`}>
                        <TableCell className="font-medium">{getBookTitle(checkout.bookId)}</TableCell>
                        <TableCell>{checkout.userId}</TableCell>
                        <TableCell className="text-right">{checkout.dueDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
