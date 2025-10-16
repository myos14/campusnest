import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Navbar onMenuPress={() => setSidebarVisible(true)} />
      <Sidebar 
        visible={sidebarVisible} 
        onClose={() => setSidebarVisible(false)} 
      />
      
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 0, // O 65 si quieres espacio
  },
});

export default Layout;