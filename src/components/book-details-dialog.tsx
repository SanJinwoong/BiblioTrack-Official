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
import { User, Calendar } from 'lucide-react';

interface BookDetailsDialogProps {
  book: Book | null;
  checkout?: Checkout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDetailsDialog({ book, checkout, open, onOpenChange }: BookDetailsDialogProps) {
  if (!book) {
    return null;
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
    
    // The date from data.ts is YYYY-MM-DD, which parseISO handles correctly.
    const dueDate = parseISO(checkout.dueDate);
    const today = new Date();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        <div className="relative aspect-[3/4.5] w-full rounded-md overflow-hidden">
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 30vw, 200px"
          />
        </div>
        <div className="flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl mb-1">{book.title}</DialogTitle>
            <DialogDescription className="text-base">{book.author}</DialogDescription>
          </DialogHeader>
          <div className="my-4 text-sm text-muted-foreground flex-grow max-h-48 overflow-y-auto">
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

          <DialogFooter className="mt-4 sm:justify-start">
            <Button type="button" disabled={book.stock === 0 || !!checkout}>
              Pedir Prestado
            </Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
