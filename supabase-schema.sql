-- ===================================================================
-- BiblioTrack Database Schema for Supabase - ESQUEMA UAT CORREGIDO
-- ===================================================================
-- INSTRUCCIONES:
-- 1. Copia TODO este archivo completo 
-- 2. Pega en el SQL Editor de Supabase
-- 3. Ejecuta todo de una vez
-- Este script implementa la lógica correcta de matrícula UAT
-- ===================================================================

-- LÓGICA DE USUARIOS UAT:
-- 📚 ESTUDIANTES: 
--    - Email: matricula@alumnos.uat.edu.mx (ej: a1234567890@alumnos.uat.edu.mx)
--    - Username: la matrícula (ej: a1234567890)
--    - Login: usando la matrícula
--    - Todos los campos requeridos (CURP, teléfono, etc.)
--
-- 👨‍💼 BIBLIOTECARIOS:
--    - Email: cualquier formato válido
--    - Username: nombre completo como identificador
--    - Login: usando el nombre
--    - Campos opcionales según necesidad

-- ============ PASO 1: ELIMINAR TODO LO EXISTENTE ============

-- Deshabilitar RLS temporalmente para poder eliminar todo
SET session_replication_role = replica;

-- Eliminar todas las políticas RLS existentes (sin errores si no existen)
DO $$ 
BEGIN
    -- Users policies
    DROP POLICY IF EXISTS "users_select_policy" ON users;
    DROP POLICY IF EXISTS "users_insert_policy" ON users;
    DROP POLICY IF EXISTS "users_update_policy" ON users;
    DROP POLICY IF EXISTS "users_delete_policy" ON users;
    
    -- Categories policies
    DROP POLICY IF EXISTS "categories_select_policy" ON categories;
    DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
    DROP POLICY IF EXISTS "categories_update_policy" ON categories;
    DROP POLICY IF EXISTS "categories_delete_policy" ON categories;
    
    -- Books policies
    DROP POLICY IF EXISTS "books_select_policy" ON books;
    DROP POLICY IF EXISTS "books_insert_policy" ON books;
    DROP POLICY IF EXISTS "books_update_policy" ON books;
    DROP POLICY IF EXISTS "books_delete_policy" ON books;
    
    -- Other policies
    DROP POLICY IF EXISTS "checkouts_select_policy" ON checkouts;
    DROP POLICY IF EXISTS "checkouts_insert_policy" ON checkouts;
    DROP POLICY IF EXISTS "checkouts_update_policy" ON checkouts;
    DROP POLICY IF EXISTS "checkouts_delete_policy" ON checkouts;
    
    DROP POLICY IF EXISTS "checkout_requests_select_policy" ON checkout_requests;
    DROP POLICY IF EXISTS "checkout_requests_insert_policy" ON checkout_requests;
    DROP POLICY IF EXISTS "checkout_requests_update_policy" ON checkout_requests;
    DROP POLICY IF EXISTS "checkout_requests_delete_policy" ON checkout_requests;
    
    DROP POLICY IF EXISTS "reviews_select_policy" ON reviews;
    DROP POLICY IF EXISTS "reviews_insert_policy" ON reviews;
    DROP POLICY IF EXISTS "reviews_update_policy" ON reviews;
    DROP POLICY IF EXISTS "reviews_delete_policy" ON reviews;
    
    DROP POLICY IF EXISTS "policies_select_policy" ON library_policies;
    DROP POLICY IF EXISTS "policies_insert_policy" ON library_policies;
    DROP POLICY IF EXISTS "policies_update_policy" ON library_policies;
    DROP POLICY IF EXISTS "policies_delete_policy" ON library_policies;
    
    DROP POLICY IF EXISTS "activities_select_policy" ON user_activities;
    DROP POLICY IF EXISTS "activities_insert_policy" ON user_activities;
    DROP POLICY IF EXISTS "activities_update_policy" ON user_activities;
    DROP POLICY IF EXISTS "activities_delete_policy" ON user_activities;
    
    DROP POLICY IF EXISTS "favorites_select_policy" ON user_favorites;
    DROP POLICY IF EXISTS "favorites_insert_policy" ON user_favorites;
    DROP POLICY IF EXISTS "favorites_update_policy" ON user_favorites;
    DROP POLICY IF EXISTS "favorites_delete_policy" ON user_favorites;
    
    DROP POLICY IF EXISTS "follows_select_policy" ON user_follows;
    DROP POLICY IF EXISTS "follows_insert_policy" ON user_follows;
    DROP POLICY IF EXISTS "follows_update_policy" ON user_follows;
    DROP POLICY IF EXISTS "follows_delete_policy" ON user_follows;
    
EXCEPTION 
    WHEN OTHERS THEN 
        -- Ignorar errores si las tablas no existen
        NULL;
END $$;

-- Eliminar todas las tablas en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE; 
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS checkout_requests CASCADE;
DROP TABLE IF EXISTS checkouts CASCADE;
DROP TABLE IF EXISTS library_policies CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Restaurar configuración normal
SET session_replication_role = DEFAULT;

-- ============ PASO 2: CREAR TODAS LAS TABLAS DESDE CERO ============

-- Tabla 1: USUARIOS UAT (con validación de matrícula)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL, -- Para estudiantes: matrícula, Para bibliotecarios: nombre completo
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('client', 'librarian')) NOT NULL,
    name VARCHAR(255) NOT NULL, -- Nombre completo obligatorio
    curp VARCHAR(18) NOT NULL, -- CURP obligatorio para formularios del bibliotecario
    phone VARCHAR(20) NOT NULL, -- Teléfono obligatorio
    email VARCHAR(255) UNIQUE NOT NULL, -- Email obligatorio y único
    address TEXT NOT NULL, -- Dirección obligatoria
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT,
    badge_category_id UUID NULL,
    badge_label TEXT NULL,
    favorite_books TEXT[], -- Mantener por compatibilidad
    following TEXT[], -- Mantener por compatibilidad
    followers TEXT[], -- Mantener por compatibilidad
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    -- Validaciones específicas para usuarios UAT
    CONSTRAINT valid_student_email CHECK (
        role != 'client' OR email LIKE '%@alumnos.uat.edu.mx'
    ),
    CONSTRAINT valid_student_username CHECK (
        role != 'client' OR (username = SPLIT_PART(email, '@', 1))
    ),
    CONSTRAINT valid_curp_format CHECK (
        curp ~ '^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$'
    ),
    CONSTRAINT valid_phone_format CHECK (
        phone ~ '^[0-9]{10}$'
    )
);

-- Tabla 2: CATEGORÍAS (independiente)
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- FK opcional para insignias (usuario -> categoría)
ALTER TABLE users
    ADD CONSTRAINT users_badge_category_fk
    FOREIGN KEY (badge_category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Tabla 3: LIBROS (independiente)
CREATE TABLE books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url TEXT,
    category VARCHAR(255) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla 4: POLÍTICAS DE BIBLIOTECA (independiente)
CREATE TABLE library_policies (
    id INTEGER PRIMARY KEY DEFAULT 1,
    max_loans INTEGER NOT NULL DEFAULT 3,
    grace_period INTEGER NOT NULL DEFAULT 7,
    loan_duration_options TEXT, -- JSON con opciones de duración
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 5: PRÉSTAMOS (depende de users y books)
CREATE TABLE checkouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'returned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla 6: SOLICITUDES DE PRÉSTAMO (depende de users y books)
CREATE TABLE checkout_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla 7: RESEÑAS (depende de users y books)
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla 8: ACTIVIDADES DE USUARIO (depende de users)
CREATE TABLE user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('book_checkout', 'book_return', 'book_review', 'user_follow', 'user_unfollow')),
    target_id UUID, -- Book ID para actividades de libros, User ID para actividades de seguimiento
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 9: FAVORITOS DE USUARIO (depende de users y books)
CREATE TABLE user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);

-- Tabla 10: SEGUIMIENTOS DE USUARIO (depende de users)
CREATE TABLE user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id) -- Un usuario no puede seguirse a sí mismo
);

-- ============ PASO 3: INSERTAR DATOS POR DEFECTO Y DE PRUEBA ============

-- Insertar políticas de biblioteca por defecto
INSERT INTO library_policies (id, max_loans, grace_period) 
VALUES (1, 3, 7) 
ON CONFLICT (id) DO NOTHING;

-- Insertar categorías de libros básicas
INSERT INTO categories (name) VALUES 
    ('Ficción'),
    ('No Ficción'),
    ('Ciencia'),
    ('Historia'),
    ('Biografía'),
    ('Tecnología'),
    ('Arte'),
    ('Filosofía'),
    ('Literatura Clásica'),
    ('Misterio y Suspense')
ON CONFLICT (name) DO NOTHING;

-- Insertar usuarios de prueba (UAT con validación de matrícula)
INSERT INTO users (username, password, role, name, curp, phone, email, address, bio) VALUES
    -- BIBLIOTECARIOS (pueden usar cualquier email, username = nombre completo)
    ('María García Bibliotecaria', 'admin123', 'librarian', 'María García Bibliotecaria', 'GARM850301MDFRNR02', '6441234567', 'maria.garcia@bibliotrackuat.com', 'Av. Universidad 123, Victoria, Tamaulipas', 'Administradora del sistema BiblioTrack'),
    ('José Luis Pérez Admin', 'bib123', 'librarian', 'José Luis Pérez Admin', 'PELJ800215HDFRSR03', '6449876543', 'jose.perez@bibliotrackuat.com', 'Calle Revolución 456, Victoria, Tamaulipas', 'Bibliotecario encargado del área de ficción'),
    
    -- ESTUDIANTES UAT (deben usar matrícula@alumnos.uat.edu.mx, username = matrícula)
    ('a2021040567', 'juan123', 'client', 'Juan Antonio Martínez', 'MAJJ990315HDFNTN01', '6441567890', 'a2021040567@alumnos.uat.edu.mx', 'Colonia Centro 789, Victoria, Tamaulipas', 'Estudiante de Ingeniería en Sistemas'),
    ('a2020035421', 'ana123', 'client', 'Ana Sofía Rodríguez López', 'ROLA950822MDFPNF04', '6442345678', 'a2020035421@alumnos.uat.edu.mx', 'Fracc. Las Flores 321, Victoria, Tamaulipas', 'Estudiante de Licenciatura en Literatura'),
    ('a2019028734', 'carlos123', 'client', 'Carlos Eduardo Mendoza', 'MENC970412HDFNDR05', '6443456789', 'a2019028734@alumnos.uat.edu.mx', 'Colonia Moderna 654, Victoria, Tamaulipas', 'Estudiante de Ingeniería Industrial, apasionado lector de ciencia ficción'),
    ('a2022051298', 'sofia123', 'client', 'Sofía Isabel González', 'GOIS010203MDFNXF06', '6444567890', 'a2022051298@alumnos.uat.edu.mx', 'Barrio El Rastro 987, Victoria, Tamaulipas', 'Estudiante de Historia, amante de biografías')
ON CONFLICT (username) DO NOTHING;

-- Insertar libros de muestra (usando las categorías creadas)
INSERT INTO books (title, author, description, category, stock, cover_url) VALUES
    ('Cien años de soledad', 'Gabriel García Márquez', 'Obra maestra del realismo mágico que narra la historia de la familia Buendía.', 'Literatura Clásica', 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
    ('1984', 'George Orwell', 'Una distopía que explora temas de totalitarismo y control social.', 'Ficción', 3, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'),
    ('Sapiens: De animales a dioses', 'Yuval Noah Harari', 'Una breve historia de la humanidad desde la prehistoria hasta la actualidad.', 'Historia', 4, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
    ('El origen de las especies', 'Charles Darwin', 'La teoría de la evolución que revolucionó la biología.', 'Ciencia', 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
    ('Steve Jobs', 'Walter Isaacson', 'La biografía definitiva del cofundador de Apple.', 'Biografía', 3, 'https://images.unsplash.com/photo-1529158062015-cad636e205a0?w=400'),
    ('Clean Code', 'Robert C. Martin', 'Principios y prácticas para escribir código limpio y mantenible.', 'Tecnología', 4, 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=400'),
    ('El arte de la guerra', 'Sun Tzu', 'Tratado militar chino sobre estrategia y táctica.', 'Filosofía', 6, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
    ('Sherlok Holmes: Estudio en escarlata', 'Arthur Conan Doyle', 'La primera aventura del famoso detective consultor.', 'Misterio y Suspense', 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
    ('La historia del arte', 'Ernst Gombrich', 'Una introducción accesible a la historia del arte occidental.', 'Arte', 2, 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'),
    ('El mundo de Sofía', 'Jostein Gaarder', 'Una novela que introduce los conceptos básicos de la filosofía.', 'Filosofía', 4, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
    ('Dune', 'Frank Herbert', 'Épica de ciencia ficción ambientada en un futuro lejano.', 'Ficción', 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
    ('Una breve historia del tiempo', 'Stephen Hawking', 'Explicación accesible de los conceptos fundamentales de la cosmología.', 'Ciencia', 3, 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400')
ON CONFLICT DO NOTHING;

-- Insertar algunas reseñas de ejemplo
DO $$
DECLARE 
    user_juan UUID;
    user_ana UUID;
    user_carlos UUID;
    book_1984 UUID;
    book_sapiens UUID;
    book_cien_anos UUID;
    book_jobs UUID;
BEGIN
    -- Obtener IDs de usuarios (usando nuevas matrículas UAT)
    SELECT id INTO user_juan FROM users WHERE username = 'a2021040567';
    SELECT id INTO user_ana FROM users WHERE username = 'a2020035421';  
    SELECT id INTO user_carlos FROM users WHERE username = 'a2019028734';
    
    -- Obtener IDs de libros
    SELECT id INTO book_1984 FROM books WHERE title = '1984';
    SELECT id INTO book_sapiens FROM books WHERE title = 'Sapiens: De animales a dioses';
    SELECT id INTO book_cien_anos FROM books WHERE title = 'Cien años de soledad';
    SELECT id INTO book_jobs FROM books WHERE title = 'Steve Jobs';
    
    -- Insertar reseñas
    INSERT INTO reviews (user_id, book_id, rating, comment, date) VALUES
        (user_juan, book_1984, 5, 'Una obra maestra que nos hace reflexionar sobre el poder y la libertad. Muy recomendado.', CURRENT_DATE - INTERVAL '10 days'),
        (user_ana, book_cien_anos, 5, 'García Márquez logra crear un universo único lleno de magia y realismo. Imprescindible.', CURRENT_DATE - INTERVAL '5 days'),
        (user_carlos, book_sapiens, 4, 'Harari presenta la historia humana de manera fascinante. Algunas ideas son controvertidas pero interesantes.', CURRENT_DATE - INTERVAL '3 days'),
        (user_juan, book_jobs, 4, 'Biografía completa y bien documentada. Jobs era realmente un visionario único.', CURRENT_DATE - INTERVAL '1 day');
        
    -- Crear algunas actividades de ejemplo
    INSERT INTO user_activities (user_id, activity_type, target_id, description) VALUES
        (user_juan, 'book_review', book_1984, 'Dejó una reseña de 5 estrellas para "1984"'),
        (user_ana, 'book_review', book_cien_anos, 'Dejó una reseña de 5 estrellas para "Cien años de soledad"'),
        (user_carlos, 'book_review', book_sapiens, 'Dejó una reseña de 4 estrellas para "Sapiens"'),
        (user_juan, 'book_review', book_jobs, 'Dejó una reseña de 4 estrellas para "Steve Jobs"');
        
    -- Crear algunos favoritos de ejemplo
    INSERT INTO user_favorites (user_id, book_id) VALUES
        (user_juan, book_1984),
        (user_juan, book_jobs),
        (user_ana, book_cien_anos),
        (user_ana, book_sapiens),
        (user_carlos, book_sapiens),
        (user_carlos, book_1984);
        
    -- Crear algunos seguimientos entre usuarios
    INSERT INTO user_follows (follower_id, following_id) VALUES
        (user_juan, user_ana),    -- Juan sigue a Ana
        (user_juan, user_carlos), -- Juan sigue a Carlos
        (user_ana, user_carlos),  -- Ana sigue a Carlos
        (user_carlos, user_ana);  -- Carlos sigue a Ana
        
    -- Crear actividades de seguimiento
    INSERT INTO user_activities (user_id, activity_type, target_id, description) VALUES
        (user_juan, 'user_follow', user_ana, 'Comenzó a seguir a Ana Sofía Rodríguez López'),
        (user_juan, 'user_follow', user_carlos, 'Comenzó a seguir a Carlos Eduardo Mendoza'),
        (user_ana, 'user_follow', user_carlos, 'Comenzó a seguir a Carlos Eduardo Mendoza'),
        (user_carlos, 'user_follow', user_ana, 'Comenzó a seguir a Ana Sofía Rodríguez López');

EXCEPTION
    WHEN OTHERS THEN
        -- Si algo falla, continuar sin errores
        RAISE NOTICE 'Error insertando datos de ejemplo: %', SQLERRM;
END $$;

-- ============ PASO 4: CREAR ÍNDICES PARA MEJOR RENDIMIENTO ============

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Índices para libros
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);

-- Índices para préstamos
CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_book_id ON checkouts(book_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON checkouts(status);
CREATE INDEX IF NOT EXISTS idx_checkouts_due_date ON checkouts(due_date);

-- Índices para solicitudes de préstamo
CREATE INDEX IF NOT EXISTS idx_checkout_requests_user_id ON checkout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_requests_book_id ON checkout_requests(book_id);
CREATE INDEX IF NOT EXISTS idx_checkout_requests_status ON checkout_requests(status);

-- Índices para reseñas
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Índices para actividades de usuario
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_book_id ON user_favorites(book_id);

-- Índices para seguimientos
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- ============ PASO 5: HABILITAR ROW LEVEL SECURITY (RLS) ============

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- ============ PASO 6: CREAR POLÍTICAS RLS (ACCESO COMPLETO POR AHORA) ============

-- Políticas para USUARIOS
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (true);
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (true);

-- Políticas para CATEGORÍAS
CREATE POLICY "categories_select_policy" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_policy" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "categories_update_policy" ON categories FOR UPDATE USING (true);
CREATE POLICY "categories_delete_policy" ON categories FOR DELETE USING (true);

-- Políticas para LIBROS
CREATE POLICY "books_select_policy" ON books FOR SELECT USING (true);
CREATE POLICY "books_insert_policy" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "books_update_policy" ON books FOR UPDATE USING (true);
CREATE POLICY "books_delete_policy" ON books FOR DELETE USING (true);

-- Políticas para POLÍTICAS DE BIBLIOTECA
CREATE POLICY "policies_select_policy" ON library_policies FOR SELECT USING (true);
CREATE POLICY "policies_insert_policy" ON library_policies FOR INSERT WITH CHECK (true);
CREATE POLICY "policies_update_policy" ON library_policies FOR UPDATE USING (true);
CREATE POLICY "policies_delete_policy" ON library_policies FOR DELETE USING (true);

-- Políticas para PRÉSTAMOS
CREATE POLICY "checkouts_select_policy" ON checkouts FOR SELECT USING (true);
CREATE POLICY "checkouts_insert_policy" ON checkouts FOR INSERT WITH CHECK (true);
CREATE POLICY "checkouts_update_policy" ON checkouts FOR UPDATE USING (true);
CREATE POLICY "checkouts_delete_policy" ON checkouts FOR DELETE USING (true);

-- Políticas para SOLICITUDES DE PRÉSTAMO
CREATE POLICY "checkout_requests_select_policy" ON checkout_requests FOR SELECT USING (true);
CREATE POLICY "checkout_requests_insert_policy" ON checkout_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "checkout_requests_update_policy" ON checkout_requests FOR UPDATE USING (true);
CREATE POLICY "checkout_requests_delete_policy" ON checkout_requests FOR DELETE USING (true);

-- Políticas para RESEÑAS
CREATE POLICY "reviews_select_policy" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_policy" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_update_policy" ON reviews FOR UPDATE USING (true);
CREATE POLICY "reviews_delete_policy" ON reviews FOR DELETE USING (true);

-- Políticas para ACTIVIDADES DE USUARIO
CREATE POLICY "activities_select_policy" ON user_activities FOR SELECT USING (true);
CREATE POLICY "activities_insert_policy" ON user_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "activities_update_policy" ON user_activities FOR UPDATE USING (true);
CREATE POLICY "activities_delete_policy" ON user_activities FOR DELETE USING (true);

-- Políticas para FAVORITOS DE USUARIO
CREATE POLICY "favorites_select_policy" ON user_favorites FOR SELECT USING (true);
CREATE POLICY "favorites_insert_policy" ON user_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "favorites_update_policy" ON user_favorites FOR UPDATE USING (true);
CREATE POLICY "favorites_delete_policy" ON user_favorites FOR DELETE USING (true);

-- Políticas para SEGUIMIENTOS DE USUARIO
CREATE POLICY "follows_select_policy" ON user_follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_policy" ON user_follows FOR INSERT WITH CHECK (true);
CREATE POLICY "follows_update_policy" ON user_follows FOR UPDATE USING (true);
CREATE POLICY "follows_delete_policy" ON user_follows FOR DELETE USING (true);

-- ============ PASO 7: FUNCIONES DE UTILIDAD UAT ============

-- Función para extraer matrícula de email UAT
CREATE OR REPLACE FUNCTION extract_matricula_from_email(email_input TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Si el email termina en @alumnos.uat.edu.mx, extraer la parte antes del @
    IF email_input LIKE '%@alumnos.uat.edu.mx' THEN
        RETURN SPLIT_PART(email_input, '@', 1);
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para validar formato de email UAT
CREATE OR REPLACE FUNCTION is_valid_uat_email(email_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar que el email termine en @alumnos.uat.edu.mx
    -- y que la parte antes del @ tenga formato de matrícula (ej: a1234567890)
    RETURN email_input ~ '^[a-zA-Z][0-9]{10}@alumnos\.uat\.edu\.mx$';
END;
$$ LANGUAGE plpgsql;

-- Función para validar que username coincida con matrícula
CREATE OR REPLACE FUNCTION validate_student_username(username_input TEXT, email_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Para estudiantes, el username debe ser igual a la matrícula extraída del email
    RETURN username_input = extract_matricula_from_email(email_input);
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- ¡SCRIPT COMPLETO Y FUNCIONAL! 
-- ===================================================================
-- Este script incluye:
-- ✅ 10 tablas principales con todas las relaciones
-- ✅ Sistema de usuarios completo con perfiles
-- ✅ Sistema de libros y categorías  
-- ✅ Sistema de préstamos y solicitudes
-- ✅ Sistema de reseñas
-- ✅ Sistema de actividades de usuario
-- ✅ Sistema de favoritos
-- ✅ Sistema de seguimientos entre usuarios
-- ✅ Políticas de biblioteca configurables
-- ✅ Índices optimizados para rendimiento
-- ✅ Row Level Security habilitado
-- ✅ Datos de prueba completos (usuarios, libros, reseñas, etc.)
-- ✅ Manejo de errores robusto
-- 
-- DATOS INCLUIDOS PARA PROBAR:
-- 👤 6 usuarios (2 bibliotecarios, 4 clientes)
-- 📚 12 libros de diferentes categorías
-- ⭐ 4 reseñas de ejemplo
-- ❤️ 6 libros favoritos
-- 👥 4 relaciones de seguimiento
-- 📝 8 actividades registradas
-- 
-- CREDENCIALES PARA PROBAR (SISTEMA UAT):
-- Bibliotecarios (login con nombre completo):
--   María García Bibliotecaria / admin123
--   José Luis Pérez Admin / bib123
-- 
-- Estudiantes UAT (login con matrícula): 
--   a2021040567 / juan123 (Juan Antonio Martínez - Ing. Sistemas)
--   a2020035421 / ana123 (Ana Sofía Rodríguez López - Lic. Literatura)
--   a2019028734 / carlos123 (Carlos Eduardo Mendoza - Ing. Industrial)
--   a2022051298 / sofia123 (Sofía Isabel González - Historia)
-- 
-- PARA USAR:
-- 1. Copia TODO este archivo
-- 2. Pega en SQL Editor de Supabase
-- 3. Ejecuta
-- 4. ¡Tu base de datos estará completa con datos de prueba!
-- ===================================================================