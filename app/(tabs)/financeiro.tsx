import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Modal, RefreshControl, Platform, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ServicoProps {
    _id: string;
    veiculo: string;
    descricao: string;
    valor: number;
    pago: boolean;
    data: string;
}

export default function FinanceiroScreen() {
    const [listaCompleta, setListaCompleta] = useState<ServicoProps[]>([]);
    const [listaFiltrada, setListaFiltrada] = useState<ServicoProps[]>([]);
    const [loading, setLoading] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [itemSelecionado, setItemSelecionado] = useState<ServicoProps | null>(null);

    // Filtros
    const [textoBusca, setTextoBusca] = useState('');
    const [mesSelecionado, setMesSelecionado] = useState<number | null>(new Date().getMonth());
    const [diaSelecionado, setDiaSelecionado] = useState(''); // Novo filtro
    const [modalMesVisible, setModalMesVisible] = useState(false);

    // ⚠️ SEU IP AQUI
    const API_URL = 'https://backend-oficina-api.onrender.com/servicos';

    const carregarFinanceiro = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setListaCompleta(response.data);
            aplicarFiltros(response.data, textoBusca, mesSelecionado, diaSelecionado);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            carregarFinanceiro();
        }, [])
    );

    const aplicarFiltros = (lista: ServicoProps[], texto: string, mes: number | null, dia: string) => {
        let filtrados = lista;

        if (texto) {
            filtrados = filtrados.filter(item =>
                item.veiculo.toLowerCase().includes(texto.toLowerCase())
            );
        }

        if (mes !== null) {
            const anoAtual = new Date().getFullYear();
            filtrados = filtrados.filter(item => {
                const dataItem = new Date(item.data);
                const mesmoMes = dataItem.getMonth() === mes;
                const mesmoAno = dataItem.getFullYear() === anoAtual;

                // Filtro dia
                if (dia && dia.trim() !== '') {
                    return mesmoMes && mesmoAno && (dataItem.getDate() === parseInt(dia));
                }
                return mesmoMes && mesmoAno;
            });
        }

        setListaFiltrada(filtrados);
    };

    useEffect(() => {
        aplicarFiltros(listaCompleta, textoBusca, mesSelecionado, diaSelecionado);
    }, [textoBusca, mesSelecionado, diaSelecionado]);

    const togglePagamento = async () => {
        if (!itemSelecionado) return;
        try {
            await axios.patch(`${API_URL}/${itemSelecionado._id}/toggle`);
            setModalVisible(false);
            carregarFinanceiro();
        } catch (error) {
            Alert.alert("Erro", "Falha ao atualizar.");
        }
    };

    const totalRecebido = listaFiltrada.filter(i => i.pago).reduce((acc, i) => acc + i.valor, 0);
    const totalPendente = listaFiltrada.filter(i => !i.pago).reduce((acc, i) => acc + i.valor, 0);

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    return (
        <View style={styles.container}>

            {/* DASHBOARD */}
            <View style={styles.dashboard}>
                <View style={styles.topRow}>
                    <Text style={styles.dashTitle}>Fluxo de Caixa</Text>

                    {/* Área de Filtros */}
                    <View style={styles.filterArea}>
                        {/* Linha 1: Texto e Dia */}
                        <View style={{ flexDirection: 'row', gap: 5 }}>
                            <View style={styles.searchBox}>
                                <Ionicons name="search" size={16} color="#666" />
                                <TextInput
                                    style={styles.inputSearch}
                                    placeholder="Carro..."
                                    value={textoBusca}
                                    onChangeText={setTextoBusca}
                                />
                            </View>
                            <View style={styles.dayBox}>
                                <TextInput
                                    style={styles.inputDay}
                                    placeholder="Dia"
                                    keyboardType="numeric"
                                    maxLength={2}
                                    value={diaSelecionado}
                                    onChangeText={setDiaSelecionado}
                                />
                            </View>
                        </View>

                        {/* Linha 2: Mês */}
                        <TouchableOpacity style={styles.btnMes} onPress={() => setModalMesVisible(true)}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                                {mesSelecionado !== null ? meses[mesSelecionado] : "Todos"}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.dashRow}>
                    <View style={[styles.cardDash, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}>
                        <Text style={styles.labelDash}>Recebido</Text>
                        <Text style={[styles.valorDash, { color: '#2E7D32' }]}>R$ {totalRecebido.toFixed(2)}</Text>
                    </View>

                    <View style={[styles.cardDash, { backgroundColor: '#FFEBEE', borderColor: '#E53935' }]}>
                        <Text style={styles.labelDash}>A Receber</Text>
                        <Text style={[styles.valorDash, { color: '#C62828' }]}>R$ {totalPendente.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={listaFiltrada}
                keyExtractor={item => item._id}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={carregarFinanceiro} />}
                contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Nenhum registro encontrado.</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, item.pago ? styles.borderVerde : styles.borderVermelha]}
                        onPress={() => { setItemSelecionado(item); setModalVisible(true); }}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name={item.pago ? "checkmark-circle" : "time"} size={32} color={item.pago ? "#4CAF50" : "#E53935"} />
                        </View>
                        <View style={{ flex: 1, paddingHorizontal: 10 }}>
                            <Text style={styles.cardVeiculo}>{item.veiculo}</Text>
                            <Text style={styles.cardDesc} numberOfLines={1}>{item.descricao || "Sem descrição"}</Text>
                            <Text style={styles.cardData}>{new Date(item.data).toLocaleDateString('pt-BR')}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.cardValor}>R$ {item.valor.toFixed(2)}</Text>
                            <Text style={[styles.statusText, { color: item.pago ? "#4CAF50" : "#E53935" }]}>
                                {item.pago ? "PAGO" : "COBRAR"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* Modais (Mês e Validação) mantidos iguais, só com estilos novos */}
            <Modal visible={modalMesVisible} transparent animationType="fade" onRequestClose={() => setModalMesVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Mês de Referência</Text>
                        <TouchableOpacity style={styles.modalOption} onPress={() => { setMesSelecionado(null); setModalMesVisible(false); }}>
                            <Text style={styles.modalOptionText}>🌐 Ver Tudo</Text>
                        </TouchableOpacity>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {meses.map((mes, index) => (
                                <TouchableOpacity key={index} style={styles.modalOption} onPress={() => { setMesSelecionado(index); setModalMesVisible(false); }}>
                                    <Text style={[styles.modalOptionText, mesSelecionado === index && { color: '#007BFF', fontWeight: 'bold' }]}>{mes}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={{ marginTop: 10, alignSelf: 'center' }} onPress={() => setModalMesVisible(false)}>
                            <Text style={{ color: 'red' }}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Gerenciar Pagamento</Text>
                        {itemSelecionado && (
                            <>
                                <View style={styles.infoBox}>
                                    <Text style={styles.labelInfo}>Veículo: <Text style={styles.textInfo}>{itemSelecionado.veiculo}</Text></Text>
                                    <Text style={styles.labelInfo}>Valor: <Text style={styles.textInfoVal}>R$ {itemSelecionado.valor.toFixed(2)}</Text></Text>
                                    <Text style={styles.labelInfo}>Serviço:</Text>
                                    <Text style={{ marginTop: 5, color: '#444' }}>{itemSelecionado.descricao}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.btnAction, { backgroundColor: itemSelecionado.pago ? '#E53935' : '#4CAF50' }]}
                                    onPress={togglePagamento}
                                >
                                    <Text style={styles.btnText}>
                                        {itemSelecionado.pago ? "CANCELAR (ESTORNAR)" : "CONFIRMAR RECEBIMENTO"}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity style={{ marginTop: 15, alignSelf: 'center' }} onPress={() => setModalVisible(false)}>
                            <Text style={{ color: '#666' }}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    dashboard: { backgroundColor: '#FFF', padding: 20, paddingTop: Platform.OS === 'android' ? 50 : 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 5 },

    topRow: { marginBottom: 15 },
    dashTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },

    filterArea: { gap: 10 },
    searchBox: { flex: 2, flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, alignItems: 'center', paddingHorizontal: 10 },
    inputSearch: { flex: 1, paddingVertical: 8, fontSize: 14 },

    dayBox: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 10 },
    inputDay: { fontSize: 14, textAlign: 'center' },

    btnMes: { backgroundColor: '#007BFF', padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },

    dashRow: { flexDirection: 'row', gap: 15 },
    cardDash: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    labelDash: { fontSize: 12, fontWeight: 'bold', marginTop: 5, color: '#555' },
    valorDash: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },

    card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, marginHorizontal: 15, marginBottom: 10, borderRadius: 10, alignItems: 'center', elevation: 2, borderWidth: 1 },
    borderVerde: { borderColor: '#4CAF50' },
    borderVermelha: { borderColor: '#E53935' },
    cardIcon: { width: 40, alignItems: 'center' },
    cardVeiculo: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardDesc: { fontSize: 13, color: '#888' },
    cardData: { fontSize: 12, color: '#AAA', marginTop: 2 },
    cardValor: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    statusText: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EEE' },
    modalOptionText: { fontSize: 16, color: '#333', textAlign: 'center' },

    infoBox: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, marginBottom: 20 },
    labelInfo: { fontSize: 14, color: '#666', marginBottom: 5 },
    textInfo: { fontSize: 16, color: '#333', fontWeight: 'bold' },
    textInfoVal: { fontSize: 18, color: '#2E7D32', fontWeight: 'bold' },
    btnAction: { padding: 15, borderRadius: 8, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});