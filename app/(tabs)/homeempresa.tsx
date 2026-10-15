import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
            size={30}
            color={VERDE_ESCURO}
          />
        </View>

        <Ionicons
          name="arrow-forward-circle"
          size={32}
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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={VERDE}
      />

      {/* CABEÇALHO */}
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoLinha}>
          <View>
            <Text style={styles.boasVindas}>
              Olá, Empresa!
            </Text>

            <Text style={styles.subtitulo}>
              Gerencie seu negócio
            </Text>
          </View>

          <View style={styles.logo}>
            <Ionicons
              name="storefront-outline"
              size={35}
              color={VERDE_ESCURO}
            />
          </View>
        </View>

        <Text style={styles.textoCabecalho}>
          Tudo o que você precisa em um só lugar.
        </Text>
      </View>

      {/* CONTEÚDO */}
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
              size={34}
              color={VERDE_ESCURO}
            />
          </View>

          <View style={styles.totalInformacao}>
            <Text style={styles.totalLabel}>
              Total de produtos
            </Text>

            <Text style={styles.totalNumero}>
              167
            </Text>

            <Text style={styles.totalDescricao}>
              Produtos no seu catálogo
            </Text>
          </View>

          <View style={styles.totalDecoracao}>
            <Ionicons
              name="layers-outline"
              size={43}
              color={VERDE}
            />

            <Text style={styles.totalDecoracaoTexto}>
              Catálogo
            </Text>
          </View>
        </View>

        {/* TÍTULO DO MENU */}
        <View style={styles.tituloSecao}>
          <View>
            <Text style={styles.tituloMenu}>
              Acesso rápido
            </Text>

            <Text style={styles.subtituloMenu}>
              O que você deseja fazer?
            </Text>
          </View>

          <Ionicons
            name="grid-outline"
            size={25}
            color={VERDE}
          />
        </View>

        {/* PRIMEIRA LINHA */}
        <View style={styles.grade}>
          <MenuCard
            titulo="Meus produtos"
            descricao="Consulte e edite seu catálogo."
            icone="cube-outline"
            corFundo="#EAF5ED"
            onPress={() => router.push('/produtoempresa' as any)}
          />

          <MenuCard
            titulo="Ofertas"
            descricao="Crie e gerencie promoções."
            icone="pricetag-outline"
            corFundo="#FFF6E4"
            onPress={() => router.push('/ofertas' as any)}
          />

          {/* SEGUNDA LINHA */}
       
        <MenuCard
          titulo="Adicionar produto"
          descricao="Adicione novos produtos ao seu catálogo."
          icone="add-circle-outline"
          corFundo="#F0ECFA"
          onPress={() => router.push('/produtos/criar' as any)}
        />

          <MenuCard
            titulo="Criar oferta"
            descricao="Crie promoções e destaque seus produtos."
            icone="add-circle-outline"
            corFundo="#F0ECFA"
            onPress={() => router.push('/ofertas/criar' as any)}
          />
      </View>
      </ScrollView>

      {/* NAVEGAÇÃO INFERIOR */}
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
            size={25}
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
            size={25}
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

  // CABEÇALHO
  cabecalho: {
    backgroundColor: VERDE,
    paddingTop: 52,
    paddingHorizontal: 24,
    paddingBottom: 35,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
  },

  cabecalhoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  logo: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: '#D9ECDD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoCabecalho: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 23,
    opacity: 0.95,
  },

  // ÁREA ROLÁVEL
  scroll: {
    flex: 1,
  },

  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 25,
  },

  // RESUMO
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#E4EBE5',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#244D32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  totalIcone: {
    width: 62,
    height: 62,
    borderRadius: 19,
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
    fontSize: 35,
    fontWeight: 'bold',
    color: VERDE_ESCURO,
    marginTop: 1,
  },

  totalDescricao: {
    fontSize: 11,
    color: '#758078',
    marginTop: 1,
  },

  totalDecoracao: {
    alignItems: 'center',
    marginLeft: 5,
  },

  totalDecoracaoTexto: {
    fontSize: 10,
    fontWeight: '600',
    color: VERDE,
    marginTop: 4,
  },

  // TÍTULO DA SEÇÃO
  tituloSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 29,
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

  // CARDS
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 15,
  },

  card: {
    width: '48%',
    minHeight: 166,
    borderRadius: 22,
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
    shadowRadius: 7,
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  iconeContainer: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
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
    lineHeight: 20,
  },

  cardDescricao: {
    fontSize: 12,
    lineHeight: 17,
    color: '#68736B',
    marginTop: 6,
  },

  // DICA
  dicaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: VERDE_ESCURO,
    borderRadius: 22,
    padding: 18,
    marginTop: 24,
  },

  dicaIcone: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#477D59',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  dicaConteudo: {
    flex: 1,
  },

  dicaTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  dicaTexto: {
    fontSize: 12,
    lineHeight: 18,
    color: '#E1EEE4',
    marginTop: 5,
  },

  // BARRA INFERIOR
  barraInferior: {
    height: 76,
    backgroundColor: VERDE_ESCURO,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 25,
    paddingBottom: 5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  itemNavegacao: {
    width: 100,
    height: 66,
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