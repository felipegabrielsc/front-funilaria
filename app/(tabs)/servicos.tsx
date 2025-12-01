import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

export default function ServicosScreen() {
    const [veiculo, setVeiculo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [loading, setLoading] = useState(false);

    // ⚠️ SEU IP AQUI
    const API_URL = 'https://backend-oficina-api.onrender.com/servicos';

    const salvarServico = async () => {
        if (!veiculo || !valor) {
            Alert.alert("Erro", "Preencha o Veículo e o Valor!");
            return;
        }
        setLoading(true);
        try {
            await axios.post(API_URL, {
                veiculo,
                descricao,
                valor: parseFloat(valor.replace(',', '.'))
            });

            Alert.alert("Sucesso", "Serviço enviado para o Financeiro!");
            // Limpa tudo
            setVeiculo('');
            setDescricao('');
            setValor('');
        } catch (error) {
            Alert.alert("Erro", "Não foi possível salvar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Ionicons name="car-sport" size={50} color="#007BFF" />
                    <Text style={styles.titulo}>Entrada de Veículo</Text>
                    <Text style={styles.subtitulo}>Cadastre o serviço para controle</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.labelInput}>Qual o Carro? (Modelo / Placa)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: Jetta Preto - ABC 1234"
                        value={veiculo} onChangeText={setVeiculo}
                    />

                    <Text style={styles.labelInput}>Valor do Orçamento (R$)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0,00"
                        keyboardType="numeric"
                        value={valor} onChangeText={setValor}
                    />

                    <Text style={styles.labelInput}>Descrição do Serviço</Text>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        placeholder="Liste as peças e mão de obra..."
                        multiline={true}
                        numberOfLines={5}
                        value={descricao} onChangeText={setDescricao}
                    />

                    <TouchableOpacity style={styles.btnSalvar} onPress={salvarServico}>
                        <Text style={styles.txtBtn}>{loading ? "Registrando..." : "CADASTRAR E ENVIAR"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    scroll: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
    titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10 },
    subtitulo: { fontSize: 16, color: '#666' },

    form: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 4 },
    labelInput: { fontWeight: 'bold', fontSize: 14, color: '#555', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#DDD', padding: 15, borderRadius: 10, fontSize: 16 },

    btnSalvar: { backgroundColor: '#007BFF', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 30, elevation: 2 },
    txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});