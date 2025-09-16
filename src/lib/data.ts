
import type { Book, Checkout, User, Category } from './types';

// Note: The 'id' properties will be ignored by Firestore when we add these documents,
// as Firestore auto-generates unique IDs. We keep them for local relationships if needed.

export const initialUsers: Omit<User, 'id'>[] = [
    { 
        username: 'admin', 
        password: 'admin', 
        role: 'librarian',
        name: 'Librarian Admin',
        email: 'admin@library.com',
        curp: 'ADMINCURP12345',
        phone: '123-456-7890',
        address: 'Library Address, 123',
        status: 'active',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin'
    },
    { 
        username: 'a1234567890', 
        password: 'password',
        role: 'client',
        name: 'Juan Pérez',
        curp: 'PERJ900101HDFXXX',
        phone: '834-111-2233',
        email: 'a1234567890@alumnos.uat.edu.mx',
        address: 'Calle Falsa 123, Ciudad Victoria',
        status: 'deactivated',
        avatarUrl: 'https://i.pravatar.cc/150?u=a1234567890'
    },
    { 
        username: 'a0987654321', 
        password: 'password', 
        role: 'client',
        name: 'Maria Rodríguez',
        curp: 'RODM920202MDFXXX',
        phone: '834-444-5566',
        email: 'a0987654321@alumnos.uat.edu.mx',
        address: 'Avenida Siempre Viva 742, Ciudad Victoria',
        status: 'active',
        avatarUrl: 'https://i.pravatar.cc/150?u=a0987654321'
    },
     { 
        username: 'a2222222222', 
        password: 'password',
        role: 'client',
        name: 'Carlos Sánchez',
        curp: 'SACC880303MDFABC',
        phone: '834-555-7788',
        email: 'a2222222222@alumnos.uat.edu.mx',
        address: 'Boulevard del Sol 456, Tampico',
        status: 'deactivated',
        avatarUrl: 'https://i.pravatar.cc/150?u=a2222222222'
    },
    { 
        username: 'a3333333333', 
        password: 'password', 
        role: 'client',
        name: 'Ana García',
        curp: 'GANA950404HDFXYZ',
        phone: '834-666-9900',
        email: 'a3333333333@alumnos.uat.edu.mx',
        address: 'Calle Luna 8, Mante',
        status: 'active',
        avatarUrl: 'https://i.pravatar.cc/150?u=a3333333333'
    }
];

export const initialCategories: Omit<Category, 'id'>[] = [
  { name: 'Novela' },
  { name: 'Ciencia Ficción' },
  { name: 'Fantasía' },
  { name: 'Misterio' },
  { name: 'Romance' },
  { name: 'Historia' },
  { name: 'Desarrollo Personal' },
  { name: 'Realismo Mágico' },
  { name: 'Clásico' },
  { name: 'Distopía' },
];

export const initialBooks: Omit<Book, 'id'>[] = [
    {
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        description: 'La saga de la familia Buendía en el pueblo de Macondo. Una obra maestra del realismo mágico.',
        coverUrl: 'https://picsum.photos/seed/book1/300/450',
        category: 'Realismo Mágico',
        stock: 5,
    },
    {
        title: '1984',
        author: 'George Orwell',
        description: 'Una visión sombría de un futuro totalitario donde el pensamiento individual es un crimen.',
        coverUrl: 'https://picsum.photos/seed/book2/300/450',
        category: 'Distopía',
        stock: 3,
    },
    {
        title: 'El Señor de los Anillos: La Comunidad del Anillo',
        author: 'J.R.R. Tolkien',
        description: 'El inicio de la épica aventura de Frodo Bolsón para destruir el Anillo Único.',
        coverUrl: 'https://picsum.photos/seed/book3/300/450',
        category: 'Fantasía',
        stock: 4,
    },
    {
        title: 'Dune',
        author: 'Frank Herbert',
        description: 'En el desértico planeta Arrakis, la lucha por el control de la "especia", la sustancia más valiosa del universo.',
        coverUrl: 'https://picsum.photos/seed/book4/300/450',
        category: 'Ciencia Ficción',
        stock: 6,
    },
    {
        title: 'Orgullo y Prejuicio',
        author: 'Jane Austen',
        description: 'La inteligente y vivaz Elizabeth Bennet y el altivo Sr. Darcy superan sus prejuicios.',
        coverUrl: 'https://picsum.photos/seed/book5/300/450',
        category: 'Romance',
        stock: 8,
    },
    {
        title: 'El nombre del viento',
        author: 'Patrick Rothfuss',
        description: 'La historia de Kvothe, un héroe y villano legendario. Desde su infancia como artista ambulante hasta su ingreso en la Universidad de magia.',
        coverUrl: 'https://picsum.photos/seed/book6/300/450',
        category: 'Fantasía',
        stock: 7,
    },
    {
        title: 'Sapiens: De animales a dioses',
        author: 'Yuval Noah Harari',
        description: 'Un fascinante recorrido por la historia de la humanidad, desde los primeros Homo sapiens hasta las revoluciones que nos han definido.',
        coverUrl: 'https://picsum.photos/seed/book7/300/450',
        category: 'Historia',
        stock: 10,
    },
    {
        title: 'El Alquimista',
        author: 'Paulo Coelho',
        description: 'Un joven pastor andaluz llamado Santiago emprende un viaje en busca de un tesoro, descubriendo en el camino la importancia de seguir sus sueños.',
        coverUrl: 'https://picsum.photos/seed/book8/300/450',
        category: 'Desarrollo Personal',
        stock: 9,
    },
    {
        title: 'La Sombra del Viento',
        author: 'Carlos Ruiz Zafón',
        description: 'En la Barcelona de la posguerra, un joven encuentra un libro maldito que lo arrastra a un laberinto de secretos sobre su autor.',
        coverUrl: 'https://picsum.photos/seed/book9/300/450',
        category: 'Misterio',
        stock: 0,
    },
    {
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        description: 'Las aventuras de un hidalgo enloquecido por los libros de caballerías que, junto a su fiel escudero Sancho Panza, recorre La Mancha.',
        coverUrl: 'https://picsum.photos/seed/book10/300/450',
        category: 'Clásico',
        stock: 1,
    },
];

// We use the matricula/username as the userId now
export const initialCheckouts: Omit<Checkout, 'id' | 'bookId'> & { bookTitle: string }[] = [
  // Préstamo Vencido para Juan Pérez (causa de desactivación)
  { userId: 'a1234567890', bookTitle: '1984', dueDate: '2024-05-10', status: 'approved' },
  // Otro Préstamo Vencido para Juan Pérez
  { userId: 'a1234567890', bookTitle: 'Don Quijote de la Mancha', dueDate: '2024-06-15', status: 'approved' },
  // Préstamo Vencido para Carlos Sánchez
  { userId: 'a2222222222', bookTitle: 'Dune', dueDate: '2024-07-01', status: 'approved' },

  // Préstamo Activo para Maria Rodríguez
  { userId: 'a0987654321', bookTitle: 'El Alquimista', dueDate: '2024-09-25', status: 'approved' },
  // Préstamo Activo para Ana García
  { userId: 'a3333333333', bookTitle: 'Orgullo y Prejuicio', dueDate: '2024-09-30', status: 'approved' },
];

export const initialCheckoutRequests: Omit<Checkout, 'id' | 'bookId'> & { bookTitle: string }[] = [
    { userId: 'a0987654321', bookTitle: 'Sapiens: De animales a dioses', dueDate: '2024-09-22', status: 'pending' },
    { userId: 'a3333333333', bookTitle: 'El nombre del viento', dueDate: '2024-09-20', status: 'pending' },
];

// This part is for the AI recommendations, which can remain local as it's a mock
// We use the matricula/username for the key now to be consistent.
export const readingHistory: { [key: string]: string[] } = {
    'a1234567890': ["book4_id", "book6_id"], // Placeholder IDs, to be mapped to real book IDs
    'a0987654321': ["book1_id"],
};
