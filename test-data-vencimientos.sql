-- ===================================================================
-- DATOS DE PRUEBA PARA FUNCIONALIDADES DE VENCIMIENTOS Y SUSPENSIONES
-- BiblioTrack - Sistema UAT
-- ===================================================================
-- PROPÓSITO: Crear escenarios para probar:
-- 1. Préstamos vencidos (diferentes niveles)
-- 2. Usuarios suspendidos por vencimientos
-- 3. Solicitudes pendientes
-- 4. Usuarios con múltiples infracciones
-- 5. Casos límite de reactivación
-- ===================================================================

-- INSTRUCCIONES:
-- 1. Asegúrate de que tu esquema principal ya esté instalado
-- 2. Ejecuta este archivo DESPUÉS del schema principal
-- 3. Este archivo agrega usuarios de prueba específicos para testing

-- ============ USUARIOS DE PRUEBA PARA VENCIMIENTOS ============

-- Insertar usuarios específicos para testing de vencimientos
INSERT INTO users (username, password, role, name, curp, phone, email, address, bio, status) VALUES
    -- Usuario con préstamos muy vencidos (más de 30 días) - SUSPENDIDO
    ('a2020011111', 'moroso123', 'client', 'Roberto Moroso Vencido', 'MORR850101HDFRSB01', '6441111111', 'a2020011111@alumnos.uat.edu.mx', 'Calle Vencimiento 123, Victoria, Tam', 'Usuario con múltiples préstamos vencidos', 'deactivated'),
    
    -- Usuario con préstamos recién vencidos (7-15 días)
    ('a2021022222', 'recien123', 'client', 'María Recién Vencida', 'RECV900202MDFRSM02', '6442222222', 'a2021022222@alumnos.uat.edu.mx', 'Av. Atraso 456, Victoria, Tam', 'Usuario con préstamos recién vencidos', 'active'),
    
    -- Usuario con préstamos moderadamente vencidos (15-30 días)
    ('a2019033333', 'moderado123', 'client', 'Luis Moderado Atraso', 'MOAL750303HDFSLR03', '6443333333', 'a2019033333@alumnos.uat.edu.mx', 'Colonia Tardanza 789, Victoria, Tam', 'Usuario con atrasos moderados', 'active'),
    
    -- Usuario con máximo de préstamos permitidos
    ('a2022044444', 'maximo123', 'client', 'Sandra Máximo Préstamos', 'MAXS980404MDFNDR04', '6444444444', 'a2022044444@alumnos.uat.edu.mx', 'Fracc. Límite 321, Victoria, Tam', 'Usuario con máximo de préstamos', 'active'),
    
    -- Usuario con solicitudes pendientes acumuladas
    ('a2020055555', 'pendiente123', 'client', 'Pedro Pendiente Solicitudes', 'PENS870505HDFNDR05', '6445555555', 'a2020055555@alumnos.uat.edu.mx', 'Barrio Espera 654, Victoria, Tam', 'Usuario con muchas solicitudes pendientes', 'active'),
    
    -- Usuario casi suspendido (en período de gracia)
    ('a2021066666', 'gracia123', 'client', 'Ana Período Gracia', 'PEGR920606MDFNDR06', '6446666666', 'a2021066666@alumnos.uat.edu.mx', 'Calle Gracia 987, Victoria, Tam', 'Usuario en período de gracia', 'active'),
    
    -- Usuario reactivado recientemente
    ('a2019077777', 'reactivo123', 'client', 'Carlos Reactivado Reciente', 'REAC800707HDFNDR07', '6447777777', 'a2019077777@alumnos.uat.edu.mx', 'Av. Segunda Oportunidad 147, Victoria, Tam', 'Usuario recientemente reactivado', 'active'),
    
    -- Usuario ejemplar (para contraste)
    ('a2022088888', 'ejemplar123', 'client', 'Sofía Ejemplar Puntual', 'EJES950808MDFNDR08', '6448888888', 'a2022088888@alumnos.uat.edu.mx', 'Fracc. Responsable 258, Victoria, Tam', 'Usuario ejemplar y puntual', 'active'),
    
    -- Usuario con historial mixto
    ('a2020099999', 'mixto123', 'client', 'Miguel Historial Mixto', 'HISM860909HDFNDR09', '6449999999', 'a2020099999@alumnos.uat.edu.mx', 'Colonia Variable 369, Victoria, Tam', 'Usuario con historial mixto de préstamos', 'active')
ON CONFLICT (username) DO NOTHING;

-- ============ LIBROS ADICIONALES PARA TESTING ============

INSERT INTO books (title, author, description, category, stock, cover_url) VALUES
    ('Manual de Procesos Bibliotecarios', 'Editorial UAT', 'Guía oficial para procedimientos de biblioteca', 'No Ficción', 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
    ('Reglamento Estudiantil UAT', 'Universidad Autónoma de Tamaulipas', 'Normativas y reglamentos para estudiantes', 'No Ficción', 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
    ('Programación Avanzada en Java', 'Dr. Sistemas UAT', 'Conceptos avanzados de programación orientada a objetos', 'Tecnología', 1, 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=400'),
    ('Historia de Tamaulipas', 'Cronistas Locales', 'Historia completa del estado de Tamaulipas', 'Historia', 2, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
    ('Metodología de la Investigación', 'Investigadores UAT', 'Métodos y técnicas de investigación científica', 'No Ficción', 4, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400')
ON CONFLICT DO NOTHING;

-- ============ PRÉSTAMOS VENCIDOS DE DIFERENTES TIPOS ============

DO $$
DECLARE 
    -- IDs de usuarios de prueba
    user_moroso UUID;
    user_recien UUID;
    user_moderado UUID;
    user_maximo UUID;
    user_gracia UUID;
    user_reactivado UUID;
    user_mixto UUID;
    
    -- IDs de libros existentes (obtenemos algunos)
    book_1984 UUID;
    book_sapiens UUID;
    book_cien_anos UUID;
    book_java UUID;
    book_historia UUID;
    book_metodologia UUID;
    
BEGIN
    -- Obtener IDs de usuarios de prueba
    SELECT id INTO user_moroso FROM users WHERE username = 'a2020011111';
    SELECT id INTO user_recien FROM users WHERE username = 'a2021022222';
    SELECT id INTO user_moderado FROM users WHERE username = 'a2019033333';
    SELECT id INTO user_maximo FROM users WHERE username = 'a2022044444';
    SELECT id INTO user_gracia FROM users WHERE username = 'a2021066666';
    SELECT id INTO user_reactivado FROM users WHERE username = 'a2019077777';
    SELECT id INTO user_mixto FROM users WHERE username = 'a2020099999';
    
    -- Obtener IDs de libros
    SELECT id INTO book_1984 FROM books WHERE title = '1984' LIMIT 1;
    SELECT id INTO book_sapiens FROM books WHERE title LIKE '%Sapiens%' LIMIT 1;
    SELECT id INTO book_cien_anos FROM books WHERE title LIKE '%Cien años%' LIMIT 1;
    SELECT id INTO book_java FROM books WHERE title LIKE '%Java%' LIMIT 1;
    SELECT id INTO book_historia FROM books WHERE title LIKE '%Historia de Tamaulipas%' LIMIT 1;
    SELECT id INTO book_metodologia FROM books WHERE title LIKE '%Metodología%' LIMIT 1;
    
    -- ========== PRÉSTAMOS MUY VENCIDOS (Usuario Moroso - MÁS DE 30 DÍAS) ==========
    INSERT INTO checkouts (user_id, book_id, due_date, status, created_at) VALUES
        -- Préstamo vencido hace 45 días
        (user_moroso, book_1984, CURRENT_DATE - INTERVAL '45 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '60 days'),
        -- Préstamo vencido hace 35 días
        (user_moroso, book_sapiens, CURRENT_DATE - INTERVAL '35 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '50 days'),
        -- Préstamo vencido hace 32 días
        (user_moroso, book_cien_anos, CURRENT_DATE - INTERVAL '32 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '47 days');
    
    -- ========== PRÉSTAMOS RECIÉN VENCIDOS (7-15 DÍAS) ==========
    INSERT INTO checkouts (user_id, book_id, due_date, status, created_at) VALUES
        -- Préstamo vencido hace 10 días
        (user_recien, book_java, CURRENT_DATE - INTERVAL '10 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '25 days'),
        -- Préstamo vencido hace 8 días
        (user_recien, book_historia, CURRENT_DATE - INTERVAL '8 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '23 days');
    
    -- ========== PRÉSTAMOS MODERADAMENTE VENCIDOS (15-30 DÍAS) ==========
    INSERT INTO checkouts (user_id, book_id, due_date, status, created_at) VALUES
        -- Préstamo vencido hace 22 días
        (user_moderado, book_metodologia, CURRENT_DATE - INTERVAL '22 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '37 days'),
        -- Préstamo vencido hace 18 días
        (user_moderado, book_1984, CURRENT_DATE - INTERVAL '18 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '33 days');
    
    -- ========== USUARIO CON MÁXIMO DE PRÉSTAMOS (3 ACTIVOS) ==========
    INSERT INTO checkouts (user_id, book_id, due_date, status, created_at) VALUES
        -- 3 préstamos activos con diferentes fechas de vencimiento
        (user_maximo, book_sapiens, CURRENT_DATE + INTERVAL '5 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '10 days'),
        (user_maximo, book_cien_anos, CURRENT_DATE + INTERVAL '12 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '3 days'),
        (user_maximo, book_java, CURRENT_DATE + INTERVAL '8 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '7 days');
    
    -- ========== USUARIO EN PERÍODO DE GRACIA (VENCIDO HACE 3-6 DÍAS) ==========
    INSERT INTO checkouts (user_id, book_id, due_date, status, created_at) VALUES
        -- Préstamo vencido hace 5 días (dentro del período de gracia de 7 días)
        (user_gracia, book_historia, CURRENT_DATE - INTERVAL '5 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '20 days'),
        -- Préstamo que vence mañana
        (user_gracia, book_metodologia, CURRENT_DATE + INTERVAL '1 day', 'approved', CURRENT_TIMESTAMP - INTERVAL '14 days');
    
    -- ========== USUARIO REACTIVADO (HISTORIAL DE PROBLEMAS RESUELTOS) ==========
    INSERT INTO checkouts (user_id, book_id, due_date, status, created_at) VALUES
        -- Préstamos antiguos devueltos (para mostrar historial)
        (user_reactivado, book_1984, CURRENT_DATE - INTERVAL '60 days', 'returned', CURRENT_TIMESTAMP - INTERVAL '90 days'),
        (user_reactivado, book_sapiens, CURRENT_DATE - INTERVAL '50 days', 'returned', CURRENT_TIMESTAMP - INTERVAL '80 days'),
        -- Préstamo actual en buen estado
        (user_reactivado, book_cien_anos, CURRENT_DATE + INTERVAL '10 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '5 days');
    
    -- ========== USUARIO CON HISTORIAL MIXTO ==========
    INSERT INTO checkouts (user_id, book_id, due_date, status, created_at) VALUES
        -- Algunos devueltos a tiempo
        (user_mixto, book_java, CURRENT_DATE - INTERVAL '30 days', 'returned', CURRENT_TIMESTAMP - INTERVAL '45 days'),
        -- Algunos devueltos tarde
        (user_mixto, book_historia, CURRENT_DATE - INTERVAL '40 days', 'returned', CURRENT_TIMESTAMP - INTERVAL '35 days'),
        -- Uno actualmente vencido hace 12 días
        (user_mixto, book_metodologia, CURRENT_DATE - INTERVAL '12 days', 'approved', CURRENT_TIMESTAMP - INTERVAL '27 days');
    
END $$;

-- ============ SOLICITUDES PENDIENTES ACUMULADAS ============

DO $$
DECLARE 
    user_pendiente UUID;
    user_maximo UUID;
    book_1984 UUID;
    book_sapiens UUID;
    book_cien_anos UUID;
    book_java UUID;
    book_historia UUID;
BEGIN
    -- Obtener IDs
    SELECT id INTO user_pendiente FROM users WHERE username = 'a2020055555';
    SELECT id INTO user_maximo FROM users WHERE username = 'a2022044444';
    SELECT id INTO book_1984 FROM books WHERE title = '1984' LIMIT 1;
    SELECT id INTO book_sapiens FROM books WHERE title LIKE '%Sapiens%' LIMIT 1;
    SELECT id INTO book_cien_anos FROM books WHERE title LIKE '%Cien años%' LIMIT 1;
    SELECT id INTO book_java FROM books WHERE title LIKE '%Java%' LIMIT 1;
    SELECT id INTO book_historia FROM books WHERE title LIKE '%Historia de Tamaulipas%' LIMIT 1;
    
    -- ========== SOLICITUDES PENDIENTES MÚLTIPLES ==========
    INSERT INTO checkout_requests (user_id, book_id, due_date, status, created_at) VALUES
        -- Solicitudes de hace varios días (sin aprobar)
        (user_pendiente, book_1984, CURRENT_DATE + INTERVAL '15 days', 'pending', CURRENT_TIMESTAMP - INTERVAL '5 days'),
        (user_pendiente, book_sapiens, CURRENT_DATE + INTERVAL '15 days', 'pending', CURRENT_TIMESTAMP - INTERVAL '3 days'),
        (user_pendiente, book_cien_anos, CURRENT_DATE + INTERVAL '15 days', 'pending', CURRENT_TIMESTAMP - INTERVAL '2 days'),
        (user_pendiente, book_java, CURRENT_DATE + INTERVAL '15 days', 'pending', CURRENT_TIMESTAMP - INTERVAL '1 day');
    
    -- ========== SOLICITUDES DE USUARIO CON MÁXIMO PRÉSTAMOS ==========
    -- Este usuario no debería poder hacer más solicitudes
    INSERT INTO checkout_requests (user_id, book_id, due_date, status, created_at) VALUES
        (user_maximo, book_historia, CURRENT_DATE + INTERVAL '15 days', 'pending', CURRENT_TIMESTAMP - INTERVAL '1 day');
    
END $$;

-- ============ RESEÑAS DE USUARIOS DE PRUEBA ============

DO $$
DECLARE 
    user_ejemplar UUID;
    user_reactivado UUID;
    user_mixto UUID;
    book_1984 UUID;
    book_sapiens UUID;
BEGIN
    SELECT id INTO user_ejemplar FROM users WHERE username = 'a2022088888';
    SELECT id INTO user_reactivado FROM users WHERE username = 'a2019077777';
    SELECT id INTO user_mixto FROM users WHERE username = 'a2020099999';
    SELECT id INTO book_1984 FROM books WHERE title = '1984' LIMIT 1;
    SELECT id INTO book_sapiens FROM books WHERE title LIKE '%Sapiens%' LIMIT 1;
    
    -- Reseñas de usuarios con diferentes perfiles
    INSERT INTO reviews (user_id, book_id, rating, comment, date) VALUES
        (user_ejemplar, book_1984, 5, 'Excelente libro, muy recomendado. Lo devolví a tiempo y me encantó.', CURRENT_DATE - INTERVAL '10 days'),
        (user_reactivado, book_sapiens, 4, 'Buen libro, aprendí mucho. Ahora soy más responsable con las fechas.', CURRENT_DATE - INTERVAL '15 days'),
        (user_mixto, book_1984, 3, 'Interesante pero un poco denso. Se me pasó la fecha de entrega.', CURRENT_DATE - INTERVAL '20 days');
    
END $$;

-- ============ ACTIVIDADES DE USUARIO PARA HISTORIAL ============

DO $$
DECLARE 
    user_moroso UUID;
    user_ejemplar UUID;
    user_reactivado UUID;
    book_1984 UUID;
    book_sapiens UUID;
BEGIN
    SELECT id INTO user_moroso FROM users WHERE username = 'a2020011111';
    SELECT id INTO user_ejemplar FROM users WHERE username = 'a2022088888';
    SELECT id INTO user_reactivado FROM users WHERE username = 'a2019077777';
    SELECT id INTO book_1984 FROM books WHERE title = '1984' LIMIT 1;
    SELECT id INTO book_sapiens FROM books WHERE title LIKE '%Sapiens%' LIMIT 1;
    
    -- Actividades de diferentes tipos de usuarios
    INSERT INTO user_activities (user_id, activity_type, target_id, description, created_at) VALUES
        -- Usuario ejemplar
        (user_ejemplar, 'book_checkout', book_1984, 'Préstamo de libro aprobado', CURRENT_TIMESTAMP - INTERVAL '10 days'),
        (user_ejemplar, 'book_return', book_1984, 'Libro devuelto a tiempo', CURRENT_TIMESTAMP - INTERVAL '2 days'),
        (user_ejemplar, 'book_review', book_1984, 'Reseña publicada: 5 estrellas', CURRENT_TIMESTAMP - INTERVAL '1 day'),
        
        -- Usuario reactivado
        (user_reactivado, 'book_checkout', book_sapiens, 'Primer préstamo después de reactivación', CURRENT_TIMESTAMP - INTERVAL '5 days'),
        
        -- Usuario moroso (actividades antiguas)
        (user_moroso, 'book_checkout', book_1984, 'Préstamo aprobado (ahora vencido)', CURRENT_TIMESTAMP - INTERVAL '60 days'),
        (user_moroso, 'book_checkout', book_sapiens, 'Préstamo aprobado (ahora vencido)', CURRENT_TIMESTAMP - INTERVAL '50 days');
    
END $$;

-- ============ RESUMEN DE DATOS CREADOS ============

-- Verificar los datos creados
SELECT 
    'USUARIOS DE PRUEBA CREADOS' as tipo,
    COUNT(*) as cantidad
FROM users 
WHERE username LIKE 'a202%' AND username != 'a2021040567' AND username != 'a2020035421' 
    AND username != 'a2019028734' AND username != 'a2022051298'

UNION ALL

SELECT 
    'PRÉSTAMOS VENCIDOS CREADOS' as tipo,
    COUNT(*) as cantidad
FROM checkouts 
WHERE due_date < CURRENT_DATE AND status = 'approved'

UNION ALL

SELECT 
    'SOLICITUDES PENDIENTES CREADAS' as tipo,
    COUNT(*) as cantidad
FROM checkout_requests 
WHERE status = 'pending'

UNION ALL

SELECT 
    'USUARIOS SUSPENDIDOS' as tipo,
    COUNT(*) as cantidad
FROM users 
WHERE status = 'deactivated';

-- ============ INSTRUCCIONES DE USO ============

/*
ESCENARIOS DE PRUEBA CREADOS:

1. USUARIO MOROSO (a2020011111 / moroso123):
   - Status: SUSPENDIDO (deactivated)
   - 3 préstamos vencidos hace más de 30 días
   - Debería aparecer en lista de usuarios suspendidos

2. USUARIO RECIÉN VENCIDO (a2021022222 / recien123):
   - 2 préstamos vencidos hace 8-10 días
   - Debería recibir notificaciones de primer nivel

3. USUARIO MODERADAMENTE VENCIDO (a2019033333 / moderado123):
   - 2 préstamos vencidos hace 18-22 días
   - Candidato a suspensión temporal

4. USUARIO CON MÁXIMO PRÉSTAMOS (a2022044444 / maximo123):
   - 3 préstamos activos (máximo permitido)
   - No debería poder solicitar más libros

5. USUARIO CON SOLICITUDES PENDIENTES (a2020055555 / pendiente123):
   - 4 solicitudes pendientes sin aprobar
   - Para probar gestión de solicitudes acumuladas

6. USUARIO EN PERÍODO DE GRACIA (a2021066666 / gracia123):
   - 1 préstamo vencido hace 5 días (dentro de gracia de 7 días)
   - 1 préstamo que vence mañana

7. USUARIO REACTIVADO (a2019077777 / reactivo123):
   - Historial de préstamos devueltos tarde
   - 1 préstamo actual en buen estado
   - Para probar funcionalidad de segunda oportunidad

8. USUARIO EJEMPLAR (a2022088888 / ejemplar123):
   - Sin infracciones
   - Para comparación y contraste

9. USUARIO HISTORIAL MIXTO (a2020099999 / mixto123):
   - Algunos préstamos a tiempo, otros tarde
   - 1 préstamo actualmente vencido hace 12 días

PARA PROBAR:
- Login con cada tipo de usuario
- Verificar restricciones según estado
- Probar notificaciones de vencimiento
- Gestión de suspensiones y reactivaciones
- Límites de préstamos simultáneos
*/