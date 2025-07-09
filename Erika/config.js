// Configuración del Sistema de Comisiones Comerciales (Tipo: Ágil / Recupero)
// Instrucción especial: "Monto Desembolso Externo y Referido" va todo en 0

const CONFIG = {
    base: 3000000,
    niveles: [
        "Capilla",
        "Junior", 
        "Senior A",
        "Senior B",
        "Máster",
        "Genio"
    ],
    iconos: [
        "🏠",
        "👤", 
        "⭐",
        "💎",
        "👑",
        "🏆"
    ],
    metas: {
        montoInterno: [
            80000000,
            120000000,
            150000000,
            200000000,
            250000000,
            300000000
        ],
        montoExterno: [ 0, 0, 0, 0, 0, 0 ],
        montoRecuperado: [
            200000000,
            300000000,
            400000000,
            500000000,
            600000000,
            800000000
        ],
        cantidad: [
            4,
            5,
            6,
            7,
            8,
            9
        ]
    },
    pagos: {
        carrera: [
            0,
            0,
            400000,
            900000,
            1500000,
            2000000
        ],
        montoInterno: [
            0,
            300000,
            400000,
            600000,
            800000,
            1000000
        ],
        montoExterno: [ 0, 0, 0, 0, 0, 0 ],
        montoRecuperado: [
            200000,
            500000,
            900000,
            1500000,
            2000000,
            3000000
        ],
        cantidad: [
            0,
            400000,
            600000,
            700000,
            1000000,
            1200000
        ],
        equipo: [
            0,
            0,
            0,
            500000,
            800000,
            1000000
        ]
    },
    multiplicadores: {
        conversion: [
            { min: 15, mult: 1.1, text: "15%+" },
            { min: 11, mult: 1.0, text: "11%" },
            { min: 9,  mult: 0.8, text: "9%" },
            { min: 7,  mult: 0.7, text: "7%" },
            { min: 6,  mult: 0.6, text: "6%" },
            { min: 5,  mult: 0.5, text: "5%" },
            { min: 0,  mult: 0.5, text: "<5%" }
        ],
        empatia: [
            { min: 96, mult: 1.0, text: "96%+" },
            { min: 90, mult: 0.9, text: "90%" },
            { min: 80, mult: 0.5, text: "80%" },
            { min: 70, mult: 0.3, text: "70% o menor" },
            { min: 0,  mult: 0.3, text: "<70%" }
        ],
        proceso: [
            { min: 95, mult: 1.0,  text: "95%+" },
            { min: 90, mult: 0.95, text: "90%" },
            { min: 85, mult: 0.8,  text: "85%" },
            { min: 70, mult: 0.3,  text: "70% o menor" },
            { min: 0,  mult: 0.3,  text: "<70%" }
        ],
        mora: [
            { min: 0,  mult: 1.05, text: "0-2%" },
            { min: 8,  mult: 0.95, text: "8%" },
            { min: 10, mult: 0.9,  text: "10%" },
            { min: 15, mult: 0.85, text: "15%" },
            { min: 20, mult: 0.7,  text: "20% o menor" }
        ]
    }
}; 
