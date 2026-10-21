import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Image } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Dados, { type Categoria } from '../rotaServidor/dadosProdutos';
import AutenticaTelas, { useAutenticacao } from '@/app/components/autenticaTelas';

/* ---------- Dados ---------- */
// Cole o link da foto em "imagem". Se ficar vazio ('') ou o link falhar, aparece o ícone.

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
  (produto) => produto.oferta == true
);


/* ---------- Imagem com fallback para ícone ---------- */
type FotoProps = {
  uri?: string;
  icone: any;
  tamanhoIcone: number;
  corIcone: string;
  estilo: any;
};

function Foto({ uri, icone, tamanhoIcone, corIcone, estilo }: FotoProps) {
  const [erro, setErro] = useState(false);


  if (uri && !erro) {
    return <Image source={{ uri }} style={estilo} onError={() => setErro(true)} />;
  }
  return <Ionicons name={icone} size={tamanhoIcone} color={corIcone} />;
}

/* ---------- Componente do card de oferta ---------- */
type CardProps = {
  id: string;
  nome: string;
  unidade: string;
  preco: string;
  icone: any;
  imagem?: string;
};

function CardOferta({ id, nome, unidade, preco, icone, imagem }: CardProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <Pressable onPress={() => router.push(`/rotas/produtos/${id}`)}>
        <View style={styles.cardImagem}>
          <Foto
            uri={imagem}
            icone={icone}
            tamanhoIcone={70}
            corIcone="#41805a"
            estilo={styles.cardFoto}
          />
        </View>
        <View>
          <Text style={styles.cardNome} numberOfLines={1} ellipsizeMode="tail">
            {nome && nome.length > 14 ? `${nome.substring(0, 14)}...` : nome}
          </Text>
          <Text style={styles.cardUnidade}>
            {unidade}
            <Text style={styles.cardPreco}> R$ {preco}</Text>
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

/* ---------- Tela ---------- */
export default function Home() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [tituloDalista, setTituloDalista] = useState('Ofertas da semana');
  const [categoria, setCategoria] = useState('1');
  const buscaRef = useRef<TextInput>(null);
  const [produtosLista, setProdutosLista] = useState(ofertas);
  const [cidade, setCidade] = useState('Criciúma, SC');
  const [mostrarCidades, setMostrarCidades] = useState(false);

  const { usuario, carregando, autorizado } = useAutenticacao('cliente');
  if (carregando || !autorizado) {
    return null;
  }

  function atualizarTitulo(categoriaSelecionada: Categoria) {
    setCategoria(categoriaSelecionada.id);
    setTituloDalista(categoriaSelecionada.nome);
    const produtosCategoria = produtos.filter(
      (produto) => produto.categoria == categoriaSelecionada.id
    );
    setProdutosLista(produtosCategoria);
  }

  function pesquisar(texto: string) {
    setBusca(texto);

    if (texto === '') {
      setTituloDalista('Ofertas da semana');
      setProdutosLista(ofertas);
      return;
    }

    setTituloDalista('Resultados');
    const resultado = produtos.filter(
      (produto) => produto.nome.toLowerCase().includes(texto.toLowerCase())
    );
    setProdutosLista(resultado);
  }

  function escolherCidade(nome: string) {
    setCidade(nome);
    setMostrarCidades(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.conteudo}>
        {/* Saudação */}
        <Text style={styles.ola}>Olá, {usuario?.nome}!</Text>
        <Text style={styles.subtitulo}>Que bom te ver por aqui!</Text>

        {/* Localização */}
        <Pressable style={styles.local} onPress={() => setMostrarCidades(!mostrarCidades)}>
          <Ionicons name="location" size={28} color="#2f7a4b" />
          <Text style={styles.localTexto}>{cidade}</Text>
          <Ionicons
            name={mostrarCidades ? 'chevron-down' : 'chevron-forward'}
            size={26}
            color="#2f7a4b"
          />
        </Pressable>

        {/* Janela com as cidades */}
        {mostrarCidades && (
          <View style={styles.listaCidades}>
            {cidades.map((nome) => (
              <Pressable
                key={nome}
                style={[styles.cidadeItem, nome === cidade && styles.cidadeItemAtiva]}
                onPress={() => escolherCidade(nome)}
              >
                <Text style={styles.cidadeTexto}>{nome}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Busca */}
        <Pressable style={styles.busca} onPress={() => buscaRef.current?.focus()}>
          <Ionicons name="search" size={26} color="#2f7a4b" />
          <TextInput
            ref={buscaRef}
            style={styles.buscaInput}
            placeholder="O que você procura?"
            placeholderTextColor="#444"
            value={busca}
            onChangeText={pesquisar}
          />
        </Pressable>

        {/* Categorias */}
        <FlatList
          style={styles.listaCategorias}
          data={categorias}
          keyExtractor={(item) => item.id}
          horizontal={true}
          renderItem={({ item }) => (
            <Pressable style={styles.categoria} onPress={() => atualizarTitulo(item)}>
              <View
                style={[
                  styles.categoriaIcone,
                  categoria === item.id && styles.categoriaIconeAtiva,
                ]}
              >
                <Foto
                  uri={item.imagem}
                  icone={item.icone}
                  tamanhoIcone={40}
                  corIcone={categoria === item.id ? '#fff' : '#2f7a4b'}
                  estilo={styles.categoriaImagem}
                />
              </View>
              <Text style={styles.categoriaTexto}>{item.nome}</Text>
            </Pressable>
          )}
        />

        {/* Ofertas da semana */}
        <View style={styles.ofertasTopo}>
          <Text style={styles.ofertasTitulo}>{tituloDalista}</Text>

        </View>

        {/* Carrossel */}
        <FlatList
          data={produtosLista}
          keyExtractor={(item) => item.id}
          horizontal={true}
          renderItem={({ item }) => (
            <CardOferta
              id={item.id}
              nome={item.nome}
              unidade={item.unidade}
              preco={item.preco}
              icone={item.icone}
              imagem={item.imagem}
            />
          )}
        />
      </View>

      {/* Barra de baixo */}
      <View style={styles.barraContainer}>
        <View style={styles.barra}>
          <Pressable
            hitSlop={10}
            style={({ pressed }) => pressed && styles.botaoPressionado}
            onPress={() => router.push('/home')}
          >
            <Ionicons name="home" size={40} color="#fff" />
          </Pressable>

          <Pressable
            hitSlop={10}
            style={({ pressed }) => pressed && styles.botaoPressionado}
            onPress={() => router.push('/perfil' as any)}
          >
            <Ionicons name="person" size={40} color="#fff" />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.carrinho, pressed && styles.botaoPressionado]}
          onPress={() => router.push('/carrinho' as any)}
        >
          <Ionicons name="cart-outline" size={44} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  conteudo: {
    flex: 1,
    paddingLeft: 20,
    paddingTop: 5,
  },
  ola: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitulo: {
    fontSize: 16,
    color: '#222',
    marginBottom: 16,
  },
  local: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcefe3',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    marginRight: 20,
    marginBottom: 16,
  },
  localTexto: {
    flex: 1,
    fontSize: 18,
    color: '#1f4d2e',
    marginLeft: 16,
  },
  listaCidades: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2f7a4b',
    borderRadius: 14,
    marginRight: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cidadeItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dcefe3',
  },
  cidadeItemAtiva: {
    backgroundColor: '#dcefe3',
  },
  cidadeTexto: {
    fontSize: 16,
    color: '#1f4d2e',
  },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 25,
    height: 46,
    paddingHorizontal: 16,
    marginRight: 20,
    marginBottom: 16,
  },
  buscaInput: {
    flex: 1,
    height: 46,
    fontSize: 17,
    color: '#222',
    marginLeft: 16,
  },
  listaCategorias: {
    flexGrow: 0,
    marginBottom: 12,
  },
  categoria: {
    alignItems: 'center',
    marginRight: 12,
  },
  categoriaIcone: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#dcefe3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  categoriaIconeAtiva: {
    backgroundColor: '#41805a',
  },
  categoriaImagem: {
    width: 78,
    height: 78,
    resizeMode: 'cover',
  },
  categoriaTexto: {
    fontSize: 15,
    color: '#222',
  },
  ofertasTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 20,
    marginBottom: 12,
  },
  ofertasTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  verMais: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2f7a4b',
  },
  card: {
    height: 180,
    width: 140,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 8,
    marginRight: 5,
  },
  cardImagem: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFoto: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  cardNome: {
    fontSize: 16,
    color: '#000',
  },
  cardUnidade: {
    fontSize: 15,
    color: '#777',
  },
  cardPreco: {
    fontSize: 20,
    color: '#2f7a4b',
    textAlign: 'center',
  },
  barraContainer: {
    height: 106,
  },
  barra: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#41805a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 70,
  },
  botaoPressionado: {
    opacity: 0.6,
  },
  carrinho: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#41805a',
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});