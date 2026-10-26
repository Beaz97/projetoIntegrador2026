
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAutenticacao } from '@/app/components/autenticaTelas';
import Dados from '../rotaServidor/dadosProdutos';

const VERDE = '#3D8054';
const VERDE_ESCURO = '#245D39';
const FUNDO = '#F7F9F7';

type MenuCardProps = {
  titulo: string;
  descricao: string;
  icone: keyof typeof Ionicons.glyphMap;
  corFundo: string;
  onPress: () => void;
};

function MenuCard({
  titulo,
  descricao,
  icone,
  corFundo,
  onPress,
}: MenuCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: corFundo },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${descricao}`}
    >
      <View style={styles.cardTopo}>
        <View style={styles.iconeContainer}>
          <Ionicons
            name={icone}
            size={28}
            color={VERDE_ESCURO}
          />
        </View>

        <Ionicons
          name="arrow-forward-circle"
          size={30}
          color={VERDE}
        />
      </View>

      <View style={styles.cardTexto}>
        <Text style={styles.cardTitulo}>
          {titulo}
        </Text>

        <Text style={styles.cardDescricao}>
          {descricao}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const {
    usuario,
    carregando,
    autorizado,
  } = useAutenticacao('empresa');

  const { produtos } = Dados();

  const totalProdutos = produtos.filter(
    (produto) => String(produto.empresa) === String(usuario?.id)
  ).length;

  const larguraCard = width >= 700 ? '48.5%' : '48%';

  if (carregando || !autorizado) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={VERDE}
      />

      {/* CABEÇALHO FIXO */}
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoTexto}>
          <Text
            style={styles.boasVindas}
            numberOfLines={2}
          >
            Olá, {usuario?.nome}
          </Text>

          <Text style={styles.subtitulo}>
            Gerencie seu negócio
          </Text>
        </View>

        <Text style={styles.textoCabecalho}>
          Tudo o que você precisa em um só lugar.
        </Text>
      </View>

      {/* SOMENTE ESTA PARTE ROLA */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* TOTAL DE PRODUTOS */}
        <View style={styles.totalCard}>
          <View style={styles.totalIcone}>
            <Ionicons
              name="cube-outline"
              size={32}
              color={VERDE_ESCURO}
            />
          </View>

          <View style={styles.totalInformacao}>
            <Text style={styles.totalLabel}>
              Total de produtos
            </Text>

            <Text style={styles.totalNumero}>
              {totalProdutos}
            </Text>

            <Text style={styles.totalDescricao}>
              Produtos no seu catálogo
            </Text>
          </View>
        </View>

        {/* ACESSO RÁPIDO */}
        <View style={styles.tituloSecao}>
          <View>
            <Text style={styles.tituloMenu}>
              Acesso rápido
            </Text>

            <Text style={styles.subtituloMenu}>
              O que você deseja fazer?
            </Text>
          </View>
        </View>

        {/* CARDS RESPONSIVOS */}
        <View style={styles.grade}>
          <View style={{ width: larguraCard }}>
            <MenuCard
              titulo="Meus produtos"
              descricao="Consulte e edite seu catálogo."
              icone="cube-outline"
              corFundo="#EAF5ED"
              onPress={() => router.push('/produtoempresa' as any)}
            />
          </View>

          <View style={{ width: larguraCard }}>
            <MenuCard
              titulo="Ofertas"
              descricao="Crie e gerencie promoções."
              icone="pricetag-outline"
              corFundo="#FFF6E4"
              onPress={() => router.push('/ofertas' as any)}
            />
          </View>

          <View style={{ width: larguraCard }}>
            <MenuCard
              titulo="Adicionar produto"
              descricao="Adicione novos produtos ao seu catálogo."
              icone="add-circle-outline"
              corFundo="#F0ECFA"
              onPress={() => router.push('/novoproduto' as any)}
            />
          </View>

          <View style={{ width: larguraCard }}>
            <MenuCard
              titulo="Criar oferta"
              descricao="Crie promoções e destaque seus produtos."
              icone="add-circle-outline"
              corFundo="#EAF2FA"
              onPress={() => router.push('/ofertas/criar' as any)}
            />
          </View>
        </View>

        <View style={styles.espacoFinal} />
      </ScrollView>

      {/* NAVEGAÇÃO INFERIOR FIXA */}
      <View style={styles.barraInferior}>
        <Pressable
          style={({ pressed }) => [
            styles.itemNavegacao,
            pressed && styles.itemPressionado,
          ]}
          onPress={() => router.push('/home' as any)}
          accessibilityRole="button"
          accessibilityLabel="Início"
        >
          <Ionicons
            name="home"
            size={24}
            color="#FFFFFF"
          />

          <Text style={styles.textoNavegacaoAtivo}>
            Início
          </Text>

          <View style={styles.indicadorAtivo} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.itemNavegacao,
            pressed && styles.itemPressionado,
          ]}
          onPress={() => router.push('/perfil' as any)}
          accessibilityRole="button"
          accessibilityLabel="Perfil"
        >
          <Ionicons
            name="person-outline"
            size={24}
            color="#D9E9DD"
          />

          <Text style={styles.textoNavegacao}>
            Perfil
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },

  // CABEÇALHO FIXO
  cabecalho: {
    backgroundColor: VERDE,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexShrink: 0,
  },

  cabecalhoTexto: {
    flexShrink: 1,
  },

  boasVindas: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  subtitulo: {
    fontSize: 16,
    color: '#E7F2E9',
    marginTop: 5,
  },

  textoCabecalho: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 20,
    opacity: 0.95,
  },

  // CONTEÚDO ROLÁVEL
  scroll: {
    flex: 1,
    minHeight: 0,
  },

  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },

  // RESUMO DOS PRODUTOS
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E4EBE5',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#244D32',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  totalIcone: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#E3F1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalInformacao: {
    flex: 1,
    marginLeft: 14,
  },

  totalLabel: {
    fontSize: 14,
    color: '#65736A',
  },

  totalNumero: {
    fontSize: 34,
    fontWeight: 'bold',
    color: VERDE_ESCURO,
    marginTop: 1,
  },

  totalDescricao: {
    fontSize: 12,
    color: '#758078',
    marginTop: 2,
  },

  // TÍTULO DA SEÇÃO
  tituloSecao: {
    marginTop: 28,
    marginBottom: 17,
  },

  tituloMenu: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#173E2B',
  },

  subtituloMenu: {
    fontSize: 14,
    color: '#778079',
    marginTop: 4,
  },

  // GRADE DE CARDS
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 15,
  },

  card: {
    width: '100%',
    minHeight: 158,
    borderRadius: 21,
    padding: 15,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8EDE8',
    shadowColor: '#1F3D29',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  iconeContainer: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTexto: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  cardTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#214B31',
    lineHeight: 21,
  },

  cardDescricao: {
    fontSize: 12,
    lineHeight: 17,
    color: '#68736B',
    marginTop: 6,
  },

  espacoFinal: {
    height: 8,
  },

  // BARRA INFERIOR FIXA
  barraInferior: {
    minHeight: 72,
    backgroundColor: VERDE_ESCURO,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexShrink: 0,
  },

  itemNavegacao: {
    width: 100,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  itemPressionado: {
    opacity: 0.65,
  },

  textoNavegacaoAtivo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  textoNavegacao: {
    fontSize: 12,
    color: '#D9E9DD',
  },

  indicadorAtivo: {
    width: 24,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },
});