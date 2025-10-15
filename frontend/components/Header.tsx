import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  showFilters?: boolean;
}

export default function Header({ 
  searchValue = '', 
  onSearchChange, 
  showFilters = true 
}: HeaderProps) {
  return (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="¿A dónde quieres ir?"
            value={searchValue}
            onChangeText={onSearchChange}
            placeholderTextColor="#9ca3af"
          />
          {searchValue.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange?.('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        {showFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="bed-outline" size={20} color="#111" />
              <Text style={styles.filterText}>Habitaciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="home-outline" size={20} color="#111" />
              <Text style={styles.filterText}>Departamentos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="wifi" size={20} color="#111" />
              <Text style={styles.filterText}>WiFi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="car-sport-outline" size={20} color="#111" />
              <Text style={styles.filterText}>Estacionamiento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="paw-outline" size={20} color="#111" />
              <Text style={styles.filterText}>Mascotas</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
});