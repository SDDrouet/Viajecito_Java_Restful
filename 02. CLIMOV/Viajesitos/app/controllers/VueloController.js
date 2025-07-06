const BASE_URL = 'http://localhost:8080/aerolineas_condor_server/api';

// 🔹 Obtener todos los vuelos (GET)
export const obtenerVuelos = async () => {
  try {
    const response = await fetch(`${BASE_URL}/vuelos`);
    if (!response.ok) throw new Error('Error al obtener vuelos');

    const vuelos = await response.json();

    return vuelos.map(v => ({
      IdVuelo: v.idVuelo,
      CodigoVuelo: v.codigoVuelo,
      HoraSalida: v.horaSalida,
      Valor: parseFloat(v.valor),
      Capacidad: v.capacidad,
      Disponibles: v.disponibles,
      IdCiudadOrigen: v.idCiudadOrigen?.idCiudad,
      IdCiudadDestino: v.idCiudadDestino?.idCiudad
    }));
  } catch (error) {
    console.error('❌ Error al obtener vuelos (REST):', error);
    return [];
  }
};

// 🔹 Buscar vuelos por origen, destino y fecha de salida (GET)
export const buscarVuelos = async (origen, destino, fechaSalida) => {
  try {
    const params = new URLSearchParams({
      origen,
      destino,
      horaSalida: fechaSalida // formato: yyyy-MM-dd
    });

    const response = await fetch(`${BASE_URL}/vuelos/buscar?${params.toString()}`);
    if (!response.ok) throw new Error('Error al buscar vuelos');

    const vuelos = await response.json();

    return vuelos.map(v => ({
      IdVuelo: v.idVuelo,
      CodigoVuelo: v.codigoVuelo,
      HoraSalida: v.horaSalida,
      Valor: parseFloat(v.valor),
      Capacidad: v.capacidad,
      Disponibles: v.disponibles,
      IdCiudadOrigen: v.idCiudadOrigen?.idCiudad,
      IdCiudadDestino: v.idCiudadDestino?.idCiudad
    }));
  } catch (error) {
    console.error('❌ Error al buscar vuelos (REST):', error);
    return [];
  }
};

// 🔹 Obtener vuelo por ID (GET)
export const obtenerVueloPorId = async (idVuelo) => {
  try {
    const response = await fetch(`${BASE_URL}/vuelos/${idVuelo}`);
    if (!response.ok) throw new Error('Vuelo no encontrado');

    const v = await response.json();

    return {
      IdVuelo: v.idVuelo,
      CodigoVuelo: v.codigoVuelo,
      HoraSalida: v.horaSalida,
      Valor: parseFloat(v.valor),
      Capacidad: v.capacidad,
      Disponibles: v.disponibles,
      IdCiudadOrigen: v.idCiudadOrigen?.idCiudad,
      IdCiudadDestino: v.idCiudadDestino?.idCiudad
    };
  } catch (error) {
    console.error('❌ Error al obtener vuelo por ID (REST):', error);
    return null;
  }
};
