import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/* ---------- Dados ---------- */
const categorias = [
  { id: '1', nome: 'Todas', icone: 'apps-outline' },
  { id: '2', nome: 'Hortifruti', icone: 'leaf-outline' },
  { id: '3', nome: 'Bebidas', icone: 'wine-outline' },
  { id: '4', nome: 'Alimentos', icone: 'restaurant-outline' },
];

const ofertas = [
  { id: '1', nome: 'Banana nanica', unidade: 'Kg', preco: 'R$ 3,49', icone: 'nutrition-outline' },
  { id: '2', nome: 'Leite integral', unidade: '1L', preco: 'R$ 4,99', icone: 'water-outline' },
  { id: '3', nome: 'Morango', unidade: 'Kg', preco: 'R$ 8,99', icone: 'nutrition-outline' },
  { id: '4', nome: 'Arroz branco', unidade: '5Kg', preco: 'R$ 24,90', icone: 'restaurant-outline' },
];

/* ---------- Componente do card de oferta ---------- */
type CardProps = {
  nome: string;
  unidade: string;
  preco: string;
  icone: any;
};

function CardOferta({ nome, unidade, preco, icone }: CardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardImagem}>
        <Ionicons name={icone} size={70} color="#41805a" />
      </View>
      <Text style={styles.cardNome}>{nome}</Text>
      <Text style={styles.cardUnidade}>{unidade}</Text>
      <Text style={styles.cardPreco}>{preco}</Text>
    </View>
  );
}

/* ---------- Tela ---------- */
export default function Home() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('1');
  const buscaRef = useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      <View style={styles.conteudo}>
        {/* Saudação */}
        <Text style={styles.ola}>Olá, Vitória!</Text>
        <Text style={styles.subtitulo}>Que bom te ver por aqui!</Text>

        {/* Localização */}
        <Pressable style={styles.local}>
          <Ionicons name="location" size={28} color="#2f7a4b" />
          <Text style={styles.localTexto}>Criciúma, SC</Text>
          <Ionicons name="chevron-forward" size={26} color="#2f7a4b" />
        </Pressable>

        {/* Busca */}
        <Pressable style={styles.busca} onPress={() => buscaRef.current?.focus()}>
          <Ionicons name="search" size={26} color="#2f7a4b" />
          <TextInput
            ref={buscaRef}
            style={styles.buscaInput}
            placeholder="O que você procura?"
            placeholderTextColor="#444"
            value={busca}
            onChangeText={setBusca}
          />
        </Pressable>

        {/* Categorias */}
        <FlatList
          style={styles.listaCategorias}
          data={categorias}
          keyExtractor={(item) => item.id}
          horizontal={true}
          renderItem={({ item }) => (
            <Pressable style={styles.categoria} onPress={() => setCategoria(item.id)}>
              <View
                style={[
                  styles.categoriaIcone,
                  categoria === item.id && styles.categoriaIconeAtiva,
                ]}
              >
                <Ionicons
                  name={item.icone as any}
                  size={40}
                  color={categoria === item.id ? '#fff' : '#2f7a4b'}
                />
              </View>
              <Text style={styles.categoriaTexto}>{item.nome}</Text>
            </Pressable>
          )}
        />

        {/* Ofertas da semana */}
        <View style={styles.ofertasTopo}>
          <Text style={styles.ofertasTitulo}>Ofertas da semana</Text>
          <Pressable>
            <Text style={styles.verMais}>Ver mais</Text>
          </Pressable>
        </View>

        {/* Carrossel */}
        <FlatList
          data={ofertas}
          keyExtractor={(item) => item.id}
          horizontal={true}
          renderItem={({ item }) => (
            <CardOferta
              nome={item.nome}
              unidade={item.unidade}
              preco={item.preco}
              icone={item.icone}
            />
          )}
        />
      </View>

      {/* Barra de baixo */}
      <View style={styles.barra}>
        <Pressable onPress={() => router.push('/home')}>
          <Ionicons name="home" size={40} color="#fff" />
        </Pressable>

        <Pressable style={styles.carrinho} onPress={() => router.push('/')}>
          <Ionicons name="cart-outline" size={44} color="#fff" />
        </Pressable>

        <Pressable onPress={() => router.push('/')}>
          <Ionicons name="person" size={40} color="#fff" />
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
    paddingTop: 50,
  },
  ola: {
    fontSize: 28,
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
  },
  categoriaIconeAtiva: {
    backgroundColor: '#41805a',
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
    width: 142,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 8,
    marginRight: 14,
  },
  cardImagem: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 8,
    marginBottom: 4,
  },
  barra: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#41805a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 70,
  },
  carrinho: {
    position: 'absolute',
    top: -36,
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