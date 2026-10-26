
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAutenticacao } from "../components/autenticaTelas";

const CHAVE_USUARIOS = "@banco_usuarios";
const CHAVE_USUARIO_LOGADO = "@usuario_logado";
const CHAVE_CARRINHO = "carrinho";

type Produto = {
  id: string | number;
  nome: string;
  descricao?: string;
  imagem?: string;
  preco: number | string;
  quantidade?: number;
  [chave: string]: any;
};

type Usuario = {
  id?: string | number;
  nome?: string;
  email?: string;
  historicoCompras?: any[];
  [chave: string]: any;
};

export default function Pagamento() {
  const tipoEntrega = "Grátis";
  const { usuario, carregando, autorizado } = useAutenticacao("cliente");
  const router = useRouter();

  const [stateUm, setStateUm] = useState("Entrega");
  const [stateDois, setStateDois] = useState("Pix");
  const [valorTotal, setValorTotal] = useState(0);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [confirmado, setConfirmado] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const atualizar = useCallback(async () => {
    try {
      const lista = await AsyncStorage.getItem(CHAVE_CARRINHO);

      if (lista) {
        const prod = JSON.parse(lista);

        if (Array.isArray(prod)) {
          setProdutos(prod);

          const total = prod.reduce(
            (soma: number, produto: Produto) =>
              soma +
              (Number(produto.preco) || 0) *
                (Number(produto.quantidade) || 1),
            0
          );

          setValorTotal(total);
        } else {
          setProdutos([]);
          setValorTotal(0);
        }
      } else {
        setProdutos([]);
        setValorTotal(0);
      }
    } catch (erro) {
      console.log("Erro ao carregar o carrinho:", erro);
      Alert.alert("Erro", "Não foi possível carregar o carrinho.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setConfirmado(false);
      setFinalizando(false);
      setStateUm("Entrega");
      setStateDois("Pix");
      atualizar();
    }, [atualizar])
  );

  function formatarPreco(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function finalizarCompra() {
    if (produtos.length === 0 || finalizando) {
      return;
    }

    setFinalizando(true);

    try {
      // Busca os dados mais recentes do usuário conectado.
      const usuarioSalvo = await AsyncStorage.getItem(
        CHAVE_USUARIO_LOGADO
      );

      const usuarioAtual: Usuario | null = usuarioSalvo
        ? JSON.parse(usuarioSalvo)
        : usuario
          ? ({ ...usuario } as Usuario)
          : null;

      if (!usuarioAtual) {
        throw new Error(
          "Não foi possível identificar o usuário conectado."
        );
      }

      // Confere se existe um usuário conectado.
      if (
        usuarioAtual.id == null &&
        !usuarioAtual.email
      ) {
        throw new Error(
          "O usuário conectado não possui identificador ou e-mail."
        );
      }

      // Cria o registro da compra com os dados do carrinho.
      const dataCompra = new Date().toISOString();

      const produtosComprados = produtos.map((produto) => ({
        ...produto,
        preco: Number(produto.preco) || 0,
        quantidade: Number(produto.quantidade) || 1,
      }));

      const quantidadeItens = produtosComprados.reduce(
        (soma, produto) => soma + produto.quantidade,
        0
      );

      const totalCompra = produtosComprados.reduce(
        (soma, produto) =>
          soma + produto.preco * produto.quantidade,
        0
      );

      const compra = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        data: dataCompra,
        mercado:
          produtosComprados[0]?.mercado ??
          produtosComprados[0]?.nomeMercado ??
          "Compra no Economize",
        produtos: produtosComprados,
        quantidadeItens,
        total: totalCompra,
        formaPagamento: stateDois,
        tipoEntrega: stateUm,
        status: "Concluída",
      };

      // Lê o histórico que já existe, sem apagar compras anteriores.
      const historicoAtual = Array.isArray(
        usuarioAtual.historicoCompras
      )
        ? usuarioAtual.historicoCompras
        : [];

      const usuarioAtualizado: Usuario = {
        ...usuarioAtual,
        historicoCompras: [...historicoAtual, compra],
      };

      // Atualiza o cadastro do usuário no armazenamento.
      const usuariosSalvos = await AsyncStorage.getItem(
        CHAVE_USUARIOS
      );

      if (usuariosSalvos) {
        const usuarios: Usuario[] = JSON.parse(usuariosSalvos);

        if (!Array.isArray(usuarios)) {
          throw new Error(
            "A lista de usuários armazenada está inválida."
          );
        }

        const indiceUsuario = usuarios.findIndex((item) => {
          if (
            item.id != null &&
            usuarioAtualizado.id != null
          ) {
            return (
              String(item.id) === String(usuarioAtualizado.id)
            );
          }

          return Boolean(
            item.email &&
              usuarioAtualizado.email &&
              item.email.trim().toLowerCase() ===
                usuarioAtualizado.email.trim().toLowerCase()
          );
        });

        if (indiceUsuario === -1) {
          throw new Error(
            "Não foi possível localizar o cadastro do usuário. A compra não foi finalizada."
          );
        }

        // Preserva os demais dados do cadastro, inclusive a senha.
        const usuariosAtualizados = [...usuarios];

        usuariosAtualizados[indiceUsuario] = {
          ...usuariosAtualizados[indiceUsuario],
          historicoCompras: usuarioAtualizado.historicoCompras,
        };

        await AsyncStorage.setItem(
          CHAVE_USUARIOS,
          JSON.stringify(usuariosAtualizados)
        );
      }

      // Atualiza também o usuário da sessão atual.
      await AsyncStorage.setItem(
        CHAVE_USUARIO_LOGADO,
        JSON.stringify(usuarioAtualizado)
      );

      // O carrinho só é apagado depois de salvar a compra.
      await AsyncStorage.removeItem(CHAVE_CARRINHO);

      setValorTotal(totalCompra);
      setProdutos(produtosComprados);
      setConfirmado(true);
    } catch (erro) {
      console.log("Erro ao salvar a compra:", erro);

      Alert.alert(
        "Não foi possível finalizar",
        erro instanceof Error
          ? erro.message
          : "Ocorreu um erro ao salvar a compra. Tente novamente."
      );
    } finally {
      setFinalizando(false);
    }
  }

  if (carregando || !autorizado) {
    return null;
  }

  if (confirmado) {
    return (
      <View style={styles.confirmacaoContainer}>
        <View style={styles.confirmacaoConteudo}>
          <View style={styles.iconeSucesso}>
            <Ionicons
              name="checkmark-circle"
              size={100}
              color="#3E8050"
            />
          </View>

          <Text style={styles.tituloSucesso}>
            Pedido confirmado!
          </Text>

          <Text style={styles.descricaoSucesso}>
            Tudo certo! Seu pedido foi registrado com sucesso.
          </Text>

          <View style={styles.cartaoConfirmacao}>
            <Text style={styles.rotuloResumo}>
              Resumo do pedido
            </Text>

            <View style={styles.linhaResumo}>
              <Text style={styles.textoResumo}>
                Quantidade de itens
              </Text>
              <Text style={styles.valorResumo}>
                {produtos.reduce(
                  (soma, produto) =>
                    soma + (Number(produto.quantidade) || 1),
                  0
                )}
              </Text>
            </View>

            <View style={styles.linhaResumo}>
              <Text style={styles.textoResumo}>
                Forma de recebimento
              </Text>
              <Text style={styles.valorResumo}>{stateUm}</Text>
            </View>

            <View style={styles.linhaResumo}>
              <Text style={styles.textoResumo}>
                Pagamento escolhido
              </Text>
              <Text style={styles.valorResumo}>
                {stateDois === "Credito"
                  ? "Cartão de crédito"
                  : stateDois === "Debito"
                    ? "Cartão de débito"
                    : stateDois}
              </Text>
            </View>

            <View style={styles.divisor} />

            <View style={styles.linhaResumo}>
              <Text style={styles.totalConfirmacao}>
                Total do pedido
              </Text>
              <Text style={styles.totalValor}>
                {formatarPreco(valorTotal)}
              </Text>
            </View>
          </View>

          <Text style={styles.avisoSimulado}>
            Esta é uma confirmação demonstrativa. Nenhuma
            cobrança real foi realizada.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botaoInicio,
            pressed && styles.botaoPressionado,
          ]}
          onPress={() => router.replace("/home")}
        >
          <Ionicons name="home-outline" size={22} color="#fff" />
          <Text style={styles.textoBotaoInicio}>
            Voltar para o início
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.parent}>
      <View style={styles.header}>
        <Pressable
          style={styles.voltar}
          onPress={() => router.push("/carrinho")}
        >
          <Ionicons
            name="chevron-back-sharp"
            color="#315F3C"
            size={32}
          />
        </Pressable>

        <Text style={styles.titulo}>Finalizar compra</Text>
        <View style={styles.espacoHeader} />
      </View>

      {produtos.length === 0 ? (
        <View style={styles.carrinhoVazio}>
          <Ionicons
            name="cart-outline"
            size={75}
            color="#3E8050"
          />

          <Text style={styles.tituloVazio}>
            Seu carrinho está vazio
          </Text>

          <Text style={styles.descricaoVazio}>
            Adicione produtos antes de finalizar a compra.
          </Text>

          <Pressable
            style={styles.botaoInicio}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.textoBotaoInicio}>
              Voltar para o início
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.main}
            contentContainerStyle={styles.conteudoMain}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.secao}>
              <Text style={styles.tituloSecao}>
                Entrega ou retirada
              </Text>

              <View style={styles.campo}>
                <Pressable
                  style={[
                    styles.opcao,
                    stateUm === "Entrega" &&
                      styles.opcaoSelecionada,
                  ]}
                  onPress={() => setStateUm("Entrega")}
                >
                  <View
                    style={[
                      styles.radio,
                      stateUm === "Entrega" &&
                        styles.radioSelecionado,
                    ]}
                  />

                  <Ionicons
                    name="home-outline"
                    size={25}
                    color="#315F3C"
                  />

                  <View style={styles.textosOpcao}>
                    <Text style={styles.rotuloMaior}>
                      Entrega em casa
                    </Text>
                    <Text style={styles.rotuloMenor}>
                      Receba seus produtos
                    </Text>
                  </View>

                  {stateUm === "Entrega" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color="#3E8050"
                    />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.opcao,
                    stateUm === "Retirar" &&
                      styles.opcaoSelecionada,
                  ]}
                  onPress={() => setStateUm("Retirar")}
                >
                  <View
                    style={[
                      styles.radio,
                      stateUm === "Retirar" &&
                        styles.radioSelecionado,
                    ]}
                  />

                  <Ionicons
                    name="storefront-outline"
                    size={25}
                    color="#315F3C"
                  />

                  <View style={styles.textosOpcao}>
                    <Text style={styles.rotuloMaior}>
                      Retirar na loja
                    </Text>
                    <Text style={styles.rotuloMenor}>
                      Busque seus produtos na loja
                    </Text>
                  </View>

                  {stateUm === "Retirar" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color="#3E8050"
                    />
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.secao}>
              <Text style={styles.tituloSecao}>
                Forma de pagamento
              </Text>

              <View style={styles.campo}>
                <Pressable
                  style={[
                    styles.opcao,
                    stateDois === "Pix" &&
                      styles.opcaoSelecionada,
                  ]}
                  onPress={() => setStateDois("Pix")}
                >
                  <View
                    style={[
                      styles.radio,
                      stateDois === "Pix" &&
                        styles.radioSelecionado,
                    ]}
                  />

                  <Image
                    source={require("../../assets/images/icons8-foto-100.png")}
                    style={styles.icon}
                    resizeMode="contain"
                  />

                  <View style={styles.textosOpcao}>
                    <Text style={styles.rotuloMaior}>Pix</Text>
                    <Text style={styles.rotuloMenor}>
                      Pagamento instantâneo
                    </Text>
                  </View>

                  {stateDois === "Pix" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color="#3E8050"
                    />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.opcao,
                    stateDois === "Credito" &&
                      styles.opcaoSelecionada,
                  ]}
                  onPress={() => setStateDois("Credito")}
                >
                  <View
                    style={[
                      styles.radio,
                      stateDois === "Credito" &&
                        styles.radioSelecionado,
                    ]}
                  />

                  <Ionicons
                    name="card-outline"
                    color="#315F3C"
                    size={32}
                    style={styles.icon}
                  />

                  <View style={styles.textosOpcao}>
                    <Text style={styles.rotuloMaior}>
                      Cartão de crédito
                    </Text>
                    <Text style={styles.rotuloMenor}>
                      Em até 12x
                    </Text>
                  </View>

                  {stateDois === "Credito" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color="#3E8050"
                    />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.opcao,
                    stateDois === "Debito" &&
                      styles.opcaoSelecionada,
                  ]}
                  onPress={() => setStateDois("Debito")}
                >
                  <View
                    style={[
                      styles.radio,
                      stateDois === "Debito" &&
                        styles.radioSelecionado,
                    ]}
                  />

                  <Ionicons
                    name="card-outline"
                    color="#315F3C"
                    size={32}
                    style={styles.icon}
                  />

                  <View style={styles.textosOpcao}>
                    <Text style={styles.rotuloMaior}>
                      Cartão de débito
                    </Text>
                    <Text style={styles.rotuloMenor}>
                      Pagamento com débito
                    </Text>
                  </View>

                  {stateDois === "Debito" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color="#3E8050"
                    />
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.opcao,
                    stateDois === "Dinheiro" &&
                      styles.opcaoSelecionada,
                  ]}
                  onPress={() => setStateDois("Dinheiro")}
                >
                  <View
                    style={[
                      styles.radio,
                      stateDois === "Dinheiro" &&
                        styles.radioSelecionado,
                    ]}
                  />

                  <Image
                    source={require("../../assets/images/money.png")}
                    style={styles.icon}
                    resizeMode="contain"
                  />

                  <View style={styles.textosOpcao}>
                    <Text style={styles.rotuloMaior}>
                      Dinheiro
                    </Text>
                    <Text style={styles.rotuloMenor}>
                      Pagamento em dinheiro
                    </Text>
                  </View>

                  {stateDois === "Dinheiro" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color="#3E8050"
                    />
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.resumo}>
              <Text style={styles.textoForte}>
                Resumo do pedido
              </Text>

              <View style={styles.dados}>
                <Text style={styles.textoResumo}>
                  {produtos.reduce(
                    (soma, produto) =>
                      soma + (Number(produto.quantidade) || 1),
                    0
                  )}{" "}
                  itens
                </Text>
                <Text style={styles.textoResumo}>
                  {formatarPreco(valorTotal)}
                </Text>
              </View>

              <View style={styles.dados}>
                <Text style={styles.textoResumo}>
                  Taxa de entrega
                </Text>
                <Text style={styles.tipoEntrega}>
                  {tipoEntrega}
                </Text>
              </View>
            </View>

            <View style={styles.areaBotao}>
              <Pressable
                style={({ pressed }) => [
                  styles.botao,
                  pressed && styles.botaoPressionado,
                  finalizando && styles.botaoDesabilitado,
                ]}
                onPress={finalizarCompra}
                disabled={finalizando}
              >
                <Text style={styles.botaoText}>
                  {finalizando
                    ? "Finalizando..."
                    : "Finalizar compra"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={21}
                  color="#fff"
                />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: "#F7F9F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  voltar: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  titulo: {
    flex: 1,
    fontSize: 23,
    fontWeight: "700",
    color: "#183D27",
    textAlign: "center",
  },
  espacoHeader: {
    width: 42,
  },
  main: {
    flex: 1,
  },
  conteudoMain: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  secao: {
    marginBottom: 25,
  },
  tituloSecao: {
    fontSize: 19,
    fontWeight: "700",
    color: "#203A29",
    marginBottom: 12,
  },
  campo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E1E9E2",
    overflow: "hidden",
  },
  opcao: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1ED",
    gap: 10,
  },
  opcaoSelecionada: {
    backgroundColor: "#F0F7F1",
  },
  radio: {
    width: 21,
    height: 21,
    borderWidth: 2,
    borderColor: "#8AA493",
    borderRadius: 50,
  },
  radioSelecionado: {
    borderColor: "#3E8050",
    backgroundColor: "#3E8050",
    shadowColor: "#3E8050",
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  icon: {
    width: 34,
    height: 34,
  },
  textosOpcao: {
    flex: 1,
    justifyContent: "center",
  },
  rotuloMaior: {
    fontSize: 16,
    fontWeight: "600",
    color: "#24372A",
  },
  rotuloMenor: {
    fontSize: 12,
    color: "#7A857C",
    marginTop: 4,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: "#E5EBE5",
  },
  resumo: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  textoForte: {
    fontSize: 18,
    fontWeight: "700",
    color: "#203A29",
    marginBottom: 10,
  },
  dados: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  textoResumo: {
    fontSize: 14,
    color: "#69756C",
  },
  tipoEntrega: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3E8050",
  },
  areaBotao: {
    paddingHorizontal: 20,
  },
  botao: {
    minHeight: 54,
    backgroundColor: "#3E8050",
    borderRadius: 17,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  botaoText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 17,
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
  carrinhoVazio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  tituloVazio: {
    fontSize: 22,
    fontWeight: "700",
    color: "#203A29",
    marginTop: 18,
  },
  descricaoVazio: {
    fontSize: 15,
    color: "#778078",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  confirmacaoContainer: {
    flex: 1,
    backgroundColor: "#F7F9F7",
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 25,
    justifyContent: "space-between",
  },
  confirmacaoConteudo: {
    alignItems: "center",
    paddingTop: 20,
  },
  iconeSucesso: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E5F2E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  tituloSucesso: {
    fontSize: 28,
    fontWeight: "800",
    color: "#245D39",
    textAlign: "center",
  },
  descricaoSucesso: {
    fontSize: 15,
    lineHeight: 22,
    color: "#69756C",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 26,
    paddingHorizontal: 8,
  },
  cartaoConfirmacao: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2EAE3",
  },
  rotuloResumo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#203A29",
    marginBottom: 18,
  },
  linhaResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  valorResumo: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#203A29",
    textAlign: "right",
  },
  divisor: {
    height: 1,
    backgroundColor: "#E5EBE5",
    marginVertical: 5,
    marginBottom: 16,
  },
  totalConfirmacao: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#203A29",
  },
  totalValor: {
    fontSize: 19,
    fontWeight: "800",
    color: "#3E8050",
  },
  avisoSimulado: {
    fontSize: 12,
    color: "#8A938B",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 20,
  },
  botaoInicio: {
    minHeight: 54,
    backgroundColor: "#3E8050",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  textoBotaoInicio: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
