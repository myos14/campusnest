// app/(tabs)/messages.tsx - VERSIÓN MEJORADA
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  unreadCount: number;
  propertyTitle: string;
  isOnline?: boolean;
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userName: 'Ana García',
      lastMessage: 'Hola, me interesa la habitación cerca de BUAP',
      timestamp: '10:30',
      unread: true,
      unreadCount: 3,
      propertyTitle: 'Habitación individual - Centro',
      isOnline: true
    },
    {
      id: '2',
      userName: 'Carlos López',
      lastMessage: '¿La renta incluye servicios?',
      timestamp: 'Ayer',
      unread: false,
      unreadCount: 0,
      propertyTitle: 'Departamento compartido - Angelópolis'
    },
    {
      id: '3',
      userName: 'María Rodríguez',
      lastMessage: 'Podemos coordinar una visita para el sábado',
      timestamp: '12 Oct',
      unread: false,
      unreadCount: 0,
      propertyTitle: 'Casa completa - La Paz'
    }
  ]);

  const renderMessageItem = ({ item }: { item: Message }) => (
    <TouchableOpacity style={[
      styles.messageItem,
      item.unread && styles.unreadMessageItem
    ]}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={[
            styles.userName,
            item.unread && styles.unreadUserName
          ]} numberOfLines={1}>
            {item.userName}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp}
          </Text>
        </View>
        
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.propertyTitle}
        </Text>
        
        <Text 
          style={[
            styles.lastMessage,
            item.unread && styles.unreadLastMessage
          ]} 
          numberOfLines={2}
        >
          {item.lastMessage}
        </Text>
      </View>
      
      {item.unread && item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>
            {item.unreadCount > 9 ? '9+' : item.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filtros rápidos */}
      <View style={styles.filters}>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
          <Text style={[styles.filterText, styles.activeFilterText]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>No leídos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Arrendadores</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={80} color={Colors.neutral300} />
            <Text style={styles.emptyTitle}>No tienes mensajes</Text>
            <Text style={styles.emptySubtitle}>
              Cuando tengas conversaciones sobre propiedades,{'\n'}aparecerán aquí.
            </Text>
            <TouchableOpacity style={styles.startChatButton}>
              <Text style={styles.startChatText}>Comenzar una conversación</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  newMessageButton: {
    padding: Spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral100,
  },
  activeFilter: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSizes.sm,
    color: Colors.neutral600,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.white,
  },
  messagesList: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderLeftWidth: 0,
  },
  unreadMessageItem: {
    backgroundColor: Colors.neutral50,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  messageContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  userName: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.neutral700,
    flex: 1,
  },
  unreadUserName: {
    fontWeight: 'bold',
    color: Colors.neutral900,
  },
  timestamp: {
    fontSize: FontSizes.xs,
    color: Colors.neutral400,
    marginTop: 2,
  },
  propertyTitle: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    marginBottom: 4,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: FontSizes.sm,
    color: Colors.neutral600,
    lineHeight: 18,
  },
  unreadLastMessage: {
    fontWeight: '600',
    color: Colors.neutral800,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.neutral700,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.neutral500,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  startChatButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  startChatText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});