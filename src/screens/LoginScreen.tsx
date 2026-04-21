import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { Colors } from '../theme/colors';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const { login } = require('../utils/storage');
      const usuario = login(email.trim().toLowerCase(), senha);
      if (usuario) {
        onLogin();
      } else {
        Alert.alert('Erro', 'Email ou senha incorretos.');
      }
    }, 300);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/selgron-logo.png')}
          style={styles.logoImagem}
          resizeMode="contain"
        />
        <Text style={styles.logoSub}>Plataforma Interna</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.titulo}>Acesso ao Sistema</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@selgron.com.br"
          placeholderTextColor={Colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••"
          placeholderTextColor={Colors.textSecondary}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.botao}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textDark} />
            : <Text style={styles.botaoTexto}>ENTRAR</Text>
          }
        </TouchableOpacity>

        <Text style={styles.demoTexto}>
          Demo: tecnico@selgron.com.br / 123456
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImagem: {
    width: 220,
    height: 80,
    marginBottom: 8,
  },
  logoSub: {
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 4,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  botao: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoTexto: {
    color: Colors.textDark,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  demoTexto: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
  },
});
