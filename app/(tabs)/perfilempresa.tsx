
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
  id?: string;
  nome?: string;
  texto?: string;
};

export default function PerfilEmpresa() {
  const router = useRouter();

  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [emailEmpresa, setEmailEmpresa] = useState('');
  const [telefoneEmpresa, setTelefoneEmpresa] = useState('');
  const [documentoEmpresa, setDocumentoEmpresa] = useState('');
  const [enderecoEmpresa, setEnderecoEmpresa] = useState<Endereco | null>(null);

  const { usuario, carregando, autorizado } =
    useAutenticacao('empresa');

  const carregarDadosEmpresa = useCallback(async () => {
    try {
      const usuarioTexto = await AsyncStorage.getItem(
        CHAVE_USUARIO_LOGADO,
      );

      if (!usuarioTexto) {
        setNomeEmpresa('');
        setEmailEmpresa('');
        setTelefoneEmpresa('');
        setDocumentoEmpresa('');
        setEnderecoEmpresa(null);
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
              return String(u.id) === String(usuarioSalvo.id);
            }

            return Boolean(
              usuarioSalvo.email &&
                String(u.email ?? '').trim().toLowerCase() ===
                  String(usuarioSalvo.email).trim().toLowerCase(),
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

      setEmailEmpresa(
        empresaAtualizada.email ||
          usuarioSalvo.email ||
          '',
      );

      setDocumentoEmpresa(
        empresaAtualizada.documento ||
          empresaAtualizada.cnpj ||
          empresaAtualizada.cpf ||
          usuarioSalvo.documento ||
          usuarioSalvo.cnpj ||
          usuarioSalvo.cpf ||
          '',
      );

      const identificador =
        empresaAtualizada.id != null
          ? String(empresaAtualizada.id)
          : String(
              empresaAtualizada.email ||
                usuarioSalvo.email ||
                '',
            ).trim().toLowerCase();

      // TELEFONE
      const telefoneSalvo = identificador
        ? await AsyncStorage.getItem(
            `@telefone_usuario_${identificador}`,
          )
        : null;

      setTelefoneEmpresa(
        telefoneSalvo ||
          empresaAtualizada.telefone ||
          usuarioSalvo.telefone ||
          '',
      );

      // ENDEREÇO
      let enderecoEncontrado: Endereco | null = null;

      const enderecoAntigo =
        empresaAtualizada.enderecoCompleto ||
        empresaAtualizada.endereco ||
        usuarioSalvo.enderecoCompleto ||
        usuarioSalvo.endereco ||
        '';

      if (identificador) {
        const enderecosTexto = await AsyncStorage.getItem(
          `@enderecos_usuario_${identificador}`,
        );

        if (enderecosTexto !== null) {
          const enderecos = JSON.parse(enderecosTexto);

          if (Array.isArray(enderecos) && enderecos.length > 0) {
            const primeiro = enderecos[0];

            enderecoEncontrado =
              typeof primeiro === 'string'
                ? { nome: 'Endereço principal', texto: primeiro }
                : primeiro;
          }
        }
      }

      if (!enderecoEncontrado && enderecoAntigo) {
        enderecoEncontrado = {
          nome: 'Endereço principal',
          texto:
            typeof enderecoAntigo === 'string'
              ? enderecoAntigo
              : enderecoAntigo.texto || '',
        };
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
            <View>
              <Text style={styles.tituloCabecalho}>
                Meu perfil
              </Text>

              <Text style={styles.subtituloCabecalho}>
                Suas informações e dados empresariais
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

          {/* INFORMAÇÕES DA EMPRESA */}
          <View style={styles.perfilEmpresa}>
            <View style={styles.avatar}>
              <Ionicons
                name="business"
                size={38}
                color={VERDE}
              />
            </View>

            <View style={styles.informacoesEmpresa}>
              <Text style={styles.nome} numberOfLines={2}>
                {nome}
              </Text>

              <View style={styles.informacaoVerdeLinha}>
                <Ionicons
                  name="mail-outline"
                  size={15}
                  color="#E7F2E9"
                />

                <Text style={styles.email} numberOfLines={1}>
                  {emailEmpresa || 'E-mail não informado'}
                </Text>
              </View>

              <View style={styles.informacaoVerdeLinha}>
                <Ionicons
                  name="call-outline"
                  size={15}
                  color="#E7F2E9"
                />

                <Text style={styles.telefone} numberOfLines={1}>
                  {telefoneEmpresa || 'Telefone não informado'}
                </Text>
              </View>

              <View style={styles.informacaoVerdeLinha}>
                <Ionicons
                  name="document-text-outline"
                  size={15}
                  color="#E7F2E9"
                />

                <Text style={styles.telefone} numberOfLines={1}>
                  CNPJ: {documentoEmpresa || 'Não informado'}
                </Text>
              </View>

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
            Confira as informações e a localização da sua empresa.
          </Text>

          {/* ENDEREÇO DA EMPRESA */}
          <Pressable
            style={({ pressed }) => [
              styles.cartaoEndereco,
              pressed && styles.cartaoPressionado,
            ]}
            onPress={alterarEndereco}
          >
            <View style={styles.enderecoCabecalho}>
              <View style={styles.iconeEndereco}>
                <Ionicons
                  name="location"
                  size={23}
                  color={VERDE}
                />
              </View>

              <View style={styles.enderecoTitulos}>
                <Text style={styles.tituloCartao}>
                  Endereço da empresa
                </Text>

                <Text style={styles.enderecoNome}>
                  {enderecoEmpresa?.nome ||
                    'Nenhum endereço cadastrado'}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={21}
                color="#8B968C"
              />
            </View>

            {enderecoEmpresa?.texto ? (
              <View style={styles.enderecoDetalhe}>
                <Ionicons
                  name="navigate-outline"
                  size={17}
                  color="#718174"
                />

                <Text style={styles.enderecoTexto}>
                  {enderecoEmpresa.texto}
                </Text>
              </View>
            ) : (
              <Text style={styles.enderecoVazio}>
                Toque para cadastrar o endereço da sua loja.
              </Text>
            )}
          </Pressable>

          {/* ODS 12 */}
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

      {/* RODAPÉ IGUAL AO HOME */}
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
            accessibilityRole="button"
            accessibilityLabel="Início"
          >
            <Ionicons
              name="home"
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
            accessibilityRole="button"
            accessibilityLabel="Perfil"
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

  // CABEÇALHO
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

  informacaoVerdeLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
  },

  email: {
    fontSize: 13,
    color: '#E7F2E9',
    flex: 1,
  },

  telefone: {
    fontSize: 13,
    color: '#E7F2E9',
    flex: 1,
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

  // CONTEÚDO
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

  // ENDEREÇO
  cartaoEndereco: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E3EBE4',
  },

  cartaoPressionado: {
    opacity: 0.75,
  },

  enderecoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconeEndereco: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },

  enderecoTitulos: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  tituloCartao: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26382A',
  },

  enderecoNome: {
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

  enderecoTexto: {
    flex: 1,
    fontSize: 13,
    color: '#68746A',
    lineHeight: 20,
  },

  enderecoVazio: {
    fontSize: 12,
    color: '#8B968C',
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF1ED',
  },

  // ODS 12
  cartaoODS: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#DCE9DE',
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

  // RODAPÉ
  barraContainer: {
    height: 78,
    position: 'relative',
    backgroundColor: FUNDO,
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

  botaoPressionado: {
    opacity: 0.65,
  },
});
