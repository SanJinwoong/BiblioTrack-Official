export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  genre: string;
  available: boolean;
}

export interface Checkout {
  userId: string;
  bookId: number;
  dueDate: string;
}

export interface User {
    username: string;
    password: string; // In a real app, this should be a hashed password
    role: 'client' | 'librarian';
}
