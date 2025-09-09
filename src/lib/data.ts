
import type { Book, Checkout, User } from './types';

export const users: User[] = [
    { 
        username: 'librarian', 
        password: 'password', 
        role: 'librarian',
        name: 'Library Admin',
        email: 'librarian@library.com',
        curp: 'ADMINCURP12345',
        phone: '123-456-7890',
        address: 'Library Address'
    },
    { 
        username: 'a1234567890@alumnos.uat.edu.mx', 
        password: 'password',
        role: 'client',
        name: 'Juan Perez',
        curp: 'PERJ900101HDFXXX',
        phone: '834-111-2233',
        email: 'a1234567890@alumnos.uat.edu.mx',
        address: 'Calle Falsa 123, Ciudad Victoria',
    },
    { 
        username: 'a0987654321@alumnos.uat.edu.mx', 
        password: 'password', 
        role: 'client',
        name: 'Maria Rodriguez',
        curp: 'RODM920202MDFXXX',
        phone: '834-444-5566',
        email: 'a0987654321@alumnos.uat.edu.mx',
        address: 'Avenida Siempre Viva 742, Ciudad Victoria',
    },
    { 
        username: 'admin', 
        password: 'admin', 
        role: 'librarian',
        name: 'Super Admin',
        email: 'admin@library.com',
        curp: 'ADMINCURP67890',
        phone: '098-765-4321',
        address: 'Admin Address'
    },
];

export const books: Book[] = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A novel about the American dream.',
    coverUrl: 'https://picsum.photos/300/450?random=1',
    genre: 'Classic',
    stock: 5,
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A novel about justice and racism in the American South.',
    coverUrl: 'https://picsum.photos/300/450?random=2',
    genre: 'Classic',
    stock: 3,
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian novel about totalitarianism.',
    coverUrl: 'https://picsum.photos/300/450?random=3',
    genre: 'Dystopian',
    stock: 2,
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A romantic novel of manners.',
    coverUrl: 'https://picsum.photos/300/450?random=4',
    genre: 'Romance',
    stock: 10,
  },
  {
    id: 5,
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'A fantasy novel about the adventures of Bilbo Baggins.',
    coverUrl: 'https://picsum.photos/300/450?random=5',
    genre: 'Fantasy',
    stock: 1,
  },
  {
    id: 6,
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'A science fiction novel set in a distant future amidst a feudal interstellar society.',
    coverUrl: 'https://picsum.photos/300/450?random=6',
    genre: 'Sci-Fi',
    stock: 8,
  },
  {
    id: 7,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'A story about adolescent alienation and loss of innocence.',
    coverUrl: 'https://picsum.photos/300/450?random=7',
    genre: 'Classic',
    stock: 1,
  },
  {
    id: 8,
    title: 'Brave New World',
    author: 'Aldous Huxley',
    description: 'A dystopian novel which anticipates developments in reproductive technology, sleep-learning, and psychological manipulation.',
    coverUrl: 'https://picsum.photos/300/450?random=8',
    genre: 'Dystopian',
    stock: 4,
  },
];

export const checkouts: Checkout[] = [
  { userId: 'a1234567890', bookId: 2, dueDate: '2024-08-15', status: 'approved' },
  { userId: 'a0987654321', bookId: 8, dueDate: '2024-08-10', status: 'approved' },
];

export const checkoutRequests: Checkout[] = [
    { userId: 'a1234567890', bookId: 5, dueDate: '2024-09-22', status: 'pending' },
];

export const readingHistory: { [key: string]: number[] } = {
    'a1234567890': [4, 6],
    'a0987654321': [1],
};
