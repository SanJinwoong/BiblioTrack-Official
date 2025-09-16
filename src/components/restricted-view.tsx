
'use client';

import type { User, Book, Checkout } from '@/lib/types';
import { BookCard } from './book-card';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ClientHeader } from './client-header';
import { isPast, parseISO } from 'date-fns';

interface RestrictedViewProps {
  user: User;
  checkouts: (Book & Checkout)[];
}

export function RestrictedView({ user, checkouts }: RestrictedViewProps) {
  const overdueCheckouts = checkouts.filter(c => isPast(parseISO(c.dueDate)));

  return (
    <div className="bg-background min-h-screen">
      <ClientHeader username={user.username.split('@')[0]} searchTerm="" setSearchTerm={() => {}} />

      <main className="container mx-auto p-4 md:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive text-2xl">
                <AlertCircle className="mr-3 h-8 w-8" />
                Cuenta Restringida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-destructive/90">
                Hola {user.name || user.username}, tu cuenta ha sido suspendida temporalmente debido a que tienes préstamos vencidos.
              </p>
              <p className="text-muted-foreground">
                Para poder seguir disfrutando de nuestra biblioteca, por favor, devuelve los siguientes libros lo antes posible. Una vez devueltos, tu cuenta será reactivada automáticamente.
              </p>

              <div>
                <h3 className="text-xl font-semibold mb-4">Libros Pendientes de Devolución</h3>
                {overdueCheckouts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {overdueCheckouts.map((book) => (
                      <BookCard 
                        key={`overdue-${book.id}`} 
                        book={book as Book} 
                        isLoan={true} 
                        isOverdue={true} 
                        className="cursor-default"
                      />
                    ))}
                  </div>
                ) : (
                    <p className="text-muted-foreground">No tienes libros vencidos. Contacta al bibliotecario.</p>
                )}
              </div>
               <div className="text-center text-sm text-muted-foreground pt-4">
                <p>Horario de atención: Lunes a Viernes de 8:00 AM a 8:00 PM.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
