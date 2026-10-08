import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Carrinho() {
  const router = useRouter();

  const [produtos, setProdutos] = useState([
    {
      id: 1,
      nome: 'Arroz branco Urbano',
      descricao: '1Kg - Combo atacadista',
      preco: 24.90,
      quantidade: 2,
      imagem: '',
    },
    {
      id: 2,
      nome: 'Banana Nanica',
      descricao: '1Kg - Combo atacadista',
      preco: 3.49,
      quantidade: 1,
      imagem: '',
    },
    {
      id: 3,
      nome: 'Leite integral',
      descricao: '1L - Fort atacadista',
      preco: 4.99,
      quantidade: 3,
      imagem: '',
    },
  ]);

  // =========================
  // AUMENTAR QUANTIDADE
  // =========================
  function aumentarQuantidade(id) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((produto) => {
        if (produto.id === id) {
          return {
            ...produto,
            quantidade: produto.quantidade + 1,
          };
        }

        return produto;
      })
    );
  }

  // =========================
  // DIMINUIR QUANTIDADE
  // =========================
  function diminuirQuantidade(id) {
    setProdutos((produtosAtuais) => {
      return produtosAtuais
        .map((produto) => {
          if (produto.id === id) {
            return {
              ...produto,
              quantidade: produto.quantidade - 1,
            };
          }

          return produto;
        })
        .filter((produto) => produto.quantidade > 0);
    });
  }

  // =========================
  // REMOVER PRODUTO
  // =========================
  function removerProduto(id) {
    setProdutos((produtosAtuais) => {
      return produtosAtuais.filter(
        (produto) => produto.id !== id
      );
    });
  }

  // =========================
  // LIMPAR CARRINHO
  // =========================
  function limparCarrinho() {
    setProdutos([]);
  }

  // =========================
  // VALORES
  // =========================

  const quantidadeTotal = produtos.reduce(
    (total, produto) =>
      total + produto.quantidade,
    0
  );

  const subtotal = produtos.reduce(
    (total, produto) =>
      total +
      produto.preco * produto.quantidade,
    0
  );

  const taxaEntrega = 0;

  const total = subtotal + taxaEntrega;

  function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return (
    <View style={styles.container}>

      {/* =========================
          CABEÇALHO
      ========================= */}
      <View style={styles.cabecalho}>

        {/* SETA */}
        <Pressable
          style={styles.botaoVoltar}
          onPress={() => router.push('/home')}
        >
          <Ionicons
            name="arrow-back"
            size={32}
            color="#41805a"
          />
        </Pressable>

        <Text style={styles.titulo}>
          Carrinho
        </Text>

        {/* LIMPAR */}
        <Pressable
          onPress={limparCarrinho}
          hitSlop={10}
        >
          <Text style={styles.limpar}>
            Limpar
          </Text>
        </Pressable>

      </View>

      {/* =========================
          CARRINHO COM PRODUTOS
      ========================= */}
      {produtos.length > 0 && (
        <>
          {produtos.map((produto) => (

            <View
              style={styles.produto}
              key={produto.id}
            >

              {/* IMAGEM */}
              <Image
                source={{
                  uri: produto.imagem,
                }}
                style={styles.imagem}
              />

              {/* INFORMAÇÕES */}
              <View style={styles.informacoes}>

                <Text style={styles.nome}>
                  {produto.nome}
                </Text>

                <Text style={styles.descricao}>
                  {produto.descricao}
                </Text>

                <Text style={styles.preco}>
                  {formatarPreco(produto.preco)}
                </Text>

              </View>

              {/* AÇÕES */}
              <View style={styles.acoes}>

                {/* QUANTIDADE */}
                <View style={styles.quantidade}>

                  <Pressable
                    onPress={() =>
                      diminuirQuantidade(produto.id)
                    }
                    style={styles.botaoQuantidade}
                  >
                    <Text style={styles.qtd}>
                      -
                    </Text>
                  </Pressable>

                  <Text style={styles.numeroQuantidade}>
                    {produto.quantidade}
                  </Text>

                  <Pressable
                    onPress={() =>
                      aumentarQuantidade(produto.id)
                    }
                    style={styles.botaoQuantidade}
                  >
                    <Text style={styles.qtd}>
                      +
                    </Text>
                  </Pressable>

                </View>

                {/* LIXEIRA */}
                <Pressable
                  onPress={() =>
                    removerProduto(produto.id)
                  }
                  style={styles.botaoLixeira}
                >
                  <Ionicons
                    name="trash-outline"
                    size={28}
                    color="#41805a"
                  />
                </Pressable>

              </View>

            </View>

          ))}

          {/* =========================
              VALORES
          ========================= */}
          <View style={styles.valores}>

            <View style={styles.linha}>
              <Text style={styles.textoCinza}>
                Subtotal ({quantidadeTotal} itens)
              </Text>

              <Text style={styles.textoCinza}>
                {formatarPreco(subtotal)}
              </Text>
            </View>

            <View style={styles.linha}>
              <Text style={styles.textoCinza}>
                Taxa de entrega
              </Text>

              <Text style={styles.textoCinza}>
                {formatarPreco(taxaEntrega)}
              </Text>
            </View>

            <View style={styles.linha}>
              <Text style={styles.total}>
                Total
              </Text>

              <Text style={styles.total}>
                {formatarPreco(total)}
              </Text>
            </View>

          </View>

          {/* =========================
              PAGAMENTO
          ========================= */}
          <Pressable
            style={styles.botaoPagamento}
            onPress={() => router.push('/')}
          >
            <Text style={styles.textoPagamento}>
              Pagamento
            </Text>

            <Ionicons
              name="arrow-forward"
              size={25}
              color="#fff"
            />
          </Pressable>

        </>
      )}

      {/* =========================
          CARRINHO VAZIO
      ========================= */}
      {produtos.length === 0 && (

        <View style={styles.carrinhoVazio}>

          <Ionicons
            name="cart-outline"
            size={80}
            color="#41805a"
          />

          <Text style={styles.tituloVazio}>
            Seu carrinho está vazio
          </Text>

          <Text style={styles.descricaoVazio}>
            Adicione produtos para continuar.
          </Text>

          {/* CONTINUAR COMPRANDO */}
          <Pressable
            style={styles.botaoContinuar}
            onPress={() => router.push('/home')}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#fff"
            />

            <Text style={styles.textoContinuar}>
              Continuar comprando
            </Text>
          </Pressable>

        </View>

      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },

  // CABEÇALHO
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  botaoVoltar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
  },

  limpar: {
    fontSize: 17,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#41805a',
  },

  // PRODUTO
  produto: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 18,
    minHeight: 108,
    padding: 8,
    marginBottom: 8,
  },

  imagem: {
    width: 62,
    height: 80,
    resizeMode: 'contain',
  },

  informacoes: {
    flex: 1,
    marginLeft: 5,
  },

  nome: {
    fontSize: 18,
  },

  descricao: {
    fontSize: 15,
    color: '#777',
  },

  preco: {
    fontSize: 23,
    color: '#41805a',
    marginTop: 5,
    fontWeight: '500',
  },

  // AÇÕES
  acoes: {
    alignItems: 'center',
    gap: 8,
  },

  quantidade: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 4,
  },

  botaoQuantidade: {
    width: 30,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qtd: {
    fontSize: 22,
  },

  numeroQuantidade: {
    fontSize: 19,
    fontWeight: 'bold',
    minWidth: 25,
    textAlign: 'center',
  },

  botaoLixeira: {
    padding: 3,
  },

  // VALORES
  valores: {
    marginTop: 'auto',
    paddingHorizontal: 8,
    paddingTop: 20,
  },

  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  textoCinza: {
    fontSize: 16,
    color: '#777',
  },

  total: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // PAGAMENTO
  botaoPagamento: {
    height: 52,
    backgroundColor: '#41805a',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    flexDirection: 'row',
    gap: 10,
  },

  textoPagamento: {
    color: '#fff',
    fontSize: 23,
    fontWeight: 'bold',
  },

  // CARRINHO VAZIO
  carrinhoVazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },

  tituloVazio: {
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },

  descricaoVazio: {
    fontSize: 16,
    color: '#777',
    marginTop: 8,
    marginBottom: 25,
  },

  botaoContinuar: {
    backgroundColor: '#41805a',
    height: 52,
    paddingHorizontal: 25,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  textoContinuar: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
