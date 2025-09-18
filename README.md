# BiblioTrack - Sistema de Gestión Bibliotecaria

Sistema completo de gestión bibliotecaria desarrollado con **Next.js 15** y **Supabase**.

## 🚀 Características Principales

- ✅ **Gestión de usuarios** (estudiantes y bibliotecarios)
- ✅ **Catálogo digital** de libros
- ✅ **Sistema de préstamos** y devoluciones
- ✅ **Reseñas y calificaciones** de libros
- ✅ **Recomendaciones inteligentes** con IA
- ✅ **Perfiles de usuario** con seguimiento social
- ✅ **Búsqueda avanzada** por título, autor, categoría

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 18, TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **IA**: Google Genkit para recomendaciones
- **Despliegue**: Firebase Hosting (solo frontend)

## 📋 Configuración del Proyecto

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase

#### 2.1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración

#### 2.2. Configurar la base de datos
1. Ve a tu proyecto en Supabase
2. Navega a **SQL Editor**
3. Ejecuta el script SQL de `supabase-schema.sql` para crear las tablas

#### 2.3. Configurar variables de entorno
1. Ve a **Settings > API** en tu proyecto de Supabase
2. Copia la **URL** y **anon key**
3. Actualiza tu archivo `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:9003`

## 👥 Usuarios de Prueba

### Bibliotecario
- **Usuario**: `admin` | **Contraseña**: `admin`

### Estudiantes  
- **Usuario**: `a1234567890` | **Contraseña**: `password`
- **Usuario**: `a0987654321` | **Contraseña**: `password`

## 📄 Migración Completada

✅ **Base de datos migrada de Firebase a Supabase**  
✅ **Todos los componentes actualizados**  
✅ **Listo para despliegue en Firebase Hosting**

---
**Desarrollado para la gestión bibliotecaria moderna**
