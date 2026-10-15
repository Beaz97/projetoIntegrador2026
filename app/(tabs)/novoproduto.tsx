import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const VERDE = '#3E7B4F';
const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Outros'];

/* ---------- Componentes ---------- */

function Cabecalho({ titulo, onVoltar }) {
  return (
    <View style={styles.cabecalho}>
      <TouchableOpacity onPress={onVoltar}>
        <Ionicons name="chevron-back" size={32} color={VERDE} />
      </TouchableOpacity>
      <Text style={styles.titulo}>{titulo}</Text>
    </View>
  );
}

function AdicionarImagem({ onPress }) {
  return (
    <TouchableOpacity style={styles.caixaImagem} onPress={onPress}>
      <View style={styles.quadradoIcone}>
        <Ionicons name="camera" size={64} color="#555" />
      </View>
      <Text style={styles.textoImagem}>Adicionar imagem</Text>
      <Text style={styles.textoFormato}>(JPG, PNG)</Text>
    </TouchableOpacity>
  );
}

function Campo({ placeholder, value, onChangeText, teclado }) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#222"
      value={value}
      onChangeText={onChangeText}
      keyboardType={teclado}
    />
  );
}

function SeletorCategoria({ valor, onSelecionar }) {
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

function BarraInferior({ abaAtiva, onMudarAba }) {
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
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [aba, setAba] = useState('produtos');

  function salvar() {
    const produto = { nome, categoria, preco, descricao };
    console.log('Produto salvo:', produto);
  }

  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.conteudo}>
        <Cabecalho titulo="Novo produto" onVoltar={() => console.log('voltar')} />

        <AdicionarImagem onPress={() => console.log('abrir galeria')} />

        <Campo placeholder="Nome do produto" value={nome} onChangeText={setNome} />
        <SeletorCategoria valor={categoria} onSelecionar={setCategoria} />
        <Campo
          placeholder="Preço"
          value={preco}
          onChangeText={setPreco}
          teclado="numeric"
        />
        <Campo
          placeholder="Descrição (opcional)"
          value={descricao}
          onChangeText={setDescricao}
        />

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvar}>
          <Text style={styles.textoSalvar}>Salvar</Text>
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

  caixaImagem: {
    backgroundColor: '#E3E3E3',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 14,
  },
  quadradoIcone: {
    backgroundColor: '#C4C4C4',
    width: 122,
    height: 114,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  textoImagem: { fontWeight: 'bold', fontSize: 16 },
  textoFormato: { fontSize: 11 },

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