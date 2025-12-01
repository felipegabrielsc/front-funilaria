import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Remove o cabeçalho padrão
        tabBarActiveTintColor: '#007BFF', // Cor padrão quando selecionado (Azul)
        tabBarInactiveTintColor: '#888',  // Cor quando não selecionado (Cinza)
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        }
      }}>

      {/* 1. ABA GASTAR (Ícone Vermelho) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Nova compra',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'remove-circle' : 'remove-circle-outline'}
              size={26}
              color={focused ? '#d32f2f' : '#888'} // Fica vermelho quando ativo
            />
          ),
        }}
      />

      {/* 2. ABA HISTÓRICO GASTOS */}
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

      {/* 3. ABA NOVO SERVIÇO (Ferramenta) */}
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

      {/* 4. ABA FINANCEIRO (Ícone Verde de Dinheiro) */}
      <Tabs.Screen
        name="financeiro"
        options={{
          title: 'Serviços',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'cash' : 'cash-outline'}
              size={26}
              color={focused ? '#2E7D32' : '#888'} // Fica verde quando ativo
            />
          ),
        }}
      />

    </Tabs>
  );
}