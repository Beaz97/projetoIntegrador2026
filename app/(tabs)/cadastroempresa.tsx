import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useState, useRef } from 'react';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import userController, {
  setUsuarioLogado,
} from '@/app/rotaServidor/userController';

function emailValido(valor: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
}

function cnpjValido(valor: string) {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length !== 14) {
    return false;
  }

  if (/^(\d)\1+$/.test(numeros)) {
    return false;
  }

  function calcularDigito(base: string, pesos: number[]) {
    const soma = pesos.reduce(
      (total, peso, indice) => total + Number(base[indice]) * peso,
      0
    );

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  const pesosPrimeiro = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesosSegundo = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const base = numeros.slice(0, 12);
  const primeiro = calcularDigito(base, pesosPrimeiro);
  const segundo = calcularDigito(base + primeiro, pesosSegundo);

  return numeros === base + String(primeiro) + String(segundo);
}

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [empresa, setEmpresa] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroEmail, setErroEmail] = useState('');
  const [erroDocumento, setErroDocumento] = useState('');

  const nomeRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmarRef = useRef<TextInput>(null);

  const textoDocumento = empresa ? 'CNPJ' : 'CPF';

  function trocarTipo() {
    setEmpresa((valor) => !valor);
    setCpf('');
    setErroDocumento('');
  }

  function mudarEmail(valor: string) {
    setEmail(valor);

    if (erroEmail) {
      setErroEmail('');
    }
  }

  function mudarDocumento(valor: string) {
    setCpf(valor);

    if (erroDocumento) {
      setErroDocumento('');
    }
  }

  async function handleCadastrar() {
    if (
      !nome.trim() ||
      !email.trim() ||
      !cpf.trim() ||
      !senha ||
      !confirmar
    ) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha todos os campos para continuar.'
      );
      return;
    }

    let temErro = false;

    if (!emailValido(email)) {
      setErroEmail('E-mail inválido. Confira e tente novamente.');
      temErro = true;
    }

    if (empresa && !cnpjValido(cpf)) {
      setErroDocumento('CNPJ inválido. Confira os números digitados.');
      temErro = true;
    }

    if (temErro) {
      return;
    }

    if (senha !== confirmar) {
      Alert.alert(
        'Senhas diferentes',
        'As senhas não coincidem. Confira e tente novamente.'
      );
      return;
    }

    try {
      setCarregando(true);

      const usuarioCriado = await userController.criar({
        nome: nome.trim(),
        email: email.trim(),
        documento: cpf.trim(),
        senha,
        tipo: empresa ? 'Empresa' : 'Cliente',
      });

      if (empresa) {
        await setUsuarioLogado(usuarioCriado);
      }

      console.log('Usuário cadastrado com sucesso:', usuarioCriado);

      Alert.alert(
        'Cadastro realizado!',
        'Sua conta foi criada com sucesso.',
        [
          {
            text: 'Continuar',
            onPress: () =>
              router.replace(empresa ? '/homeempresa' : '/senha'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao cadastrar usuário:', error);

      Alert.alert(
        'Não foi possível cadastrar',
        error.message || 'Ocorreu um erro ao realizar o cadastro.'
      );
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
        barStyle="light-content"
        backgroundColor="#2F7045"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho e logo */}
        <View style={styles.topo}>
          <View style={styles.logoIcone}>
            <Ionicons
              name="cart"
              size={31}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.logoTexto}>
            Economize
          </Text>

          <Text style={styles.boasVindas}>
            Crie sua conta e economize mais
          </Text>
        </View>

        {/* Cartão de cadastro */}
        <View style={styles.card}>
          {/* Título e tipo de conta */}
          <View style={styles.titulo}>
            <View style={styles.tituloConteudo}>
              <Text style={styles.cadastro}>
                Criar conta
              </Text>

              <Text style={styles.descricao}>
                Preencha seus dados abaixo.
              </Text>
            </View>
          </View>

          {/* Seletor de tipo */}
          <View style={styles.seletorContainer}>
            <Pressable
              style={[
                styles.opcaoTipo,
                !empresa && styles.opcaoAtiva,
              ]}
              onPress={() => {
                if (empresa) trocarTipo();
              }}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={!empresa ? '#FFFFFF' : '#68756B'}
              />

              <Text
                style={[
                  styles.opcaoTexto,
                  !empresa && styles.opcaoTextoAtivo,
                ]}
              >
                Cliente
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.opcaoTipo,
                empresa && styles.opcaoAtiva,
              ]}
              onPress={() => {
                if (!empresa) trocarTipo();
              }}
            >
              <Ionicons
                name="storefront-outline"
                size={18}
                color={empresa ? '#FFFFFF' : '#68756B'}
              />

              <Text
                style={[
                  styles.opcaoTexto,
                  empresa && styles.opcaoTextoAtivo,
                ]}
              >
                Empresa
              </Text>
            </Pressable>
          </View>

          {/* Nome */}
          <Text style={styles.label}>
            {empresa ? 'Nome da empresa' : 'Nome completo'}
          </Text>

          <Pressable
            style={styles.campo}
            onPress={() => nomeRef.current?.focus()}
          >
            <Ionicons
              name={empresa ? 'storefront-outline' : 'person-outline'}
              size={20}
              color="#41805A"
            />

            <TextInput
              ref={nomeRef}
              style={styles.input}
              placeholder={empresa ? 'Digite o nome da empresa' : 'Digite seu nome'}
              placeholderTextColor="#929A94"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              accessibilityLabel={empresa ? 'Nome da empresa' : 'Nome completo'}
            />
          </Pressable>

          {/* E-mail */}
          <Text style={styles.label}>
            E-mail
          </Text>

          <Pressable
            style={[
              styles.campo,
              erroEmail !== '' && styles.campoErro,
            ]}
            onPress={() => emailRef.current?.focus()}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color="#41805A"
            />

            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#929A94"
              value={email}
              onChangeText={mudarEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => cpfRef.current?.focus()}
              accessibilityLabel="E-mail"
            />
          </Pressable>

          {erroEmail !== '' && (
            <Text style={styles.textoErro}>{erroEmail}</Text>
          )}

          {/* CPF ou CNPJ */}
          <Text style={styles.label}>
            {textoDocumento}
          </Text>

          <Pressable
            style={[
              styles.campo,
              erroDocumento !== '' && styles.campoErro,
            ]}
            onPress={() => cpfRef.current?.focus()}
          >
            <Ionicons
              name="card-outline"
              size={20}
              color="#41805A"
            />

            <TextInput
              ref={cpfRef}
              style={styles.input}
              placeholder={`Digite seu ${textoDocumento}`}
              placeholderTextColor="#929A94"
              value={cpf}
              onChangeText={mudarDocumento}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => senhaRef.current?.focus()}
              accessibilityLabel={textoDocumento}
            />
          </Pressable>

          {erroDocumento !== '' && (
            <Text style={styles.textoErro}>{erroDocumento}</Text>
          )}

          {/* Senha */}
          <Text style={styles.label}>
            Senha
          </Text>

          <Pressable
            style={styles.campo}
            onPress={() => senhaRef.current?.focus()}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#41805A"
            />

            <TextInput
              ref={senhaRef}
              style={styles.input}
              placeholder="Crie uma senha"
              placeholderTextColor="#929A94"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => confirmarRef.current?.focus()}
              accessibilityLabel="Senha"
            />

            <Pressable
              onPress={() => setMostrarSenha((valor) => !valor)}
              hitSlop={10}
              accessibilityLabel={
                mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
              }
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#78847B"
              />
            </Pressable>
          </Pressable>

          {/* Confirmar senha */}
          <Text style={styles.label}>
            Confirmar senha
          </Text>

          <Pressable
            style={styles.campo}
            onPress={() => confirmarRef.current?.focus()}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#41805A"
            />

            <TextInput
              ref={confirmarRef}
              style={styles.input}
              placeholder="Digite a senha novamente"
              placeholderTextColor="#929A94"
              secureTextEntry={!mostrarConfirmar}
              value={confirmar}
              onChangeText={setConfirmar}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleCadastrar}
              accessibilityLabel="Confirmar senha"
            />

            <Pressable
              onPress={() => setMostrarConfirmar((valor) => !valor)}
              hitSlop={10}
              accessibilityLabel={
                mostrarConfirmar
                  ? 'Ocultar confirmação da senha'
                  : 'Mostrar confirmação da senha'
              }
            >
              <Ionicons
                name={
                  mostrarConfirmar
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={20}
                color="#78847B"
              />
            </Pressable>
          </Pressable>

          {/* Botão cadastrar */}
          <Pressable
            style={[
              styles.botao,
              carregando && styles.botaoDesativado,
            ]}
            onPress={handleCadastrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.botaoTexto}>
                  Criar minha conta
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>

          {/* Link para login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Já tem uma conta?
            </Text>

            <Link href="/senha" style={styles.footerLink}>
              Entrar
            </Link>
          </View>
        </View>

        {/* Rodapé da página */}
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
    backgroundColor: '#2F7045',
  },

  scrollContent: {
    flexGrow: 1,
  },

  // Cabeçalho
  topo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },

  logoIcone: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  logoTexto: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },

  boasVindas: {
    color: '#E4F0E6',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 6,
  },

  // Cartão principal
  card: {
    flex: 1,
    backgroundColor: '#F5F8F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: '#E1EAE2',
  },

  // Título
  titulo: {
    marginBottom: 19,
  },

  tituloConteudo: {
    gap: 5,
  },

  cadastro: {
    fontSize: 26,
    fontWeight: '700',
    color: '#203D2A',
    letterSpacing: -0.5,
  },

  descricao: {
    fontSize: 13,
    color: '#78847B',
    lineHeight: 19,
  },

  // Seletor de tipo de conta
  seletorContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8EEE9',
    borderRadius: 13,
    padding: 4,
    marginBottom: 22,
  },

  opcaoTipo: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  opcaoAtiva: {
    backgroundColor: '#2F7045',
  },

  opcaoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#68756B',
  },

  opcaoTextoAtivo: {
    color: '#FFFFFF',
  },

  // Campos
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#354B3A',
    marginBottom: 7,
    marginLeft: 3,
  },

  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E8E1',
  },

  campoErro: {
    borderColor: '#B3261E',
    backgroundColor: '#FFF8F7',
  },

  textoErro: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B3261E',
    marginTop: -8,
    marginBottom: 14,
    marginLeft: 3,
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 13,
    fontWeight: '400',
    color: '#263A2C',
    marginLeft: 11,
    paddingVertical: 0,
  },

  // Botão
  botao: {
    backgroundColor: '#2F7045',
    borderRadius: 13,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 21,
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

  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Rodapé
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
  },

  footerText: {
    color: '#78847B',
    fontSize: 12,
    fontWeight: '400',
  },

  footerLink: {
    color: '#2F7045',
    fontSize: 12,
    fontWeight: '700',
  },

  textoFinal: {
    textAlign: 'center',
    color: '#DDEBE0',
    fontSize: 11,
    paddingTop: 15,
    paddingBottom: 17,
  },
});