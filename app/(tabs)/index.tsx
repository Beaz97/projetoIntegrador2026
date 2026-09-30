import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type BotaoProps = { titulo: string; onPress: () => void };

function Botao({ titulo, onPress }: BotaoProps) {
  return (
    <Pressable style={styles.botao} onPress={onPress}>
      <Text style={styles.botaoTexto}>{titulo}</Text>
    </Pressable>
  );
}

export default function Index() {
  const router = useRouter();
  const [pagina, setPagina] = useState(0); // qual bolinha está ativa

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logo}>
        <Ionicons name="cart" size={56} color="#1f4d2e" />
        <Text style={styles.logoTexto}>Economize</Text>
        <Text style={styles.slogan}>Compare. Escolha. Economize.</Text>
      </View>

      {/* Texto + ilustração */}
      <View style={styles.meio}>
        <Text style={styles.titulo}>
          os melhores preços{'\n'}dos mercados bem{'\n'}perto de você
        </Text>
        <Ionicons name="basket-outline" size={150} color="#fff" />
      </View>

      {/* Botão + bolinhas */}
      <View style={styles.rodape}>
        <Botao titulo="Começar" onPress={() => router.push('/')} />

        <View style={styles.bolinhas}>
          {[0, 1, 2].map((i) => (
            <Pressable
              key={i}
              onPress={() => setPagina(i)}
              style={[styles.bolinha, pagina === i && styles.bolinhaAtiva]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#41805a',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logo: { alignItems: 'center' },
  logoTexto: { fontSize: 44, fontWeight: 'bold', color: '#1f4d2e' },
  slogan: { fontSize: 14, color: '#1f4d2e' },
  meio: { alignItems: 'center', gap: 24 },
  titulo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rodape: { width: '100%', alignItems: 'center', gap: 16 },
  botao: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 14,
    width: '80%',
    alignItems: 'center',
  },
  botaoTexto: { color: '#2f7a4b', fontSize: 22, fontWeight: 'bold' },
  bolinhas: { flexDirection: 'row', gap: 8 },
  bolinha: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1f4d2e',
  },
  bolinhaAtiva: { backgroundColor: '#fff', borderColor: '#fff' },
});