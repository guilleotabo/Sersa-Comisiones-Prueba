# 🎁 Sistema de Bonos Comerciales - SERSA SAECA

Sistema web modular para calcular bonos comerciales con configuraciones personalizadas por asesor.

## 📁 Estructura del Repositorio

```
Comisiones-Sersa-1/
├── 📊 Base/                    # Template base para nuevos asesores
├── 👩‍💼 Alejandra/              # Sistema personalizado para Alejandra
├── 👩‍💼 Aletzia/                # Sistema personalizado para Aletzia
├── 👩‍💼 Erika/                  # Sistema personalizado para Erika
├── 👨‍💼 Maximiliano/            # Sistema personalizado para Maximiliano
├── 👩‍💼 Micaela/                # Sistema personalizado para Micaela
├── 👨‍💼 Rodrigo/                # Sistema personalizado para Rodrigo
├── 📋 ASESORES_INFO.md         # Información de acceso y contraseñas
├── 📄 LICENSE                  # Licencia MIT del proyecto
└── 📖 README.md                # Este archivo
```

## 🚀 Características Principales

- ✅ **Sistema modular**: Cada asesor tiene su propia instancia independiente
- ✅ **Panel de administración**: Configuración completa de metas, premios y multiplicadores
- ✅ **Cálculos automáticos**: Sistema de bonos con validaciones en tiempo real
- ✅ **Reportes PDF**: Generación automática de reportes profesionales
- ✅ **Dashboard ejecutivo**: Análisis avanzado de coherencia de metas
- ✅ **Almacenamiento local**: Configuraciones guardadas automáticamente
- ✅ **Interfaz responsive**: Funciona en desktop y móviles

## 🎯 Niveles de Carrera

1. **🏠 Capilla** - Nivel inicial
2. **👤 Junior** - Nivel básico  
3. **⭐ Senior A** - Nivel intermedio
4. **💎 Senior B** - Nivel avanzado
5. **👑 Máster** - Nivel experto
6. **🏆 Genio** - Nivel máximo

## 🔧 Instalación y Uso

### Para Usuarios Finales
1. Abrir la carpeta del asesor correspondiente
2. Ejecutar `index.html` en el navegador
3. Ingresar con la contraseña asignada
4. Completar los campos requeridos
5. Ver resultados en tiempo real

### Para Administradores
1. Usar el Panel de Administración (⚙️ Admin)
2. Modificar configuraciones según necesidades
3. Exportar configuraciones actualizadas
4. Analizar coherencia con el Dashboard Ejecutivo

## 📊 Funcionalidades por Instancia

Cada carpeta de asesor contiene:
- **`index.html`** - Aplicación principal con login
- **`admin.html`** - Panel de administración avanzado
- **`config.js`** - Configuración personalizada del asesor
- **`app.js`** - Lógica principal y cálculos
- **`reports.js`** - Generador de reportes PDF
- **`styles.css`** - Estilos principales
- **`bonos.css`** - Estilos específicos
- **`README.md`** - Documentación específica

## 🔄 Agregar Nuevos Asesores

1. Crear nueva carpeta con el nombre del asesor
2. Copiar todos los archivos de la carpeta `Base/`
3. Modificar la contraseña en `app.js`:
   ```javascript
   const SISTEMA_PASSWORD = "comercialXXXX";
   ```
4. Personalizar configuraciones según necesidades
5. Actualizar `ASESORES_INFO.md` con la nueva información

## 📝 Información de Acceso

Consulta el archivo [ASESORES_INFO.md](ASESORES_INFO.md) para obtener:
- Contraseñas de acceso por asesor
- Descripciones específicas de cada instancia
- Instrucciones detalladas de uso
- Notas importantes sobre configuraciones

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura de la aplicación
- **CSS3** - Estilos y diseño responsive
- **JavaScript ES6+** - Lógica y cálculos
- **jsPDF** - Generación de reportes PDF
- **Chart.js** - Gráficos del dashboard ejecutivo

## 📄 Licencia

Distribuido bajo los términos de la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

## 🤝 Contribución

Para contribuir al proyecto:
1. Usar la carpeta `Base/` como template
2. Mantener la estructura de archivos
3. Documentar cambios en los README correspondientes
4. Actualizar `ASESORES_INFO.md` si es necesario

## ⚠️ Actualización de la Página de Bienvenida

La página principal (`index.html`) que muestra los accesos a los sistemas de cada asesor **NO se actualiza automáticamente**. Si agregas, eliminas o cambias el nombre de una carpeta de asesor, debes editar manualmente el archivo `index.html` en la raíz del repositorio para reflejar los cambios.

- Agrega o elimina el bloque HTML correspondiente al asesor.
- Actualiza la contraseña y descripción si corresponde.

Esto es necesario porque el sistema está alojado en un hosting estático y no puede generar la lista de asesores de forma dinámica.

---

**Desarrollado para SERSA SAECA** - Sistema de Bonos Comerciales