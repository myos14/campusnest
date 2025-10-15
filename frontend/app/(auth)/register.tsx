import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { CustomInput, TipoUsuarioDropdown } from '../../components/FormElements';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<'estudiante' | 'arrendador' | 'ambos'>('estudiante');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleRegister() {
    if (!email || !password || !nombreCompleto) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        email,
        password,
        nombre_completo: nombreCompleto,
        tipo_usuario: tipoUsuario,
        // Campos restantes seran opcionales y se llenaran en el perfil
        telefono: undefined,
        perfil_estudiante: tipoUsuario === 'estudiante' || tipoUsuario === 'ambos' ? {} : undefined,
        perfil_arrendador: tipoUsuario === 'arrendador' || tipoUsuario === 'ambos' ? {} : undefined,
      };

      await register(registerData);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Roomie</Text>
          <Text style={styles.subtitle}>Encuentra tu hogar cerca de tu universidad</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text style={styles.tabText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <CustomInput
              label="Nombre completo"
              placeholder=""
              value={nombreCompleto}
              onChangeText={setNombreCompleto}
              editable={!loading}
            />

            <CustomInput
              label="Email"
              placeholder=""
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <CustomInput
              label="Contraseña"
              placeholder=""
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TipoUsuarioDropdown
              value={tipoUsuario}
              onValueChange={setTipoUsuario}
              disabled={loading}
            />

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
              onPress={() => router.replace('/(auth)/login')}
              disabled={loading}
            >
              <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FF385C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: 400,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#FF385C',
    fontWeight: '600',
  },
  form: {
    // gap is handled by CustomInput marginBottom
  },
  button: {
    backgroundColor: '#FF385C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#fecaca',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#FF385C',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
});