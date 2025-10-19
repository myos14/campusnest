// frontend/app/components/UniversidadSelector.tsx
// Componente para seleccionar universidad con autocomplete

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  StyleSheet,
  ActivityIndicator 
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Universidad {
  value: string;
  label: string;
  tipo: 'publica' | 'privada';
}

interface Props {
  value?: string;
  onSelect: (universidad: string) => void;
  placeholder?: string;
}

export default function UniversidadSelector({ value, onSelect, placeholder }: Props) {
  const [query, setQuery] = useState(value || '');
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [todasUniversidades, setTodasUniversidades] = useState<Universidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Cargar todas las universidades al montar el componente
  useEffect(() => {
    loadUniversidades();
  }, []);

  // Filtrar universidades mientras el usuario escribe
  useEffect(() => {
    if (query.length >= 2) {
      filterUniversidades(query);
      setShowDropdown(true);
    } else {
      setUniversidades(todasUniversidades.slice(0, 10)); // Mostrar las primeras 10
      setShowDropdown(query.length > 0);
    }
  }, [query, todasUniversidades]);

  const loadUniversidades = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/propiedades/universidades`);
      if (response.ok) {
        const data = await response.json();
        setTodasUniversidades(data);
        setUniversidades(data.slice(0, 10));
      }
    } catch (error) {
      console.error('Error cargando universidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUniversidades = (searchText: string) => {
    const filtered = todasUniversidades.filter(uni => 
      uni.value.toLowerCase().includes(searchText.toLowerCase()) ||
      uni.label.toLowerCase().includes(searchText.toLowerCase())
    );
    setUniversidades(filtered);
  };

  const handleSelect = (universidad: Universidad) => {
    setQuery(universidad.label);
    onSelect(universidad.value);
    setShowDropdown(false);
  };

  const renderUniversidadItem = ({ item }: { item: Universidad }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.universidadInfo}>
        <Text style={styles.universidadNombre}>{item.label}</Text>
        <View style={[
          styles.tipoBadge, 
          item.tipo === 'publica' ? styles.publicaBadge : styles.privadaBadge
        ]}>
          <Text style={styles.tipoText}>
            {item.tipo === 'publica' ? 'Pública' : 'Privada'}
          </Text>
        </View>
      </View>
      <Text style={styles.universidadSiglas}>{item.value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder || "ej. BUAP, UPAEP, USEP..."}
          placeholderTextColor="#999"
          onFocus={() => setShowDropdown(true)}
        />
        {loading && (
          <ActivityIndicator 
            size="small" 
            color="#0066FF" 
            style={styles.loadingIcon}
          />
        )}
      </View>

      {showDropdown && universidades.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={universidades}
            renderItem={renderUniversidadItem}
            keyExtractor={(item) => item.value}
            style={styles.dropdownList}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {showDropdown && query.length >= 2 && universidades.length === 0 && !loading && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>
            No se encontraron universidades con "{query}"
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  loadingIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  universidadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  universidadNombre: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  universidadSiglas: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publicaBadge: {
    backgroundColor: '#E6F4EA',
  },
  privadaBadge: {
    backgroundColor: '#FFF4E6',
  },
  tipoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noResults: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});