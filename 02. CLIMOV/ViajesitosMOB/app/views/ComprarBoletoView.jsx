import React, { useEffect, useState } from 'react';
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
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { obtenerCiudades } from '../controllers/CiudadController';
import { buscarVuelos as buscarVuelosAPI } from '../controllers/VueloController';
import { registrarBoleto } from '../controllers/BoletoController';

export default function ComprarBoletoView() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [usuario, setUsuario] = useState(null);
  const [ciudades, setCiudades] = useState([]);
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerCiudades();
        setCiudades(Array.isArray(data) ? data : [data]);
      } catch (e) {
        console.error('Error cargando ciudades:', e);
        setCiudades([]);
      }

      const storedId = await AsyncStorage.getItem('idUsuario');
      if (storedId) setUsuario(parseInt(storedId));
      else router.replace('/');
    };
    cargar();
  }, []);

  const getNombreCiudad = (codigo) => {
    const ciudad = ciudades.find(c => c.codigoCiudad === codigo);
    return ciudad ? ciudad.nombreCiudad : codigo;
  };

  const limpiarFormulario = () => {
    setOrigen('');
    setDestino('');
    setFecha('');
    setVuelos([]);
    setCantidad(1);
  };

  const transformVuelo = (vuelo) => ({
    ...vuelo,
    IdVuelo: vuelo.idVuelo,
    CodigoVuelo: vuelo.codigoVuelo,
    Valor: vuelo.valor,
    Disponibles: vuelo.disponibles,
    HoraSalida: vuelo.horaSalida,
    Origen: vuelo.idCiudadOrigen?.codigoCiudad || 'ND',
    Destino: vuelo.idCiudadDestino?.codigoCiudad || 'ND',
  });

  const handleBuscarVuelos = async () => {
    if (!origen || !destino || origen === destino || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      Alert.alert('Error', 'Seleccione ciudades válidas y una fecha con formato correcto (YYYY-MM-DD).');
      return;
    }
    setLoading(true);
    try {
      const resultados = await buscarVuelosAPI(origen, destino, fecha);
      const lista = Array.isArray(resultados)
        ? resultados.map(transformVuelo)
        : resultados
        ? [transformVuelo(resultados)]
        : [];
      setVuelos(lista);
      if (lista.length === 0) Alert.alert('Sin vuelos disponibles');
    } catch (error) {
      console.error('Error al buscar vuelos:', error);
      Alert.alert('Error', 'No se pudo buscar vuelos.');
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = async (vuelo) => {
    if (!usuario || isNaN(usuario)) {
      setMensaje('❌ ID de usuario no disponible.');
      setModalVisible(true);
      return;
    }

    if (!cantidad || isNaN(cantidad) || cantidad <= 0 || cantidad > vuelo.Disponibles) {
      setMensaje(`❌ Cantidad inválida. Disponible: ${vuelo.Disponibles}`);
      setModalVisible(true);
      return;
    }

    const total = (parseFloat(vuelo.Valor) * cantidad).toFixed(2);

    try {
      const resultado = await registrarBoleto({
        idVuelo: vuelo.IdVuelo,
        idUsuario: usuario,
        cantidad
      });

      if (resultado) {
        setMensaje(
          `✅ Compra realizada\n\n✈ Vuelo: ${vuelo.CodigoVuelo}\n🛫 Origen: ${getNombreCiudad(vuelo.Origen)}\n🛬 Destino: ${getNombreCiudad(vuelo.Destino)}\n🎟 Cantidad: ${cantidad}\n💵 Total: $${total}`
        );
        setModalVisible(true);
        limpiarFormulario();
        setTimeout(() => {
          setModalVisible(false);
          router.replace({ pathname: '/views/MenuView', params: { idUsuario: usuario } });
        }, 3000);
      } else {
        setMensaje('❌ No se pudo completar la compra');
        setModalVisible(true);
      }
    } catch (e) {
      console.error('Error al comprar:', e);
      setMensaje('❌ Error inesperado.');
      setModalVisible(true);
    }
  };

  const renderCiudadItem = (item, onSelect, selected) => (
    <TouchableOpacity
      key={item.codigoCiudad}
      style={[styles.ciudadBtn, selected === item.codigoCiudad && styles.ciudadBtnSelected]}
      onPress={() => onSelect(item.codigoCiudad)}
    >
      <Text style={styles.ciudadText}>{item.codigoCiudad} - {item.nombreCiudad}</Text>
    </TouchableOpacity>
  );

  const renderVueloItem = ({ item }) => (
    <View style={isMobile ? styles.card : styles.cardDesktop}>
      <Text style={styles.title}>✈️ {item.CodigoVuelo}</Text>
      <Text>🛫 Origen: {getNombreCiudad(item.Origen)}</Text>
      <Text>🛬 Destino: {getNombreCiudad(item.Destino)}</Text>
      <Text>Salida: {item.HoraSalida}</Text>
      <Text>Precio: ${item.Valor}</Text>
      <Text>Disponibles: {item.Disponibles}</Text>

      <View style={styles.stepperContainer}>
        <TouchableOpacity
          onPress={() => setCantidad(Math.max(1, cantidad - 1))}
          style={styles.stepperBtn}
        >
          <Text style={styles.stepperText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperCount}>{cantidad}</Text>
        <TouchableOpacity
          onPress={() => setCantidad(Math.min(10, cantidad + 1))}
          style={styles.stepperBtn}
        >
          <Text style={styles.stepperText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={() => handleComprar(item)}>
        <Text style={styles.btnText}>Comprar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.scroll}>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.header}>Buscar Vuelos</Text>

            <View style={styles.formGroup}>
              <Text style={styles.subheader}>Ciudad de Origen</Text>
              <ScrollView horizontal contentContainerStyle={styles.selectorContainer}>
                {ciudades.filter(c => c.codigoCiudad !== destino).map(c => renderCiudadItem(c, setOrigen, origen))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.subheader}>Ciudad de Destino</Text>
              <ScrollView horizontal contentContainerStyle={styles.selectorContainer}>
                {ciudades.filter(c => c.codigoCiudad !== origen).map(c => renderCiudadItem(c, setDestino, destino))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.subheader}>Fecha de Vuelo</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={fecha}
                onChangeText={setFecha}
              />
            </View>

            <TouchableOpacity style={styles.btnBuscar} onPress={handleBuscarVuelos}>
              <Text style={styles.btnText}>Buscar Vuelos</Text>
            </TouchableOpacity>


          {loading ? (
            <ActivityIndicator size="large" color="#35798e" />
          ) : (
            <FlatList
              data={vuelos}
              keyExtractor={(item) => `vuelo-${item.IdVuelo}`}
              renderItem={renderVueloItem}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={<Text style={styles.noVuelos}>No hay vuelos disponibles.</Text>}
            />
          )}
        </View>

        <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{mensaje}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                if (mensaje.startsWith('✅')) {
                  router.replace({ pathname: '/views/MenuView', params: { idUsuario: usuario } });
                }
              }}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8f9fa' },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#35798e',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheader: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
    alignSelf: 'flex-start',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  ciudadBtn: {
    backgroundColor: '#ddd',
    padding: 10,
    marginRight: 8,
    borderRadius: 8,
  },
  ciudadBtnSelected: {
    backgroundColor: '#4e88a9',
  },
  ciudadText: {
    color: '#000',
  },
  btnBuscar: {
    backgroundColor: '#35798e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formGroup: {
  width: '100%',
  maxWidth: 500,
  alignItems: 'center',
  marginBottom: 12,
},

selectorContainer: {
  justifyContent: 'center',
  flexDirection: 'row',
  flexWrap: 'wrap',
},

  btn: {
    backgroundColor: '#4e88a9',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  cardDesktop: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  noVuelos: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
  },
  modalText: {
    fontSize: 16,
    color: '#212529',
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#35798e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    gap: 20,
  },
  stepperBtn: {
    backgroundColor: '#35798e',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stepperText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepperCount: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
});

