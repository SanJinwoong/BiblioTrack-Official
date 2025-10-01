
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

2. **¡La base de datos ya está configurada!** 🎉
	- Las credenciales de Supabase están incluidas en `.env.local`
	- La base de datos ya tiene datos de prueba configurados
	- **¡Solo clona y ejecuta!**

3. **Ejecuta el proyecto en desarrollo:**
	```bash
	npm run dev
	```
	El proyecto estará disponible en `http://localhost:9002`

4. **Usuarios de prueba disponibles:**
	- **Bibliotecario:** `María García Bibliotecaria` / `admin123`
	- **Usuario normal:** `a2022088888` / `ejemplar123`  
	- **Usuario suspendido:** `a2020011111` / `moroso123`
	- Ver más usuarios en `test-data-vencimientos.sql`


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
