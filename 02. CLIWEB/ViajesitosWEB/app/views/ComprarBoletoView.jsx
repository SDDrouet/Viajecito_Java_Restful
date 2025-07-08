// ComprarBoletoView.js - Versión corregida

import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { obtenerCiudades } from '../controllers/CiudadController';
import { buscarVuelos } from '../controllers/VueloController';
import { registrarBoletos } from '../controllers/BoletoController';

export default function ComprarBoletoView() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const [usuario, setUsuario] = useState(null);
  const [ciudades, setCiudades] = useState([]);
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados para el carrito de compras
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [tipoPago, setTipoPago] = useState('contado'); // 'contado' o 'diferido'
  const [numeroCuotas, setNumeroCuotas] = useState(3); // Valores fijos: [1,3,6,12,15,24]
  const TASA_ANUAL_FIJA = 16.5; // tasa en % anual
  const [tablaAmortizacion, setTablaAmortizacion] = useState([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);

function calcularAmortizacion(monto, cuotas, tasaAnual = 16.5) {
  const tasaMensual = tasaAnual / 12 / 100;
  const cuotaFija = monto * (tasaMensual / (1 - Math.pow(1 + tasaMensual, -cuotas)));

  let saldo = monto;
  let interesTotal = 0;
  const tabla = [];

  for (let i = 1; i <= cuotas; i++) {
    const interes = saldo * tasaMensual;
    const capital = cuotaFija - interes;
    saldo -= capital;
    interesTotal += interes;

    tabla.push({
      cuota: i,
      valorCuota: cuotaFija.toFixed(2),
      interes: interes.toFixed(2),
      capital: capital.toFixed(2),
      saldo: Math.max(saldo, 0).toFixed(2),
    });
  }

  return { tabla, interesTotal: interesTotal.toFixed(2), cuotaMensual: cuotaFija.toFixed(2) };
}

  useFocusEffect(
    React.useCallback(() => {
      limpiarFormulario();
      const cargar = async () => {
        try {
          const data = await obtenerCiudades();
          setCiudades(Array.isArray(data) ? data.map(c => ({
            codigoCiudad: c.codigo,
            nombreCiudad: c.nombre
          })) : []);
        } catch (e) {
          console.error('Error cargando ciudades:', e);
          setCiudades([]);
        }

        try {
          const storedId = await AsyncStorage.getItem('idUsuario');
          if (storedId) {
            setUsuario(parseInt(storedId));
          } else {
            router.replace('/');
          }
        } catch (e) {
          console.error('Error obteniendo ID usuario:', e);
          router.replace('/');
        }
      };
      cargar();

      return () => limpiarFormulario();
    }, [])
  );

  const limpiarFormulario = () => {
    setOrigen('');
    setDestino('');
    setFecha('');
    setVuelos([]);
    setCarrito([]);
    setMensaje('');
    setModalVisible(false);
    setMostrarCarrito(false);
    setTipoPago('contado');      // <- Esto reinicia el tipo de pago
    setNumeroCuotas(3);          // <- Esto reinicia las cuotas
    
  };

  const handleVolverMenu = async () => {
    limpiarFormulario();
    let idUsuarioActual = usuario;
    if (!idUsuarioActual) {
      idUsuarioActual = await AsyncStorage.getItem('idUsuario');
    }
    if (idUsuarioActual) {
      router.replace({ pathname: '/views/MenuView', params: { idUsuario: idUsuarioActual } });
    } else {
      router.replace('/');
    }
  };

  const handleBuscarVuelos = async () => {
    if (!origen || !destino || origen === destino || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      Alert.alert('Error', 'Seleccione ciudades válidas y una fecha con formato correcto (YYYY-MM-DD).');
      return;
    }
    setLoading(true);
    try {
      const resultados = await buscarVuelos(origen, destino, fecha);
      const lista = Array.isArray(resultados) ? resultados : [];
      setVuelos(lista);
      if (lista.length === 0) Alert.alert('Sin vuelos disponibles');
    } catch (error) {
      console.error('Error al buscar vuelos:', error);
      Alert.alert('Error', 'No se pudo buscar vuelos.');
    } finally {
      setLoading(false);
    }
  };

  const getNombreCiudad = (codigo) => {
    const ciudad = ciudades.find(c => c.codigoCiudad === codigo);
    return ciudad ? ciudad.nombreCiudad : codigo;
  };

  // Agregar vuelo al carrito
// Funciones del carrito mejoradas con validaciones

// Agregar vuelo al carrito con validaciones mejoradas
const agregarAlCarrito = (vuelo, cantidad) => {
  const maxPermitido = Math.min(vuelo.Disponibles, 20);
  
  if (!cantidad || isNaN(cantidad) || cantidad <= 0 || cantidad > maxPermitido) {
    Alert.alert(
      'Cantidad inválida', 
      `Por favor ingrese una cantidad válida (1-${maxPermitido})`
    );
    return;
  }

  const vueloEnCarrito = carrito.find(item => item.idVuelo === vuelo.IdVuelo);
  
  if (vueloEnCarrito) {
    const nuevaCantidad = vueloEnCarrito.cantidad + cantidad;
    if (nuevaCantidad > maxPermitido) {
      Alert.alert(
        'Límite excedido', 
        `Cantidad total excedería el límite permitido: ${maxPermitido}\nActualmente tienes: ${vueloEnCarrito.cantidad}`
      );
      return;
    }
    
    setCarrito(carrito.map(item => 
      item.idVuelo === vuelo.IdVuelo 
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  } else {
    setCarrito([...carrito, {
      idVuelo: vuelo.IdVuelo,
      cantidad: cantidad,
      vuelo: { ...vuelo, origen, destino }
    }]);
  }

  Alert.alert(
    '¡Agregado al carrito!', 
    `${cantidad} boleto${cantidad !== 1 ? 's' : ''} del vuelo ${vuelo.CodigoVuelo}`
  );
};
const removerDelCarrito = (idVuelo) => {
  console.log('Intentando eliminar idVuelo:', idVuelo, typeof idVuelo);
  
  setCarrito(prevCarrito => {
    const nuevoCarrito = prevCarrito.filter(item => {
      console.log('Comparando:', item.idVuelo, typeof item.idVuelo, 'vs', idVuelo, typeof idVuelo);
      // Asegurar que ambos sean del mismo tipo
      return String(item.idVuelo) !== String(idVuelo);
    });
    console.log('Items antes:', prevCarrito.length, 'Items después:', nuevoCarrito.length);
    return nuevoCarrito;
  });
};

const actualizarCantidadCarrito = (idVuelo, nuevaCantidad) => {
  if (nuevaCantidad <= 0) {
    removerDelCarrito(idVuelo);
    return;
  }

  const item = carrito.find(c => c.idVuelo === idVuelo);
  if (!item) return;

  const maxPermitido = Math.min(item.vuelo.Disponibles, 20);
  
  if (nuevaCantidad > maxPermitido) {
    Alert.alert('Límite excedido', `Máximo permitido: ${maxPermitido} boletos`);
    return;
  }

  setCarrito(prevCarrito => prevCarrito.map(item => 
    item.idVuelo === idVuelo 
      ? { ...item, cantidad: nuevaCantidad }
      : item
  ));
};


// Componente para renderizar items del carrito mejorado
const renderCarritoItem = ({ item }) => {
  const maxPermitido = Math.min(item.vuelo.Disponibles, 20);
  
  return (
    <View style={[
      styles.carritoItem,
      isDesktop && styles.carritoItemDesktop
    ]}>
      <View style={styles.carritoInfo}>
        <Text style={[
          styles.carritoVuelo,
          isDesktop && { fontSize: 18 }
        ]}>✈️ {item.vuelo.CodigoVuelo}</Text>
        
        <Text style={[
          styles.carritoRuta,
          isDesktop && { fontSize: 15 }
        ]}>
          {getNombreCiudad(item.vuelo.origen)} → {getNombreCiudad(item.vuelo.destino)}
        </Text>
        
        <Text style={[
          styles.carritoSubtotal,
          isDesktop && { fontSize: 16 }
        ]}>
          {item.cantidad} × ${item.vuelo.Valor} = ${(parseFloat(item.vuelo.Valor) * item.cantidad).toFixed(2)}
        </Text>
        
        {maxPermitido < item.vuelo.Disponibles && (
          <Text style={[styles.limiteBoletosText, { fontSize: 11, marginTop: 4 }]}>
            Límite: {maxPermitido} por compra
          </Text>
        )}
      </View>
      
      <View style={styles.carritoControles}>
        <TouchableOpacity
          onPress={() => actualizarCantidadCarrito(item.idVuelo, item.cantidad - 1)}
          style={[
            styles.carritoBtn,
            item.cantidad <= 1 && styles.carritoBtnDisabled
          ]}
          disabled={item.cantidad <= 1}
        >
          <Text style={styles.carritoBtnText}>−</Text>
        </TouchableOpacity>
        
        <Text style={[
          styles.carritoCantidad,
          isDesktop && { fontSize: 18, minWidth: 40 }
        ]}>{item.cantidad}</Text>
        
        <TouchableOpacity
          onPress={() => actualizarCantidadCarrito(item.idVuelo, item.cantidad + 1)}
          style={[
            styles.carritoBtn,
            item.cantidad >= maxPermitido && styles.carritoBtnDisabled
          ]}
          disabled={item.cantidad >= maxPermitido}
        >
          <Text style={styles.carritoBtnText}>+</Text>
        </TouchableOpacity>
        
<TouchableOpacity
  onPress={() => removerDelCarrito(item.idVuelo)}
  style={styles.carritoEliminar}
>
  <Text style={styles.carritoEliminarText}>🗑️</Text>
</TouchableOpacity>

      </View>
    </View>
  );
};


// También agregar esta función para limpiar un item específico:
const limpiarItemCarrito = (idVuelo) => {
  Alert.alert(
    'Confirmar eliminación',
    '¿Estás seguro de eliminar este vuelo del carrito?',
    [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        onPress: () => removerDelCarrito(idVuelo),
        style: 'destructive' 
      }
    ]
  );
};

  // Actualizar cantidad en carrito
 

  // Procesar compra múltiple
  const procesarCompraMultiple = async () => {
    if (carrito.length === 0) {
      Alert.alert('Error', 'El carrito está vacío');
      return;
    }

    let idUsuarioActual = usuario;
    if (!idUsuarioActual) {
      const storedId = await AsyncStorage.getItem('idUsuario');
      if (storedId) {
        idUsuarioActual = parseInt(storedId);
      }
    }

    if (!idUsuarioActual || isNaN(idUsuarioActual)) {
      setMensaje('❌ ID de usuario no disponible.');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    
    try {
      const vuelosParaCompra = carrito.map(item => ({
        idVuelo: item.idVuelo,
        cantidad: item.cantidad
      }));

      const resultado = await registrarBoletos({
      idUsuario: idUsuarioActual,
      vuelos: vuelosParaCompra,
      esCredito: tipoPago === 'diferido',
      numeroCuotas: tipoPago === 'diferido' ? numeroCuotas : 0,
      tasaInteresAnual: tipoPago === 'diferido' ? TASA_ANUAL_FIJA : 0
    });


      if (resultado) {
        const totalBoletos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const totalPrecio = carrito.reduce((sum, item) => 
          sum + (parseFloat(item.vuelo.Valor) * item.cantidad), 0
        ).toFixed(2);

        const detalleCompra = carrito.map(item => 
          `✈ ${item.vuelo.CodigoVuelo} - ${item.cantidad} boleto(s) - $${(parseFloat(item.vuelo.Valor) * item.cantidad).toFixed(2)}`
        ).join('\n');

        setMensaje(`✅ Compra múltiple realizada\n\n${detalleCompra}\n\n🎟 Total boletos: ${totalBoletos}\n💵 Total: $${totalPrecio}`);
        setModalVisible(true);
        
        setTimeout(() => {
          limpiarFormulario();
          setModalVisible(false);
          router.replace({ pathname: '/views/MenuView', params: { idUsuario: usuario } });
        }, 4000);

      } else {
        setMensaje('❌ No se pudo completar la compra');
        setModalVisible(true);
      }
    } catch (e) {
      console.error('Error al comprar:', e);
      setMensaje('❌ Error inesperado en la compra múltiple.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const renderCiudadItem = (item, onSelect, selected) => (
    <TouchableOpacity
      key={item.codigoCiudad}
      style={[
        isDesktop ? styles.ciudadBtnDesktop : styles.ciudadBtn,
        selected === item.codigoCiudad && styles.ciudadBtnSelected
      ]}
      onPress={() => onSelect(item.codigoCiudad)}
    >
      <Text style={[
        styles.ciudadText,
        selected === item.codigoCiudad && styles.ciudadTextSelected
      ]}>
        {item.codigoCiudad} - {item.nombreCiudad}
      </Text>
    </TouchableOpacity>
  );

  // Componente para mostrar cada vuelo
// Componente VueloItem mejorado con stepper y validaciones
const VueloItem = ({ vuelo }) => {
  const [cantidad, setCantidad] = useState(1);
  const maxBoletos = Math.min(vuelo.Disponibles, 20); // Máximo 20 o disponibles
  
  const incrementarCantidad = () => {
    if (cantidad < maxBoletos) {
      setCantidad(cantidad + 1);
    }
  };
  
  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };
  
  const manejarAgregar = () => {
    if (cantidad <= 0 || cantidad > maxBoletos) {
      Alert.alert('Error', `Cantidad inválida. Máximo permitido: ${maxBoletos}`);
      return;
    }
    
    agregarAlCarrito(vuelo, cantidad);
    setCantidad(1); // Resetear después de agregar
  };

  const fechaVuelo = vuelo.HoraSalida.split('T')[0];
  const horaVuelo = vuelo.HoraSalida.split('T')[1].substring(0, 5);

  return (
    <View style={[
      styles.card,
      isTablet && styles.cardTablet,
      isDesktop && styles.cardDesktop
    ]}>
      <Text style={[
        styles.title,
        isDesktop && { fontSize: 22 }
      ]}>✈️ {vuelo.CodigoVuelo}</Text>
      
      <View style={isDesktop ? styles.vueloInfoDesktop : styles.vueloInfo}>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Origen:</Text>
          <Text style={[
            styles.infoValue,
            isDesktop && { fontSize: 17 }
          ]}>{getNombreCiudad(origen)}</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Destino:</Text>
          <Text style={[
            styles.infoValue,
            isDesktop && { fontSize: 17 }
          ]}>{getNombreCiudad(destino)}</Text>
        </View>
      </View>

      <View style={isDesktop ? styles.vueloInfoDesktop : styles.vueloInfo}>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Fecha:</Text>
          <Text style={[
            styles.infoValue,
            isDesktop && { fontSize: 17 }
          ]}>{fechaVuelo}</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Hora salida:</Text>
          <Text style={[
            styles.infoValue,
            isDesktop && { fontSize: 17 }
          ]}>{horaVuelo}</Text>
        </View>
      </View>

      <View style={isDesktop ? styles.vueloInfoDesktop : styles.vueloInfo}>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Precio:</Text>
          <Text style={[
            styles.infoValue, 
            { color: '#28a745', fontSize: isDesktop ? 22 : 18 }
          ]}>
            ${vuelo.Valor}
          </Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Disponibles:</Text>
          <Text style={[
            styles.infoValue,
            isDesktop && { fontSize: 17 }
          ]}>{vuelo.Disponibles}</Text>
        </View>
      </View>

      {/* Información de disponibilidad */}
      <View style={styles.disponibilidadInfo}>
        <Text style={styles.disponibilidadText}>
          Máximo por compra: {maxBoletos} boleto{maxBoletos !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Sistema de stepper mejorado */}
      <View style={styles.stepperContainer}>
        <Text style={[
          styles.stepperLabel,
          isDesktop && { fontSize: 18 }
        ]}>Cantidad:</Text>
        
        <TouchableOpacity
          style={[
            styles.stepperBtn,
            cantidad <= 1 && styles.stepperBtnDisabled
          ]}
          onPress={decrementarCantidad}
          disabled={cantidad <= 1}
        >
          <Text style={styles.stepperText}>−</Text>
        </TouchableOpacity>
        
        <Text style={[
          styles.stepperCount,
          isDesktop && { fontSize: 20, minWidth: 80 }
        ]}>{cantidad}</Text>
        
        <TouchableOpacity
          style={[
            styles.stepperBtn,
            cantidad >= maxBoletos && styles.stepperBtnDisabled
          ]}
          onPress={incrementarCantidad}
          disabled={cantidad >= maxBoletos}
        >
          <Text style={styles.stepperText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de límite si aplica */}
      {maxBoletos < vuelo.Disponibles && (
        <View style={styles.limiteBoletos}>
          <Text style={styles.limiteBoletosText}>
            ⚠️ Límite de 20 boletos por compra
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.btnAgregar,
          isDesktop && { paddingVertical: 18 }
        ]} 
        onPress={manejarAgregar}
      >
        <Text style={[
          styles.btnText,
          isDesktop && { fontSize: 18 }
        ]}>🛒 Agregar {cantidad} boleto{cantidad !== 1 ? 's' : ''} al carrito</Text>
      </TouchableOpacity>
    </View>
  );
};


  const renderFormSection = () => (
    <View style={[
      styles.formContainer,
      isDesktop && styles.formContainerDesktop
    ]}>
      <Text style={styles.header}>✈️ Buscar Vuelos</Text>

      <View style={[
        styles.formRow,
        isDesktop && styles.formRowDesktop
      ]}>
        <View style={[
          styles.formGroup,
          isDesktop && styles.formGroupDesktop
        ]}>
          <Text style={styles.subheader}>🛫 Ciudad de Origen</Text>
          {isDesktop ? (
            <View style={styles.ciudadGrid}>
              {ciudades.filter(c => c.codigoCiudad !== destino).map(c => 
                renderCiudadItem(c, setOrigen, origen)
              )}
            </View>
          ) : (
            <ScrollView horizontal contentContainerStyle={styles.selectorContainer}>
              {ciudades.filter(c => c.codigoCiudad !== destino).map(c => 
                renderCiudadItem(c, setOrigen, origen)
              )}
            </ScrollView>
          )}
        </View>

        <View style={[
          styles.formGroup,
          isDesktop && styles.formGroupDesktop
        ]}>
          <Text style={styles.subheader}>🛬 Ciudad de Destino</Text>
          {isDesktop ? (
            <View style={styles.ciudadGrid}>
              {ciudades.filter(c => c.codigoCiudad !== origen).map(c => 
                renderCiudadItem(c, setDestino, destino)
              )}
            </View>
          ) : (
            <ScrollView horizontal contentContainerStyle={styles.selectorContainer}>
              {ciudades.filter(c => c.codigoCiudad !== origen).map(c => 
                renderCiudadItem(c, setDestino, destino)
              )}
            </ScrollView>
          )}
        </View>
      </View>

      <View style={[
        styles.formGroup,
        isDesktop && styles.formGroupCentered
      ]}>
        <Text style={styles.subheader}>📅 Fecha de Vuelo</Text>
        <TextInput
          style={[
            styles.input,
            isDesktop && styles.inputDesktop
          ]}
          placeholder="YYYY-MM-DD"
          value={fecha}
          onChangeText={setFecha}
        />
      </View>

      <TouchableOpacity 
        style={[
          styles.btnBuscar,
          isDesktop && styles.btnBuscarDesktop
        ]} 
        onPress={handleBuscarVuelos}
      >
        <Text style={styles.btnText}>🔍 Buscar Vuelos</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVuelosList = () => {
    if (isDesktop) {
      // En desktop, mostrar en grid de 2 columnas
      const rows = [];
      for (let i = 0; i < vuelos.length; i += 2) {
        const vuelosEnFila = vuelos.slice(i, i + 2);
        rows.push(
          <View key={`row-${i}`} style={styles.vueloRow}>
            {vuelosEnFila.map((vuelo) => (
              <VueloItem key={vuelo.IdVuelo} vuelo={vuelo} />
            ))}
            {vuelosEnFila.length === 1 && <View style={styles.cardDesktop} />}
          </View>
        );
      }
      return <View>{rows}</View>;
    } else {
      // En móvil y tablet, usar FlatList normal
      return (
        <FlatList
          data={vuelos}
          keyExtractor={(item) => `vuelo-${item.IdVuelo}`}
          renderItem={({ item }) => <VueloItem vuelo={item} />}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      );
    }
  };

  const totalCarrito = carrito.reduce((sum, item) => 
    sum + (parseFloat(item.vuelo.Valor) * item.cantidad), 0
  ).toFixed(2);

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.scroll}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {renderFormSection()}

          {/* Botón del carrito flotante */}
          {carrito.length > 0 && (
            <TouchableOpacity
              style={styles.carritoFloating}
              onPress={() => setMostrarCarrito(true)}
            >
              <Text style={styles.carritoFloatingText}>
                🛒 {carrito.length} vuelo(s) - ${totalCarrito}
              </Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#35798e" />
              <Text style={styles.loadingText}>
                {carrito.length > 0 ? 'Procesando compra...' : 'Buscando vuelos...'}
              </Text>
            </View>
          ) : vuelos.length > 0 ? (
            renderVuelosList()
          ) : (
            fecha && origen && destino && (
              <Text style={styles.noVuelos}>
                No hay vuelos disponibles para esta búsqueda.
              </Text>
            )
          )}
        </View>

        {/* Modal del carrito */}
        <Modal visible={mostrarCarrito} transparent animationType="slide">
  <View style={styles.modalContainer}>
    <View style={[
      styles.modalContent,
      isDesktop && styles.modalContentDesktop,
      styles.carritoModal
    ]}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
      >
        <Text style={[
          styles.carritoHeader,
          isDesktop && styles.carritoHeaderDesktop
        ]}>🛒 Carrito de Compras</Text>
        
        {carrito.length === 0 ? (
          <Text style={styles.carritoVacio}>El carrito está vacío</Text>
        ) : (
          <>
            {/* Lista de items del carrito */}
            <View style={styles.carritoListaContainer}>
              {carrito.map((item) => (
                <View key={`carrito-${item.idVuelo}`} style={[
                  styles.carritoItem,
                  isDesktop && styles.carritoItemDesktop
                ]}>
                  <View style={styles.carritoInfo}>
                    <Text style={[
                      styles.carritoVuelo,
                      isDesktop && { fontSize: 18 }
                    ]}>✈️ {item.vuelo.CodigoVuelo}</Text>
                    
                    <Text style={[
                      styles.carritoRuta,
                      isDesktop && { fontSize: 15 }
                    ]}>
                      {getNombreCiudad(item.vuelo.origen)} → {getNombreCiudad(item.vuelo.destino)}
                    </Text>
                    
                    <Text style={[
                      styles.carritoSubtotal,
                      isDesktop && { fontSize: 16 }
                    ]}>
                      {item.cantidad} × ${item.vuelo.Valor} = ${(parseFloat(item.vuelo.Valor) * item.cantidad).toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.carritoControles}>
                    <TouchableOpacity
                      onPress={() => actualizarCantidadCarrito(item.idVuelo, item.cantidad - 1)}
                      style={[
                        styles.carritoBtn,
                        item.cantidad <= 1 && styles.carritoBtnDisabled
                      ]}
                      disabled={item.cantidad <= 1}
                    >
                      <Text style={styles.carritoBtnText}>−</Text>
                    </TouchableOpacity>
                    
                    <Text style={[
                      styles.carritoCantidad,
                      isDesktop && { fontSize: 18, minWidth: 40 }
                    ]}>{item.cantidad}</Text>
                    
                    <TouchableOpacity
                      onPress={() => actualizarCantidadCarrito(item.idVuelo, item.cantidad + 1)}
                      style={[
                        styles.carritoBtn,
                        item.cantidad >= Math.min(item.vuelo.Disponibles, 20) && styles.carritoBtnDisabled
                      ]}
                      disabled={item.cantidad >= Math.min(item.vuelo.Disponibles, 20)}
                    >
                      <Text style={styles.carritoBtnText}>+</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => removerDelCarrito(item.idVuelo)}
                      style={styles.carritoEliminar}
                    >
                      <Text style={styles.carritoEliminarText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            
            {/* Resumen del carrito */}
            <View style={[
              styles.carritoResumen,
              isDesktop && styles.carritoResumenDesktop
            ]}>
              <Text style={[
                styles.carritoTotal,
                isDesktop && styles.carritoTotalDesktop
              ]}>
                Total: ${totalCarrito}
              </Text>
              <Text style={styles.carritoTotalBoletos}>
                {carrito.reduce((sum, item) => sum + item.cantidad, 0)} boleto(s)
              </Text>
            </View>

            {/* Sección de tipo de pago */}
            <View style={styles.tipoPagoContainer}>
              <Text style={styles.subheader}>💰 Tipo de Pago</Text>
              <View style={styles.tipoPagoBotones}>
                <TouchableOpacity 
                  onPress={() => setTipoPago('contado')} 
                  style={[
                    styles.tipoPagoBtn, 
                    tipoPago === 'contado' && styles.tipoPagoBtnSelected
                  ]}
                >
                  <Text style={[
                    styles.tipoPagoBtnText,
                    tipoPago === 'contado' && styles.tipoPagoBtnTextSelected
                  ]}>Pago al Contado</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setTipoPago('diferido')} 
                  style={[
                    styles.tipoPagoBtn, 
                    styles.tipoPagoBtnDiferido,
                    tipoPago === 'diferido' && styles.tipoPagoBtnSelected
                  ]}
                >
                  <Text style={[
                    styles.tipoPagoBtnText,
                    tipoPago === 'diferido' && styles.tipoPagoBtnTextSelected
                  ]}>Pago Diferido</Text>
                </TouchableOpacity>
              </View>

              {tipoPago === 'diferido' && (
                <View style={styles.cuotasContainer}>
                  <Text style={styles.cuotasLabel}>📆 Número de Cuotas</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.cuotasScroll}
                  >
                    {[3, 6, 12, 15].map((cuota) => (
                      <TouchableOpacity
                        key={cuota}
                        onPress={() => setNumeroCuotas(cuota)}
                        style={[
                          styles.cuotaBtn,
                          numeroCuotas === cuota && styles.cuotaBtnSelected
                        ]}
                      >
                        <Text style={[
                          styles.cuotaBtnText,
                          numeroCuotas === cuota && styles.cuotaBtnTextSelected
                        ]}>
                          {cuota} {cuota === 1 ? 'mes' : 'meses'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.btnVerAmortizacion}
                    onPress={() => {
                      const total = carrito.reduce((sum, item) => 
                        sum + (parseFloat(item.vuelo.Valor) * item.cantidad), 0
                      );
                      const resultado = calcularAmortizacion(total, numeroCuotas, TASA_ANUAL_FIJA);
                      setTablaAmortizacion(resultado);
                      setMostrarTabla(true);
                    }}
                  >
                    <Text style={styles.btnText}>📊 Ver Tabla Amortización</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Botón de comprar */}
            <TouchableOpacity
              style={[
                styles.btnComprarTodo,
                isDesktop && styles.btnComprarTodoDesktop
              ]}
              onPress={procesarCompraMultiple}
            >
              <Text style={styles.btnText}>💳 Comprar Todo</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Botón cerrar */}
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => {
            setMostrarCarrito(false);
            setTipoPago('contado');
            setNumeroCuotas(3);
          }}
        >
          <Text style={styles.modalButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </View>
</Modal>

{/* Modal de Tabla de Amortización */}
<Modal
  visible={mostrarTabla}
  animationType="slide"
  transparent
  onRequestClose={() => setMostrarTabla(false)}
>
  <View style={styles.modalAmortizacionContainer}>
    <View style={[
      styles.modalAmortizacionContent,
      isDesktop && styles.modalAmortizacionContentDesktop
    ]}>
      <ScrollView 
        contentContainerStyle={styles.modalAmortizacionScroll}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.modalAmortizacionTitle}>
          📄 Resumen de Cuotas
        </Text>

        <View style={styles.resumenAmortizacion}>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>💳 Cuotas Totales:</Text>
            <Text style={styles.resumenValue}>{numeroCuotas}</Text>
          </View>
          
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>💵 Cuota Mensual:</Text>
            <Text style={styles.resumenValue}>
              ${tablaAmortizacion.cuotaMensual}
            </Text>
          </View>
          
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>📊 Total Intereses:</Text>
            <Text style={[styles.resumenValue, styles.resumenValueRed]}>
              ${tablaAmortizacion.interesTotal}
            </Text>
          </View>
          
          <View style={[styles.resumenRow, styles.resumenRowTotal]}>
            <Text style={styles.resumenLabelTotal}>💰 Total a Pagar:</Text>
            <Text style={styles.resumenValueTotal}>
              ${(numeroCuotas * parseFloat(tablaAmortizacion.cuotaMensual || 0)).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Tabla detallada (opcional - solo para desktop) */}
        {isDesktop && tablaAmortizacion.tabla && (
          <View style={styles.tablaDetalleContainer}>
            <Text style={styles.tablaDetalleTitle}>Detalle por Cuota</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.tablaDetalle}>
                <View style={styles.tablaDetalleHeader}>
                  <Text style={[styles.tablaDetalleCell, styles.tablaCellSmall]}>Cuota</Text>
                  <Text style={styles.tablaDetalleCell}>Valor</Text>
                  <Text style={styles.tablaDetalleCell}>Interés</Text>
                  <Text style={styles.tablaDetalleCell}>Capital</Text>
                  <Text style={styles.tablaDetalleCell}>Saldo</Text>
                </View>
                {tablaAmortizacion.tabla.map((fila, idx) => (
                  <View key={idx} style={[
                    styles.tablaDetalleRow,
                    idx % 2 === 0 && styles.tablaDetalleRowEven
                  ]}>
                    <Text style={[styles.tablaDetalleCell, styles.tablaCellSmall]}>
                      {fila.cuota}
                    </Text>
                    <Text style={styles.tablaDetalleCell}>
                      ${fila.valorCuota}
                    </Text>
                    <Text style={styles.tablaDetalleCell}>
                      ${fila.interes}
                    </Text>
                    <Text style={styles.tablaDetalleCell}>
                      ${fila.capital}
                    </Text>
                    <Text style={styles.tablaDetalleCell}>
                      ${fila.saldo}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setMostrarTabla(false)}
          style={styles.modalAmortizacionCloseBtn}
        >
          <Text style={styles.modalAmortizacionCloseBtnText}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </View>
</Modal>

        {/* Modal de mensajes */}
<Modal visible={modalVisible} transparent animationType="fade">
  <View style={styles.modalMensajeContainer}>
    <View style={[
      styles.modalMensajeContent,
      isDesktop && styles.modalMensajeContentDesktop
    ]}>
      <Text style={styles.modalMensajeText}>{mensaje}</Text>
      <TouchableOpacity
        style={styles.modalMensajeButton}
        onPress={() => {
          setModalVisible(false);
          if (mensaje.startsWith('✅')) {
            limpiarFormulario();
            router.replace({ pathname: '/views/MenuView', params: { idUsuario: usuario } });
          }
        }}
      >
        <Text style={styles.modalMensajeButtonText}>Aceptar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

        <View style={styles.volverContainer}>
          <TouchableOpacity
            onPress={handleVolverMenu}
            style={[
              styles.volverBtn,
              isDesktop && styles.volverBtnDesktop
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.volverText}>← Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  scroll: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  
  // Contenedor principal mejorado
  container: {
    padding: 16,
    alignItems: 'center',
    maxWidth: 1400, // Aumentado para desktop
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16, // Móvil
  },
  
  // Contenedor del formulario con mejor responsividad
  formContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16, // Reducido en móvil
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  formContainerDesktop: {
    padding: 40, // Aumentado para desktop
    maxWidth: 1200, // Más ancho en desktop
    marginBottom: 32,
  },
  
  // Header mejorado
  header: {
    fontSize: 24, // Reducido en móvil
    fontWeight: 'bold',
    color: '#35798e',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Filas del formulario con mejor distribución
  formRow: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  
  formRowDesktop: {
    flexDirection: 'row',
    gap: 40, // Más separación en desktop
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  // Grupos del formulario
  formGroup: {
    width: '100%',
    marginBottom: 16,
  },
  
  formGroupDesktop: {
    flex: 1,
    marginBottom: 20,
  },
  
  formGroupCentered: {
    alignItems: 'center',
    maxWidth: 350, // Aumentado
    alignSelf: 'center',
    marginBottom: 24,
  },
  
  // Subtítulos mejorados
  subheader: {
    fontSize: 16, // Reducido en móvil
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  
  // Input mejorado
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    padding: 14, // Reducido en móvil
    borderRadius: 12,
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  
  inputDesktop: {
    maxWidth: 350, // Aumentado
    fontSize: 18,
    padding: 20, // Más padding en desktop
  },
  
  inputCantidad: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#35798e',
    padding: 8,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 60,
    maxWidth: 80,
  },
  
  // Grid de ciudades mejorado
  ciudadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10, // Más separación
    paddingHorizontal: 8,
  },
  
  // Botones de ciudad mejorados
  ciudadBtn: {
    backgroundColor: '#e9ecef',
    padding: 10, // Reducido en móvil
    marginRight: 6,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100, // Mínimo en móvil
  },
  
  ciudadBtnDesktop: {
    backgroundColor: '#e9ecef',
    padding: 16,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 140, // Aumentado para desktop
    maxWidth: 180,
  },
  
  ciudadBtnSelected: {
    backgroundColor: '#35798e',
    borderColor: '#2c6678',
    transform: [{ scale: 1.02 }], // Efecto sutil de escala
  },
  
  ciudadText: {
    color: '#333',
    fontSize: 12, // Reducido en móvil
    fontWeight: '500',
    textAlign: 'center',
  },
  
  ciudadTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Contenedor de selector horizontal
  selectorContainer: {
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  // Botón de búsqueda mejorado
  btnBuscar: {
    backgroundColor: '#35798e',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  btnBuscarDesktop: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    maxWidth: 350,
    alignSelf: 'center',
    marginTop: 32,
  },
  
  // Loading mejorado
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  
  // Cards de vuelos mejoradas
  card: {
    backgroundColor: '#fff',
    padding: 16, // Reducido en móvil
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: '100%',
  },
  
  cardTablet: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 18,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    width: '100%',
    maxWidth: 700, // Aumentado para tablet
    alignSelf: 'center',
  },
  
  cardDesktop: {
    backgroundColor: '#fff',
    padding: 28, // Más padding en desktop
    borderRadius: 20,
    marginBottom: 20,
    marginHorizontal: 10, // Más separación entre cards
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    flex: 1,
    maxWidth: 520, // Aumentado para desktop
    minHeight: 400, // Altura mínima para consistencia
  },
  
  // Row para desktop
  vueloRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 16,
  },
  
  title: { 
    fontSize: 18, // Reducido en móvil
    fontWeight: 'bold', 
    marginBottom: 16,
    color: '#35798e',
    textAlign: 'center',
  },
  
  // Información del vuelo
  vueloInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  
  vueloInfoDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  
  infoColumn: {
    flex: 1,
    minWidth: 100, // Reducido en móvil
    marginBottom: 8,
  },
  
  infoLabel: {
    fontSize: 13, // Reducido en móvil
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 2,
  },
  
  infoValue: {
    fontSize: 15, // Reducido en móvil
    color: '#333',
    fontWeight: 'bold',
  },// Continuación de los estilos mejorados

  // Sistema de cantidad mejorado con stepper
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  
  stepperLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 16,
  },
  
  stepperBtn: {
    backgroundColor: '#35798e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  stepperBtnDisabled: {
    backgroundColor: '#bdc3c7',
    elevation: 0,
  },
  
  stepperText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  
  stepperCount: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#35798e',
    color: '#35798e',
    marginHorizontal: 12,
  },
  
  // Información de disponibilidad
  disponibilidadInfo: {
    backgroundColor: '#e8f4f8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#35798e',
  },
  
  disponibilidadText: {
    fontSize: 14,
    color: '#35798e',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Botón agregar mejorado
  btnAgregar: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginTop: 8,
  },
  
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // CARRITO FLOTANTE mejorado
  carritoFloating: {
    position: 'absolute',
    bottom: 80, // Más arriba para no interferir con navegación
    right: 20,
    backgroundColor: '#35798e',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 1000,
    minWidth: 200,
  },
  
  carritoFloatingDesktop: {
    bottom: 40,
    right: 40,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 35,
    minWidth: 250,
  },
  
  carritoFloatingText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Modal del carrito - Estilos responsive mejorados
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Cambio: modal desde abajo en móvil
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16, // Reducido para móvil
    width: '100%',
    maxHeight: '90%', // Aumentado para aprovechar mejor el espacio
    alignItems: 'stretch',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  modalContentDesktop: {
    borderRadius: 24,
    width: '70%',
    maxWidth: 800,
    padding: 32,
    maxHeight: '85%',
  },
  
  carritoModal: {
    alignItems: 'stretch',
  },
  
  carritoHeader: {
    fontSize: 20, // Reducido para móvil
    fontWeight: 'bold',
    color: '#35798e',
    textAlign: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e9ecef',
  },
  
  carritoHeaderDesktop: {
    fontSize: 28,
    marginBottom: 24,
  },
  
  // Contenedor de la lista
  carritoListaContainer: {
    marginBottom: 16,
  },
  
  // Item del carrito mejorado para móvil
  carritoItem: {
    backgroundColor: '#f8f9fa',
    padding: 12, // Reducido
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  carritoItemDesktop: {
    flexDirection: 'row',
    padding: 20,
    marginBottom: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  carritoInfo: {
    marginBottom: 12, // Espacio antes de controles en móvil
  },
  
  carritoVuelo: {
    fontSize: 15, // Reducido
    fontWeight: 'bold',
    color: '#35798e',
    marginBottom: 4,
  },
  
  carritoRuta: {
    fontSize: 13, // Reducido
    color: '#6c757d',
    marginBottom: 4,
  },
  
  carritoSubtotal: {
    fontSize: 14, // Reducido
    color: '#28a745',
    fontWeight: '600',
  },
  
  // Controles del carrito optimizados para móvil
  carritoControles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centrado en móvil
    gap: 6, // Reducido
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  
  carritoBtn: {
    backgroundColor: '#35798e',
    paddingHorizontal: 10, // Reducido
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 32, // Reducido
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  carritoBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  
  carritoCantidad: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
    paddingHorizontal: 6,
    color: '#35798e',
  },
  
  carritoEliminar: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  
  carritoEliminarText: {
    fontSize: 14,
  },
  
  // Resumen mejorado
  carritoResumen: {
    backgroundColor: '#e8f4f8',
    padding: 16, // Reducido
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b8daff',
  },
  
  carritoTotal: {
    fontSize: 20, // Reducido
    fontWeight: 'bold',
    color: '#35798e',
    marginBottom: 4,
  },
  
  carritoTotalBoletos: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  
  // Tipo de pago optimizado para móvil
  tipoPagoContainer: {
    marginBottom: 16,
  },
  
  tipoPagoBotones: {
    flexDirection: 'column', // Vertical en móvil
    gap: 8,
    marginTop: 8,
  },
  
  tipoPagoBtn: {
    backgroundColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  tipoPagoBtnDiferido: {
    backgroundColor: '#fff3cd',
  },
  
  tipoPagoBtnSelected: {
    borderColor: '#35798e',
    backgroundColor: '#35798e',
  },
  
  tipoPagoBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  tipoPagoBtnTextSelected: {
    color: '#fff',
  },
  
  // Cuotas mejoradas
  cuotasContainer: {
    marginTop: 12,
  },
  
  cuotasLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  
  cuotasScroll: {
    paddingVertical: 6,
  },
  
  cuotaBtn: {
    backgroundColor: '#dee2e6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  
  cuotaBtnSelected: {
    backgroundColor: '#35798e',
  },
  
  cuotaBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  
  cuotaBtnTextSelected: {
    color: '#fff',
  },
  
  btnVerAmortizacion: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  
  // Botón comprar mejorado
  btnComprarTodo: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  
  // Botón cerrar mejorado
  modalCloseButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },  
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    color: '#333',
    paddingHorizontal: 8,
  },
  
  // BOTÓN VOLVER AL MENÚ completamente rediseñado
  volverContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginTop: 20,
  },
  
  volverContainerDesktop: {
    padding: 32,
    marginTop: 40,
  },
  
  volverBtn: {
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 220,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  volverBtnDesktop: {
    paddingVertical: 20,
    paddingHorizontal: 48,
    minWidth: 280,
    borderRadius: 20,
    elevation: 4,
  },
  
  volverBtnHover: {
    backgroundColor: '#5a6268',
    borderColor: '#495057',
    transform: [{ scale: 1.02 }],
  },
  
  volverText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  volverTextDesktop: {
    fontSize: 18,
  },
  
  // Texto informativo adicional
  noVuelos: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  
  // Indicador de límite de boletos
  limiteBoletos: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  
  limiteBoletosText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalAmortizacionContainer: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 16,
},

modalAmortizacionContent: {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 20,
  width: '90%',
  maxWidth: 400,
  maxHeight: '80%',
  elevation: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
},

modalAmortizacionContentDesktop: {
  maxWidth: 600,
  padding: 32,
},

modalAmortizacionScroll: {
  paddingBottom: 16,
},

modalAmortizacionTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#2f6476',
  textAlign: 'center',
  marginBottom: 20,
},

// Resumen de amortización
resumenAmortizacion: {
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: '#dee2e6',
  marginBottom: 20,
},

resumenRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  paddingHorizontal: 8,
},

resumenRowTotal: {
  marginTop: 12,
  paddingTop: 12,
  borderTopWidth: 2,
  borderTopColor: '#dee2e6',
  marginBottom: 0,
},

resumenLabel: {
  fontSize: 15,
  color: '#495057',
  fontWeight: '500',
},

resumenLabelTotal: {
  fontSize: 16,
  color: '#2f6476',
  fontWeight: 'bold',
},

resumenValue: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#212529',
},

resumenValueRed: {
  color: '#dc3545',
},

resumenValueTotal: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#2f6476',
},

// Tabla detallada (desktop)
tablaDetalleContainer: {
  marginTop: 20,
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 12,
  borderWidth: 1,
  borderColor: '#dee2e6',
},

tablaDetalleTitle: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 12,
  color: '#495057',
  textAlign: 'center',
},

tablaDetalle: {
  minWidth: 500,
},

tablaDetalleHeader: {
  flexDirection: 'row',
  backgroundColor: '#f0f0f0',
  paddingVertical: 10,
  paddingHorizontal: 5,
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
},

tablaDetalleRow: {
  flexDirection: 'row',
  paddingVertical: 8,
  paddingHorizontal: 5,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

tablaDetalleRowEven: {
  backgroundColor: '#f9f9f9',
},

tablaDetalleCell: {
  width: 90,
  textAlign: 'center',
  fontSize: 14,
  color: '#212529',
},

tablaCellSmall: {
  width: 50,
  fontWeight: 'bold',
},

// Botón cerrar amortización
modalAmortizacionCloseBtn: {
  backgroundColor: '#dc3545',
  paddingVertical: 12,
  paddingHorizontal: 32,
  borderRadius: 8,
  alignSelf: 'center',
  marginTop: 16,
  elevation: 2,
},

modalAmortizacionCloseBtnText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
modalMensajeContainer: {
  flex: 1,
  justifyContent: 'center', // IMPORTANTE: Centrado vertical
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  padding: 20,
},

modalMensajeContent: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 24,
  width: '90%',
  maxWidth: 400,
  alignItems: 'center',
  elevation: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
},

modalMensajeContentDesktop: {
  padding: 32,
  maxWidth: 500,
},

modalMensajeText: {
  fontSize: 16,
  textAlign: 'center',
  marginBottom: 24,
  lineHeight: 24,
  color: '#333',
  paddingHorizontal: 8,
},

modalMensajeButton: {
  backgroundColor: '#35798e',
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 12,
  minWidth: 120,
  alignItems: 'center',
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
},

modalMensajeButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

// Opcional: Si quieres diferenciar entre mensajes de éxito y error
modalMensajeSuccess: {
  borderTopWidth: 4,
  borderTopColor: '#28a745',
},

modalMensajeError: {
  borderTopWidth: 4,
  borderTopColor: '#dc3545',
},
})