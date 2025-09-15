
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

export const categories: Category[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'dystopian', name: 'Dystopian' },
  { id: 'romance', name: 'Romance' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'sci-fi', name: 'Sci-Fi' },
  { id: 'accion', name: 'Acción' },
  { id: 'misterio', name: 'Misterio' },
  { id: 'realismo-magico', name: 'Realismo Mágico' },
];

export const books: Book[] = [
    {
        id: 1,
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        description: 'Narra las aventuras de un hidalgo que, tras leer demasiados libros de caballerías, decide convertirse en caballero andante. Junto a su fiel escudero Sancho Panza, busca aventuras para impartir justicia.',
        coverUrl: 'https://picsum.photos/300/450?random=1',
        category: 'Classic',
        stock: 7,
    },
    {
        id: 2,
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        description: 'La historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo. Una obra cumbre del realismo mágico que explora la soledad, el amor y la fatalidad.',
        coverUrl: 'https://picsum.photos/300/450?random=2',
        category: 'Realismo Mágico',
        stock: 5,
    },
    {
        id: 3,
        title: 'El Señor de los Anillos',
        author: 'J.R.R. Tolkien',
        description: 'Una épica de alta fantasía que narra el viaje del hobbit Frodo Bolsón para destruir el Anillo Único y derrotar al Señor Oscuro Sauron. Una lucha entre el bien y el mal en la Tierra Media.',
        coverUrl: 'https://picsum.photos/300/450?random=3',
        category: 'Fantasy',
        stock: 4,
    },
    {
        id: 4,
        title: 'Un Mundo Feliz',
        author: 'Aldous Huxley',
        description: 'Una novela distópica que presenta una sociedad futura aparentemente perfecta, donde la humanidad es controlada a través de la tecnología, la manipulación psicológica y el condicionamiento.',
        coverUrl: 'https://picsum.photos/300/450?random=4',
        category: 'Dystopian',
        stock: 6,
    },
    {
        id: 5,
        title: 'Orgullo y Prejuicio',
        author: 'Jane Austen',
        description: 'Una novela romántica que sigue el desarrollo emocional de Elizabeth Bennet, quien aprende sobre el error de hacer juicios apresurados y llega a apreciar la diferencia entre lo superficial y lo esencial.',
        coverUrl: 'https://picsum.photos/300/450?random=5',
        category: 'Romance',
        stock: 8,
    },
    {
        id: 6,
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        description: 'En un futuro donde los libros están prohibidos, los "bomberos" tienen la misión de quemarlos. El protagonista, Guy Montag, comienza a cuestionar su papel y la sociedad en la que vive.',
        coverUrl: 'https://picsum.photos/300/450?random=6',
        category: 'Dystopian',
        stock: 3,
    },
    {
        id: 7,
        title: 'Fundación',
        author: 'Isaac Asimov',
        description: 'Un vasto imperio galáctico se desmorona y solo Hari Seldon, creador de la psicohistoria, puede prever el oscuro futuro. Para preservarlo, crea dos fundaciones en extremos opuestos de la galaxia.',
        coverUrl: 'https://picsum.photos/300/450?random=7',
        category: 'Sci-Fi',
        stock: 9,
    },
    {
        id: 8,
        title: 'El código Da Vinci',
        author: 'Dan Brown',
        description: 'El simbologista Robert Langdon se ve envuelto en una investigación tras un asesinato en el Louvre. Las pistas lo llevan a una sociedad secreta y a un secreto protegido durante siglos por la Iglesia.',
        coverUrl: 'https://picsum.photos/300/450?random=8',
        category: 'Misterio',
        stock: 10,
    },
    {
        id: 9,
        title: 'La Sombra del Viento',
        author: 'Carlos Ruiz Zafón',
        description: 'En la Barcelona de posguerra, el joven Daniel Sempere descubre un libro maldito que cambia el rumbo de su vida. Su búsqueda del autor lo sumerge en un laberinto de secretos y traiciones.',
        coverUrl: 'https://picsum.photos/300/450?random=9',
        category: 'Misterio',
        stock: 6,
    },
    {
        id: 10,
        title: 'Juego de Tronos',
        author: 'George R.R. Martin',
        description: 'En el continente de Poniente, varias casas nobles luchan por el control del Trono de Hierro. Mientras tanto, una antigua amenaza resurge en el norte, poniendo en peligro a todo el reino.',
        coverUrl: 'https://picsum.photos/300/450?random=10',
        category: 'Fantasy',
        stock: 2,
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
