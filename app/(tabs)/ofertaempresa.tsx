import React, { useCallback, useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  StatusBar,
  Image,
  Modal,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Dados from "../rotaServidor/dadosProdutos";
import { useAutenticacao } from "@/app/components/autenticaTelas";

const VERDE = "#3D8054";
const ESCURO = "#245D39";
const FUNDO = "#F7F9F7";
const CHAVE_PRODUTOS = "produtos";

const dadosIniciais = Dados();

export default function OfertasEmpresa() {
  const router = useRouter();
  const { usuario } = useAutenticacao("empresa");

  const [busca, setBusca] = useState("");
  const [todos, setTodos] = useState<any[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [ofertaParaExcluir, setOfertaParaExcluir] = useState<any | null>(null);
  const [erroExclusao, setErroExclusao] = useState("");

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarOfertas() {
        setCarregandoProdutos(true);

        try {
          const conteudo = await AsyncStorage.getItem(CHAVE_PRODUTOS);

          let lista: any[] = dadosIniciais.produtos || [];

          if (conteudo) {
            const parseado = JSON.parse(conteudo);

            if (Array.isArray(parseado)) {
              lista = parseado;
            }
          }

          if (ativo) {
            setTodos(lista);
          }
        } catch (erro) {
          console.error("Erro ao carregar ofertas:", erro);

          if (ativo) {
            setTodos(dadosIniciais.produtos || []);
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
    }, [])
  );

  const produtos = useMemo(
    () =>
      todos.filter(
        (produto: any) =>
          String(produto.empresa) === String(usuario?.id)
      ),
    [todos, usuario?.id]
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

  function pedirExclusao(oferta: any) {
    setErroExclusao("");
    setOfertaParaExcluir(oferta);
  }

  function cancelarExclusao() {
    setErroExclusao("");
    setOfertaParaExcluir(null);
  }

  // Encerrar a oferta NÃO apaga o produto: só volta ao preço normal.
  async function confirmarExclusao() {
    if (!ofertaParaExcluir) {
      return;
    }

    try {
      const listaAtualizada = todos.map((item: any) => {
        if (String(item.id) !== String(ofertaParaExcluir.id)) {
          return item;
        }

        const { precoOferta, ...resto } = item;

        return { ...resto, oferta: false };
      });

      await AsyncStorage.setItem(
        CHAVE_PRODUTOS,
        JSON.stringify(listaAtualizada)
      );

      setTodos(listaAtualizada);
      setErroExclusao("");
      setOfertaParaExcluir(null);
    } catch (erro) {
      console.error("Erro ao encerrar oferta:", erro);
      setErroExclusao(
        "Não foi possível encerrar a oferta. Tente novamente."
      );
    }
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
            onPress={() => router.push("/novaoferta" as any)}
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
              <View
                key={String(produto.id)}
                style={styles.card}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.conteudoCard,
                    pressed && styles.cardPressionado,
                  ]}
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

                    {typeof produto.precoOferta === "number" ? (
                      <View style={styles.linhaPrecos}>
                        <Text style={styles.precoRiscado}>
                          {formatarPreco(produto.preco)}
                        </Text>
                        <Text style={styles.preco}>
                          {formatarPreco(produto.precoOferta)}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.preco}>
                        {formatarPreco(produto.preco)}
                      </Text>
                    )}
                  </View>

                  <View style={styles.seta}>
                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color="#8A968C"
                    />
                  </View>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.botaoExcluir,
                    pressed && styles.botaoExcluirPressionado,
                  ]}
                  onPress={() => pedirExclusao(produto)}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Encerrar oferta de ${produto.nome}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#B42318"
                  />
                </Pressable>
              </View>
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
                  : "Escolha um produto seu e defina o preço da oferta."}
              </Text>

              {!busca && (
                <Pressable
                  style={styles.botaoCriar}
                  onPress={() =>
                    router.push("/novaoferta" as any)
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

      <Modal
        visible={ofertaParaExcluir !== null}
        transparent
        animationType="fade"
        onRequestClose={cancelarExclusao}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <View style={styles.modalIcone}>
              <Ionicons
                name="trash-outline"
                size={28}
                color="#B42318"
              />
            </View>

            <Text style={styles.modalTitulo}>Encerrar oferta</Text>

            <Text style={styles.modalTexto}>
              Deseja encerrar a oferta de "{ofertaParaExcluir?.nome}"? O
              produto continua no catálogo com o preço normal.
            </Text>

            {erroExclusao !== "" && (
              <Text style={styles.modalErro}>{erroExclusao}</Text>
            )}

            <View style={styles.modalBotoes}>
              <Pressable
                style={styles.modalCancelar}
                onPress={cancelarExclusao}
              >
                <Text style={styles.modalCancelarTexto}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={styles.modalExcluir}
                onPress={confirmarExclusao}
              >
                <Text style={styles.modalExcluirTexto}>
                  Encerrar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 10,
  },

  conteudoCard: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardPressionado: {
    opacity: 0.78,
  },

  botaoExcluir: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF1F0",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoExcluirPressionado: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
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
    minWidth: 0,
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

  linhaPrecos: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },

  precoRiscado: {
    fontSize: 13,
    color: "#8A938C",
    textDecorationLine: "line-through",
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

  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  modalCaixa: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
  },

  modalIcone: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#FFF1F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  modalTitulo: {
    fontSize: 19,
    fontWeight: "800",
    color: "#294531",
  },

  modalTexto: {
    fontSize: 13,
    lineHeight: 20,
    color: "#68736B",
    textAlign: "center",
    marginTop: 8,
  },

  modalErro: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B3261E",
    textAlign: "center",
    marginTop: 10,
  },

  modalBotoes: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },

  modalCancelar: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: "#EEF2EF",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCancelarTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: "#294531",
  },

  modalExcluir: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: "#B42318",
    alignItems: "center",
    justifyContent: "center",
  },

  modalExcluirTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});