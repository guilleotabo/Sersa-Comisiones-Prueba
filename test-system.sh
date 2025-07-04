#!/bin/bash

# Script rápido para ejecutar tests funcionales del Sistema SERSA Comisiones
# Uso: ./test-system.sh [opcion]

echo "🧪 TESTING FUNCIONAL - SISTEMA SERSA COMISIONES"
echo "================================================"

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Función para verificar si el servidor está funcionando
check_server() {
    echo "🔍 Verificando servidor backend..."
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Servidor backend funcionando"
        return 0
    else
        echo "❌ Servidor backend no está funcionando"
        echo "💡 Inicia el servidor con: cd backend && npm start"
        return 1
    fi
}

# Función para ejecutar todos los tests
run_all_tests() {
    echo "🚀 Ejecutando suite completa de tests..."
    node backend/scripts/ejecutar-tests-completos.js
}

# Función para ejecutar solo tests funcionales de datos
run_functional_tests() {
    echo "📊 Ejecutando tests funcionales de datos..."
    node backend/scripts/test-funcional-datos.js
}

# Función para ejecutar solo verificación de BD
run_db_health() {
    echo "🔍 Ejecutando verificación de salud de BD..."
    node backend/scripts/verificar-db-salud.js
}

# Función para mostrar ayuda
show_help() {
    echo ""
    echo "📖 USO:"
    echo "  ./test-system.sh              - Ejecutar todos los tests (recomendado)"
    echo "  ./test-system.sh functional   - Solo tests funcionales de datos"
    echo "  ./test-system.sh db-health    - Solo verificación de salud de BD"
    echo "  ./test-system.sh check        - Solo verificar si el servidor funciona"
    echo "  ./test-system.sh help         - Mostrar esta ayuda"
    echo ""
    echo "📋 PRERREQUISITOS:"
    echo "  • PostgreSQL funcionando"
    echo "  • Base de datos 'sersa_comisiones' creada"
    echo "  • Servidor backend ejecutándose (npm start)"
    echo "  • Configuración en backend/config.env"
    echo ""
    echo "🔧 SETUP RÁPIDO:"
    echo "  cd backend"
    echo "  npm install"
    echo "  cp config.env.example config.env"
    echo "  # Editar config.env con credenciales reales"
    echo "  node scripts/migrate.js"
    echo "  npm start"
    echo ""
}

# Parsear argumentos
case "${1:-all}" in
    "all"|"")
        if check_server; then
            run_all_tests
        else
            exit 1
        fi
        ;;
    "functional")
        if check_server; then
            run_functional_tests
        else
            exit 1
        fi
        ;;
    "db-health")
        run_db_health
        ;;
    "check")
        check_server
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Opción desconocida: $1"
        show_help
        exit 1
        ;;
esac

echo ""
echo "🏁 Comando completado"