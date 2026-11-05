import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAutenticacao } from '@/app/components/autenticaTelas';

const VERDE = '#41805a';
const VERDE_ESCURO = '#245D39';
const VERDE_CLARO = '#E5F1E8';

const CHAVE_USUARIOS = '@banco_usuarios';
const CHAVE_USUARIO_LOGADO = '@usuario_logado';

export default function Perfil() {
  const router = useRouter();

  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [historicoAtualizado, setHistoricoAtualizado] = useState<any[]>([]);
  const [nomeAtualizado, setNomeAtualizado] = useState('');
  const [emailAtualizado, setEmailAtualizado] = useState('');
  const [telefoneAtualizado, setTelefoneAtualizado] = useState('');
  const [enderecoAtualizado, setEnderecoAtualizado] = useState<any>(null);

  const { usuario, carregando, autorizado } =
    useAutenticacao('cliente');

  const carregarHistorico = useCallback(async () => {
    try {
      const usuarioSalvoTexto = await AsyncStorage.getItem(
        CHAVE_USUARIO_LOGADO
      );

      if (!usuarioSalvoTexto) {
        setHistoricoAtualizado([]);
        setTelefoneAtualizado('');
        setEnderecoAtualizado(null);
        return;
      }

      const usuarioSalvo = JSON.parse(usuarioSalvoTexto);

      const usuariosTexto = await AsyncStorage.getItem(
        CHAVE_USUARIOS
      );

      let usuarioAtualizado = usuarioSalvo;

      if (usuariosTexto) {
        const usuarios = JSON.parse(usuariosTexto);

        if (Array.isArray(usuarios)) {
          const usuarioBanco = usuarios.find((u: any) => {
            return (
              (usuarioSalvo.id != null &&
                String(u.id) === String(usuarioSalvo.id)) ||
              (usuarioSalvo.email &&
                u.email?.toLowerCase() ===
                  usuarioSalvo.email.toLowerCase())
            );
          });

          if (usuarioBanco) {
            usuarioAtualizado = usuarioBanco;
          }
        }
      }

      const compras = Array.isArray(usuarioAtualizado.historicoCompras)
        ? usuarioAtualizado.historicoCompras.filter(
            (compra: any) =>
              Array.isArray(compra.produtos) &&
              typeof compra.total === 'number' &&
              typeof compra.data === 'string',
          )
        : [];

      setHistoricoAtualizado(compras);

      setNomeAtualizado(usuarioAtualizado.nome || '');
      setEmailAtualizado(usuarioAtualizado.email || '');

      // Identificador usado também na tela de configurações
      const identificador =
        usuarioAtualizado.id != null
          ? String(usuarioAtualizado.id)
          : String(usuarioAtualizado.email || '').trim().toLowerCase();

      // Telefone cadastrado
      const telefoneSalvo = await AsyncStorage.getItem(
        `@telefone_usuario_${identificador}`,
      );

      setTelefoneAtualizado(
        telefoneSalvo ?? usuarioAtualizado.telefone ?? '',
      );

      // Endereços cadastrados
      const enderecosTexto = await AsyncStorage.getItem(
        `@enderecos_usuario_${identificador}`,
      );

      const listaEnderecos = enderecosTexto
        ? JSON.parse(enderecosTexto)
        : [];

      setEnderecoAtualizado(
        Array.isArray(listaEnderecos) && listaEnderecos.length > 0
          ? listaEnderecos[0]
          : null,
      );

    } catch (erro) {
      console.error('Erro ao carregar informações do perfil:', erro);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico])
  );

  if (carregando || !autorizado) {
    return null;
  }

  const historico = historicoAtualizado;

  const nome = nomeAtualizado || usuario?.nome || 'Meu perfil';

  const email =
    emailAtualizado || usuario?.email || 'E-mail não informado';

  function abrirConfiguracoes() {
    router.push('/configuracoes');
  }

  function abrirEnderecos() {
    router.push({
      pathname: '/configuracoes',
      params: { tela: 'enderecos' },
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}
        <View style={styles.cabecalho}>
          <View style={styles.cabecalhoSuperior}>
            <View>
              <Text style={styles.tituloCabecalho}>
                Meu perfil
              </Text>

              <Text style={styles.subtituloCabecalho}>
                Suas informações e preferências
              </Text>
            </View>

            <Pressable
              onPress={abrirConfiguracoes}
              hitSlop={10}
              style={({ pressed }) => [
                styles.botaoConfiguracoes,
                pressed && styles.botaoPressionado,
              ]}
            >
              <Ionicons
                name="settings-outline"
                size={23}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* INFORMAÇÕES PESSOAIS */}
          <View style={styles.perfilUsuario}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={38}
                color={VERDE}
              />
            </View>

            <View style={styles.informacoesUsuario}>
              <Text style={styles.nome} numberOfLines={1}>
                {nome}
              </Text>

              <View style={styles.informacaoVerdeLinha}>
                <Ionicons
                  name="mail-outline"
                  size={15}
                  color="#E7F2E9"
                />

                <Text style={styles.email} numberOfLines={1}>
                  {email}
                </Text>
              </View>

              <View style={styles.informacaoVerdeLinha}>
                <Ionicons
                  name="call-outline"
                  size={15}
                  color="#E7F2E9"
                />

                <Text style={styles.telefoneVerde} numberOfLines={1}>
                  {telefoneAtualizado || 'Telefone não informado'}
                </Text>
              </View>

              <View style={styles.seloCliente}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#FFFFFF"
                />

                <Text style={styles.seloClienteTexto}>
                  Cliente Economize
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CONTEÚDO */}
        <View style={styles.conteudoPrincipal}>
          <Text style={styles.tituloSecao}>
            Minha conta
          </Text>

          <Text style={styles.descricaoSecao}>
            Gerencie seus dados e acompanhe suas compras.
          </Text>

          {/* CONFIGURAÇÕES */}
          <Pressable
            style={({ pressed }) => [
              styles.cartao,
              pressed && styles.cartaoPressionado,
            ]}
            onPress={abrirConfiguracoes}
          >
            <View style={styles.iconeCartao}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={VERDE}
              />
            </View>

            <View style={styles.textosCartao}>
              <Text style={styles.tituloCartao}>
                Configurações
              </Text>

              <Text style={styles.descricaoCartao}>
                Gerencie seus dados e preferências
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color="#8B968C"
            />
          </Pressable>

          {/* ENDEREÇO CADASTRADO */}
          <Pressable
            style={({ pressed }) => [
              styles.cartaoEnderecoPerfil,
              pressed && styles.cartaoPressionado,
            ]}
            onPress={abrirEnderecos}
          >
            <View style={styles.enderecoCabecalho}>
              <View style={styles.iconeEnderecoPerfil}>
                <Ionicons
                  name="location"
                  size={23}
                  color={VERDE}
                />
              </View>

              <View style={styles.enderecoTituloContainer}>
                <Text style={styles.tituloCartao}>
                  Endereço de entrega
                </Text>

                <Text style={styles.enderecoNomePerfil}>
                  {enderecoAtualizado?.nome ||
                    'Nenhum endereço cadastrado'}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={21}
                color="#8B968C"
              />
            </View>

            {enderecoAtualizado?.texto ? (
              <View style={styles.enderecoDetalhe}>
                <Ionicons
                  name="navigate-outline"
                  size={17}
                  color="#718174"
                />

                <Text style={styles.enderecoTextoPerfil}>
                  {enderecoAtualizado.texto}
                </Text>
              </View>
            ) : (
              <Text style={styles.enderecoVazioPerfil}>
                Toque para cadastrar seu endereço.
              </Text>
            )}
          </Pressable>

          {/* HISTÓRICO DE COMPRAS */}
          <Pressable
            style={({ pressed }) => [
              styles.cartao,
              pressed && styles.cartaoPressionado,
            ]}
            onPress={() =>
              setMostrarHistorico(!mostrarHistorico)
            }
          >
            <View style={styles.iconeCartao}>
              <Ionicons
                name="receipt-outline"
                size={24}
                color={VERDE}
              />
            </View>

            <View style={styles.textosCartao}>
              <Text style={styles.tituloCartao}>
                Histórico de compras
              </Text>

              <Text style={styles.descricaoCartao}>
                {historico.length}{' '}
                {historico.length === 1
                  ? 'compra realizada'
                  : 'compras realizadas'}
              </Text>
            </View>

            <Ionicons
              name={
                mostrarHistorico
                  ? 'chevron-up'
                  : 'chevron-down'
              }
              size={21}
              color="#8B968C"
            />
          </Pressable>

          {mostrarHistorico && (
            <View style={styles.listaHistorico}>
              {historico.length > 0 ? (
                historico.map((compra: any, index: number) => (
                  <View
                    key={compra.id ?? index}
                    style={[
                      styles.itemHistorico,
                      index === historico.length - 1 &&
                        styles.ultimoItemHistorico,
                    ]}
                  >
                    <View style={styles.historicoIcone}>
                      <Ionicons
                        name="bag-check-outline"
                        size={20}
                        color={VERDE}
                      />
                    </View>

                    <View style={styles.historicoTextos}>
                      <Text style={styles.historicoTitulo}>
                        Compra realizada
                      </Text>

                      <Text style={styles.historicoData}>
                        {new Date(compra.data).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>

                    <Text style={styles.historicoPreco}>
                      {compra.total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.historicoVazio}>
                  <Ionicons
                    name="bag-outline"
                    size={28}
                    color="#8B968C"
                  />

                  <Text style={styles.historicoVazioTexto}>
                    Você ainda não realizou compras.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* DICA */}
          <View style={styles.cartaoDica}>
            <View style={styles.dicaIcone}>
              <Ionicons
                name="leaf-outline"
                size={27}
                color={VERDE}
              />
            </View>

            <View style={styles.dicaTextos}>
              <Text style={styles.dicaTitulo}>
                Economize mais!
              </Text>

              <Text style={styles.dicaDescricao}>
                Compare preços e faça escolhas mais conscientes
                para o seu bolso.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* RODAPÉ */}
      <View style={styles.barraContainer}>
        <View style={styles.barra}>
          <Pressable
            hitSlop={10}
            style={({ pressed }) => [
              styles.botaoNavegacao,
              pressed && styles.botaoPressionado,
            ]}
            onPress={() => router.push('/home')}
          >
            <Ionicons
              name="home-outline"
              size={27}
              color="#FFFFFF"
            />

            <Text style={styles.textoNavegacao}>
              Início
            </Text>
          </Pressable>

          <Pressable
            hitSlop={10}
            style={({ pressed }) => [
              styles.botaoNavegacao,
              pressed && styles.botaoPressionado,
            ]}
            onPress={() => router.push('/perfil' as any)}
          >
            <Ionicons
              name="person"
              size={27}
              color="#FFFFFF"
            />

            <Text style={styles.textoNavegacao}>
              Perfil
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.carrinho,
            pressed && styles.botaoPressionado,
          ]}
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
    paddingBottom: 22,
  },

  cabecalho: {
    backgroundColor: VERDE,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  cabecalhoSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 27,
  },

  tituloCabecalho: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },

  subtituloCabecalho: {
    fontSize: 13,
    color: '#E7F2E9',
    marginTop: 5,
  },

  botaoConfiguracoes: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  perfilUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#DCEFE3',
  },

  informacoesUsuario: {
    flex: 1,
    minWidth: 0,
  },

  nome: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  email: {
    fontSize: 13,
    color: '#E7F2E9',
    marginTop: 0,
    flex: 1,
  },

  informacaoVerdeLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
  },

  telefoneVerde: {
    fontSize: 13,
    color: '#E7F2E9',
  },

  seloCliente: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.17)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },

  seloClienteTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  conteudoPrincipal: {
    paddingHorizontal: 18,
    paddingTop: 25,
  },

  tituloSecao: {
    fontSize: 21,
    fontWeight: '800',
    color: '#193D27',
    letterSpacing: -0.3,
  },

  descricaoSecao: {
    fontSize: 13,
    color: '#7B837B',
    marginTop: 5,
    marginBottom: 18,
    lineHeight: 19,
  },

  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5ECE6',
    minHeight: 80,
  },

  cartaoPressionado: {
    opacity: 0.75,
  },

  iconeCartao: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textosCartao: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
    marginRight: 8,
  },

  tituloCartao: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26382A',
  },

  descricaoCartao: {
    fontSize: 12,
    color: '#7B837B',
    marginTop: 5,
    lineHeight: 17,
  },

  // CARTÃO DE ENDEREÇO
  cartaoEnderecoPerfil: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E3EBE4',
  },

  enderecoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconeEnderecoPerfil: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },

  enderecoTituloContainer: {
    flex: 1,
    marginLeft: 12,
  },

  enderecoNomePerfil: {
    fontSize: 13,
    color: VERDE_ESCURO,
    fontWeight: '600',
    marginTop: 5,
  },

  enderecoDetalhe: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#EDF1ED',
  },

  enderecoTextoPerfil: {
    flex: 1,
    fontSize: 13,
    color: '#68746A',
    lineHeight: 20,
  },

  enderecoVazioPerfil: {
    fontSize: 12,
    color: '#8B968C',
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF1ED',
  },

  listaHistorico: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5ECE6',
    paddingHorizontal: 13,
    marginTop: -3,
    marginBottom: 14,
  },

  itemHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EE',
  },

  ultimoItemHistorico: {
    borderBottomWidth: 0,
  },

  historicoIcone: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },

  historicoTextos: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
    marginRight: 8,
  },

  historicoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26382A',
  },

  historicoData: {
    fontSize: 11,
    color: '#7B837B',
    marginTop: 4,
  },

  historicoPreco: {
    fontSize: 14,
    fontWeight: '800',
    color: VERDE_ESCURO,
  },

  historicoVazio: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },

  historicoVazioTexto: {
    fontSize: 13,
    color: '#7B837B',
    textAlign: 'center',
  },

  cartaoDica: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1E8',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
  },

  dicaIcone: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dicaTextos: {
    flex: 1,
    marginLeft: 13,
  },

  dicaTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: VERDE_ESCURO,
  },

  dicaDescricao: {
    fontSize: 12,
    lineHeight: 18,
    color: '#46664D',
    marginTop: 5,
  },

  // RODAPÉ
  barraContainer: {
    height: 78,
    position: 'relative',
    backgroundColor: '#F7F9F7',
  },

  barra: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: VERDE,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: 67,
    paddingHorizontal: 45,
  },

  botaoNavegacao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  textoNavegacao: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  carrinho: {
    position: 'absolute',
    top: -7,
    left: '50%',
    marginLeft: -31,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: VERDE,
    borderWidth: 4,
    borderColor: '#F7F9F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoPressionado: {
    opacity: 0.65,
  },
});