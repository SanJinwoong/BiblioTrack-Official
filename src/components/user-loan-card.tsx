
'use client';

import { useState } from 'react';
import type { Book, Checkout, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { isPast, parseISO, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface UserLoanCardProps {
  user: User;
  loans: (Checkout & { book: Book })[];
  status: 'active' | 'overdue' | 'deactivated';
  onManageAccount: () => void;
}

const statusConfig = {
    active: {
        label: 'Prestado',
        badgeClass: 'bg-green-100 text-green-800',
    },
    overdue: {
        label: 'Vencido',
        badgeClass: 'bg-yellow-100 text-yellow-800',
    },
    deactivated: {
        label: 'Cuenta Desactivada',
        badgeClass: 'bg-destructive/10 text-destructive',
    }
}

export function UserLoanCard({ user, loans, status, onManageAccount }: UserLoanCardProps) {
  const [showAll, setShowAll] = useState(false);
  const { label, badgeClass } = statusConfig[status];
  const sortedLoans = [...loans].sort((a, b) => (isPast(parseISO(a.dueDate)) ? -1 : 1));
  const firstLoan = sortedLoans[0];
  const remainingLoans = sortedLoans.slice(1);

  return (
    <Card className={cn(status === 'deactivated' && 'bg-destructive/5 border-destructive/20')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>
                <UserIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{user.name}</h4>
                <Badge variant="outline" className={badgeClass}>{label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button onClick={onManageAccount}>Gestionar Cuenta</Button>
        </div>

        <div className="mt-4 pl-16">
            <h5 className="text-sm font-medium mb-2">Libros Prestados:</h5>
            <div className="space-y-2">
                 {firstLoan && (
                    <div className="flex items-center gap-3">
                         <Image src={firstLoan.book.coverUrl} alt={firstLoan.book.title} width={40} height={60} className="rounded-sm object-cover"/>
                         <div>
                            <p className="text-sm font-semibold">{firstLoan.book.title}</p>
                            <p className="text-xs text-muted-foreground">Vence: {firstLoan.dueDate}</p>
                         </div>
                    </div>
                )}

                {remainingLoans.length > 0 && (
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-none">
                            <AccordionTrigger className="text-sm hover:no-underline -ml-2 py-1 justify-start gap-1">
                                <ChevronDown className="h-4 w-4" />
                                Ver {remainingLoans.length} más
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-2">
                                {remainingLoans.map(loan => (
                                    <div key={loan.bookId} className="flex items-center gap-3">
                                        <Image src={loan.book.coverUrl} alt={loan.book.title} width={40} height={60} className="rounded-sm object-cover"/>
                                        <div>
                                            <p className="text-sm font-semibold">{loan.book.title}</p>
                                            <p className="text-xs text-muted-foreground">Vence: {loan.dueDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

    