
import {
  useLocalSearchParams,
  Tabs,
  useRouter,
} from "expo-router";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useEffect, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Dados from "../../../rotaServidor/dadosProdutos";
import { useAutenticacao } from "@/app/components/autenticaTelas";

const { produtos: produtosIniciais, categorias } = Dados();

const VERDE = "#3d7f52";
const VERDE_ESCURO = "#2a5a3a";
const VERDE_CLARO = "#dff0e4";

export default function ProdutoDetalhe() {
  const router = useRouter();

  const { id, origem } = useLocalSearchParams<{
    id: string;
    origem?: string;
  }>();

  const idProduto = Array.isArray(id) ? id[0] : id;
  const origemAtual = Array.isArray(origem) ? origem[0] : origem;
  const modoEmpresa = origemAtual === "empresa";

  const {
    carregando,
    autorizado,
  } = useAutenticacao(modoEmpresa ? "empresa" : "cliente");

  const [produto, setProduto] = useState<any>(
    produtosIniciais.find(
      (item: any) => String(item.id) === String(idProduto)
    ) ?? null
  );

  const [carregandoProduto, setCarregandoProduto] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarProduto() {
      setCarregandoProduto(true);

      try {
        const produtosSalvos = await AsyncStorage.getItem("produtos");
        const listaSalva = produtosSalvos
          ? JSON.parse(produtosSalvos)
          : [];

        const produtoSalvo = Array.isArray(listaSalva)
          ? listaSalva.find(
              (item: any) => String(item.id) === String(idProduto)
            )
          : null;

        const produtoInicial = produtosIniciais.find(
          (item: any) => String(item.id) === String(idProduto)
        );

        if (ativo) {
          setProduto(produtoSalvo ?? produtoInicial ?? null);
        }
      } catch (erro) {
        console.error("Erro ao carregar produto:", erro);

        const produtoInicial = produtosIniciais.find(
          (item: any) => String(item.id) === String(idProduto)
        );

        if (ativo) {
          setProduto(produtoInicial ?? null);
        }
      } finally {
        if (ativo) {
          setCarregandoProduto(false);
        }
      }
    }

    carregarProduto();

    return () => {
      ativo = false;
    };
  }, [idProduto]);

  function formatarPreco(valor: number) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const voltar = () => {
    if (modoEmpresa) {
      router.replace("/produtoempresa" as any);
    } else {
      router.replace("/home" as any);
    }
  };

  const addItemCarrinho = async () => {
    if (!produto || modoEmpresa) return;

    try {
      const listaCarrinho = await AsyncStorage.getItem("carrinho");
      const carrinhoArray = listaCarrinho
        ? JSON.parse(listaCarrinho)
        : [];

      const produtoIndex = carrinhoArray.findIndex(
        (item: any) => String(item.id) === String(produto.id)
      );

      if (produtoIndex >= 0) {
        carrinhoArray[produtoIndex].quantidade =
          (carrinhoArray[produtoIndex].quantidade || 0) + 1;
      } else {
        carrinhoArray.push({
          ...produto,
          quantidade: 1,
        });
      }

      await AsyncStorage.setItem(
        "carrinho",
        JSON.stringify(carrinhoArray)
      );

      router.push("/carrinho" as any);
    } catch (erro) {
      console.error("Erro ao adicionar ao carrinho:", erro);
    }
  };

  const categoria = categorias.find(
    (item: any) =>
      String(item.id) === String(produto?.categoria)
  );

  if (carregando || !autorizado) {
    return null;
  }

  if (carregandoProduto) {
    return (
      <View style={styles.centro}>
        <Text style={styles.textoCarregando}>
          Carregando produto...
        </Text>
      </View>
    );
  }

  if (!produto) {
    return (
      <View style={styles.centro}>
        <Tabs.Screen
          options={{
            title: "Produto não encontrado",
            headerShown: false,
          }}
        />

        <MaterialCommunityIcons
          name="package-variant"
          size={52}
          color={VERDE}
        />

        <Text style={styles.erro}>
          Produto não encontrado.
        </Text>

        <Pressable
          style={styles.botaoVoltar}
          onPress={voltar}
        >
          <Text style={styles.botaoVoltarTexto}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  const temOferta = produto.oferta === true;

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Tabs.Screen
        options={{
          title: produto.nome,
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <Pressable
          onPress={voltar}
          hitSlop={12}
          style={styles.botaoVoltarHeader}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={VERDE}
          />
        </Pressable>

        <Text style={styles.headerTitulo}>
          {modoEmpresa ? "Meu produto" : "Produto"}
        </Text>

        <View style={styles.headerEspaco} />
      </View>

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
            <Text style={styles.categoria}>
              {categoria.nome}
            </Text>
          ) : null}

          <Text style={styles.nome}>
            {produto.nome}
          </Text>

          {produto.unidade ? (
            <Text style={styles.unidade}>
              {produto.unidade}
            </Text>
          ) : null}

          <Text style={styles.preco}>
            {formatarPreco(produto.preco)}
          </Text>

          {temOferta && (
            <View style={styles.etiquetaOferta}>
              <MaterialCommunityIcons
                name="tag-outline"
                size={15}
                color={VERDE_ESCURO}
              />

              <Text style={styles.etiquetaOfertaTexto}>
                Em oferta
              </Text>
            </View>
          )}
        </View>
      </View>

      {temOferta && (
        <View style={styles.ofertaCard}>
          <View style={styles.ofertaIcone}>
            <MaterialCommunityIcons
              name="sale"
              size={25}
              color={VERDE}
            />
          </View>

          <View style={styles.ofertaInfo}>
            <Text style={styles.ofertaTitulo}>
              Oferta da semana
            </Text>

            <Text style={styles.ofertaDescricao}>
              Aproveite o preço especial deste produto.
            </Text>
          </View>
        </View>
      )}

      {!modoEmpresa && (
        <Pressable
          style={styles.botao}
          onPress={addItemCarrinho}
        >
          <MaterialCommunityIcons
            name="cart-outline"
            size={22}
            color="#fff"
          />

          <Text style={styles.botaoTexto}>
            Adicionar ao carrinho
          </Text>
        </Pressable>
      )}

      {modoEmpresa && (
        <View style={styles.avisoEmpresa}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={21}
            color={VERDE}
          />

          <Text style={styles.avisoEmpresaTexto}>
            Você está visualizando este produto na área da empresa.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#f7f9f7",
  },

  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 35,
  },

  centro: {
    flex: 1,
    backgroundColor: "#f7f9f7",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  textoCarregando: {
    color: "#555",
    fontSize: 15,
  },

  erro: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 14,
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  botaoVoltarHeader: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#eaf3ec",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  headerEspaco: {
    width: 42,
  },

  produtoCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e8eee9",
    marginBottom: 18,
  },

  imagem: {
    width: "100%",
    height: 220,
    marginBottom: 15,
  },

  imagemVazia: {
    height: 220,
    borderRadius: 16,
    backgroundColor: "#edf5ef",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  info: {
    alignItems: "flex-start",
  },

  categoria: {
    color: VERDE,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
    textTransform: "uppercase",
  },

  nome: {
    color: "#202820",
    fontSize: 23,
    fontWeight: "700",
    marginBottom: 6,
  },

  unidade: {
    color: "#777",
    fontSize: 14,
    marginBottom: 12,
  },

  preco: {
    color: VERDE_ESCURO,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 4,
  },

  etiquetaOferta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: VERDE_CLARO,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 12,
  },

  etiquetaOfertaTexto: {
    color: VERDE_ESCURO,
    fontSize: 12,
    fontWeight: "700",
  },

  ofertaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e8eee9",
    marginBottom: 20,
    gap: 12,
  },

  ofertaIcone: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#eaf3ec",
    alignItems: "center",
    justifyContent: "center",
  },

  ofertaInfo: {
    flex: 1,
  },

  ofertaTitulo: {
    color: "#263328",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  ofertaDescricao: {
    color: "#777",
    fontSize: 13,
    lineHeight: 18,
  },

  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: VERDE,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginTop: 5,
  },

  botaoTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  avisoEmpresa: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#eaf3ec",
    padding: 15,
    borderRadius: 14,
    marginTop: 5,
  },

  avisoEmpresaTexto: {
    flex: 1,
    color: VERDE_ESCURO,
    fontSize: 13,
    lineHeight: 19,
  },

  botaoVoltar: {
    marginTop: 20,
    backgroundColor: VERDE,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },

  botaoVoltarTexto: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
