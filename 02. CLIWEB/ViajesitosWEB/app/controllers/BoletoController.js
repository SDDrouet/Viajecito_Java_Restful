const API_URL = 'http://192.168.18.158:8080/aerolineas_condor_server/api/boletos'; // Ajusta puerto y ruta base según tu servidor

// Obtener boletos por usuario
export const obtenerBoletosPorUsuario = async (idUsuario) => {
  try {
    const response = await fetch(`${API_URL}/usuario/${idUsuario}`);
    if (!response.ok) throw new Error('Error en respuesta del servidor');

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error al obtener boletos:', error);
    return [];
  }
};

// Registrar compra de boletos
// Registrar compra de boletos
export const registrarBoleto = async ({ idVuelo, idUsuario, cantidad = 1 }) => {
  try {
    const body = { idVuelo, idUsuario, cantidad };

    const response = await fetch(`${API_URL}/comprar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const resultText = await response.text();
    console.log("✔️ Respuesta del servidor:", resultText);
    return response.ok; // true si status 200–299
  } catch (error) {
    console.error('❌ Error al comprar boleto:', error);
    return false;
  }
};


