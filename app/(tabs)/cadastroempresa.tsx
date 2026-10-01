import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useState, useRef } from 'react';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [empresa, setEmpresa] = useState(false); // false = Cliente, true = Empresa

  const nomeRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const confirmarRef = useRef<TextInput>(null);

  // Textos que mudam conforme o tipo
  let textoBotao = 'Cliente';
  let textoDocumento = 'CPF';
  if (empresa) {
    textoBotao = 'Empresa';
    textoDocumento = 'CNPJ';
  }

  function trocarTipo() {
    setEmpresa(!empresa);
    setCpf('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Text style={styles.boasVindas}>Seja{'\n'}bem-{'\n'}vinda(o) ao</Text>
        <View style={styles.logo}>
          <Ionicons name="cart" size={36} color="#fff" />
          <Text style={styles.logoTexto}>Economize</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.titulo}>
          <Text style={styles.cadastro}>Cadastro</Text>
          <Pressable style={styles.cliente} onPress={trocarTipo}>
            <Text style={styles.clienteTexto}>{textoBotao}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.campo} onPress={() => nomeRef.current?.focus()}>
          <Ionicons name="person" size={32} color="#2f7a4b" style={styles.icone} />
          <TextInput
            ref={nomeRef}
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#2f7a4b"
            value={nome}
            onChangeText={setNome}
          />
        </Pressable>

        <Pressable style={styles.campo} onPress={() => emailRef.current?.focus()}>
          <Ionicons name="mail" size={28} color="#2f7a4b" style={styles.icone} />
          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#2f7a4b"
            value={email}
            onChangeText={setEmail}
          />
        </Pressable>

        <Pressable style={styles.campo} onPress={() => cpfRef.current?.focus()}>
          <Ionicons name="card" size={28} color="#2f7a4b" style={styles.icone} />
          <TextInput
            ref={cpfRef}
            style={styles.input}
            placeholder={textoDocumento}
            placeholderTextColor="#2f7a4b"
            value={cpf}
            onChangeText={setCpf}
          />
        </Pressable>

        <Pressable style={styles.campo} onPress={() => senhaRef.current?.focus()}>
          <Ionicons name="lock-closed" size={32} color="#2f7a4b" style={styles.icone} />
          <TextInput
            ref={senhaRef}
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#2f7a4b"
            secureTextEntry={!mostrarSenha}
            value={senha}
            onChangeText={setSenha}
          />
          <Pressable onPress={() => setMostrarSenha((valor) => !valor)}>
            <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={30} color="#2f7a4b" />
          </Pressable>
        </Pressable>

        <Pressable style={styles.campo} onPress={() => confirmarRef.current?.focus()}>
          <Ionicons name="lock-closed" size={32} color="#2f7a4b" style={styles.icone} />
          <TextInput
            ref={confirmarRef}
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor="#2f7a4b"
            secureTextEntry={!mostrarConfirmar}
            value={confirmar}
            onChangeText={setConfirmar}
          />
          <Pressable onPress={() => setMostrarConfirmar((valor) => !valor)}>
            <Ionicons name={mostrarConfirmar ? 'eye-off-outline' : 'eye-outline'} size={30} color="#2f7a4b" />
          </Pressable>
        </Pressable>

        <Pressable style={styles.botao} onPress={() => router.push('/senha')}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Já tem conta?{' '}
            <Link href="/" style={styles.footerLink}>
              entrar
            </Link>
          </Text>
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
  topo: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
  },
  boasVindas: {
    color: '#edf7ef',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  logoTexto: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginLeft: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 14,
  },
  titulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cadastro: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2f7a4b',
  },
  cliente: {
    backgroundColor: '#2f7a4b',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  clienteTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dfeae2',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  icone: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2f7a4b',
    fontWeight: '600',
    paddingVertical: 4,
  },
  botao: {
    backgroundColor: '#2f7a4b',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 10,
  },
  footerText: {
    color: '#2d2d2d',
    fontSize: 14,
    fontWeight: '600',
  },
  footerLink: {
    color: '#2f7a4b',
    fontWeight: '700',
  },
});