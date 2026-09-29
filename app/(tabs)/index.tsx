import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function LoginScreen() {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Olá!</Text>
        <Text style={styles.welcomeText}>Seja bem-vindo ao</Text>
        <Text style={styles.logo}>ECONOMiZE</Text>
        <Text style={styles.slogan}>Economize hoje, aproveite amanhã!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="CPF/CNPJ"
          placeholderTextColor="#3f5c4c"
          value={cpfCnpj}
          onChangeText={setCpfCnpj}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#3f5c4c"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Ainda não possui uma conta? </Text>
          <TouchableOpacity>
            <Text style={styles.registerLink}>cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3d7a52',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  welcomeText: {
    color: '#eaf7ee',
    fontSize: 18,
    fontWeight: '600',
  },
  logo: {
    color: '#a3e6b0',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 10,
  },
  slogan: {
    color: '#eaf7ee',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#ececec',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3d7a52',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#c9d9cd',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    color: '#3d7a52',
    fontWeight: '600',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#3d7a52',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotText: {
    color: '#3d7a52',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 12,
    textDecorationLine: 'underline',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
  },
  registerLink: {
    fontSize: 13,
    color: '#3d7a52',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});