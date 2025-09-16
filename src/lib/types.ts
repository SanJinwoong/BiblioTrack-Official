
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  category: string;
  stock: number;
}

export interface Checkout {
  id: string;
  userId: string;
  bookId: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'returned';
}

export interface User {
    id: string;
    username: string;
    password?: string; // In a real app, this should be a hashed password
    role: 'client' | 'librarian';
    name?: string;
    curp?: string;
    phone?: string;
    email?: string;
    address?: string;
    status?: 'active' | 'deactivated';
    avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
}

    

    