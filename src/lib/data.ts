import type { Book, Checkout, User } from './types';

export const users: User[] = [
    { email: 'librarian@example.com', password: 'password', role: 'librarian'},
    { email: 'client@example.com', password: 'password', role: 'client'},
    { email: 'another@example.com', password: 'password', role: 'client'},
];

export const books: Book[] = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A novel about the American dream.',
    coverUrl: 'https://picsum.photos/300/450?random=1',
    genre: 'Classic',
    available: true,
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A novel about justice and racism in the American South.',
    coverUrl: 'https://picsum.photos/300/450?random=2',
    genre: 'Classic',
    available: false,
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian novel about totalitarianism.',
    coverUrl: 'https://picsum.photos/300/450?random=3',
    genre: 'Dystopian',
    available: true,
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A romantic novel of manners.',
    coverUrl: 'https://picsum.photos/300/450?random=4',
    genre: 'Romance',
    available: true,
  },
  {
    id: 5,
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'A fantasy novel about the adventures of Bilbo Baggins.',
    coverUrl: 'https://picsum.photos/300/450?random=5',
    genre: 'Fantasy',
    available: false,
  },
  {
    id: 6,
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A science fiction novel set in a distant future amidst a feudal interstellar society.',
    coverUrl: 'https://picsum.photos/300/450?random=6',
    genre: 'Sci-Fi',
    available: true,
  },
  {
    id: 7,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'A story about adolescent alienation and loss of innocence.',
    coverUrl: 'https://picsum.photos/300/450?random=7',
    genre: 'Classic',
    available: true,
  },
  {
    id: 8,
    title: 'Brave New World',
    author: 'Aldous Huxley',
    description: 'A dystopian novel which anticipates developments in reproductive technology, sleep-learning, and psychological manipulation.',
    coverUrl: 'https://picsum.photos/300/450?random=8',
    genre: 'Dystopian',
    available: false,
  },
];

export const checkouts: Checkout[] = [
  { userId: 'client@example.com', bookId: 2, dueDate: '2024-08-15' },
  { userId: 'client@example.com', bookId: 5, dueDate: '2024-08-22' },
  { userId: 'another@example.com', bookId: 8, dueDate: '2024-08-10' },
];

export const readingHistory: { [key: string]: number[] } = {
    'client@example.com': [4, 6],
    'another@example.com': [1],
};
