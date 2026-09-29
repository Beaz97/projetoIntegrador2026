import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Olá!</Text>
        <Text style={styles.welcomeText}>Seja bem-vindo ao</Text>
        <Text style={styles.logo}>ECONOMiZE</Text>
        <Text style={styles.slogan}>Economize hoje, aproveite amanhã!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Recuperar senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#3f5c4c"
          value={email}
          onChangeText={setEmail}
        />

        <Pressable
          style={styles.botao}
          onPress={() => router.back()} // aqui depois entra o envio do código
        >
          <Text style={styles.botaoTexto}>Enviar</Text>
        </Pressable>

        <Text style={styles.aviso}>
          Um código de recuperação de senha será enviado para o seu email
          cadastrado
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3d7a52",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
  },
  welcomeText: {
    color: "#eaf7ee",
    fontSize: 18,
    fontWeight: "600",
  },
  logo: {
    color: "#a3e6b0",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 10,
  },
  slogan: {
    color: "#eaf7ee",
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: "#ececec",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3d7a52",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#c9d9cd",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: "#3d7a52",
    fontWeight: "700",
    marginBottom: 16,
  },
  botao: {
    backgroundColor: "#3d7a52",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  botaoTexto: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  aviso: {
    fontSize: 13,
    color: "#222",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 20,
  },
});