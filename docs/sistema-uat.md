# Sistema de Autenticación UAT - BiblioTrack

## 📚 Resumen del Sistema

BiblioTrack implementa un sistema de autenticación específico para la Universidad Autónoma de Tamaulipas (UAT) que distingue entre estudiantes y bibliotecarios con reglas específicas de registro y login.

## 👥 Tipos de Usuario

### 🎓 Estudiantes UAT
- **Email requerido**: `matricula@alumnos.uat.edu.mx`
- **Username**: La matrícula (ejemplo: `a2021040567`)
- **Login**: Usando la matrícula como username
- **Validación**: El sistema verifica automáticamente que el username coincida con la matrícula extraída del email

**Ejemplo de estudiante**:
```json
{
  "username": "a2021040567",
  "email": "a2021040567@alumnos.uat.edu.mx",
  "role": "client",
  "name": "Juan Antonio Martínez",
  "curp": "MAJJ990315HDFNTN01",
  "phone": "6441567890",
  "address": "Colonia Centro 789, Victoria, Tamaulipas"
}
```

### 👨‍💼 Bibliotecarios
- **Email**: Cualquier formato válido
- **Username**: Nombre completo del bibliotecario
- **Login**: Usando el nombre completo como username
- **Acceso**: Funciones administrativas completas

**Ejemplo de bibliotecario**:
```json
{
  "username": "María García Bibliotecaria",
  "email": "maria.garcia@bibliotrackuat.com",
  "role": "librarian",
  "name": "María García Bibliotecaria",
  "curp": "GARM850301MDFRNR02",
  "phone": "6441234567",
  "address": "Av. Universidad 123, Victoria, Tamaulipas"
}
```

## 🔒 Validaciones Implementadas

### 1. Validación de Email de Estudiantes
```sql
CONSTRAINT valid_student_email CHECK (
    role != 'client' OR email LIKE '%@alumnos.uat.edu.mx'
)
```

### 2. Validación de Username para Estudiantes
```sql
CONSTRAINT valid_student_username CHECK (
    role != 'client' OR (username = SPLIT_PART(email, '@', 1))
)
```

### 3. Validación de Formato CURP
```sql
CONSTRAINT valid_curp_format CHECK (
    curp ~ '^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$'
)
```

### 4. Validación de Teléfono
```sql
CONSTRAINT valid_phone_format CHECK (
    phone ~ '^[0-9]{10}$'
)
```

## 🛠️ Funciones de Utilidad

### `extract_matricula_from_email(email)`
Extrae la matrícula de un email UAT válido.
```sql
SELECT extract_matricula_from_email('a2021040567@alumnos.uat.edu.mx');
-- Resultado: 'a2021040567'
```

### `is_valid_uat_email(email)`
Valida si un email tiene el formato correcto de UAT.
```sql
SELECT is_valid_uat_email('a2021040567@alumnos.uat.edu.mx');
-- Resultado: true
```

### `validate_student_username(username, email)`
Verifica que el username de un estudiante coincida con su matrícula.
```sql
SELECT validate_student_username('a2021040567', 'a2021040567@alumnos.uat.edu.mx');
-- Resultado: true
```

## 💻 Implementación en Frontend

### Registro de Estudiantes
```typescript
// Al registrar un estudiante
const registerStudent = async (formData) => {
  // Validar formato de email UAT
  if (!formData.email.endsWith('@alumnos.uat.edu.mx')) {
    throw new Error('Los estudiantes deben usar email institucional UAT');
  }
  
  // Extraer matrícula del email
  const matricula = formData.email.split('@')[0];
  
  // El username debe ser la matrícula
  const userData = {
    ...formData,
    username: matricula,
    role: 'client'
  };
  
  return await supabase.auth.signUp(userData);
};
```

### Login de Usuarios
```typescript
// Sistema de login unificado
const login = async (identifier, password) => {
  // El identifier puede ser:
  // - Matrícula para estudiantes (ej: 'a2021040567')
  // - Nombre completo para bibliotecarios
  
  return await supabase.auth.signIn({
    email: identifier, // Se resolverá internamente
    password: password
  });
};
```

## 🧪 Datos de Prueba

### Estudiantes UAT
```
a2021040567 / juan123    (Juan Antonio Martínez - Ing. Sistemas)
a2020035421 / ana123     (Ana Sofía Rodríguez López - Lic. Literatura)
a2019028734 / carlos123  (Carlos Eduardo Mendoza - Ing. Industrial)  
a2022051298 / sofia123   (Sofía Isabel González - Historia)
```

### Bibliotecarios
```
María García Bibliotecaria / admin123
José Luis Pérez Admin / bib123
```

## 📋 Campos Requeridos

### Todos los Usuarios
- ✅ `name` - Nombre completo
- ✅ `curp` - CURP válido (formato mexicano)
- ✅ `phone` - Teléfono (10 dígitos)
- ✅ `email` - Email (con validaciones específicas)
- ✅ `address` - Dirección completa

### Campos Opcionales
- `bio` - Biografía personal
- `avatar_url` - URL del avatar
- `banner_url` - URL del banner
- `favorite_books` - Lista de libros favoritos
- `following` - Lista de usuarios seguidos
- `followers` - Lista de seguidores

## ⚠️ Consideraciones Importantes

1. **Consistencia de Datos**: El sistema garantiza que todos los estudiantes tengan emails UAT válidos y usernames consistentes.

2. **CURP Obligatorio**: Se requiere para formularios administrativos del bibliotecario.

3. **Validación Automática**: Las constraint de base de datos previenen datos inconsistentes.

4. **Escalabilidad**: El sistema puede expandirse para incluir otros tipos de usuarios (profesores, administrativos, etc.).

5. **Seguridad**: Las validaciones a nivel de base de datos proporcionan una capa adicional de seguridad.

## 🔄 Migración de Datos Existentes

Si tienes usuarios existentes que no siguen este formato, puedes usar este script de migración:

```sql
-- Migrar estudiantes existentes al formato UAT
UPDATE users 
SET 
    email = username || '@alumnos.uat.edu.mx',
    -- Mantener username como está si ya es matrícula
WHERE 
    role = 'client' 
    AND email NOT LIKE '%@alumnos.uat.edu.mx';
```

## 🚀 Próximos Pasos

1. **Integración con LDAP UAT**: Para validación automática de matrículas activas
2. **Sincronización de Datos**: Con sistemas administrativos de la UAT
3. **Roles Adicionales**: Profesores, coordinadores, etc.
4. **Auditoría**: Sistema de logs para cambios administrativos