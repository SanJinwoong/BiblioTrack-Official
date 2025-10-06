-- Script para verificar los seguidores de a1234567890
-- Ejecutar en la consola SQL de Supabase para debug

-- 1. Verificar si el usuario a1234567890 existe
SELECT id, username, name FROM users WHERE username = 'a1234567890';

-- 2. Verificar todos los registros en user_follows
SELECT 
    uf.*,
    u1.username as follower_username,
    u1.name as follower_name,
    u2.username as following_username,
    u2.name as following_name
FROM user_follows uf
JOIN users u1 ON uf.follower_id = u1.id
JOIN users u2 ON uf.following_id = u2.id
ORDER BY uf.created_at DESC;

-- 3. Verificar específicamente los seguidores de a1234567890
SELECT 
    uf.*,
    u1.username as follower_username,
    u1.name as follower_name
FROM user_follows uf
JOIN users u1 ON uf.follower_id = u1.id
JOIN users u2 ON uf.following_id = u2.id
WHERE u2.username = 'a1234567890';

-- 4. Contar seguidores de a1234567890
SELECT COUNT(*) as total_followers
FROM user_follows uf
JOIN users u2 ON uf.following_id = u2.id
WHERE u2.username = 'a1234567890';