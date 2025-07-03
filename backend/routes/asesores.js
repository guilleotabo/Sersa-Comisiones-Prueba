const express = require('express');
const router = express.Router();
const { getAllAsesores } = require('../database');

// GET /api/asesores - Listar todos los asesores
router.get('/', async (req, res) => {
    try {
        const asesores = await getAllAsesores();
        
        res.json({
            success: true,
            count: asesores.length,
            data: asesores
        });
    } catch (error) {
        console.error('Error en GET /api/asesores:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// GET /api/asesores/categorias - Obtener estadísticas por categoría
router.get('/categorias', async (req, res) => {
    try {
        const asesores = await getAllAsesores();
        
        // Agrupar por categoría
        const categorias = {};
        asesores.forEach(asesor => {
            if (!categorias[asesor.categoria]) {
                categorias[asesor.categoria] = [];
            }
            categorias[asesor.categoria].push({
                nombre: asesor.nombre_asesor,
                created_at: asesor.created_at,
                updated_at: asesor.updated_at
            });
        });
        
        // Convertir a array con conteos
        const estadisticas = Object.keys(categorias).map(categoria => ({
            categoria,
            count: categorias[categoria].length,
            asesores: categorias[categoria]
        }));
        
        res.json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        console.error('Error en GET /api/asesores/categorias:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// GET /api/asesores/health - Verificar estado del sistema
router.get('/health', async (req, res) => {
    try {
        const asesores = await getAllAsesores();
        
        res.json({
            success: true,
            message: 'Sistema funcionando correctamente',
            timestamp: new Date().toISOString(),
            total_asesores: asesores.length,
            status: 'healthy'
        });
    } catch (error) {
        console.error('Error en GET /api/asesores/health:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el sistema',
            timestamp: new Date().toISOString(),
            status: 'unhealthy',
            error: error.message
        });
    }
});

module.exports = router; 