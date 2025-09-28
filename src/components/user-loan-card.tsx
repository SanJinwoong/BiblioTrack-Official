
'use client';

import type { Book, Checkout, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, User as UserIcon, Phone, Mail, Home, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { getBookCoverUrl } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserLoanCardProps {
  user: User;
  loans: (Checkout & { book: Book })[];
  onReactivateAccount: () => void;
}

export function UserLoanCard({ user, loans, onReactivateAccount }: UserLoanCardProps) {
  const sortedLoans = [...loans].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  const mostOverdueLoan = sortedLoans[0];
  const overdueDistance = mostOverdueLoan 
    ? formatDistanceToNowStrict(parseISO(mostOverdueLoan.dueDate), { addSuffix: true, locale: es })
    : '';

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={user.id} className="border-b-0">
        <Card className='bg-muted/50 overflow-hidden'>
          <CardContent className="p-4">
            <AccordionTrigger className="hover:no-underline p-0 w-full">
               <div className="flex justify-between items-center gap-4 w-full">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      {user.avatarUrl && <Image src={user.avatarUrl} alt={user.name || ''} width={48} height={48}/>}
                      <AvatarFallback>
                        <UserIcon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-normal text-left">{user.name}</h4>
                      <p className="text-sm text-muted-foreground text-left">{user.username}</p>
                      {overdueDistance && <p className="text-xs text-destructive text-left mt-1">Vencido {overdueDistance}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <Badge variant="destructive" className="hidden sm:inline-flex">Cuenta Desactivada</Badge>
                     <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 space-y-6">
                <div>
                     <h5 className="text-sm font-semibold mb-2">Información del Usuario</h5>
                     <div className="text-sm text-muted-foreground space-y-1.5">
                        <p className="flex items-center"><Mail className="mr-2 h-4 w-4 shrink-0"/>{user.email}</p>
                        <p className="flex items-center"><Phone className="mr-2 h-4 w-4 shrink-0"/>{user.phone}</p>
                        <p className="flex items-center"><Home className="mr-2 h-4 w-4 shrink-0"/>{user.address}</p>
                     </div>
                </div>
                <div>
                    <h5 className="text-sm font-semibold mb-2">Libros Prestados Vencidos ({sortedLoans.length})</h5>
                    <div className="space-y-3">
                        {sortedLoans.map(loan => (
                            <div key={loan.id} className="flex items-center gap-3">
                                <Image src={getBookCoverUrl(loan.book)} alt={loan.book.title} width={40} height={60} className="rounded-sm object-cover"/>
                                <div>
                                    <p className="text-sm font-medium">{loan.book.title}</p>
                                    <p className="text-xs text-destructive">Venció el: {loan.dueDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <Button onClick={onReactivateAccount} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Reactivar Cuenta
                    </Button>
                </div>
            </AccordionContent>
          </CardContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
}
