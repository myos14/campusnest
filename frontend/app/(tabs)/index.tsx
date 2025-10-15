// ==========================================
// Menú principal
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { propiedadesService } from '../../services/api';
import type { Propiedad } from '../../types';
import PropertyCard from '../../components/PropertyCard';
import Header from '../../components/Header';

export default function HomeScreen() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const router = useRouter();

  useEffect(() => {
    cargarPropiedades();
  }, []);

  async function cargarPropiedades() {
    try {
      const data = await propiedadesService.obtenerPropiedades({
        disponible: true,
        limit: 20,
      });
      setPropiedades(data);
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await cargarPropiedades();
  }

  const propiedadesFiltradas = propiedades.filter(p =>
    p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.colonia?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        showFilters={true}
      />

      {/* Lista de propiedades */}
      <FlatList
        data={propiedadesFiltradas}
        keyExtractor={(item) => item.id_propiedad}
        renderItem={({ item }) => (
          <PropertyCard
            propiedad={item}
            onPress={() => router.push(`/propiedad/${item.id_propiedad}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF385C']} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No hay propiedades disponibles</Text>
            <Text style={styles.emptyText}>Intenta ajustar tu búsqueda</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  list: {
    padding: 20,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});