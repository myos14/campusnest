import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* 👈 Layout SIEMPRE visible, Navbar cambia internamente */}
      <Layout>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </Layout>
    </AuthProvider>
  );
}