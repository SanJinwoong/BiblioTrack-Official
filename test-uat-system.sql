-- ===================================================================
-- PRUEBA DEL SISTEMA UAT - BiblioTrack
-- ===================================================================
-- Este script prueba que el sistema de matrícula UAT funciona correctamente

-- PRUEBA 1: Intentar crear un estudiante con email correcto
DO $$
BEGIN
    INSERT INTO users (username, password, role, name, curp, phone, email, address, bio) VALUES
        ('a2023099999', 'test123', 'client', 'Estudiante Prueba', 'PRUT010101HDFRTS01', '6441111111', 'a2023099999@alumnos.uat.edu.mx', 'Dirección prueba', 'Estudiante de prueba');
    
    RAISE NOTICE 'PRUEBA 1 ✅: Estudiante UAT creado correctamente';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'PRUEBA 1 ❌: Error al crear estudiante UAT: %', SQLERRM;
END $$;

-- PRUEBA 2: Intentar crear un bibliotecario
DO $$
BEGIN
    INSERT INTO users (username, password, role, name, curp, phone, email, address, bio) VALUES
        ('Bibliotecario Prueba', 'test123', 'librarian', 'Bibliotecario Prueba', 'BIBT010101HDFRTS01', '6442222222', 'prueba@biblioteca.com', 'Dirección prueba', 'Bibliotecario de prueba');
    
    RAISE NOTICE 'PRUEBA 2 ✅: Bibliotecario creado correctamente';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'PRUEBA 2 ❌: Error al crear bibliotecario: %', SQLERRM;
END $$;

-- PRUEBA 3: Intentar crear estudiante con email incorrecto (debería fallar)
DO $$
BEGIN
    INSERT INTO users (username, password, role, name, curp, phone, email, address, bio) VALUES
        ('a2023088888', 'test123', 'client', 'Estudiante Error', 'ERRT010101HDFRTS01', '6443333333', 'estudiante@gmail.com', 'Dirección prueba', 'Esto debería fallar');
    
    RAISE NOTICE 'PRUEBA 3 ❌: Estudiante con email incorrecto fue creado (ERROR DEL SISTEMA)';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'PRUEBA 3 ✅: Sistema bloqueó correctamente estudiante con email incorrecto: %', SQLERRM;
END $$;

-- PRUEBA 4: Intentar crear estudiante con username incorrecto (debería fallar)
DO $$
BEGIN
    INSERT INTO users (username, password, role, name, curp, phone, email, address, bio) VALUES
        ('nombre_incorrecto', 'test123', 'client', 'Estudiante Error 2', 'ERR2010101HDFRTS01', '6444444444', 'a2023077777@alumnos.uat.edu.mx', 'Dirección prueba', 'Username no coincide con matrícula');
    
    RAISE NOTICE 'PRUEBA 4 ❌: Estudiante con username incorrecto fue creado (ERROR DEL SISTEMA)';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'PRUEBA 4 ✅: Sistema bloqueó correctamente estudiante con username incorrecto: %', SQLERRM;
END $$;

-- PRUEBA 5: Verificar que los usuarios de muestra existen
DO $$
DECLARE
    estudiante_count INTEGER;
    bibliotecario_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO estudiante_count FROM users WHERE role = 'client';
    SELECT COUNT(*) INTO bibliotecario_count FROM users WHERE role = 'librarian';
    
    RAISE NOTICE 'PRUEBA 5: Estudiantes en sistema: %, Bibliotecarios en sistema: %', estudiante_count, bibliotecario_count;
    
    IF estudiante_count >= 4 AND bibliotecario_count >= 2 THEN
        RAISE NOTICE 'PRUEBA 5 ✅: Datos de muestra cargados correctamente';
    ELSE
        RAISE NOTICE 'PRUEBA 5 ❌: Faltan datos de muestra';
    END IF;
END $$;

-- PRUEBA 6: Verificar emails de estudiantes siguen formato UAT
DO $$
DECLARE
    invalid_emails INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_emails 
    FROM users 
    WHERE role = 'client' 
    AND email NOT LIKE '%@alumnos.uat.edu.mx';
    
    IF invalid_emails = 0 THEN
        RAISE NOTICE 'PRUEBA 6 ✅: Todos los estudiantes tienen email UAT válido';
    ELSE
        RAISE NOTICE 'PRUEBA 6 ❌: % estudiantes tienen email no válido', invalid_emails;
    END IF;
END $$;

-- LIMPIAR USUARIOS DE PRUEBA
DELETE FROM users WHERE username IN ('a2023099999', 'Bibliotecario Prueba');

RAISE NOTICE '🎉 PRUEBAS DEL SISTEMA UAT COMPLETADAS';