
export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  genre: string;
  stock: number;
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
    name: string;
    curp: string;
    phone: string;
    email: string;
    address: string;
}
