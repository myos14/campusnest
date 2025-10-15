import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';

// Componente que decide cuándo mostrar Layout
function LayoutWrapper() {
  const { user } = useAuth();
  
  // Si no hay login, muestra solo el contenido
  if (user) {
    return (
      <Layout>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </Layout>
    );
  }

  // Usuario NO logueado - sin Layout/navbar
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutWrapper />
    </AuthProvider>
  );
}