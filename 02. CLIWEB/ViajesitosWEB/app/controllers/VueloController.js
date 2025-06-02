const API_URL = 'http://192.168.18.158:8080/aerolineas_condor_server/api/vuelos'; // Cambia IP según backend

// Obtener todos los vuelos
export const obtenerVuelos = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener vuelos');

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error al obtener vuelos:', error);
    return [];
  }
};

// Buscar vuelos con filtros
export const buscarVuelos = async (origen, destino, fechaSalida) => {
  try {
    const query = `?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}&horaSalida=${encodeURIComponent(fechaSalida)}`;
    const response = await fetch(`${API_URL}/buscar${query}`);
    
    if (!response.ok) throw new Error('Error al buscar vuelos');

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error al buscar vuelos:', error);
    return [];
  }
};
