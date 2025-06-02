const BASE_URL = 'http://192.168.18.158:8080/aerolineas_condor_server/api/ciudades'; // cambia IP según tu backend

// Obtener todas las ciudades
export const obtenerCiudades = async () => {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Error en la respuesta');

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error al obtener ciudades:', error);
    return [];
  }
};

// Obtener ciudad por ID
export const obtenerCiudadPorId = async (idCiudad) => {
  try {
    const response = await fetch(`${BASE_URL}/${idCiudad}`);
    if (!response.ok) throw new Error('Ciudad no encontrada');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error al obtener ciudad por ID:', error);
    return null;
  }
};
