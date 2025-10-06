-- ===================================================================
-- AGREGAR CAMPO BOOKS_READ PARA CONTADOR DE LIBROS LEÍDOS
-- BiblioTrack - Sistema UAT
-- ===================================================================
-- Este script agrega el campo books_read a la tabla users
-- para llevar el contador de libros leídos por cada usuario
-- ===================================================================

-- Agregar columna books_read a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS books_read INTEGER DEFAULT 0;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN users.books_read IS 'Contador de libros leídos por el usuario (se incrementa al devolver un libro)';

-- Verificar que se agregó correctamente
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'books_read';