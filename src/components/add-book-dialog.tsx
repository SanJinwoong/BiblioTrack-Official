
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AddBookForm } from './add-book-form';
import type { Book } from '@/lib/types';

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookAdded: (book: Omit<Book, 'id'>) => void;
}

export function AddBookDialog({ open, onOpenChange, onBookAdded }: AddBookDialogProps) {
  
  const handleSuccess = (data: Omit<Book, 'id'>) => {
    onBookAdded(data);
    onOpenChange(false); // Close dialog on success
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Añadir Nuevo Libro</DialogTitle>
          <DialogDescription>
            Rellena los campos para añadir un nuevo libro al catálogo de la biblioteca.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddBookForm onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
