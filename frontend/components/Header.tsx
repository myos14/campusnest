import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface HeaderProps {
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  scrollY?: number;
  onFilterPress?: (filter: string) => void;
  activeFilters?: string[];
}

export default function Header({
  searchValue = '',
  onSearchChange,
  scrollY = 0,
  onFilterPress,
  activeFilters = []
}: HeaderProps) {
  // El header se comprime cuando se scrollea más de 80px
  const isScrolled = scrollY > 80;

  return (
    <View style={[
      styles.header,
      isScrolled && styles.headerCompact
    ]}>
      {/* Search Bar - Siempre visible */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.neutral400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por zona, colonia..."
            value={searchValue}
            onChangeText={onSearchChange}
            placeholderTextColor={Colors.neutral400}
          />
          {searchValue.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange?.('')}>
              <Ionicons name="close-circle" size={20} color={Colors.neutral400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros - Se ocultan al scrollear */}
      {!isScrolled && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <FilterChip
            icon="bed-outline"
            label="Habitaciones"
            active={activeFilters.includes('habitaciones')}
            onPress={() => onFilterPress?.('habitaciones')}
          />
          <FilterChip
            icon="business-outline"
            label="Departamentos"
            active={activeFilters.includes('departamentos')}
            onPress={() => onFilterPress?.('departamentos')}
          />
          <FilterChip
            icon="wifi-outline"
            label="WiFi"
            active={activeFilters.includes('wifi')}
            onPress={() => onFilterPress?.('wifi')}
          />
          <FilterChip
            icon="car-outline"
            label="Estacionamiento"
            active={activeFilters.includes('estacionamiento')}
            onPress={() => onFilterPress?.('estacionamiento')}
          />
          <FilterChip
            icon="paw-outline"
            label="Mascotas"
            active={activeFilters.includes('mascotas')}
            onPress={() => onFilterPress?.('mascotas')}
          />
        </ScrollView>
      )}

      {/* Botón de filtros compacto - Solo visible al scrollear */}
      {isScrolled && (
        <View style={styles.compactFilterContainer}>
          <TouchableOpacity 
            style={styles.compactFilterButton}
            onPress={() => onFilterPress?.('mostrar_todos')}
          >
            <Ionicons name="options-outline" size={18} color={Colors.neutral700} />
            <Text style={styles.compactFilterText}>Filtros</Text>
            {activeFilters.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Componente reutilizable para los chips de filtro
interface FilterChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}

function FilterChip({ icon, label, active = false, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        active && styles.filterChipActive
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={16}
        color={active ? Colors.white : Colors.neutral700}
      />
      <Text style={[
        styles.filterChipText,
        active && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerCompact: {
    paddingBottom: Spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral50,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.neutral900,
  },
  filtersContainer: {
    paddingBottom: Spacing.xs,
  },
  filtersContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral700,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  compactFilterContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  compactFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignSelf: 'flex-start',
  },
  compactFilterText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral700,
    fontWeight: '500',
  },
  filterBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});