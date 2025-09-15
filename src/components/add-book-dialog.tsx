
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddBookForm } from './add-book-form';
import type { Book, Category } from '@/lib/types';
import { useState } from 'react';
import { Button } from './ui/button';

interface AddBookDialogProps {
  bookToEdit?: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookAdded: (book: Omit<Book, 'id'>) => void;
  onBookUpdated: (book: Book) => void;
  categories: Category[];
}

export function AddBookDialog({ open, onOpenChange, onBookAdded, onBookUpdated, bookToEdit, categories }: AddBookDialogProps) {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  const handleSuccess = (data: Omit<Book, 'id'> | Book) => {
    if ('id' in data) {
      onBookUpdated(data);
    } else {
      onBookAdded(data);
    }
    onOpenChange(false); // Close dialog on success
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && isFormDirty) {
      setIsAlertOpen(true);
    } else {
      onOpenChange(isOpen);
      if (!isOpen) {
        setIsFormDirty(false);
      }
    }
  }

  const handleConfirmClose = () => {
    onOpenChange(false);
    setIsFormDirty(false);
    setIsAlertOpen(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="font-headline text-2xl">{bookToEdit ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            <DialogDescription>
              {bookToEdit ? 'Update the details for this book.' : 'Fill in the fields to add a new book to the library catalog.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
             <AddBookForm 
                bookToEdit={bookToEdit}
                categories={categories}
                onSuccess={handleSuccess} 
                onCancel={() => handleOpenChange(false)}
                onFormDirtyChange={setIsFormDirty}
              />
          </div>
        </DialogContent>
      </Dialog>
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to close?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Closing this window will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
