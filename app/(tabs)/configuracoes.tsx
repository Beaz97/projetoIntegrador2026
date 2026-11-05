import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAutenticacao } from '@/app/components/autenticaTelas';
import * as userController from '@/app/rotaServidor/userController';

const VERDE = '#41805A';
const VERDE_ESCURO = '#245D39';
const VERDE_CLARO = '#E5F1E8';
const FUNDO = '#F7F9F7';

const CHAVE_USUARIO_LOGADO = '@usuario_logado';
const CHAVE_USUARIOS = '@banco_usuarios';

type Tela =
  | 'home'
  | 'conta'
  | 'enderecos'
  | 'notificacoes'
  | 'ajuda';

type Endereco = {
  id: string;
  nome: string;
  texto: string;
};

type PreferenciasNotificacao = {
  alertas: boolean;
  promocoes: boolean;
  email: boolean;
  push: boolean;
};

const PREFERENCIAS_PADRAO: PreferenciasNotificacao = {
  alertas: true,
  promocoes: false,
  email: true,
  push: true,
};

export default function Configuracoes() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    tela?: string | string[];
    origem?: string | string[];
  }>();

  const parametroTela = Array.isArray(params.tela)
    ? params.tela[0]
    : params.tela;

  const parametroOrigem = Array.isArray(params.origem)
    ? params.origem[0]
    : params.origem;

  const veioDiretoParaEnderecos = parametroTela === 'enderecos';

  const {
    usuario,
    carregando,
    autorizado,
  } = useAutenticacao();

  const [tela, setTela] = useState<Tela>(
    veioDiretoParaEnderecos ? 'enderecos' : 'home',
  );

  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [identificador, setIdentificador] = useState('');

  const [carregandoDados, setCarregandoDados] = useState(false);

  // Minha conta
  const [nomeEditado, setNomeEditado] = useState('');
  const [emailEditado, setEmailEditado] = useState('');
  const [telefoneEditado, setTelefoneEditado] = useState('');

  // Endereços
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(true);
  const [nomeEndereco, setNomeEndereco] = useState('');
  const [textoEndereco, setTextoEndereco] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] =
    useState<string | null>(null);

  // Notificações
  const [preferencias, setPreferencias] =
    useState<PreferenciasNotificacao>(PREFERENCIAS_PADRAO);

  // Ajuda
  const [perguntaAberta, setPerguntaAberta] = useState<number | null>(null);

  // Mensagens de confirmação
  const [confirmacaoConta, setConfirmacaoConta] = useState<
    'sair' | null
  >(null);

  useEffect(() => {
    if (parametroTela === 'enderecos') {
      setTela('enderecos');
    } else if (!parametroTela) {
      setTela('home');
    }
  }, [parametroTela]);

  const criarIdentificador = (dados: any) => {
    if (dados?.id != null) {
      return String(dados.id);
    }

    return String(dados?.email ?? '').trim().toLowerCase();
  };

  const carregarUsuario = useCallback(async () => {
    try {
      const salvo = await AsyncStorage.getItem(CHAVE_USUARIO_LOGADO);

      let usuarioAtualizado = usuario ?? null;

      if (salvo) {
        usuarioAtualizado = JSON.parse(salvo);
      }

      if (usuarioAtualizado) {
        const bancoTexto = await AsyncStorage.getItem(CHAVE_USUARIOS);

        if (bancoTexto) {
          const banco = JSON.parse(bancoTexto);

          if (Array.isArray(banco)) {
            const encontrado = banco.find((item: any) => {
              if (
                usuarioAtualizado.id != null &&
                item.id != null
              ) {
                return String(item.id) === String(usuarioAtualizado.id);
              }

              return (
                String(item.email ?? '').trim().toLowerCase() ===
                String(usuarioAtualizado.email ?? '').trim().toLowerCase()
              );
            });

            if (encontrado) {
              usuarioAtualizado = {
                ...encontrado,
                senha: undefined,
              };
            }
          }
        }
      }

      setUsuarioLogado(usuarioAtualizado);
      setIdentificador(criarIdentificador(usuarioAtualizado));

      setNomeEditado(
        usuarioAtualizado?.nomeEmpresa ||
        usuarioAtualizado?.nome ||
        '',
      );

      setEmailEditado(usuarioAtualizado?.email || '');

      const telefoneSalvo = await AsyncStorage.getItem(
        `@telefone_usuario_${criarIdentificador(usuarioAtualizado)}`,
      );

      setTelefoneEditado(
        telefoneSalvo ?? usuarioAtualizado?.telefone ?? '',
      );
    } catch (erro) {
      console.error('Erro ao carregar usuário:', erro);
    }
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      carregarUsuario();
    }, [carregarUsuario]),
  );

  const carregarEnderecos = useCallback(async () => {
    setCarregandoEnderecos(true);

    try {
      let id = identificador;

      if (!id) {
        const salvo = await AsyncStorage.getItem(CHAVE_USUARIO_LOGADO);

        if (salvo) {
          const dados = JSON.parse(salvo);
          id = criarIdentificador(dados);
          setIdentificador(id);
        }
      }

      if (!id) {
        setEnderecos([]);
        return;
      }

      const conteudo = await AsyncStorage.getItem(
        `@enderecos_usuario_${id}`,
      );

      if (conteudo) {
        const dados: unknown = JSON.parse(conteudo);
        setEnderecos(Array.isArray(dados) ? dados : []);
      } else {
        setEnderecos([]);
      }
    } catch (erro) {
      console.error('Erro ao carregar endereços:', erro);
      setEnderecos([]);
    } finally {
      setCarregandoEnderecos(false);
    }
  }, [identificador]);

  useFocusEffect(
    useCallback(() => {
      carregarEnderecos();
    }, [carregarEnderecos]),
  );

  const carregarPreferencias = useCallback(async () => {
    try {
      if (!identificador) return;

      const salvo = await AsyncStorage.getItem(
        `@notificacoes_usuario_${identificador}`,
      );

      if (salvo) {
        setPreferencias({
          ...PREFERENCIAS_PADRAO,
          ...JSON.parse(salvo),
        });
      } else {
        setPreferencias(PREFERENCIAS_PADRAO);
      }
    } catch (erro) {
      console.error('Erro ao carregar notificações:', erro);
    }
  }, [identificador]);

  useEffect(() => {
    carregarPreferencias();
  }, [carregarPreferencias]);

  async function salvarPreferencias(
    novasPreferencias: PreferenciasNotificacao,
  ) {
    setPreferencias(novasPreferencias);

    try {
      if (!identificador) return;

      await AsyncStorage.setItem(
        `@notificacoes_usuario_${identificador}`,
        JSON.stringify(novasPreferencias),
      );
    } catch (erro) {
      console.error('Erro ao salvar notificações:', erro);
      Alert.alert('Erro', 'Não foi possível salvar suas preferências.');
    }
  }

  async function salvarEnderecos(listaAtualizada: Endereco[]) {
    try {
      const id = identificador || criarIdentificador(usuarioLogado);

      if (!id) {
        Alert.alert('Erro', 'Não foi possível identificar sua conta.');
        return false;
      }

      await AsyncStorage.setItem(
        `@enderecos_usuario_${id}`,
        JSON.stringify(listaAtualizada),
      );

      setEnderecos(listaAtualizada);
      return true;
    } catch (erro) {
      console.error('Erro ao salvar endereços:', erro);
      Alert.alert('Erro', 'Não foi possível salvar os endereços.');
      return false;
    }
  }

  function limparFormulario() {
    setNomeEndereco('');
    setTextoEndereco('');
    setEditandoId(null);
  }

  async function salvarEndereco() {
    const nome = nomeEndereco.trim();
    const texto = textoEndereco.trim();

    if (!nome || !texto) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha o nome e o endereço completo.',
      );
      return;
    }

    const listaAtualizada = editandoId
      ? enderecos.map((item) =>
          String(item.id) === String(editandoId)
            ? { ...item, nome, texto }
            : item,
        )
      : [
          ...enderecos,
          {
            id: `${Date.now()}`,
            nome,
            texto,
          },
        ];

    const salvo = await salvarEnderecos(listaAtualizada);

    if (salvo) {
      limparFormulario();
      setConfirmandoExclusao(null);
    }
  }

  function iniciarEdicao(endereco: Endereco) {
    setEditandoId(endereco.id);
    setNomeEndereco(endereco.nome);
    setTextoEndereco(endereco.texto);
    setConfirmandoExclusao(null);
  }

  function pedirExclusao(id: string) {
    setConfirmandoExclusao(id);
    limparFormulario();
  }

  async function confirmarExclusao(id: string) {
    const listaAtualizada = enderecos.filter(
      (item) => String(item.id) !== String(id),
    );

    const salvo = await salvarEnderecos(listaAtualizada);

    if (salvo) {
      setConfirmandoExclusao(null);
      limparFormulario();
    }
  }

  async function salvarDadosConta() {
    const nome = nomeEditado.trim();
    const email = emailEditado.trim().toLowerCase();
    const telefone = telefoneEditado.trim();

    if (!nome || !email) {
      Alert.alert('Campos obrigatórios', 'Informe seu nome e seu e-mail.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('E-mail inválido', 'Digite um endereço de e-mail válido.');
      return;
    }

    const id = usuarioLogado?.id;

    if (id == null) {
      Alert.alert('Erro', 'Não foi possível identificar sua conta.');
      return;
    }

    setCarregandoDados(true);

    try {
      const atualizado = await userController.atualizar(String(id), {
        nome,
        email,
        telefone,
      });

      await AsyncStorage.setItem(`@telefone_usuario_${id}`, telefone);

      const usuarioSemSenha = { ...atualizado };
      delete (usuarioSemSenha as any).senha;

      await userController.setUsuarioLogado(usuarioSemSenha);

      setUsuarioLogado(usuarioSemSenha);
      setIdentificador(criarIdentificador(usuarioSemSenha));

      setNomeEditado(usuarioSemSenha.nome || '');
      setEmailEditado(usuarioSemSenha.email || '');
      setTelefoneEditado(usuarioSemSenha.telefone || '');
    } catch (erro: any) {
      console.error('Erro ao atualizar conta:', erro);

      Alert.alert(
        'Não foi possível atualizar',
        erro?.message || 'Verifique os dados e tente novamente.',
      );
    } finally {
      setCarregandoDados(false);
    }
  }

  async function sairDaConta() {
    try {
      await userController.logout();
      await AsyncStorage.removeItem(CHAVE_USUARIO_LOGADO);

      setUsuarioLogado(null);
      setConfirmacaoConta(null);

      router.replace('/' as any);
    } catch (erro) {
      console.error('Erro ao sair da conta:', erro);
      Alert.alert('Erro', 'Não foi possível sair da conta.');
    }
  }

  function voltarDaTela() {
    if (confirmacaoConta) {
      setConfirmacaoConta(null);
      return;
    }

    if (tela !== 'home' && !veioDiretoParaEnderecos) {
      setTela('home');
      limparFormulario();
      setConfirmandoExclusao(null);
      return;
    }

    const tipo = String(
      usuarioLogado?.tipo ?? usuario?.tipo ?? '',
    ).toLowerCase();

    const veioDoPerfilEmpresa =
      parametroOrigem === 'empresa' || tipo.includes('empresa');

    if (veioDoPerfilEmpresa) {
      router.replace('/perfilempresa' as any);
      return;
    }

    if (parametroOrigem === 'cliente' || veioDiretoParaEnderecos) {
      router.replace('/perfil' as any);
      return;
    }

    router.replace('/perfil' as any);
  }

  function abrirTela(novaTela: Tela) {
    setTela(novaTela);
    limparFormulario();
    setConfirmandoExclusao(null);
    setConfirmacaoConta(null);
  }

  function alterarPreferencia(
    chave: keyof PreferenciasNotificacao,
    valor: boolean,
  ) {
    salvarPreferencias({
      ...preferencias,
      [chave]: valor,
    });
  }

  if (carregando || !autorizado) {
    return null;
  }

  const nomeUsuario =
    usuarioLogado?.nomeEmpresa ||
    usuarioLogado?.nome ||
    usuario?.nomeEmpresa ||
    usuario?.nome ||
    'Minha conta';

  const tipoUsuario = String(
    usuarioLogado?.tipo ?? usuario?.tipo ?? parametroOrigem ?? '',
  ).toLowerCase();

  const ehEmpresa =
    tipoUsuario.includes('empresa') || parametroOrigem === 'empresa';

  function renderCabecalho(titulo: string, subtitulo: string) {
    return (
      <View style={styles.cabecalho}>
        <Pressable
          onPress={voltarDaTela}
          style={styles.botaoVoltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.cabecalhoTextos}>
          <Text style={styles.tituloCabecalho}>{titulo}</Text>
          <Text style={styles.subtituloCabecalho}>{subtitulo}</Text>
        </View>
      </View>
    );
  }

  function renderMenuItem(
    titulo: string,
    descricao: string,
    icone: keyof typeof Ionicons.glyphMap,
    destino: Tela,
  ) {
    return (
      <Pressable
        key={destino}
        onPress={() => abrirTela(destino)}
        style={({ pressed }) => [
          styles.itemMenu,
          pressed && styles.itemPressionado,
        ]}
      >
        <View style={styles.iconeMenu}>
          <Ionicons name={icone} size={24} color={VERDE} />
        </View>

        <View style={styles.textosMenu}>
          <Text style={styles.tituloMenu}>{titulo}</Text>
          <Text style={styles.descricaoMenu}>{descricao}</Text>
        </View>

        <Ionicons name="chevron-forward" size={21} color="#8A978D" />
      </Pressable>
    );
  }

  function renderInicio() {
    return (
      <>
        {renderCabecalho(
          'Configurações',
          'Gerencie sua conta e suas preferências',
        )}

        <View style={styles.conteudo}>
          <View style={styles.cartaoBoasVindas}>
            <View style={styles.iconeBoasVindas}>
              <Ionicons name="settings-outline" size={29} color={VERDE} />
            </View>

            <View style={styles.boasVindasTextos}>
              <Text style={styles.boasVindasTitulo}>
                Olá, {nomeUsuario}!
              </Text>
              <Text style={styles.boasVindasDescricao}>
                O que você deseja ajustar?
              </Text>
            </View>
          </View>

          <Text style={styles.tituloSecao}>Minha conta</Text>

          <View style={styles.listaMenu}>
            {renderMenuItem(
              'Minha conta',
              'Altere seu nome, e-mail e telefone',
              'person-outline',
              'conta',
            )}

            {renderMenuItem(
              'Meus endereços',
              'Cadastre e altere seus endereços',
              'location-outline',
              'enderecos',
            )}

            {renderMenuItem(
              'Notificações',
              'Gerencie alertas, promoções e avisos',
              'notifications-outline',
              'notificacoes',
            )}

            {renderMenuItem(
              'Ajuda e suporte',
              'Encontre respostas para suas dúvidas',
              'help-circle-outline',
              'ajuda',
            )}
          </View>

          <Pressable
            onPress={() => setConfirmacaoConta('sair')}
            style={styles.botaoSair}
          >
            <Ionicons name="log-out-outline" size={21} color="#C43D3D" />
            <Text style={styles.textoBotaoSair}>Sair da conta</Text>
          </Pressable>

          {confirmacaoConta === 'sair' && (
            <View style={styles.confirmacaoConta}>
              <Text style={styles.confirmacaoTitulo}>
                Deseja sair da sua conta?
              </Text>

              <Text style={styles.confirmacaoDescricao}>
                Você poderá entrar novamente usando seus dados de acesso.
                Sua conta continuará cadastrada.
              </Text>

              <View style={styles.confirmacaoBotoes}>
                <Pressable
                  onPress={() => setConfirmacaoConta(null)}
                  style={styles.botaoManter}
                >
                  <Text style={styles.textoBotaoManter}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={sairDaConta}
                  style={styles.botaoConfirmarExcluir}
                >
                  <Text style={styles.textoConfirmarExcluir}>Sair</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </>
    );
  }

  function renderConta() {
    return (
      <>
        {renderCabecalho(
          'Minha conta',
          'Atualize suas informações pessoais',
        )}

        <View style={styles.conteudo}>
          <View style={styles.cartaoFormulario}>
            <Text style={styles.tituloFormulario}>Dados pessoais</Text>

            <Text style={styles.rotuloCampo}>Nome / Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#8A978D"
              value={nomeEditado}
              onChangeText={setNomeEditado}
              selectionColor={VERDE}
            />

            <Text style={styles.rotuloCampo}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#8A978D"
              value={emailEditado}
              onChangeText={setEmailEditado}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={VERDE}
            />

            <Text style={styles.rotuloCampo}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu telefone"
              placeholderTextColor="#8A978D"
              value={telefoneEditado}
              onChangeText={setTelefoneEditado}
              keyboardType="phone-pad"
              selectionColor={VERDE}
            />

            <Pressable
              onPress={salvarDadosConta}
              disabled={carregandoDados}
              style={({ pressed }) => [
                styles.botaoPrincipal,
                pressed && styles.itemPressionado,
              ]}
            >
              {carregandoDados ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.textoBotaoPrincipal}>
                    Salvar alterações
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.cartaoInformacao}>
            <Text style={styles.rotulo}>Documento cadastrado</Text>
            <Text style={styles.valor}>
              {usuarioLogado?.documento || 'Não informado'}
            </Text>
            <Text style={styles.textoObservacao}>
              O CPF ou CNPJ não pode ser alterado por esta tela.
            </Text>
          </View>
        </View>
      </>
    );
  }

  function renderEnderecos() {
    return (
      <>
        {renderCabecalho(
          'Meus endereços',
          'Gerencie os endereços da sua conta',
        )}

        <View style={styles.conteudo}>
          <View style={styles.cartaoFormulario}>
            <Text style={styles.tituloFormulario}>
              {editandoId ? 'Editar endereço' : 'Adicionar endereço'}
            </Text>

            <Text style={styles.rotuloCampo}>Nome do endereço</Text>
            <TextInput
              style={styles.input}
              placeholder={ehEmpresa ? 'Ex.: Loja principal' : 'Ex.: Casa'}
              placeholderTextColor="#8A978D"
              value={nomeEndereco}
              onChangeText={setNomeEndereco}
              selectionColor={VERDE}
            />

            <Text style={styles.rotuloCampo}>Endereço completo</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinha]}
              placeholder="Rua, número, bairro, cidade..."
              placeholderTextColor="#8A978D"
              value={textoEndereco}
              onChangeText={setTextoEndereco}
              multiline
              textAlignVertical="top"
              selectionColor={VERDE}
            />

            <Pressable
              onPress={salvarEndereco}
              style={({ pressed }) => [
                styles.botaoPrincipal,
                pressed && styles.itemPressionado,
              ]}
            >
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              <Text style={styles.textoBotaoPrincipal}>
                {editandoId ? 'Salvar alterações' : 'Salvar endereço'}
              </Text>
            </Pressable>

            {editandoId && (
              <Pressable
                onPress={limparFormulario}
                style={styles.botaoCancelar}
              >
                <Text style={styles.textoBotaoCancelar}>
                  Cancelar edição
                </Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.tituloSecao}>Endereços cadastrados</Text>

          {carregandoEnderecos ? (
            <ActivityIndicator
              size="large"
              color={VERDE}
              style={styles.carregando}
            />
          ) : enderecos.length === 0 ? (
            <View style={styles.estadoVazio}>
              <View style={styles.estadoVazioIcone}>
                <Ionicons
                  name="location-outline"
                  size={32}
                  color={VERDE}
                />
              </View>

              <Text style={styles.estadoVazioTitulo}>
                Nenhum endereço cadastrado
              </Text>

              <Text style={styles.estadoVazioDescricao}>
                Preencha os campos acima para adicionar o primeiro endereço.
              </Text>
            </View>
          ) : (
            enderecos.map((endereco) => (
              <View
                key={endereco.id}
                style={styles.cartaoEndereco}
              >
                <View style={styles.enderecoLinha}>
                  <View style={styles.enderecoIcone}>
                    <Ionicons
                      name="location"
                      size={23}
                      color={VERDE}
                    />
                  </View>

                  <View style={styles.enderecoTextos}>
                    <Text style={styles.nomeEnderecoSalvo}>
                      {endereco.nome}
                    </Text>

                    <Text style={styles.textoEnderecoSalvo}>
                      {endereco.texto}
                    </Text>
                  </View>
                </View>

                <View style={styles.acoesEndereco}>
                  <Pressable
                    onPress={() => iniciarEdicao(endereco)}
                    style={styles.botaoAcao}
                  >
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={VERDE}
                    />
                    <Text style={styles.textoAcao}>Editar</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => pedirExclusao(endereco.id)}
                    style={styles.botaoAcao}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#C43D3D"
                    />
                    <Text style={styles.textoExcluir}>Excluir</Text>
                  </Pressable>
                </View>

                {String(confirmandoExclusao) === String(endereco.id) && (
                  <View style={styles.confirmacaoExclusao}>
                    <Text style={styles.confirmacaoTitulo}>
                      Excluir este endereço?
                    </Text>

                    <Text style={styles.confirmacaoDescricao}>
                      Essa ação não poderá ser desfeita.
                    </Text>

                    <View style={styles.confirmacaoBotoes}>
                      <Pressable
                        onPress={() => setConfirmandoExclusao(null)}
                        style={styles.botaoManter}
                      >
                        <Text style={styles.textoBotaoManter}>
                          Cancelar
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => confirmarExclusao(endereco.id)}
                        style={styles.botaoConfirmarExcluir}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#FFFFFF"
                        />
                        <Text style={styles.textoConfirmarExcluir}>
                          Excluir
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </>
    );
  }

  function renderLinhaNotificacao(
    titulo: string,
    descricao: string,
    icone: keyof typeof Ionicons.glyphMap,
    chave: keyof PreferenciasNotificacao,
  ) {
    return (
      <View style={styles.linhaNotificacao} key={chave}>
        <View style={styles.iconeMenu}>
          <Ionicons name={icone} size={23} color={VERDE} />
        </View>

        <View style={styles.textosMenu}>
          <Text style={styles.tituloMenu}>{titulo}</Text>
          <Text style={styles.descricaoMenu}>{descricao}</Text>
        </View>

        <Switch
          value={preferencias[chave]}
          onValueChange={(valor) => alterarPreferencia(chave, valor)}
          trackColor={{ false: '#D5DDD6', true: VERDE }}
          thumbColor="#FFFFFF"
        />
      </View>
    );
  }

  function renderNotificacoes() {
    return (
      <>
        {renderCabecalho(
          'Notificações',
          'Escolha quais avisos deseja receber',
        )}

        <View style={styles.conteudo}>
          <View style={styles.cartaoInformacao}>
            {renderLinhaNotificacao(
              'Alertas',
              'Avisos importantes sobre sua conta e compras.',
              'alert-circle-outline',
              'alertas',
            )}

            <View style={styles.divisor} />

            {renderLinhaNotificacao(
              'Promoções',
              'Novidades, ofertas e descontos.',
              'pricetag-outline',
              'promocoes',
            )}

            <View style={styles.divisor} />

            {renderLinhaNotificacao(
              'E-mail',
              'Receber comunicados pelo seu e-mail cadastrado.',
              'mail-outline',
              'email',
            )}

            <View style={styles.divisor} />

            {renderLinhaNotificacao(
              'Push',
              'Receber notificações no dispositivo.',
              'phone-portrait-outline',
              'push',
            )}
          </View>

          <Text style={styles.textoObservacao}>
            Suas preferências ficam salvas nesta conta.
          </Text>
        </View>
      </>
    );
  }

  const perguntas = [
    {
      pergunta: 'Como altero meus dados?',
      resposta:
        'Acesse Minha conta, altere seu nome, e-mail ou telefone e toque em Salvar alterações.',
    },
    {
      pergunta: 'Como adiciono um endereço?',
      resposta:
        'Entre em Meus endereços, preencha o nome do endereço e o endereço completo. Depois toque em Salvar endereço.',
    },
    {
      pergunta: 'Como edito ou excluo um endereço?',
      resposta:
        'Na lista de endereços cadastrados, utilize os botões Editar ou Excluir. A exclusão pede uma confirmação antes de remover.',
    },
    {
      pergunta: 'Como desativo as notificações?',
      resposta:
        'Acesse Notificações e desative individualmente Alertas, Promoções, E-mail ou Push.',
    },
    {
      pergunta: 'Como saio da minha conta?',
      resposta:
        'Na tela principal de Configurações, toque em Sair da conta. Seu cadastro continuará salvo.',
    },
  ];

  function renderAjuda() {
    return (
      <>
        {renderCabecalho(
          'Ajuda e suporte',
          'Encontre respostas para suas dúvidas',
        )}

        <View style={styles.conteudo}>
          <View style={styles.cartaoInformacao}>
            <View style={styles.iconeCentral}>
              <Ionicons
                name="help-circle-outline"
                size={40}
                color={VERDE}
              />
            </View>

            <Text style={styles.tituloCentral}>
              Como podemos ajudar?
            </Text>

            <Text style={styles.textoCentral}>
              Confira as perguntas frequentes abaixo para encontrar orientações
              sobre sua conta e as funcionalidades do Economize.
            </Text>
          </View>

          <Text style={styles.tituloSecao}>
            Perguntas frequentes
          </Text>

          {perguntas.map((item, index) => (
            <View
              style={styles.cartaoPergunta}
              key={index}
            >
              <Pressable
                onPress={() =>
                  setPerguntaAberta(
                    perguntaAberta === index ? null : index,
                  )
                }
                style={styles.linhaPergunta}
              >
                <Text style={styles.textoPergunta}>
                  {item.pergunta}
                </Text>

                <Ionicons
                  name={
                    perguntaAberta === index
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={21}
                  color={VERDE}
                />
              </Pressable>

              {perguntaAberta === index && (
                <Text style={styles.respostaPergunta}>
                  {item.resposta}
                </Text>
              )}
            </View>
          ))}

          <View style={styles.cartaoInformacao}>
            <View style={styles.linhaInformacao}>
              <View style={styles.iconeMenu}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={24}
                  color={VERDE}
                />
              </View>

              <View style={styles.textosMenu}>
                <Text style={styles.tituloMenu}>Fale conosco</Text>
                <Text style={styles.descricaoMenu}>
                  Precisa de mais ajuda? Entre em contato com a equipe
                  responsável pelo aplicativo.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudoScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tela === 'home' && renderInicio()}
        {tela === 'conta' && renderConta()}
        {tela === 'enderecos' && renderEnderecos()}
        {tela === 'notificacoes' && renderNotificacoes()}
        {tela === 'ajuda' && renderAjuda()}
      </ScrollView>
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

  conteudoScroll: {
    paddingBottom: 30,
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: VERDE,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  botaoVoltar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.17)',
    marginRight: 14,
  },

  cabecalhoTextos: {
    flex: 1,
  },

  tituloCabecalho: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  subtituloCabecalho: {
    fontSize: 12,
    color: '#E8F3EB',
    marginTop: 5,
    lineHeight: 18,
  },

  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  cartaoBoasVindas: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2EBE3',
    padding: 16,
    marginBottom: 25,
  },

  iconeBoasVindas: {
    width: 51,
    height: 51,
    borderRadius: 16,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  boasVindasTextos: {
    flex: 1,
  },

  boasVindasTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: VERDE_ESCURO,
  },

  boasVindasDescricao: {
    fontSize: 12,
    color: '#748075',
    marginTop: 4,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: '800',
    color: VERDE_ESCURO,
    marginBottom: 13,
  },

  listaMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2EBE3',
    paddingHorizontal: 14,
  },

  itemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1ED',
  },

  itemPressionado: {
    opacity: 0.65,
  },

  iconeMenu: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  textosMenu: {
    flex: 1,
    marginRight: 8,
  },

  tituloMenu: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26382A',
  },

  descricaoMenu: {
    fontSize: 12,
    color: '#7A857C',
    marginTop: 4,
    lineHeight: 17,
  },

  cartaoInformacao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2EBE3',
    padding: 18,
    marginBottom: 18,
  },

  linhaInformacao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 7,
  },

  informacaoTextos: {
    flex: 1,
  },

  rotulo: {
    fontSize: 12,
    color: '#7A857C',
    marginBottom: 5,
  },

  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#26382A',
  },

  divisor: {
    height: 1,
    backgroundColor: '#E9EEE9',
    marginVertical: 12,
  },

  cartaoFormulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E2EBE3',
    marginBottom: 25,
  },

  tituloFormulario: {
    fontSize: 16,
    fontWeight: '800',
    color: VERDE_ESCURO,
    marginBottom: 17,
  },

  rotuloCampo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#425246',
    marginBottom: 7,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#DCE6DD',
    backgroundColor: '#FAFCFA',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: '#26382A',
    marginBottom: 15,
  },

  inputMultilinha: {
    minHeight: 88,
    paddingTop: 12,
  },

  botaoPrincipal: {
    minHeight: 49,
    backgroundColor: VERDE,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 14,
    marginTop: 2,
  },

  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  botaoCancelar: {
    alignItems: 'center',
    paddingVertical: 13,
    marginTop: 4,
  },

  textoBotaoCancelar: {
    fontSize: 13,
    fontWeight: '700',
    color: '#68746A',
  },

  carregando: {
    marginVertical: 25,
  },

  estadoVazio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EBE3',
  },

  estadoVazioIcone: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  estadoVazioTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: VERDE_ESCURO,
    textAlign: 'center',
  },

  estadoVazioDescricao: {
    fontSize: 12,
    color: '#748075',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  cartaoEndereco: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2EBE3',
    padding: 15,
    marginBottom: 12,
  },

  enderecoLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  enderecoIcone: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  enderecoTextos: {
    flex: 1,
  },

  nomeEnderecoSalvo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#26382A',
    marginBottom: 6,
  },

  textoEnderecoSalvo: {
    fontSize: 13,
    color: '#68746A',
    lineHeight: 19,
  },

  acoesEndereco: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: '#EDF1ED',
    marginTop: 14,
    paddingTop: 12,
  },

  botaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },

  textoAcao: {
    color: VERDE,
    fontSize: 12,
    fontWeight: '800',
  },

  textoExcluir: {
    color: '#C43D3D',
    fontSize: 12,
    fontWeight: '800',
  },

  confirmacaoExclusao: {
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#F1DADA',
    borderRadius: 13,
    padding: 13,
    marginTop: 13,
  },

  confirmacaoTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#963333',
  },

  confirmacaoDescricao: {
    fontSize: 12,
    color: '#795B5B',
    marginTop: 4,
    lineHeight: 18,
  },

  confirmacaoBotoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 13,
    flexWrap: 'wrap',
  },

  botaoManter: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#EDEFEA',
  },

  textoBotaoManter: {
    color: '#526256',
    fontSize: 12,
    fontWeight: '700',
  },

  botaoConfirmarExcluir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#C43D3D',
  },

  textoConfirmarExcluir: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  linhaNotificacao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },

  textoObservacao: {
    fontSize: 12,
    color: '#7A857C',
    lineHeight: 18,
    marginTop: 5,
  },

  iconeCentral: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: VERDE_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },

  tituloCentral: {
    fontSize: 17,
    fontWeight: '800',
    color: VERDE_ESCURO,
    textAlign: 'center',
    marginBottom: 9,
  },

  textoCentral: {
    fontSize: 13,
    color: '#68746A',
    lineHeight: 21,
    textAlign: 'center',
  },

  botaoSair: {
    marginTop: 20,
    marginBottom: 10,
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0DADA',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  textoBotaoSair: {
    color: '#C43D3D',
    fontSize: 14,
    fontWeight: '800',
  },

  confirmacaoConta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F1DADA',
    padding: 15,
    marginBottom: 18,
  },

  iconePerigo: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },

  tituloPerigo: {
    color: '#A93232',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 9,
  },

  botaoExcluirConta: {
    minHeight: 48,
    backgroundColor: '#C43D3D',
    borderRadius: 12,
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  cartaoPergunta: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EBE3',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 10,
  },

  linhaPergunta: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  textoPergunta: {
    flex: 1,
    color: '#26382A',
    fontSize: 13,
    fontWeight: '700',
  },

  respostaPergunta: {
    color: '#68746A',
    fontSize: 13,
    lineHeight: 20,
    paddingTop: 3,
    paddingBottom: 14,
  },
});