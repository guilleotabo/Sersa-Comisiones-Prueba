# 👥 Sistema de Asesores - Información de Acceso

## ⚠️ Importante

La página de bienvenida (`index.html`) en la raíz del repositorio **debe actualizarse manualmente** cada vez que se agregue, elimine o cambie el nombre de un asesor. No se actualiza automáticamente.

## 📁 Carpetas Creadas

### 📊 Base (Template)
- **Contraseña:** `comercial2020`
- **Descripción:** Sistema base/template para crear nuevos asesores

### 👩‍💼 Alejandra
- **Contraseña:** `comercial2024`
- **Archivo:** `/Alejandra/index.html`
- **Descripción:** Sistema personalizado para Alejandra (Tipo: Ágil)

### 👩‍💼 Aletzia
- **Contraseña:** `comercial2025`
- **Archivo:** `/Aletzia/index.html`
- **Descripción:** Sistema personalizado para Aletzia (Tipo: Ágil)

### 👩‍💼 Micaela
- **Contraseña:** `comercial2026`
- **Archivo:** `/Micaela/index.html`
- **Descripción:** Sistema personalizado para Micaela (Tipo: Ágil)

### 👨‍💼 Maximiliano
- **Contraseña:** `comercial2027`
- **Archivo:** `/Maximiliano/index.html`
- **Descripción:** Sistema personalizado para Maximiliano (Tipo: Empresarial)

### 👨‍💼 Rodrigo
- **Contraseña:** `comercial2028`
- **Archivo:** `/Rodrigo/index.html`
- **Descripción:** Sistema personalizado para Rodrigo (Tipo: Empresarial)

### 👩‍💼 Erika
- **Contraseña:** `comercial2029`
- **Archivo:** `/Erika/index.html`
- **Descripción:** Sistema personalizado para Erika (Tipo: Ágil / Recupero) ⚠️ MontoExterno en 0

### 👨‍💼 Juan
- **Contraseña:** `juan2024`
- **Archivo:** `/Juan/index.html`
- **Descripción:** Sistema personalizado para Juan (Tipo: Ágil)

### 👨‍💼 Alvaro
- **Contraseña:** `alvaro2024`
- **Archivo:** `/Alvaro/index.html`
- **Descripción:** Sistema personalizado para Alvaro (Tipo: Ágil)

## 🔧 Instrucciones de Uso

1. **Acceder al sistema de cada asesor:**
   - Abrir el archivo `index.html` de la carpeta correspondiente
   - Usar la contraseña asignada para ingresar

2. **Personalizar configuraciones:**
   - Cada asesor puede usar el Panel de Administración (⚙️ Admin)
   - Modificar metas, premios y multiplicadores según necesidades
   - Los cambios se guardan automáticamente en cada sistema

3. **Mantener independencia:**
   - Cada carpeta funciona de forma independiente
   - Los cambios en una carpeta no afectan a las otras
   - Cada asesor tiene su propia configuración y historial

## 📝 Notas Importantes

- ✅ Todas las funcionalidades están disponibles en cada carpeta
- ✅ Panel de administración funcional
- ✅ Generación de reportes PDF
- ✅ Cálculos automáticos y validaciones
- ✅ Sistema de autenticación independiente

## 🔄 Para Agregar Más Asesores

1. Crear nueva carpeta con el nombre del asesor
2. Copiar todos los archivos de la carpeta `Base`
3. Modificar la contraseña en `app.js`:
   ```javascript
   const SISTEMA_PASSWORD = "comercialXXXX";
   ```
4. Actualizar este archivo con la nueva información