import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Cadastro() {
  const [tipo, setTipo] = useState("empresa");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const alternarTipo = () => {
    setTipo(tipo === "empresa" ? "pessoa" : "empresa");
    setDocumento("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Olá!</Text>
        <Text style={styles.welcomeText}>Seja bem-vindo ao</Text>
        <Text style={styles.logo}>ECONOMiZE</Text>
        <Text style={styles.slogan}>Economize hoje, aproveite amanhã!</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Cadastro</Text>
          <Pressable style={styles.tipoButton} onPress={alternarTipo}>
            <Text style={styles.tipoButtonText}>
              {tipo === "empresa" ? "Empresa" : "Pessoa"}
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#3f5c4c"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#3f5c4c"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder={tipo === "empresa" ? "CNPJ" : "CPF"}
          placeholderTextColor="#3f5c4c"
          value={documento}
          onChangeText={setDocumento}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#3f5c4c"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor="#3f5c4c"
          secureTextEntry
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />

        <Pressable style={styles.botao}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Já possui uma conta?{" "}
            <Link href="/" style={styles.footerLink}>
              faça login
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3d7a52",
  },
  tipoButton: {
    flex: 1,
    backgroundColor: "#3d7a52",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
  },
  tipoButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#c9d9cd",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: "#3d7a52",
    fontWeight: "700",
    marginBottom: 12,
  },
  botao: {
    backgroundColor: "#3d7a52",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  botaoTexto: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 13,
    color: "#222",
    fontWeight: "700",
  },
  footerLink: {
    color: "#3d7a52",
    fontWeight: "700",
  },
});