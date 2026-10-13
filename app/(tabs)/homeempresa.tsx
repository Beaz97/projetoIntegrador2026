
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

type MenuCardProps = {
  titulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function MenuCard({
  titulo,
  icone,
  onPress,
}: MenuCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <Ionicons
        name={icone}
        size={39}
        color={VERDE_ESCURO}
      />

      <View style={styles.cardRodape}>
        <Text style={styles.cardTitulo}>
          {titulo}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={31}
          color={VERDE}
        />
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO VERDE */}
        <View style={styles.cabecalho}>
          <Text style={styles.boasVindas}>
            Olá, Empresa!
          </Text>

          <Text style={styles.subtitulo}>
            Gerencie seus produtos
          </Text>
        </View>

        {/* CONTEÚDO DA PÁGINA */}
        <View style={styles.corpo}>

          {/* TOTAL DE PRODUTOS */}
          <View style={styles.totalCard}>
            <View>
              <Text style={styles.totalLabel}>
                Total de produtos
              </Text>

              <Text style={styles.totalNumero}>
                167
              </Text>
            </View>

            <Ionicons
              name="cube"
              size={37}
              color={VERDE_ESCURO}
            />
          </View>

          {/* MENU COM QUATRO CARDS */}
          <View style={styles.grade}>
            <MenuCard
              titulo="Meus produtos"
              icone="cube"
              onPress={() => router.push('/')}
            />

            <MenuCard
              titulo="Ofertas"
              icone="pricetag-outline"
              onPress={() => router.push('/')}
            />

            <MenuCard
              titulo="Categorias"
              icone="folder-outline"
              onPress={() => router.push('/')}
            />

            <MenuCard
              titulo="Relatório"
              icone="bar-chart-outline"
              onPress={() => router.push('/')}
            />

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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scroll: {
    flex: 1,
  },

  conteudo: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  // Cabeçalho verde com cantos inferiores arredondados
  cabecalho: {
    backgroundColor: VERDE,
    minHeight: 190,
    paddingTop: 45,
    paddingHorizontal: 30,
    paddingBottom: 65,
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
  },

  boasVindas: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  subtitulo: {
    fontSize: 19,
    color: '#FFFFFF',
    marginTop: 2,
  },

  corpo: {
    paddingHorizontal: 22,
    marginTop: -43,
  },

  // Cartão com o total de produtos
  totalCard: {
    minHeight: 115,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B8B8B8',
    paddingHorizontal: 25,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    color: VERDE_ESCURO,
    fontSize: 18,
  },

  totalNumero: {
    color: VERDE_ESCURO,
    fontSize: 39,
    fontWeight: 'bold',
    marginTop: 1,
  },

  // Organização dos quatro cards
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginTop: 32,
  },

  card: {
    width: '44%',
    maxWidth: 190,
    minWidth: 130,
    height: 135,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B8B8B8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },

  cardPressed: {
    backgroundColor: '#EFF6F0',
    opacity: 0.85,
  },

  cardRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
  },

  cardTitulo: {
    color: VERDE_ESCURO,
    fontSize: 17,
    flex: 1,
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
