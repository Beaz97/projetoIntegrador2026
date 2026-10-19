
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';

import { useState, useRef } from 'react';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const router = useRouter();

  const [documento, setDocumento] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const documentoRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        {/* LOGO */}
        <View style={styles.topo}>
          <View style={styles.logoIcone}>
            <Ionicons name="cart" size={38} color="#ffffff" />
          </View>

          <Text style={styles.logoTexto}>
            Economize<Text style={styles.ponto}>.</Text>
          </Text>

          <Text style={styles.logoSubtitulo}>
            Seu dinheiro vale mais aqui.
          </Text>
        </View>

        {/* LOGIN */}
        <View style={styles.card}>
          <Text style={styles.titulo}>Bem-vindo!</Text>
          <Text style={styles.subtitulo}>
            Entre na sua conta para continuar.
          </Text>

          <Text style={styles.label}>CPF ou CNPJ</Text>

          <Pressable
            style={styles.campo}
            onPress={() => documentoRef.current?.focus()}
          >
            <Ionicons
              name="person-outline"
              size={21}
              color="#41805a"
            />

            <TextInput
              ref={documentoRef}
              style={styles.input}
              placeholder="Digite seu CPF ou CNPJ"
              placeholderTextColor="#91a397"
              keyboardType="numeric"
              value={documento}
              onChangeText={setDocumento}
              returnKeyType="next"
              onSubmitEditing={() => senhaRef.current?.focus()}
            />
          </Pressable>

          <View style={styles.labelSenha}>
            <Text style={styles.label}>Senha</Text>

            <Pressable
              onPress={() => router.push('/recuperarsenha')}
            >
              <Text style={styles.linkEsqueci}>
                Esqueceu a senha?
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.campo}
            onPress={() => senhaRef.current?.focus()}
          >
            <Ionicons
              name="lock-closed-outline"
              size={21}
              color="#41805a"
            />

            <TextInput
              ref={senhaRef}
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#91a397"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
              returnKeyType="done"
              onSubmitEditing={() => router.replace('/home')}
            />

            <Pressable
              onPress={() => setMostrarSenha(!mostrarSenha)}
              hitSlop={10}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#668171"
              />
            </Pressable>
          </Pressable>

          {/* ENTRAR */}
          <Pressable
            style={({ pressed }) => [
              styles.botaoEntrar,
              pressed && styles.botaoPressionado,
            ]}
            onPress={() => router.replace('/home')}
          >
            <Text style={styles.botaoEntrarTexto}>Entrar</Text>
            <Ionicons
              name="arrow-forward"
              size={21}
              color="#ffffff"
            />
          </Pressable>

          {/* DIVISOR */}
          <View style={styles.divisor}>
            <View style={styles.linha} />
            <Text style={styles.ou}>ou crie sua conta</Text>
            <View style={styles.linha} />
          </View>

          {/* CADASTRO CLIENTE */}
          <Pressable
            style={({ pressed }) => [
              styles.botaoCadastro,
              pressed && styles.botaoPressionadoClaro,
            ]}
            onPress={() => router.push('/cadastrocliente')}
          >
            <View style={styles.iconeCadastro}>
              <Ionicons
                name="person-add-outline"
                size={21}
                color="#286340"
              />
            </View>

            <View style={styles.textosCadastro}>
              <Text style={styles.botaoCadastroTexto}>
                Criar conta de cliente
              </Text>
              <Text style={styles.descricaoCadastro}>
                Encontre ofertas e economize nas compras.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#78927e"
            />
          </Pressable>

          {/* CADASTRO EMPRESA */}
          <Pressable
            style={({ pressed }) => [
              styles.botaoCadastro,
              pressed && styles.botaoPressionadoClaro,
            ]}
            onPress={() => router.push('/cadastroempresa')}
          >
            <View style={styles.iconeCadastro}>
              <Ionicons
                name="storefront-outline"
                size={21}
                color="#286340"
              />
            </View>

            <View style={styles.textosCadastro}>
              <Text style={styles.botaoCadastroTexto}>
                Cadastrar minha empresa
              </Text>
              <Text style={styles.descricaoCadastro}>
                Divulgue seus produtos e ofertas.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#78927e"
            />
          </Pressable>

          {/* RODAPÉ */}
          <View style={styles.rodapeMarca}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#8a9c90"
            />
            <Text style={styles.rodapeMarcaTexto}>
              Economize com praticidade
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flexGrow: 1,
  },
  topo: {
    alignItems: 'center',
    paddingTop: 42,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  logoIcone: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: '#286340',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#286340',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  logoTexto: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1f4d2e',
    letterSpacing: -1,
  },
  ponto: {
    color: '#74b77d',
  },
  logoSubtitulo: {
    fontSize: 13,
    color: '#75877b',
    marginTop: 3,
  },
  card: {
    flex: 1,
    backgroundColor: '#f4f8f4',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 27,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 29,
    fontWeight: '800',
    color: '#1f4d2e',
    letterSpacing: -0.6,
  },
  subtitulo: {
    fontSize: 14,
    color: '#718276',
    marginTop: 6,
    marginBottom: 25,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#315b40',
    marginBottom: 9,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e1eae2',
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 19,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 14,
    color: '#244b31',
    marginLeft: 11,
  },
  labelSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  linkEsqueci: {
    fontSize: 12,
    fontWeight: '700',
    color: '#36764d',
  },
  botaoEntrar: {
    height: 54,
    backgroundColor: '#286340',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 3,
    elevation: 3,
  },
  botaoEntrarTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  botaoPressionado: {
    opacity: 0.82,
  },
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 21,
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: '#dce6dd',
  },
  ou: {
    fontSize: 12,
    color: '#819086',
    marginHorizontal: 12,
  },
  botaoCadastro: {
    minHeight: 69,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dce8de',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 11,
    gap: 11,
  },
  iconeCadastro: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#edf5ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textosCadastro: {
    flex: 1,
  },
  botaoCadastroTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: '#286340',
  },
  descricaoCadastro: {
    fontSize: 10,
    color: '#819086',
    marginTop: 4,
  },
  botaoPressionadoClaro: {
    backgroundColor: '#eaf3eb',
  },
  rodapeMarca: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 13,
  },
  rodapeMarcaTexto: {
    fontSize: 11,
    color: '#8a9c90',
  },
});
