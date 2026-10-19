
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Dados, { type Categoria } from '../rotaServidor/dadosProdutos';

const dados = Dados();
const produtos = dados.produtos;
const categorias = dados.categorias;

const cidades = [
  'Criciúma, SC',
  'Içara, SC',
  'Forquilhinha, SC',
  'Siderópolis, SC',
  'Nova Veneza, SC',
  'Cocal do Sul, SC',
];

const ofertas = produtos.filter(
  (produto) => produto.oferta === true
);

type FotoProps = {
  uri?: string;
  icone: any;
  tamanhoIcone: number;
  corIcone: string;
  estilo: any;
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
    <View style={[estilo, styles.fotoFallback]}>
      <Ionicons
        name={icone}
        size={tamanhoIcone}
        color={corIcone}
      />
    </View>
  );
}

type CardProps = {
  id: string;
  nome: string;
  unidade: string;
  preco: string | number;
  icone: any;
  imagem?: string;
};

function CardOferta({
  id,
  nome,
  unidade,
  preco,
  icone,
  imagem,
}: CardProps) {
  const router = useRouter();

  function formatarPreco(valor: string | number) {
    if (valor === undefined || valor === null || valor === '') {
      return 'Preço indisponível';
    }

    const numero =
      typeof valor === 'number'
        ? valor
        : Number(String(valor).replace(',', '.'));

    if (Number.isNaN(numero)) {
      return `R$ ${valor}`;
    }

    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardProduto,
        pressed && styles.cardProdutoPressionado,
      ]}
      onPress={() =>
        router.push(`/rotas/produtos/${id}` as any)
      }
    >
      <View style={styles.cardImagem}>
        <Foto
          uri={imagem}
          icone={icone}
          tamanhoIcone={42}
          corIcone="#43845A"
          estilo={styles.cardFoto}
        />
      </View>

      <Text style={styles.cardNome} numberOfLines={2}>
        {nome}
      </Text>

      {!!unidade && (
        <Text style={styles.cardUnidade}>
          {unidade}
        </Text>
      )}

      <Text style={styles.cardPreco}>
        {formatarPreco(preco)}
      </Text>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();

  const [busca, setBusca] = useState('');
  const [tituloDalista, setTituloDalista] =
    useState('Ofertas da semana');
  const [categoria, setCategoria] = useState('1');
  const [produtosLista, setProdutosLista] = useState(ofertas);
  const [cidade, setCidade] = useState('Criciúma, SC');
  const [mostrarCidades, setMostrarCidades] = useState(false);

  const buscaRef = useRef<TextInput>(null);

  function atualizarTitulo(
    categoriaSelecionada: Categoria
  ) {
    setCategoria(String(categoriaSelecionada.id));
    setBusca('');
    setTituloDalista(categoriaSelecionada.nome);

    const filtrados = produtos.filter(
      (produto) =>
        String(produto.categoria) ===
        String(categoriaSelecionada.id)
    );

    setProdutosLista(filtrados);
  }

  function pesquisar(texto: string) {
    setBusca(texto);

    if (texto.trim() === '') {
      setTituloDalista('Ofertas da semana');
      setProdutosLista(ofertas);
      return;
    }

    setTituloDalista('Resultados da busca');

    const filtrados = produtos.filter((produto) =>
      produto.nome
        .toLowerCase()
        .includes(texto.trim().toLowerCase())
    );

    setProdutosLista(filtrados);
  }

  function escolherCidade(nome: string) {
    setCidade(nome);
    setMostrarCidades(false);
  }

  function mostrarTodasOfertas() {
    setBusca('');
    setTituloDalista('Ofertas da semana');
    setCategoria('');
    setProdutosLista(ofertas);
    router.push('/ofertas' as any);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* CABEÇALHO */}
        <View style={styles.cabecalho}>
          <View style={styles.cabecalhoTexto}>
            <Text style={styles.ola}>
              Olá, Vitória!
            </Text>

            <Text style={styles.subtitulo}>
              Que bom te ver por aqui!
            </Text>
          </View>

          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={25}
              color="#245D39"
            />
          </View>
        </View>

        {/* LOCALIZAÇÃO */}
        <Pressable
          style={styles.local}
          onPress={() =>
            setMostrarCidades(!mostrarCidades)
          }
        >
          <View style={styles.localIcone}>
            <Ionicons
              name="location-outline"
              size={21}
              color="#2F7548"
            />
          </View>

          <View style={styles.localInformacao}>
            <Text style={styles.localLegenda}>
              Você está em
            </Text>

            <Text style={styles.localTexto}>
              {cidade}
            </Text>
          </View>

          <Ionicons
            name={
              mostrarCidades
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={20}
            color="#245D39"
          />
        </Pressable>

        {mostrarCidades && (
          <View style={styles.listaCidades}>
            {cidades.map((nome) => (
              <Pressable
                key={nome}
                style={[
                  styles.cidadeItem,
                  cidade === nome && styles.cidadeAtiva,
                ]}
                onPress={() => escolherCidade(nome)}
              >
                <Text
                  style={[
                    styles.cidadeTexto,
                    cidade === nome &&
                      styles.cidadeTextoAtiva,
                  ]}
                >
                  {nome}
                </Text>

                {cidade === nome && (
                  <Ionicons
                    name="checkmark-circle"
                    size={19}
                    color="#2F7548"
                  />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* PESQUISA */}
        <Pressable
          style={styles.buscaContainer}
          onPress={() => buscaRef.current?.focus()}
        >
          <Ionicons
            name="search-outline"
            size={22}
            color="#62816A"
          />

          <TextInput
            ref={buscaRef}
            style={styles.buscaInput}
            placeholder="O que você procura?"
            placeholderTextColor="#8A978D"
            value={busca}
            onChangeText={pesquisar}
            returnKeyType="search"
          />

          {busca.length > 0 && (
            <Pressable onPress={() => pesquisar('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color="#8A978D"
              />
            </Pressable>
          )}
        </Pressable>

        {/* CATEGORIAS */}
        <View style={styles.tituloCategorias}>
          <Text style={styles.tituloSecao}>
            Categorias
          </Text>
        </View>

        <FlatList
          horizontal
          data={categorias}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          style={styles.listaCategorias}
          contentContainerStyle={styles.categoriasConteudo}
          renderItem={({ item }) => (
            <Pressable
              style={styles.categoriaItem}
              onPress={() => atualizarTitulo(item)}
            >
              <View
                style={[
                  styles.categoriaIcone,
                  categoria === String(item.id) &&
                    styles.categoriaIconeAtiva,
                ]}
              >
                <Foto
                  uri={(item as any).imagem}
                  icone={
                    (item as any).icone ??
                    'fast-food-outline'
                  }
                  tamanhoIcone={30}
                  corIcone={
                    categoria === String(item.id)
                      ? '#FFFFFF'
                      : '#2F7548'
                  }
                  estilo={styles.categoriaImagem}
                />
              </View>

              <Text
                style={[
                  styles.categoriaTexto,
                  categoria === String(item.id) &&
                    styles.categoriaTextoAtivo,
                ]}
                numberOfLines={1}
              >
                {item.nome}
              </Text>
            </Pressable>
          )}
        />

        {/* TÍTULO E VER MAIS */}
        <View style={styles.ofertasTopo}>
          <View style={styles.ofertasTituloContainer}>
            <Text style={styles.tituloSecao}>
              {tituloDalista}
            </Text>

            <Text style={styles.ofertasSubtitulo}>
              Encontre os melhores preços para você
            </Text>
          </View>

          <Pressable
            style={styles.verMais}
            onPress={mostrarTodasOfertas}
          >
            <Text style={styles.verMaisTexto}>
              Ver mais
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#2F7548"
            />
          </Pressable>
        </View>

        {/* PRODUTOS */}
        <FlatList
          horizontal
          data={produtosLista}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.produtosConteudo}
          ListEmptyComponent={
            <View style={styles.vazioContainer}>
              <Ionicons
                name="search-outline"
                size={32}
                color="#8BA393"
              />

              <Text style={styles.vazioTitulo}>
                Nenhum produto encontrado
              </Text>

              <Text style={styles.vazioTexto}>
                Tente buscar por outro nome ou categoria.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <CardOferta
              id={String(item.id)}
              nome={item.nome}
              unidade={item.unidade}
              preco={item.preco}
              icone={
                (item as any).icone ?? 'basket-outline'
              }
              imagem={(item as any).imagem}
            />
          )}
        />

        <View style={styles.espacoFinal} />
      </ScrollView>

      {/* NAVEGAÇÃO INFERIOR */}
      <View style={styles.barraContainer}>
        <View style={styles.barra}>
          <Pressable
            style={styles.botaoNavegacao}
            onPress={() => router.push('/home' as any)}
          >
            <Ionicons
              name="home"
              size={24}
              color="#FFFFFF"
            />

            <Text style={styles.textoNavegacaoAtivo}>
              Início
            </Text>
          </Pressable>

          <Pressable
            style={styles.botaoNavegacao}
            onPress={() => router.push('/perfil' as any)}
          >
            <Ionicons
              name="person-outline"
              size={23}
              color="#D7E9DC"
            />

            <Text style={styles.textoNavegacao}>
              Perfil
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.carrinho}
          onPress={() => router.push('/carrinho' as any)}
        >
          <Ionicons
            name="cart-outline"
            size={31}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },

  scroll: {
    flex: 1,
  },

  conteudo: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  cabecalhoTexto: {
    flex: 1,
  },

  ola: {
    fontSize: 28,
    fontWeight: '800',
    color: '#193D29',
    letterSpacing: -0.6,
  },

  subtitulo: {
    fontSize: 15,
    color: '#718076',
    marginTop: 5,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: '#E4F0E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  local: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8EEE9',
  },

  localIcone: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  localInformacao: {
    flex: 1,
  },

  localLegenda: {
    fontSize: 12,
    color: '#839087',
    marginBottom: 3,
  },

  localTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#193D29',
  },

  listaCidades: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 7,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8EEE9',
  },

  cidadeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  cidadeAtiva: {
    backgroundColor: '#EAF4EC',
  },

  cidadeTexto: {
    color: '#42564A',
    fontSize: 14,
  },

  cidadeTextoAtiva: {
    color: '#245D39',
    fontWeight: '700',
  },

  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 15,
    height: 54,
    borderWidth: 1,
    borderColor: '#E5ECE6',
    marginBottom: 25,
  },

  buscaInput: {
    flex: 1,
    marginLeft: 10,
    color: '#193D29',
    fontSize: 15,
    height: '100%',
  },

  tituloCategorias: {
    marginBottom: 14,
  },

  tituloSecao: {
    color: '#193D29',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  listaCategorias: {
    marginHorizontal: -20,
    marginBottom: 27,
  },

  categoriasConteudo: {
    paddingHorizontal: 20,
    gap: 15,
  },

  categoriaItem: {
    alignItems: 'center',
    width: 76,
  },

  categoriaIcone: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: '#E8F2EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  categoriaIconeAtiva: {
    backgroundColor: '#2F7548',
  },

  categoriaImagem: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },

  fotoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoriaTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7D70',
    textAlign: 'center',
  },

  categoriaTextoAtivo: {
    color: '#245D39',
    fontWeight: '800',
  },

  ofertasTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
    gap: 8,
  },

  ofertasTituloContainer: {
    flex: 1,
    flexShrink: 1,
  },

  ofertasSubtitulo: {
    color: '#829087',
    fontSize: 12,
    marginTop: 5,
  },

  verMais: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingVertical: 8,
    paddingLeft: 6,
  },

  verMaisTexto: {
    color: '#2F7548',
    fontSize: 14,
    fontWeight: '700',
  },

  produtosConteudo: {
    paddingBottom: 10,
    paddingRight: 4,
    gap: 14,
  },

  cardProduto: {
    width: 158,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9EFEA',
    shadowColor: '#193D29',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  cardProdutoPressionado: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  cardImagem: {
    height: 112,
    backgroundColor: '#F0F6F1',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },

  cardFoto: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },

  cardNome: {
    color: '#243C2D',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    minHeight: 38,
  },

  cardUnidade: {
    color: '#89948C',
    fontSize: 12,
    marginTop: 5,
  },

  cardPreco: {
    color: '#2F7548',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 9,
  },

  vazioContainer: {
    width: 300,
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8EEE9',
  },

  vazioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#365342',
    marginTop: 10,
    textAlign: 'center',
  },

  vazioTexto: {
    fontSize: 13,
    color: '#849087',
    marginTop: 5,
    textAlign: 'center',
  },

  espacoFinal: {
    height: 25,
  },

  barraContainer: {
    height: 76,
    backgroundColor: '#2F7548',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 22,
    paddingBottom: 8,
  },

  barra: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  botaoNavegacao: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 65,
    gap: 3,
  },

  textoNavegacaoAtivo: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  textoNavegacao: {
    color: '#D7E9DC',
    fontSize: 11,
    fontWeight: '500',
  },

  carrinho: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#245D39',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 3,
    borderColor: '#F7F9F7',
    marginTop: -20,
  },
});
