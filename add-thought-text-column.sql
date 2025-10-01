-- Script para agregar la columna thought_text a la tabla users existente
-- Este script debe ejecutarse en la base de datos de Supabase

ALTER TABLE users ADD COLUMN IF NOT EXISTS thought_text TEXT;

-- Comentario sobre el campo
COMMENT ON COLUMN users.thought_text IS 'Pensamiento o nota personal del usuario que aparece en su perfil';

-- Agregar algunos pensamientos de ejemplo para usuarios existentes (opcional)
UPDATE users SET thought_text = 'Amante de los clásicos ✨' WHERE username = 'a1234567890';
UPDATE users SET thought_text = 'Siempre leyendo algo nuevo 📚' WHERE username = 'a0987654321';
UPDATE users SET thought_text = 'La ciencia ficción es vida 🚀' WHERE username = 'a2345678901';