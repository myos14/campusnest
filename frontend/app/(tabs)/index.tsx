import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { propiedadesService } from '../../services/api';
import type { Propiedad } from '../../types';
import PropertyCard from '../../components/PropertyCard';

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
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CampusNest</Text>
        <Text style={styles.subtitle}>Encuentra tu hogar ideal</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ubicación o título..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No se encontraron propiedades</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});