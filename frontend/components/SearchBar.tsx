import React from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface SearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export default function SearchBar({ 
  searchValue, 
  onSearchChange,
  onFilterPress,
  placeholder = 'Buscar destinos'
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchCard}>
        {/* Sección de búsqueda principal */}
        <View style={styles.searchSection}>
          <Ionicons name="search" size={20} color={Colors.neutral400} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            value={searchValue}
            onChangeText={onSearchChange}
            placeholderTextColor={Colors.neutral400}
          />
          {searchValue ? (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Ionicons name="close-circle" size={20} color={Colors.neutral400} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Botón de filtros (opcional) */}
        {onFilterPress ? (
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={onFilterPress}
          >
            <Ionicons name="options-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral200,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.neutral700,
    padding: 0,
  },
  filterButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
});