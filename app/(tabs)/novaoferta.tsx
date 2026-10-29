
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAutenticacao } from '../components/autenticaTelas';
import Dados, { type Produto } from '../rotaServidor/dadosProdutos';

const VERDE = '#41805a';
const VERDE_ESCURO = '#245D39';
const VERDE_CLARO = '#EAF4EC';
const FUNDO = '#F7F9F7';
const TEXTO = '#294531';
const CINZA = '#7B887F';
const CHAVE_PRODUTOS = 'produtos';
const TEMPO_TELA_SUCESSO = 2000;
const ROTA_HOME = '/homeempresa';

function formatarMoeda(valor: string) {
  const numeros = valor.replace(/\D/g, '');
  if (!numeros) return '';

  return `R$ ${(Number(numeros) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function converterPreco(valor: string) {
  const numeros = valor.replace(/\D/g, '');
  return Number(numeros) / 100;
}

function numeroParaMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function produtoValido(valor: unknown): valor is Produto {
  if (!valor || typeof valor !== 'object') return false;

  const produto = valor as Produto;

  return (
    typeof produto.id === 'string' &&
    typeof produto.nome === 'string' &&
    typeof produto.preco === 'number'
  );
}

type CampoProps = {
  titulo: string;
  placeholder: string;
  valor: string;
  aoMudar: (valor: string) => void;
  icone: keyof typeof Ionicons.glyphMap;
  teclado?: 'default' | 'numeric';
};

function Campo({
  titulo,
  placeholder,
  valor,
  aoMudar,
  icone,
  teclado = 'default',
}: CampoProps) {
  return (
    <View style={styles.grupoCampo}>
      <Text style={styles.rotulo}>{titulo}</Text>

      <View style={styles.caixaCampo}>
        <Ionicons
          name={icone}
          size={20}
          color={VERDE}
          style={styles.iconeCampo}
        />

        <TextInput
          style={[
            styles.input,
            Platform.OS === 'web' && ({
              outlineStyle: 'none',
              outlineWidth: 0,
              boxShadow: 'none',
            } as any),
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9AA49C"
          value={valor}
          onChangeText={aoMudar}
          keyboardType={teclado}
          autoCorrect={false}
          underlineColorAndroid="transparent"
          selectionColor={VERDE}
        />
      </View>
    </View>
  );
}

export default function NovaOferta() {
  const router = useRouter();
  const { id: idParam } = useLocalSearchParams<{ id?: string }>();

  const { usuario, carregando, autorizado } =
    useAutenticacao('empresa');

  const [todos, setTodos] = useState<Produto[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  const [busca, setBusca] = useState('');
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [precoOferta, setPrecoOferta] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregar() {
        try {
          const conteudo = await AsyncStorage.getItem(CHAVE_PRODUTOS);
          let lista: Produto[] = Dados().produtos;

          if (conteudo) {
            const parseado: unknown = JSON.parse(conteudo);

            if (Array.isArray(parseado)) {
              lista = parseado.filter(produtoValido);
            }
          }

          if (ativo) setTodos(lista);
        } catch (erro) {
          console.error('Erro ao carregar produtos:', erro);

          if (ativo) setTodos(Dados().produtos);
        } finally {
          if (ativo) setCarregandoLista(false);
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, []),
  );

  const produtosEmpresa = useMemo(
    () =>
      todos.filter(
        (produto) =>
          usuario?.id != null &&
          String(produto.empresa) === String(usuario.id),
      ),
    [todos, usuario?.id],
  );

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    return produtosEmpresa.filter((produto) =>
      produto.nome.toLocaleLowerCase('pt-BR').includes(termo),
    );
  }, [produtosEmpresa, busca]);

  const produtoSelecionado = produtosEmpresa.find(
    (produto) => String(produto.id) === String(selecionadoId),
  );

  function selecionarProduto(produto: Produto) {
    setSelecionadoId(String(produto.id));
    setTentouSalvar(false);

    setPrecoOferta(
      produto.oferta === true && typeof produto.precoOferta === 'number'
        ? numeroParaMoeda(produto.precoOferta)
        : '',
    );
  }

  useEffect(() => {
    if (!idParam || selecionadoId !== null) return;

    const produto = produtosEmpresa.find(
      (item) => String(item.id) === String(idParam),
    );

    if (produto) selecionarProduto(produto);
  }, [idParam, produtosEmpresa, selecionadoId]);

  const precoOfertaNumerico = converterPreco(precoOferta);

  const precoValido =
    Number.isFinite(precoOfertaNumerico) && precoOfertaNumerico > 0;

  const menorQueOriginal =
    produtoSelecionado !== undefined &&
    precoOfertaNumerico < produtoSelecionado.preco;

  const podeSalvar =
    produtoSelecionado !== undefined && precoValido && menorQueOriginal;

  let mensagemErro = '';

  if (tentouSalvar && !podeSalvar) {
    if (!produtoSelecionado) {
      mensagemErro = 'Escolha o produto que entrará em oferta.';
    } else if (!precoValido) {
      mensagemErro = 'Informe o preço da oferta.';
    } else if (!menorQueOriginal) {
      mensagemErro = 'O preço da oferta precisa ser menor que o preço atual.';
    }
  }

  useEffect(() => {
    if (!sucesso) return;

    const temporizador = setTimeout(() => {
      setSucesso(false);
      router.replace(ROTA_HOME as any);
    }, TEMPO_TELA_SUCESSO);

    return () => clearTimeout(temporizador);
  }, [sucesso, router]);

  async function salvar() {
    setTentouSalvar(true);

    if (!podeSalvar || !produtoSelecionado) return;

    setSalvando(true);

    try {
      const conteudo = await AsyncStorage.getItem(CHAVE_PRODUTOS);
      let lista: Produto[] = Dados().produtos;

      if (conteudo) {
        const parseado: unknown = JSON.parse(conteudo);

        if (Array.isArray(parseado)) {
          lista = parseado.filter(produtoValido);
        }
      }

      const listaAtualizada = lista.map((produto) =>
        String(produto.id) === String(produtoSelecionado.id)
          ? {
              ...produto,
              oferta: true,
              precoOferta: precoOfertaNumerico,
            }
          : produto,
      );

      await AsyncStorage.setItem(
        CHAVE_PRODUTOS,
        JSON.stringify(listaAtualizada),
      );

      setSelecionadoId(null);
      setPrecoOferta('');
      setBusca('');
      setTentouSalvar(false);
      setSucesso(true);
    } catch (erro) {
      console.error('Erro ao salvar oferta:', erro);

      Alert.alert(
        'Não foi possível salvar',
        'Ocorreu um erro ao criar a oferta. Tente novamente.',
      );
    } finally {
      setSalvando(false);
    }
  }

  if (sucesso) {
    return (
      <View style={styles.telaSucesso}>
        <StatusBar barStyle="light-content" backgroundColor={VERDE} />

        <View style={styles.circuloSucesso}>
          <Ionicons name="checkmark" size={60} color="#FFFFFF" />
        </View>

        <Text style={styles.textoSucesso}>Oferta criada!</Text>
      </View>
    );
  }

  if (carregando || !autorizado) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={VERDE} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.cabecalho}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => router.push(ROTA_HOME as any)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Voltar para o início"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloCabecalho}>Nova oferta</Text>
            <Text style={styles.subtituloCabecalho}>
              Coloque um produto seu em promoção
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cartaoFormulario}>
            <Text style={styles.tituloFormulario}>1. Escolha o produto</Text>

            <Text style={styles.textoFormulario}>
              A oferta altera o preço de um produto já cadastrado. O preço
              original aparece riscado para o cliente.
            </Text>

            <Campo
              titulo="Buscar produto"
              placeholder="Digite o nome"
              valor={busca}
              aoMudar={setBusca}
              icone="search-outline"
            />

            {carregandoLista ? (
              <ActivityIndicator color={VERDE} style={styles.carregando} />
            ) : listaFiltrada.length === 0 ? (
              <View style={styles.vazio}>
                <Ionicons name="cube-outline" size={30} color={VERDE} />

                <Text style={styles.vazioTexto}>
                  {produtosEmpresa.length === 0
                    ? 'Você ainda não tem produtos. Cadastre um produto primeiro.'
                    : 'Nenhum produto encontrado.'}
                </Text>

                {produtosEmpresa.length === 0 && (
                  <TouchableOpacity
                    style={styles.botaoCadastrarProduto}
                    onPress={() => router.push('/novoproduto' as any)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.textoBotaoSalvar}>
                      Cadastrar produto
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.listaProdutos}>
                {listaFiltrada.map((produto) => {
                  const selecionado =
                    String(produto.id) === String(selecionadoId);

                  return (
                    <TouchableOpacity
                      key={String(produto.id)}
                      style={[
                        styles.itemProduto,
                        selecionado && styles.itemProdutoSelecionado,
                      ]}
                      onPress={() => selecionarProduto(produto)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.itemImagem}>
                        {produto.imagem ? (
                          <Image
                            source={{ uri: produto.imagem }}
                            style={styles.itemFoto}
                            resizeMode="contain"
                          />
                        ) : (
                          <Ionicons
                            name="cube-outline"
                            size={24}
                            color={VERDE}
                          />
                        )}
                      </View>

                      <View style={styles.itemInfo}>
                        <Text style={styles.itemNome} numberOfLines={2}>
                          {produto.nome}
                        </Text>

                        <Text style={styles.itemPreco}>
                          {numeroParaMoeda(produto.preco)}
                          {produto.oferta === true &&
                          typeof produto.precoOferta === 'number'
                            ? `  •  oferta ${numeroParaMoeda(produto.precoOferta)}`
                            : ''}
                        </Text>
                      </View>

                      <Ionicons
                        name={
                          selecionado
                            ? 'checkmark-circle'
                            : 'ellipse-outline'
                        }
                        size={24}
                        color={selecionado ? VERDE : '#B8C4BB'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {produtoSelecionado && (
            <View style={[styles.cartaoFormulario, styles.cartaoSeguinte]}>
              <Text style={styles.tituloFormulario}>2. Preço da oferta</Text>

              <View style={styles.previa}>
                <Text style={styles.previaRotulo}>Como vai aparecer</Text>

                <View style={styles.previaPrecos}>
                  <Text style={styles.precoRiscado}>
                    {numeroParaMoeda(produtoSelecionado.preco)}
                  </Text>

                  <Text style={styles.precoPromo}>
                    {precoValido
                      ? numeroParaMoeda(precoOfertaNumerico)
                      : 'R$ 0,00'}
                  </Text>
                </View>
              </View>

              <Campo
                titulo="Preço da oferta *"
                placeholder="R$ 0,00"
                valor={precoOferta}
                aoMudar={(valor) => setPrecoOferta(formatarMoeda(valor))}
                icone="cash-outline"
                teclado="numeric"
              />

              {mensagemErro !== '' && (
                <View style={styles.avisoErro}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#B3261E"
                  />
                  <Text style={styles.textoAvisoErro}>{mensagemErro}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.botaoSalvar,
                  salvando && styles.botaoDesabilitado,
                ]}
                onPress={salvar}
                disabled={salvando}
                activeOpacity={0.85}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={21}
                      color="#FFFFFF"
                    />
                    <Text style={styles.textoBotaoSalvar}>Criar oferta</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!produtoSelecionado && tentouSalvar && (
            <View style={styles.avisoErro}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#B3261E"
              />
              <Text style={styles.textoAvisoErro}>
                Escolha o produto que entrará em oferta.
              </Text>
            </View>
          )}

          <View style={styles.espacoFinal} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: FUNDO },

  telaSucesso: {
    flex: 1,
    backgroundColor: VERDE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  circuloSucesso: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSucesso: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  cabecalho: {
    backgroundColor: VERDE,
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    flexShrink: 0,
  },
  botaoVoltar: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textosCabecalho: {
    flex: 1,
    minWidth: 0,
  },
  tituloCabecalho: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtituloCabecalho: {
    fontSize: 13,
    color: '#E7F2E9',
    marginTop: 5,
  },

  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 20,
  },
  cartaoFormulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 19,
    borderWidth: 1,
    borderColor: '#E7ECE8',
  },
  cartaoSeguinte: { marginTop: 16 },
  tituloFormulario: {
    fontSize: 19,
    fontWeight: 'bold',
    color: VERDE_ESCURO,
  },
  textoFormulario: {
    fontSize: 12,
    color: CINZA,
    marginTop: 5,
    marginBottom: 20,
    lineHeight: 18,
  },
  grupoCampo: { marginBottom: 19 },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXTO,
    marginBottom: 9,
  },
  caixaCampo: {
    minHeight: 51,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1E9E2',
    backgroundColor: '#FBFCFB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },
  iconeCampo: { marginRight: 10 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 49,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 14,
    color: TEXTO,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  carregando: { marginVertical: 20 },
  vazio: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  vazioTexto: {
    fontSize: 13,
    color: CINZA,
    textAlign: 'center',
  },
  botaoCadastrarProduto: {
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: VERDE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 6,
  },
  listaProdutos: { gap: 10 },
  itemProduto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 11,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E1E9E2',
    backgroundColor: '#FBFCFB',
  },
  itemProdutoSelecionado: {
    borderColor: VERDE,
    backgroundColor: VERDE_CLARO,
  },
  itemImagem: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemFoto: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemNome: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXTO,
  },
  itemPreco: {
    fontSize: 12,
    color: CINZA,
    marginTop: 3,
  },
  previa: {
    backgroundColor: VERDE_CLARO,
    borderRadius: 15,
    padding: 14,
    marginTop: 14,
    marginBottom: 20,
  },
  previaRotulo: {
    fontSize: 12,
    color: CINZA,
    marginBottom: 6,
  },
  previaPrecos: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  precoRiscado: {
    fontSize: 15,
    color: '#8A938C',
    textDecorationLine: 'line-through',
  },
  precoPromo: {
    fontSize: 24,
    fontWeight: '800',
    color: VERDE_ESCURO,
  },
  avisoErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDECEA',
    borderWidth: 1,
    borderColor: '#F5C2BE',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 14,
  },
  textoAvisoErro: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#B3261E',
  },
  botaoSalvar: {
    minHeight: 53,
    borderRadius: 15,
    backgroundColor: VERDE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 3,
    shadowColor: VERDE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  botaoDesabilitado: { opacity: 0.65 },
  textoBotaoSalvar: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  espacoFinal: { height: 20 },
});
