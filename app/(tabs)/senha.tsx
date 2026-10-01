import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useState, useRef } from 'react';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const cpfRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      {/* Topo branco com a logo centralizada */}
      <View style={styles.topo}>
        <Ionicons name="cart" size={56} color="#1f4d2e" />
        <Text style={styles.logoTexto}>Economize</Text>
      </View>

      {/* Cartão verde */}
      <View style={styles.card}>
        <Text style={styles.entrar}>Entrar</Text>
        <Text style={styles.subtitulo}>
          Use seu CPF ou CNPJ para acessar sua conta
        </Text>

        {/* CPF ou CNPJ */}
        <Pressable style={styles.campo} onPress={() => cpfRef.current?.focus()}>
          <Ionicons name="person" size={32} color="#2f7a4b" />
          <TextInput
            ref={cpfRef}
            style={styles.input}
            placeholder="CPF ou CNPJ"
            placeholderTextColor="#2f7a4b"
            keyboardType="numeric"
            value={cpf}
            onChangeText={setCpf}
          />
        </Pressable>

        {/* Senha */}
        <Pressable style={styles.campo} onPress={() => senhaRef.current?.focus()}>
          <Ionicons name="lock-closed" size={32} color="#2f7a4b" />
          <TextInput
            ref={senhaRef}
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#2f7a4b"
            secureTextEntry={!mostrarSenha}
            value={senha}
            onChangeText={setSenha}
          />
          <Pressable onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Ionicons
              name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
              size={30}
              color="#2f7a4b"
            />
          </Pressable>
        </Pressable>

        {/* Login */}
        <Pressable
          style={styles.botaoLogin}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.botaoLoginTexto}>Login</Text>
        </Pressable>

        <Pressable style={styles.esqueci} onPress={() => router.push('/recuperarsenha')}>
          <Text style={styles.esqueciTexto}>Esqueci minha senha</Text>
        </Pressable>

        {/* ou */}
        <View style={styles.ou}>
          <View style={styles.linha} />
          <Text style={styles.ouTexto}>ou</Text>
          <View style={styles.linha} />
        </View>

        {/* Cadastro */}
        <Pressable
          style={styles.botaoCadastro}
          onPress={() => router.push('/cadastroempresa')}
        >
          <Text style={styles.botaoCadastroTexto}>Cadastro</Text>
        </Pressable>

        <Text style={styles.rodape}>
          Ainda não possui uma conta?{' '}
          <Link href="/cadastroempresa" style={styles.link}>
            cadastre-se
          </Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 30,
  },
  logoTexto: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1f4d2e',
  },

  card: {
    flex: 1,
    backgroundColor: '#41805a',
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  entrar: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },

  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 50,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f7a4b',
    marginLeft: 10,
    marginRight: 10,
  },

  botaoLogin: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 30,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoLoginTexto: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  esqueci: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 20,
  },
  esqueciTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  ou: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: '#000',
  },
  ouTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },

  botaoCadastro: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 30,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCadastroTexto: {
    color: '#2f7a4b',
    fontSize: 24,
    fontWeight: 'bold',
  },

  rodape: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  link: {
    color: '#fff',
  },
});