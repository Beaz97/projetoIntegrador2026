
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';

import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CadastroEmpresa() {
  const router = useRouter();

  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  function formatarCNPJ(valor: string) {
    const numeros = valor.replace(/\D/g, '').slice(0, 14);

    return numeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  function cadastrarEmpresa() {
    if (
      !nomeEmpresa.trim() ||
      !responsavel.trim() ||
      !email.trim() ||
      !cnpj.trim() ||
      !senha ||
      !confirmar
    ) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha todos os campos para continuar.'
      );
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }

    if (cnpj.replace(/\D/g, '').length !== 14) {
      Alert.alert('CNPJ inválido', 'Digite os 14 números do CNPJ.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert(
        'Senha muito curta',
        'A senha deve ter pelo menos 6 caracteres.'
      );
      return;
    }

    if (senha !== confirmar) {
      Alert.alert('Senhas diferentes', 'As senhas não coincidem.');
      return;
    }

    Alert.alert(
      'Cadastro concluído!',
      'Os dados foram validados. Você será direcionado para a área da empresa.',
      [
        {
          text: 'Continuar',
          onPress: () => router.replace('/homeempresa'),
        },
      ]
    );
  }

  return (
    <View style={styles.tela}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9f7" />

      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.voltar}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={23} color="#245b38" />
        </Pressable>

        <View style={styles.logo}>
          <View style={styles.logoIcone}>
            <Ionicons name="storefront-outline" size={30} color="#fff" />
          </View>
          <Text style={styles.logoTexto}>Economize</Text>
        </View>

        <Text style={styles.titulo}>Cadastre sua empresa</Text>
        <Text style={styles.subtitulo}>
          Faça parte do Economize e divulgue seus produtos.
        </Text>

        <View style={styles.formulario}>
          <Text style={styles.label}>Nome da empresa</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome da empresa"
            placeholderTextColor="#929a94"
            value={nomeEmpresa}
            onChangeText={setNomeEmpresa}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={styles.label}>Nome do responsável</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor="#929a94"
            value={responsavel}
            onChangeText={setResponsavel}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="empresa@email.com"
            placeholderTextColor="#929a94"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={styles.label}>CNPJ</Text>
          <TextInput
            style={styles.input}
            placeholder="00.000.000/0000-00"
            placeholderTextColor="#929a94"
            value={cnpj}
            onChangeText={(valor) => setCnpj(formatarCNPJ(valor))}
            keyboardType="numeric"
            maxLength={18}
            returnKeyType="next"
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputSenha}>
            <TextInput
              style={styles.campoSenha}
              placeholder="Mínimo de 6 caracteres"
              placeholderTextColor="#929a94"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              returnKeyType="next"
            />
            <Pressable
              onPress={() => setMostrarSenha(!mostrarSenha)}
              hitSlop={10}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                size={21}
                color="#68766b"
              />
            </Pressable>
          </View>

          <Text style={styles.label}>Confirmar senha</Text>
          <View style={styles.inputSenha}>
            <TextInput
              style={styles.campoSenha}
              placeholder="Digite a senha novamente"
              placeholderTextColor="#929a94"
              value={confirmar}
              onChangeText={setConfirmar}
              secureTextEntry={!mostrarConfirmar}
              autoCapitalize="none"
              returnKeyType="done"
            />
            <Pressable
              onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
              hitSlop={10}
            >
              <Ionicons
                name={
                  mostrarConfirmar
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={21}
                color="#68766b"
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botao,
            pressed && styles.botaoPressionado,
          ]}
          onPress={cadastrarEmpresa}
          accessibilityRole="button"
        >
          <Text style={styles.botaoTexto}>Cadastrar empresa</Text>
          <Ionicons name="arrow-forward" size={21} color="#fff" />
        </Pressable>

        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>Já tem uma conta? </Text>
          <Link href="/login" style={styles.linkLogin}>
            Fazer login
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#f7f9f7',
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 48,
    paddingBottom: 30,
  },
  voltar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#e8f0e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 28,
  },
  logoIcone: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#245b38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTexto: {
    fontSize: 25,
    fontWeight: '800',
    color: '#245b38',
    letterSpacing: -0.7,
  },
  titulo: {
    fontSize: 27,
    fontWeight: '800',
    color: '#1e3325',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    lineHeight: 21,
    color: '#788179',
    marginBottom: 25,
  },
  formulario: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#33483a',
    marginTop: 5,
  },
  input: {
    height: 51,
    borderWidth: 1,
    borderColor: '#e0e7e0',
    borderRadius: 13,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    color: '#26372b',
    fontSize: 14,
  },
  inputSenha: {
    minHeight: 51,
    borderWidth: 1,
    borderColor: '#e0e7e0',
    borderRadius: 13,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  campoSenha: {
    flex: 1,
    height: 49,
    color: '#26372b',
    fontSize: 14,
    paddingRight: 10,
  },
  botao: {
    height: 55,
    borderRadius: 16,
    backgroundColor: '#245b38',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 25,
    elevation: 3,
  },
  botaoPressionado: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  rodapeTexto: {
    color: '#788179',
    fontSize: 14,
  },
  linkLogin: {
    color: '#245b38',
    fontSize: 14,
    fontWeight: '800',
  },
});
