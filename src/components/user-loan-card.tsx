
'use client';

import type { Book, Checkout, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, User as UserIcon, Book as BookIcon, Phone, Mail, Home, ChevronDown } from 'lucide-react';
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
    <Card className='bg-muted/50 overflow-hidden'>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>
                <UserIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{user.name}</h4>
              <p className="text-sm text-muted-foreground">{user.username}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge variant="destructive">Cuenta Desactivada</Badge>
        </div>

        <div className="mt-2 pl-0 sm:pl-16">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger className="hover:no-underline p-0 justify-start text-sm text-muted-foreground font-normal">
                       <span className='mr-1'>Ver detalles</span>
                       <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                        {/* User Details */}
                        <div>
                             <h5 className="text-sm font-semibold mb-2">Información del Usuario</h5>
                             <div className="text-sm text-muted-foreground space-y-1.5">
                                <p className="flex items-center"><Mail className="mr-2 h-4 w-4 shrink-0"/>{user.email}</p>
                                <p className="flex items-center"><Phone className="mr-2 h-4 w-4 shrink-0"/>{user.phone}</p>
                                <p className="flex items-center"><Home className="mr-2 h-4 w-4 shrink-0"/>{user.address}</p>
                             </div>
                        </div>
                        {/* Loaned Books */}
                        <div>
                            <h5 className="text-sm font-semibold mb-2">Libros Prestados ({sortedLoans.length})</h5>
                            <div className="space-y-3">
                                {sortedLoans.map(loan => (
                                    <div key={loan.id} className="flex items-center gap-3">
                                        <Image src={loan.book.coverUrl} alt={loan.book.title} width={40} height={60} className="rounded-sm object-cover"/>
                                        <div>
                                            <p className="text-sm font-semibold">{loan.book.title}</p>
                                            <p className="text-xs text-destructive font-semibold">Venció el: {loan.dueDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         {/* Reactivate Button */}
                        <div className="flex justify-end pt-2">
                            <Button onClick={onReactivateAccount} size="sm">
                                <UserCheck className="mr-2 h-4 w-4" />
                                Reactivar Cuenta
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
