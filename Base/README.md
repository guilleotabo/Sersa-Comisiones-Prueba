# 💰 Sistema de Comisiones Comerciales - SERSA SAECA

Sistema web para calcular comisiones comerciales con panel de administración integrado.

## 📁 Estructura de Archivos

### Archivos Principales
- **`index.html`** - Aplicación principal con login y panel de administración integrado
- **`config.js`** - Archivo de configuración con todas las variables del sistema

### Scripts
- **`app.js`** - Lógica principal, cálculos y sistema de autenticación
- **`reports.js`** - Generador de reportes PDF

### Estilos
- **`styles.css`** - Hojas de estilo principales de la aplicación
- **`comisiones.css`** - Estilos específicos para componentes y login

### Documentación
- **`README.md`** - Este archivo de documentación
- **`LICENSE`** - Licencia del proyecto (en la raíz del repositorio)

## 🚀 Uso

### Sistema Principal
1. Abrir `index.html` en el navegador
2. Ingresar contraseña: `comercial2020`
3. Completar los campos requeridos
4. Ver resultados en tiempo real
5. Generar reportes PDF

### Panel de Administración
1. Hacer clic en el botón "⚙️ Admin" en la barra superior
2. Modificar configuraciones del sistema en las pestañas
3. Usar el Dashboard Ejecutivo para análisis avanzado
4. Los cambios se guardan automáticamente

## ⚙️ Configuración

El sistema se configura mediante el archivo `config.js` que contiene:
- Metas por nivel
- Premios por nivel  
- Multiplicadores (Conversión, Empatía, Proceso, Mora)
- Base fija
- Nombres de niveles

## 🔧 Características

- ✅ Sistema de login con contraseña
- ✅ Cálculo automático de comisiones
- ✅ Validación de campos obligatorios
- ✅ Sistema de multiplicadores en cadena
- ✅ Panel de administración integrado
- ✅ Dashboard ejecutivo con análisis avanzado
- ✅ Generación de reportes PDF
- ✅ Almacenamiento local de configuraciones
- ✅ Interfaz responsive
- ✅ Sugerencias personalizadas

## 📊 Funcionalidades

### Cálculos
- Monto interno, externo y recuperados
- Cantidad de desembolsos
- Sistema de llaves (6 desembolsos mínimos, 2 por semana)
- Multiplicadores por calidad (Conversión, Empatía, Proceso, Mora)
- Premio carrera y equipo

### Administración
- Edición de todas las configuraciones
- Validación de campos
- Exportación de configuraciones
- Restauración a valores por defecto

## 🎯 Niveles

1. **Capilla** - Nivel inicial
2. **Junior** - Nivel básico  
3. **Senior A** - Nivel intermedio
4. **Senior B** - Nivel avanzado
5. **Máster** - Nivel experto
6. **Genio** - Nivel máximo

## 📝 Licencia

Distribuido bajo los términos de la licencia MIT. Consulta el archivo [LICENSE](../LICENSE) para más información.
GT