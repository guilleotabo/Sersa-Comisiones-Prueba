DROP TABLE IF EXISTS calculations CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS historial_calculos CASCADE;
DROP TABLE IF EXISTS configuraciones CASCADE;
DROP TABLE IF EXISTS configuracion_sistema CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS asesores CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    rol TEXT DEFAULT 'asesor' CHECK (rol IN ('asesor', 'admin')),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL CHECK (tipo IN ('global', 'user_specific')),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    config JSONB NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    resultado JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON users FOR ALL USING (true);
CREATE POLICY "Allow all" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all" ON calculations FOR ALL USING (true);

INSERT INTO settings (tipo, user_id, config) VALUES (
    'global',
    NULL,
    '{
        "base": 3000000,
        "niveles": ["Capilla", "Junior", "Senior A", "Senior B", "Máster", "Genio"],
        "metas": {
            "montoInterno": [700000000, 800000000, 900000000, 1000000000, 1100000000, 1200000000],
            "montoExterno": [80000000, 100000000, 120000000, 140000000, 160000000, 180000000],
            "montoRecuperado": [0, 30000000, 60000000, 90000000, 120000000, 150000000],
            "cantidad": [6, 7, 8, 9, 10, 11]
        },
        "pagos": {
            "carrera": [0, 0, 1000000, 1500000, 2000000, 2500000],
            "montoInterno": [1000000, 1500000, 2000000, 2500000, 3000000, 3500000],
            "montoExterno": [500000, 600000, 700000, 800000, 900000, 1000000],
            "montoRecuperado": [0, 300000, 400000, 500000, 600000, 700000],
            "cantidad": [500000, 700000, 900000, 1100000, 1300000, 1500000],
            "equipo": [0, 0, 500000, 600000, 700000, 800000]
        },
        "multiplicadores": {
            "conversion": [
                {"min": 7, "mult": 1.0, "text": "7%+"},
                {"min": 5, "mult": 0.8, "text": "5-6%"},
                {"min": 3, "mult": 0.6, "text": "3-4%"},
                {"min": 0, "mult": 0.0, "text": "Menos de 3%"}
            ],
            "empatia": [
                {"min": 90, "mult": 1.0, "text": "90%+"},
                {"min": 80, "mult": 0.9, "text": "80-89%"},
                {"min": 70, "mult": 0.8, "text": "70-79%"},
                {"min": 0, "mult": 0.0, "text": "Menos de 70%"}
            ],
            "proceso": [
                {"min": 90, "mult": 1.0, "text": "90%+"},
                {"min": 80, "mult": 0.9, "text": "80-89%"},
                {"min": 70, "mult": 0.8, "text": "70-79%"},
                {"min": 0, "mult": 0.0, "text": "Menos de 70%"}
            ],
            "mora": [
                {"min": 0, "mult": 1.0, "text": "0-2%"},
                {"min": 3, "mult": 0.8, "text": "3-7%"},
                {"min": 8, "mult": 0.0, "text": "8%+"}
            ]
        },
        "nombres_bonos": {
            "interno": "📊 MONTO INTERNO - Meta desembolso | Bono",
            "externo": "💎 MONTO EXTERNO/REFERENCIADO - Meta | Bono",
            "cantidad": "🎯 CANTIDAD DESEMBOLSOS - Meta | Bono | Llave",
            "recuperados": "🔄 RECUPERADOS +3 MESES - Meta | Bono",
            "carrera": "📈 BONO CARRERA - Según menor nivel entre mes actual y anterior",
            "equipo": "👥 BONO EQUIPO - Según menor nivel del equipo"
        }
    }'::jsonb
);

INSERT INTO users (nombre, email, password_hash, activo, rol) VALUES
('Base', 'base@sersa.com', '20', true, 'asesor'),
('Alejandra', 'alejandra@sersa.com', 'comercial2020', true, 'asesor'),
('Aletzia', 'aletzia@sersa.com', 'comercial2020', true, 'asesor'),
('Alvaro', 'alvaro@sersa.com', 'comercial2020', true, 'asesor'),
('Erika', 'erika@sersa.com', 'comercial2020', true, 'asesor'),
('Juan', 'juan@sersa.com', 'comercial2020', true, 'asesor'),
('Maximiliano', 'maximiliano@sersa.com', 'comercial2027', true, 'asesor'),
('Micaela', 'micaela@sersa.com', 'comercial2026', true, 'asesor'),
('Rodrigo', 'rodrigo@sersa.com', 'comercial2028', true, 'asesor'),
('Admin', 'admin@sersa.com', 'gtadmin', true, 'admin'); 