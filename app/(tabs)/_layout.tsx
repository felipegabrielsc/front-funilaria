import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native'; // <--- Importante para detectar se é Android
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Remove o cabeçalho padrão do topo
        tabBarActiveTintColor: '#007BFF', // Azul quando selecionado
        tabBarInactiveTintColor: '#999',  // Cinza quando inativo

        // --- AQUI ESTÁ A CORREÇÃO DO BUG ---
        tabBarStyle: {
          // Se for Android, a barra terá 80 de altura. Se for iOS, 60.
          height: Platform.OS === 'android' ? 80 : 60,

          // Esse padding empurra os ícones pra cima, fugindo dos botões do Samsung
          paddingBottom: Platform.OS === 'android' ? 20 : 5,

          paddingTop: 8,
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#EEE',
          elevation: 8, // Sombra para destacar a barra
        },
        // Ajuste para o texto não ficar colado na borda
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          marginBottom: Platform.OS === 'android' ? 10 : 0,
        }
      }}>

      {/* 1. ABA GASTAR (Ícone Vermelho ao selecionar) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Gastar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'remove-circle' : 'remove-circle-outline'}
              size={26}
              color={focused ? '#d32f2f' : '#999'}
            />
          ),
        }}
      />

      {/* 2. ABA HISTÓRICO */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'reader' : 'reader-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3. ABA NOVO SERVIÇO */}
      <Tabs.Screen
        name="servicos"
        options={{
          title: 'Novo Serviço',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'construct' : 'construct-outline'}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 4. ABA CAIXA (Ícone Verde ao selecionar) */}
      <Tabs.Screen
        name="financeiro"
        options={{
          title: 'Caixa',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'cash' : 'cash-outline'}
              size={26}
              color={focused ? '#2E7D32' : '#999'}
            />
          ),
        }}
      />

    </Tabs>
  );
}