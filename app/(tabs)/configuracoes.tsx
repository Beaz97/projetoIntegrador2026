
import { useState, useEffect } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Icone = keyof typeof Ionicons.glyphMap;

const CHAVE_USUARIOS = '@banco_usuarios';
const CHAVE_USUARIO_LOGADO = '@usuario_logado';

type Usuario = {
  id?: string | number;
  nome?: string;
  nomeEmpresa?: string;
  email?: string;
  senha?: string;
  documento?: string;
  telefone?: string;
  endereco?: string;
  enderecoCompleto?: string;
  tipo?: string;
  tipoUsuario?: string;
  perfil?: string;
  role?: string;
  tipoConta?: string;
  [key: string]: any;
};

/* ---------- Funções de armazenamento e segurança ---------- */

async function lerUsuarioLogado(): Promise<Usuario | null> {
  try {
    const dados = await AsyncStorage.getItem(CHAVE_USUARIO_LOGADO);
    return dados ? JSON.parse(dados) : null;
  } catch (erro) {
    console.error('Erro ao carregar usuário:', erro);
    return null;
  }
}

async function lerUsuarios(): Promise<Usuario[]> {
  const dados = await AsyncStorage.getItem(CHAVE_USUARIOS);

  if (!dados) {
    throw new Error('Não foi possível carregar o cadastro de usuários.');
  }

  const usuarios = JSON.parse(dados);

  if (!Array.isArray(usuarios)) {
    throw new Error('A lista de usuários está inválida.');
  }

  return usuarios;
}

function ehEmpresa(usuario: Usuario | null): boolean {
  if (!usuario) return false;

  const tipo = [
    usuario.tipo,
    usuario.tipoUsuario,
    usuario.perfil,
    usuario.role,
    usuario.tipoConta,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    tipo.includes('empresa') ||
    tipo.includes('empresarial') ||
    !!usuario.nomeEmpresa
  );
}

function mesmoUsuario(a: Usuario, b: Usuario): boolean {
  if (a.id != null && b.id != null) {
    return String(a.id) === String(b.id);
  }

  return Boolean(
    a.email &&
      b.email &&
      a.email.trim().toLowerCase() === b.email.trim().toLowerCase()
  );
}

async function hashSenha(senha: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    senha
  );
}

async function verificarSenha(
  senhaDigitada: string,
  senhaArmazenada: string
): Promise<boolean> {
  if (!senhaDigitada || !senhaArmazenada) {
    return false;
  }

  const hash = await hashSenha(senhaDigitada);

  // Compatibilidade com cadastros que tenham senha em texto puro.
  return hash === senhaArmazenada || senhaDigitada === senhaArmazenada;
}

async function buscarCadastroDoUsuario(
  usuarioOriginal: Usuario
): Promise<{ usuarios: Usuario[]; indice: number }> {
  const usuarios = await lerUsuarios();

  let indice = -1;

  if (usuarioOriginal.id != null) {
    indice = usuarios.findIndex(
      (usuario) =>
        usuario.id != null &&
        String(usuario.id) === String(usuarioOriginal.id)
    );
  }

  if (indice === -1 && usuarioOriginal.email) {
    const emailOriginal = usuarioOriginal.email.trim().toLowerCase();

    indice = usuarios.findIndex(
      (usuario) =>
        usuario.email?.trim().toLowerCase() === emailOriginal
    );
  }

  if (indice === -1) {
    throw new Error('Usuário não encontrado no cadastro.');
  }

  return { usuarios, indice };
}

async function salvarDadosUsuario(
  usuarioOriginal: Usuario,
  dadosAtualizados: Partial<Usuario>
): Promise<void> {
  const { usuarios, indice } =
    await buscarCadastroDoUsuario(usuarioOriginal);

  const usuarioAtualizado: Usuario = {
    ...usuarios[indice],
    ...dadosAtualizados,
    id: usuarios[indice].id,
  };

  usuarios[indice] = usuarioAtualizado;

  await AsyncStorage.setItem(
    CHAVE_USUARIOS,
    JSON.stringify(usuarios)
  );

  const usuarioLogado = await lerUsuarioLogado();

  if (usuarioLogado && mesmoUsuario(usuarioOriginal, usuarioLogado)) {
    const { senha: _senha, ...usuarioSemSenha } = usuarioAtualizado;

    await AsyncStorage.setItem(
      CHAVE_USUARIO_LOGADO,
      JSON.stringify(usuarioSemSenha)
    );
  }
}

async function validarSenhaAtual(
  usuarioOriginal: Usuario,
  senhaAtual: string
): Promise<boolean> {
  const { usuarios, indice } =
    await buscarCadastroDoUsuario(usuarioOriginal);

  return verificarSenha(senhaAtual, usuarios[indice].senha || '');
}

/* ---------- Componentes reutilizáveis ---------- */

type TelaProps = {
  titulo: string;
  subtitulo: string;
  onVoltar?: () => void;
  children: React.ReactNode;
};

function Tela({
  titulo,
  subtitulo,
  onVoltar,
  children,
}: TelaProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.cabecalho}>
          <Pressable
            onPress={onVoltar}
            style={styles.botaoVoltar}
            hitSlop={10}
          >
            <Ionicons
              name="arrow-back"
              size={27}
              color="#44805c"
            />
          </Pressable>

          <Text style={styles.titulo}>{titulo}</Text>

          <View style={styles.espacador} />
        </View>

        <Text style={styles.subtitulo}>{subtitulo}</Text>
      </View>

      {children}
    </View>
  );
}

function Botao({
  titulo,
  onPress,
  vermelho,
  desativado,
}: {
  titulo: string;
  onPress: () => void;
  vermelho?: boolean;
  desativado?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desativado}
      style={[
        styles.botao,
        vermelho && styles.botaoVermelho,
        desativado && styles.botaoDesativado,
      ]}
    >
      <Text style={styles.botaoTxt}>{titulo}</Text>
    </Pressable>
  );
}

function Toggle({
  ligado,
  onMudar,
}: {
  ligado: boolean;
  onMudar: () => void;
}) {
  return (
    <Pressable
      onPress={onMudar}
      style={[
        styles.trilho,
        {
          backgroundColor: ligado ? '#44805c' : '#c9cfcb',
          alignItems: ligado ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <View style={styles.bolinha} />
    </Pressable>
  );
}

/* ---------- Minha conta ---------- */

function Conta({
  onVoltar,
}: {
  onVoltar: () => void;
}) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [emailOriginal, setEmailOriginal] = useState('');
  const [senhaAtualEmail, setSenhaAtualEmail] = useState('');
  const [tel, setTel] = useState('');
  const [empresa, setEmpresa] = useState(false);
  const [usuarioOriginal, setUsuarioOriginal] =
    useState<Usuario | null>(null);

  const [msg, setMsg] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const emailFoiAlterado =
    email.trim().toLowerCase() !== emailOriginal.trim().toLowerCase();

  useEffect(() => {
    async function carregarDados() {
      const usuario = await lerUsuarioLogado();

      if (!usuario) {
        setMsg('Não foi possível encontrar o usuário conectado.');
        return;
      }

      const contaEmpresa = ehEmpresa(usuario);

      setUsuarioOriginal(usuario);
      setEmpresa(contaEmpresa);

      setNome(
        contaEmpresa
          ? usuario.nomeEmpresa || usuario.nome || ''
          : usuario.nome || ''
      );

      setEmail(usuario.email || '');
      setEmailOriginal(usuario.email || '');
      setTel(usuario.telefone || '');
    }

    carregarDados();
  }, []);

  async function salvarAlteracoes() {
    if (salvando) return;

    setMsg('');
    setSucesso(false);

    if (!nome.trim() || !email.trim()) {
      setMsg('Preencha o nome e o e-mail.');
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      setMsg('Digite um endereço de e-mail válido.');
      return;
    }

    if (emailFoiAlterado && !senhaAtualEmail) {
      setMsg('Digite sua senha atual para confirmar a alteração do e-mail.');
      return;
    }

    try {
      setSalvando(true);

      const usuario = usuarioOriginal || await lerUsuarioLogado();

      if (!usuario) {
        setMsg('Nenhum usuário conectado.');
        return;
      }

      if (emailFoiAlterado) {
        const senhaCorreta = await validarSenhaAtual(
          usuario,
          senhaAtualEmail
        );

        if (!senhaCorreta) {
          setMsg('A senha atual está incorreta. O e-mail não foi alterado.');
          return;
        }

        const { usuarios, indice } =
          await buscarCadastroDoUsuario(usuario);

        const emailDuplicado = usuarios.some(
          (outro, index) =>
            index !== indice &&
            outro.email?.trim().toLowerCase() === emailNormalizado
        );

        if (emailDuplicado) {
          setMsg('Este e-mail já está cadastrado em outra conta.');
          return;
        }
      }

      const dadosAtualizados: Partial<Usuario> = {
        email: emailNormalizado,
        telefone: tel.trim(),
      };

      if (empresa) {
        dadosAtualizados.nomeEmpresa = nome.trim();
        dadosAtualizados.nome = nome.trim();
      } else {
        dadosAtualizados.nome = nome.trim();
      }

      await salvarDadosUsuario(usuario, dadosAtualizados);

      setUsuarioOriginal({
        ...usuario,
        ...dadosAtualizados,
      });

      setEmailOriginal(emailNormalizado);
      setSenhaAtualEmail('');
      setSucesso(true);
      setMsg('Dados atualizados com sucesso!');
    } catch (erro) {
      console.error('Erro ao salvar os dados:', erro);
      setMsg(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível salvar os dados. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Tela
      titulo={empresa ? 'Dados da empresa' : 'Minha conta'}
      subtitulo={
        empresa
          ? 'Atualize as informações da sua empresa.'
          : 'Atualize seus dados pessoais.'
      }
      onVoltar={onVoltar}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>
          {empresa ? 'Nome da empresa' : 'Nome completo'}
        </Text>

        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder={empresa ? 'Nome da empresa' : 'Seu nome'}
          autoCapitalize="words"
        />

        <Text style={styles.label}>E-mail</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Seu e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {emailFoiAlterado && (
          <View style={styles.aviso}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#44805c"
            />
            <Text style={styles.avisoTexto}>
              Por segurança, confirme sua senha atual para mudar o e-mail.
            </Text>
          </View>
        )}

        {emailFoiAlterado && (
          <>
            <Text style={styles.label}>Senha atual</Text>

            <TextInput
              style={styles.input}
              value={senhaAtualEmail}
              onChangeText={setSenhaAtualEmail}
              placeholder="Confirme sua senha atual"
              secureTextEntry
              autoCapitalize="none"
            />
          </>
        )}

        <Text style={styles.label}>Telefone</Text>

        <TextInput
          style={styles.input}
          value={tel}
          onChangeText={setTel}
          placeholder="Seu telefone"
          keyboardType="phone-pad"
        />

        <Botao
          titulo={salvando ? 'Salvando...' : 'Salvar alterações'}
          onPress={salvarAlteracoes}
          desativado={salvando}
        />

        {msg !== '' && (
          <Text
            style={[
              styles.msg,
              sucesso ? styles.msgSucesso : styles.msgErro,
            ]}
          >
            {msg}
          </Text>
        )}
      </ScrollView>
    </Tela>
  );
}

/* ---------- Endereços ---------- */

type Endereco = {
  id: string;
  nome: string;
  texto: string;
};

function Enderecos({
  onVoltar,
}: {
  onVoltar: () => void;
}) {
  const [lista, setLista] = useState<Endereco[]>([]);
  const [nome, setNome] = useState('');
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [chaveEnderecos, setChaveEnderecos] =
    useState<string | null>(null);

  useEffect(() => {
    async function carregarEnderecos() {
      try {
        const usuario = await lerUsuarioLogado();

        if (!usuario) {
          setMsg('Nenhum usuário conectado.');
          return;
        }

        const identificador =
          usuario.id != null
            ? String(usuario.id)
            : usuario.email?.toLowerCase();

        if (!identificador) {
          setMsg('Não foi possível identificar sua conta.');
          return;
        }

        const chave = `@enderecos_usuario_${identificador}`;
        setChaveEnderecos(chave);

        const enderecosTexto = await AsyncStorage.getItem(chave);

        if (enderecosTexto) {
          const enderecos = JSON.parse(enderecosTexto);

          if (Array.isArray(enderecos)) {
            setLista(enderecos);
          }
        } else {
          const enderecoAtual =
            usuario.endereco || usuario.enderecoCompleto || '';

          if (enderecoAtual) {
            setLista([
              {
                id: 'principal',
                nome: 'Principal',
                texto: enderecoAtual,
              },
            ]);
          }
        }
      } catch (erro) {
        console.error('Erro ao carregar endereços:', erro);
        setMsg('Não foi possível carregar os endereços.');
      } finally {
        setCarregando(false);
      }
    }

    carregarEnderecos();
  }, []);

  async function persistirEnderecos(novaLista: Endereco[]) {
    if (!chaveEnderecos) {
      setMsg('Não foi possível identificar sua conta.');
      return false;
    }

    try {
      setSalvando(true);

      await AsyncStorage.setItem(
        chaveEnderecos,
        JSON.stringify(novaLista)
      );

      setLista(novaLista);
      setMsg('Endereços atualizados.');
      return true;
    } catch (erro) {
      console.error('Erro ao salvar endereços:', erro);
      setMsg('Não foi possível salvar os endereços.');
      return false;
    } finally {
      setSalvando(false);
    }
  }

  async function adicionar() {
    if (!nome.trim() || !texto.trim()) {
      setMsg('Preencha o nome do local e o endereço.');
      return;
    }

    const novoEndereco: Endereco = {
      id: String(Date.now()),
      nome: nome.trim(),
      texto: texto.trim(),
    };

    const salvou = await persistirEnderecos([
      ...lista,
      novoEndereco,
    ]);

    if (salvou) {
      setNome('');
      setTexto('');
    }
  }

  async function remover(id: string) {
    const novaLista = lista.filter(
      (endereco) => endereco.id !== id
    );

    await persistirEnderecos(novaLista);
  }

  async function definirPrincipal(item: Endereco) {
    try {
      const usuario = await lerUsuarioLogado();

      if (!usuario) {
        setMsg('Nenhum usuário conectado.');
        return;
      }

      await salvarDadosUsuario(usuario, {
        endereco: item.texto,
        enderecoCompleto: item.texto,
      });

      setMsg('Endereço principal atualizado!');
    } catch (erro) {
      console.error('Erro ao atualizar endereço principal:', erro);
      setMsg('Não foi possível atualizar o endereço.');
    }
  }

  const renderItem = ({ item }: { item: Endereco }) => (
    <View style={[styles.card, styles.linha]}>
      <View style={styles.iconeEndereco}>
        <Ionicons
          name="location-outline"
          size={23}
          color="#44805c"
        />
      </View>

      <View style={styles.enderecoTexto}>
        <Text style={styles.negrito}>{item.nome}</Text>
        <Text style={styles.suave}>{item.texto}</Text>

        <Pressable
          onPress={() => definirPrincipal(item)}
          style={styles.linkEndereco}
        >
          <Text style={styles.linkEnderecoTexto}>
            Usar como endereço principal
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={() => remover(item.id)} hitSlop={8}>
        <Ionicons
          name="trash-outline"
          size={21}
          color="#b3352f"
        />
      </Pressable>
    </View>
  );

  const formulario = (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.secao}>Adicionar endereço</Text>

      <Text style={styles.label}>Nome do local</Text>

      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Loja principal"
      />

      <Text style={styles.label}>Endereço completo</Text>

      <TextInput
        style={styles.input}
        value={texto}
        onChangeText={setTexto}
        placeholder="Rua, número, bairro e cidade"
      />

      <Botao
        titulo={salvando ? 'Salvando...' : 'Adicionar endereço'}
        onPress={adicionar}
        desativado={salvando}
      />

      {msg !== '' && <Text style={styles.msg}>{msg}</Text>}
    </View>
  );

  return (
    <Tela
      titulo="Meus endereços"
      subtitulo="Gerencie os endereços da sua conta."
      onVoltar={onVoltar}
    >
      {carregando ? (
        <View style={styles.carregando}>
          <Text style={styles.suave}>Carregando endereços...</Text>
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons
                name="location-outline"
                size={38}
                color="#8B968C"
              />
              <Text style={styles.suave}>
                Nenhum endereço cadastrado.
              </Text>
            </View>
          }
          ListFooterComponent={formulario}
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </Tela>
  );
}

/* ---------- Notificações ---------- */

type Opcao = {
  id: string;
  nome: string;
};

const OPCOES: Opcao[] = [
  { id: 'alertas', nome: 'Alertas' },
  { id: 'promocoes', nome: 'Promoções' },
  { id: 'email', nome: 'E-mail' },
  { id: 'push', nome: 'Push' },
];

function Notificacoes({
  onVoltar,
}: {
  onVoltar: () => void;
}) {
  const [ativas, setAtivas] = useState<Record<string, boolean>>({
    alertas: true,
    promocoes: false,
    email: true,
    push: true,
  });

  const renderItem = ({ item }: { item: Opcao }) => (
    <View style={[styles.card, styles.linha]}>
      <Text style={[styles.negrito, { flex: 1 }]}>
        {item.nome}
      </Text>

      <Toggle
        ligado={ativas[item.id]}
        onMudar={() =>
          setAtivas({
            ...ativas,
            [item.id]: !ativas[item.id],
          })
        }
      />
    </View>
  );

  return (
    <Tela
      titulo="Notificações"
      subtitulo="Escolha o que deseja receber."
      onVoltar={onVoltar}
    >
      <FlatList
        data={OPCOES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.conteudo}
      />
    </Tela>
  );
}

/* ---------- Privacidade e alteração de senha ---------- */

function Privacidade({
  onVoltar,
}: {
  onVoltar: () => void;
}) {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [msg, setMsg] = useState('');
  const [sucesso, setSucesso] = useState(false);

  async function trocarSenha() {
    if (salvandoSenha) return;

    setMsg('');
    setSucesso(false);

    if (!atual || !nova || !confirmacao) {
      setMsg('Preencha todos os campos para alterar a senha.');
      return;
    }

    if (nova.length < 6) {
      setMsg('A nova senha precisa ter ao menos 6 caracteres.');
      return;
    }

    if (nova !== confirmacao) {
      setMsg('A nova senha e a confirmação não são iguais.');
      return;
    }

    if (atual === nova) {
      setMsg('A nova senha precisa ser diferente da senha atual.');
      return;
    }

    try {
      setSalvandoSenha(true);

      const usuario = await lerUsuarioLogado();

      if (!usuario) {
        setMsg('Nenhum usuário conectado.');
        return;
      }

      const senhaCorreta = await validarSenhaAtual(usuario, atual);

      if (!senhaCorreta) {
        setMsg('A senha atual está incorreta.');
        return;
      }

      const senhaCriptografada = await hashSenha(nova);

      await salvarDadosUsuario(usuario, {
        senha: senhaCriptografada,
      });

      setAtual('');
      setNova('');
      setConfirmacao('');
      setSucesso(true);
      setMsg('Senha alterada com sucesso!');
    } catch (erro) {
      console.error('Erro ao alterar senha:', erro);
      setMsg(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível alterar a senha. Tente novamente.'
      );
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <Tela
      titulo="Privacidade e segurança"
      subtitulo="Proteja sua conta."
      onVoltar={onVoltar}
    >
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.secao}>Alterar senha</Text>

        <Text style={styles.suave}>
          Confirme sua senha atual para cadastrar uma nova senha.
        </Text>

        <Text style={styles.label}>Senha atual</Text>

        <TextInput
          style={styles.input}
          value={atual}
          onChangeText={setAtual}
          secureTextEntry
          placeholder="Digite sua senha atual"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Nova senha</Text>

        <TextInput
          style={styles.input}
          value={nova}
          onChangeText={setNova}
          secureTextEntry
          placeholder="Mínimo de 6 caracteres"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Confirmar nova senha</Text>

        <TextInput
          style={styles.input}
          value={confirmacao}
          onChangeText={setConfirmacao}
          secureTextEntry
          placeholder="Digite a nova senha novamente"
          autoCapitalize="none"
        />

        <Botao
          titulo={salvandoSenha ? 'Atualizando...' : 'Atualizar senha'}
          onPress={trocarSenha}
          desativado={salvandoSenha}
        />

        {msg !== '' && (
          <Text
            style={[
              styles.msg,
              sucesso ? styles.msgSucesso : styles.msgErro,
            ]}
          >
            {msg}
          </Text>
        )}

        <View style={[styles.card, { marginTop: 28 }]}>
          <Text style={styles.negrito}>Excluir conta</Text>
          <Text style={styles.suave}>
            Esta ação é permanente.
          </Text>

          {excluindo ? (
            <>
              <Text style={[styles.negrito, { marginTop: 12 }]}>
                Deseja continuar?
              </Text>

              <Text style={styles.suave}>
                A exclusão real da conta ainda não está conectada ao
                sistema de cadastro.
              </Text>

              <Botao
                titulo="Entendi"
                vermelho
                onPress={() => setExcluindo(false)}
              />

              <Pressable onPress={() => setExcluindo(false)}>
                <Text style={styles.cancelar}>Cancelar</Text>
              </Pressable>
            </>
          ) : (
            <Botao
              titulo="Excluir minha conta"
              vermelho
              onPress={() => setExcluindo(true)}
            />
          )}
        </View>
      </ScrollView>
    </Tela>
  );
}

/* ---------- Ajuda ---------- */

type Pergunta = {
  id: string;
  pergunta: string;
  resposta: string;
};

const FAQ: Pergunta[] = [
  {
    id: '1',
    pergunta: 'Como altero meus dados?',
    resposta:
      'Acesse Minha conta, edite as informações e toque em Salvar alterações.',
  },
  {
    id: '2',
    pergunta: 'Como adiciono um endereço?',
    resposta:
      'Acesse Meus endereços, preencha os campos e toque em Adicionar endereço.',
  },
  {
    id: '3',
    pergunta: 'Como desativo notificações?',
    resposta:
      'Em Notificações, desligue as opções que não deseja receber.',
  },
];

function Ajuda({
  onVoltar,
}: {
  onVoltar: () => void;
}) {
  const [aberto, setAberto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [msg, setMsg] = useState('');

  const renderItem = ({ item }: { item: Pergunta }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        setAberto(aberto === item.id ? '' : item.id)
      }
    >
      <View style={styles.linhaPergunta}>
        <Text style={styles.negrito}>{item.pergunta}</Text>

        <Ionicons
          name={aberto === item.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#44805c"
        />
      </View>

      {aberto === item.id && (
        <Text style={[styles.suave, { marginTop: 10, lineHeight: 20 }]}>
          {item.resposta}
        </Text>
      )}
    </Pressable>
  );

  const contato = (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.secao}>Fale conosco</Text>

      <TextInput
        style={styles.input}
        value={mensagem}
        onChangeText={setMensagem}
        placeholder="Como podemos ajudar?"
        multiline
      />

      <Botao
        titulo="Enviar"
        onPress={() => {
          if (!mensagem.trim()) {
            setMsg('Digite sua mensagem.');
            return;
          }

          setMsg(
            'O envio precisa ser conectado a um serviço de atendimento.'
          );
        }}
      />

      {msg !== '' && <Text style={styles.msg}>{msg}</Text>}
    </View>
  );

  return (
    <Tela
      titulo="Ajuda e suporte"
      subtitulo="Tire suas dúvidas."
      onVoltar={onVoltar}
    >
      <FlatList
        data={FAQ}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListFooterComponent={contato}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      />
    </Tela>
  );
}

/* ---------- Página principal ---------- */

type Rota =
  | 'home'
  | 'conta'
  | 'enderecos'
  | 'notificacoes'
  | 'privacidade'
  | 'ajuda';

type ItemMenu = {
  id: Rota;
  icone: Icone;
  titulo: string;
  sub: string;
};

const MENU: ItemMenu[] = [
  {
    id: 'conta',
    icone: 'person-outline',
    titulo: 'Minha conta',
    sub: 'Seus dados pessoais',
  },
  {
    id: 'enderecos',
    icone: 'location-outline',
    titulo: 'Meus endereços',
    sub: 'Gerencie seus locais',
  },
  {
    id: 'notificacoes',
    icone: 'notifications-outline',
    titulo: 'Notificações',
    sub: 'Alertas e promoções',
  },
  {
    id: 'privacidade',
    icone: 'shield-checkmark-outline',
    titulo: 'Privacidade e segurança',
    sub: 'Proteja sua conta',
  },
  {
    id: 'ajuda',
    icone: 'help-circle-outline',
    titulo: 'Ajuda e suporte',
    sub: 'Tire suas dúvidas',
  },
];

export default function Configuracoes() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    tela?: string | string[];
  }>();

  const telaInicial = Array.isArray(params.tela)
    ? params.tela[0]
    : params.tela;

  const veioDiretoParaEnderecos = telaInicial === 'enderecos';

  const [tela, setTela] = useState<Rota>(
    veioDiretoParaEnderecos ? 'enderecos' : 'home'
  );

  const [rotaPerfil, setRotaPerfil] =
    useState<'/perfil' | '/perfilempresa'>('/perfil');

  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    async function identificarConta() {
      const usuario = await lerUsuarioLogado();

      setRotaPerfil(
        ehEmpresa(usuario) ? '/perfilempresa' : '/perfil'
      );
    }

    identificarConta();
  }, []);

  function voltarParaPerfil() {
    router.replace(rotaPerfil as any);
  }

  function voltarDaSecao() {
    if (veioDiretoParaEnderecos) {
      voltarParaPerfil();
      return;
    }

    setTela('home');
  }

  function sairDaConta() {
    router.replace('/' as any);
  }

  if (tela === 'conta') {
    return <Conta onVoltar={voltarDaSecao} />;
  }

  if (tela === 'enderecos') {
    return <Enderecos onVoltar={voltarDaSecao} />;
  }

  if (tela === 'notificacoes') {
    return <Notificacoes onVoltar={voltarDaSecao} />;
  }

  if (tela === 'privacidade') {
    return <Privacidade onVoltar={voltarDaSecao} />;
  }

  if (tela === 'ajuda') {
    return <Ajuda onVoltar={voltarDaSecao} />;
  }

  const renderItem = ({ item }: { item: ItemMenu }) => (
    <Pressable
      style={styles.item}
      onPress={() => setTela(item.id)}
    >
      <View style={styles.iconeBox}>
        <Ionicons
          name={item.icone}
          size={27}
          color="#44805c"
        />
      </View>

      <View style={styles.textosMenu}>
        <Text style={styles.itemTitulo}>{item.titulo}</Text>
        <Text style={styles.suave}>{item.sub}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#44805c"
      />
    </Pressable>
  );

  const rodape = saindo ? (
    <View style={styles.card}>
      <Text style={styles.negrito}>Sair da conta?</Text>

      <Text style={styles.suave}>
        Você será direcionado para a tela inicial.
      </Text>

      <Botao
        titulo="Sair"
        vermelho
        onPress={sairDaConta}
      />

      <Pressable onPress={() => setSaindo(false)}>
        <Text style={styles.cancelar}>Cancelar</Text>
      </Pressable>
    </View>
  ) : (
    <Pressable
      style={styles.item}
      onPress={() => setSaindo(true)}
    >
      <View
        style={[
          styles.iconeBox,
          { backgroundColor: '#f6dedd' },
        ]}
      >
        <Ionicons
          name="log-out-outline"
          size={27}
          color="#b3352f"
        />
      </View>

      <Text style={styles.sair}>Sair da conta</Text>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#b3352f"
      />
    </Pressable>
  );

  return (
    <Tela
      titulo="Configurações"
      subtitulo="Gerencie sua conta e suas preferências."
      onVoltar={voltarParaPerfil}
    >
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
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },

  conteudo: {
    padding: 18,
    paddingBottom: 40,
  },

  header: {
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEE9',
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  espacador: {
    width: 42,
  },

  titulo: {
    flex: 1,
    textAlign: 'center',
    fontSize: 21,
    fontWeight: '800',
    color: '#193D27',
  },

  subtitulo: {
    fontSize: 13,
    color: '#777F78',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE6',
    borderRadius: 16,
    padding: 13,
    marginBottom: 12,
    minHeight: 78,
  },

  iconeBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#E5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textosMenu: {
    flex: 1,
  },

  itemTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26382A',
  },

  sair: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#B3352F',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  secao: {
    fontSize: 18,
    fontWeight: '800',
    color: '#193D27',
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4D5A50',
    marginTop: 15,
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DCE5DD',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#26382A',
  },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAF4EC',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  avisoTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#315D3D',
  },

  botao: {
    backgroundColor: '#44805c',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  botaoVermelho: {
    backgroundColor: '#B3352F',
  },

  botaoDesativado: {
    opacity: 0.6,
  },

  botaoTxt: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  cancelar: {
    color: '#69746B',
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '600',
  },

  trilho: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 4,
    justifyContent: 'center',
  },

  bolinha: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },

  negrito: {
    fontWeight: '700',
    fontSize: 15,
    color: '#26382A',
  },

  suave: {
    color: '#778078',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  msg: {
    marginTop: 14,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },

  msgSucesso: {
    color: '#2F7A4B',
  },

  msgErro: {
    color: '#B3352F',
  },

  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 8,
  },

  iconeEndereco: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#E5F1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  enderecoTexto: {
    flex: 1,
    minWidth: 0,
  },

  linkEndereco: {
    alignSelf: 'flex-start',
    marginTop: 9,
  },

  linkEnderecoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#41805A',
  },

  linhaPergunta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
