
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const usuario = {
  nome: 'Vitória D.',
  email: 'Vic@gmail.com',
  compras: 12,
  mapa: 'https://tse3.mm.bing.net/th/id/OIP.fLAOcrZQ0T-hQaJSi9VC-AHaEs?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
};

const historico = [
  { id: '1', mercado: 'Supermercado Bistek', data: '10/10/2026', total: '152,90' },
  { id: '2', mercado: 'Angeloni', data: '03/10/2026', total: '87,45' },
  { id: '3', mercado: 'Giassi', data: '27/09/2026', total: '210,30' },
  { id: '4', mercado: 'Fort Atacadista', data: '19/09/2026', total: '342,00' },
  { id: '5', mercado: 'Supermercado Bistek', data: '12/09/2026', total: '64,80' },
];

function Mapa({ uri }: { uri?: string }) {
  const [erro, setErro] = useState(false);

  if (uri && !erro) {
    return (
      <Image
        source={{ uri }}
        style={styles.mapaImagem}
        onError={() => setErro(true)}
      />
    );
  }

  return (
    <View style={[styles.mapaImagem, styles.mapaFallback]}>
      <Ionicons name="map-outline" size={42} color="#41805a" />
      <Text style={styles.mapaFallbackTexto}>Seu endereço</Text>
    </View>
  );
}

export default function Perfil() {
  const router = useRouter();
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#286340" />

      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoTopo}>
          <View>
            <Text style={styles.bemVindo}>MINHA CONTA</Text>
            <Text style={styles.tituloPerfil}>Meu perfil</Text>
          </View>

          <Pressable
            style={styles.botaoConfig}
            onPress={() => router.push('/configuracoes')}
          >
            <Ionicons name="settings-outline" size={23} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.usuarioArea}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#286340" />
          </View>

          <View style={styles.usuarioTextos}>
            <Text style={styles.nome}>{usuario.nome}</Text>
            <Text style={styles.email}>{usuario.email}</Text>
            <View style={styles.statusConta}>
              <Ionicons name="checkmark-circle" size={14} color="#c9f1d3" />
              <Text style={styles.statusTexto}>Conta cliente</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Conteúdo */}
      <ScrollView
        style={styles.conteudo}
        contentContainerStyle={styles.conteudoInterno}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumo de compras */}
        <View style={styles.resumo}>
          <View style={styles.resumoIcone}>
            <Ionicons name="bag-check-outline" size={25} color="#286340" />
          </View>

          <View style={styles.resumoTextos}>
            <Text style={styles.resumoTitulo}>Suas compras</Text>
            <Text style={styles.resumoSub}>Acompanhe seu histórico</Text>
          </View>

          <View style={styles.resumoNumero}>
            <Text style={styles.numeroTexto}>{usuario.compras}</Text>
          </View>
        </View>

        {/* Histórico */}
        <Pressable
          style={styles.historicoCabecalho}
          onPress={() => setMostrarHistorico(!mostrarHistorico)}
        >
          <View>
            <Text style={styles.secaoTitulo}>Histórico de compras</Text>
            <Text style={styles.secaoSub}>
              Veja os mercados e valores das compras
            </Text>
          </View>

          <View style={styles.chevron}>
            <Ionicons
              name={mostrarHistorico ? 'chevron-up' : 'chevron-down'}
              size={21}
              color="#286340"
            />
          </View>
        </Pressable>

        {mostrarHistorico && (
          <View style={styles.listaHistorico}>
            {historico.map((compra, index) => (
              <View
                key={compra.id}
                style={[
                  styles.historicoItem,
                  index === historico.length - 1 && styles.ultimoHistorico,
                ]}
              >
                <View style={styles.mercadoIcone}>
                  <Ionicons
                    name="storefront-outline"
                    size={20}
                    color="#41805a"
                  />
                </View>

                <View style={styles.historicoItemTextos}>
                  <Text style={styles.historicoMercado}>
                    {compra.mercado}
                  </Text>
                  <Text style={styles.historicoData}>{compra.data}</Text>
                </View>

                <Text style={styles.historicoPreco}>
                  R$ {compra.total}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Endereço */}
        <View style={styles.secaoCabecalho}>
          <Text style={styles.secaoTitulo}>Meu endereço</Text>
          <Text style={styles.secaoSub}>
            Confira a localização cadastrada
          </Text>
        </View>

        <View style={styles.enderecoCard}>
          <Mapa uri={usuario.mapa} />

          <Pressable
            style={({ pressed }) => [
              styles.botaoEndereco,
              pressed && styles.pressionado,
            ]}
            onPress={() =>
              router.push({
                pathname: '/configuracoes',
                params: { tela: 'enderecos' },
              })
            }
          >
            <Ionicons name="location-outline" size={19} color="#ffffff" />
            <Text style={styles.botaoEnderecoTexto}>Alterar endereço</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </Pressable>
        </View>

        {/* Consumo consciente */}
        <View style={styles.dica}>
          <View style={styles.dicaTopo}>
            <View style={styles.dicaIcone}>
              <Ionicons name="leaf-outline" size={25} color="#286340" />
            </View>

            <View style={styles.dicaTituloArea}>
              <Text style={styles.dicaTitulo}>Economize por um futuro melhor</Text>
              <Text style={styles.dicaSub}>
                Consumo consciente começa com você.
              </Text>
            </View>
          </View>

          <View style={styles.dicaDivisor} />

          <View style={styles.dicaConteudo}>
            <View style={styles.ods}>
              <Text style={styles.odsNumero}>12</Text>
              <Ionicons name="infinite-outline" size={35} color="#ffffff" />
              <Text style={styles.odsLegenda}>ODS</Text>
            </View>

            <View style={styles.dicaTextos}>
              <Text style={styles.dicaDescricao}>
                Compare preços, escolha melhor e compre de forma mais consciente.
              </Text>
              <Text style={styles.dicaDestaque}>
                Pequenas escolhas fazem a diferença!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navegação inferior */}
      <View style={styles.barraContainer}>
        <View style={styles.barra}>
          <Pressable
            style={styles.itemNavegacao}
            onPress={() => router.push('/home')}
          >
            <Ionicons name="home-outline" size={25} color="#e0eee4" />
            <Text style={styles.textoNavegacao}>Início</Text>
          </Pressable>

          <View style={styles.espacoCarrinho} />

          <Pressable
            style={styles.itemNavegacao}
            onPress={() => router.push('/perfil' as any)}
          >
            <Ionicons name="person" size={25} color="#ffffff" />
            <Text style={styles.textoNavegacaoAtivo}>Perfil</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.carrinho,
            pressed && styles.pressionado,
          ]}
          onPress={() => router.push('/carrinho' as any)}
        >
          <Ionicons name="cart-outline" size={29} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8f4',
  },

  cabecalho: {
    backgroundColor: '#286340',
    paddingTop: 52,
    paddingBottom: 38,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  cabecalhoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },

  bemVindo: {
    color: '#c9e4d0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  tituloPerfil: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 4,
  },

  botaoConfig: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff30',
  },

  usuarioArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: '#e5f2e8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  usuarioTextos: {
    flex: 1,
  },

  nome: {
    fontSize: 21,
    fontWeight: '800',
    color: '#ffffff',
  },

  email: {
    fontSize: 13,
    color: '#d8e9dc',
    marginTop: 3,
  },

  statusConta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },

  statusTexto: {
    fontSize: 11,
    color: '#d8f0de',
    fontWeight: '600',
  },

  conteudo: {
    flex: 1,
    marginTop: -13,
  },

  conteudoInterno: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },

  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 19,
    padding: 15,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#e8efe9',
    elevation: 2,
    shadowColor: '#183d26',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  resumoIcone: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#e5f2e8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resumoTextos: {
    flex: 1,
    marginLeft: 12,
  },

  resumoTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#244b31',
  },

  resumoSub: {
    fontSize: 11,
    color: '#849187',
    marginTop: 4,
  },

  resumoNumero: {
    minWidth: 37,
    height: 37,
    borderRadius: 13,
    backgroundColor: '#286340',
    alignItems: 'center',
    justifyContent: 'center',
  },

  numeroTexto: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  historicoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  secaoTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#244b31',
  },

  secaoSub: {
    fontSize: 11,
    color: '#849187',
    marginTop: 5,
  },

  chevron: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: '#e5f2e8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  listaHistorico: {
    backgroundColor: '#ffffff',
    borderRadius: 17,
    paddingHorizontal: 13,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#e7eee8',
  },

  historicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2ee',
    gap: 10,
  },

  ultimoHistorico: {
    borderBottomWidth: 0,
  },

  mercadoIcone: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#eaf4ec',
    alignItems: 'center',
    justifyContent: 'center',
  },

  historicoItemTextos: {
    flex: 1,
  },

  historicoMercado: {
    fontSize: 12,
    fontWeight: '700',
    color: '#315b40',
  },

  historicoData: {
    fontSize: 11,
    color: '#89958c',
    marginTop: 4,
  },

  historicoPreco: {
    fontSize: 12,
    fontWeight: '800',
    color: '#286340',
  },

  secaoCabecalho: {
    marginBottom: 13,
  },

  enderecoCard: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#e7eee8',
    marginBottom: 24,
  },

  mapaImagem: {
    width: '100%',
    height: 145,
    borderRadius: 13,
    resizeMode: 'cover',
  },

  mapaFallback: {
    backgroundColor: '#e6efe7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapaFallbackTexto: {
    color: '#41805a',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },

  botaoEndereco: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#286340',
    marginTop: 10,
  },

  botaoEnderecoTexto: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },

  dica: {
    backgroundColor: '#ffffff',
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e4eee5',
  },

  dicaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  dicaIcone: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#e5f2e8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dicaTituloArea: {
    flex: 1,
  },

  dicaTitulo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#244b31',
  },

  dicaSub: {
    fontSize: 11,
    color: '#849187',
    marginTop: 4,
  },

  dicaDivisor: {
    height: 1,
    backgroundColor: '#edf2ee',
    marginVertical: 14,
  },

  dicaConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  ods: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#3f7e44',
    padding: 8,
    justifyContent: 'space-between',
  },

  odsNumero: {
    fontSize: 19,
    fontWeight: '900',
    color: '#ffffff',
  },

  odsLegenda: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },

  dicaTextos: {
    flex: 1,
  },

  dicaDescricao: {
    fontSize: 12,
    lineHeight: 18,
    color: '#506b57',
  },

  dicaDestaque: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    color: '#286340',
    marginTop: 7,
  },

  barraContainer: {
    height: 76,
    backgroundColor: '#286340',
  },

  barra: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 25,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    backgroundColor: '#286340',
  },

  itemNavegacao: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  textoNavegacao: {
    fontSize: 10,
    color: '#d7e8dc',
  },

  textoNavegacaoAtivo: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '800',
  },

  espacoCarrinho: {
    width: 75,
  },

  carrinho: {
    position: 'absolute',
    top: -15,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: '#41805a',
    borderWidth: 4,
    borderColor: '#f4f8f4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  pressionado: {
    opacity: 0.75,
  },
});
