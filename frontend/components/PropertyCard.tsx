import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Propiedad } from '../types';

interface PropertyCardProps {
  propiedad: Propiedad;
  onPress: () => void;
}

export default function PropertyCard({ propiedad, onPress }: PropertyCardProps) {
  const fotoPrincipal = propiedad.fotos?.find(f => f.es_principal)?.url_foto || 
                       propiedad.fotos?.[0]?.url_foto ||
                       'https://via.placeholder.com/400x300';

  const caracteristicas = propiedad.caracteristicas;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: fotoPrincipal }} style={styles.image} />
      
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{formatTipo(propiedad.tipo_propiedad)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{propiedad.titulo}</Text>
        
        <View style={styles.location}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.locationText}>
            {propiedad.colonia}, {propiedad.ciudad}
          </Text>
        </View>

        <View style={styles.features}>
          {caracteristicas?.wifi && (
            <View style={styles.feature}>
              <Ionicons name="wifi" size={16} color="#2563eb" />
              <Text style={styles.featureText}>WiFi</Text>
            </View>
          )}
          {caracteristicas?.amueblado && (
            <View style={styles.feature}>
              <Ionicons name="bed-outline" size={16} color="#2563eb" />
              <Text style={styles.featureText}>Amueblado</Text>
            </View>
          )}
          {caracteristicas?.numero_camas && (
            <View style={styles.feature}>
              <Text style={styles.featureText}>{caracteristicas.numero_camas} cama(s)</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>${propiedad.precio_mensual}/mes</Text>
          {propiedad.disponible ? (
            <View style={styles.available}>
              <Text style={styles.availableText}>Disponible</Text>
            </View>
          ) : (
            <View style={styles.unavailable}>
              <Text style={styles.unavailableText}>No disponible</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatTipo(tipo: string): string {
  const tipos: Record<string, string> = {
    cuarto_individual: 'Cuarto Individual',
    cuarto_compartido: 'Cuarto Compartido',
    departamento: 'Departamento',
    casa: 'Casa',
  };
  return tipos[tipo] || tipo;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  features: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  available: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  availableText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
  },
  unavailable: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unavailableText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
});