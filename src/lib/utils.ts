import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get book cover URL with fallback for missing/empty images
export function getBookCoverUrl(book: any): string {
  if (!book) return '/images/book-placeholder.svg';
  
  const url = book.coverUrl || book.cover_url;
  return url && url.trim() !== '' ? url : '/images/book-placeholder.svg';
}
