import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Propiedad } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface PropertyCardProps {
  propiedad: Propiedad;
  onPress: () => void;
}

export default function PropertyCard({ propiedad, onPress }: PropertyCardProps) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const fotoPrincipal = propiedad.fotos?.find(f => f.es_principal)?.url_foto || 
                       'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267';

  const toggleFavorito = (e: any) => {
    e.stopPropagation();
    setEsFavorito(!esFavorito);
    // TODO: Implementar la llamada API para guardar favorito
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isPressed && styles.cardPressed
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={1}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: fotoPrincipal }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Badge de Verificado */}
        {propiedad.id_arrendador && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.white} />
            <Text style={styles.verifiedText}>Verificado</Text>
          </View>
        )}

        {/* Botón de favorito */}
        <TouchableOpacity 
          style={[styles.favoriteButton, esFavorito && styles.favoriteButtonActive]}
          onPress={toggleFavorito}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={esFavorito ? "heart" : "heart-outline"} 
            size={20} 
            color={esFavorito ? Colors.error : Colors.white} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Header con ubicación */}
        <View style={styles.header}>
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color={Colors.neutral500} />
            <Text style={styles.locationText} numberOfLines={1}>
              {propiedad.colonia}, {propiedad.ciudad}
            </Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title} numberOfLines={2}>{propiedad.titulo}</Text>

        {/* Características principales */}
        <View style={styles.features}>
          {propiedad.caracteristicas?.numero_camas && (
            <View style={styles.feature}>
              <Ionicons name="bed-outline" size={16} color={Colors.neutral500} />
              <Text style={styles.featureText}>
                {propiedad.caracteristicas.numero_camas} {propiedad.caracteristicas.numero_camas === 1 ? 'cama' : 'camas'}
              </Text>
            </View>
          )}
          {propiedad.caracteristicas?.numero_banios && (
            <View style={styles.feature}>
              <Ionicons name="water-outline" size={16} color={Colors.neutral500} />
              <Text style={styles.featureText}>
                {propiedad.caracteristicas.numero_banios} {propiedad.caracteristicas.numero_banios === 1 ? 'baño' : 'baños'}
              </Text>
            </View>
          )}
          {propiedad.caracteristicas?.metros_cuadrados && (
            <View style={styles.feature}>
              <Ionicons name="expand-outline" size={16} color={Colors.neutral500} />
              <Text style={styles.featureText}>{propiedad.caracteristicas.metros_cuadrados}m²</Text>
            </View>
          )}
        </View>

        {/* Amenidades */}
        <View style={styles.amenities}>
          {propiedad.caracteristicas?.wifi && (
            <View style={styles.amenity}>
              <Ionicons name="wifi" size={16} color={Colors.primary} />
            </View>
          )}
          {propiedad.caracteristicas?.estacionamiento && (
            <View style={styles.amenity}>
              <Ionicons name="car-sport-outline" size={16} color={Colors.primary} />
            </View>
          )}
          {propiedad.caracteristicas?.mascotas_permitidas && (
            <View style={styles.amenity}>
              <Ionicons name="paw-outline" size={16} color={Colors.primary} />
            </View>
          )}
          {propiedad.caracteristicas?.amueblado && (
            <View style={styles.amenity}>
              <Ionicons name="home-outline" size={16} color={Colors.primary} />
            </View>
          )}
        </View>

        {/* Footer con precio */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>
              <Text style={styles.priceAmount}>${propiedad.precio_mensual.toLocaleString('es-MX')}</Text>
              <Text style={styles.pricePeriod}> / mes</Text>
            </Text>
            {propiedad.deposito_requerido && (
              <Text style={styles.deposit}>
                + ${propiedad.deposito_requerido.toLocaleString('es-MX')} de depósito
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.neutral100,
  },
  cardPressed: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderColor: Colors.primary,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.neutral100,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30, 63, 102, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: Colors.white,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.neutral700,
    flex: 1,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.neutral900,
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  features: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral600,
    fontWeight: '500',
  },
  amenities: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  amenity: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral100,
  },
  price: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  pricePeriod: {
    fontSize: FontSizes.md,
    color: Colors.neutral600,
    fontWeight: '500',
  },
  deposit: {
    fontSize: FontSizes.xs,
    color: Colors.neutral500,
    marginTop: 4,
  },
});