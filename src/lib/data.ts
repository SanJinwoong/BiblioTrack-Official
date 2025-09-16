
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
        avatarUrl: 'https://i.pravatar.cc/150?u=librarian'
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
        status: 'deactivated',
        avatarUrl: 'https://i.pravatar.cc/150?u=a1234567890'
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
        avatarUrl: 'https://i.pravatar.cc/150?u=a0987654321'
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
        avatarUrl: 'https://i.pravatar.cc/150?u=admin'
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
        description: 'La saga de la familia Buendía en el pueblo de Macondo. Una obra maestra del realismo mágico que explora la soledad, la familia y el destino a lo largo de un siglo. Considerada una de las obras más importantes de la literatura hispanoamericana y universal, su narrativa no lineal y su mundo mágico han cautivado a generaciones de lectores en todo el mundo.',
        coverUrl: 'https://picsum.photos/seed/book1/300/450',
        category: 'Realismo Mágico',
        stock: 5,
    },
    {
        id: 2,
        title: '1984',
        author: 'George Orwell',
        description: 'Una visión sombría de un futuro totalitario donde el pensamiento individual es un crimen. El Gran Hermano te vigila en una sociedad controlada por la propaganda y la vigilancia. La novela introduce conceptos como la "neolengua" y el "doblepensar", que se han convertido en parte del léxico cultural para describir la manipulación y el control gubernamental.',
        coverUrl: 'https://picsum.photos/seed/book2/300/450',
        category: 'Distopía',
        stock: 3,
    },
    {
        id: 3,
        title: 'El Señor de los Anillos: La Comunidad del Anillo',
        author: 'J.R.R. Tolkien',
        description: 'El inicio de la épica aventura de Frodo Bolsón para destruir el Anillo Único. Un viaje a través de la Tierra Media lleno de peligros, amistad y heroísmo. Tolkien crea un universo vasto y detallado con sus propias lenguas, historias y mitologías, estableciendo el estándar para la alta fantasía moderna.',
        coverUrl: 'https://picsum.photos/seed/book3/300/450',
        category: 'Fantasía',
        stock: 4,
    },
    {
        id: 4,
        title: 'Dune',
        author: 'Frank Herbert',
        description: 'En el desértico planeta Arrakis, la lucha por el control de la "especia", la sustancia más valiosa del universo, desata intrigas políticas, batallas y el despertar de un mesías. Dune es una obra compleja que entrelaza ecología, religión, política y poder en una escala intergaláctica.',
        coverUrl: 'https://picsum.photos/seed/book4/300/450',
        category: 'Ciencia Ficción',
        stock: 6,
    },
    {
        id: 5,
        title: 'Orgullo y Prejuicio',
        author: 'Jane Austen',
        description: 'La inteligente y vivaz Elizabeth Bennet y el altivo Sr. Darcy superan sus prejuicios en esta inolvidable comedia romántica sobre las clases sociales y el amor en la Inglaterra del siglo XIX. La novela es aclamada por su aguda observación social y su ingenioso diálogo, que critica las convenciones y expectativas de su tiempo.',
        coverUrl: 'https://picsum.photos/seed/book5/300/450',
        category: 'Romance',
        stock: 8,
    },
    {
        id: 6,
        title: 'El nombre del viento',
        author: 'Patrick Rothfuss',
        description: 'La historia de Kvothe, un héroe y villano legendario. Desde su infancia como artista ambulante hasta su ingreso en la Universidad de magia, Kvothe narra su propia leyenda. La prosa lírica de Rothfuss y su intrincado sistema de magia han hecho de esta novela un fenómeno moderno de la fantasía.',
        coverUrl: 'https://picsum.photos/seed/book6/300/450',
        category: 'Fantasía',
        stock: 7,
    },
    {
        id: 7,
        title: 'Sapiens: De animales a dioses',
        author: 'Yuval Noah Harari',
        description: 'Un fascinante recorrido por la historia de la humanidad, desde los primeros Homo sapiens hasta las revoluciones cognitivas, agrícolas y científicas que nos han definido. Harari desafía las narrativas convencionales y explora cómo los mitos y las ficciones compartidas han permitido la cooperación a gran escala.',
        coverUrl: 'https://picsum.photos/seed/book7/300/450',
        category: 'Historia',
        stock: 10,
    },
    {
        id: 8,
        title: 'El Alquimista',
        author: 'Paulo Coelho',
        description: 'Un joven pastor andaluz llamado Santiago emprende un viaje en busca de un tesoro, descubriendo en el camino la importancia de seguir sus sueños y escuchar a su corazón. Esta novela alegórica se ha convertido en un clásico moderno, inspirando a millones a perseguir su "Leyenda Personal".',
        coverUrl: 'https://picsum.photos/seed/book8/300/450',
        category: 'Desarrollo Personal',
        stock: 9,
    },
    {
        id: 9,
        title: 'La Sombra del Viento',
        author: 'Carlos Ruiz Zafón',
        description: 'En la Barcelona de la posguerra, un joven encuentra un libro maldito que lo arrastra a un laberinto de secretos sobre su autor, en una trama de amor, misterio y tragedia. La novela es un homenaje a la literatura y a los libros, ambientada en una atmósfera gótica y evocadora.',
        coverUrl: 'https://picsum.photos/seed/book9/300/450',
        category: 'Misterio',
        stock: 0,
    },
    {
        id: 10,
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        description: 'Las aventuras de un hidalgo enloquecido por los libros de caballerías que, junto a su fiel escudero Sancho Panza, recorre La Mancha en busca de gloria y justicia. Considerada la primera novela moderna, es una obra cumbre de la literatura universal que explora temas como la locura, la realidad y la ficción.',
        coverUrl: 'https://picsum.photos/seed/book10/300/450',
        category: 'Clásico',
        stock: 1,
    },
    {
        id: 11,
        title: 'El problema de los tres cuerpos',
        author: 'Cixin Liu',
        description: 'La primera novela de una trilogía épica de ciencia ficción que aborda el primer contacto de la humanidad con una civilización alienígena. La historia se desarrolla durante la Revolución Cultural China y se extiende hasta el presente, combinando física, historia y filosofía en una trama absorbente sobre el destino de la humanidad.',
        coverUrl: 'https://picsum.photos/seed/book11/300/450',
        category: 'Ciencia Ficción',
        stock: 4,
    },
    {
        id: 12,
        title: 'Los renglones torcidos de Dios',
        author: 'Torcuato Luca de Tena',
        description: 'Alice Gould, una detective privada, ingresa en un hospital psiquiátrico simulando una paranoia para investigar la muerte de un interno. Sin embargo, la línea entre la cordura y la locura comienza a desdibujarse. Un thriller psicológico que mantiene al lector en vilo hasta la última página.',
        coverUrl: 'https://picsum.photos/seed/book12/300/450',
        category: 'Misterio',
        stock: 5,
    },
    {
        id: 13,
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        description: 'En un futuro distópico, los bomberos tienen la misión de quemar libros, ya que el pensamiento crítico está prohibido. Guy Montag, uno de estos bomberos, comienza a cuestionar su papel en la sociedad y se atreve a desafiar el sistema. Una poderosa crítica a la censura y la conformidad.',
        coverUrl: 'https://picsum.photos/seed/book13/300/450',
        category: 'Distopía',
        stock: 6,
    },
    {
        id: 14,
        title: 'El amor en los tiempos del cólera',
        author: 'Gabriel García Márquez',
        description: 'La historia de un amor eterno entre Florentino Ariza y Fermina Daza, que se extiende por más de cincuenta años. A través de sus vidas, la novela explora las múltiples facetas del amor, la espera y la vejez. Otra obra cumbre del realismo mágico que celebra la persistencia del corazón humano.',
        coverUrl: 'https://picsum.photos/seed/book14/300/450',
        category: 'Realismo Mágico',
        stock: 3,
    },
    {
        id: 15,
        title: 'Hábitos Atómicos',
        author: 'James Clear',
        description: 'Un bestseller que ofrece un marco práctico para mejorar cada día. Clear revela estrategias sencillas para construir buenos hábitos, romper los malos y dominar las pequeñas acciones que conducen a resultados extraordinarios. Es una guía esencial para quienes buscan un cambio positivo y duradero.',
        coverUrl: 'https://picsum.photos/seed/book15/300/450',
        category: 'Desarrollo Personal',
        stock: 12,
    },
    {
        id: 16,
        title: 'El Silmarillion',
        author: 'J.R.R. Tolkien',
        description: 'La obra que narra la historia antigua de la Tierra Media, desde la creación del mundo hasta la primera guerra contra Morgoth. Es la mitología fundamental que sustenta "El Hobbit" y "El Señor de los Anillos", llena de relatos épicos sobre dioses, elfos, hombres y la creación de los Anillos de Poder.',
        coverUrl: 'https://picsum.photos/seed/book16/300/450',
        category: 'Fantasía',
        stock: 2,
    },
    {
        id: 17,
        title: 'El sol y sus flores',
        author: 'Rupi Kaur',
        description: 'Un poemario que es un viaje de marchitamiento, caída, enraizamiento, crecimiento y florecimiento. Dividido en cinco capítulos, explora el dolor, el abandono, el honor a las raíces, el amor y el empoderamiento. Una colección poética que resuena por su honestidad y vulnerabilidad.',
        coverUrl: 'https://picsum.photos/seed/book17/300/450',
        category: 'Novela',
        stock: 8,
    },
    {
        id: 18,
        title: 'Asesinato en el Orient Express',
        author: 'Agatha Christie',
        description: 'El famoso detective Hércules Poirot se encuentra a bordo del lujoso Orient Express cuando un pasajero es asesinado. Con el tren detenido por la nieve, Poirot debe descubrir al culpable entre un elenco de sospechosos, cada uno con un secreto que ocultar. Un clásico del misterio con uno de los finales más ingeniosos jamás escritos.',
        coverUrl: 'https://picsum.photos/seed/book18/300/450',
        category: 'Misterio',
        stock: 0,
    },
    {
        id: 19,
        title: 'Anna Karenina',
        author: 'León Tolstói',
        description: 'La trágica historia de una aristócrata rusa que lo arriesga todo por un amor prohibido, en contraste con la vida de un terrateniente que busca la felicidad en el campo y la familia. Tolstói teje un complejo tapiz de la sociedad rusa del siglo XIX, explorando la hipocresía, la pasión, la fe y el destino.',
        coverUrl: 'https://picsum.photos/seed/book19/300/450',
        category: 'Clásico',
        stock: 3,
    },
    {
        id: 20,
        title: 'Un mundo feliz',
        author: 'Aldous Huxley',
        description: 'Una novela distópica que presenta una sociedad aparentemente perfecta, donde la humanidad es genéticamente diseñada y condicionada para la obediencia y el consumo. No hay guerra, ni pobreza, pero tampoco hay arte, ni amor, ni libre albedrío. Una profunda reflexión sobre el precio de la felicidad.',
        coverUrl: 'https://picsum.photos/seed/book20/300/450',
        category: 'Distopía',
        stock: 4,
    }
];

export const checkouts: Checkout[] = [
  // Préstamo Vencido para Juan Perez (causa de desactivación)
  { userId: 'a1234567890', bookId: 2, dueDate: '2024-05-10', status: 'approved' },
  // Otro Préstamo Vencido para Juan Perez
  { userId: 'a1234567890', bookId: 10, dueDate: '2024-06-15', status: 'approved' },

  // Préstamo Vencido para Maria Rodriguez (pero aún no desactivada)
  { userId: 'a0987654321', bookId: 13, dueDate: '2024-08-15', status: 'approved' },
  // Préstamo Activo para Maria Rodriguez
  { userId: 'a0987654321', bookId: 8, dueDate: '2024-09-25', status: 'approved' },

  // Préstamo activo casi por vencer para otro usuario
  { userId: 'a1234567890', bookId: 15, dueDate: '2024-08-30', status: 'approved' },
];

export const checkoutRequests: Checkout[] = [
    { userId: 'a0987654321', bookId: 5, dueDate: '2024-09-22', status: 'pending' },
    { userId: 'a0987654321', bookId: 11, dueDate: '2024-09-20', status: 'pending' },
    { userId: 'a1234567890', bookId: 14, dueDate: '2024-09-18', status: 'pending' },
];

export const readingHistory: { [key: string]: number[] } = {
    'a1234567890': [4, 6],
    'a0987654321': [1],
};

    