
import type { Book, Checkout, User, Category } from './types';

export const users: User[] = [
    { 
        username: 'librarian', 
        password: 'password', 
        role: 'librarian',
        name: 'Library Admin',
        email: 'librarian@library.com',
        curp: 'ADMINCURP12345',
        phone: '123-456-7890',
        address: 'Library Address',
        status: 'active',
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
        status: 'active',
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
        status: 'active',
    },
    { 
        username: 'admin', 
        password: 'admin', 
        role: 'librarian',
        name: 'Super Admin',
        email: 'admin@library.com',
        curp: 'ADMINCURP67890',
        phone: '098-765-4321',
        address: 'Admin Address',
        status: 'active',
    },
];

export const categories: Category[] = [
  { id: 'novela', name: 'Novela' },
  { id: 'ciencia-ficcion', name: 'Ciencia Ficción' },
  { id: 'fantasia', name: 'Fantasía' },
  { id: 'misterio', name: 'Misterio' },
  { id: 'romance', name: 'Romance' },
  { id: 'historia', name: 'Historia' },
  { id: 'desarrollo-personal', name: 'Desarrollo Personal' },
  { id: 'realismo-magico', name: 'Realismo Mágico' },
  { id: 'classic', name: 'Clásico' },
  { id: 'dystopian', name: 'Distopía' },
];

export const books: Book[] = [
    {
        id: 1,
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        description: 'La saga de la familia Buendía en el pueblo de Macondo. Una obra maestra del realismo mágico que explora la soledad, la familia y el destino a lo largo de un siglo.',
        coverUrl: 'https://picsum.photos/seed/book1/300/450',
        category: 'Realismo Mágico',
        stock: 5,
    },
    {
        id: 2,
        title: '1984',
        author: 'George Orwell',
        description: 'Una visión sombría de un futuro totalitario donde el pensamiento individual es un crimen. El Gran Hermano te vigila en una sociedad controlada por la propaganda y la vigilancia.',
        coverUrl: 'https://picsum.photos/seed/book2/300/450',
        category: 'Distopía',
        stock: 3,
    },
    {
        id: 3,
        title: 'El Señor de los Anillos: La Comunidad del Anillo',
        author: 'J.R.R. Tolkien',
        description: 'El inicio de la épica aventura de Frodo Bolsón para destruir el Anillo Único. Un viaje a través de la Tierra Media lleno de peligros, amistad y heroísmo.',
        coverUrl: 'https://picsum.photos/seed/book3/300/450',
        category: 'Fantasía',
        stock: 4,
    },
    {
        id: 4,
        title: 'Dune',
        author: 'Frank Herbert',
        description: 'En el desértico planeta Arrakis, la lucha por el control de la "especia", la sustancia más valiosa del universo, desata intrigas políticas, batallas y el despertar de un mesías.',
        coverUrl: 'https://picsum.photos/seed/book4/300/450',
        category: 'Ciencia Ficción',
        stock: 6,
    },
    {
        id: 5,
        title: 'Orgullo y Prejuicio',
        author: 'Jane Austen',
        description: 'La inteligente y vivaz Elizabeth Bennet y el altivo Sr. Darcy superan sus prejuicios en esta inolvidable comedia romántica sobre las clases sociales y el amor en la Inglaterra del siglo XIX.',
        coverUrl: 'https://picsum.photos/seed/book5/300/450',
        category: 'Romance',
        stock: 8,
    },
    {
        id: 6,
        title: 'El nombre del viento',
        author: 'Patrick Rothfuss',
        description: 'La historia de Kvothe, un héroe y villano legendario. Desde su infancia como artista ambulante hasta su ingreso en la Universidad de magia, Kvothe narra su propia leyenda.',
        coverUrl: 'https://picsum.photos/seed/book6/300/450',
        category: 'Fantasía',
        stock: 7,
    },
    {
        id: 7,
        title: 'Sapiens: De animales a dioses',
        author: 'Yuval Noah Harari',
        description: 'Un fascinante recorrido por la historia de la humanidad, desde los primeros Homo sapiens hasta las revoluciones cognitivas, agrícolas y científicas que nos han definido.',
        coverUrl: 'https://picsum.photos/seed/book7/300/450',
        category: 'Historia',
        stock: 10,
    },
    {
        id: 8,
        title: 'El Alquimista',
        author: 'Paulo Coelho',
        description: 'Un joven pastor andaluz llamado Santiago emprende un viaje en busca de un tesoro, descubriendo en el camino la importancia de seguir sus sueños y escuchar a su corazón.',
        coverUrl: 'https://picsum.photos/seed/book8/300/450',
        category: 'Desarrollo Personal',
        stock: 9,
    },
    {
        id: 9,
        title: 'La Sombra del Viento',
        author: 'Carlos Ruiz Zafón',
        description: 'En la Barcelona de la posguerra, un joven encuentra un libro maldito que lo arrastra a un laberinto de secretos sobre su autor, en una trama de amor, misterio y tragedia.',
        coverUrl: 'https://picsum.photos/seed/book9/300/450',
        category: 'Misterio',
        stock: 0,
    },
    {
        id: 10,
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        description: 'Las aventuras de un hidalgo enloquecido por los libros de caballerías que, junto a su fiel escudero Sancho Panza, recorre La Mancha en busca de gloria y justicia.',
        coverUrl: 'https://picsum.photos/seed/book10/300/450',
        category: 'Clásico',
        stock: 1,
    }
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
