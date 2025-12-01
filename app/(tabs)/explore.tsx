import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView, RefreshControl, TextInput, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface CompraProps {
  _id: string;
  data: string;
  descricao: string;
  produto: string;
  valor: number;
  formaPagamento: string;
  observacao: string;
}

export default function ExploreScreen() {
  const [listaCompleta, setListaCompleta] = useState<CompraProps[]>([]);
  const [listaFiltrada, setListaFiltrada] = useState<CompraProps[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para Detalhes (Modal)
  const [modalVisible, setModalVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<CompraProps | null>(null);

  // Filtros
  const [textoBusca, setTextoBusca] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(new Date().getMonth());
  const [diaSelecionado, setDiaSelecionado] = useState(''); // Novo filtro de dia
  const [modalMesVisible, setModalMesVisible] = useState(false);

  // ⚠️ SEU IP AQUI
  const API_URL = 'https://backend-oficina-api.onrender.com/compras';

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setListaCompleta(response.data);
      aplicarFiltros(response.data, textoBusca, mesSelecionado, diaSelecionado);
    } catch (error) {
      console.log("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const aplicarFiltros = (lista: CompraProps[], texto: string, mes: number | null, dia: string) => {
    let filtrados = lista;

    // 1. Filtro de Texto
    if (texto) {
      filtrados = filtrados.filter(item =>
        item.produto.toLowerCase().includes(texto.toLowerCase()) ||
        (item.descricao && item.descricao.toLowerCase().includes(texto.toLowerCase()))
      );
    }

    // 2. Filtro de Data (Mês e Ano)
    if (mes !== null) {
      const anoAtual = new Date().getFullYear();
      filtrados = filtrados.filter(item => {
        const dataItem = new Date(item.data);
        const mesmoMes = dataItem.getMonth() === mes;
        const mesmoAno = dataItem.getFullYear() === anoAtual;

        // 3. Filtro de Dia Específico (Se tiver digitado algo)
        if (dia && dia.trim() !== '') {
          const mesmoDia = dataItem.getDate() === parseInt(dia);
          return mesmoMes && mesmoAno && mesmoDia;
        }

        return mesmoMes && mesmoAno;
      });
    }

    setListaFiltrada(filtrados);
  };

  // Reage a qualquer mudança nos filtros
  useEffect(() => {
    aplicarFiltros(listaCompleta, textoBusca, mesSelecionado, diaSelecionado);
  }, [textoBusca, mesSelecionado, diaSelecionado]);

  const totalGasto = listaFiltrada.reduce((acc, item) => acc + item.valor, 0);

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const abrirDetalhes = (item: CompraProps) => {
    setItemSelecionado(item);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header Dashboard */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Histórico Financeiro 💰</Text>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          {/* Linha 1: Busca Texto */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              style={styles.inputSearch}
              placeholder="Buscar produto..."
              value={textoBusca}
              onChangeText={setTextoBusca}
            />
          </View>

          {/* Linha 2: Data */}
          <View style={styles.dateRow}>
            {/* Botão Mês */}
            <TouchableOpacity style={styles.dateButton} onPress={() => setModalMesVisible(true)}>
              <Ionicons name="calendar" size={18} color="#FFF" />
              <Text style={styles.dateButtonText}>
                {mesSelecionado !== null ? meses[mesSelecionado] : "Ano Todo"}
              </Text>
            </TouchableOpacity>

            {/* Input Dia */}
            <View style={styles.dayInputContainer}>
              <Text style={styles.dayLabel}>Dia:</Text>
              <TextInput
                style={styles.dayInput}
                placeholder="Ex: 15"
                keyboardType="numeric"
                maxLength={2}
                value={diaSelecionado}
                onChangeText={setDiaSelecionado}
              />
            </View>
          </View>
        </View>

        {/* Resumo */}
        <View style={styles.resumoContainer}>
          <Text style={styles.resumoText}>
            Total Filtrado: <Text style={{ color: '#d32f2f', fontWeight: 'bold' }}>R$ {totalGasto.toFixed(2)}</Text>
          </Text>
        </View>
      </View>

      <FlatList
        data={listaFiltrada}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={carregarDados} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma compra encontrada.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => abrirDetalhes(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardProduto}>{item.produto}</Text>
              <Text style={styles.cardValor}>R$ {item.valor.toFixed(2)}</Text>
            </View>
            <Text style={styles.texto} numberOfLines={1}>{item.descricao || 'Sem descrição'}</Text>

            <View style={styles.rowInfo}>
              <Text style={styles.dataBadge}>📅 {new Date(item.data).toLocaleDateString('pt-BR')}</Text>
              <Text style={styles.infoTiny}>Clique para ver +</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* --- MODAL DETALHES DA COMPRA (As informações que faltavam) --- */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Compra</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            {itemSelecionado && (
              <ScrollView>
                <Text style={styles.labelDetail}>Produto:</Text>
                <Text style={styles.valueDetailBig}>{itemSelecionado.produto}</Text>

                <Text style={styles.labelDetail}>Valor:</Text>
                <Text style={[styles.valueDetailBig, { color: '#d32f2f' }]}>R$ {itemSelecionado.valor.toFixed(2)}</Text>

                <View style={styles.divider} />

                <Text style={styles.labelDetail}>Data:</Text>
                <Text style={styles.valueDetail}>{new Date(itemSelecionado.data).toLocaleString()}</Text>

                <Text style={styles.labelDetail}>Forma de Pagamento:</Text>
                <Text style={styles.valueDetail}>{itemSelecionado.formaPagamento || "Não informado"}</Text>

                <Text style={styles.labelDetail}>Descrição:</Text>
                <View style={styles.boxText}>
                  <Text style={styles.valueDetail}>{itemSelecionado.descricao || "-"}</Text>
                </View>

                <Text style={styles.labelDetail}>Observações:</Text>
                <View style={styles.boxText}>
                  <Text style={styles.valueDetail}>{itemSelecionado.observacao || "Nenhuma observação."}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Mês (Igual anterior) */}
      <Modal visible={modalMesVisible} transparent animationType="fade" onRequestClose={() => setModalMesVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSmallContent}>
            <Text style={styles.modalTitle}>Filtrar Mês</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setMesSelecionado(null); setModalMesVisible(false); }}>
              <Text style={styles.modalOptionText}>📅 Mostrar Ano Todo</Text>
            </TouchableOpacity>
            <ScrollView style={{ maxHeight: 250 }}>
              {meses.map((mes, index) => (
                <TouchableOpacity key={index} style={styles.modalOption} onPress={() => { setMesSelecionado(index); setModalMesVisible(false); }}>
                  <Text style={[styles.modalOptionText, mesSelecionado === index && { color: '#007BFF', fontWeight: 'bold' }]}>
                    {mes}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 10 }} onPress={() => setModalMesVisible(false)}>
              <Text style={{ color: 'red' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEFEF' },

  header: { backgroundColor: '#FFF', padding: 20, paddingTop: Platform.OS === 'android' ? 50 : 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 4 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 15 },

  filterContainer: { gap: 10 },
  searchBox: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, alignItems: 'center', paddingHorizontal: 10 },
  inputSearch: { flex: 1, paddingVertical: 8, fontSize: 16 },

  dateRow: { flexDirection: 'row', gap: 10 },
  dateButton: { flex: 2, backgroundColor: '#007BFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, gap: 5 },
  dateButtonText: { color: '#FFF', fontWeight: 'bold' },

  dayInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 8, paddingHorizontal: 10 },
  dayLabel: { fontWeight: 'bold', color: '#666', marginRight: 5 },
  dayInput: { flex: 1, fontSize: 16, fontWeight: 'bold', paddingVertical: 5 },

  resumoContainer: { marginTop: 15, padding: 10, backgroundColor: '#FFEBEE', borderRadius: 8, alignItems: 'center' },
  resumoText: { fontSize: 16, color: '#333' },

  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  cardProduto: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  cardValor: { fontSize: 18, fontWeight: 'bold', color: '#d32f2f' },
  texto: { fontSize: 14, color: '#555', marginBottom: 10 },
  rowInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dataBadge: { backgroundColor: '#E3F2FD', color: '#1565C0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 12, fontWeight: 'bold' },
  infoTiny: { fontSize: 10, color: '#999' },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#999' },

  // Styles do Modal Detalhes
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 5, maxHeight: '80%' },
  modalSmallContent: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderColor: '#EEE', paddingBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  labelDetail: { fontSize: 12, color: '#888', marginTop: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  valueDetailBig: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  valueDetail: { fontSize: 16, color: '#444' },
  boxText: { backgroundColor: '#F9F9F9', padding: 10, borderRadius: 8, marginTop: 5 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },

  modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EEE' },
  modalOptionText: { fontSize: 16, color: '#333', textAlign: 'center' },
});