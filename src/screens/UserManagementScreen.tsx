import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, Switch, Modal,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Usuario, getUsuarios, criarUsuario, atualizarPerfil, deletarUsuario } from '../utils/storage';

type UsuarioComAtivo = Usuario & { ativo: boolean };

export default function UserManagementScreen() {
  const [usuarios, setUsuarios] = useState<UsuarioComAtivo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoPerfil, setNovoPerfil] = useState<'tecnico' | 'gestor' | 'admin'>('tecnico');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    setUsuarios(await getUsuarios());
    setCarregando(false);
  }

  async function criarNovoUsuario() {
    if (!novoNome || !novoEmail || !novaSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    setSalvando(true);
    const erro = await criarUsuario(novoNome, novoEmail, novaSenha, novoPerfil);
    setSalvando(false);
    if (erro) {
      Alert.alert('Erro', erro);
    } else {
      Alert.alert('Sucesso', `Usuário ${novoNome} criado.`);
      setModalAberto(false);
      setNovoNome(''); setNovoEmail(''); setNovaSenha(''); setNovoPerfil('tecnico');
      carregar();
    }
  }

  async function alternarAtivo(u: UsuarioComAtivo) {
    await atualizarPerfil(u.id, { ativo: !u.ativo });
    carregar();
  }

  async function confirmarExclusao(u: UsuarioComAtivo) {
    const confirmar = Platform.OS === 'web'
      ? window.confirm(`Excluir o usuário "${u.nome}" permanentemente?`)
      : await new Promise<boolean>(resolve =>
          Alert.alert('Excluir usuário', `Excluir "${u.nome}" permanentemente?`, [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
          ])
        );
    if (!confirmar) return;
    const erro = await deletarUsuario(u.id);
    if (erro) Alert.alert('Erro', erro);
    else carregar();
  }

  async function alterarPerfil(u: UsuarioComAtivo, perfil: string) {
    await atualizarPerfil(u.id, { perfil });
    carregar();
  }

  const PERFIS: Array<'tecnico' | 'gestor' | 'admin'> = ['tecnico', 'gestor', 'admin'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Gestão de Usuários</Text>
        <TouchableOpacity style={styles.botaoNovo} onPress={() => setModalAberto(true)}>
          <Text style={styles.botaoNovoTexto}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {usuarios.length === 0 ? (
            <Text style={styles.vazio}>Nenhum usuário encontrado.</Text>
          ) : (
            usuarios.map(u => (
              <View key={u.id} style={[styles.card, !u.ativo && styles.cardInativo]}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardNome}>{u.nome}</Text>
                    <Text style={styles.cardEmail}>{u.email || '—'}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.ativoLabel}>{u.ativo ? 'Ativo' : 'Inativo'}</Text>
                    <Switch
                      value={u.ativo}
                      onValueChange={() => alternarAtivo(u)}
                      trackColor={{ false: Colors.border, true: Colors.primary }}
                      thumbColor={Colors.text}
                    />
                    <TouchableOpacity onPress={() => confirmarExclusao(u)} style={styles.excluirBtn}>
                      <Text style={styles.excluirIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.perfisRow}>
                  {PERFIS.map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.perfilBtn, u.perfil === p && styles.perfilBtnAtivo]}
                      onPress={() => alterarPerfil(u, p)}
                    >
                      <Text style={[styles.perfilBtnTexto, u.perfil === p && styles.perfilBtnTextoAtivo]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={modalAberto} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Novo Usuário</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={novoNome} onChangeText={setNovoNome}
              placeholderTextColor={Colors.textSecondary} placeholder="Nome completo" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={novoEmail} onChangeText={setNovoEmail}
              placeholderTextColor={Colors.textSecondary} placeholder="email@selgron.com.br"
              keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} value={novaSenha} onChangeText={setNovaSenha}
              placeholderTextColor={Colors.textSecondary} placeholder="Mínimo 6 caracteres"
              secureTextEntry />

            <Text style={styles.label}>Perfil</Text>
            <View style={styles.perfisRow}>
              {PERFIS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.perfilBtn, novoPerfil === p && styles.perfilBtnAtivo]}
                  onPress={() => setNovoPerfil(p)}
                >
                  <Text style={[styles.perfilBtnTexto, novoPerfil === p && styles.perfilBtnTextoAtivo]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalAberto(false)}>
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoSalvar} onPress={criarNovoUsuario} disabled={salvando}>
                {salvando
                  ? <ActivityIndicator color={Colors.textDark} />
                  : <Text style={styles.botaoSalvarTexto}>Criar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  titulo: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
  botaoNovo: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  botaoNovoTexto: { color: Colors.textDark, fontWeight: 'bold', fontSize: 14 },

  lista: { padding: 16, paddingTop: 4, gap: 10 },
  vazio: { color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },

  card: {
    backgroundColor: Colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  cardInativo: { opacity: 0.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardNome: { color: Colors.text, fontWeight: 'bold', fontSize: 15 },
  cardEmail: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: 'center', gap: 4 },
  ativoLabel: { color: Colors.textSecondary, fontSize: 11 },
  excluirBtn: { padding: 4, marginTop: 4 },
  excluirIcon: { fontSize: 18 },

  perfisRow: { flexDirection: 'row', gap: 8 },
  perfilBtn: {
    flex: 1, padding: 8, borderRadius: 6,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  perfilBtnAtivo: { backgroundColor: '#2A1E00', borderColor: Colors.primary },
  perfilBtnTexto: { color: Colors.textSecondary, fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  perfilBtnTextoAtivo: { color: Colors.primary },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: Colors.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: Colors.border },
  modalTitulo: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6, letterSpacing: 1 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border,
    padding: 12, color: Colors.text, fontSize: 14, marginBottom: 12,
  },
  modalBotoes: { flexDirection: 'row', gap: 12, marginTop: 8 },
  botaoCancelar: {
    flex: 1, padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  botaoCancelarTexto: { color: Colors.textSecondary, fontWeight: 'bold' },
  botaoSalvar: {
    flex: 1, padding: 12, borderRadius: 8,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  botaoSalvarTexto: { color: Colors.textDark, fontWeight: 'bold' },
});
