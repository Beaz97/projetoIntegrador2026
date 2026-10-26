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
import asyncStorage from "@react-native-async-storage/async-storage";
import Dados from "../../../rotaServidor/dadosProdutos";
import { useAutenticacao } from "@/app/components/autenticaTelas";

const { produtos, categorias } = Dados();

const VERDE = "#3d7f52";
const VERDE_ESCURO = "#2a5a3a";
const VERDE_CLARO = "#dff0e4";

export default function ProdutoDetalhe() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const produto = produtos.find((item) => String(item.id) === id);
  const categoria = categorias.find((item) => item.id === produto?.categoria);
  const { carregando, autorizado } = useAutenticacao("cliente");

  if (carregando || !autorizado) {
    return null;
  }

  function formatarPreco(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const addItemCarrinho = async () => {
    if (!produto) return;

    try {
      const listaCarrinho = await asyncStorage.getItem("carrinho");
      const carrinhoArray = listaCarrinho ? JSON.parse(listaCarrinho) : [];

      const produtoIndex = carrinhoArray.findIndex(
        (p: any) => String(p.id) === String(produto.id)
      );

      if (produtoIndex >= 0) {
        carrinhoArray[produtoIndex].quantidade =
          (carrinhoArray[produtoIndex].quantidade || 0) + 1;
      } else {
        carrinhoArray.push({ ...produto, quantidade: 1 });
      }

      await asyncStorage.setItem("carrinho", JSON.stringify(carrinhoArray));
      router.push("/carrinho");
    } catch (erro) {
      console.error("Erro ao adicionar ao carrinho:", erro);
    }
  };

  if (!produto) {
    return (
      <View style={styles.centro}>
        <Tabs.Screen options={{ title: "Produto não encontrado" }} />
        <Text style={styles.erro}>Produto não encontrado.</Text>
      </View>
    );
  }

  const temOferta = produto.oferta === true;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Tabs.Screen options={{ title: produto.nome, headerShown: false }} />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/home")} hitSlop={12}>
          <Ionicons name="chevron-back" size={30} color={VERDE} />
        </Pressable>

        <Text style={styles.headerTitulo}>Produto</Text>

        <View style={styles.headerEspaco} />
      </View>

      {/* Imagem e informações do produto */}
      <View style={styles.produtoCard}>
        {produto.imagem ? (
          <Image
            source={{ uri: produto.imagem }}
            style={styles.imagem}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagemVazia}>
            <MaterialCommunityIcons
              name="shopping-outline"
              size={52}
              color={VERDE}
            />
          </View>
        )}

        <View style={styles.info}>
          {categoria ? (
            <Text style={styles.categoria}>{categoria.nome}</Text>
          ) : null}

          <Text style={styles.nome}>{produto.nome}</Text>

          <Text style={styles.unidade}>{produto.unidade}</Text>

          <Text style={styles.preco}>
            {formatarPreco(produto.preco)}
          </Text>
        </View>
      </View>

      {/* A seção de ofertas só aparece quando o produto é uma oferta */}
      {temOferta && (
        <>
          <View style={styles.oferta}>
            <View style={styles.ofertaIcone}>
              <MaterialCommunityIcons
                name="tag-outline"
                size={28}
                color="#fff"
              />
            </View>

            <View style={styles.ofertaInfo}>
              <Text style={styles.ofertaTitulo}>Oferta da semana</Text>

              <Text style={styles.ofertaTexto}>
                Confira onde encontrar este produto mais barato.
              </Text>
            </View>
          </View>

          <View style={styles.secaoTituloRow}>
            <MaterialCommunityIcons
              name="storefront"
              size={24}
              color={VERDE_ESCURO}
            />

            <Text style={styles.secaoTitulo}>
              Onde encontrar mais barato?
            </Text>
          </View>

          <View style={styles.mercado}>
            <View style={styles.mercadoLogo}>
              <Text style={styles.mercadoLogoTexto}>Fort</Text>
              <Text style={styles.mercadoLogoSub}>ATACADISTA</Text>
            </View>

            <View style={styles.mercadoInfo}>
              <Text style={styles.mercadoNome}>Fort Atacadista</Text>
              <Text style={styles.mercadoDistancia}>2,3 km</Text>
            </View>
          </View>
        </>
      )}

      {/* Botão de adicionar ao carrinho */}
      <Pressable style={styles.botao} onPress={addItemCarrinho}>
        <MaterialCommunityIcons
          name="cart-outline"
          size={21}
          color="#fff"
        />

        <Text style={styles.botaoTexto}>
          Adicionar ao carrinho
        </Text>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },

  headerTitulo: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },

  headerEspaco: {
    width: 30,
  },

  produtoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#edf1ed",
    padding: 12,
    marginBottom: 20,
  },

  imagem: {
    width: "100%",
    height: 190,
    marginBottom: 12,
  },

  imagemVazia: {
    width: "100%",
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#f7faf7",
    borderRadius: 12,
  },

  info: {
    paddingHorizontal: 4,
  },

  categoria: {
    color: VERDE,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 5,
  },

  nome: {
    color: "#000",
    fontSize: 22,
    fontWeight: "bold",
  },

  unidade: {
    color: "#777",
    fontSize: 16,
    marginTop: 4,
  },

  preco: {
    color: VERDE,
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
  },

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

  ofertaInfo: {
    flex: 1,
  },

  ofertaTitulo: {
    color: VERDE_ESCURO,
    fontSize: 18,
    fontWeight: "bold",
  },

  ofertaTexto: {
    color: "#111",
    fontSize: 14,
    marginTop: 4,
  },

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

  mercadoInfo: {
    flex: 1,
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

  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: VERDE_ESCURO,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 4,
  },

  botaoTexto: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});