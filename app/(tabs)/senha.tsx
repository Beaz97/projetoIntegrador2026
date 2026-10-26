
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { useState, useRef } from 'react';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import userController from '@/app/rotaServidor/userController';

export default function Index() {
  const router = useRouter();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const cpfRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);

  async function handleLogin() {
    if (!cpf.trim() || !senha.trim()) {
      alert('Por favor, informe seu CPF/CNPJ e a senha.');
      return;
    }

    try {
      setCarregando(true);

      const resultado = await userController.login(cpf, senha);

      if (!resultado.sucesso || !resultado.usuario) {
        alert(resultado.mensagem || 'Falha na autenticação.');
        return;
      }

      const tipoUsuario = (
        resultado.usuario.tipo || 'cliente'
      ).toLowerCase();

      if (tipoUsuario === 'empresa') {
        router.replace('/homeempresa');
      } else {
        router.replace('/home');
      }
    } catch (error: any) {
      console.error('Erro ao realizar login:', error);
      alert(error.message || 'Erro inesperado ao realizar login.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.topo}>
          <View style={styles.logoIcone}>
            <Ionicons
              name="cart"
              size={32}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.logoTexto}>Economize</Text>

          <Text style={styles.logoSubtitulo}>
            Economize mais em suas compras
          </Text>
        </View>

        {/* Área de login */}
        <View style={styles.card}>
          <View style={styles.cabecalho}>
            <Text style={styles.entrar}>Bem-vindo!</Text>

            <Text style={styles.subtitulo}>
              Entre na sua conta para continuar.
            </Text>
          </View>

          {/* CPF ou CNPJ */}
          <Text style={styles.label}>CPF ou CNPJ</Text>

          <Pressable
            style={styles.campo}
            onPress={() => cpfRef.current?.focus()}
          >
            <Ionicons
              name="person-outline"
              size={21}
              color="#41805A"
            />

            <TextInput
              ref={cpfRef}
              style={styles.input}
              placeholder="Digite seu CPF ou CNPJ"
              placeholderTextColor="#929A94"
              keyboardType="numeric"
              value={cpf}
              onChangeText={setCpf}
              returnKeyType="next"
              onSubmitEditing={() => senhaRef.current?.focus()}
              accessibilityLabel="CPF ou CNPJ"
            />

            {cpf.length > 0 && (
              <Pressable
                onPress={() => setCpf('')}
                hitSlop={10}
                accessibilityLabel="Limpar CPF ou CNPJ"
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color="#A3ACA5"
                />
              </Pressable>
            )}
          </Pressable>

          {/* Senha */}
          <Text style={styles.label}>Senha</Text>

          <Pressable
            style={styles.campo}
            onPress={() => senhaRef.current?.focus()}
          >
            <Ionicons
              name="lock-closed-outline"
              size={21}
              color="#41805A"
            />

            <TextInput
              ref={senhaRef}
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#929A94"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              accessibilityLabel="Senha"
            />

            <Pressable
              onPress={() => setMostrarSenha(!mostrarSenha)}
              hitSlop={10}
              accessibilityLabel={
                mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
              }
            >
              <Ionicons
                name={
                  mostrarSenha
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={21}
                color="#78847B"
              />
            </Pressable>
          </Pressable>

          {/* Recuperar senha */}
          <Pressable
            style={styles.esqueci}
            onPress={() => router.push('/recuperarsenha')}
          >
            <Text style={styles.esqueciTexto}>
              Esqueci minha senha
            </Text>
          </Pressable>

          {/* Botão de login */}
          <Pressable
            style={[
              styles.botaoLogin,
              carregando && styles.botaoDesativado,
            ]}
            onPress={handleLogin}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.botaoLoginTexto}>
                  Entrar
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>

          {/* Separador */}
          <View style={styles.separador}>
            <View style={styles.linha} />

            <Text style={styles.ouTexto}>ou</Text>

            <View style={styles.linha} />
          </View>

          {/* Cadastro */}
          <Pressable
            style={styles.botaoCadastro}
            onPress={() => router.push('/cadastroempresa')}
          >
            <Ionicons
              name="person-add-outline"
              size={19}
              color="#2F7045"
            />

            <Text style={styles.botaoCadastroTexto}>
              Criar uma conta
            </Text>
          </Pressable>

          {/* Rodapé */}
          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>
              Ainda não possui uma conta?{' '}
            </Text>

            <Link href="/cadastroempresa" style={styles.link}>
              Cadastre-se
            </Link>
          </View>
        </View>

        <Text style={styles.textoFinal}>
          Economize • Compre melhor
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
  },

  // Logo
  topo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
    paddingBottom: 26,
    paddingHorizontal: 20,
  },

  logoIcone: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: '#2F7045',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  logoTexto: {
    fontSize: 30,
    fontWeight: '700',
    color: '#245D39',
    letterSpacing: -0.8,
  },

  logoSubtitulo: {
    fontSize: 13,
    color: '#78847B',
    marginTop: 5,
    fontWeight: '400',
  },

  // Cartão
  card: {
    flex: 1,
    backgroundColor: '#F5F8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: '#E5EDE6',
  },

  cabecalho: {
    marginBottom: 26,
  },

  entrar: {
    fontSize: 27,
    fontWeight: '700',
    color: '#203D2A',
    letterSpacing: -0.5,
  },

  subtitulo: {
    fontSize: 14,
    color: '#758078',
    marginTop: 7,
    lineHeight: 20,
  },

  // Campos
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#354B3A',
    marginBottom: 8,
    marginLeft: 3,
  },

  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 54,
    marginBottom: 19,
    borderWidth: 1,
    borderColor: '#E0E8E1',
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 14,
    fontWeight: '400',
    color: '#263A2C',
    marginLeft: 12,
    paddingVertical: 0,
  },

  // Recuperar senha
  esqueci: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 24,
    paddingVertical: 4,
  },

  esqueciTexto: {
    color: '#2F7045',
    fontSize: 13,
    fontWeight: '600',
  },

  // Botão principal
  botaoLogin: {
    backgroundColor: '#2F7045',
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#245D39',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },

  botaoDesativado: {
    opacity: 0.7,
  },

  botaoLoginTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Separador
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 23,
  },

  linha: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDE5DE',
  },

  ouTexto: {
    color: '#89928B',
    fontSize: 13,
    marginHorizontal: 15,
  },

  // Cadastro
  botaoCadastro: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C9D9CC',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  botaoCadastroTexto: {
    color: '#2F7045',
    fontSize: 15,
    fontWeight: '600',
  },

  // Rodapé
  rodape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  rodapeTexto: {
    color: '#78847B',
    fontSize: 12,
  },

  link: {
    color: '#2F7045',
    fontSize: 12,
    fontWeight: '700',
  },

  textoFinal: {
    textAlign: 'center',
    color: '#A0AAA2',
    fontSize: 11,
    paddingTop: 16,
    paddingBottom: 18,
  },
});