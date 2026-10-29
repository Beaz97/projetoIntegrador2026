import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useState, useRef, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Dados, {
  type Categoria,
  type Produto,
} from '../rotaServidor/dadosProdutos';

import { useAutenticacao } from '@/app/components/autenticaTelas';

/* ---------- Dados ---------- */

const dados = Dados();
const categorias = dados.categorias;
const PRODUTOS_STORAGE_KEY = 'produtos';

const corVerde = '#41805a';
const verdeEscuro = '#245D39';

function isProduto(value: unknown): value is Produto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const produto = value as Record<string, unknown>;

  return (
    typeof produto.id === 'string' &&
    typeof produto.nome === 'string' &&
    typeof produto.unidade === 'string' &&
    typeof produto.preco === 'number' &&
    typeof produto.icone === 'string'
  );
}

/* ---------- Imagem com fallback ---------- */

type FotoProps = {
  uri?: string;
  icone: any;
  tamanhoIcone: number;
  corIcone: string;
  estilo?: any;
};

function Foto({
  uri,
  icone,
  tamanhoIcone,
  corIcone,
  estilo,
}: FotoProps) {
  const [erro, setErro] = useState(false);

  if (uri && !erro) {
    return (
      <Image
        source={{ uri }}
        style={estilo}
        resizeMode="cover"
        onError={() => setErro(true)}
      />
    );
  }

  return (
    <Ionicons
      name={icone}
      size={tamanhoIcone}
      color={corIcone}
    />
  );
}

/* ---------- Card de produto ---------- */

type CardProps = {
  id: string;
  nome: string;
  unidade: string;
  preco: number;
  icone: any;
  imagem?: string;
  oferta?: boolean;
};

function CardProduto({
  id,
  nome,
  unidade,
  preco,
  icone,
  imagem,
  oferta,
  empresa
}: CardProps) {
  const router = useRouter();
  console.log('empresa', typeof(empresa));
  // percorrer os usuariso e verificar se o produto pertence a empresa do usuario logado, atribuir o nome do usuario a var let empresaNome, e exibir no card do produto
  // a lista de usuarios esta no storage em @banco_usuarios.
  let empresaNome = 'empresa não encontrada';
  let usuarios= AsyncStorage.getItem('@banco_usuarios').then((usuarios) => {
    if (usuarios) {
      const usuariosParse = JSON.parse(usuarios);
       usuariosParse.forEach((usuario: any) => {
        let idEmpresa = Number(usuario.id);
        console.log('idEmpresa', idEmpresa);
        if (idEmpresa === empresa) {
          empresaNome = usuario.nome;
          console.log('empresaNome', empresaNome);
        }
      });
    }
  });


  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressionado,
      ]}
      onPress={() => router.push(`/rotas/produtos/${id}`)}
    >
      <View style={styles.cardImagem}>
        <Foto
          uri={imagem}
          icone={icone}
          tamanhoIcone={60}
          corIcone={corVerde}
          estilo={styles.cardFoto}
        />

        {oferta && (
          <View style={styles.seloOferta}>
            <Text style={styles.seloOfertaTexto}>
              OFERTA
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardInformacoes}>
        <Text
          style={styles.cardNome}
          numberOfLines={2}
        >
          {nome}
          {empresaNome}
        </Text>

        <Text
          style={styles.cardUnidade}
          numberOfLines={1}
        >
          {unidade}
        </Text>

        <Text style={styles.cardPreco}>
          R$ {preco.toFixed(2).replace('.', ',')}
        </Text>
      </View>
    </Pressable>
  );
}

/* ---------- Tela principal ---------- */

export default function Home() {
  const router = useRouter();
  const buscaRef = useRef<TextInput>(null);

  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);

  const [modoLista, setModoLista] = useState<
    'ofertas' | 'todos' | 'categoria' | 'busca'
  >('ofertas');

  // Controla se a lista mostra todos os produtos ou somente ofertas.
  const [filtroOferta, setFiltroOferta] = useState<
    'todos' | 'ofertas'
  >('ofertas');

  const [produtos, setProdutos] = useState<Produto[]>(
    dados.produtos
  );

  const [carregandoProdutos, setCarregandoProdutos] =
    useState(true);

  const {
    usuario,
    carregando,
    autorizado,
  } = useAutenticacao('cliente');

  /* ---------- Carregar produtos ---------- */

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarProdutos() {
        try {
          const produtosSalvos = await AsyncStorage.getItem(
            PRODUTOS_STORAGE_KEY
          );

          const produtosCarregados: unknown = produtosSalvos
            ? JSON.parse(produtosSalvos)
            : dados.produtos;

          if (
            !Array.isArray(produtosCarregados) ||
            !produtosCarregados.every(isProduto)
          ) {
            throw new Error(
              'A lista de produtos armazenada não está em formato válido.'
            );
          }

          if (ativo) {
            setProdutos(produtosCarregados);
          }
        } catch (error) {
          console.error(
            'Erro ao carregar produtos:',
            error
          );

          if (ativo) {
            Alert.alert(
              'Erro ao carregar produtos',
              'Não foi possível atualizar a lista de produtos.'
            );
          }
        } finally {
          if (ativo) {
            setCarregandoProdutos(false);
          }
        }
      }

      carregarProdutos();

      return () => {
        ativo = false;
      };
    }, [])
  );

  /* ---------- Categoria Todos ---------- */

  const categoriasTela = [
    {
      id: '__todos__',
      nome: 'Todos',
      icone: 'grid-outline',
    },
    ...categorias,
  ];

  /* ---------- Filtrar produtos ---------- */

  const produtosLista = produtos.filter((produto) => {
    // Pesquisa por nome.
    if (modoLista === 'busca') {
      const correspondeBusca = produto.nome
        .toLowerCase()
        .includes(busca.trim().toLowerCase());

      return correspondeBusca;
    }

    // Tela inicial: somente ofertas.
    if (modoLista === 'ofertas') {
      return produto.oferta === true;
    }

    // Categoria Todos: todos os produtos ou somente ofertas.
    if (modoLista === 'todos') {
      if (filtroOferta === 'ofertas') {
        return produto.oferta === true;
      }

      return true;
    }

    // Categoria específica.
    if (modoLista === 'categoria') {
      let correspondeCategoria = true;

      if (categoria !== '__todos__') {
        const categoriaSelecionada = categorias.find(
          (item) => item.id === categoria
        );

        correspondeCategoria =
          produto.categoria === categoria ||
          produto.categoria?.toLowerCase() ===
            categoriaSelecionada?.nome.toLowerCase();
      }

      if (!correspondeCategoria) {
        return false;
      }

      // Dentro da categoria, permite filtrar as ofertas.
      if (filtroOferta === 'ofertas') {
        return produto.oferta === true;
      }

      return true;
    }

    return true;
  });

  /* ---------- Título da lista ---------- */

  let tituloLista = 'Ofertas para você';

  if (modoLista === 'todos') {
    tituloLista =
      filtroOferta === 'ofertas'
        ? 'Todas as ofertas'
        : 'Todos os produtos';
  } else if (modoLista === 'categoria') {
    const nomeCategoria =
      categoria === '__todos__'
        ? 'Todos os produtos'
        : categorias.find(
            (item) => item.id === categoria
          )?.nome ?? 'Produtos';

    tituloLista =
      filtroOferta === 'ofertas'
        ? `Ofertas: ${nomeCategoria}`
        : nomeCategoria;
  } else if (modoLista === 'busca') {
    tituloLista = 'Resultados da busca';
  }

  /* ---------- Selecionar categoria ---------- */

  function selecionarCategoria(
    item: Categoria | {
      id: string;
      nome: string;
      icone: string;
    }
  ) {
    setCategoria(item.id);
    setBusca('');

    // Ao entrar em uma categoria, mostra todos os produtos dela.
    setFiltroOferta('todos');

    if (item.id === '__todos__') {
      setModoLista('todos');
    } else {
      setModoLista('categoria');
    }

    buscaRef.current?.blur();
  }

  /* ---------- Filtro de ofertas ---------- */

  function selecionarFiltro(filtro: 'todos' | 'ofertas') {
    setFiltroOferta(filtro);

    if (categoria === '__todos__') {
      setModoLista('todos');
    } else if (categoria) {
      setModoLista('categoria');
    }
  }

  /* ---------- Pesquisar ---------- */

  function pesquisar(texto: string) {
    setBusca(texto);
    setCategoria(null);

    if (texto.trim() === '') {
      setModoLista('ofertas');
      setFiltroOferta('ofertas');
    } else {
      setModoLista('busca');
    }
  }

  /* ---------- Voltar para ofertas ---------- */

  function mostrarOfertas() {
    setBusca('');
    setCategoria(null);
    setFiltroOferta('ofertas');
    setModoLista('ofertas');
    buscaRef.current?.blur();
  }

  if (carregando || !autorizado) {
    return null;
  }

  /* ---------- Organizar produtos em duas colunas ---------- */

  const linhasProdutos: Produto[][] = [];

  for (let i = 0; i < produtosLista.length; i += 2) {
    linhasProdutos.push(produtosLista.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho sem o ícone */}

        <View style={styles.cabecalho}>
          <Text style={styles.ola}>
            Olá, {usuario?.nome?.split(' ')[0] || 'tudo bem'}!
          </Text>

          <Text style={styles.subtitulo}>
            Encontre os melhores preços para você.
          </Text>
        </View>

        {/* Busca corrigida para Expo Web */}

        <View style={styles.buscaContainer}>
          <Ionicons
            name="search-outline"
            size={22}
            color={corVerde}
          />

          <TextInput
            ref={buscaRef}
            style={styles.buscaInput}
            placeholder="O que você procura?"
            placeholderTextColor="#858585"
            value={busca}
            onChangeText={pesquisar}
            autoCorrect={false}
            autoCapitalize="none"
            selectTextOnFocus={false}
            selectionColor={corVerde}
            cursorColor={corVerde}
            returnKeyType="search"
            underlineColorAndroid="transparent"
            multiline={false}
            editable={true}
          />

          {busca.length > 0 && (
            <Pressable
              onPress={() => {
                pesquisar('');
                buscaRef.current?.focus();
              }}
              hitSlop={10}
            >
              <Ionicons
                name="close-circle"
                size={22}
                color="#999"
              />
            </Pressable>
          )}
        </View>

        {/* Categorias */}

        <View style={styles.secao}>
          <View style={styles.secaoCabecalho}>
            <Text style={styles.secaoTitulo}>
              Categorias
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listaCategorias}
          >
            {categoriasTela.map((item) => {
              const selecionada = categoria === item.id;

              return (
                <Pressable
                  key={item.id}
                  style={styles.categoriaItem}
                  onPress={() => selecionarCategoria(item)}
                >
                  <View
                    style={[
                      styles.categoriaIcone,
                      selecionada &&
                        styles.categoriaIconeAtiva,
                    ]}
                  >
                    <Foto
                      icone={item.icone}
                      tamanhoIcone={29}
                      corIcone={
                        selecionada ? '#fff' : corVerde
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.categoriaTexto,
                      selecionada &&
                        styles.categoriaTextoAtiva,
                    ]}
                    numberOfLines={1}
                  >
                    {item.nome}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Filtro Todos / Só ofertas */}

        {(modoLista === 'todos' ||
          modoLista === 'categoria') && (
          <View style={styles.filtroContainer}>
            <Pressable
              style={[
                styles.filtroBotao,
                filtroOferta === 'todos' &&
                  styles.filtroBotaoAtivo,
              ]}
              onPress={() => selecionarFiltro('todos')}
            >
              <Ionicons
                name="grid-outline"
                size={17}
                color={
                  filtroOferta === 'todos'
                    ? '#fff'
                    : verdeEscuro
                }
              />

              <Text
                style={[
                  styles.filtroTexto,
                  filtroOferta === 'todos' &&
                    styles.filtroTextoAtivo,
                ]}
              >
                Todos
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filtroBotao,
                filtroOferta === 'ofertas' &&
                  styles.filtroBotaoAtivo,
              ]}
              onPress={() => selecionarFiltro('ofertas')}
            >
              <Ionicons
                name="pricetag-outline"
                size={17}
                color={
                  filtroOferta === 'ofertas'
                    ? '#fff'
                    : verdeEscuro
                }
              />

              <Text
                style={[
                  styles.filtroTexto,
                  filtroOferta === 'ofertas' &&
                    styles.filtroTextoAtivo,
                ]}
              >
                Só ofertas
              </Text>
            </Pressable>
          </View>
        )}

        {/* Título dos produtos */}

        <View style={styles.produtosCabecalho}>
          <View style={styles.produtosTituloContainer}>
            <Text style={styles.produtosTitulo}>
              {tituloLista}
            </Text>

            <Text style={styles.produtosSubtitulo}>
              {modoLista === 'ofertas' ||
              filtroOferta === 'ofertas'
                ? 'Economize nas suas compras'
                : `${produtosLista.length} ${
                    produtosLista.length === 1
                      ? 'produto encontrado'
                      : 'produtos encontrados'
                  }`}
            </Text>
          </View>

          {modoLista !== 'ofertas' && (
            <Pressable
              style={styles.botaoOfertas}
              onPress={mostrarOfertas}
            >
              <Ionicons
                name="pricetag-outline"
                size={16}
                color={corVerde}
              />

              <Text style={styles.botaoOfertasTexto}>
                Início
              </Text>
            </Pressable>
          )}
        </View>

        {/* Produtos em grade */}

        {carregandoProdutos ? (
          <View style={styles.estadoVazio}>
            <ActivityIndicator
              size="large"
              color={corVerde}
            />

            <Text style={styles.estadoVazioTexto}>
              Carregando produtos...
            </Text>
          </View>
        ) : produtosLista.length > 0 ? (
          <View style={styles.gradeProdutos}>
            {linhasProdutos.map((linha, indice) => (
              <View
                key={`${linha[0].id}-${indice}`}
                style={styles.linhaProdutos}
              >
                {linha.map((produto) => (
                  <CardProduto
                    key={produto.id}
                    id={produto.id}
                    nome={produto.nome}
                    unidade={produto.unidade}
                    preco={produto.preco}
                    icone={produto.icone}
                    imagem={produto.imagem}
                    oferta={produto.oferta === true}
                    empresa={produto.empresa}
                  />
                ))}

                {linha.length === 1 && (
                  <View style={styles.cardEspacador} />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.estadoVazio}>
            <View style={styles.estadoVazioIcone}>
              <Ionicons
                name={
                  filtroOferta === 'ofertas'
                    ? 'pricetag-outline'
                    : 'search-outline'
                }
                size={38}
                color={corVerde}
              />
            </View>

            <Text style={styles.estadoVazioTitulo}>
              {filtroOferta === 'ofertas'
                ? 'Nenhuma oferta encontrada'
                : 'Nenhum produto encontrado'}
            </Text>

            <Text style={styles.estadoVazioTexto}>
              {filtroOferta === 'ofertas'
                ? 'Ainda não há ofertas cadastradas nesta seleção.'
                : 'Tente escolher outra categoria ou pesquisar outro nome.'}
            </Text>

            {filtroOferta === 'ofertas' && (
              <Pressable
                style={styles.botaoLimpar}
                onPress={() => selecionarFiltro('todos')}
              >
                <Text style={styles.botaoLimparTexto}>
                  Ver todos os produtos
                </Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.espacoFinal} />
      </ScrollView>

      {/* Barra inferior */}

      <View style={styles.barraContainer}>
        <View style={styles.barra}>
          <Pressable
            hitSlop={10}
            style={({ pressed }) => [
              styles.botaoNavegacao,
              pressed && styles.botaoPressionado,
            ]}
            onPress={() => router.push('/home')}
          >
            <Ionicons
              name="home"
              size={27}
              color="#fff"
            />

            <Text style={styles.textoNavegacao}>
              Início
            </Text>
          </Pressable>

          <Pressable
            hitSlop={10}
            style={({ pressed }) => [
              styles.botaoNavegacao,
              pressed && styles.botaoPressionado,
            ]}
            onPress={() => router.push('/perfil' as any)}
          >
            <Ionicons
              name="person-outline"
              size={27}
              color="#fff"
            />

            <Text style={styles.textoNavegacao}>
              Perfil
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.carrinho,
            pressed && styles.botaoPressionado,
          ]}
          onPress={() => router.push('/carrinho' as any)}
        >
          <Ionicons
            name="cart-outline"
            size={31}
            color="#fff"
          />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- Estilos ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },

  scroll: {
    flex: 1,
  },

  conteudo: {
    paddingTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },

  /* Cabeçalho */

  cabecalho: {
    marginBottom: 22,
  },

  ola: {
    fontSize: 26,
    fontWeight: '800',
    color: '#193D27',
    letterSpacing: -0.5,
  },

  subtitulo: {
    fontSize: 14,
    color: '#707970',
    marginTop: 6,
    lineHeight: 20,
  },

  /* Busca */

  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE7DE',
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 25,
  },

  buscaInput: {
    flex: 1,
    height: 50,
    minWidth: 0,
    fontSize: 15,
    color: '#202820',
    marginLeft: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,

    // Correção para seleção normal do texto no navegador.
    outlineStyle: 'none',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    cursor: 'text',
  } as any,

  /* Categorias */

  secao: {
    marginBottom: 23,
  },

  secaoCabecalho: {
    marginBottom: 15,
  },

  secaoTitulo: {
    fontSize: 19,
    fontWeight: '800',
    color: '#193D27',
  },

  listaCategorias: {
    paddingRight: 8,
    gap: 15,
  },

  categoriaItem: {
    width: 76,
    alignItems: 'center',
  },

  categoriaIcone: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: '#E8F3EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D9E9DD',
    marginBottom: 8,
  },

  categoriaIconeAtiva: {
    backgroundColor: corVerde,
    borderColor: corVerde,
  },

  categoriaTexto: {
    fontSize: 12,
    fontWeight: '500',
    color: '#505A51',
    textAlign: 'center',
  },

  categoriaTextoAtiva: {
    color: verdeEscuro,
    fontWeight: '800',
  },

  /* Filtro de produtos */

  filtroContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 23,
  },

  filtroBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE7DE',
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 13,
  },

  filtroBotaoAtivo: {
    backgroundColor: corVerde,
    borderColor: corVerde,
  },

  filtroTexto: {
    fontSize: 13,
    color: verdeEscuro,
    fontWeight: '700',
  },

  filtroTextoAtivo: {
    color: '#fff',
  },

  /* Cabeçalho dos produtos */

  produtosCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  produtosTituloContainer: {
    flex: 1,
  },

  produtosTitulo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#193D27',
    letterSpacing: -0.4,
  },

  produtosSubtitulo: {
    fontSize: 13,
    color: '#7B837B',
    marginTop: 5,
  },

  botaoOfertas: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1E8',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginLeft: 8,
    gap: 5,
  },

  botaoOfertasTexto: {
    color: verdeEscuro,
    fontSize: 12,
    fontWeight: '700',
  },

  /* Grade de produtos */

  gradeProdutos: {
    gap: 13,
  },

  linhaProdutos: {
    flexDirection: 'row',
    gap: 12,
  },

  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 19,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8EDE8',
    shadowColor: '#193D27',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.045,
    shadowRadius: 7,
    elevation: 2,
    overflow: 'hidden',
  },

  cardPressionado: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  cardImagem: {
    height: 135,
    width: '100%',
    borderRadius: 13,
    backgroundColor: '#F3F7F3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  cardFoto: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },

  seloOferta: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: corVerde,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  seloOfertaTexto: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  cardInformacoes: {
    paddingTop: 11,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },

  cardNome: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26382A',
    lineHeight: 19,
    minHeight: 38,
  },

  cardUnidade: {
    fontSize: 12,
    color: '#858B85',
    marginTop: 4,
  },

  cardPreco: {
    fontSize: 19,
    fontWeight: '800',
    color: verdeEscuro,
    marginTop: 9,
  },

  cardEspacador: {
    flex: 1,
  },

  /* Estado vazio */

  estadoVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },

  estadoVazioIcone: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: '#E5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  estadoVazioTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#193D27',
    textAlign: 'center',
  },

  estadoVazioTexto: {
    fontSize: 14,
    color: '#7B837B',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },

  botaoLimpar: {
    marginTop: 19,
    backgroundColor: corVerde,
    paddingHorizontal: 23,
    paddingVertical: 12,
    borderRadius: 13,
  },

  botaoLimparTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  espacoFinal: {
    height: 30,
  },

  /* Barra inferior */

  barraContainer: {
    height: 78,
    position: 'relative',
    backgroundColor: '#F7F9F7',
  },

  barra: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: corVerde,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: 67,
    paddingHorizontal: 45,
  },

  botaoNavegacao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  textoNavegacao: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },

  botaoPressionado: {
    opacity: 0.65,
  },

  carrinho: {
    position: 'absolute',
    top: -7,
    left: '50%',
    marginLeft: -31,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: verdeEscuro,
    borderWidth: 4,
    borderColor: '#F7F9F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});