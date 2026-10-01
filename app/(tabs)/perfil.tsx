import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/* ---------- Dados ---------- */
const usuario = {
  nome: 'Vitória D.',
  email: 'Vic@gmail.com',
  compras: 12,
  // Cole aqui o link direto da imagem do mapa. Se ficar vazio, aparece um mapa de exemplo.
  mapa: '',
};

/* ---------- Mapa com fallback ---------- */
function Mapa({ uri }: { uri?: string }) {
  const [erro, setErro] = useState(false);

  if (uri && !erro) {
    return <Image source={{ uri }} style={styles.mapaImagem} onError={() => setErro(true)} />;
  }
  return (
    <View style={[styles.mapaImagem, styles.mapaFallback]}>
      <Ionicons name="location" size={40} color="#e5202e" />
    </View>
  );
}

/* ---------- Tela ---------- */
export default function Perfil() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Cabeçalho verde */}
      <View style={styles.cabecalho}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={80} color="#fff" style={styles.avatarIcone} />
        </View>

        <View style={styles.cabecalhoTextos}>
          <Text style={styles.nome}>{usuario.nome}</Text>
          <Text style={styles.email}>{usuario.email}</Text>
        </View>

        <Pressable
          hitSlop={10}
          style={({ pressed }) => pressed && styles.botaoPressionado}
          onPress={() => {}}
        >
          <Ionicons name="settings-outline" size={38} color="#fff" />
        </Pressable>
      </View>

      {/* Conteúdo branco */}
      <ScrollView
        style={styles.conteudo}
        contentContainerStyle={styles.conteudoInterno}
        showsVerticalScrollIndicator={false}
      >
        {/* Histórico de compras */}
        <Pressable
          style={({ pressed }) => [styles.historico, pressed && styles.botaoPressionado]}
          onPress={() => {}}
        >
          <Ionicons name="cart-outline" size={44} color="#2f7a4b" />
          <View style={styles.historicoTextos}>
            <Text style={styles.historicoTitulo}>Histórico de compras</Text>
            <Text style={styles.historicoSub}>{usuario.compras} compras</Text>
          </View>
        </Pressable>

        {/* Mapa */}
        <Mapa uri={usuario.mapa} />

        {/* Alterar endereço */}
        <Pressable
          style={({ pressed }) => [styles.botaoEndereco, pressed && styles.botaoPressionado]}
          onPress={() => {}}
        >
          <Text style={styles.botaoEnderecoTexto}>Alterar endereço</Text>
        </Pressable>

        {/* Economize por um futuro melhor */}
        <View style={styles.dica}>
          <Text style={styles.dicaTitulo}>Economize por um futuro melhor!</Text>

          <View style={styles.dicaLinha}>
            <View style={styles.ods}>
              <Text style={styles.odsNumero}>12</Text>
              <Text style={styles.odsTexto}>RESPONSIBLE{'\n'}CONSUMPTION{'\n'}AND PRODUCTION</Text>
              <View style={styles.odsIcone}>
                <Ionicons name="infinite" size={60} color="#fff" />
              </View>
            </View>

            <View style={styles.dicaTextos}>
              <Text style={styles.dicaDescricao}>
                Compare preços, escolha melhor e compre de forma mais consciente.
              </Text>
              <Text style={styles.dicaDestaque}>Pequenas escolhas fazem a diferença.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

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

  /* Cabeçalho */
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#41805a',
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  avatarIcone: {
    marginBottom: -8,
  },
  cabecalhoTextos: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },

  /* Conteúdo */
  conteudo: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -30,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  conteudoInterno: {
    padding: 24,
    paddingBottom: 16,
  },

  /* Histórico */
  historico: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcefe3',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  historicoTextos: {
    marginLeft: 16,
  },
  historicoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4d2e',
  },
  historicoSub: {
    fontSize: 18,
    color: '#1f4d2e',
  },

  /* Mapa */
  mapaImagem: {
    width: '100%',
    height: 130,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  mapaFallback: {
    backgroundColor: '#dcdcdc',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Botão de endereço */
  botaoEndereco: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcefe3',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  botaoEnderecoTexto: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f4d2e',
  },

  /* Dica */
  dica: {
    backgroundColor: '#dcefe3',
    borderRadius: 18,
    padding: 14,
  },
  dicaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4d2e',
    marginBottom: 10,
  },
  dicaLinha: {
    flexDirection: 'row',
  },
  ods: {
    width: 92,
    height: 92,
    backgroundColor: '#3f7e44',
    padding: 4,
    alignItems: 'flex-start',
  },
  odsNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  odsTexto: {
    position: 'absolute',
    top: 6,
    left: 26,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#fff',
  },
  odsIcone: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dicaTextos: {
    flex: 1,
    marginLeft: 10,
  },
  dicaDescricao: {
    fontSize: 15,
    color: '#1f4d2e',
    textAlign: 'justify',
  },
  dicaDestaque: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f4d2e',
  },

  /* Barra de baixo */
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