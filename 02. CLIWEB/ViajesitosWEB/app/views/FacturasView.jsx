import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFacturasPorUsuario, obtenerFacturaPorId } from '../controllers/FacturaController';
import { obtenerUsuarioPorId } from '../controllers/UsuarioController';
import { obtenerCiudades } from '../controllers/CiudadController';
import { obtenerVueloPorId } from '../controllers/VueloController';
import { obtenerCiudadPorId } from '../controllers/CiudadController';
import { obtenerAmortizacionPorFactura } from '../controllers/BoletoController';

export default function FacturasView() {
  const router = useRouter();
  const { idUsuario: idParam } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const [ciudades, setCiudades] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [boletosConDetalles, setBoletosConDetalles] = useState([]);

  // Determinar número de columnas basado en el tamaño de pantalla
  const getNumColumns = () => {
    if (isDesktop) return 3;
    if (isTablet) return 2;
    return 1;
  };

  // Key para forzar re-render cuando cambia el número de columnas
  const flatListKey = `${getNumColumns()}-${width}`;

  useFocusEffect(
    useCallback(() => {
      const cargarFacturas = async () => {
        setLoading(true);
        try {
          const idUsuarioActual = await obtenerIdUsuarioSeguro(idParam);
            if (!idUsuarioActual) {
            Alert.alert('Error', 'No se pudo obtener el usuario actual');
            router.replace('/');
            return;
            }


          const [datos, listaCiudades] = await Promise.all([
            getFacturasPorUsuario(idUsuarioActual),
            obtenerCiudades()
          ]);
          console.log('🧾 Facturas recibidas:', datos);
          console.log('📅 Primera fecha:', datos?.[0]?.['a:FechaFactura']);
          console.log('🔢 Primer número de factura:', datos?.[0]?.['a:NumeroFactura']);

          console.log('Ciudades cargadas:', listaCiudades);

          const ordenadas = Array.isArray(datos)
            ? datos.sort((a, b) => new Date(b['a:FechaFactura']) - new Date(a['a:FechaFactura']))
            : [];

          setFacturas(ordenadas);
          setCiudades(listaCiudades);
        } catch (e) {
          console.error('Error al cargar facturas:', e);
        } finally {
          setLoading(false);
        }
      };
      cargarFacturas();
    }, [idParam])
  );

const parseFechaISO = (input) => {
  if (!input) return null;
  const limpio = input.replace(/\[.*?\]/g, '');
  const fecha = new Date(limpio);
  return isNaN(fecha.getTime()) ? null : fecha;
};

const formatDate = (dateString) => {
  const fecha = parseFechaISO(dateString);
  if (!fecha) return 'Fecha inválida';
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


    const handleVolverMenu = async () => {
    const idUsuarioActual = await obtenerIdUsuarioSeguro(idParam);


    if (idUsuarioActual) {
        router.replace({
        pathname: '/views/MenuView', // o la ruta que uses
        params: { idUsuario: idUsuarioActual }
        });
    } else {
        router.replace('/');
    }
    };


const formatDateShort = (dateString) => {
  if (!dateString) return 'Fecha inválida';

  const limpio = dateString.replace(/\[.*?\]/g, '');
  const fecha = new Date(limpio);
  if (isNaN(fecha.getTime())) return 'Fecha inválida';

  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};


const obtenerIdUsuarioSeguro = async (idParam) => {
  if (idParam) return parseInt(idParam);
  const id = await AsyncStorage.getItem('idUsuario');
  return id ? parseInt(id) : null;
};

const [amortizacion, setAmortizacion] = useState([]);
const [tipoPago, setTipoPago] = useState("Cargando...");
const [modalAmortVisible, setModalAmortVisible] = useState(false);

const handleFacturaPress = async (idFactura, idUsuario) => {
  console.log('🔍 Factura presionada:', idFactura, idUsuario);
  try {
    const idUsuarioActual = await obtenerIdUsuarioSeguro(idUsuario);

    const [detalle, usuario, amort] = await Promise.all([
      obtenerFacturaPorId(Number(idFactura)),
      obtenerUsuarioPorId(Number(idUsuarioActual)),
      obtenerAmortizacionPorFactura(Number(idFactura))
    ]);

    setFacturaSeleccionada(detalle);
    setUsuarioSeleccionado(usuario);
    setAmortizacion(amort);
    setTipoPago(amort.length > 0 ? "Diferido (Crédito)" : "Contado (Pago completo)");

    await cargarDetallesBoletos(detalle['a:BoletosRelacionados']?.['a:Boletos'] || []);
    setModalVisible(true);
  } catch (error) {
    console.error("Error al obtener detalle:", error);
  }
};




// En FacturasView, actualiza la función cargarDetallesBoletos para usar el mapa de ciudades:

const cargarDetallesBoletos = async (boletos) => {
  try {
    // 👉 Normaliza a array si viene como objeto
    const lista = Array.isArray(boletos) ? boletos : [boletos];

    const boletosConInfo = await Promise.all(
      lista.map(async (boleto) => {
        try {
          const vuelo = await obtenerVueloPorId(boleto['a:IdVuelo']);
          
          if (vuelo) {
            // 🔍 DEBUG: Ver qué IDs estamos recibiendo
            console.log('🔍 Vuelo obtenido:', vuelo);
            console.log('🏙️ ID Ciudad Origen:', vuelo['a:IdCiudadOrigen']);
            console.log('🏙️ ID Ciudad Destino:', vuelo['a:IdCiudadDestino']);
            
            // Crear mapa de ciudades usando la lista ya cargada
            const mapaCiudades = {};
            ciudades.forEach((c) => {
              // Intentar diferentes formas de acceder al ID y nombre
              const id = c.id || c.idCiudad || c.IdCiudad;
              const nombre = c.nombre || c.nombreCiudad || c.NombreCiudad;
              if (id && nombre) {
                mapaCiudades[id] = nombre;
              }
            });
            
            console.log('🗺️ Mapa de ciudades disponible:', mapaCiudades);
            
            // Buscar las ciudades en el mapa en lugar de hacer llamadas individuales
            const idOrigen = vuelo['a:IdCiudadOrigen'] || vuelo.IdCiudadOrigen || vuelo.idCiudadOrigen;
            const idDestino = vuelo['a:IdCiudadDestino'] || vuelo.IdCiudadDestino || vuelo.idCiudadDestino;
            
            return {
              ...boleto,
              vuelo: vuelo,
              ciudadOrigen: mapaCiudades[idOrigen] || `Ciudad ID ${idOrigen} no encontrada`,
              ciudadDestino: mapaCiudades[idDestino] || `Ciudad ID ${idDestino} no encontrada`,
            };
          } else {
            console.log('⚠️ No se pudo obtener el vuelo para boleto:', boleto);
            return {
              ...boleto,
              ciudadOrigen: 'Vuelo no encontrado',
              ciudadDestino: 'Vuelo no encontrado',
            };
          }
        } catch (error) {
          console.error('Error interno por boleto:', error);
          return {
            ...boleto,
            ciudadOrigen: 'Error al cargar',
            ciudadDestino: 'Error al cargar',
          };
        }
      })
    );

    setBoletosConDetalles(boletosConInfo);
  } catch (error) {
    console.error('Error general en cargarDetallesBoletos:', error);
    const lista = Array.isArray(boletos) ? boletos : [boletos];
    setBoletosConDetalles(lista.map((b) => ({
      ...b,
      ciudadOrigen: 'Error al cargar',
      ciudadDestino: 'Error al cargar',
    })));
  }
};


  const getCardStyle = () => {
    const numColumns = getNumColumns();
    const padding = 16;
    const gap = 12;
    
    if (numColumns === 1) {
      return { width: '100%' };
    }
    
    const availableWidth = width - (padding * 2) - (gap * (numColumns - 1));
    const cardWidth = availableWidth / numColumns;
    
    return { width: cardWidth };
  };

  // Función para calcular totales correctamente
  const calcularTotales = (factura) => {
    let boletos = factura['a:BoletosRelacionados']?.['a:Boletos'] || [];
    // Normalizar: si es un solo objeto, envolver en array
    if (!Array.isArray(boletos)) {
    boletos = [boletos];
    }

    const subtotal = boletos.reduce((sum, boleto) => {
      return sum + parseFloat(boleto['a:PrecioCompra'] || 0);
    }, 0);
    
    const descuento = 0; // Si hay descuentos, agregar lógica aquí
    const subtotalConDescuento = subtotal - descuento;
    const iva = subtotalConDescuento * 0.15;
    const total = subtotalConDescuento + iva;
    
    return {
      subtotal: subtotal.toFixed(2),
      descuento: descuento.toFixed(2),
      subtotalConDescuento: subtotalConDescuento.toFixed(2),
      iva: iva.toFixed(2),
      total: total.toFixed(2)
    };
  };
const renderItem = ({ item, index }) => (
  <TouchableOpacity
    style={[
      styles.card,
      getCardStyle(),
      isLargeScreen && styles.cardLarge
    ]}
    onPress={() => handleFacturaPress(item['a:IdFactura'] || item.IdFactura, item['a:IdUsuario'] || item.IdUsuario)}
  >
    <View style={styles.cardHeader}>
      <Text style={[
        styles.cardTitle,
        isLargeScreen && styles.cardTitleLarge
      ]}>
        🧾 Factura {item['a:NumeroFactura'] || item.numeroFactura}
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>#{index + 1}</Text>
      </View>
    </View>
    <View style={styles.cardContent}>
      <View style={styles.infoRow}>
        <Text style={[styles.label, isLargeScreen && styles.labelLarge]}>📅 Fecha:</Text>
        <Text style={[styles.value, isLargeScreen && styles.valueLarge]}>
          {formatDate(item['a:FechaFactura'] || item.fechaFactura)}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.label, isLargeScreen && styles.labelLarge]}>💵 Total:</Text>
        <Text style={[styles.priceValue, isLargeScreen && styles.priceValueLarge]}>
          ${item['a:PrecioConIVA'] || item.precioConIVA || item.PrecioConIVA}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

  const getModalWidth = () => {
    if (isDesktop) return '70%';
    if (isTablet) return '85%';
    return '95%';
  };

  const getModalMaxHeight = () => {
    return height * 0.9;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <Text style={[
          styles.header,
          isLargeScreen && styles.headerLarge
        ]}>
          🧾 Mis Facturas
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4e88a9" />
            <Text style={styles.loadingText}>Cargando facturas...</Text>
          </View>
        ) : (
          <>
            {isLargeScreen ? (
              <View style={styles.tableWrapper}>
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableColHeader, styles.tableColNum]}>#</Text>
                    <Text style={[styles.tableColHeader, styles.tableColFactura]}>Factura</Text>
                    <Text style={[styles.tableColHeader, styles.tableColFecha]}>Fecha</Text>
                    <Text style={[styles.tableColHeader, styles.tableColTotal]}>Total</Text>
                  </View>
                  {facturas.map((item, index) => (
  <TouchableOpacity
    key={item['a:IdFactura'] || item.IdFactura || index}
    onPress={() => handleFacturaPress(item['a:IdFactura'] || item.IdFactura, item['a:IdUsuario'] || item.IdUsuario)}
  >
    <View style={[
      styles.tableRow,
      index % 2 === 0 && styles.tableRowEven
    ]}>
      <Text style={[styles.tableCol, styles.tableColNum]}>
        {index + 1}
      </Text>
      <Text style={[styles.tableCol, styles.tableColFactura]}>
        {item['a:NumeroFactura'] || item.numeroFactura}
      </Text>
      <Text style={[styles.tableCol, styles.tableColFecha]}>
        {formatDate(item['a:FechaFactura'] || item.fechaFactura)}
      </Text>
      <Text style={[styles.tableCol, styles.tableColTotal]}>
        ${item['a:PrecioConIVA'] || item.precioConIVA || item.PrecioConIVA}
      </Text>
    </View>
  </TouchableOpacity>
))}
                </View>
              </View>
            ) : (
              <FlatList
                key={flatListKey}
                data={facturas}
                numColumns={getNumColumns()}
                keyExtractor={(item, index) => item.IdFactura || index.toString()}
                renderItem={renderItem}
                columnWrapperStyle={getNumColumns() > 1 ? styles.row : null}
                contentContainerStyle={[
                  styles.listContainer,
                  isLargeScreen && styles.listContainerLarge
                ]}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}

        <Modal 
          visible={modalVisible} 
          transparent 
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContent,
              { 
                width: getModalWidth(),
                maxHeight: getModalMaxHeight()
              }
            ]}>
              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
                bounces={false}
              >
                {facturaSeleccionada ? (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={[
                        styles.modalTitle,
                        isLargeScreen && styles.modalTitleLarge
                      ]}>
                        🧾 Factura {facturaSeleccionada['a:NumeroFactura'] || facturaSeleccionada.NumeroFactura}
                      </Text>
                      <Text style={[
                        styles.modalSubtitle,
                        isLargeScreen && styles.modalSubtitleLarge
                      ]}>
                        Viajecitos S.A. | RUC: 1710708973001
                      </Text>
                      <Text style={[
                        styles.modalDate,
                        isLargeScreen && styles.modalDateLarge
                      ]}>
                        📅 Fecha de Emisión: {formatDate(facturaSeleccionada['a:FechaFactura'] || facturaSeleccionada.FechaFactura)}
                      </Text>
                    </View>

                    <View style={styles.section}>
                      <Text style={[
                        styles.sectionTitle,
                        isLargeScreen && styles.sectionTitleLarge
                      ]}>
                        👤 Datos del Cliente
                      </Text>
                      <View style={[
                        styles.clientInfo,
                        isLargeScreen && styles.clientInfoLarge
                      ]}>
                        <Text style={[styles.sectionItem, isLargeScreen && styles.sectionItemLarge]}>
                          <Text style={styles.bold}>Nombre:</Text> {usuarioSeleccionado?.Nombre || 'Desconocido'}
                        </Text>
                        <Text style={[styles.sectionItem, isLargeScreen && styles.sectionItemLarge]}>
                          <Text style={styles.bold}>Cédula:</Text> {usuarioSeleccionado?.Cedula || '-'}
                        </Text>
                        <Text style={[styles.sectionItem, isLargeScreen && styles.sectionItemLarge]}>
                          <Text style={styles.bold}>Teléfono:</Text> {usuarioSeleccionado?.Telefono || '-'}
                        </Text>
                        <Text style={[styles.sectionItem, isLargeScreen && styles.sectionItemLarge]}>
                          <Text style={styles.bold}>Correo:</Text> {usuarioSeleccionado?.Correo || '-'}
                        </Text>
                      </View>
                    </View>
<View style={styles.section}>
  <Text style={[
    styles.sectionTitle,
    isLargeScreen && styles.sectionTitleLarge
  ]}>
    🏦 Tipo de Pago
  </Text>
  <Text style={[
    styles.sectionItem,
    isLargeScreen && styles.sectionItemLarge
  ]}>
    {tipoPago}
  </Text>
</View>

{tipoPago === 'Diferido (Crédito)' && amortizacion.length > 0 && (
  <TouchableOpacity
    onPress={() => setModalAmortVisible(true)}
    style={styles.verAmortBtn}
  >
    <Text style={styles.verAmortText}>📊 Ver tabla de amortización</Text>
  </TouchableOpacity>
)}


                    <View style={styles.section}>
                      <Text style={[
                        styles.sectionTitle,
                        isLargeScreen && styles.sectionTitleLarge
                      ]}>
                        📄 Detalle de Boletos
                      </Text>
                      
                      {/* Tabla responsive para boletos */}
                      {isLargeScreen ? (
                        // Versión desktop/tablet - tabla horizontal
                        <View style={styles.boletosTableContainer}>
                          <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={true}
                            contentContainerStyle={styles.horizontalScrollContent}
                          >
                            <View style={styles.boletosTable}>
                              <View style={styles.boletosTableHeader}>
                                <Text style={[styles.boletosTableColHeader, styles.boletosColNum]}>#</Text>
                                <Text style={[styles.boletosTableColHeader, styles.boletosColBoleto]}>Núm. Boleto</Text>
                                <Text style={[styles.boletosTableColHeader, styles.boletosColRuta]}>Ruta</Text>
                                <Text style={[styles.boletosTableColHeader, styles.boletosColFecha]}>Fecha</Text>
                                <Text style={[styles.boletosTableColHeader, styles.boletosColCant]}>Cant.</Text>
                                <Text style={[styles.boletosTableColHeader, styles.boletosColPrecio]}>Precio Unit.</Text>
                              </View>
                              {boletosConDetalles.map((boleto, idx) => (
                                <View key={idx} style={[styles.boletosTableRow, idx % 2 === 0 && styles.boletosTableRowEven]}>
                                  <Text style={[styles.boletosTableCol, styles.boletosColNum]}>{idx + 1}</Text>
                                  <Text style={[styles.boletosTableCol, styles.boletosColBoleto]}>
                                    {boleto['a:NumeroBoleto']}
                                  </Text>
                                  <Text style={[styles.boletosTableCol, styles.boletosColRuta]}>
                                    {`${boleto.ciudadOrigen} → ${boleto.ciudadDestino}`}
                                  </Text>
                                  <Text style={[styles.boletosTableCol, styles.boletosColFecha]}>
                                    {formatDateShort(boleto['a:FechaCompra'])}
                                  </Text>
                                  <Text style={[styles.boletosTableCol, styles.boletosColCant]}>1</Text>
                                  <Text style={[styles.boletosTableCol, styles.boletosColPrecio]}>
                                    ${parseFloat(boleto['a:PrecioCompra']).toFixed(2)}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      ) : (
                        // Versión móvil - cards verticales
                        <View style={styles.boletosCardContainer}>
                          {boletosConDetalles.map((boleto, idx) => (
                            <View key={idx} style={styles.boletoCard}>
                              <View style={styles.boletoCardHeader}>
                                <Text style={styles.boletoCardTitle}>🎫 Boleto #{idx + 1}</Text>
                                <Text style={styles.boletoCardNumber}>{boleto['a:NumeroBoleto']}</Text>
                              </View>
                              <View style={styles.boletoCardContent}>
                                <View style={styles.boletoCardRow}>
                                  <Text style={styles.boletoCardLabel}>🛫 Ruta:</Text>
                                  <Text style={styles.boletoCardValue}>
                                    {`${boleto.ciudadOrigen} → ${boleto.ciudadDestino}`}
                                  </Text>
                                </View>
                                <View style={styles.boletoCardRow}>
                                  <Text style={styles.boletoCardLabel}>📅 Fecha:</Text>
                                  <Text style={styles.boletoCardValue}>
                                    {formatDateShort(boleto['a:FechaCompra'])}
                                  </Text>
                                </View>
                                <View style={styles.boletoCardRow}>
                                  <Text style={styles.boletoCardLabel}>💰 Precio:</Text>
                                  <Text style={styles.boletoCardPrice}>
                                    ${parseFloat(boleto['a:PrecioCompra']).toFixed(2)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    <View style={[styles.section, styles.totalSection]}>
                      {(() => {
                        const totales = calcularTotales(facturaSeleccionada);
                        return (
                          <>
                            <View style={styles.totalRow}>
                              <Text style={[styles.totalLabel, isLargeScreen && styles.totalLabelLarge]}>
                                🔢 Subtotal:
                              </Text>
                              <Text style={[styles.totalValue, isLargeScreen && styles.totalValueLarge]}>
                                ${totales.subtotal}
                              </Text>
                            </View>
                            <View style={styles.totalRow}>
                              <Text style={[styles.totalLabel, isLargeScreen && styles.totalLabelLarge]}>
                                🎯 Descuento:
                              </Text>
                              <Text style={[styles.totalValue, isLargeScreen && styles.totalValueLarge]}>
                                ${totales.descuento}
                              </Text>
                            </View>
                            <View style={styles.totalRow}>
                              <Text style={[styles.totalLabel, isLargeScreen && styles.totalLabelLarge]}>
                                💰 IVA (15%):
                              </Text>
                              <Text style={[styles.totalValue, isLargeScreen && styles.totalValueLarge]}>
                                ${totales.iva}
                              </Text>
                            </View>
                            <View style={[styles.totalRow, styles.totalRowFinal]}>
                              <Text style={[styles.totalLabel, styles.totalLabelFinal, isLargeScreen && styles.totalLabelFinalLarge]}>
                                💵 Total:
                              </Text>
                              <Text style={[styles.totalValue, styles.totalValueFinal, isLargeScreen && styles.totalValueFinalLarge]}>
                                ${totales.total}
                              </Text>
                            </View>
                          </>
                        );
                      })()}
                    </View>
                  </>
                ) : (
                  <View style={styles.loadingModal}>
                    <ActivityIndicator size="large" color="#4e88a9" />
                    <Text style={styles.loadingModalText}>Cargando detalles...</Text>
                  </View>
                )}
              </ScrollView>
              
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={[
                  styles.closeBtn,
                  isLargeScreen && styles.closeBtnLarge
                ]}
              >
                <Text style={[
                  styles.closeText,
                  isLargeScreen && styles.closeTextLarge
                ]}>
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
  visible={modalAmortVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setModalAmortVisible(false)}
>
  <View style={styles.amortModalOverlay}>
    <View style={[
      styles.amortModalContent,
      { 
        width: isDesktop ? '60%' : isTablet ? '80%' : '95%',
        maxWidth: isDesktop ? 800 : 600
      }
    ]}>
      <Text style={[
        styles.amortModalTitle,
        isLargeScreen && styles.amortModalTitleLarge
      ]}>
        📑 Tabla de Amortización
      </Text>

      {/* Resumen de totales */}
      <View style={styles.amortTotalesContainer}>
        <View style={styles.amortTotalItem}>
          <Text style={styles.amortTotalLabel}>Total a Pagar</Text>
          <Text style={styles.amortTotalValue}>
            ${amortizacion.reduce((sum, fila) => sum + fila.valorCuota, 0).toFixed(2)}
          </Text>
        </View>
        <View style={styles.amortTotalItem}>
          <Text style={styles.amortTotalLabel}>Total Intereses</Text>
          <Text style={styles.amortTotalValue}>
            ${amortizacion.reduce((sum, fila) => sum + fila.interesPagado, 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Tabla para pantallas grandes o cards para móvil */}
      {isLargeScreen ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.amortScrollContainer}
        >
          <View style={styles.amortTable}>
            {/* Cabecera */}
            <View style={styles.amortTableHeader}>
              <Text style={[styles.amortTableColHeader, styles.amortColCuota]}>Cuota</Text>
              <Text style={[styles.amortTableColHeader, styles.amortColValor]}>Valor</Text>
              <Text style={[styles.amortTableColHeader, styles.amortColInteres]}>Interés</Text>
              <Text style={[styles.amortTableColHeader, styles.amortColCapital]}>Capital</Text>
              <Text style={[styles.amortTableColHeader, styles.amortColSaldo]}>Saldo</Text>
            </View>

            {/* Filas */}
            {amortizacion.map((fila, idx) => (
              <View key={idx} style={[
                styles.amortTableRow,
                idx % 2 === 1 && styles.amortTableRowEven
              ]}>
                <Text style={[styles.amortTableCol, styles.amortColCuota]}>{fila.numeroCuota}</Text>
                <Text style={[styles.amortTableCol, styles.amortColValor, styles.amortColBold]}>
                  ${fila.valorCuota.toFixed(2)}
                </Text>
                <Text style={[styles.amortTableCol, styles.amortColInteres]}>
                  ${fila.interesPagado.toFixed(2)}
                </Text>
                <Text style={[styles.amortTableCol, styles.amortColCapital]}>
                  ${fila.capitalPagado.toFixed(2)}
                </Text>
                <Text style={[styles.amortTableCol, styles.amortColSaldo, styles.amortColBold]}>
                  ${fila.saldo.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        // Cards para móvil
        <ScrollView 
          style={styles.amortCardsScrollView}
          showsVerticalScrollIndicator={true}
        >
          {amortizacion.map((fila, idx) => (
            <View key={idx} style={[
              styles.amortCard,
              idx === amortizacion.length - 1 && styles.amortCardLast
            ]}>
              <View style={styles.amortCardHeader}>
                <Text style={styles.amortCardTitle}>Cuota {fila.numeroCuota}</Text>
                <Text style={styles.amortCardValor}>${fila.valorCuota.toFixed(2)}</Text>
              </View>
              <View style={styles.amortCardBody}>
                <View style={styles.amortCardRow}>
                  <View style={styles.amortCardItem}>
                    <Text style={styles.amortCardLabel}>Interés</Text>
                    <Text style={styles.amortCardValue}>${fila.interesPagado.toFixed(2)}</Text>
                  </View>
                  <View style={styles.amortCardItem}>
                    <Text style={styles.amortCardLabel}>Capital</Text>
                    <Text style={styles.amortCardValue}>${fila.capitalPagado.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={styles.amortCardSaldo}>
                  <Text style={styles.amortCardSaldoLabel}>Saldo Pendiente</Text>
                  <Text style={[
                    styles.amortCardSaldoValue,
                    fila.saldo === 0 && styles.amortCardSaldoPagado
                  ]}>
                    ${fila.saldo.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Nota informativa */}
      <View style={styles.amortResumen}>
        <Text style={styles.amortResumenText}>
          💡 Pago diferido en {amortizacion.length} cuotas mensuales
        </Text>
      </View>

      {/* Botón Cerrar */}
      <TouchableOpacity
        onPress={() => setModalAmortVisible(false)}
        style={[
          styles.amortCloseBtn,
          isLargeScreen && styles.amortCloseBtnLarge
        ]}
      >
        <Text style={[
          styles.amortCloseText,
          isLargeScreen && styles.amortCloseTextLarge
        ]}>
          Cerrar
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      </View>
      <View style={styles.menuButtonContainer}>
  <TouchableOpacity
    onPress={handleVolverMenu}
    style={styles.volverBtn}
    activeOpacity={0.85}
  >
    <Text style={styles.volverText}>← Volver al Menú</Text>
  </TouchableOpacity>
</View>

    </SafeAreaView>
  );
}



  // Estilos corregidos para tabla principal
 const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  container: { 
    flex: 1 
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#35798e',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 16
  },
  headerLarge: {
    fontSize: 36,
    marginVertical: 30
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center'
  },
  listContainer: {
    padding: 16,
    gap: 12
  },
  listContainerLarge: {
    padding: 24,
    gap: 16
  },
  row: {
    justifyContent: 'space-between',
    gap: 12
  },

  // Estilos corregidos para tabla principal
  tableWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  tableContainer: {
    width: '100%',
    maxWidth: 900,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#35798e',
    paddingVertical: 16,
    paddingHorizontal: 8
  },
  tableColHeader: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  tableRowEven: {
    backgroundColor: '#f8f9fa'
  },
  tableCol: {
    fontSize: 14,
    color: '#212529',
    textAlign: 'center'
  },
  
  // Columnas simétricas para tabla principal
  tableColNum: {
    flex: 0.8, // 10%
    minWidth: 40
  },
  tableColFactura: {
    flex: 2.5, // 30%
    minWidth: 120,
    fontWeight: '600'
  },
  tableColFecha: {
    flex: 3, // 40%
    minWidth: 140
  },
  tableColTotal: {
    flex: 1.7, // 20%
    minWidth: 80,
    fontWeight: 'bold',
    color: '#27ae60'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardLarge: {
    padding: 20,
    borderRadius: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#35798e',
    flex: 1
  },
  cardTitleLarge: {
    fontSize: 18
  },
  badge: {
    backgroundColor: '#4e88a9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 30,
    alignItems: 'center'
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },
  cardContent: {
    gap: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: { 
    fontSize: 14, 
    color: '#555',
    flex: 1
  },
  labelLarge: {
    fontSize: 16
  },
  value: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#000',
    textAlign: 'right',
    flex: 1
  },
  valueLarge: {
    fontSize: 16
  },
  priceValue: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#27ae60',
    textAlign: 'right',
    flex: 1
  },
  priceValueLarge: {
    fontSize: 18
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxWidth: 1000,
    margin: 20
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 0
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#35798e',
    textAlign: 'center'
  },
  modalTitleLarge: {
    fontSize: 28
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
    textAlign: 'center'
  },
  modalSubtitleLarge: {
    fontSize: 16
  },
  modalDate: {
    fontSize: 16,
    color: '#495057',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600'
  },
  modalDateLarge: {
    fontSize: 18
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#35798e'
  },
  sectionTitleLarge: {
    fontSize: 22,
    marginBottom: 16
  },
  clientInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    gap: 8
  },
  clientInfoLarge: {
    padding: 20,
    borderRadius: 10,
    gap: 10
  },
  sectionItem: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  sectionItemLarge: {
    fontSize: 16,
    lineHeight: 24
  },
  bold: {
    fontWeight: 'bold',
    color: '#495057'
  },
  centeredTableContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8
  },
  horizontalScrollContent: {
    alignItems: 'center'
  },
  table: {
    minWidth: 600
  },
  totalSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 8
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  totalRowFinal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#35798e'
  },
  totalLabel: {
    fontSize: 16,
    color: '#495057'
  },
  totalLabelLarge: {
    fontSize: 18
  },
  totalLabelFinal: {
    fontWeight: 'bold',
    color: '#35798e'
  },
  totalLabelFinalLarge: {
    fontSize: 20
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60'
  },
  totalValueLarge: {
    fontSize: 18
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  totalValueFinalLarge: {
    fontSize: 22
  },
  loadingModal: {
    alignItems: 'center',
    padding: 40,
    gap: 16
  },
  loadingModalText: {
    fontSize: 16,
    color: '#6c757d'
  },
  closeBtn: {
    backgroundColor: '#4e88a9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 120   
  },
  closeBtnLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    minWidth: 140  
  },
  closeText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  closeTextLarge: {
    fontSize: 18
  },
  boletosTableContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 10
  },
  boletosTable: {
    minWidth: 800,
  },
  menuButtonContainer: {
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: '#f8f9fa',
    alignItems: 'center'
  },
  volverBtn: {
    backgroundColor: '#4e88a9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: 220,
  },
  volverText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  boletosTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#35798e',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  boletosTableColHeader: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center'
  },
  boletosTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6'
  },
  boletosTableRowEven: {
    backgroundColor: '#f8f9fa'
  },
  boletosTableCol: {
    fontSize: 13,
    color: '#212529',
    textAlign: 'center'
  },
  boletosColNum: {
    width: 50
  },
  boletosColBoleto: {
    width: 130
  },
  boletosColRuta: {
    width: 220
  },
  boletosColFecha: {
    width: 120
  },
  boletosColCant: {
    width: 60
  },
  boletosColPrecio: {
    width: 100,
    fontWeight: 'bold',
    color: '#27ae60'
  },
  boletosCardContainer: {
    gap: 12
  },
  boletoCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10
  },
  boletoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  boletoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#35798e'
  },
  boletoCardNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d'
  },
  boletoCardContent: {
    gap: 8
  },
  boletoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  boletoCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057'
  },
  boletoCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529'
  },
  boletoCardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60'
  },
  verAmortBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#35798e',
    borderRadius: 8,
    alignItems: 'center'
  },
  verAmortText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15
  },
  
  // Estilos para modal de amortización mejorado
  amortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  amortModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    maxHeight: '90%',
  },
  amortModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2f6476',
    textAlign: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 20
  },
  amortModalTitleLarge: {
    fontSize: 26,
    paddingTop: 28,
    paddingBottom: 20
  },
  amortTotalesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e8f4f8',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
  },
  amortTotalItem: {
    alignItems: 'center',
  },
  amortTotalLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4
  },
  amortTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f6476'
  },
  amortScrollContainer: {
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  amortTable: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 500,
  },
  amortTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#35798e',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  amortTableColHeader: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center'
  },
  amortTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#fff'
  },
  amortTableRowEven: {
    backgroundColor: '#f8f9fa'
  },
  amortTableCol: {
    fontSize: 14,
    color: '#212529',
    textAlign: 'center'
  },
  amortColCuota: {
    width: 60,
    fontWeight: 'bold',
    color: '#35798e'
  },
  amortColValor: {
    width: 110
  },
  amortColInteres: {
    width: 100
  },
  amortColCapital: {
    width: 100
  },
  amortColSaldo: {
    width: 110
  },
  amortColBold: {
    fontWeight: '600'
  },
  
  // Estilos para cards móviles de amortización
  amortCardsScrollView: {
    maxHeight: 400,
    paddingHorizontal: 20
  },
  amortCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  amortCardLast: {
    borderColor: '#27ae60',
    borderWidth: 2
  },
  amortCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  amortCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#35798e'
  },
  amortCardValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60'
  },
  amortCardBody: {
    padding: 16
  },
  amortCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  amortCardItem: {
    flex: 1,
    alignItems: 'center'
  },
  amortCardLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4
  },
  amortCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529'
  },
  amortCardSaldo: {
    backgroundColor: '#f8f9fa',
    marginTop: 8,
    marginHorizontal: -16,
    marginBottom: -16,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef'
  },
  amortCardSaldoLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4
  },
  amortCardSaldoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057'
  },
  amortCardSaldoPagado: {
    color: '#27ae60'
  },
  amortResumen: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7'
  },
  amortResumenText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '600'
  },
  amortCloseBtn: {
    backgroundColor: '#4e88a9',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    margin: 20,
    alignSelf: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  amortCloseBtnLarge: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    minWidth: 140
  },
  amortCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
  amortCloseTextLarge: {
    fontSize: 18
  },
});