import { useLocalSearchParams, Tabs, useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Dados from "../../../rotaServidor/dadosProdutos";
import asyncStorage from '@react-native-async-storage/async-storage';

const { produtos, categorias } = Dados();

const VERDE = "#3d7f52";
const VERDE_ESCURO = "#2a5a3a";
const VERDE_CLARO = "#dff0e4";

export default function ProdutoDetalhe() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const produto = produtos.find((item) => item.id === id);
  const categoria = categorias.find((item) => item.id === produto?.categoria);

  const addItemCarrinho = async (item) => {
    let listaCarrinho = await asyncStorage.getItem('carrinho');
    if(!listaCarrinho){
      listaCarrinho = [];
    }else{
      listaCarrinho = JSON.parse(listaCarrinho);
      //procurar o produto e adicionar uma quantidade
      const produtoIndex = listaCarrinho.findIndex((p) => p.id === produto.id);
      if (produtoIndex >=0) {
        listaCarrinho[produtoIndex].quantidade += 1;
      } else {
        listaCarrinho.push({ ...produto, quantidade: 1 });
      }
    }
    console.log(listaCarrinho);
    listaCarrinho = JSON.stringify(listaCarrinho);
    await asyncStorage.setItem('carrinho', listaCarrinho);
    router.push('/carrinho');

  }


  if (!produto) {
    return (
      <View style={styles.centro}>
        <Tabs.Screen options={{ title: "Produto não encontrado" }} />
        <Text style={styles.erro}>Produto não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Tabs.Screen options={{ title: produto.nome, headerShown: false }} />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={30} color={VERDE} />
        </Pressable>
        <Text style={styles.headerTitulo}>Produto</Text>
      </View>

      {/* Imagem + informações */}
      <View style={styles.produtoRow}>
        {produto.imagem ? (
          <Image source={{ uri: produto.imagem }} style={styles.imagem} />
        ) : (
          <View style={styles.imagem} />
        )}

        <View style={styles.info}>
          <Text style={styles.nome}>{produto.nome}</Text>
          <Text style={styles.unidade}>{produto.unidade}</Text>
          <Text style={styles.preco}>{produto.preco}</Text>
          {categoria ? (
            <Text style={styles.categoria}>{categoria.nome}</Text>
          ) : null}
        </View>
      </View>

      {/* Oferta da semana */}
      <View style={styles.oferta}>
        <View style={styles.ofertaIcone}>
          <MaterialCommunityIcons name="percent-outline" size={30} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.ofertaTitulo}>Oferta da semana</Text>
          <Text style={styles.ofertaTexto}>Confira onde está mais barato</Text>
        </View>
      </View>

      {/* Onde encontrar mais barato */}
      <View style={styles.secaoTituloRow}>
        <MaterialCommunityIcons name="storefront" size={24} color={VERDE_ESCURO} />
        <Text style={styles.secaoTitulo}>Onde encontrar mais barato?</Text>
      </View>

      <Pressable style={styles.mercado}>
        <View style={styles.mercadoLogo}>
          <Text style={styles.mercadoLogoTexto}>Fort</Text>
          <Text style={styles.mercadoLogoSub}>ATACADISTA</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.mercadoNome}>Fort Atacadista</Text>
          <Text style={styles.mercadoDistancia}>2,3 km</Text>
        </View>
      </Pressable>

      {/* Botão */}
      <Pressable
          style={styles.botao}
          onPress={addItemCarrinho}
      >
        <MaterialCommunityIcons name="cart-outline" size={20} color="#fff" />
        <Text style={styles.botaoTexto}>Adicionar ao carrinho</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 120,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  erro: {
    color: "#444",
    fontSize: 18,
  },

  // Cabeçalho
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  headerTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },

  // Produto
  produtoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  imagem: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nome: {
    color: "#000",
    fontSize: 20,
  },
  unidade: {
    color: "#777",
    fontSize: 18,
    marginTop: 2,
  },
  preco: {
    color: VERDE,
    fontSize: 36,
    marginTop: 6,
  },
  categoria: {
    color: "#777",
    fontSize: 13,
    marginTop: 4,
  },

  // Oferta
  oferta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VERDE_CLARO,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 24,
  },
  ofertaIcone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: VERDE_ESCURO,
    alignItems: "center",
    justifyContent: "center",
  },
  ofertaTitulo: {
    color: VERDE_ESCURO,
    fontSize: 18,
    fontWeight: "bold",
  },
  ofertaTexto: {
    color: "#111",
    fontSize: 15,
  },

  // Seção mercados
  secaoTituloRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },
  secaoTitulo: {
    color: VERDE_ESCURO,
    fontSize: 18,
    fontWeight: "bold",
  },
  mercado: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VERDE_CLARO,
    borderRadius: 14,
    padding: 10,
    gap: 12,
    marginBottom: 20,
  },
  mercadoLogo: {
    width: 105,
    height: 52,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mercadoLogoTexto: {
    color: "#d32027",
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
    lineHeight: 24,
  },
  mercadoLogoSub: {
    color: "#d32027",
    fontSize: 9,
    fontWeight: "bold",
  },
  mercadoNome: {
    color: VERDE_ESCURO,
    fontSize: 16,
    fontWeight: "bold",
  },
  mercadoDistancia: {
    color: VERDE_ESCURO,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },

  // Botão
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: VERDE_ESCURO,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  botaoTexto: {
    color: "#fff",
    fontSize: 15,
  },
});