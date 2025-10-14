import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<'estudiante' | 'arrendador'>('estudiante');
  const [universidad, setUniversidad] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleRegister() {
    if (!email || !password || !nombreCompleto) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        nombre_completo: nombreCompleto,
        tipo_usuario: tipoUsuario,
        telefono,
        ...(tipoUsuario === 'estudiante' && { perfil_estudiante: { universidad } })
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete a CampusNest</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo *"
            value={nombreCompleto}
            onChangeText={setNombreCompleto}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña (mínimo 8 caracteres) *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Tipo de usuario:</Text>
            <Picker
              selectedValue={tipoUsuario}
              onValueChange={(value) => setTipoUsuario(value as 'estudiante' | 'arrendador')}
              enabled={!loading}
            >
              <Picker.Item label="Estudiante" value="estudiante" />
              <Picker.Item label="Arrendador" value="arrendador" />
            </Picker>
          </View>

          {tipoUsuario === 'estudiante' && (
            <TextInput
              style={styles.input}
              placeholder="Universidad"
              value={universidad}
              onChangeText={setUniversidad}
              editable={!loading}
            />
          )}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  label: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 8,
  },
});