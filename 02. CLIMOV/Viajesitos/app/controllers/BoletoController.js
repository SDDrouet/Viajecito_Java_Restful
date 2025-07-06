const BASE_URL = 'http://localhost:8080/aerolineas_condor_server/api';

// 🔹 1. Obtener boletos por usuario (GET)
export const obtenerBoletosPorUsuario = async (idUsuario) => {
  try {
    const response = await fetch(`${BASE_URL}/boletos/usuario/${idUsuario}`);
    if (!response.ok) throw new Error('Error al obtener boletos');

    const boletos = await response.json();

    return boletos.map(b => ({
  idBoleto: b.idBoleto,
  numeroBoleto: b.numeroBoleto,
  fechaCompra: b.fechaCompra,
  precio: b.precioCompra,
  vuelo: {
    id: b.idVuelo?.idVuelo,
    codigo: b.idVuelo?.codigoVuelo,
    origen: b.idVuelo?.idCiudadOrigen?.codigoCiudad,
    destino: b.idVuelo?.idCiudadDestino?.codigoCiudad,
  }
}));


  } catch (error) {
    console.error('❌ Error al obtener boletos (REST):', error);
    return [];
  }
};

// 🔹 2. Registrar compra de boletos (POST)
export const registrarBoletos = async ({
  idUsuario,
  vuelos,
  esCredito = false,
  numeroCuotas = 0,
  tasaInteresAnual = 0
}) => {
  const payload = {
    idUsuario,
    vuelos,             // Array de { idVuelo, cantidad }
    esCredito,
    numeroCuotas,
    tasaInteresAnual
  };

  try {
    const response = await fetch(`${BASE_URL}/boletos/comprar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const mensaje = await response.text();
      console.warn('⚠️ Respuesta del servidor (compra):', mensaje);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al registrar boletos (REST):', error);
    return false;
  }
};

// 🔹 3. Obtener tabla de amortización por factura (GET)
export const obtenerAmortizacionPorFactura = async (idFactura) => {
  try {
    const response = await fetch(`${BASE_URL}/amortizacion/factura/${idFactura}`);
    if (!response.ok) throw new Error('Error al obtener amortización');

    const amortizaciones = await response.json();

    return amortizaciones.map(a => ({
      idAmortizacion: a.idAmortizacion,
      idFactura: a.idFactura?.idFactura,  // Verifica si es objeto
      numeroCuota: a.numeroCuota,
      valorCuota: parseFloat(a.valorCuota),
      interesPagado: parseFloat(a.interesPagado),
      capitalPagado: parseFloat(a.capitalPagado),
      saldo: parseFloat(a.saldo)
    }));
  } catch (error) {
    console.error('❌ Error al procesar amortización (REST):', error);
    return [];
  }
};
