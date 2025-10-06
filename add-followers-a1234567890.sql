-- Script para agregar seguidores al usuario a1234567890
-- Esto permitirá probar la funcionalidad de seguidores

-- Primero, obtener el ID del usuario a1234567890
-- Luego, agregar algunas relaciones de seguimiento

-- Agregar seguimientos donde a1234567890 es seguido por otros usuarios
INSERT INTO user_follows (follower_id, following_id) 
SELECT 
    u1.id as follower_id,
    u2.id as following_id
FROM users u1, users u2 
WHERE u1.username IN ('a2021040567', 'a2020035421') -- Juan y Ana siguen a a1234567890
  AND u2.username = 'a1234567890'
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Agregar seguimientos donde a1234567890 sigue a otros usuarios
INSERT INTO user_follows (follower_id, following_id) 
SELECT 
    u1.id as follower_id,
    u2.id as following_id
FROM users u1, users u2 
WHERE u1.username = 'a1234567890'
  AND u2.username IN ('a2019028734') -- a1234567890 sigue a Carlos
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Agregar actividades correspondientes
INSERT INTO user_activities (user_id, activity_type, target_id, description) 
SELECT 
    u1.id as user_id,
    'user_follow' as activity_type,
    u2.id as target_id,
    CONCAT('Comenzó a seguir a ', u2.name) as description
FROM users u1, users u2 
WHERE u1.username IN ('a2021040567', 'a2020035421')
  AND u2.username = 'a1234567890'
ON CONFLICT DO NOTHING;

INSERT INTO user_activities (user_id, activity_type, target_id, description) 
SELECT 
    u1.id as user_id,
    'user_follow' as activity_type,
    u2.id as target_id,
    CONCAT('Comenzó a seguir a ', u2.name) as description
FROM users u1, users u2 
WHERE u1.username = 'a1234567890'
  AND u2.username IN ('a2019028734')
ON CONFLICT DO NOTHING;