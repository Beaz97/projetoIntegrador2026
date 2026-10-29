import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  StatusBar,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAutenticacao } from '@/app/components/autenticaTelas';
import Dados, { type Produto } from '../rotaServidor/dadosProdutos';

const VERDE = '#41805a';
const VERDE_ESCURO = '#245D39';
const FUNDO = '#F7F9F7';
const CHAVE_PRODUTOS = 'produtos';

function produtoValido(valor: unknown): valor is Produto {
  if (!valor || typeof valor !== 'object') {
    return false;
  }

  const produto = valor as Produto;

  return (
    typeof produto.id === 'string' &&
    typeof produto.nome === 'string' &&
    typeof produto.preco === 'number' &&
    typeof produto.empresa === 'number'
  );
}

export default function ProdutosEmpresa() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { usuario, carregando, autorizado } =
    useAutenticacao('empresa');

  const dados = useMemo(() => Dados(), []);
  const produtosIniciais = dados.produtos;

  const [busca, setBusca] = useState('');
  const [produtos, setProdutos] =
    useState<Produto[]>(produtosIniciais);

  const carregarProdutos = useCallback(async () => {
    try {
      const conteudo = await AsyncStorage.getItem(CHAVE_PRODUTOS);

      if (!conteudo) {
        setProdutos(produtosIniciais);
        return;
      }

      const parseado: unknown = JSON.parse(conteudo);

      if (!Array.isArray(parseado)) {
        throw new Error('A lista de produtos armazenada não é válida.');
      }

      const produtosSalvos = parseado.filter(produtoValido);
      setProdutos(produtosSalvos);
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      setProdutos(produtosIniciais);
    }
  }, [produtosIniciais]);

  useFocusEffect(
    useCallback(() => {
      void carregarProdutos();
    }, [carregarProdutos])
  );

  async function excluirProduto(produto: Produto) {
    try {
      const conteudo = await AsyncStorage.getItem(CHAVE_PRODUTOS);

      const parseado: unknown = conteudo
        ? JSON.parse(conteudo)
        : produtos;

      if (
        !Array.isArray(parseado) ||
        !parseado.every(produtoValido)
      ) {
        throw new Error('A lista de produtos armazenada não é válida.');
      }

      const produtosAtualizados = parseado.filter(
        (item) => String(item.id) !== String(produto.id)
      );

      await AsyncStorage.setItem(
        CHAVE_PRODUTOS,
        JSON.stringify(produtosAtualizados)
      );

      setProdutos(produtosAtualizados);
    } catch (erro) {
      console.error('Erro ao excluir produto:', erro);

      Alert.alert(
        'Não foi possível excluir',
        'O produto não foi removido. Tente novamente.'
      );
    }
  }

  function confirmarExclusao(produto: Produto) {
    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${produto.nome}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void excluirProduto(produto);
          },
        },
      ]
    );
  }

  const produtosDaEmpresa = useMemo(() => {
    if (usuario?.id == null) {
      return [];
    }

    return produtos.filter(
      (produto) =>
        String(produto.empresa) === String(usuario.id)
    );
  }, [produtos, usuario?.id]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    return produtosDaEmpresa.filter((produto) =>
      String(produto.nome ?? '')
        .toLocaleLowerCase('pt-BR')
        .includes(termo)
    );
  }, [produtosDaEmpresa, busca]);

  if (carregando || !autorizado) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={VERDE}
      />

      {/* CABEÇALHO: MESMO FORMATO, SOMENTE A COR ALTERADA */}
      <View style={styles.cabecalho}>
        <Pressable
          style={styles.botaoVoltar}
          onPress={() => router.push('/homeempresa' as any)}
          accessibilityRole="button"
          accessibilityLabel="Voltar para o início"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.titulos}>
          <Text style={styles.titulo}>
            Meus produtos
          </Text>

          <Text style={styles.subtitulo}>
            Gerencie seu catálogo
          </Text>
        </View>

        <View style={styles.contador}>
          <Text style={styles.contadorNumero}>
            {produtosDaEmpresa.length}
          </Text>

          <Text style={styles.contadorTexto}>
            produtos
          </Text>
        </View>
      </View>

      {/* CONTEÚDO */}
      <View style={styles.conteudo}>
        <View style={styles.pesquisa}>
          <Ionicons
            name="search-outline"
            size={21}
            color="#849087"
          />

          <TextInput
            style={styles.input}
            placeholder="Buscar produto..."
            placeholderTextColor="#929C94"
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            selectionColor={VERDE}
            accessibilityLabel="Buscar produtos pelo nome"
          />

          {busca.length > 0 && (
            <Pressable
              onPress={() => setBusca('')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Limpar pesquisa"
            >
              <Ionicons
                name="close-circle"
                size={21}
                color="#849087"
              />
            </Pressable>
          )}
        </View>

        <View style={styles.linhaTitulo}>
          <View style={styles.tituloArea}>
            <Text style={styles.tituloLista}>
              Seu catálogo
            </Text>

            <Text style={styles.subtituloLista}>
              {busca.trim()
                ? `${lista.length} resultado(s) encontrado(s)`
                : 'Todos os produtos cadastrados'}
            </Text>
          </View>

          <Pressable
            style={styles.botaoAdicionar}
            onPress={() => router.push('/novoproduto' as any)}
            accessibilityRole="button"
            accessibilityLabel="Adicionar novo produto"
          >
            <Ionicons
              name="add"
              size={27}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {/* LISTA DE PRODUTOS */}
        <ScrollView
          style={styles.listaScroll}
          contentContainerStyle={styles.listaConteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {lista.map((produto) => {
            const imagem =
              typeof produto.imagem === 'string'
                ? produto.imagem
                : null;

            const preco =
              produto.preco.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              });

            const temOferta =
              produto.oferta === true &&
              typeof produto.precoOferta === 'number' &&
              Number.isFinite(produto.precoOferta) &&
              produto.precoOferta > 0 &&
              produto.precoOferta < produto.preco;

            return (
              <View
                key={String(produto.id)}
                style={[
                  styles.cardProduto,
                  width < 360 && styles.cardPequeno,
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.conteudoProduto,
                    pressed && styles.cardPressionado,
                  ]}
                  onPress={() =>
                    router.push(
                      `/rotas/produtos/${produto.id}?origem=empresa` as any
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${produto.nome}, ${preco}`}
                >
                  <View style={styles.areaImagem}>
                    {imagem ? (
                      <Image
                        source={{ uri: imagem }}
                        style={styles.imagemProduto}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.imagemVazia}>
                        <Ionicons
                          name="cube-outline"
                          size={37}
                          color={VERDE}
                        />

                        <Text style={styles.textoImagemVazia}>
                          Sem foto
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.informacao}>
                    <Text
                      style={styles.nomeProduto}
                      numberOfLines={2}
                    >
                      {produto.nome}
                    </Text>

                    {produto.unidade ? (
                      <Text
                        style={styles.unidade}
                        numberOfLines={1}
                      >
                        {produto.unidade}
                      </Text>
                    ) : null}

                    {temOferta ? (
                      <View style={styles.linhaPrecos}>
                        <Text style={styles.precoRiscado}>
                          {preco}
                        </Text>

                        <Text style={styles.precoProduto}>
                          {produto.precoOferta!.toLocaleString(
                            'pt-BR',
                            {
                              style: 'currency',
                              currency: 'BRL',
                            }
                          )}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.precoProduto}>
                        {preco}
                      </Text>
                    )}

                    {temOferta && (
                      <View style={styles.seloOferta}>
                        <Ionicons
                          name="pricetag"
                          size={12}
                          color={VERDE_ESCURO}
                        />

                        <Text style={styles.textoOferta}>
                          Em oferta
                        </Text>
                      </View>
                    )}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={21}
                    color="#98A198"
                  />
                </Pressable>

                <Pressable
                  style={styles.botaoExcluir}
                  onPress={() => confirmarExclusao(produto)}
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir ${produto.nome}`}
                  hitSlop={6}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#B42318"
                  />
                </Pressable>
              </View>
            );
          })}

          {lista.length === 0 && (
            <View style={styles.estadoVazio}>
              <View style={styles.iconeVazio}>
                <Ionicons
                  name="search-outline"
                  size={34}
                  color={VERDE}
                />
              </View>

              <Text style={styles.tituloVazio}>
                {busca.trim()
                  ? 'Nenhum produto encontrado'
                  : 'Seu catálogo está vazio'}
              </Text>

              <Text style={styles.textoVazio}>
                {busca.trim()
                  ? 'Tente pesquisar com outro nome.'
                  : 'Adicione seu primeiro produto para começar.'}
              </Text>

              {!busca.trim() && (
                <Pressable
                  style={styles.botaoVazio}
                  onPress={() =>
                    router.push('/produtoempresa' as any)
                  }
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text style={styles.textoBotaoVazio}>
                    Adicionar produto
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.espacoFinal} />
        </ScrollView>
      </View>

      {/* RODAPÉ VERDE COM CARRINHO CENTRAL */}
      <View style={styles.rodape}>
        <View style={styles.navegacao}>
          <Pressable
            style={styles.itemNav}
            onPress={() => router.push('/homeempresa' as any)}
            accessibilityRole="button"
            accessibilityLabel="Início"
          >
            <Ionicons
              name="home-outline"
              size={23}
              color="#FFFFFF"
            />

            <Text style={styles.textoNav}>
              Início
            </Text>
          </Pressable>

          <View style={styles.itemNav}>
            <Ionicons
              name="cube"
              size={23}
              color="#FFFFFF"
            />

            <Text style={styles.textoAtivo}>
              Produtos
            </Text>

            <View style={styles.indicadorAtivo} />
          </View>

    

          <Pressable
            style={styles.itemNav}
            onPress={() => router.push('/ofertaempresa' as any)}
            accessibilityRole="button"
            accessibilityLabel="Ofertas"
          >
            <Ionicons
              name="pricetag-outline"
              size={23}
              color="#FFFFFF"
            />

            <Text style={styles.textoNav}>
              Ofertas
            </Text>
          </Pressable>

          <Pressable
            style={styles.itemNav}
            onPress={() => router.push('/perfilempresa' as any)}
            accessibilityRole="button"
            accessibilityLabel="Perfil"
          >
            <Ionicons
              name="person-outline"
              size={23}
              color="#FFFFFF"
            />

            <Text style={styles.textoNav}>
              Perfil
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },

  // CABEÇALHO: MESMA ESTRUTURA, COR VERDE
  cabecalho: {
    backgroundColor: VERDE,
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    flexShrink: 0,
  },

  botaoVoltar: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulos: {
    flex: 1,
    minWidth: 0,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  subtitulo: {
    fontSize: 13,
    color: '#E7F2E9',
    marginTop: 5,
  },

  contador: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 53,
    paddingVertical: 8,
    paddingHorizontal: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.17)',
  },

  contadorNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  contadorTexto: {
    fontSize: 9,
    color: '#E2EFE5',
    marginTop: 2,
  },

  // CONTEÚDO
  conteudo: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  pesquisa: {
    height: 51,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EBE6',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 23,
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: VERDE_ESCURO,
    fontSize: 14,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          boxShadow: 'none',
        } as any)
      : {}),
  },

  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 12,
  },

  tituloArea: {
    flex: 1,
    minWidth: 0,
  },

  tituloLista: {
    fontSize: 21,
    fontWeight: 'bold',
    color: VERDE_ESCURO,
  },

  subtituloLista: {
    fontSize: 12,
    color: '#7B887F',
    marginTop: 4,
  },

  botaoAdicionar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: VERDE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: VERDE,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  listaScroll: {
    flex: 1,
    minHeight: 0,
  },

  listaConteudo: {
    paddingBottom: 8,
  },

  cardProduto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E7ECE8',
    padding: 12,
    marginBottom: 12,
    gap: 13,
    minHeight: 116,
    shadowColor: '#244D32',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  cardPequeno: {
    gap: 9,
    padding: 9,
  },

  conteudoProduto: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  cardPressionado: {
    opacity: 0.78,
  },

  areaImagem: {
    width: 91,
    height: 91,
    borderRadius: 15,
    backgroundColor: '#F2F6F2',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imagemProduto: {
    width: '100%',
    height: '100%',
  },

  imagemVazia: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  textoImagemVazia: {
    fontSize: 10,
    color: '#849087',
  },

  informacao: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 5,
  },

  nomeProduto: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: '#294531',
  },

  unidade: {
    fontSize: 11,
    color: '#849087',
  },

  linhaPrecos: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },

  precoRiscado: {
    fontSize: 13,
    color: '#8A938C',
    textDecorationLine: 'line-through',
  },

  precoProduto: {
    fontSize: 17,
    fontWeight: 'bold',
    color: VERDE,
    marginTop: 2,
  },

  seloOferta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF5ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
  },

  textoOferta: {
    fontSize: 10,
    fontWeight: '600',
    color: VERDE_ESCURO,
  },

  botaoExcluir: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFF1F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  estadoVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 35,
  },

  iconeVazio: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  tituloVazio: {
    fontSize: 17,
    fontWeight: 'bold',
    color: VERDE_ESCURO,
    textAlign: 'center',
  },

  textoVazio: {
    fontSize: 13,
    color: '#7B887F',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
  },

  botaoVazio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: VERDE,
    borderRadius: 13,
    paddingHorizontal: 17,
    paddingVertical: 12,
    marginTop: 20,
  },

  textoBotaoVazio: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  espacoFinal: {
    height: 8,
  },

  // ÁREA EXTERNA DO RODAPÉ
  rodape: {
    backgroundColor: FUNDO,
    paddingTop: 8,
    flexShrink: 0,
  },

  // BARRA VERDE DO RODAPÉ
  navegacao: {
    height: 67,
    backgroundColor: VERDE,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 5,
  },

  itemNav: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  textoNav: {
    fontSize: 10,
    color: '#FFFFFF',
  },

  textoAtivo: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  indicadorAtivo: {
    width: 21,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },

  // BOTÃO CENTRAL DO CARRINHO
  botaoCarrinho: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: VERDE_ESCURO,
    borderWidth: 4,
    borderColor: FUNDO,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
});
