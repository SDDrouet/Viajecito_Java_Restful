const BASE_URL = 'http://localhost:8080/aerolineas_condor_server/api';

// ────────────────────────────────────────────────
// 🔹 1. BOLETOS
// ────────────────────────────────────────────────
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
      idVuelo: b.idVuelo?.idVuelo || b.idVuelo,
      idUsuario: b.idUsuario?.idUsuario || b.idUsuario
    }));
  } catch (error) {
    console.error('❌ Error al obtener boletos (REST):', error);
    return [];
  }
};

export const registrarBoletos = async ({
  idUsuario,
  vuelos,
  esCredito = false,
  numeroCuotas = 0,
  tasaInteresAnual = 0
}) => {
  const payload = {
    idUsuario,
    vuelos, // Array: [{ idVuelo, cantidad }]
    esCredito,
    numeroCuotas,
    tasaInteresAnual
  };

  try {
    const response = await fetch(`${BASE_URL}/boletos/comprar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const mensaje = await response.text();
      console.warn('⚠️ Error al comprar boletos:', mensaje);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error al registrar boletos (REST):', error);
    return false;
  }
};

// ────────────────────────────────────────────────
// 🔹 2. AMORTIZACIÓN
// ────────────────────────────────────────────────
export const obtenerAmortizacionPorFactura = async (idFactura) => {
  try {
    const response = await fetch(`${BASE_URL}/amortizacion/factura/${idFactura}`);
    if (!response.ok) throw new Error('Error al obtener amortización');

    const amortizaciones = await response.json();

    return amortizaciones.map(a => ({
      idAmortizacion: a.idAmortizacion,
      idFactura: a.idFactura?.idFactura || a.idFactura,
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

// ────────────────────────────────────────────────
// 🔹 3. CIUDADES
// ────────────────────────────────────────────────
export const obtenerCiudades = async () => {
  try {
    const response = await fetch(`${BASE_URL}/ciudades`);
    if (!response.ok) throw new Error('Error al obtener ciudades');

    const ciudades = await response.json();

    return ciudades.map(c => ({
      id: c.idCiudad,
      codigo: c.codigoCiudad,
      nombre: c.nombreCiudad
    }));
  } catch (error) {
    console.error('❌ Error al obtener ciudades (REST):', error);
    return [];
  }
};

export const obtenerCiudadPorId = async (idCiudad) => {
  try {
    const response = await fetch(`${BASE_URL}/ciudades/${idCiudad}`);
    if (!response.ok) throw new Error('Ciudad no encontrada');

    const c = await response.json();

    // Devolver en formato esperado por la vista (con prefijos a:)
    return {
      'a:IdCiudad': c.idCiudad,
      'a:CodigoCiudad': c.codigoCiudad,
      'a:NombreCiudad': c.nombreCiudad,
      // También sin prefijos por compatibilidad
      id: c.idCiudad,
      codigo: c.codigoCiudad,
      nombre: c.nombreCiudad
    };
  } catch (error) {
    console.error('❌ Error al obtener ciudad por ID (REST):', error);
    return null;
  }
};

// ────────────────────────────────────────────────
// 🔹 4. FACTURAS - ADAPTADO PARA VISTAS SOAP
// ────────────────────────────────────────────────
export const getFacturasPorUsuario = async (idUsuario) => {
  try {
    const response = await fetch(`${BASE_URL}/facturas/usuario/${idUsuario}`);
    if (!response.ok) throw new Error('Error al obtener facturas');

    const facturas = await response.json();
    console.log('Facturas REST recibidas:', facturas);

    // Mapear al formato esperado por la vista (con prefijos a:)
    return facturas.map(f => ({
      // Con prefijos a: para la vista
      'a:IdFactura': f.idFactura,
      'a:NumeroFactura': f.numeroFactura,
      'a:FechaFactura': f.fechaFactura,
      'a:PrecioSinIVA': parseFloat(f.precioSinIva),
      'a:PrecioConIVA': parseFloat(f.precioConIva),
      'a:IdUsuario': f.idUsuario?.idUsuario || f.idUsuario,
      'a:EsCredito': f.esCredito,
      'a:NumeroCuotas': f.numeroCuotas,
      'a:TasaInteres': f.tasaInteres,
      
      // Sin prefijos para compatibilidad
      IdFactura: f.idFactura,
      numeroFactura: f.numeroFactura,
      fechaFactura: f.fechaFactura,
      precioConIVA: parseFloat(f.precioConIva),
      IdUsuario: f.idUsuario?.idUsuario || f.idUsuario
    }));
  } catch (error) {
    console.error('❌ Error al obtener facturas por usuario (REST):', error);
    return [];
  }
};

export const obtenerFacturaPorId = async (idFactura) => {
  try {
    const response = await fetch(`${BASE_URL}/facturas/${idFactura}`);
    if (!response.ok) throw new Error('Factura no encontrada');

    const f = await response.json();
    console.log('Factura detalle REST:', f);

    // Buscar boletos en diferentes posibles ubicaciones
    const boletos = f.boletosCollection || f.boletos || f.boletosRelacionados || [];
    console.log('Boletos encontrados:', boletos);

    return {
      // Con prefijos a: para la vista
      'a:IdFactura': f.idFactura,
      'a:NumeroFactura': f.numeroFactura,
      'a:FechaFactura': f.fechaFactura,
      'a:PrecioSinIVA': parseFloat(f.precioSinIva || f.precioSinIVA || 0),
      'a:PrecioConIVA': parseFloat(f.precioConIva || f.precioConIVA || 0),
      'a:IdUsuario': f.idUsuario?.idUsuario || f.idUsuario,
      'a:EsCredito': f.esCredito,
      'a:NumeroCuotas': f.numeroCuotas,
      'a:TasaInteres': f.tasaInteres,
      
      // Sin prefijos para compatibilidad
      IdFactura: f.idFactura,
      NumeroFactura: f.numeroFactura,
      FechaFactura: f.fechaFactura,
      PrecioSinIVA: parseFloat(f.precioSinIva || f.precioSinIVA || 0),
      PrecioConIVA: parseFloat(f.precioConIva || f.precioConIVA || 0),
      
      // Boletos relacionados en formato esperado
      'a:BoletosRelacionados': {
        'a:Boletos': Array.isArray(boletos) ? boletos.map(b => ({
          'a:IdBoleto': b.idBoleto,
          'a:NumeroBoleto': b.numeroBoleto || b.codigoBoleto || `BOL-${b.idBoleto}`,
          'a:FechaCompra': b.fechaCompra || b.fechaEmision || new Date().toISOString(),
          'a:PrecioCompra': parseFloat(b.precioCompra || b.precio || b.valor || 0),
          'a:IdVuelo': typeof b.idVuelo === 'object' ? b.idVuelo.idVuelo : b.idVuelo,
          'a:IdUsuario': typeof b.idUsuario === 'object' ? b.idUsuario.idUsuario : b.idUsuario
        })) : []
      }
    };
  } catch (error) {
    console.error('❌ Error al obtener factura por ID (REST):', error);
    return null;
  }
};

// ────────────────────────────────────────────────
// 🔹 5. VUELOS
// ────────────────────────────────────────────────
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
      idCiudadOrigen: v.idCiudadOrigen?.idCiudad || v.idCiudadOrigen,
      idCiudadDestino: v.idCiudadDestino?.idCiudad || v.idCiudadDestino
    }));
  } catch (error) {
    console.error('❌ Error al obtener vuelos (REST):', error);
    return [];
  }
};

export const buscarVuelos = async (origen, destino, fechaSalida) => {
  try {
    const params = new URLSearchParams({
      origen,
      destino,
      horaSalida: fechaSalida
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
      idCiudadOrigen: v.idCiudadOrigen?.idCiudad || v.idCiudadOrigen,
      idCiudadDestino: v.idCiudadDestino?.idCiudad || v.idCiudadDestino
    }));
  } catch (error) {
    console.error('❌ Error al buscar vuelos (REST):', error);
    return [];
  }
};

export const obtenerVueloPorId = async (idVuelo) => {
  try {
    const response = await fetch(`${BASE_URL}/vuelos/${idVuelo}`);
    if (!response.ok) throw new Error('Vuelo no encontrado');

    const v = await response.json();

    // Devolver en formato esperado por la vista (con prefijos a:)
    return {
      'a:IdVuelo': v.idVuelo,
      'a:CodigoVuelo': v.codigoVuelo,
      'a:HoraSalida': v.horaSalida,
      'a:Valor': parseFloat(v.valor),
      'a:Capacidad': v.capacidad,
      'a:Disponibles': v.disponibles,
      'a:IdCiudadOrigen': v.idCiudadOrigen?.idCiudad || v.idCiudadOrigen,
      'a:IdCiudadDestino': v.idCiudadDestino?.idCiudad || v.idCiudadDestino,
      // También sin prefijos por compatibilidad
      idVuelo: v.idVuelo,
      codigoVuelo: v.codigoVuelo,
      horaSalida: v.horaSalida,
      valor: parseFloat(v.valor),
      capacidad: v.capacidad,
      disponibles: v.disponibles,
      idCiudadOrigen: v.idCiudadOrigen?.idCiudad || v.idCiudadOrigen,
      idCiudadDestino: v.idCiudadDestino?.idCiudad || v.idCiudadDestino
    };
  } catch (error) {
    console.error('❌ Error al obtener vuelo por ID (REST):', error);
    return null;
  }
};