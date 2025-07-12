# 📊 ESTRUCTURA DE MULTIPLICADORES CONFIGURABLES

## 🎯 OBJETIVO
Crear un sistema completo para configurar multiplicadores desde el panel de administración.

## 📋 ESTRUCTURA ACTUAL vs NUEVA

### ACTUAL (Hardcodeado):
```javascript
multiplicadores: {
    conversion: [
        {min: 15, mult: 1.1, text: "15%+"},
        {min: 11, mult: 1, text: "11%"},
        // ...
    ]
}
```

### NUEVA (Configurable):
```javascript
multiplicadores: {
    conversion: {
        nombre: "Tasa de Conversión",
        icono: "🎯",
        unidad: "%",
        descripcion: "Porcentaje de conversión de leads",
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
        rangos: [...]
    },
    proceso: {
        nombre: "Cumplimiento de Proceso",
        icono: "📋",
        unidad: "%",
        descripcion: "Adherencia a procesos establecidos",
        rangos: [...]
    },
    mora: {
        nombre: "Índice de Mora",
        icono: "💰",
        unidad: "%",
        descripcion: "Porcentaje de mora en cartera",
        invertido: true, // Menor es mejor
        rangos: [...]
    }
}
```

## 🎨 INTERFAZ DE ADMINISTRACIÓN

### Nueva Pestaña: "📊 Multiplicadores"
```
📊 Multiplicadores
├── 🎯 Tasa de Conversión [Editar]
│   ├── 15%+ → x1.10 (Verde)
│   ├── 11-14% → x1.00 (Azul)
│   ├── 9-10% → x0.80 (Amarillo)
│   └── [+ Agregar Rango]
├── 💬 Nivel de Empatía [Editar]
├── 📋 Cumplimiento de Proceso [Editar]
└── 💰 Índice de Mora [Editar]
```

## ⚙️ FUNCIONALIDADES

### 1. Editor de Multiplicador
- ✅ Cambiar nombre y descripción
- ✅ Seleccionar icono
- ✅ Definir unidad (%, puntos, etc.)
- ✅ Configurar si es invertido (menor = mejor)

### 2. Editor de Rangos
- ✅ Agregar/quitar rangos dinámicamente
- ✅ Configurar min, multiplicador, texto
- ✅ Asignar colores visuales
- ✅ Validación de solapamientos

### 3. Previsualización
- ✅ Vista previa en tiempo real
- ✅ Simulador de valores
- ✅ Impacto en cálculo final

### 4. Plantillas
- ✅ Plantilla "Ventas Tradicional"
- ✅ Plantilla "Servicios Financieros"
- ✅ Plantilla "Personalizada"

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Fase 1: Estructura Base
1. Actualizar CONFIG_DEFAULT con nueva estructura
2. Migrar multiplicadores existentes
3. Crear funciones de validación

### Fase 2: Interfaz Admin
1. Nueva pestaña "Multiplicadores"
2. Lista de multiplicadores configurables
3. Modal de edición avanzado

### Fase 3: Editor de Rangos
1. Componente para agregar/editar rangos
2. Validación de consistencia
3. Vista previa visual

### Fase 4: Integración
1. Actualizar lógica de cálculo
2. Migrar configuraciones existentes
3. Testing completo

## 📱 MOCKUP DE INTERFAZ

```
┌─────────────────────────────────────┐
│ 📊 Multiplicadores                  │
├─────────────────────────────────────┤
│ 🎯 Tasa de Conversión         [✏️] │
│ Porcentaje de conversión de leads   │
│ ┌─────────────────────────────────┐ │
│ │ 15%+ → x1.10 (🟢)           │ │
│ │ 11-14% → x1.00 (🔵)         │ │
│ │ 9-10% → x0.80 (🟡)          │ │
│ │ <9% → x0.50 (🔴)            │ │
│ │ [+ Agregar Rango]            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💬 Nivel de Empatía           [✏️] │
│ 📋 Cumplimiento de Proceso    [✏️] │
│ 💰 Índice de Mora             [✏️] │
└─────────────────────────────────────┘
```

## 🎯 BENEFICIOS

1. **Flexibilidad Total**: Cada asesor puede tener multiplicadores únicos
2. **Facilidad de Uso**: Interfaz visual e intuitiva
3. **Escalabilidad**: Agregar nuevos tipos de multiplicadores
4. **Transparencia**: Los asesores ven exactamente cómo se calculan
5. **Optimización**: Ajustar multiplicadores según performance real 