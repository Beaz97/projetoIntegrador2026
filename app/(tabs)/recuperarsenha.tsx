import { View, Text, TextInput, Pressable, StyleSheet, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  // Quando "enviado" vira true: espera 2 segundos, tira a faixa e muda de página.
  // O return limpa o timer se a pessoa sair da tela antes.
  useEffect(() => {
    if (!enviado) {
      return;
    }

    const id = setTimeout(() => {
      setEnviado(false);
      router.push('/senha');
    }, 2000);

    return () => clearTimeout(id);
  }, [enviado]);

const enviar = () => {
  setEnviado(true);
};

  return (
    <View style={styles.container}>
      {/* Faixa de aviso lá em cima */}
      {enviado && (
        <View style={styles.faixa}>
          <Ionicons name="checkmark-circle" size={28} color="#fff" />
          <Text style={styles.faixaTexto}>Email enviado!</Text>
        </View>
      )}

      {/* Topo verde com o porquinho */}
      <View style={styles.topo}>
      </View>

      {/* Parte branca */}
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Recuperar senha</Text>

        {/* Input de e-mail */}
        <View style={styles.input}>
          <Ionicons name="person" size={32} color="#41805a" />
          <TextInput
            style={styles.inputTexto}
            placeholder="Email"
            placeholderTextColor="#41805a"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Botão enviar */}
        <Pressable
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
             onPress={enviar}>
            <Text style={styles.botaoTexto}>Enviar</Text>
        </Pressable>

        <Text style={styles.aviso}>
          Um código de recuperação de senha será enviado para o seu email cadastrado
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#41805a',
  },

  /* Faixa de aviso no topo */
  faixa: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1f4d2e',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  faixaTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  /* Topo */
  topo: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingRight: 20,
  },


  /* Parte branca (centralizada) */
  conteudo: {
    flex: 1.5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2f7a4b',
    textAlign: 'center',
    marginBottom: 24,
  },

  /* Input */
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 20,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputTexto: {
    flex: 1,
    height: 48,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#41805a',
    marginLeft: 12,
  },

  /* Botão */
  botao: {
    backgroundColor: '#41805a',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  botaoPressionado: {
    opacity: 0.6,
  },
  botaoTexto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  /* Aviso */
  aviso: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f4d2e',
    textAlign: 'center',
    maxWidth: 340,
  },
});