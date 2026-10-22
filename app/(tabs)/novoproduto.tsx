import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  type KeyboardTypeOptions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAutenticacao } from '../components/autenticaTelas';
import Dados, { type Produto } from '../rotaServidor/dadosProdutos';

const VERDE = '#3E7B4F';
const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Outros'];
const PRODUTOS_STORAGE_KEY = 'produtos';

type ProdutoArmazenado = Produto & { descricao?: string };

/* ---------- Componentes ---------- */

function Cabecalho({ titulo, onVoltar }: { titulo: string; onVoltar: () => void }) {
  return (
    <View style={styles.cabecalho}>
      <TouchableOpacity onPress={onVoltar}>
        <Ionicons name="chevron-back" size={32} color={VERDE} />
      </TouchableOpacity>
      <Text style={styles.titulo}>{titulo}</Text>
    </View>
  );
}

function Campo({
  placeholder,
  value,
  onChangeText,
  teclado,
}: {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  teclado?: KeyboardTypeOptions;
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#222"
      value={value}
      onChangeText={onChangeText}
      keyboardType={teclado}
      autoCapitalize={teclado === 'url' ? 'none' : undefined}
      autoCorrect={teclado === 'url' ? false : undefined}
    />
  );
}

function SeletorCategoria({
  valor,
  onSelecionar,
}: {
  valor: string;
  onSelecionar: (value: string) => void;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.input, styles.seletor]}
        onPress={() => setAberto(!aberto)}
      >
        <Text style={styles.textoSeletor}>{valor || 'Categoria'}</Text>
        <Ionicons
          name={aberto ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={VERDE}
        />
      </TouchableOpacity>

      {aberto && (
        <FlatList
          data={CATEGORIAS}
          keyExtractor={(item) => item}
          style={styles.listaCategorias}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemCategoria}
              onPress={() => {
                onSelecionar(item);
                setAberto(false);
              }}
            >
              <Text style={styles.textoSeletor}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function BarraInferior({
  onMudarAba,
}: {
  abaAtiva: string;
  onMudarAba: (aba: string) => void;
}) {
  return (
    <View style={styles.barra}>
      <TouchableOpacity onPress={() => onMudarAba('home')}>
        <Ionicons name="home" size={42} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoCentral}
        onPress={() => onMudarAba('produtos')}
      >
        <MaterialCommunityIcons name="package-variant-closed" size={52} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onMudarAba('perfil')}>
        <Ionicons name="person" size={42} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Tela ---------- */

export default function App() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  const [aba, setAba] = useState('produtos');
  const [salvando, setSalvando] = useState(false);
  const { usuario, carregando, autorizado } = useAutenticacao('empresa');

  async function salvar() {
    const precoNumerico = Number(preco.replace(',', '.'));
    const empresaId = Number(usuario?.id);

    if (!nome.trim() || !categoria || !preco.trim() || !Number.isFinite(precoNumerico) || precoNumerico <= 0) {
      Alert.alert('Dados inválidos', 'Informe o nome, a categoria e um preço válido para o produto.');
      return;
    }

    if (!Number.isFinite(empresaId)) {
      Alert.alert('Erro', 'Não foi possível identificar a empresa autenticada.');
      return;
    }

    setSalvando(true);
    try {
      const dadosSalvos = await AsyncStorage.getItem(PRODUTOS_STORAGE_KEY);
      let produtos: ProdutoArmazenado[];

      if (dadosSalvos === null) {
        produtos = Dados().produtos;
      } else {
        const dadosParseados: unknown = JSON.parse(dadosSalvos);
        if (!Array.isArray(dadosParseados)) {
          throw new Error('Os dados de produtos armazenados não estão em formato de lista.');
        }
        produtos = dadosParseados as ProdutoArmazenado[];
      }

      const proximoId = Math.max(0, ...produtos.map((item) => Number(item.id) || 0)) + 1;
      const novoProduto: ProdutoArmazenado = {
        id: String(proximoId),
        nome: nome.trim(),
        unidade: 'Un',
        preco: precoNumerico,
        icone: 'basket-outline',
        imagem: imagem.trim() || undefined,
        categoria,
        empresa: empresaId,
        descricao: descricao.trim() || undefined,
      };

      await AsyncStorage.setItem(
        PRODUTOS_STORAGE_KEY,
        JSON.stringify([...produtos, novoProduto])
      );
      Alert.alert('Produto cadastrado', 'O produto foi adicionado ao catálogo.');
      setNome('');
      setCategoria('');
      setPreco('');
      setDescricao('');
      setImagem('');
    } catch (error) {
      console.error('Erro ao salvar produto no AsyncStorage:', error);
      Alert.alert('Erro ao salvar', 'Não foi possível salvar o produto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }
  if (carregando || !autorizado) {
      return null;
    }

  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.conteudo}>
        <Cabecalho titulo="Novo produto" onVoltar={() => router.back()} />

        <Campo placeholder="Nome do produto" value={nome} onChangeText={setNome} />
        <SeletorCategoria valor={categoria} onSelecionar={setCategoria} />
        <Campo
          placeholder="Preço"
          value={preco}
          onChangeText={setPreco}
          teclado="numeric"
        />
        <Campo
          placeholder="URL da imagem (opcional)"
          value={imagem}
          onChangeText={setImagem}
          teclado="url"
        />
        <Campo
          placeholder="Descrição (opcional)"
          value={descricao}
          onChangeText={setDescricao}
        />

        <TouchableOpacity
          style={styles.botaoSalvar}
          onPress={salvar}
          disabled={salvando}
        >
          <Text style={styles.textoSalvar}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>

      <BarraInferior abaAtiva={aba} onMudarAba={setAba} />
    </SafeAreaView>
  );
}

/* ---------- Estilos ---------- */

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#fff' },
  conteudo: { flex: 1, paddingHorizontal: 26, paddingTop: 20 },

  cabecalho: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 26, fontWeight: 'bold', marginLeft: 14 },

  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 18,
    marginBottom: 10,
  },
  seletor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textoSeletor: { fontSize: 18 },
  listaCategorias: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 14,
    marginBottom: 10,
    maxHeight: 180,
  },
  itemCategoria: { paddingVertical: 12, paddingHorizontal: 18 },

  botaoSalvar: {
    backgroundColor: VERDE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  textoSalvar: { color: '#fff', fontSize: 18 },

  barra: {
    backgroundColor: VERDE,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 78,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  botaoCentral: {
    backgroundColor: VERDE,
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
});