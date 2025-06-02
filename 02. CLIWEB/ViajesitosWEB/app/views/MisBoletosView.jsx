import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { obtenerBoletosPorUsuario } from '../controllers/BoletoController';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MisBoletosView() {
  const router = useRouter();
  const { idUsuario: idParam } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const cargarBoletos = async () => {
        setLoading(true);
        setBoletos([]);

        try {
          let idUsuarioActual = idParam;

          if (!idUsuarioActual) {
            idUsuarioActual = await AsyncStorage.getItem('idUsuario');
            if (!idUsuarioActual) throw new Error('Usuario no autenticado');
          } else {
            await AsyncStorage.setItem('idUsuario', idUsuarioActual);
          }

          const datos = await obtenerBoletosPorUsuario(idUsuarioActual);

          if (Array.isArray(datos)) {
            const ordenados = datos.sort((a, b) =>
              new Date(b.fechaCompra) - new Date(a.fechaCompra)
            );
            setBoletos(ordenados);
          } else {
            setBoletos([]);
          }
        } catch (error) {
          console.error('❌ Error al cargar boletos:', error);
          setBoletos([]);
        } finally {
          setLoading(false);
        }
      };

      cargarBoletos();
    }, [idParam])
  );

  const parseFechaCompra = (fechaStr) => {
    if (!fechaStr || typeof fechaStr !== 'string') return null;
    const cleanStr = fechaStr.replace(/\[.*?\]/g, '');
    const date = new Date(cleanStr);
    return isNaN(date) ? null : date;
  };

  const formatDate = (dateString) => {
    const date = parseFechaCompra(dateString);
    if (!date) return 'Fecha inválida';
    return date.toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item, index }) => {
    if (!item || !item.numeroBoleto) return null;
    return (
      <View style={[styles.card, { opacity: loading ? 0.5 : 1 }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🎫 Boleto #{item.numeroBoleto}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>#{index + 1}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>✈️ Vuelo:</Text>
            <Text style={styles.value}>{item.idVuelo?.codigoVuelo || 'Desconocido'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>📅 Fecha de Compra:</Text>
            <Text style={styles.value}>{formatDate(item.fechaCompra)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>💰 Precio:</Text>
            <Text style={styles.priceValue}>${item.precioCompra}</Text>
          </View>
        </View>
      </View>
    );
  };

  const handleVolverMenu = async () => {
    let idUsuarioActual = idParam;
    if (!idUsuarioActual) {
      idUsuarioActual = await AsyncStorage.getItem('idUsuario');
    }

    if (idUsuarioActual) {
      router.replace({
        pathname: '/views/MenuView',
        params: { idUsuario: idUsuarioActual }
      });
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>🎫 Mis Boletos</Text>
          <Text style={styles.subtitle}>
            {loading ? 'Cargando...' : `${boletos.length} boleto${boletos.length !== 1 ? 's' : ''} encontrado${boletos.length !== 1 ? 's' : ''}`}
          </Text>
        </View>

        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4e88a9" />
              <Text style={styles.loadingText}>Cargando tus boletos...</Text>
            </View>
          ) : boletos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✈️</Text>
              <Text style={styles.emptyTitle}>No tienes boletos</Text>
              <Text style={styles.emptyText}>Aún no has comprado ningún boleto.{"\n"}¡Reserva tu próximo vuelo!</Text>
            </View>
          ) : isMobile ? (
            <FlatList
              data={boletos}
              keyExtractor={(item, index) =>
                item && item.numeroBoleto ? String(item.numeroBoleto) : `boleto-${index}`
              }
              renderItem={renderItem}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellHeader}>#</Text>
                <Text style={styles.tableCellHeader}>Número</Text>
                <Text style={styles.tableCellHeader}>Vuelo</Text>
                <Text style={styles.tableCellHeader}>Compra</Text>
                <Text style={styles.tableCellHeader}>Precio</Text>
              </View>
              {boletos.map((item, index) => (
                <View key={item.numeroBoleto || index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                  <Text style={styles.tableCell}>{item.numeroBoleto}</Text>
                  <Text style={styles.tableCell}>{item.idVuelo?.codigoVuelo || 'ND'}</Text>
                  <Text style={styles.tableCell}>{formatDate(item.fechaCompra)}</Text>
                  <Text style={styles.tableCell}>${item.precioCompra}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleVolverMenu}
            style={styles.volverBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.volverText}>← Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 3,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#35798e',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
  },
  mainContent: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 80 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6c757d', textAlign: 'center' },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#35798e', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#6c757d', textAlign: 'center', lineHeight: 22 },
  listContainer: { paddingBottom: 20 },
  separator: { height: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#35798e' },
  badge: { backgroundColor: '#4e88a9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardContent: { padding: 20 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
  },
  label: { fontSize: 16, color: '#495057', fontWeight: '500', flex: 1 },
  value: { fontSize: 16, color: '#212529', fontWeight: '600', flex: 1, textAlign: 'right' },
  priceValue: { fontSize: 18, color: '#27ae60', fontWeight: 'bold', flex: 1, textAlign: 'right' },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  volverBtn: {
    backgroundColor: '#4e88a9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: 180,
  },
  volverText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tableContainer: { marginTop: 10, borderWidth: 1, borderColor: '#cfe2f3', borderRadius: 8 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dff6ff',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderColor: '#e9ecef',
  },
  tableCellHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#35798e',
  },
  tableCell: { flex: 1, textAlign: 'center', color: '#212529' },
});
