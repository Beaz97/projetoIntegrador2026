
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CadastroCliente() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  function abrirLogin() {
    router.replace("/login");
  }

  function formatarCPF(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    return numeros
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  function cadastrar() {
    if (
      !nome.trim() ||
      !email.trim() ||
      !cpf.trim() ||
      !senha ||
      !confirmarSenha
    ) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("E-mail inválido", "Digite um endereço de e-mail válido.");
      return;
    }

    if (cpf.replace(/\D/g, "").length !== 11) {
      Alert.alert("CPF inválido", "Digite os 11 números do CPF.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert(
        "Senha muito curta",
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }

    Alert.alert(
      "Cadastro concluído!",
      "Seus dados foram validados com sucesso.",
      [
        {
          text: "Continuar",
          onPress: () => router.replace("/home"),
        },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={styles.voltar}
        onPress={abrirLogin}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Voltar para o login"
      >
        <Ionicons name="arrow-back" size={24} color="#1F4D2E" />
      </Pressable>

      <View style={styles.logo}>
        <View style={styles.logoIcone}>
          <Ionicons name="leaf" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.logoTexto}>Economize</Text>
      </View>

      <Text style={styles.titulo}>Crie sua conta</Text>
      <Text style={styles.subtitulo}>
        Encontre os melhores preços e economize nas suas compras.
      </Text>

      <View style={styles.formulario}>
        <Text style={styles.label}>Nome completo</Text>
        <View style={styles.campo}>
          <Ionicons name="person-outline" size={20} color="#66816B" />
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor="#9AA79C"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <Text style={styles.label}>E-mail</Text>
        <View style={styles.campo}>
          <Ionicons name="mail-outline" size={20} color="#66816B" />
          <TextInput
            style={styles.input}
            placeholder="seuemail@email.com"
            placeholderTextColor="#9AA79C"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <Text style={styles.label}>CPF</Text>
        <View style={styles.campo}>
          <Ionicons name="card-outline" size={20} color="#66816B" />
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor="#9AA79C"
            value={cpf}
            onChangeText={(valor) => setCpf(formatarCPF(valor))}
            keyboardType="numeric"
            maxLength={14}
            returnKeyType="next"
          />
        </View>

        <Text style={styles.label}>Senha</Text>
        <View style={styles.campo}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#66816B"
          />
          <TextInput
            style={styles.input}
            placeholder="Crie uma senha"
            placeholderTextColor="#9AA79C"
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
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={21}
              color="#66816B"
            />
          </Pressable>
        </View>

        <Text style={styles.label}>Confirmar senha</Text>
        <View style={styles.campo}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#66816B"
          />
          <TextInput
            style={styles.input}
            placeholder="Digite a senha novamente"
            placeholderTextColor="#9AA79C"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={!mostrarConfirmarSenha}
            autoCapitalize="none"
            returnKeyType="done"
          />
          <Pressable
            onPress={() =>
              setMostrarConfirmarSenha(!mostrarConfirmarSenha)
            }
            hitSlop={10}
          >
            <Ionicons
              name={
                mostrarConfirmarSenha
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={21}
              color="#66816B"
            />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botao,
            pressed && styles.botaoPressionado,
          ]}
          onPress={cadastrar}
          accessibilityRole="button"
        >
          <Text style={styles.botaoTexto}>Criar minha conta</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.rodape}>
        <Text style={styles.rodapeTexto}>Já tem uma conta? </Text>
        <Pressable onPress={abrirLogin} hitSlop={10}>
          <Text style={styles.link}>Faça login</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#F7FAF6",
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 48,
    paddingBottom: 35,
  },
  voltar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E8F1E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    alignItems: "center",
    marginBottom: 26,
  },
  logoIcone: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#1F4D2E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoTexto: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1F4D2E",
  },
  titulo: {
    fontSize: 29,
    fontWeight: "800",
    color: "#1D3824",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: "#748276",
    lineHeight: 21,
    marginBottom: 25,
  },
  formulario: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#294632",
    marginTop: 5,
  },
  campo: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#DFE8DD",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#263C2B",
    minHeight: 52,
    paddingVertical: 0,
  },
  botao: {
    minHeight: 56,
    backgroundColor: "#1F4D2E",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    elevation: 3,
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  rodape: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  rodapeTexto: {
    color: "#748276",
    fontSize: 14,
  },
  link: {
    color: "#1F4D2E",
    fontWeight: "800",
    fontSize: 14,
  },
});
