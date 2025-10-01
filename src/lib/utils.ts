import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get book cover URL with fallback for missing/empty images
export function getBookCoverUrl(book: any): string {
  if (!book) return '/images/book-placeholder.svg';
  
  const url = book.coverUrl || book.cover_url;
  
  // Check if URL exists and is not empty
  if (url && url.trim() !== '') {
    // Check if it's a placeholder URL
    if (url.includes('placehold.co')) {
      return '/images/book-placeholder.svg';
    }
    
    // Accept data URLs (base64 images), http/https URLs, and relative paths
    if (url.startsWith('data:image/') || 
        url.startsWith('http://') || 
        url.startsWith('https://') ||
        url.startsWith('/') ||
        url.startsWith('./') ||
        url.startsWith('../')) {
      return url;
    }
    
    // If it's any other format, try to use it anyway (might be a valid image URL)
    return url;
  }
  
  // Return placeholder image
  return '/images/book-placeholder.svg';
}

// Alternative function for banner images with specific dimensions
export function getBookBannerUrl(book: any): string {
  const originalUrl = getBookCoverUrl(book);
  
  // If it's a placeholder, return it as is
  if (originalUrl === '/images/book-placeholder.svg') {
    return originalUrl;
  }
  
  // If it's an Unsplash image, modify it for banner dimensions
  if (originalUrl.includes('unsplash.com')) {
    return originalUrl.replace('?w=400', '?w=1200&h=400&fit=crop&crop=smart');
  }
  
  return originalUrl;
}
