
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
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
const USUARIOS_STORAGE_KEY = '@banco_usuarios';

const EMPRESAS_FIXAS: Record<string, string> = {};

function montarMapaEmpresas(json: string | null) {
  const mapa: Record<string, string> = { ...EMPRESAS_FIXAS };

  if (!json) {
    return mapa;
  }

  try {
    const lista: unknown = JSON.parse(json);

    if (Array.isArray(lista)) {
      for (const u of lista) {
        if (
          u &&
          typeof u === 'object' &&
          'id' in u &&
          'nome' in u &&
          u.id != null &&
          typeof u.nome === 'string'
        ) {
          mapa[String(u.id)] = u.nome;
        }
      }
    }
  } catch (erro) {
    console.error('Erro ao ler usuários:', erro);
  }

  return mapa;
}

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
  precoOferta?: number;
  icone: any;
  imagem?: string;
  oferta?: boolean;
  empresaNome: string;
};

function CardProduto({
  id,
  nome,
  unidade,
  preco,
  precoOferta,
  icone,
  imagem,
  oferta,
  empresaNome,
}: CardProps) {
  const router = useRouter();

  // Só considera promoção válida quando o preço promocional
  // existe, é positivo e é menor que o preço original.
  const temOferta =
    oferta === true &&
    typeof precoOferta === 'number' &&
    Number.isFinite(precoOferta) &&
    precoOferta > 0 &&
    precoOferta < preco;

  const precoExibido = temOferta ? precoOferta : preco;

  function formatarPreco(valor: number) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

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

        {temOferta && (
          <View style={styles.seloOferta}>
            <Ionicons
              name="pricetag"
              size={11}
              color="#FFFFFF"
            />

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
        </Text>

        <View style={styles.cardEmpresaLinha}>
          <Ionicons
            name="storefront-outline"
            size={13}
            color={corVerde}
          />

          <Text
            style={styles.cardEmpresa}
            numberOfLines={1}
          >
            {empresaNome}
          </Text>
        </View>

        <Text
          style={styles.cardUnidade}
          numberOfLines={1}
        >
          {unidade}
        </Text>

        {/* Preço original riscado quando existe uma oferta */}
        {temOferta && (
          <Text style={styles.cardPrecoOriginal}>
            {formatarPreco(preco)}
          </Text>
        )}

        {/* Mostra o preço promocional em destaque */}
        <Text
          style={[
            styles.cardPreco,
            temOferta && styles.cardPrecoPromocional,
          ]}
        >
          {formatarPreco(precoExibido)}
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

  const [filtroOferta, setFiltroOferta] = useState<
    'todos' | 'ofertas'
  >('ofertas');

  const [produtos, setProdutos] = useState<Produto[]>(
    dados.produtos
  );

  const [carregandoProdutos, setCarregandoProdutos] =
    useState(true);

  const [empresas, setEmpresas] = useState<Record<string, string>>(
    EMPRESAS_FIXAS
  );

  const {
    usuario,
    carregando,
    autorizado,
  } = useAutenticacao('cliente');

  /* ---------- Carregar produtos e empresas ---------- */

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarProdutos() {
        try {
          const produtosSalvos = await AsyncStorage.getItem(
            PRODUTOS_STORAGE_KEY
          );

          let produtosCarregados: Produto[] = dados.produtos;

          if (produtosSalvos) {
            const parseados: unknown = JSON.parse(produtosSalvos);

            if (Array.isArray(parseados)) {
              // Filtra registros inválidos sem descartar a lista inteira.
              produtosCarregados = parseados.filter(isProduto);
            }
          }

          const usuariosSalvos = await AsyncStorage.getItem(
            USUARIOS_STORAGE_KEY
          );

          const mapaEmpresas = montarMapaEmpresas(usuariosSalvos);

          if (ativo) {
            setProdutos(produtosCarregados);
            setEmpresas(mapaEmpresas);
          }
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);

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
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    if (modoLista === 'busca') {
      return produto.nome.toLocaleLowerCase('pt-BR').includes(termo);
    }

    if (modoLista === 'ofertas') {
      return (
        produto.oferta === true &&
        typeof produto.precoOferta === 'number' &&
        produto.precoOferta > 0 &&
        produto.precoOferta < produto.preco
      );
    }

    if (modoLista === 'todos') {
      if (filtroOferta === 'ofertas') {
        return (
          produto.oferta === true &&
          typeof produto.precoOferta === 'number' &&
          produto.precoOferta > 0 &&
          produto.precoOferta < produto.preco
        );
      }

      return true;
    }

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

      if (filtroOferta === 'ofertas') {
        return (
          produto.oferta === true &&
          typeof produto.precoOferta === 'number' &&
          produto.precoOferta > 0 &&
          produto.precoOferta < produto.preco
        );
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

  /* ---------- Grade de produtos ---------- */

  const dadosGrade: (Produto | null)[] =
    produtosLista.length % 2 === 1
      ? [...produtosLista, null]
      : produtosLista;

  /* ---------- Cabeçalho da lista ---------- */

  const cabecalhoLista = (
    <>
      <View style={styles.cabecalho}>
        <Text style={styles.ola}>
          Olá, {usuario?.nome?.split(' ')[0] || 'tudo bem'}!
        </Text>

        <Text style={styles.subtitulo}>
          Encontre os melhores preços para você.
        </Text>
      </View>

      {/* Pesquisa */}

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
                    selecionada && styles.categoriaIconeAtiva,
                  ]}
                >
                  <Foto
                    icone={item.icone}
                    tamanhoIcone={29}
                    corIcone={selecionada ? '#fff' : corVerde}
                  />
                </View>

                <Text
                  style={[
                    styles.categoriaTexto,
                    selecionada && styles.categoriaTextoAtiva,
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

      {(modoLista === 'todos' || modoLista === 'categoria') && (
        <View style={styles.filtroContainer}>
          <Pressable
            style={[
              styles.filtroBotao,
              filtroOferta === 'todos' && styles.filtroBotaoAtivo,
            ]}
            onPress={() => selecionarFiltro('todos')}
          >
            <Ionicons
              name="grid-outline"
              size={17}
              color={filtroOferta === 'todos' ? '#fff' : verdeEscuro}
            />

            <Text
              style={[
                styles.filtroTexto,
                filtroOferta === 'todos' && styles.filtroTextoAtivo,
              ]}
            >
              Todos
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filtroBotao,
              filtroOferta === 'ofertas' && styles.filtroBotaoAtivo,
            ]}
            onPress={() => selecionarFiltro('ofertas')}
          >
            <Ionicons
              name="pricetag-outline"
              size={17}
              color={filtroOferta === 'ofertas' ? '#fff' : verdeEscuro}
            />

            <Text
              style={[
                styles.filtroTexto,
                filtroOferta === 'ofertas' && styles.filtroTextoAtivo,
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
            (modoLista !== 'busca' && filtroOferta === 'ofertas')
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
    </>
  );

  /* ---------- Lista vazia / carregando ---------- */

  const estadoVazioLista = carregandoProdutos ? (
    <View style={styles.estadoVazio}>
      <ActivityIndicator size="large" color={corVerde} />

      <Text style={styles.estadoVazioTexto}>
        Carregando produtos...
      </Text>
    </View>
  ) : (
    <View style={styles.estadoVazio}>
      <View style={styles.estadoVazioIcone}>
        <Ionicons
          name={
            filtroOferta === 'ofertas' && modoLista !== 'busca'
              ? 'pricetag-outline'
              : 'search-outline'
          }
          size={38}
          color={corVerde}
        />
      </View>

      <Text style={styles.estadoVazioTitulo}>
        {filtroOferta === 'ofertas' && modoLista !== 'busca'
          ? 'Nenhuma oferta encontrada'
          : 'Nenhum produto encontrado'}
      </Text>

      <Text style={styles.estadoVazioTexto}>
        {filtroOferta === 'ofertas' && modoLista !== 'busca'
          ? 'Ainda não há ofertas cadastradas nesta seleção.'
          : 'Tente escolher outra categoria ou pesquisar outro nome.'}
      </Text>

      {filtroOferta === 'ofertas' && modoLista !== 'busca' && (
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
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        data={carregandoProdutos ? [] : dadosGrade}
        keyExtractor={(item, indice) =>
          item ? String(item.id) : `espacador-${indice}`
        }
        numColumns={2}
        columnWrapperStyle={styles.linhaProdutos}
        renderItem={({ item }) =>
          item ? (
            <CardProduto
              id={String(item.id)}
              nome={item.nome}
              unidade={item.unidade}
              preco={item.preco}
              precoOferta={item.precoOferta}
              icone={item.icone}
              imagem={item.imagem}
              oferta={item.oferta === true}
              empresaNome={
                empresas[String(item.empresa)] ??
                'Empresa não informada'
              }
            />
          ) : (
            <View style={styles.cardEspacador} />
          )
        }
        ListHeaderComponent={cabecalhoLista}
        ListEmptyComponent={estadoVazioLista}
        ListFooterComponent={<View style={styles.espacoFinal} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

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
            <Ionicons name="home" size={27} color="#fff" />

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
            <Ionicons name="person-outline" size={27} color="#fff" />

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
          <Ionicons name="cart-outline" size={31} color="#fff" />
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

  /* Filtro */

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

  linhaProdutos: {
    gap: 12,
    marginBottom: 13,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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

  cardEmpresaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },

  cardEmpresa: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: corVerde,
  },

  cardUnidade: {
    fontSize: 12,
    color: '#858B85',
    marginTop: 4,
  },

  /* Preços */

  cardPrecoOriginal: {
    fontSize: 12,
    color: '#929A93',
    textDecorationLine: 'line-through',
    marginTop: 8,
  },

  cardPreco: {
    fontSize: 19,
    fontWeight: '800',
    color: verdeEscuro,
    marginTop: 9,
  },

  cardPrecoPromocional: {
    color: '#218044',
    fontSize: 21,
    marginTop: 2,
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
