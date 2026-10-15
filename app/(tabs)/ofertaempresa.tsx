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

const ofertas = [
  {
    id: '1',
    nome: 'Arroz branco 5 kg',
    antigo: 'R$ 29,90',
    novo: 'R$ 24,90',
    desconto: '17% OFF',
    icone: 'basket-outline' as const,
  },
  {
    id: '2',
    nome: 'Leite integral 1 L',
    antigo: 'R$ 5,49',
    novo: 'R$ 4,79',
    desconto: '13% OFF',
    icone: 'water-outline' as const,
  },
  {
    id: '3',
    nome: 'Óleo de soja 900 ml',
    antigo: 'R$ 8,99',
    novo: 'R$ 7,49',
    desconto: '17% OFF',
    icone: 'flask-outline' as const,
  },
  {
    id: '4',
    nome: 'Café tradicional 500 g',
    antigo: 'R$ 22,90',
    novo: 'R$ 18,90',
    desconto: '17% OFF',
    icone: 'cafe-outline' as const,
  },
];

export default function OfertasEmpresa() {
  const router = useRouter();
  const [busca, setBusca] = useState('');

  const lista = ofertas.filter((oferta) =>
    oferta.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={ESCURO} />

      <View style={styles.cabecalho}>
        <Pressable onPress={() => router.push('/homeempresa' as any)}>
          <Ionicons name="arrow-back" size={25} color="#FFFFFF" />
        </Pressable>

        <View style={styles.titulos}>
          <Text style={styles.titulo}>Minhas ofertas</Text>
          <Text style={styles.subtitulo}>Seus produtos em promoção</Text>
        </View>
      </View>

      <View style={styles.conteudo}>
        <View style={styles.pesquisa}>
          <Ionicons name="search-outline" size={21} color="#849087" />
          <TextInput
            style={styles.input}
            placeholder="Buscar oferta..."
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
          <Text style={styles.tituloLista}>Ofertas</Text>

          <Pressable
            style={styles.botaoAdicionar}
            onPress={() => router.push('/rotas/ofertas/criar' as any)}
          >
            <Ionicons name="add" size={23} color="#FFFFFF" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {lista.map((oferta) => (
            <View key={oferta.id} style={styles.card}>
              <View style={styles.iconeProduto}>
                <Ionicons name={oferta.icone} size={27} color={VERDE} />
              </View>

              <View style={styles.informacao}>
                <Text style={styles.nome}>{oferta.nome}</Text>

                <View style={styles.precos}>
                  <Text style={styles.antigo}>{oferta.antigo}</Text>
                  <Text style={styles.novo}>{oferta.novo}</Text>
                </View>
              </View>

              <View style={styles.desconto}>
                <Text style={styles.descontoTexto}>{oferta.desconto}</Text>
              </View>
            </View>
          ))}

          {lista.length === 0 && (
            <Text style={styles.vazio}>Nenhuma oferta encontrada.</Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.navegacao}>
        <Pressable style={styles.itemNav} onPress={() => router.push('/homeempresa' as any)}>
          <Ionicons name="home-outline" size={23} color="#D9E9DD" />
          <Text style={styles.textoNav}>Início</Text>
        </Pressable>

        <Pressable style={styles.itemNav} onPress={() => router.push('/produtosempresa' as any)}>
          <Ionicons name="cube-outline" size={23} color="#D9E9DD" />
          <Text style={styles.textoNav}>Produtos</Text>
        </Pressable>

        <View style={styles.itemNav}>
          <Ionicons name="pricetag" size={23} color="#FFFFFF" />
          <Text style={styles.textoAtivo}>Ofertas</Text>
        </View>

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
    gap: 11,
  },
  iconeProduto: {
    width: 53,
    height: 56,
    borderRadius: 15,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  informacao: { flex: 1, gap: 7 },
  nome: { fontSize: 13, fontWeight: '600', color: '#294531' },
  precos: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  antigo: {
    fontSize: 11,
    color: '#929B94',
    textDecorationLine: 'line-through',
  },
  novo: { fontSize: 16, fontWeight: 'bold', color: VERDE },
  desconto: {
    backgroundColor: '#E5F2E8',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  descontoTexto: { color: VERDE, fontSize: 10, fontWeight: 'bold' },
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