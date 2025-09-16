
'use client';

import type { Book, Checkout, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, User as UserIcon, Book as BookIcon, Phone, Mail, Home } from 'lucide-react';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface UserLoanCardProps {
  user: User;
  loans: (Checkout & { book: Book })[];
  onReactivateAccount: () => void;
}

export function UserLoanCard({ user, loans, onReactivateAccount }: UserLoanCardProps) {
  const sortedLoans = [...loans].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <Card className='bg-muted/50'>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>
                <UserIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{user.name}</h4>
                <Badge variant="destructive">Cuenta Desactivada</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.username}</p>
            </div>
          </div>
          <Button onClick={onReactivateAccount} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            <UserCheck className="mr-2 h-4 w-4" />
            Reactivar Cuenta
          </Button>
        </div>

        <div className="mt-4 pl-0 sm:pl-16">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="hover:no-underline p-2 bg-background rounded-md">
                       Ver Detalles y Libros Pendientes
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                        <div>
                             <h5 className="text-sm font-medium mb-2">Información del Usuario</h5>
                             <div className="text-sm text-muted-foreground space-y-1">
                                <p className="flex items-center"><Mail className="mr-2 h-4 w-4"/>{user.email}</p>
                                <p className="flex items-center"><Phone className="mr-2 h-4 w-4"/>{user.phone}</p>
                                <p className="flex items-center"><Home className="mr-2 h-4 w-4"/>{user.address}</p>
                             </div>
                        </div>
                        <div>
                            <h5 className="text-sm font-medium mb-2">Libros Prestados ({sortedLoans.length})</h5>
                            <div className="space-y-3">
                                {sortedLoans.map(loan => (
                                    <div key={loan.bookId} className="flex items-center gap-3">
                                        <Image src={loan.book.coverUrl} alt={loan.book.title} width={40} height={60} className="rounded-sm object-cover"/>
                                        <div>
                                            <p className="text-sm font-semibold">{loan.book.title}</p>
                                            <p className="text-xs text-destructive font-semibold">Venció el: {loan.dueDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}

    