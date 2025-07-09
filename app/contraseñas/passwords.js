// Contraseñas centralizadas por usuario
const PASSWORDS = {
  Base: "202",
  Alejandra: "comercial2020",
  Aletzia: "comercial2020", 
  Alvaro: "comercial2020",
  Erika: "comercial2020",
  Juan: "comercial2020",
  Maximiliano: "comercial2027",
  Micaela: "comercial2026",
  Rodrigo: "comercial2028"
};

// Contraseña de administrador (común en todos)
const ADMIN_PASSWORD = "gtadmin";

// Función para obtener la contraseña del asesor
function getAsesorPassword(asesor) {
  return PASSWORDS[asesor] || PASSWORDS.Base;
}

// Función para obtener la contraseña de administrador
function getAdminPassword() {
  return ADMIN_PASSWORD;
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PASSWORDS, ADMIN_PASSWORD, getAsesorPassword, getAdminPassword };
} 