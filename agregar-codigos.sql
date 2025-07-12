-- SCRIPT CORREGIDO: AGREGAR CÓDIGOS NEMOTÉCNICOS A USUARIOS
-- Este script agrega códigos simples y amigables a los asesores

-- 1. Agregar columna código (si no existe)
ALTER TABLE users ADD COLUMN IF NOT EXISTS codigo VARCHAR(8) UNIQUE;

-- 2. Generar códigos usando un enfoque compatible
-- Primero crear una tabla temporal con los códigos
WITH asesores_numerados AS (
    SELECT 
        id,
        nombre,
        ROW_NUMBER() OVER (ORDER BY nombre) as numero
    FROM users 
    WHERE rol = 'asesor'
)
UPDATE users 
SET codigo = 'ASR' || LPAD(an.numero::text, 3, '0')
FROM asesores_numerados an
WHERE users.id = an.id;

-- 3. Verificar resultado
SELECT 
    nombre, 
    codigo, 
    LEFT(id::text, 8) || '...' as uuid_corto 
FROM users 
WHERE rol = 'asesor' 
ORDER BY nombre;

-- 4. Contar códigos generados
SELECT 
    COUNT(*) as total_asesores,
    COUNT(codigo) as asesores_con_codigo,
    COUNT(*) - COUNT(codigo) as asesores_sin_codigo
FROM users 
WHERE rol = 'asesor'; 