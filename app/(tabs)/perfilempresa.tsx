
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAutenticacao } from '@/app/components/autenticaTelas';

const VERDE = '#41805a';
const VERDE_ESCURO = '#245D39';
const VERDE_CLARO = '#E5F1E8';

const CHAVE_USUARIOS = '@banco_usuarios';
const CHAVE_USUARIO_LOGADO = '@usuario_logado';

type Endereco = {
  id: string;
  nome: string;
  texto: string;
};

export default function PerfilEmpresa() {
  const router = useRouter();

  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [emailEmpresa, setEmailEmpresa] = useState('');
  const [enderecoEmpresa, setEnderecoEmpresa] = useState('');

  const { usuario, carregando, autorizado } =
    useAutenticacao('empresa');

  const carregarDadosEmpresa = useCallback(async () => {
    try {
      const usuarioTexto = await AsyncStorage.getItem(
        CHAVE_USUARIO_LOGADO
      );

      if (!usuarioTexto) {
        setNomeEmpresa('');
        setEmailEmpresa('');
        setEnderecoEmpresa('');
        return;
      }

      const usuarioSalvo = JSON.parse(usuarioTexto);
      let empresaAtualizada = usuarioSalvo;

      const usuariosTexto = await AsyncStorage.getItem(
        CHAVE_USUARIOS
      );

      if (usuariosTexto) {
        const usuarios = JSON.parse(usuariosTexto);

        if (Array.isArray(usuarios)) {
          const empresaBanco = usuarios.find((u: any) => {
            if (
              usuarioSalvo.id != null &&
              u.id != null
            ) {
              return (
                String(u.id) === String(usuarioSalvo.id)
              );
            }

            return Boolean(
              usuarioSalvo.email &&
              u.email?.trim().toLowerCase() ===
                usuarioSalvo.email.trim().toLowerCase()
            );
          });

          if (empresaBanco) {
            empresaAtualizada = empresaBanco;
          }
        }
      }

      setNomeEmpresa(
        empresaAtualizada.nomeEmpresa ||
          empresaAtualizada.nome ||
          usuarioSalvo.nomeEmpresa ||
          usuarioSalvo.nome ||
          ''
      );

      setEmailEmpresa(
        empresaAtualizada.email ||
          usuarioSalvo.email ||
          ''
      );

      let enderecoEncontrado =
        empresaAtualizada.enderecoCompleto ||
        empresaAtualizada.endereco ||
        usuarioSalvo.enderecoCompleto ||
        usuarioSalvo.endereco ||
        '';

      const identificador =
        empresaAtualizada.id != null
          ? String(empresaAtualizada.id)
          : (
              empresaAtualizada.email ||
              usuarioSalvo.email ||
              ''
            ).trim().toLowerCase();

      if (identificador) {
        const chaveEnderecos =
          `@enderecos_usuario_${identificador}`;

        const enderecosTexto =
          await AsyncStorage.getItem(chaveEnderecos);

        if (enderecosTexto) {
          const enderecos: Endereco[] =
            JSON.parse(enderecosTexto);

          if (
            Array.isArray(enderecos) &&
            enderecos.length > 0
          ) {
            const principalNaLista = enderecos.find(
              (item) => item.texto === enderecoEncontrado
            );

            if (!enderecoEncontrado || !principalNaLista) {
              enderecoEncontrado =
                enderecos[0].texto || '';
            }
          }
        }
      }

      setEnderecoEmpresa(enderecoEncontrado);
    } catch (erro) {
      console.error(
        'Erro ao carregar dados da empresa:',
        erro
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDadosEmpresa();
    }, [carregarDadosEmpresa])
  );

  if (carregando || !autorizado) {
    return null;
  }

  const nome =
    nomeEmpresa ||
    usuario?.nomeEmpresa ||
    usuario?.nome ||
    'Minha empresa';

  function abrirConfiguracoes() {
    router.push('/configuracoes' as any);
  }

  function alterarEndereco() {
    router.push({
      pathname: '/configuracoes',
      params: { tela: 'enderecos' },
    } as any);
  }

  function abrirProdutos() {
    router.push('/produtosempresa' as any);
  }

  function abrirOfertas() {
    router.push('/ofertasempresa' as any);
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
            <View style={styles.titulosCabecalho}>
              <Text style={styles.tituloCabecalho}>
                Meu perfil
              </Text>

              <Text style={styles.subtituloCabecalho}>
                Informações da sua empresa
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

          <View style={styles.perfilEmpresa}>
            <View style={styles.avatar}>
              <Ionicons
                name="business"
                size={36}
                color={VERDE}
              />
            </View>

            <View style={styles.informacoesEmpresa}>
              <Text style={styles.nome} numberOfLines={2}>
                {nome}
              </Text>

              <View style={styles.seloEmpresa}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#FFFFFF"
                />

                <Text style={styles.seloEmpresaTexto}>
                  Conta empresarial
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CONTEÚDO */}
        <View style={styles.conteudoPrincipal}>
          <Text style={styles.tituloSecao}>
            Área da empresa
          </Text>

          <Text style={styles.descricaoSecao}>
            Acesse rapidamente os recursos da sua loja.
          </Text>

          {/* MEUS PRODUTOS */}
          <Pressable
            onPress={() => router.push('/produtoempresa' as any)}
            style={({ pressed }) => [
              styles.cartaoInformacao,
              pressed && styles.botaoPressionado,
            ]}
          >
            <View style={styles.iconeInformacao}>
              <Ionicons
                name="cube-outline"
                size={24}
                color={VERDE}
              />
            </View>

            <View style={styles.textosInformacao}>
              <Text style={styles.rotuloInformacao}>
                Meus produtos
              </Text>

              <Text style={styles.valorInformacao}>
                Gerencie os produtos da sua loja
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={VERDE}
            />
          </Pressable>

          {/* MINHAS OFERTAS */}
          <Pressable
            onPress={() => router.push('/ofertaempresa' as any)}
            style={({ pressed }) => [
              styles.cartaoInformacao,
              pressed && styles.botaoPressionado,
            ]}
          >
            <View style={styles.iconeInformacao}>
              <Ionicons
                name="pricetag-outline"
                size={24}
                color={VERDE}
              />
            </View>

            <View style={styles.textosInformacao}>
              <Text style={styles.rotuloInformacao}>
                Minhas ofertas
              </Text>

              <Text style={styles.valorInformacao}>
                Confira as ofertas cadastradas
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={VERDE}
            />
          </Pressable>

          {/* ENDEREÇO */}
          <View style={styles.cartaoEndereco}>
            <View style={styles.enderecoCabecalho}>
              <View style={styles.iconeInformacao}>
                <Ionicons
                  name="location-outline"
                  size={24}
                  color={VERDE}
                />
              </View>

              <View style={styles.textosInformacao}>
                <Text style={styles.rotuloInformacao}>
                  Endereço da empresa
                </Text>

                <Text style={styles.valorEndereco}>
                  {enderecoEmpresa ||
                    'Nenhum endereço cadastrado'}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={alterarEndereco}
              style={({ pressed }) => [
                styles.botaoEndereco,
                pressed && styles.botaoPressionado,
              ]}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.textoBotaoEndereco}>
                Alterar endereço
              </Text>
            </Pressable>
          </View>

          {/* DICA */}
          <View style={styles.cartaoDica}>
            <View style={styles.dicaIcone}>
              <Ionicons
                name="leaf-outline"
                size={26}
                color={VERDE}
              />
            </View>

            <View style={styles.dicaTextos}>
              <Text style={styles.dicaTitulo}>
                Sua empresa no Economize
              </Text>

              <Text style={styles.dicaDescricao}>
                Mantenha seus dados atualizados para que
                os clientes encontrem sua empresa com mais facilidade.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={styles.barraContainer}>
        <View style={styles.barra}>
          <Pressable
            hitSlop={10}
            style={({ pressed }) => [
              styles.botaoNavegacao,
              pressed && styles.botaoPressionado,
            ]}
            onPress={() =>
              router.push('/homeempresa' as any)
            }
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
            onPress={() =>
              router.push('/perfilempresa' as any)
            }
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
          onPress={() =>
            router.push('/carrinho' as any)
          }
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

  titulosCabecalho: {
    flex: 1,
    marginRight: 12,
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

  perfilEmpresa: {
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

  informacoesEmpresa: {
    flex: 1,
    minWidth: 0,
  },

  nome: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  seloEmpresa: {
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

  seloEmpresaTexto: {
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

  cartaoInformacao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5ECE6',
    minHeight: 78,
  },

  iconeInformacao: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textosInformacao: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },

  rotuloInformacao: {
    fontSize: 12,
    color: '#7B837B',
    marginBottom: 5,
  },

  valorInformacao: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26382A',
  },

  cartaoEndereco: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5ECE6',
  },

  enderecoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  valorEndereco: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#26382A',
  },

  botaoEndereco: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: VERDE,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 15,
    marginTop: 16,
  },

  textoBotaoEndereco: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cartaoDica: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: VERDE_CLARO,
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
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
    backgroundColor: VERDE_ESCURO,
    borderWidth: 4,
    borderColor: '#F7F9F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoPressionado: {
    opacity: 0.65,
  },
});
