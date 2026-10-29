
import React, { useEffect, useState } from 'react';
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
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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

  if (!numeros) {
    return '';
  }

  const centavos = Number(numeros);
  const valorFormatado = (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `R$ ${valorFormatado}`;
}

function converterPreco(valor: string) {
  const numeros = valor.replace(/\D/g, '');
  return Number(numeros) / 100;
}

type CampoProps = {
  titulo: string;
  placeholder: string;
  valor: string;
  aoMudar: (valor: string) => void;
  icone: keyof typeof Ionicons.glyphMap;
  teclado?: 'default' | 'numeric' | 'url';
  multiline?: boolean;
};

function Campo({
  titulo,
  placeholder,
  valor,
  aoMudar,
  icone,
  teclado = 'default',
  multiline = false,
}: CampoProps) {
  return (
    <View style={styles.grupoCampo}>
      <Text style={styles.rotulo}>{titulo}</Text>

      <View
        style={[
          styles.caixaCampo,
          multiline && styles.caixaMultiline,
        ]}
      >
        <Ionicons
          name={icone}
          size={20}
          color={VERDE}
          style={styles.iconeCampo}
        />

        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
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
          autoCapitalize="sentences"
          autoCorrect={false}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          underlineColorAndroid="transparent"
          selectionColor={VERDE}
        />
      </View>
    </View>
  );
}

export default function NovoProduto() {
  const router = useRouter();

  const { usuario, carregando, autorizado } =
    useAutenticacao('empresa');

  const { categorias } = Dados();

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const precoNumerico = converterPreco(preco);

  const camposCompletos =
    nome.trim().length > 0 &&
    categoria !== '' &&
    Number.isFinite(precoNumerico) &&
    precoNumerico > 0;

  const mostrarAviso = tentouSalvar && !camposCompletos;

  useEffect(() => {
    if (!sucesso) {
      return;
    }

    const temporizador = setTimeout(() => {
      setSucesso(false);
      router.replace(ROTA_HOME as any);
    }, TEMPO_TELA_SUCESSO);

    return () => clearTimeout(temporizador);
  }, [sucesso, router]);

  async function salvar() {
    setTentouSalvar(true);

    if (!camposCompletos) {
      return;
    }

    if (!usuario?.id) {
      Alert.alert(
        'Erro',
        'Não foi possível identificar a empresa logada.',
      );
      return;
    }

    setSalvando(true);

    try {
      const dadosIniciais = Dados().produtos;

      const conteudoSalvo = await AsyncStorage.getItem(
        CHAVE_PRODUTOS,
      );

      let produtosSalvos: Produto[] = [...dadosIniciais];

      if (conteudoSalvo) {
        try {
          const parseado: unknown = JSON.parse(conteudoSalvo);

          if (Array.isArray(parseado)) {
            const produtosValidos = parseado.filter(
              (item): item is Produto =>
                item !== null &&
                typeof item === 'object' &&
                typeof (item as Produto).id === 'string' &&
                typeof (item as Produto).nome === 'string' &&
                typeof (item as Produto).preco === 'number',
            );

            produtosSalvos = produtosValidos;
          }
        } catch {
          produtosSalvos = [...dadosIniciais];
        }
      }

      const maiorId = produtosSalvos.reduce((maior, produto) => {
        const idNumerico = Number(produto.id);

        return Number.isFinite(idNumerico)
          ? Math.max(maior, idNumerico)
          : maior;
      }, 0);

      const novoProduto: Produto & { descricao?: string } = {
        id: String(maiorId + 1),
        nome: nome.trim(),
        unidade: 'Un',
        preco: precoNumerico,
        icone: 'basket-outline',
        imagem: imagem.trim() || undefined,
        categoria,
        empresa: Number(usuario.id),
        descricao: descricao.trim() || undefined,
        oferta: false,
      };

      const listaAtualizada = [
        ...produtosSalvos.filter(
          (produto) => String(produto.id) !== novoProduto.id,
        ),
        novoProduto,
      ];

      await AsyncStorage.setItem(
        CHAVE_PRODUTOS,
        JSON.stringify(listaAtualizada),
      );

      setNome('');
      setCategoria('');
      setPreco('');
      setImagem('');
      setDescricao('');
      setTentouSalvar(false);
      setSucesso(true);
    } catch (erro) {
      console.error('Erro ao salvar produto:', erro);

      Alert.alert(
        'Não foi possível salvar',
        'Ocorreu um erro ao cadastrar o produto. Tente novamente.',
      );
    } finally {
      setSalvando(false);
    }
  }

  if (sucesso) {
    return (
      <View style={styles.telaSucesso}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={VERDE}
        />

        <View style={styles.circuloSucesso}>
          <Ionicons
            name="checkmark"
            size={60}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.textoSucesso}>
          Produto cadastrado!
        </Text>
      </View>
    );
  }

  if (carregando || !autorizado) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={VERDE}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* CABEÇALHO IGUAL AO DE MEUS PRODUTOS */}
        <View style={styles.cabecalho}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => router.push('/homeempresa' as any)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Voltar para o início"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloCabecalho}>
              Novo produto
            </Text>

            <Text style={styles.subtituloCabecalho}>
              Adicione ao seu catálogo
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cartaoIntroducao}>
            <View style={styles.iconeIntroducao}>
              <Ionicons
                name="leaf-outline"
                size={25}
                color={VERDE}
              />
            </View>

            <Text style={styles.tituloIntroducao}>
              Vamos cadastrar?
            </Text>
          </View>

          <View style={styles.cartaoFormulario}>
            <Text style={styles.tituloFormulario}>
              Informações do produto
            </Text>

            <Text style={styles.textoFormulario}>
              Preencha os campos abaixo. Os campos com * são obrigatórios.
            </Text>

            <Campo
              titulo="Nome do produto *"
              placeholder="Ex.: Arroz branco 5 kg"
              valor={nome}
              aoMudar={setNome}
              icone="pricetag-outline"
            />

            <View style={styles.grupoCampo}>
              <Text style={styles.rotulo}>Categoria *</Text>

              <View style={styles.listaCategorias}>
                {categorias.map((item) => {
                  const selecionada = categoria === item.id;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.botaoCategoria,
                        selecionada && styles.categoriaSelecionada,
                      ]}
                      onPress={() => setCategoria(item.id)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={item.icone as keyof typeof Ionicons.glyphMap}
                        size={18}
                        color={selecionada ? '#FFFFFF' : VERDE}
                      />

                      <Text
                        style={[
                          styles.textoCategoria,
                          selecionada &&
                            styles.textoCategoriaSelecionada,
                        ]}
                      >
                        {item.nome}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Campo
              titulo="Preço *"
              placeholder="R$ 0,00"
              valor={preco}
              aoMudar={(valor) => setPreco(formatarMoeda(valor))}
              icone="cash-outline"
              teclado="numeric"
            />

            <Campo
              titulo="Link da imagem (opcional)"
              placeholder="https://..."
              valor={imagem}
              aoMudar={setImagem}
              icone="image-outline"
              teclado="url"
            />

            <Campo
              titulo="Descrição (opcional)"
              placeholder="Informações adicionais sobre o produto"
              valor={descricao}
              aoMudar={setDescricao}
              icone="document-text-outline"
              multiline
            />

            {mostrarAviso && (
              <View style={styles.avisoErro}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#B3261E"
                />

                <Text style={styles.textoAvisoErro}>
                  Preencha os campos obrigatórios.
                </Text>
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

                  <Text style={styles.textoBotaoSalvar}>
                    Cadastrar produto
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.espacoFinal} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },

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

  // CABEÇALHO NO MESMO PADRÃO DE MEUS PRODUTOS
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

  cartaoIntroducao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E7ECE8',
  },

  iconeIntroducao: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tituloIntroducao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: VERDE_ESCURO,
  },

  cartaoFormulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 19,
    borderWidth: 1,
    borderColor: '#E7ECE8',
  },

  tituloFormulario: {
    fontSize: 19,
    fontWeight: 'bold',
    color: VERDE_ESCURO,
  },

  textoFormulario: {
    fontSize: 12,
    color: CINZA,
    marginTop: 5,
    marginBottom: 22,
  },

  grupoCampo: {
    marginBottom: 19,
  },

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

  caixaMultiline: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: 13,
  },

  iconeCampo: {
    marginRight: 10,
  },

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
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          boxShadow: 'none',
        } as any)
      : {}),
  },

  inputMultiline: {
    minHeight: 75,
    paddingTop: 0,
    textAlignVertical: 'top',
  },

  listaCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  botaoCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE8DE',
    backgroundColor: '#FFFFFF',
  },

  categoriaSelecionada: {
    backgroundColor: VERDE,
    borderColor: VERDE,
  },

  textoCategoria: {
    fontSize: 12,
    fontWeight: '600',
    color: VERDE_ESCURO,
  },

  textoCategoriaSelecionada: {
    color: '#FFFFFF',
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },

  botaoDesabilitado: {
    opacity: 0.65,
  },

  textoBotaoSalvar: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  espacoFinal: {
    height: 20,
  },
});
