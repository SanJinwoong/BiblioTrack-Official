'use client';

import { useState, useEffect } from 'react';
import { Book, BookOpen, Search, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { books, checkouts } from '@/lib/data';
import type { Book as BookType } from '@/lib/types';
import { BookCard } from './book-card';
import { Recommendations } from './recommendations';
import { Badge } from './ui/badge';

export function ClientDashboard() {
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>(books);

  useEffect(() => {
    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    const results = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchTerm]);

  const userCheckouts = checkouts
    .filter(c => c.userId === username)
    .map(c => {
      const book = books.find(b => b.id === c.bookId);
      return { ...book, dueDate: c.dueDate };
    });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Welcome, {username}!</h1>
      <Tabs defaultValue="my-books" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-books"><BookOpen className="mr-2 h-4 w-4" />My Books</TabsTrigger>
          <TabsTrigger value="browse"><Search className="mr-2 h-4 w-4" />Browse Catalog</TabsTrigger>
          <TabsTrigger value="recommendations"><Sparkles className="mr-2 h-4 w-4" />Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="my-books" className="mt-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userCheckouts.length > 0 ? (
              userCheckouts.map(book =>
                book.id ? (
                    <BookCard key={book.id} book={book as BookType}>
                        <div className="p-4 pt-0">
                            <Badge variant="secondary">Due: {book.dueDate}</Badge>
                        </div>
                    </BookCard>
                ) : null
              )
            ) : (
              <p className="col-span-full text-muted-foreground">You have no books checked out.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="browse" className="mt-4 space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by title or author..."
                    className="pl-10 w-full md:w-1/2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBooks.map(book => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <Recommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
