import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Image, 
} from 'react-native'; 
 
import { useState } from 'react'; 
import { useRouter } from 'expo-router'; 
 
type BotaoProps = { 
  titulo: string; 
  onPress: () => void; 
  branco?: boolean; 
}; 
 
function Botao({ titulo, onPress, branco = false }: BotaoProps) { 
  return ( 
    <Pressable 
      style={[ 
        styles.botao, 
        branco && styles.botaoBranco, 
      ]} 
      onPress={onPress} 
    > 
      <Text 
        style={[ 
          styles.botaoTexto, 
          branco && styles.botaoTextoVerde, 
        ]} 
      > 
        {titulo} 
      </Text> 
    </Pressable> 
  ); 
} 
 
export default function Index() { 
  const router = useRouter(); 
 
  const [pagina, setPagina] = useState(0); 
 
  // =====================================================
  // PRIMEIRA PÁGINA
  // =====================================================

  if (pagina === 0) { 
    return ( 
      <View style={styles.containerVerde}> 
 
        {/* LOGO */} 
        <View style={styles.logoContainer}> 
          <Text style={styles.logo}> 
            Economize 
          </Text> 
 
          <Text style={styles.sloganLogo}> 
            Compare. Escolha. Economize. 
          </Text> 
        </View> 
 
        {/* RODAPÉ */} 
          <View style={styles.rodapePagina1}> 

          <Text style={styles.tituloBranco}> 
            os melhores preços dos{'\n'} 
            mercados bem perto de você 
          </Text> 
          <view />
 
          {/* BOTÃO COMEÇAR */} 
          <Botao 
            titulo="Começar" 
            branco 
            onPress={() => setPagina(1)} 
          /> 
 
          {/* BOLINHAS */} 
          <View style={styles.bolinhas}> 
 
            <Pressable 
              onPress={() => setPagina(0)} 
              style={[ 
                styles.bolinha, 
                styles.bolinhaAtivaVerde, 
              ]} 
            /> 
 
            <Pressable 
              onPress={() => setPagina(1)} 
              style={styles.bolinha} 
            /> 
 
            <Pressable 
              onPress={() => setPagina(2)} 
              style={styles.bolinha} 
            /> 
 
          </View> 
 
        </View> 
 
      </View> 
    ); 
  } 
 
  // =====================================================
  // SEGUNDA PÁGINA
  // =====================================================

  if (pagina === 1) { 
    return ( 
      <View style={styles.containerBranco}> 
 
        {/* BOTÃO VOLTAR */} 
        <Pressable 
          style={styles.voltar} 
          onPress={() => setPagina(0)} 
        > 
          <Text style={styles.voltarTexto}>‹</Text> 
        </Pressable> 
 
        {/* CONTEÚDO */} 
        <View style={styles.conteudo}> 
 
          <Text style={styles.tituloVerde}> 
            Compare preços{'\n'} 
            perto de você 
          </Text> 
 
          <Text style={styles.descricao}> 
            Veja os preços dos mesmos produtos 
            em vários mercados da sua região. 
          </Text> 
 
          {/* IMAGEM */} 
          <Image 
            source={require('../../assets/images/produtos.png')} 
            style={styles.imagemProdutos} 
          /> 
 
        </View> 
 
        {/* RODAPÉ */} 
        <View style={styles.rodapeBranco}> 
 
          <Botao 
            titulo="Continuar" 
            onPress={() => setPagina(2)} 
          /> 
 
          <Text style={styles.login}> 
            Já tem uma conta?{' '} 
            <Text style={styles.loginVerde}> 
              Faça login 
            </Text> 
          </Text> 
 
          {/* BOLINHAS */} 
          <View style={styles.bolinhas}> 
 
            <Pressable 
              onPress={() => setPagina(0)} 
              style={[styles.bolinha, styles.bolinhaBranca]} 
            /> 
 
            <Pressable 
              onPress={() => setPagina(1)} 
              style={[ 
                styles.bolinha, 
                styles.bolinhaBranca,
                styles.bolinhaAtivaBranca, 
              ]} 
            /> 
 
            <Pressable 
              onPress={() => setPagina(2)} 
              style={[styles.bolinha, styles.bolinhaBranca]} 
            /> 
 
          </View> 
 
        </View> 
 
      </View> 
    ); 
  } 
 
  // =====================================================
  // TERCEIRA PÁGINA
  // =====================================================

  return ( 
    <View style={styles.containerBranco}> 
 
      {/* BOTÃO VOLTAR */} 
      <Pressable 
        style={styles.voltar} 
        onPress={() => setPagina(1)} 
      > 
        <Text style={styles.voltarTexto}>‹</Text> 
      </Pressable> 
 
      {/* CONTEÚDO */} 
      <View style={styles.conteudo}> 
 
        <Text style={styles.tituloVerde}> 
          Mais economia{'\n'} 
          no seu dia a dia! 
        </Text> 
 
        <Text style={styles.descricao}> 
          Encontre os melhores preços, faça suas 
          compras com inteligência e economize 
          de verdade. 
        </Text> 
 
        {/* IMAGEM */} 
        <Image 
          source={require('../../assets/images/porquinho.png')} 
          style={styles.imagemPorquinho} 
        /> 
 
      </View> 
 
      {/* RODAPÉ */} 
      <View style={styles.rodapeBranco}> 
 
        <Botao 
          titulo="Entrar" 
          onPress={() => router.push('/senha')} 
        /> 
 
        <Text style={styles.login}> 
          Já tem uma conta?{' '} 
          <Text style={styles.loginVerde}> 
            Faça login 
          </Text> 
        </Text> 
 
        {/* BOLINHAS */} 
        <View style={styles.bolinhas}> 
 
          <Pressable 
            onPress={() => setPagina(0)} 
            style={[styles.bolinha, styles.bolinhaBranca]} 
          /> 
 
          <Pressable 
            onPress={() => setPagina(1)} 
            style={[styles.bolinha, styles.bolinhaBranca]} 
          /> 
 
          <Pressable 
            onPress={() => setPagina(2)} 
            style={[ 
              styles.bolinha, 
              styles.bolinhaBranca,
              styles.bolinhaAtivaBranca, 
            ]} 
          /> 
 
        </View> 
 
      </View> 
 
    </View> 
  ); 
} 
 
// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({ 
 
  // ========================= 
  // PRIMEIRA TELA 
  // ========================= 
 
  containerVerde: { 
    flex: 1, 
    backgroundColor: '#41805A', 
    justifyContent: 'space-between', 
    paddingTop: 135, 
    paddingBottom: 28, 
    paddingHorizontal: 25, 
  }, 
 
  logoContainer: { 
    alignItems: 'center', 
  }, 
 
  logo: { 
    fontSize: 46, 
    fontWeight: '900', 
    color: '#14552F', 
    letterSpacing: -2, 
  }, 
 
  sloganLogo: { 
    fontSize: 10, 
    color: '#14552F', 
    marginTop: -2, 
  }, 
 
  tituloBranco: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '700', 
    textAlign: 'center', 
    lineHeight: 21, 
    marginBottom: 18, 
  }, 
  
  rodapePagina1: {
  width: '100%',
  alignItems: 'center',
  marginBottom: 40,
},
 
  // ========================= 
  // TELAS 2 E 3 
  // ========================= 
 
  containerBranco: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'space-between', 
    paddingTop: 50, 
    paddingBottom: 28, 
    paddingHorizontal: 25, 
  }, 
 
  conteudo: { 
    alignItems: 'center', 
    paddingTop: 45, 
  }, 
 
  tituloVerde: { 
    color: '#315F3C', 
    fontSize: 33, 
    fontWeight: '900', 
    textAlign: 'center', 
    lineHeight: 29, 
  }, 
 
  descricao: { 
    color: '#315F3C', 
    fontSize: 13, 
    fontWeight: '500', 
    textAlign: 'center', 
    lineHeight: 19, 
    marginTop: 12, 
    paddingHorizontal: 15, 
  }, 
 
  // ========================= 
  // IMAGENS 
  // ========================= 
 
  imagemProdutos: { 
    width: 270, 
    height: 220, 
    resizeMode: 'contain', 
    marginTop: 7, 
  }, 
 
  imagemPorquinho: { 
    width: 205, 
    height: 190, 
    resizeMode: 'contain', 
    marginTop: 20, 
  }, 
 
  // ========================= 
  // RODAPÉ 
  // ========================= 
 
  rodape: { 
    width: '100%', 
    alignItems: 'center', 
  }, 
 
  rodapeBranco: { 
    width: '100%', 
    alignItems: 'center', 
  }, 
 
  // ========================= 
  // BOTÕES 
  // ========================= 
 
  botao: { 
    width: '84%', 
    height: 46, 
    backgroundColor: '#41805A', 
    borderRadius: 25, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 15, 
  }, 
 
  botaoBranco: { 
    backgroundColor: '#FFFFFF', 
  }, 
 
  botaoTexto: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '800', 
  }, 
 
  botaoTextoVerde: { 
    color: '#41805A', 
  }, 
 
  // ========================= 
  // LOGIN 
  // ========================= 
 
  login: { 
    color: '#777777', 
    fontSize: 11, 
    marginBottom: 16, 
  }, 
 
  loginVerde: { 
    color: '#41805A', 
    fontWeight: '800', 
    fontSize: 11, 
  }, 
 
  // ========================= 
  // BOLINHAS 
  // ========================= 
 
  bolinhas: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 7, 
  }, 
 
  bolinha: { 
    width: 8, 
    height: 8, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#FFFFFF', 
  }, 

  // Borda verde para as telas brancas
  bolinhaBranca: {
    borderColor: '#41805A',
  },
 
  // Primeira bolinha ativa da tela verde
  bolinhaAtivaVerde: { 
    backgroundColor: '#FFFFFF', 
    borderColor: '#FFFFFF', 
  }, 
 
  // Bolinha ativa nas telas brancas
  bolinhaAtivaBranca: { 
    backgroundColor: '#41805A', 
    borderColor: '#41805A', 
  }, 
 
  // ========================= 
  // BOTÃO VOLTAR 
  // ========================= 
 
  voltar: { 
    position: 'absolute', 
    top: 45, 
    left: 22, 
    width: 38, 
    height: 38, 
    borderRadius: 20, 
    backgroundColor: '#41805A', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 10, 
  }, 
 
  voltarTexto: { 
    color: '#FFFFFF', 
    fontSize: 27, 
    fontWeight: '300', 
    lineHeight: 29, 
  }, 
 
});