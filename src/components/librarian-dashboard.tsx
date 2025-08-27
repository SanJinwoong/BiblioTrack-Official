'use client';

import { books, checkouts } from '@/lib/data';
import { Book, Users, ListChecks } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LibrarianDashboard() {
  const getBookTitle = (bookId: number) => {
    return books.find(b => b.id === bookId)?.title || 'Unknown Book';
  };

  return (
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
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={book.available ? 'default' : 'secondary'} className={book.available ? 'bg-accent text-accent-foreground' : ''}>
                          {book.available ? 'Available' : 'Checked Out'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
  );
}
