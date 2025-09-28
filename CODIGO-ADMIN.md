# 🔐 CÓDIGO DE REGISTRO DE ADMINISTRADOR

## 📋 Información del Sistema

Para registrar un nuevo **BIBLIOTECARIO/ADMINISTRADOR** en BiblioTrack, necesitas el código secreto:

## 🎯 **CÓDIGO ACTUAL:**
```
UAT2024
```

## 📝 **Cómo Registrar un Bibliotecario**

### **Paso 1:** Ir al Formulario de Registro
- Ve a `http://localhost:9002`
- Haz clic en "Crear cuenta"
- Selecciona "Soy Bibliotecario"

### **Paso 2:** Llenar los Datos Requeridos
**Todos los campos son obligatorios:**

1. **Nombre completo**: Nombre completo del bibliotecario
2. **Nombre de usuario**: Este es el que usarás para hacer login
3. **Correo electrónico**: Email del bibliotecario
4. **CURP**: CURP válido de 18 caracteres
5. **Teléfono**: Teléfono de contacto (10 dígitos mínimo)
6. **Dirección**: Dirección completa
7. **Código de Registro**: `UAT2024` ⚠️ **REQUERIDO**
8. **Contraseña**: Mínimo 6 caracteres

### **Paso 3:** Registro Exitoso
Después del registro, podrás hacer login con:
- **Usuario**: El "nombre de usuario" que registraste
- **Contraseña**: La contraseña que creaste

## ⚠️ **IMPORTANTE**

- **Solo personas autorizadas** deben conocer este código
- **Cada bibliotecario registrado** tiene acceso completo al panel administrativo
- **El código es case-sensitive**: debe escribirse exactamente como `UAT2024`

## 🔄 **Cambiar el Código** (Para Desarrolladores)

Si necesitas cambiar el código, edita la línea 32 del archivo `signup-form.tsx`:
```typescript
const ADMIN_REGISTRATION_CODE = 'UAT2024'; // <- Cambiar aquí
```

## 👥 **Usuarios Administrativos Existentes**

Ya tienes estos administradores creados en la base de datos:
```
María García Bibliotecaria / admin123
José Luis Pérez Admin / bib123
```

## 🎉 **¡Todo Listo!**

El sistema ahora permite:
- ✅ Registro de estudiantes automático con matrícula UAT
- ✅ Registro de bibliotecarios con código secreto
- ✅ Todos los campos obligatorios validados
- ✅ Sistema completamente funcional

## 📋 **FORMATO DE CURP OBLIGATORIO**

⚠️ **IMPORTANTE**: El CURP debe seguir **EXACTAMENTE** este formato:
- **4 letras**: Iniciales de apellidos y nombre
- **6 números**: Fecha de nacimiento (AAMMDD) 
- **1 letra**: H (Hombre) o M (Mujer)
- **5 letras**: Estado + consonantes
- **2 caracteres**: Dígito verificador

**✅ Ejemplos válidos**:
- `GARM850301MDFRNR02`
- `CAPR900101HDFRLS02` 
- `MAJJ990315HDFNTN01`

**❌ NO válidos**:
- `garm850301mdfrnr02` (debe estar en MAYÚSCULAS)
- `GARM85030MDFRNR02` (fecha incompleta)
- `GARM850301XDFRNR02` (debe ser H o M)
- `GARM850301` (muy corto)

## 📞 **FORMATO DE TELÉFONO OBLIGATORIO**

⚠️ **IMPORTANTE**: El teléfono debe ser **exactamente 10 dígitos**:
- **✅ Válido**: `6441234567`
- **❌ NO válidos**:
  - `644-123-4567` (con guiones)
  - `(644) 123-4567` (con paréntesis)
  - `644 123 4567` (con espacios)
  - `64412345678` (más de 10 dígitos)
  - `644123456` (menos de 10 dígitos)

## 🎯 **Datos de Prueba Actualizados**

```
Nombre completo: Carlos Admin Prueba
Username: Carlos Admin Prueba
Email: carlos.admin@biblioteca.com
CURP: CAPR900101HDFRLS02
Teléfono: 6441234567  ← EXACTAMENTE 10 dígitos
Dirección: Calle Universidad 456, Victoria, Tamaulipas
Código: UAT2024
Contraseña: admin123
```

---
**Fecha de actualización:** 22 de septiembre de 2025  
**Código actual:** `UAT2024`