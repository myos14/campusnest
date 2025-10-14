import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      {user && (
        <>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{user.nombre_completo}</Text>
          
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
          
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>{user.tipo_usuario}</Text>
        </>
      )}
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
  value: {
    fontSize: 18,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});