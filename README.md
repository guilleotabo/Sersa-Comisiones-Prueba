# 🧮 Sistema de Comisiones SERSA - Documentación Técnica Completa

## 📋 RESUMEN TÉCNICO

Sistema de cálculo de comisiones para asesores comerciales con arquitectura simplificada, base de datos Supabase y multiplicadores configurables dinámicos.

## 🗂️ ESTRUCTURA DE ARCHIVOS

```
Sersa-Comisiones-Prueba/
├── index.html                       # Página principal - Login + Calculadora
├── admin.html                       # Panel de administración
├── app.js                          # Lógica principal del sistema
├── admin.js                        # Lógica del panel de administración
├── styles.css                      # Estilos principales
├── bonos.css                       # Estilos específicos de bonos
├── README.md                       # Esta documentación técnica
├── MANUAL-USUARIO.md               # Manual de uso para usuarios finales
└── estructura-multiplicadores.md   # Especificación de multiplicadores
```

## 🗄️ BASE DE DATOS (SUPABASE)

### Configuración de conexión:
```javascript
const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseKey = 'tu-clave-publica';
const supabase = createClient(supabaseUrl, supabaseKey);
```

### Tablas y esquemas:

#### `asesores`
```sql
CREATE TABLE asesores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);
```

#### `usuarios`
```sql
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    password TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);
```

#### `configuracion_sistema`
```sql
CREATE TABLE configuracion_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clave TEXT NOT NULL UNIQUE,
    valor JSONB NOT NULL,
    descripcion TEXT,
    updated_at TIMESTAMP DEFAULT now()
);
```

#### `historial_calculos`
```sql
CREATE TABLE historial_calculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asesor TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT now(),
    datos_calculo JSONB NOT NULL,
    resultado JSONB NOT NULL
);
```

## ⚙️ CONFIGURACIÓN DEL SISTEMA

### Estructura de configuración en `configuracion_sistema`:

```javascript
CONFIG_DEFAULT = {
    base: 2500000,
    
    // Configuración de bonos
    pagos: {
        montoInterno: [1000000, 800000, 600000, 400000, 200000],
        montoExterno: [1500000, 1200000, 900000, 600000, 300000],
        montoRecuperado: [2000000, 1600000, 1200000, 800000, 400000],
        cantidad: [500000, 400000, 300000, 200000, 100000]
    },
    
    // Metas por nivel
    metasInterno: [120, 90, 60, 30, 15],
    metasExterno: [40, 30, 20, 10, 5],
    metasRecuperado: [20, 15, 10, 5, 2],
    metasCantidad: [25, 20, 15, 10, 5],
    
    // Configuración de carrera
    carrera: {
        metas: [8000000, 6000000, 4000000, 2000000, 1000000],
        bonos: [2000000, 1500000, 1000000, 500000, 250000],
        nombres: ["Diamante", "Oro", "Plata", "Bronce", "Inicial"]
    },
    
    // Configuración de equipo
    equipo: {
        metas: [50000000, 40000000, 30000000, 20000000, 10000000],
        bonos: [3000000, 2400000, 1800000, 1200000, 600000],
        nombres: ["Líder Elite", "Líder Oro", "Líder Plata", "Líder Bronce", "Líder Inicial"]
    },
    
    // Sistema de multiplicadores configurables
    multiplicadores: {
        conversion: {
            nombre: "Tasa de Conversión",
            icono: "🎯",
            unidad: "%",
            descripcion: "Porcentaje de conversión de leads",
            invertido: false,
            rangos: [
                {min: 15, mult: 1.1, text: "15%+", color: "green"},
                {min: 11, mult: 1.0, text: "11-14%", color: "blue"},
                {min: 9, mult: 0.8, text: "9-10%", color: "yellow"},
                {min: 7, mult: 0.7, text: "7-8%", color: "orange"},
                {min: 0, mult: 0.5, text: "<7%", color: "red"}
            ]
        },
        empatia: {
            nombre: "Nivel de Empatía",
            icono: "💬",
            unidad: "%",
            descripcion: "Porcentaje de satisfacción del cliente",
            invertido: false,
            rangos: [
                {min: 90, mult: 1.1, text: "90%+", color: "green"},
                {min: 80, mult: 1.0, text: "80-89%", color: "blue"},
                {min: 70, mult: 0.9, text: "70-79%", color: "yellow"},
                {min: 60, mult: 0.8, text: "60-69%", color: "orange"},
                {min: 0, mult: 0.7, text: "<60%", color: "red"}
            ]
        },
        proceso: {
            nombre: "Cumplimiento de Proceso",
            icono: "📋",
            unidad: "%",
            descripcion: "Adherencia a procesos establecidos",
            invertido: false,
            rangos: [
                {min: 95, mult: 1.1, text: "95%+", color: "green"},
                {min: 85, mult: 1.0, text: "85-94%", color: "blue"},
                {min: 75, mult: 0.9, text: "75-84%", color: "yellow"},
                {min: 65, mult: 0.8, text: "65-74%", color: "orange"},
                {min: 0, mult: 0.7, text: "<65%", color: "red"}
            ]
        },
        mora: {
            nombre: "Índice de Mora",
            icono: "💰",
            unidad: "%",
            descripcion: "Porcentaje de mora en cartera",
            invertido: true,
            rangos: [
                {min: 0, mult: 1.1, text: "0-2%", color: "green"},
                {min: 3, mult: 1.0, text: "3-5%", color: "blue"},
                {min: 6, mult: 0.9, text: "6-8%", color: "yellow"},
                {min: 9, mult: 0.8, text: "9-12%", color: "orange"},
                {min: 13, mult: 0.7, text: "13%+", color: "red"}
            ]
        }
    },
    
    // Nombres personalizables de bonos
    nombres: {
        base: "Salario Base",
        carrera: "Bono de Carrera",
        interno: "Bono Interno",
        externo: "Bono Externo",
        recuperado: "Bono Recuperado",
        cantidad: "Bono por Cantidad",
        equipo: "Bono de Equipo"
    },
    
    // Configuración de llaves (switches)
    llaves: {
        llave6Desembolsos: true,
        llaveSemanal: true
    }
};
```

## 🔧 FUNCIONES PRINCIPALES

### Funciones de base de datos (app.js):

```javascript
// Conexión y configuración
async function obtenerConfiguracion(clave = null) {
    const { data, error } = await supabase
        .from('configuracion_sistema')
        .select('*');
    // Retorna configuración completa o específica
}

async function actualizarConfiguracion(clave, valor) {
    const { data, error } = await supabase
        .from('configuracion_sistema')
        .upsert({
            clave: clave,
            valor: valor,
            updated_at: new Date().toISOString()
        });
}

// Gestión de usuarios
async function validarAsesor(nombre, password) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nombre', nombre)
        .eq('password', password)
        .eq('activo', true);
    return data && data.length > 0;
}

async function obtenerAsesores() {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('activo', true);
    return data || [];
}

// Historial de cálculos
async function guardarCalculoEnHistorial(asesor, datosCalculo) {
    const { data, error } = await supabase
        .from('historial_calculos')
        .insert({
            asesor: asesor,
            datos_calculo: datosCalculo,
            resultado: calcularResultado(datosCalculo)
        });
}
```

### Funciones de cálculo (app.js):

```javascript
// Cálculo de multiplicadores
function calcularMultiplicador(tipo, valor) {
    const multiplicador = config.multiplicadores[tipo];
    if (!multiplicador) return 1;
    
    const rangos = multiplicador.rangos;
    if (multiplicador.invertido) {
        // Para mora: menor es mejor
        for (let i = 0; i < rangos.length; i++) {
            if (valor <= rangos[i].min + 2) {
                return rangos[i].mult;
            }
        }
    } else {
        // Para otros: mayor es mejor
        for (let i = 0; i < rangos.length; i++) {
            if (valor >= rangos[i].min) {
                return rangos[i].mult;
            }
        }
    }
    return 1;
}

// Cálculo de bonos por nivel
function calcularBonoPorNivel(valor, metas, montos) {
    for (let i = 0; i < metas.length; i++) {
        if (valor >= metas[i]) {
            return {
                nivel: i,
                bono: montos[i],
                meta: metas[i]
            };
        }
    }
    return { nivel: -1, bono: 0, meta: 0 };
}

// Cálculo principal
function updateCalculations() {
    // Obtener valores de inputs
    const valores = obtenerValoresInputs();
    
    // Calcular bonos individuales
    const bonos = {
        base: config.base,
        carrera: calcularBonoCarrera(valores.carreraActual, valores.carreraAnterior),
        interno: calcularBonoInterno(valores.interno),
        externo: calcularBonoExterno(valores.externo),
        recuperado: calcularBonoRecuperado(valores.recuperado),
        cantidad: calcularBonoCantidad(valores.cantidad),
        equipo: calcularBonoEquipo(valores.equipo)
    };
    
    // Calcular multiplicadores
    const multiplicadores = {
        conversion: calcularMultiplicador('conversion', valores.conversion),
        empatia: calcularMultiplicador('empatia', valores.empatia),
        proceso: calcularMultiplicador('proceso', valores.proceso),
        mora: calcularMultiplicador('mora', valores.mora)
    };
    
    // Calcular totales
    const subtotal = Object.values(bonos).reduce((a, b) => a + b, 0);
    const multiplicadorTotal = Object.values(multiplicadores).reduce((a, b) => a * b, 1);
    const total = subtotal * multiplicadorTotal;
    
    // Actualizar interfaz
    actualizarInterfaz(bonos, multiplicadores, subtotal, total);
}
```

### Funciones de administración (admin.js):

```javascript
// Gestión de asesores
async function agregarAsesor(nombre, password, email) {
    const { data, error } = await supabase
        .from('usuarios')
        .insert({
            nombre: nombre,
            password: password,
            activo: true
        });
    
    if (!error && email) {
        await supabase
            .from('asesores')
            .insert({
                nombre: nombre,
                email: email,
                activo: true
            });
    }
}

async function eliminarAsesor(nombre) {
    await supabase
        .from('usuarios')
        .update({ activo: false })
        .eq('nombre', nombre);
        
    await supabase
        .from('asesores')
        .update({ activo: false })
        .eq('nombre', nombre);
}

// Gestión de multiplicadores
function guardarMultiplicadores() {
    const multiplicadores = recopilarMultiplicadores();
    actualizarConfiguracion('multiplicadores', multiplicadores);
}

function recopilarMultiplicadores() {
    const multiplicadores = {};
    
    Object.keys(CONFIG_DEFAULT.multiplicadores).forEach(key => {
        multiplicadores[key] = {
            nombre: document.querySelector(`[data-mult="${key}"][data-field="nombre"]`).value,
            icono: document.querySelector(`[data-mult="${key}"][data-field="icono"]`).value,
            unidad: document.querySelector(`[data-mult="${key}"][data-field="unidad"]`).value,
            descripcion: document.querySelector(`[data-mult="${key}"][data-field="descripcion"]`).value,
            invertido: document.querySelector(`[data-mult="${key}"][data-field="invertido"]`).value === 'true',
            rangos: recopilarRangos(key)
        };
    });
    
    return multiplicadores;
}
```

## 🎯 LÓGICA DE NEGOCIO

### Flujo de cálculo de comisiones:

1. **Entrada de datos**: Usuario ingresa valores en formulario
2. **Validación**: Verificar que todos los campos sean válidos
3. **Cálculo de bonos base**: Aplicar metas y obtener bonos individuales
4. **Cálculo de multiplicadores**: Evaluar cada multiplicador según su configuración
5. **Aplicación de multiplicadores**: Subtotal × multiplicador total
6. **Actualización de interfaz**: Mostrar resultados y barras de progreso
7. **Guardado en historial**: Registrar cálculo en base de datos

### Algoritmo de multiplicadores:

```javascript
// Pseudocódigo para multiplicadores
for cada multiplicador in config.multiplicadores:
    valor_usuario = obtenerValorInput(multiplicador.tipo)
    
    if multiplicador.invertido:
        // Para mora: menor es mejor
        for rango in multiplicador.rangos:
            if valor_usuario <= rango.min + tolerancia:
                return rango.mult
    else:
        // Para otros: mayor es mejor
        for rango in multiplicador.rangos (ordenados desc):
            if valor_usuario >= rango.min:
                return rango.mult
    
    return 1.0  // multiplicador neutro
```

## 👥 USUARIOS DEL SISTEMA

### Asesores configurados:
```javascript
const ASESORES = [
    { nombre: "Base", password: "20" },
    { nombre: "Alejandra", password: "comercial2020" },
    { nombre: "Aletzia", password: "comercial2020" },
    { nombre: "Alvaro", password: "comercial2020" },
    { nombre: "Erika", password: "comercial2020" },
    { nombre: "Juan", password: "comercial2020" },
    { nombre: "Maximiliano", password: "comercial2027" },
    { nombre: "Micaela", password: "comercial2026" },
    { nombre: "Rodrigo", password: "comercial2028" }
];
```

### Administrador:
```javascript
const ADMIN = {
    usuario: "Administrador",
    password: "gtadmin",
    permisos: ["gestionar_asesores", "configurar_sistema", "ver_reportes"]
};
```

## 🔄 FLUJO DE DATOS

```
INPUT (Usuario) → VALIDACIÓN → CÁLCULO → MULTIPLICADORES → RESULTADO → HISTORIAL
     ↓              ↓           ↓           ↓            ↓         ↓
   Formulario   Validar JS   Bonos base   Aplicar mult.  Mostrar   Supabase
```

## 📊 ESTRUCTURA DE DATOS

### Objeto de cálculo completo:
```javascript
const calculoCompleto = {
    asesor: "Alejandra",
    fecha: "2025-01-15T10:30:00Z",
    inputs: {
        carreraActual: 8500000,
        carreraAnterior: 7000000,
        interno: 125,
        externo: 45,
        recuperado: 22,
        cantidad: 28,
        equipo: 55000000,
        conversion: 14,
        empatia: 87,
        proceso: 92,
        mora: 4
    },
    bonos: {
        base: 2500000,
        carrera: 2000000,
        interno: 1000000,
        externo: 1500000,
        recuperado: 2000000,
        cantidad: 500000,
        equipo: 3000000
    },
    multiplicadores: {
        conversion: 1.0,
        empatia: 1.0,
        proceso: 1.0,
        mora: 1.0
    },
    subtotal: 12500000,
    multiplicadorTotal: 1.0,
    total: 12500000
};
```

## 🚀 DESPLIEGUE

### Configuración para hosting estático:
- **Archivos**: Solo HTML, CSS, JS (sin servidor)
- **Base de datos**: Supabase (configurar RLS)
- **Variables**: URL y Key de Supabase en app.js
- **Hosting**: Render, Netlify, Vercel, GitHub Pages

### Variables de entorno necesarias:
```javascript
const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 🔧 MANTENIMIENTO

### Tareas rutinarias:
- Backup de configuración (exportar JSON)
- Revisión de logs de errores
- Actualización de asesores activos
- Optimización de multiplicadores según performance

### Monitoreo:
- Errores en consola del navegador
- Fallos de conexión a Supabase
- Cálculos incorrectos
- Performance de carga

## 📝 NOTAS TÉCNICAS

- **Arquitectura**: SPA (Single Page Application)
- **Persistencia**: Supabase (PostgreSQL)
- **Autenticación**: Custom con validación en tabla usuarios
- **Reportes**: jsPDF para generación de PDF
- **Responsive**: CSS Grid y Flexbox
- **Compatibilidad**: Navegadores modernos (ES6+)

---

**Sistema de Comisiones SERSA v2.1**  
**Documentación técnica completa para desarrollo e integración con IA** 