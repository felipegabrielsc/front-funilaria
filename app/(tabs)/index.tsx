import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';

export default function HomeScreen() {
  const [produto, setProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  // ⚠️ SEU IP AQUI
  const API_URL = 'https://backend-oficina-api.onrender.com/compras';

  const salvar = async () => {
    if (!produto || !valor) {
      Alert.alert("Atenção", "Produto e Valor são obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      await axios.post(API_URL, {
        produto,
        descricao,
        valor: parseFloat(valor.replace(',', '.')),
        formaPagamento,
        observacao
      });

      Alert.alert("Sucesso", "Compra salva! Vá na aba Histórico para ver.");

      // Limpa os campos para a próxima
      setProduto('');
      setDescricao('');
      setValor('');
      setFormaPagamento('');
      setObservacao('');
    } catch (error) {
      Alert.alert("Erro", "Falha ao conectar no servidor.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.titulo}>Nova Compra ➕</Text>
          <Text style={styles.subtitulo}>Preencha os dados da nota/cupom</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Produto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Tinta Automotiva"
              value={produto}
              onChangeText={setProduto}
            />

            <Text style={styles.label}>Valor (R$) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 150.00"
              keyboardType="numeric"
              value={valor}
              onChangeText={setValor}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Para o Fusca Azul"
              value={descricao}
              onChangeText={setDescricao}
            />

            <Text style={styles.label}>Pagamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Pix, Cartão da Empresa"
              value={formaPagamento}
              onChangeText={setFormaPagamento}
            />

            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Detalhes extras..."
              multiline={true}
              numberOfLines={3}
              value={observacao}
              onChangeText={setObservacao}
            />

            <TouchableOpacity
              style={[styles.botao, loading && { opacity: 0.7 }]}
              onPress={salvar}
              disabled={loading}
            >
              <Text style={styles.textoBotao}>{loading ? "Salvando..." : "CADASTRAR COMPRA"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  scroll: { padding: 20, paddingBottom: 100 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 20 },
  subtitulo: { fontSize: 16, color: '#666', marginBottom: 20 },
  form: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 3 },
  label: { fontWeight: 'bold', color: '#444', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 8, fontSize: 16 },
  botao: { backgroundColor: '#007BFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 25 },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});