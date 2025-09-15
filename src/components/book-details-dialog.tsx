
import Image from 'next/image';
import { differenceInDays, parseISO, isPast } from 'date-fns';
import type { Book, Checkout } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { User, Calendar, AlertCircle, MoreHorizontal, Bell, Check } from 'lucide-react';
import { CheckoutForm } from './checkout-form';
import { useState } from 'react';
import { UserDetailsTooltip } from './user-details-tooltip';

interface BookDetailsDialogProps {
  book: Book | null;
  checkout?: Checkout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessfulCheckout: (bookId: number, checkoutData: {userId: string; dueDate: string}) => void;
  onApproveRequest?: (checkout: Checkout) => void;
  username: string;
  role: 'client' | 'librarian';
}

export function BookDetailsDialog({ book, checkout, open, onOpenChange, onSuccessfulCheckout, onApproveRequest, username, role }: BookDetailsDialogProps) {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  if (!book) {
    return null;
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowCheckoutForm(false); // Reset form view on close
    }
    onOpenChange(isOpen);
  };

  const handleSuccessfulCheckout = (checkoutData: {userId: string; dueDate: string}) => {
    if(!book) return;
    onSuccessfulCheckout(book.id, checkoutData);
    setShowCheckoutForm(false);
    onOpenChange(false); 
  }

  const handleApprove = () => {
    if (checkout && onApproveRequest) {
      onApproveRequest(checkout);
    }
  }

  const getStockStatus = () => {
    if (book.stock === 0) {
      return { text: 'Agotado', color: 'bg-gray-100 text-gray-600' };
    }
    if (book.stock <= 3) {
      return { text: 'Disponible', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Disponible', color: 'bg-green-500 text-green-50' };
  };

  const getDueDateStatus = () => {
    if (!checkout || checkout.status !== 'approved') return null;
    
    const dueDate = parseISO(checkout.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const daysDiff = differenceInDays(dueDate, today);

    if (isPast(dueDate) && daysDiff < 0) {
      return { text: `Vencido por ${Math.abs(daysDiff)} día(s)`, color: 'text-red-600 font-bold' };
    }
    if (daysDiff <= 3) {
        return { text: `Vence en ${daysDiff + 1} día(s)`, color: 'text-yellow-600 font-bold' };
    }
    return { text: `Vence el ${checkout.dueDate}`, color: 'text-muted-foreground' };
  };

  const stockStatus = getStockStatus();
  const dueDateStatus = getDueDateStatus();
  const isRequestByThisUser = checkout?.status === 'pending' && checkout?.userId === username;
  const isPendingRequestForLibrarian = checkout?.status === 'pending';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px] grid grid-cols-1 md:grid-cols-[200px_1fr] p-0 max-h-[90vh] h-full">
        <div className="hidden md:flex items-start justify-center p-6 pr-0">
          <div className="relative aspect-[3/4.5] w-full rounded-md overflow-hidden">
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 30vw, 200px"
            />
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="font-headline text-2xl mb-1">{book.title}</DialogTitle>
              <DialogDescription className="text-base">{book.author}</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6">
            {showCheckoutForm ? (
              <CheckoutForm
                book={book}
                username={username}
                role={role}
                onSuccess={handleSuccessfulCheckout}
                onCancel={() => setShowCheckoutForm(false)}
              />
            ) : (
              <>
                {isPendingRequestForLibrarian && role === 'librarian' && (
                    <div className="mb-4 flex items-center p-3 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                        <Bell className="h-5 w-5 mr-3 shrink-0" />
                        <div>
                            <h4 className="font-bold">Solicitud Pendiente</h4>
                            <p className="text-sm">El usuario <strong>{checkout.userId}</strong> ha solicitado este libro. Fecha de entrega propuesta: {checkout.dueDate}.</p>
                        </div>
                   </div>
                )}
                
                {isRequestByThisUser && role === 'client' && (
                     <div className="mb-4 flex items-center p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                        <Bell className="h-5 w-5 mr-3 shrink-0 animate-pulse" />
                        <div>
                            <h4 className="font-bold">Solicitud Pendiente</h4>
                            <p className="text-sm">Tu solicitud está pendiente de aprobación por el bibliotecario. Se te notificará cuando sea aprobada.</p>
                        </div>
                   </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>{book.description}</p>
                </div>
                <div className="flex items-center space-x-2 my-4">
                  <span className="font-semibold text-sm">Disponibilidad:</span>
                  <Badge className={cn("text-xs font-bold", stockStatus.color)}>
                    {stockStatus.text}
                  </Badge>
                  {role === 'librarian' && (
                    <span className='text-sm font-bold'>({book.stock})</span>
                  )}
                </div>

                {checkout && checkout.status === 'approved' && (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-semibold mr-2">Prestado a:</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="truncate">{checkout.userId}</span>
                        <UserDetailsTooltip userId={checkout.userId}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </UserDetailsTooltip>
                      </div>
                    </div>
                    {dueDateStatus && (
                        <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">Fecha de entrega:</span>
                            <span className={cn("ml-2", dueDateStatus.color)}>{dueDateStatus.text}</span>
                        </div>
                    )}
                  </div>
                )}
                {book.stock === 0 && !checkout && (
                  <div className="mt-4 flex items-center p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                    <AlertCircle className="h-5 w-5 mr-3" />
                    <span className="text-sm">Este libro no está disponible actualmente.</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {!showCheckoutForm && (
            <DialogFooter className="p-6 border-t bg-background">
                {role === 'librarian' && isPendingRequestForLibrarian && (
                     <Button type="button" disabled={book.stock === 0} onClick={handleApprove}>
                        <Check className="mr-2 h-4 w-4" />
                        Aprobar Préstamo
                    </Button>
                )}
                {role === 'librarian' && !isPendingRequestForLibrarian && (
                    <Button type="button" disabled={book.stock === 0} onClick={() => setShowCheckoutForm(true)}>
                        Realizar Préstamo Directo
                    </Button>
                )}
                {role === 'client' && !isRequestByThisUser && (
                    <Button type="button" disabled={book.stock === 0} onClick={() => setShowCheckoutForm(true)}>
                        Solicitar Préstamo
                    </Button>
                )}
                <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                    Cerrar
                </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
