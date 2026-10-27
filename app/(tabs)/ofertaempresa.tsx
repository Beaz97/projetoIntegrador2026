
import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  StatusBar,
  Image,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Dados from "../rotaServidor/dadosProdutos";
import { useAutenticacao } from "@/app/components/autenticaTelas";

const VERDE = "#3D8054";
const ESCURO = "#245D39";
const FUNDO = "#F7F9F7";

const dadosIniciais = Dados();

export default function OfertasEmpresa() {
  const router = useRouter();
  const { usuario } = useAutenticacao("empresa");

  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarOfertas() {
        setCarregandoProdutos(true);

        try {
          const produtosSalvos = await AsyncStorage.getItem("produtos");
          const listaSalva = produtosSalvos
            ? JSON.parse(produtosSalvos)
            : [];

          const salvos = Array.isArray(listaSalva) ? listaSalva : [];
          const iniciais = dadosIniciais.produtos || [];

          const todosProdutos = [...iniciais];

          salvos.forEach((produto: any) => {
            const indice = todosProdutos.findIndex(
              (item: any) => String(item.id) === String(produto.id)
            );

            if (indice >= 0) {
              todosProdutos[indice] = {
                ...todosProdutos[indice],
                ...produto,
              };
            } else {
              todosProdutos.push(produto);
            }
          });

          const produtosDaEmpresa = todosProdutos.filter(
            (produto: any) =>
              String(produto.empresa) === String(usuario?.id)
          );

          if (ativo) {
            setProdutos(produtosDaEmpresa);
          }
        } catch (erro) {
          console.error("Erro ao carregar ofertas:", erro);

          if (ativo) {
            setProdutos([]);
          }
        } finally {
          if (ativo) {
            setCarregandoProdutos(false);
          }
        }
      }

      carregarOfertas();

      return () => {
        ativo = false;
      };
    }, [usuario?.id])
  );

  const ofertas = produtos.filter(
    (produto) => produto.oferta === true
  );

  const lista = ofertas.filter((produto) =>
    String(produto.nome || "")
      .toLowerCase()
      .includes(busca.trim().toLowerCase())
  );

  function formatarPreco(valor: number) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function abrirProduto(id: string | number) {
    router.push(
      `/rotas/produtos/${id}?origem=empresa` as any
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={ESCURO} />

      <View style={styles.cabecalho}>
        <View style={styles.topo}>
          <Pressable
            style={styles.botaoVoltar}
            onPress={() => router.replace("/homeempresa" as any)}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.titulos}>
            <Text style={styles.titulo}>Minhas ofertas</Text>
            <Text style={styles.subtitulo}>
              Seus produtos em promoção
            </Text>
          </View>

          <View style={styles.iconeCabecalho}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={25}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.resumo}>
          <View style={styles.resumoIcone}>
            <MaterialCommunityIcons
              name="sale"
              size={27}
              color={VERDE}
            />
          </View>

          <View style={styles.resumoTexto}>
            <Text style={styles.resumoNumero}>
              {ofertas.length}
            </Text>
            <Text style={styles.resumoDescricao}>
              {ofertas.length === 1
                ? "produto em oferta"
                : "produtos em oferta"}
            </Text>
          </View>

          <View style={styles.resumoSelo}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={VERDE}
            />
            <Text style={styles.resumoSeloTexto}>Ativas</Text>
          </View>
        </View>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.pesquisa}>
          <Ionicons
            name="search-outline"
            size={21}
            color="#849087"
          />

          <TextInput
            style={styles.input}
            placeholder="Buscar nas minhas ofertas"
            placeholderTextColor="#929C94"
            value={busca}
            onChangeText={setBusca}
            selectionColor={VERDE}
            underlineColorAndroid="transparent"
            autoCorrect={false}
          />

          {busca.length > 0 && (
            <Pressable
              onPress={() => setBusca("")}
              hitSlop={10}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#849087"
              />
            </Pressable>
          )}
        </View>

        <View style={styles.linhaTitulo}>
          <View>
            <Text style={styles.tituloLista}>
              Ofertas cadastradas
            </Text>
            <Text style={styles.subtituloLista}>
              Gerencie os produtos em promoção
            </Text>
          </View>

          <Pressable
            style={styles.botaoAdicionar}
            onPress={() => router.push("/rotas/ofertas/criar" as any)}
          >
            <Ionicons
              name="add"
              size={25}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.listaScroll}
          contentContainerStyle={styles.listaConteudo}
          showsVerticalScrollIndicator={false}
        >
          {carregandoProdutos ? (
            <View style={styles.estadoVazio}>
              <MaterialCommunityIcons
                name="loading"
                size={35}
                color={VERDE}
              />
              <Text style={styles.estadoTitulo}>
                Carregando ofertas...
              </Text>
            </View>
          ) : lista.length > 0 ? (
            lista.map((produto) => (
              <Pressable
                key={String(produto.id)}
                style={styles.card}
                onPress={() => abrirProduto(produto.id)}
              >
                <View style={styles.imagemContainer}>
                  {produto.imagem ? (
                    <Image
                      source={{ uri: produto.imagem }}
                      style={styles.imagemProduto}
                      resizeMode="contain"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="basket-outline"
                      size={31}
                      color={VERDE}
                    />
                  )}
                </View>

                <View style={styles.informacao}>
                  <View style={styles.linhaStatus}>
                    <View style={styles.status}>
                      <View style={styles.pontoStatus} />
                      <Text style={styles.statusTexto}>
                        Em oferta
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.nomeProduto}
                    numberOfLines={2}
                  >
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
                </View>

                <View style={styles.seta}>
                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#8A968C"
                  />
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.estadoVazio}>
              <View style={styles.vazioIcone}>
                <MaterialCommunityIcons
                  name="tag-outline"
                  size={39}
                  color={VERDE}
                />
              </View>

              <Text style={styles.estadoTitulo}>
                {busca
                  ? "Nenhuma oferta encontrada"
                  : "Você ainda não tem ofertas"}
              </Text>

              <Text style={styles.estadoDescricao}>
                {busca
                  ? "Tente buscar por outro nome de produto."
                  : "Cadastre uma oferta para destacar seus produtos aqui."}
              </Text>

              {!busca && (
                <Pressable
                  style={styles.botaoCriar}
                  onPress={() =>
                    router.push("/rotas/ofertas/criar" as any)
                  }
                >
                  <Ionicons
                    name="add"
                    size={19}
                    color="#FFFFFF"
                  />
                  <Text style={styles.botaoCriarTexto}>
                    Criar oferta
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.navegacao}>
        <Pressable
          style={styles.itemNav}
          onPress={() => router.replace("/homeempresa" as any)}
        >
          <Ionicons
            name="home-outline"
            size={22}
            color="#D9E9DD"
          />
          <Text style={styles.textoNav}>Início</Text>
        </Pressable>

        <Pressable
          style={styles.itemNav}
          onPress={() => router.push("/produtosempresa" as any)}
        >
          <Ionicons
            name="cube-outline"
            size={22}
            color="#D9E9DD"
          />
          <Text style={styles.textoNav}>Produtos</Text>
        </Pressable>

        <View style={styles.itemNav}>
          <View style={styles.iconeNavAtivo}>
            <Ionicons
              name="pricetag"
              size={21}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.textoAtivo}>Ofertas</Text>
        </View>

        <Pressable
          style={styles.itemNav}
          onPress={() => router.push("/perfil" as any)}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color="#D9E9DD"
          />
          <Text style={styles.textoNav}>Perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },

  cabecalho: {
    backgroundColor: ESCURO,
    paddingTop: 55,
    paddingHorizontal: 22,
    paddingBottom: 23,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },

  titulos: {
    flex: 1,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  subtitulo: {
    fontSize: 13,
    color: "#D9E9DD",
    marginTop: 5,
  },

  iconeCabecalho: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  resumo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    marginTop: 24,
    gap: 12,
  },

  resumoIcone: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
  },

  resumoTexto: {
    flex: 1,
  },

  resumoNumero: {
    color: ESCURO,
    fontSize: 23,
    fontWeight: "800",
  },

  resumoDescricao: {
    color: "#7A857C",
    fontSize: 12,
    marginTop: 1,
  },

  resumoSelo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EAF4EC",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  resumoSeloTexto: {
    color: VERDE,
    fontSize: 11,
    fontWeight: "700",
  },

  conteudo: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  pesquisa: {
    minHeight: 51,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EBE6",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 23,
  },

  input: {
    flex: 1,
    color: ESCURO,
    fontSize: 14,
    paddingVertical: 12,
    outlineStyle: "none" as any,
  },

  linhaTitulo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  tituloLista: {
    fontSize: 19,
    fontWeight: "800",
    color: "#263F2D",
  },

  subtituloLista: {
    fontSize: 12,
    color: "#89938B",
    marginTop: 4,
  },

  botaoAdicionar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: VERDE,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  listaScroll: {
    flex: 1,
  },

  listaConteudo: {
    paddingBottom: 20,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E8EDE8",
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },

  imagemContainer: {
    width: 76,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#EDF5EF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  imagemProduto: {
    width: "90%",
    height: "90%",
  },

  informacao: {
    flex: 1,
    paddingVertical: 3,
  },

  linhaStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF4EC",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  pontoStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: VERDE,
  },

  statusTexto: {
    color: VERDE,
    fontSize: 10,
    fontWeight: "700",
  },

  nomeProduto: {
    color: "#294531",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },

  unidade: {
    color: "#929B94",
    fontSize: 11,
    marginTop: 3,
  },

  preco: {
    color: VERDE,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 6,
  },

  seta: {
    width: 25,
    alignItems: "center",
  },

  estadoVazio: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingTop: 45,
    paddingBottom: 35,
  },

  vazioIcone: {
    width: 78,
    height: 78,
    borderRadius: 25,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  estadoTitulo: {
    color: "#294531",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },

  estadoDescricao: {
    color: "#849087",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  botaoCriar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: VERDE,
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 20,
  },

  botaoCriarTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  navegacao: {
    height: 74,
    backgroundColor: ESCURO,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 4,
  },

  itemNav: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  textoNav: {
    fontSize: 10,
    color: "#D9E9DD",
  },

  iconeNavAtivo: {
    width: 35,
    height: 29,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  textoAtivo: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
