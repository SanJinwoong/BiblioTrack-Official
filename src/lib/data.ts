

import type { Book, Checkout, User, Category, Review } from './types';

// Note: The 'id' properties will be ignored by Firestore when we add these documents,
// as Firestore auto-generates unique IDs. We keep them for local relationships if needed.

export const initialUsers: Omit<User, 'id'>[] = [
    { 
        username: 'admin', 
        password: 'admin', 
        role: 'librarian',
        name: 'Librarian Admin',
        email: 'admin@library.com',
        curp: 'ADMINCURP123456',
        phone: '834-000-0000',
        address: 'UAT, Centro Universitario Victoria',
        status: 'active',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin',
        bannerUrl: 'https://picsum.photos/seed/banner-admin/1200/300',
        bio: 'Managing the library and ensuring everything is in order. Passionate about classic literature and historical archives.',
        favoriteBooks: ['Don Quijote de la Mancha', '1984'],
        following: ['a0987654321'],
        followers: [],
        createdAt: '2023-01-15T10:00:00.000Z',
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
        status: 'active', // Inicia como activo, la lógica lo desactivará
        avatarUrl: 'https://i.pravatar.cc/150?u=a1234567890',
        bannerUrl: 'https://picsum.photos/seed/banner-1/1200/300',
        bio: 'Estudiante de ingeniería. En mis tiempos libres, me sumerjo en mundos de ciencia ficción y distopías.',
        favoriteBooks: ['1984', 'Dune'],
        following: ['a0987654321', 'a3333333333'],
        followers: ['a0987654321'],
        createdAt: '2023-02-20T11:30:00.000Z',
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
        avatarUrl: 'https://i.pravatar.cc/150?u=a0987654321',
        bannerUrl: 'https://picsum.photos/seed/banner-2/1200/300',
        bio: 'Amante del realismo mágico y las historias que te hacen pensar. Siempre en busca de una nueva aventura literaria.',
        favoriteBooks: ['Cien años de soledad', 'El Alquimista', 'La Sombra del Viento'],
        following: ['a1234567890', 'admin'],
        followers: ['a1234567890'],
        createdAt: '2023-03-10T18:00:00.000Z',
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
        status: 'active', // Inicia como activo, la lógica lo desactivará
        avatarUrl: 'https://i.pravatar.cc/150?u=a2222222222',
        bannerUrl: 'https://picsum.photos/seed/banner-3/1200/300',
        bio: 'Futuro historiador. Me interesan los libros que exploran el pasado de la humanidad y las grandes civilizaciones.',
        favoriteBooks: ['Sapiens: De animales a dioses'],
        following: [],
        followers: [],
        createdAt: '2023-04-05T09:00:00.000Z',
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
        avatarUrl: 'https://i.pravatar.cc/150?u=a3333333333',
        bannerUrl: 'https://picsum.photos/seed/banner-4/1200/300',
        bio: 'Devoradora de novelas de fantasía. Si tiene dragones, magia o mundos épicos, ¡lo leo!',
        favoriteBooks: ['El Señor de los Anillos: La Comunidad del Anillo', 'El nombre del viento'],
        following: [],
        followers: ['a1234567890'],
        createdAt: '2023-05-12T14:20:00.000Z',
    },
    { 
        username: 'a4444444444', 
        password: 'password', 
        role: 'client',
        name: 'Laura Gómez',
        curp: 'GOML980505MDFZYX',
        phone: '834-777-1122',
        email: 'a4444444444@alumnos.uat.edu.mx',
        address: 'Calle del Río 101, Reynosa',
        status: 'active',
        avatarUrl: 'https://i.pravatar.cc/150?u=a4444444444',
        bannerUrl: 'https://picsum.photos/seed/banner-5/1200/300',
        bio: 'Disfruto de un buen misterio y novelas románticas clásicas. Jane Austen es mi autora preferida.',
        favoriteBooks: ['Orgullo y Prejuicio'],
        following: [],
        followers: [],
        createdAt: '2023-06-01T16:00:00.000Z',
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

const today = new Date();
const getPastDate = (days: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};
const getFutureDate = (days: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// We use the matricula/username as the userId now
export const initialCheckouts: Omit<Checkout, 'id' | 'bookId'> & { bookTitle: string }[] = [
  // Préstamo VENCIDO (+20 días) para Juan Pérez -> Cuenta Desactivada
  { userId: 'a1234567890', bookTitle: '1984', dueDate: getPastDate(20), status: 'approved' },
  // Otro préstamo VENCIDO (+30 días) para el mismo Juan Pérez
  { userId: 'a1234567890', bookTitle: 'Don Quijote de la Mancha', dueDate: getPastDate(30), status: 'approved' },
  
  // Préstamo VENCIDO (+15 días) para Carlos Sánchez -> Cuenta Desactivada
  { userId: 'a2222222222', bookTitle: 'Dune', dueDate: getPastDate(15), status: 'approved' },

  // Préstamo VENCIDO RECIENTEMENTE (4 días) para Laura Gómez -> Cuenta AÚN ACTIVA
  { userId: 'a4444444444', bookTitle: 'Cien años de soledad', dueDate: getPastDate(4), status: 'approved' },

  // Préstamo ACTIVO para Maria Rodríguez (vence en el futuro)
  { userId: 'a0987654321', bookTitle: 'El Alquimista', dueDate: getFutureDate(10), status: 'approved' },
];

export const initialCheckoutRequests: Omit<Checkout, 'id' | 'bookId'> & { bookTitle: string }[] = [
    { userId: 'a0987654321', bookTitle: 'Sapiens: De animales a dioses', dueDate: getFutureDate(7), status: 'pending' },
    { userId: 'a3333333333', bookTitle: 'El nombre del viento', dueDate: getFutureDate(7), status: 'pending' },
];

// This part is for the AI recommendations, which can remain local as it's a mock
// We use the matricula/username for the key now to be consistent.
export const readingHistory: { [key: string]: string[] } = {
    'a1234567890': ["book4_id", "book6_id"], // Placeholder IDs, to be mapped to real book IDs
    'a0987654321': ["book1_id"],
};

export const initialReviews: Omit<Review, 'id' | 'bookId'> & { bookTitle: string }[] = [
    {
        userId: 'a0987654321',
        bookTitle: 'Cien años de soledad',
        rating: 5,
        comment: 'Una obra maestra absoluta. La historia de los Buendía es inolvidable. El realismo mágico en su máxima expresión. ¡Totalmente recomendado!',
        date: getPastDate(5),
    },
    {
        userId: 'a1234567890',
        bookTitle: 'Dune',
        rating: 5,
        comment: 'Increíble construcción de mundo. Arrakis se siente como un lugar real. La trama política y la acción son de primer nivel. Un clásico de la ciencia ficción por una razón.',
        date: getPastDate(10),
    },
    {
        userId: 'a3333333333',
        bookTitle: 'El Señor de los Anillos: La Comunidad del Anillo',
        rating: 4,
        comment: 'El comienzo de una aventura épica. A veces puede ser un poco lento con las descripciones, pero la construcción del mundo es asombrosa.',
        date: getPastDate(1),
    },
    {
        userId: 'a0987654321',
        bookTitle: 'El Alquimista',
        rating: 4,
        comment: 'Un libro inspirador y fácil de leer. Te hace reflexionar sobre tu propio "Propósito Personal". Muy recomendable para una lectura ligera y motivadora.',
        date: getPastDate(2),
    },
];

    
