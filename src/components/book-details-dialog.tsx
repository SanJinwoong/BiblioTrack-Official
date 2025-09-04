
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
import { User, Calendar, AlertCircle } from 'lucide-react';
import { CheckoutForm } from './checkout-form';
import { useState } from 'react';

interface BookDetailsDialogProps {
  book: Book | null;
  checkout?: Checkout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessfulCheckout: (bookId: number, checkoutData: {userId: string; dueDate: string}) => void;
  username: string;
  role: 'client' | 'librarian';
}

export function BookDetailsDialog({ book, checkout, open, onOpenChange, onSuccessfulCheckout, username, role }: BookDetailsDialogProps) {
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

  const getStockStatus = () => {
    if (book.stock === 0) {
      return { text: 'Agotado', color: 'bg-gray-500 text-gray-50' };
    }
    if (book.stock <= 3) {
      return { text: `Quedan ${book.stock}`, color: 'bg-yellow-500 text-yellow-900' };
    }
    return { text: 'Disponible', color: 'bg-green-500 text-green-50' };
  };

  const getDueDateStatus = () => {
    if (!checkout) return null;
    
    const dueDate = parseISO(checkout.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0); // Normalize today to the start of the day
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
  const formId = "checkout-form";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px] grid grid-cols-1 md:grid-cols-[200px_1fr] p-0 max-h-[90vh] overflow-hidden">
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
          <div className="p-6 pb-4">
              <DialogHeader>
                  <DialogTitle className="font-headline text-2xl mb-1">{book.title}</DialogTitle>
                  <DialogDescription className="text-base">{book.author}</DialogDescription>
              </DialogHeader>
          </div>
          
          <div className="px-6 pb-6 flex-grow overflow-y-auto">
            {showCheckoutForm ? (
              <CheckoutForm
                book={book}
                username={username}
                role={role}
                formId={formId}
                onSuccess={handleSuccessfulCheckout}
              />
            ) : (
              <>
                <div className="my-4 text-sm text-muted-foreground">
                  <p>{book.description}</p>
                </div>
                <div className="flex items-center space-x-2 my-2">
                  <span className="font-semibold text-sm">Disponibilidad:</span>
                  <Badge className={cn("text-xs font-bold", stockStatus.color)}>
                    {stockStatus.text}
                  </Badge>
                </div>

                {checkout && dueDateStatus && (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Prestado a:</span>
                      <span className="ml-2">{checkout.userId}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Fecha de entrega:</span>
                      <span className={cn("ml-2", dueDateStatus.color)}>{dueDateStatus.text}</span>
                    </div>
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
          
          <DialogFooter className="p-6 pt-4 border-t bg-background">
            {showCheckoutForm ? (
                <>
                    <Button type="button" variant="ghost" onClick={() => setShowCheckoutForm(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId}>
                        Confirmar Préstamo
                    </Button>
                </>
            ) : (
                <>
                    {(!checkout || role === 'librarian') && (
                        <Button type="button" disabled={book.stock === 0} onClick={() => setShowCheckoutForm(true)}>
                        Pedir Prestado
                        </Button>
                    )}
                    <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                        Cerrar
                    </Button>
                </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
