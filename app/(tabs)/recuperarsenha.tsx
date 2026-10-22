
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = () => {
    const emailDigitado = email.trim().toLowerCase();

    // Verifica se o campo está vazio
    if (!emailDigitado) {
      Alert.alert(
        'Atenção',
        'Digite seu e-mail para continuar.'
      );
      return;
    }

    // Valida o formato do e-mail
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(emailDigitado)) {
      Alert.alert(
        'E-mail inválido',
        'Digite um endereço de e-mail válido.'
      );
      return;
    }

    // Simulação temporária da recuperação de senha
    setEnviando(true);

    Alert.alert(
      'Solicitação recebida!',
      'Se o e-mail informado estiver cadastrado, você poderá receber instruções para recuperar sua senha. O envio real ainda não está configurado.',
      [
        {
          text: 'OK',
          onPress: () => {
            setEnviando(false);
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Topo verde */}
      <View style={styles.topo}>
        <Ionicons
          name="lock-closed"
          size={76}
          color="#ffffff"
          style={styles.iconeTopo}
        />

        <Text style={styles.subtituloTopo}>
          Recuperação de acesso
        </Text>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>
          Recuperar senha
        </Text>

        <Text style={styles.descricao}>
          Informe o e-mail cadastrado para receber
          as instruções de recuperação da sua senha.
        </Text>

        {/* Campo de e-mail */}
        <View style={styles.input}>
          <Ionicons
            name="mail-outline"
            size={27}
            color="#41805a"
          />

          <TextInput
            style={styles.inputTexto}
            placeholder="E-mail"
            placeholderTextColor="#41805a"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!enviando}
            returnKeyType="send"
            onSubmitEditing={enviar}
          />
        </View>

        {/* Botão de enviar */}
        <Pressable
          style={({ pressed }) => [
            styles.botao,
            pressed && styles.botaoPressionado,
            enviando && styles.botaoDesabilitado,
          ]}
          onPress={enviar}
          disabled={enviando}
        >
          <Ionicons
            name="send"
            size={20}
            color="#fff"
            style={styles.iconeBotao}
          />

          <Text style={styles.botaoTexto}>
            Enviar
          </Text>
        </Pressable>

        <Text style={styles.aviso}>
          Por enquanto, esta tela apenas simula a
          solicitação de recuperação de senha.
        </Text>

        {/* Botão voltar */}
        <Pressable
          style={styles.voltar}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={19}
            color="#41805a"
          />
          <Text style={styles.voltarTexto}>
            Voltar
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#41805a',
  },

  topo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 1,
  },

  iconeTopo: {
    marginBottom: 1,
  },

  subtituloTopo: {
    fontSize: 19,
    fontWeight: '600',
    color: '#fff',
  },

  conteudo: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2f7a4b',
    textAlign: 'center',
    marginBottom: 14,
  },

  descricao: {
    fontSize: 15,
    color: '#45634d',
    textAlign: 'center',
    marginBottom: 25,
    maxWidth: 340,
    lineHeight: 22,
  },

  input: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 20,
    height: 52,
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  inputTexto: {
    flex: 1,
    height: 50,
    fontSize: 17,
    fontWeight: '600',
    color: '#41805a',
    marginLeft: 12,
  },

  botao: {
    flexDirection: 'row',
    backgroundColor: '#41805a',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  botaoPressionado: {
    opacity: 0.65,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  iconeBotao: {
    marginRight: 9,
  },

  botaoTexto: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#fff',
  },

  aviso: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f4d2e',
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 21,
  },

  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 25,
    padding: 8,
  },

  voltarTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#41805a',
  },
});