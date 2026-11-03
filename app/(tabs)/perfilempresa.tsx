
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { useAutenticacao } from '@/app/components/autenticaTelas';

const VERDE = '#41805a';
const VERDE_ESCURO = '#245D39';
const VERDE_CLARO = '#E5F1E8';
const FUNDO = '#F7F9F7';

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
  const [enderecoEmpresa, setEnderecoEmpresa] = useState('');

  const { usuario, carregando, autorizado } =
    useAutenticacao('empresa');

  const carregarDadosEmpresa = useCallback(async () => {
    try {
      const usuarioTexto = await AsyncStorage.getItem(
        CHAVE_USUARIO_LOGADO,
      );

      if (!usuarioTexto) {
        setNomeEmpresa('');
        setEnderecoEmpresa('');
        return;
      }

      const usuarioSalvo = JSON.parse(usuarioTexto);
      let empresaAtualizada = usuarioSalvo;

      const usuariosTexto = await AsyncStorage.getItem(
        CHAVE_USUARIOS,
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
                String(u.email ?? '')
                  .trim()
                  .toLowerCase() ===
                  String(usuarioSalvo.email)
                    .trim()
                    .toLowerCase(),
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
          '',
      );

      const identificador =
        empresaAtualizada.id != null
          ? String(empresaAtualizada.id)
          : String(
              empresaAtualizada.email ||
                usuarioSalvo.email ||
                '',
            )
              .trim()
              .toLowerCase();

      let enderecoEncontrado =
        empresaAtualizada.enderecoCompleto ||
        empresaAtualizada.endereco ||
        usuarioSalvo.enderecoCompleto ||
        usuarioSalvo.endereco ||
        '';

      if (identificador) {
        const chaveEnderecos =
          `@enderecos_usuario_${identificador}`;

        const enderecosTexto = await AsyncStorage.getItem(
          chaveEnderecos,
        );

        if (enderecosTexto !== null) {
          const enderecos: Endereco[] =
            JSON.parse(enderecosTexto);

          if (Array.isArray(enderecos)) {
            enderecoEncontrado =
              enderecos.length > 0
                ? enderecos[0].texto || ''
                : '';
          }
        }
      }

      setEnderecoEmpresa(enderecoEncontrado);
    } catch (erro) {
      console.error(
        'Erro ao carregar dados da empresa:',
        erro,
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDadosEmpresa();
    }, [carregarDadosEmpresa]),
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
  router.push({
    pathname: '/configuracoes',
    params: { origem: 'empresa' },
  } as any);
}

  function alterarEndereco() {
    router.push({
      pathname: '/configuracoes',
      params: {
        tela: 'enderecos',
        origem: 'empresa',
      },
    } as any);
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
              <Text
                style={styles.nome}
                numberOfLines={2}
              >
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

        {/* CONTEÚDO DO PERFIL */}
        <View style={styles.conteudoPrincipal}>
          <Text style={styles.tituloSecao}>
            Área da empresa
          </Text>

          <Text style={styles.descricaoSecao}>
            Confira as informações da sua empresa.
          </Text>

          {/* ENDEREÇO DA EMPRESA */}
          <View style={styles.cartaoEndereco}>
            <View style={styles.enderecoCabecalho}>
              <View style={styles.iconeEndereco}>
                <Ionicons
                  name="location"
                  size={25}
                  color={VERDE}
                />
              </View>

              <View style={styles.enderecoTitulos}>
                <Text style={styles.tituloEndereco}>
                  Endereço da empresa
                </Text>

                <Text style={styles.subtituloEndereco}>
                  Localização da sua loja
                </Text>
              </View>
            </View>

            <View style={styles.enderecoConteudo}>
              {enderecoEmpresa ? (
                <>
                  <View style={styles.enderecoStatus}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={VERDE}
                    />

                    <Text style={styles.enderecoStatusTexto}>
                      Endereço cadastrado
                    </Text>
                  </View>

                  <Text style={styles.valorEndereco}>
                    {enderecoEmpresa}
                  </Text>
                </>
              ) : (
                <View style={styles.enderecoVazio}>
                  <Ionicons
                    name="information-circle-outline"
                    size={21}
                    color={VERDE}
                  />

                  <View style={styles.enderecoVazioTextos}>
                    <Text style={styles.enderecoVazioTitulo}>
                      Nenhum endereço cadastrado
                    </Text>

                    <Text style={styles.enderecoVazioDescricao}>
                      Adicione o endereço para manter os dados
                      da sua empresa atualizados.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <Pressable
              onPress={alterarEndereco}
              style={({ pressed }) => [
                styles.botaoEndereco,
                pressed && styles.botaoPressionado,
              ]}
            >
              <Ionicons
                name={
                  enderecoEmpresa
                    ? 'create-outline'
                    : 'add-circle-outline'
                }
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.textoBotaoEndereco}>
                {enderecoEmpresa
                  ? 'Alterar endereço'
                  : 'Cadastrar endereço'}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* ODS 12 — CONSUMO E PRODUÇÃO RESPONSÁVEIS */}
          <View style={styles.cartaoODS}>
            <View style={styles.odsCabecalho}>
              <View style={styles.odsIcone}>
                <Ionicons
                  name="leaf-outline"
                  size={27}
                  color={VERDE}
                />
              </View>

              <View style={styles.odsTitulos}>
                <Text style={styles.odsIdentificacao}>
                  ODS 12
                </Text>

                <Text style={styles.odsTitulo}>
                  Consumo e produção responsáveis
                </Text>
              </View>
            </View>

            <Text style={styles.odsDescricao}>
              O Economize incentiva práticas de consumo mais
              conscientes, aproximando clientes de ofertas e
              ajudando na comparação de preços.
            </Text>

            <View style={styles.odsDivisor} />

            <Text style={styles.odsSubtitulo}>
              Como sua empresa pode contribuir?
            </Text>

            <View style={styles.odsItem}>
              <Ionicons
                name="checkmark-circle"
                size={19}
                color={VERDE}
              />

              <Text style={styles.odsItemTexto}>
                Divulgue ofertas para ajudar os clientes a
                economizar e planejar suas compras.
              </Text>
            </View>

            <View style={styles.odsItem}>
              <Ionicons
                name="checkmark-circle"
                size={19}
                color={VERDE}
              />

              <Text style={styles.odsItemTexto}>
                Evite desperdícios e utilize os recursos da
                sua empresa de forma responsável.
              </Text>
            </View>

            <View style={styles.odsItem}>
              <Ionicons
                name="checkmark-circle"
                size={19}
                color={VERDE}
              />

              <Text style={styles.odsItemTexto}>
                Mantenha os preços e as informações dos
                produtos atualizados para os consumidores.
              </Text>
            </View>

            <View style={styles.odsRodape}>
              <Ionicons
                name="earth-outline"
                size={17}
                color={VERDE_ESCURO}
              />

              <Text style={styles.odsRodapeTexto}>
                Pequenas atitudes contribuem para um consumo
                mais responsável.
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
              size={26}
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
              size={26}
              color="#FFFFFF"
            />

            <Text style={styles.textoNavegacao}>
              Perfil
            </Text>

            <View style={styles.indicadorAtivo} />
          </Pressable>
        </View>
        {/*
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
         */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },

  scroll: {
    flex: 1,
  },

  conteudo: {
    paddingBottom: 24,
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

  cartaoEndereco: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E1EAE2',
    shadowColor: '#193D27',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  enderecoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconeEndereco: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },

  enderecoTitulos: {
    flex: 1,
    marginLeft: 13,
  },

  tituloEndereco: {
    fontSize: 16,
    fontWeight: '800',
    color: '#26382A',
  },

  subtituloEndereco: {
    fontSize: 12,
    color: '#7B837B',
    marginTop: 4,
  },

  enderecoConteudo: {
    backgroundColor: '#F7FAF7',
    borderRadius: 14,
    padding: 13,
    marginTop: 17,
  },

  enderecoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },

  enderecoStatusTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: VERDE_ESCURO,
  },

  valorEndereco: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    color: '#26382A',
  },

  enderecoVazio: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },

  enderecoVazioTextos: {
    flex: 1,
  },

  enderecoVazioTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#26382A',
  },

  enderecoVazioDescricao: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6F7B71',
    marginTop: 5,
  },

  botaoEndereco: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: VERDE,
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginTop: 15,
  },

  textoBotaoEndereco: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cartaoODS: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#DCE9DE',
    shadowColor: '#193D27',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  odsCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  odsIcone: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },

  odsTitulos: {
    flex: 1,
    marginLeft: 13,
  },

  odsIdentificacao: {
    fontSize: 11,
    fontWeight: '800',
    color: VERDE,
    letterSpacing: 1,
    marginBottom: 4,
  },

  odsTitulo: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
    color: VERDE_ESCURO,
  },

  odsDescricao: {
    fontSize: 13,
    lineHeight: 20,
    color: '#56665A',
    marginTop: 16,
  },

  odsDivisor: {
    height: 1,
    backgroundColor: '#E5ECE6',
    marginVertical: 16,
  },

  odsSubtitulo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#26382A',
    marginBottom: 12,
  },

  odsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginBottom: 12,
  },

  odsItemTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: '#526256',
  },

  odsRodape: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: VERDE_CLARO,
    borderRadius: 12,
    padding: 12,
    marginTop: 3,
  },

  odsRodapeTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: VERDE_ESCURO,
  },

    barraContainer: {
  height: 78,
  backgroundColor: FUNDO,
  justifyContent: 'flex-end',
},
barra: {
  height: 67,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: VERDE,
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
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

  indicadorAtivo: {
    width: 24,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginTop: 1,
  },

  botaoPressionado: {
    opacity: 0.65,
  },
});
