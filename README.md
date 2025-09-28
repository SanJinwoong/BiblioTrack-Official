
# BiblioTrack

Sistema moderno y completo para la gestión de bibliotecas, desarrollado con **Next.js 15** y **Supabase**. Permite administrar usuarios, libros, préstamos y recomendaciones inteligentes, todo desde una interfaz web intuitiva.


## 🚀 Características

- **Gestión de usuarios** (estudiantes y bibliotecarios)
- **Catálogo digital** de libros
- **Préstamos y devoluciones**
- **Reseñas y calificaciones**
- **Recomendaciones inteligentes** (IA)
- **Perfiles de usuario y seguimiento social**
- **Búsqueda avanzada** por título, autor y categoría


## 🛠️ Tecnologías

- **Frontend:** Next.js 15, React 18, TypeScript
- **Backend y BD:** Supabase (PostgreSQL)
- **UI:** Tailwind CSS, Radix UI, Lucide Icons
- **IA:** Google Genkit
- **Despliegue:** Firebase Hosting


## � Instalación y configuración

1. **Instala las dependencias:**
	```bash
	npm install
	```

2. **Configura Supabase:**
	- Crea un proyecto en [supabase.com](https://supabase.com)
	- Ejecuta el script `supabase-schema.sql` en el SQL Editor para crear las tablas
	- Ve a **Settings > API** y copia la URL y la anon key
	- Crea el archivo `.env.local` y agrega:
	  ```bash
	  NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
	  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
	  ```

3. **Ejecuta el proyecto en desarrollo:**
	```bash
	npm run dev
	```
	El proyecto estará disponible en `http://localhost:9003`


## � Usuarios de prueba

**Bibliotecario:**
- Usuario: `admin` | Contraseña: `admin`

**Estudiantes:**
- Usuario: `a1234567890` | Contraseña: `password`
- Usuario: `a0987654321` | Contraseña: `password`


## 📄 Estado del proyecto

- Base de datos migrada de Firebase a Supabase
- Componentes actualizados
- Listo para despliegue en Firebase Hosting

---

## 📚 Enlaces útiles

- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)

---
**Desarrollado para la gestión bibliotecaria moderna.**
