# 🖼️ CONFIGURACIÓN DE IMÁGENES - BiblioTrack

## 📋 **Dominios de Imágenes Configurados**

El sistema BiblioTrack está configurado para cargar imágenes desde los siguientes dominios:

### ✅ **Dominios Permitidos**

1. **`placehold.co`** 
   - Imágenes placeholder para desarrollo
   - Ejemplo: `https://placehold.co/400x600`

2. **`picsum.photos`**
   - Imágenes random para pruebas
   - Ejemplo: `https://picsum.photos/400/600`

3. **`i.pravatar.cc`**
   - Avatares de usuarios
   - Ejemplo: `https://i.pravatar.cc/150`

4. **`images.unsplash.com`** ✨ **RECIÉN AGREGADO**
   - Imágenes de alta calidad para portadas de libros
   - Ejemplo: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400`

## 🔧 **Problema Solucionado**

### **Error Original:**
```
Error: Invalid src prop (https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400) on `next/image`, 
hostname "images.unsplash.com" is not configured under images in your `next.config.js`
```

### **Solución:**
Se agregó `images.unsplash.com` a la configuración de `next.config.ts`:

```typescript
{
  protocol: 'https',
  hostname: 'images.unsplash.com',
  port: '',
  pathname: '/**',
}
```

## 📚 **Imágenes de Libros**

Los libros en la base de datos usan imágenes de Unsplash:
- Cien años de soledad: `photo-1544716278-ca5e3f4abd8c`
- 1984: `photo-1495446815901-a7297e633e8d`
- Sapiens: `photo-1481627834876-b7833e8f5570`
- El origen de las especies: `photo-1507003211169-0a1dd7228f2d`
- Steve Jobs: `photo-1529158062015-cad636e205a0`
- Clean Code: `photo-1562813733-b31f71025d54`

## ⚠️ **Nota Importante**

Después de cambiar la configuración de `next.config.ts`, es **obligatorio reiniciar** el servidor de desarrollo:

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
npm run dev
```

## 🎯 **Estado Actual**

- ✅ **Configuración actualizada**
- ✅ **Servidor reiniciado**
- ✅ **Imágenes de Unsplash funcionando**
- ✅ **Panel de bibliotecario operativo**

---
**Fecha de actualización:** 22 de septiembre de 2025  
**Archivo modificado:** `next.config.ts`