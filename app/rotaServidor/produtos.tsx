import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import produtosService, { Produto } from "./produtosService";

export default function ProdutoDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let ativo = true;
    setCarregando(true);
    setErro(null);

    produtosService
      .buscarPorId(id)
      .then((dados) => {
        if (ativo) setProduto(dados);
      })
      .catch((e) => {
        console.log("Erro ao buscar produto:", e);
        if (ativo) setErro("Não foi possível carregar o produto.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (erro || !produto) {
    return (
      <View style={styles.centro}>
        <Text>{erro ?? "Produto não encontrado."}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {produto.imagemUrl ? (
        <Image source={{ uri: produto.imagemUrl }} style={styles.imagem} />
      ) : null}

      <Text style={styles.nome}>{produto.nome}</Text>
      <Text style={styles.preco}>R$ {produto.preco.toFixed(2).replace(".", ",")}</Text>

      {produto.descricao ? (
        <Text style={styles.descricao}>{produto.descricao}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  centro: { flex: 1, justifyContent: "center", alignItems: "center" },
  imagem: { width: "100%", height: 260, borderRadius: 12, marginBottom: 16 },
  nome: { fontSize: 22, fontWeight: "bold" },
  preco: { fontSize: 20, color: "#2e7d32", marginVertical: 8 },
  descricao: { fontSize: 16, color: "#555" },
});