import { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Icone = keyof typeof Ionicons.glyphMap;

/* ---------- Peças reutilizáveis ---------- */
type TelaProps = { titulo: string; subtitulo: string; onVoltar?: () => void; children: React.ReactNode };

function Tela({ titulo, subtitulo, onVoltar, children }: TelaProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onVoltar && (
          <Pressable onPress={onVoltar} style={styles.voltar}>
            <Ionicons name="arrow-back" size={26} color="#44805c" />
          </Pressable>
        )}
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.subtitulo}>{subtitulo}</Text>
      </View>
      {children}
    </View>
  );
}

function Botao({ titulo, onPress, vermelho }: { titulo: string; onPress: () => void; vermelho?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.botao, vermelho && { backgroundColor: '#b3352f' }]}>
      <Text style={styles.botaoTxt}>{titulo}</Text>
    </Pressable>
  );
}

// Liga/desliga com bolinha
function Toggle({ ligado, onMudar }: { ligado: boolean; onMudar: () => void }) {
  return (
    <Pressable
      onPress={onMudar}
      style={[styles.trilho, { backgroundColor: ligado ? '#44805c' : '#c9cfcb', alignItems: ligado ? 'flex-end' : 'flex-start' }]}
    >
      <View style={styles.bolinha} />
    </Pressable>
  );
}

/* ---------- Telas ---------- */
function Conta({ onVoltar }: { onVoltar: () => void }) {
  const [nome, setNome] = useState('Maria Silva');
  const [email, setEmail] = useState('maria@email.com');
  const [tel, setTel] = useState('(48) 99999-0000');
  const [msg, setMsg] = useState('');

  return (
    <Tela titulo="Minha conta" subtitulo="Atualize seus dados pessoais." onVoltar={onVoltar}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} />
        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
        <Text style={styles.label}>Telefone</Text>
        <TextInput style={styles.input} value={tel} onChangeText={setTel} keyboardType="phone-pad" />
        <Botao titulo="Salvar alterações" onPress={() => setMsg('Dados salvos!')} />
        {msg !== '' && <Text style={styles.msg}>{msg}</Text>}
      </ScrollView>
    </Tela>
  );
}

type Endereco = { id: number; nome: string; texto: string };

function Enderecos({ onVoltar }: { onVoltar: () => void }) {
  const [lista, setLista] = useState<Endereco[]>([
    { id: 1, nome: 'Casa', texto: 'Rua das Flores, 123 - Criciúma' },
    { id: 2, nome: 'Trabalho', texto: 'Av. Centenário, 456 - Criciúma' },
  ]);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');

  const adicionar = () => {
    if (!nome || !texto) return;
    setLista([...lista, { id: Date.now(), nome, texto }]);
    setNome('');
    setTexto('');
  };

  const renderItem = ({ item }: { item: Endereco }) => (
    <View style={[styles.card, styles.linha]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.negrito}>{item.nome}</Text>
        <Text style={styles.suave}>{item.texto}</Text>
      </View>
      <Pressable onPress={() => setLista(lista.filter((e) => e.id !== item.id))}>
        <Text style={{ color: '#b3352f' }}>Remover</Text>
      </Pressable>
    </View>
  );

  const formulario = (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.label}>Nome do local</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex.: Casa" />
      <Text style={styles.label}>Endereço</Text>
      <TextInput style={styles.input} value={texto} onChangeText={setTexto} placeholder="Rua, número, cidade" />
      <Botao titulo="Adicionar endereço" onPress={adicionar} />
    </View>
  );

  return (
    <Tela titulo="Meus endereços" subtitulo="Gerencie seus locais." onVoltar={onVoltar}>
      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListFooterComponent={formulario}
        contentContainerStyle={styles.conteudo}
      />
    </Tela>
  );
}

type Opcao = { id: string; nome: string };

const OPCOES: Opcao[] = [
  { id: 'alertas', nome: 'Alertas' },
  { id: 'promocoes', nome: 'Promoções' },
  { id: 'email', nome: 'E-mail' },
  { id: 'push', nome: 'Push' },
];

function Notificacoes({ onVoltar }: { onVoltar: () => void }) {
  const [ativas, setAtivas] = useState<Record<string, boolean>>({
    alertas: true, promocoes: false, email: true, push: true,
  });

  const renderItem = ({ item }: { item: Opcao }) => (
    <View style={[styles.card, styles.linha]}>
      <Text style={[styles.negrito, { flex: 1 }]}>{item.nome}</Text>
      <Toggle ligado={ativas[item.id]} onMudar={() => setAtivas({ ...ativas, [item.id]: !ativas[item.id] })} />
    </View>
  );

  return (
    <Tela titulo="Notificações" subtitulo="Escolha o que deseja receber." onVoltar={onVoltar}>
      <FlatList
        data={OPCOES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.conteudo}
      />
    </Tela>
  );
}

function Privacidade({ onVoltar }: { onVoltar: () => void }) {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [msg, setMsg] = useState('');

  const trocarSenha = () => {
    if (!atual || nova.length < 6) {
      setMsg('A nova senha precisa ter ao menos 6 caracteres');
      return;
    }
    setAtual('');
    setNova('');
    setMsg('Senha alterada!');
  };

  return (
    <Tela titulo="Privacidade e segurança" subtitulo="Proteja sua conta." onVoltar={onVoltar}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.secao}>Alterar senha</Text>
        <Text style={styles.label}>Senha atual</Text>
        <TextInput style={styles.input} value={atual} onChangeText={setAtual} secureTextEntry />
        <Text style={styles.label}>Nova senha</Text>
        <TextInput style={styles.input} value={nova} onChangeText={setNova} secureTextEntry />
        <Botao titulo="Atualizar senha" onPress={trocarSenha} />
        {msg !== '' && <Text style={styles.msg}>{msg}</Text>}

        <View style={[styles.card, { marginTop: 28 }]}>
          <Text style={styles.negrito}>Excluir conta</Text>
          <Text style={styles.suave}>Esta ação é permanente.</Text>
          {excluindo ? (
            <>
              <Text style={[styles.negrito, { marginTop: 12 }]}>Excluir sua conta definitivamente?</Text>
              <Botao titulo="Sim, excluir" vermelho onPress={() => setExcluindo(false)} />
              <Pressable onPress={() => setExcluindo(false)}>
                <Text style={styles.cancelar}>Cancelar</Text>
              </Pressable>
            </>
          ) : (
            <Botao titulo="Excluir minha conta" vermelho onPress={() => setExcluindo(true)} />
          )}
        </View>
      </ScrollView>
    </Tela>
  );
}

type Pergunta = { id: string; pergunta: string; resposta: string };

const FAQ: Pergunta[] = [
  { id: '1', pergunta: 'Como altero meus dados?', resposta: 'Vá em Minha conta e edite seus dados pessoais.' },
  { id: '2', pergunta: 'Como adiciono um endereço?', resposta: 'Em Meus endereços, preencha os campos e toque em Adicionar.' },
  { id: '3', pergunta: 'Como desativo notificações?', resposta: 'Em Notificações, desligue as opções que não deseja receber.' },
];

function Ajuda({ onVoltar }: { onVoltar: () => void }) {
  const [aberto, setAberto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [msg, setMsg] = useState('');

  const renderItem = ({ item }: { item: Pergunta }) => (
    <Pressable style={styles.card} onPress={() => setAberto(aberto === item.id ? '' : item.id)}>
      <Text style={styles.negrito}>{item.pergunta}</Text>
      {aberto === item.id && <Text style={[styles.suave, { marginTop: 6 }]}>{item.resposta}</Text>}
    </Pressable>
  );

  const contato = (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.secao}>Fale conosco</Text>
      <TextInput style={styles.input} value={mensagem} onChangeText={setMensagem} placeholder="Como podemos ajudar?" />
      <Botao
        titulo="Enviar"
        onPress={() => {
          if (!mensagem) return;
          setMensagem('');
          setMsg('Mensagem enviada!');
        }}
      />
      {msg !== '' && <Text style={styles.msg}>{msg}</Text>}
    </View>
  );

  return (
    <Tela titulo="Ajuda e suporte" subtitulo="Tire suas dúvidas." onVoltar={onVoltar}>
      <FlatList
        data={FAQ}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={contato}
        contentContainerStyle={styles.conteudo}
      />
    </Tela>
  );
}

/* ---------- Página principal ---------- */
type Rota = 'home' | 'conta' | 'enderecos' | 'notificacoes' | 'privacidade' | 'ajuda';
type ItemMenu = { id: Rota; icone: Icone; titulo: string; sub: string };

const MENU: ItemMenu[] = [
  { id: 'conta', icone: 'person-outline', titulo: 'Minha conta', sub: 'Seus dados pessoais' },
  { id: 'enderecos', icone: 'location-outline', titulo: 'Meus endereços', sub: 'Gerencie seus locais' },
  { id: 'notificacoes', icone: 'notifications-outline', titulo: 'Notificações', sub: 'Alertas e promoções' },
  { id: 'privacidade', icone: 'shield-checkmark-outline', titulo: 'Privacidade e segurança', sub: 'Proteja sua conta' },
  { id: 'ajuda', icone: 'help-circle-outline', titulo: 'Ajuda e suporte', sub: 'Tire suas dúvidas' },
];

export default function Configuracoes() {
  const router = useRouter();
  const [tela, setTela] = useState<Rota>('home');
  const [saindo, setSaindo] = useState(false);

  const voltar = () => setTela('home');

  if (tela === 'conta') return <Conta onVoltar={voltar} />;
  if (tela === 'enderecos') return <Enderecos onVoltar={voltar} />;
  if (tela === 'notificacoes') return <Notificacoes onVoltar={voltar} />;
  if (tela === 'privacidade') return <Privacidade onVoltar={voltar} />;
  if (tela === 'ajuda') return <Ajuda onVoltar={voltar} />;

  const renderItem = ({ item }: { item: ItemMenu }) => (
    <Pressable style={styles.item} onPress={() => setTela(item.id)}>
      <View style={styles.iconeBox}>
        <Ionicons name={item.icone} size={28} color="#44805c" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>{item.titulo}</Text>
        <Text style={styles.suave}>{item.sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#44805c" />
    </Pressable>
  );

  const rodape = saindo ? (
    <View style={styles.card}>
      <Text style={styles.negrito}>Sair da conta?</Text>
      <Text style={styles.suave}>Você precisará entrar novamente.</Text>
      <Botao titulo="Sair" vermelho onPress={() => router.replace('/')} />
      <Pressable onPress={() => setSaindo(false)}>
        <Text style={styles.cancelar}>Cancelar</Text>
      </Pressable>
    </View>
  ) : (
    <Pressable style={styles.item} onPress={() => setSaindo(true)}>
      <View style={[styles.iconeBox, { backgroundColor: '#f6dedd' }]}>
        <Ionicons name="log-out-outline" size={28} color="#b3352f" />
      </View>
      <Text style={styles.sair}>Sair da conta</Text>
    </Pressable>
  );

  return (
    <Tela titulo="Configurações" subtitulo="Gerencie sua conta e suas preferências.">
      <FlatList
        data={MENU}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={rodape}
        contentContainerStyle={styles.conteudo}
      />
    </Tela>
  );
}

/* ---------- Estilos ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  conteudo: { padding: 16, paddingBottom: 100 },

  header: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 8 },
  voltar: { marginBottom: 8 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  subtitulo: { fontSize: 14, color: '#000' },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  iconeBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#dcebdf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitulo: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  sair: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#b3352f' },

  card: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  secao: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  label: { fontSize: 13, color: '#555', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 18,
    fontSize: 15,
  },

  botao: { backgroundColor: '#44805c', borderRadius: 25, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelar: { color: '#555', textAlign: 'center', marginTop: 12 },

  trilho: { width: 52, height: 30, borderRadius: 15, padding: 4, justifyContent: 'center' },
  bolinha: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },

  negrito: { fontWeight: 'bold', fontSize: 15, color: '#000' },
  suave: { color: '#777', fontSize: 13 },
  msg: { color: '#44805c', marginTop: 14, textAlign: 'center', fontWeight: 'bold' },
});