
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
import { useState } from 'react';

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookAdded: (book: Omit<Book, 'id'>) => void;
}

export function AddBookDialog({ open, onOpenChange, onBookAdded }: AddBookDialogProps) {
  const [isFormDirty, setIsFormDirty] = useState(false);
  
  const handleSuccess = (data: Omit<Book, 'id'>) => {
    onBookAdded(data);
    onOpenChange(false); // Close dialog on success
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && isFormDirty) {
      if (window.confirm("Are you sure you want to close? Unsaved changes will be lost.")) {
         onOpenChange(false);
         setIsFormDirty(false);
      }
    } else {
      onOpenChange(isOpen);
      if (!isOpen) setIsFormDirty(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="font-headline text-2xl">Add New Book</DialogTitle>
          <DialogDescription>
            Fill in the fields to add a new book to the library catalog.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
           <AddBookForm 
              onSuccess={handleSuccess} 
              onCancel={() => handleOpenChange(false)}
              onFormDirtyChange={setIsFormDirty}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
