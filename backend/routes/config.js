const express = require('express');
const router = express.Router();
const { 
    getConfiguracion, 
    updateConfiguracion, 
    getAllAsesores, 
    deleteConfiguracion 
} = require('../database');

// GET /api/config/:asesor - Obtener configuración de un asesor
router.get('/:asesor', async (req, res) => {
    try {
        const { asesor } = req.params;
        const configuracion = await getConfiguracion(asesor);
        
        if (!configuracion) {
            return res.status(404).json({
                success: false,
                message: `No se encontró configuración para el asesor: ${asesor}`
            });
        }
        
        res.json({
            success: true,
            data: configuracion
        });
    } catch (error) {
        console.error('Error en GET /api/config/:asesor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// PUT /api/config/:asesor - Actualizar configuración de un asesor
router.put('/:asesor', async (req, res) => {
    try {
        const { asesor } = req.params;
        const { categoria, config_data } = req.body;
        
        // Validar datos requeridos
        if (!categoria || !config_data) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren categoria y config_data'
            });
        }
        
        // Validar que config_data sea un objeto válido
        if (typeof config_data !== 'object' || config_data === null) {
            return res.status(400).json({
                success: false,
                message: 'config_data debe ser un objeto válido'
            });
        }
        
        const configuracionActualizada = await updateConfiguracion(asesor, categoria, config_data);
        
        res.json({
            success: true,
            message: `Configuración actualizada para ${asesor}`,
            data: configuracionActualizada
        });
    } catch (error) {
        console.error('Error en PUT /api/config/:asesor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// DELETE /api/config/:asesor - Eliminar configuración de un asesor
router.delete('/:asesor', async (req, res) => {
    try {
        const { asesor } = req.params;
        const configuracionEliminada = await deleteConfiguracion(asesor);
        
        if (!configuracionEliminada) {
            return res.status(404).json({
                success: false,
                message: `No se encontró configuración para eliminar: ${asesor}`
            });
        }
        
        res.json({
            success: true,
            message: `Configuración eliminada para ${asesor}`,
            data: configuracionEliminada
        });
    } catch (error) {
        console.error('Error en DELETE /api/config/:asesor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

module.exports = router; 