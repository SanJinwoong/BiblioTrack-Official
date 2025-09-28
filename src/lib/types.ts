

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
    name: string;           // OBLIGATORIO en esquema UAT
    curp: string;           // OBLIGATORIO en esquema UAT  
    phone: string;          // OBLIGATORIO en esquema UAT
    email: string;          // OBLIGATORIO en esquema UAT
    address: string;        // OBLIGATORIO en esquema UAT
    status?: 'active' | 'deactivated';
    avatarUrl?: string;
    bannerUrl?: string;
    bio?: string;
  // Insignia seleccionable por categoría
  badgeCategoryId?: string;
  badgeLabel?: string;
    favoriteBooks?: string[];
    following?: string[];
    followers?: string[];
    books_read?: number;
    createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO 8601 format
  user?: Partial<User>; // User data when joined
  book?: Book; // Book data when joined
}

export interface UserActivity {
  id: string;
  userId: string;
  activityType: 'book_checkout' | 'book_return' | 'book_review' | 'user_follow' | 'user_unfollow';
  targetId?: string; // Book ID or User ID
  description: string;
  createdAt: string;
}

export interface UserFavorite {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  book?: Book; // Optional for when populated from join
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface LoanDurationOption {
  value: string;
  label: string;
}

export interface LibraryPolicies {
  maxLoans: number;
  gracePeriod: number;
  loanDurationOptions?: LoanDurationOption[];
}
    

    
