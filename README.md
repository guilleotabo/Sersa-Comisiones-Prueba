# Sistema de Comisiones SERSA - Documentación Técnica

## ARQUITECTURA

Sistema de cálculo de comisiones con:
- Frontend: HTML/CSS/JS estático
- Backend: Supabase (PostgreSQL)
- Autenticación: Custom con tabla usuarios
- Hosting: Sitio estático (Render/Netlify/Vercel)

## ESTRUCTURA DE ARCHIVOS

```
├── index.html          # Página principal - Login + Calculadora
├── admin.html          # Panel de administración
├── app.js              # Lógica principal del sistema
├── admin.js            # Lógica del panel de administración
├── styles.css          # Estilos principales
├── bonos.css           # Estilos específicos de bonos
```

## BASE DE DATOS (SUPABASE)

### Configuración de conexión:
```javascript
const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseKey = 'tu-clave-publica';
const supabase = createClient(supabaseUrl, supabaseKey);
```

### Tablas:

```sql
-- Usuarios del sistema
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    password TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- Asesores (información adicional)
CREATE TABLE asesores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- Configuración del sistema
CREATE TABLE configuracion_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clave TEXT NOT NULL UNIQUE,
    valor JSONB NOT NULL,
    descripcion TEXT,
    updated_at TIMESTAMP DEFAULT now()
);

-- Historial de cálculos
CREATE TABLE historial_calculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asesor TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT now(),
    datos_calculo JSONB NOT NULL,
    resultado JSONB NOT NULL
);
```

## CONFIGURACIÓN DEL SISTEMA

### Estructura CONFIG_DEFAULT:

```javascript
CONFIG_DEFAULT = {
    base: 2500000,
    
    // Montos de bonos por nivel
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
    
    // Multiplicadores configurables
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
    
    // Nombres personalizables
    nombres: {
        base: "Salario Base",
        carrera: "Bono de Carrera",
        interno: "Bono Interno",
        externo: "Bono Externo",
        recuperado: "Bono Recuperado",
        cantidad: "Bono por Cantidad",
        equipo: "Bono de Equipo"
    },
    
    // Switches del sistema
    llaves: {
        llave6Desembolsos: true,
        llaveSemanal: true
    }
};
```

## FUNCIONES PRINCIPALES

### Base de datos (app.js):

```javascript
// Obtener configuración
async function obtenerConfiguracion(clave = null) {
    const { data, error } = await supabase
        .from('configuracion_sistema')
        .select('*');
    return procesarConfiguracion(data, clave);
}

// Actualizar configuración
async function actualizarConfiguracion(clave, valor) {
    const { data, error } = await supabase
        .from('configuracion_sistema')
        .upsert({
            clave: clave,
            valor: valor,
            updated_at: new Date().toISOString()
        });
}

// Validar usuario
async function validarAsesor(nombre, password) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nombre', nombre)
        .eq('password', password)
        .eq('activo', true);
    return data && data.length > 0;
}

// Guardar cálculo
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

### Cálculo de comisiones (app.js):

```javascript
// Función principal de cálculo
function updateCalculations() {
    const valores = obtenerValoresInputs();
    
    // Calcular bonos base
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
    
    actualizarInterfaz(bonos, multiplicadores, subtotal, total);
}

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

// Cálculo de bono por nivel
function calcularBonoPorNivel(valor, metas, montos) {
    for (let i = 0; i < metas.length; i++) {
        if (valor >= metas[i]) {
            return { nivel: i, bono: montos[i], meta: metas[i] };
        }
    }
    return { nivel: -1, bono: 0, meta: 0 };
}
```

### Administración (admin.js):

```javascript
// Gestión de asesores
async function agregarAsesor(nombre, password, email) {
    const { data, error } = await supabase
        .from('usuarios')
        .insert({ nombre, password, activo: true });
    
    if (!error && email) {
        await supabase
            .from('asesores')
            .insert({ nombre, email, activo: true });
    }
}

async function eliminarAsesor(nombre) {
    await supabase
        .from('usuarios')
        .update({ activo: false })
        .eq('nombre', nombre);
}

// Gestión de multiplicadores
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

## LÓGICA DE NEGOCIO

### Flujo de cálculo:
1. Usuario ingresa datos → Validación
2. Cálculo de bonos base según metas
3. Cálculo de multiplicadores según rangos
4. Aplicación: subtotal × multiplicador_total
5. Actualización de interfaz y guardado en historial

### Algoritmo de multiplicadores:
```javascript
// Pseudocódigo
for cada multiplicador in config.multiplicadores:
    valor = input_usuario[multiplicador.tipo]
    
    if multiplicador.invertido:
        // Mora: menor valor = mejor multiplicador
        for rango in multiplicador.rangos:
            if valor <= rango.min + tolerancia:
                return rango.mult
    else:
        // Otros: mayor valor = mejor multiplicador
        for rango in multiplicador.rangos (desc):
            if valor >= rango.min:
                return rango.mult
    
    return 1.0
```

## USUARIOS

### Asesores:
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
    password: "gtadmin"
};
```

## ESTRUCTURA DE DATOS

### Objeto de cálculo:
```javascript
const calculo = {
    asesor: "string",
    fecha: "timestamp",
    inputs: {
        carreraActual: number,
        carreraAnterior: number,
        interno: number,
        externo: number,
        recuperado: number,
        cantidad: number,
        equipo: number,
        conversion: number,
        empatia: number,
        proceso: number,
        mora: number
    },
    bonos: {
        base: number,
        carrera: number,
        interno: number,
        externo: number,
        recuperado: number,
        cantidad: number,
        equipo: number
    },
    multiplicadores: {
        conversion: number,
        empatia: number,
        proceso: number,
        mora: number
    },
    subtotal: number,
    multiplicadorTotal: number,
    total: number
};
```

## DESPLIEGUE

### Configuración:
- Archivos estáticos (HTML/CSS/JS)
- Variables de Supabase en app.js
- Hosting: Render/Netlify/Vercel/GitHub Pages

### Variables necesarias:
```javascript
const supabaseUrl = 'https://proyecto.supabase.co';
const supabaseKey = 'clave_publica_supabase';
``` 