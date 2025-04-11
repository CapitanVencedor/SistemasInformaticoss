// server/scripts/monitor_apis.js

// Función para monitorear el estado de la API de CoinGecko
async function monitorAPI() {
    const url = 'https://api.coingecko.com/api/v3/ping';  // Endpoint de prueba de CoinGecko
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Error en la API: ${response.status} ${response.statusText}`);
        // Aquí podrías registrar la incidencia en la auditoría, por ejemplo:
        // const { registrarAuditoria } = require('./auditoria');
        // registrarAuditoria(null, `Error en CoinGecko API: ${response.status}`, 'MONITOR_API');
      } else {
        const data = await response.json();
        console.log('Respuesta de la API CoinGecko:', data);
      }
    } catch (error) {
      console.error('Error en monitor_apis:', error);
      // También podrías registrar este error en la auditoría:
      // const { registrarAuditoria } = require('./auditoria');
      // registrarAuditoria(null, `Excepción en monitor_apis: ${error.message}`, 'MONITOR_API');
    }
  }
  
  // Ejecuta la monitorización al iniciar este script
  monitorAPI();
  
  // Exporta la función para que otros módulos puedan llamarla (por ejemplo, desde un cron job)
  module.exports = {
    monitorAPI
  };
  