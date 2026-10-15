import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const VERDE = '#3D8054';
const ESCURO = '#245D39';

const produtos = [
  { id: '1', nome: 'Arroz branco 5 kg', preco: 'R$ 24,90', icone: 'basket-outline' as const },
  { id: '2', nome: 'Leite integral 1 L', preco: 'R$ 4,79', icone: 'water-outline' as const },
  { id: '3', nome: 'Óleo de soja 900 ml', preco: 'R$ 7,49', icone: 'flask-outline' as const },
  { id: '4', nome: 'Café tradicional 500 g', preco: 'R$ 18,90', icone: 'cafe-outline' as const },
  { id: '5', nome: 'Detergente 500 ml', preco: 'R$ 2,99', icone: 'sparkles-outline' as const },
];

export default function ProdutosEmpresa() {
  const router = useRouter();
  const [busca, setBusca] = useState('');

  const lista = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={ESCURO} />

      <View style={styles.cabecalho}>
        <Pressable onPress={() => router.push('/homeempresa' as any)}>
          <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
        </Pressable>

        <View style={styles.titulos}>
          <Text style={styles.titulo}>Meus produtos</Text>
          <Text style={styles.subtitulo}>Gerencie seus produtos</Text>
        </View>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.pesquisa}>
          <Ionicons name="search-outline" size={21} color="#849087" />
          <TextInput
            style={styles.input}
            placeholder="Buscar produto..."
            placeholderTextColor="#929C94"
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <Pressable onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={20} color="#849087" />
            </Pressable>
          )}
        </View>

        <View style={styles.linhaTitulo}>
          <Text style={styles.tituloLista}>Produtos</Text>

          <Pressable
            style={styles.botaoAdicionar}
            onPress={() => router.push('/rotas/produtos' as any)}
          >
            <Ionicons name="add" size={23} color="#FFFFFF" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {lista.map((produto) => (
            <Pressable
              key={produto.id}
              style={styles.card}
              onPress={() =>
                router.push(`/rotas/produtos/${produto.id}` as any)
              }
            >
              <View style={styles.iconeProduto}>
                <Ionicons name={produto.icone} size={27} color={VERDE} />
              </View>

              <View style={styles.informacao}>
                <Text style={styles.nome}>{produto.nome}</Text>
                <Text style={styles.preco}>{produto.preco}</Text>
              </View>

              <Ionicons name="chevron-forward" size={21} color="#98A198" />
            </Pressable>
          ))}

          {lista.length === 0 && (
            <Text style={styles.vazio}>Nenhum produto encontrado.</Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.navegacao}>
        <Pressable style={styles.itemNav} onPress={() => router.push('/homeempresa' as any)}>
          <Ionicons name="home-outline" size={23} color="#D9E9DD" />
          <Text style={styles.textoNav}>Início</Text>
        </Pressable>

        <View style={styles.itemNav}>
          <Ionicons name="cube" size={23} color="#FFFFFF" />
          <Text style={styles.textoAtivo}>Produtos</Text>
        </View>

        <Pressable style={styles.itemNav} onPress={() => router.push('/ofertasempresa' as any)}>
          <Ionicons name="pricetag-outline" size={23} color="#D9E9DD" />
          <Text style={styles.textoNav}>Ofertas</Text>
        </Pressable>

        <Pressable style={styles.itemNav} onPress={() => router.push('/perfil' as any)}>
          <Ionicons name="person-outline" size={23} color="#D9E9DD" />
          <Text style={styles.textoNav}>Perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9F7' },

  cabecalho: {
    backgroundColor: ESCURO,
    paddingTop: 57,
    paddingHorizontal: 23,
    paddingBottom: 27,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
  },
  titulos: { flex: 1 },
  titulo: { fontSize: 25, fontWeight: 'bold', color: '#FFFFFF' },
  subtitulo: { fontSize: 13, color: '#D9E9DD', marginTop: 5 },

  conteudo: { flex: 1, paddingHorizontal: 20, paddingTop: 22 },

  pesquisa: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EBE6',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 24,
  },
  input: { flex: 1, color: ESCURO, fontSize: 14 },

  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tituloLista: { fontSize: 21, fontWeight: 'bold', color: ESCURO },
  botaoAdicionar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: VERDE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E8EDE8',
    padding: 12,
    marginBottom: 11,
    gap: 13,
  },
  iconeProduto: {
    width: 56,
    height: 56,
    borderRadius: 15,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  informacao: { flex: 1, gap: 6 },
  nome: { fontSize: 14, fontWeight: '600', color: '#294531' },
  preco: { fontSize: 16, fontWeight: 'bold', color: VERDE },
  vazio: { textAlign: 'center', color: '#7B887F', marginTop: 35 },

  navegacao: {
    height: 73,
    backgroundColor: ESCURO,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    paddingBottom: 4,
  },
  itemNav: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  textoNav: { fontSize: 10, color: '#D9E9DD' },
  textoAtivo: { fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' },
});