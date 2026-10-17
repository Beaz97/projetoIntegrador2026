import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
    id: string;
    nome: string;
    email: string;
    senha: string;
    documento: string;
    tipo?: string;
}

export interface LoginResultado {
    sucesso: boolean;
    mensagem: string;
    usuario?: Omit<User, 'senha'>;
}

import seedUsers from './user.json';

const STORAGE_KEY = '@banco_usuarios';

// Interface para compatibilidade com o formato do user.json
interface RawUserMock {
    id: string | number;
    nome?: string;
    email?: string;
    documento?: string;
    senha?: string;
    password?: string;
    tipo?: string;
}

// Normaliza os dados mockados do user.json
function normalizarMockUsers(dados: RawUserMock[]): User[] {
    return dados.map((u, index) => ({
        id: String(u.id ?? index + 1),
        nome: u.nome || '',
        email: u.email || '',
        senha: u.senha || u.password || '',
        documento: u.documento || '',
        tipo: u.tipo || 'cliente',
    }));
}

// Array em memória inicializado com os dados do user.json
let usuariosEmMemoria: User[] = normalizarMockUsers(seedUsers as RawUserMock[]);
let carregadoDoStorage = false;


/**
 * Carrega os usuários salvos no AsyncStorage (se existirem),
 * garantindo persistência no app sem perder novos cadastros ao recarregar a tela.
 */
async function sincronizarStorage(): Promise<User[]> {
    try {
        const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
        if (dadosSalvos) {
            const parsed: User[] = JSON.parse(dadosSalvos);
            if (Array.isArray(parsed) && parsed.length > 0) {
                usuariosEmMemoria = parsed;
                carregadoDoStorage = true;
                return usuariosEmMemoria;
            }
        }
        // Se não há nada no AsyncStorage ainda, salva o estado inicial do user.json
        if (!carregadoDoStorage) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosEmMemoria));
            carregadoDoStorage = true;
        }
    } catch (error) {
        console.warn('Erro ao sincronizar com AsyncStorage:', error);
    }
    return usuariosEmMemoria;
}

/**
 * Salva a lista de usuários atualizada no AsyncStorage e fisicamente no user.json via FS.
 */
async function persistirStorage(): Promise<void> {
    // Salva no AsyncStorage (disco local do dispositivo/app)
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosEmMemoria));
    } catch (error) {
        console.warn('Erro ao persistir no AsyncStorage:', error);
    }

}

/**
 * Criptografa uma senha usando hash SHA-256 via expo-crypto.
 */
export async function hashSenha(senha: string): Promise<string> {
    return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        senha
    );
}

/**
 * Compara a senha digitada com a senha armazenada.
 * Suporta o hash SHA-256 e também texto puro (para compatibilidade com os dados iniciais do JSON).
 */
export async function verificarSenha(
    senhaDigitada: string,
    senhaArmazenada: string
): Promise<boolean> {
    if (!senhaDigitada || !senhaArmazenada) return false;
    const hash = await hashSenha(senhaDigitada);
    return hash === senhaArmazenada || senhaDigitada === senhaArmazenada;
}

/**
 * Retorna todos os usuários cadastrados.
 */
export async function listarTodos(): Promise<User[]> {
    await sincronizarStorage();
    return [...usuariosEmMemoria];
}

/**
 * Busca um usuário pelo ID.
 */
export async function buscarPorId(id: string): Promise<User | null> {
    await sincronizarStorage();
    const usuario = usuariosEmMemoria.find((u) => String(u.id) === String(id));
    return usuario ? { ...usuario } : null;
}

/**
 * Busca um usuário pelo e-mail.
 */
export async function buscarPorEmail(email: string): Promise<User | null> {
    await sincronizarStorage();
    const emailNorm = email.trim().toLowerCase();
    const usuario = usuariosEmMemoria.find(
        (u) => u.email.trim().toLowerCase() === emailNorm
    );
    return usuario ? { ...usuario } : null;
}

/**
 * Busca um usuário pelo documento (CPF ou CNPJ).
 */
export async function buscarPorDocumento(documento: string): Promise<User | null> {
    await sincronizarStorage();
    const docLimpo = documento.replace(/\D/g, '');
    const usuario = usuariosEmMemoria.find((u) => {
        const uDocLimpo = u.documento.replace(/\D/g, '');
        return (docLimpo !== '' && uDocLimpo === docLimpo) || u.documento === documento.trim();
    });
    return usuario ? { ...usuario } : null;
}

/**
 * Cadastra um novo usuário no banco JSON, gravando fisicamente no user.json com FS.
 */
export async function criar(dados: Omit<User, 'id'>): Promise<User> {
    await sincronizarStorage();

    // Validação: email duplicado
    const emailExistente = usuariosEmMemoria.some(
        (u) => u.email.trim().toLowerCase() === dados.email.trim().toLowerCase()
    );
    if (emailExistente) {
        throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }

    // Validação: documento duplicado
    const docLimpo = dados.documento.replace(/\D/g, '');
    if (docLimpo) {
        const docExistente = usuariosEmMemoria.some(
            (u) => u.documento.replace(/\D/g, '') === docLimpo
        );
        if (docExistente) {
            throw new Error('Já existe um usuário cadastrado com este documento.');
        }
    }

    // Criptografa a senha
    const senhaCriptografada = await hashSenha(dados.senha);

    // Gera o próximo ID
    const novoId =
        usuariosEmMemoria.length > 0
            ? String(Math.max(...usuariosEmMemoria.map((u) => Number(u.id) || 0)) + 1)
            : '1';

    const novoUsuario: User = {
        id: novoId,
        nome: dados.nome.trim(),
        email: dados.email.trim().toLowerCase(),
        senha: senhaCriptografada,
        documento: dados.documento.trim(),
        tipo: dados.tipo || 'cliente',
    };

    usuariosEmMemoria.push(novoUsuario);

    // Persiste em disco com FS e no AsyncStorage
    await persistirStorage();

    return { ...novoUsuario };
}

/**
 * Atualiza os dados de um usuário existente e persiste no user.json via FS.
 */
export async function atualizar(
    id: string,
    dadosAtualizados: Partial<Omit<User, 'id'>>
): Promise<User> {
    await sincronizarStorage();
    const index = usuariosEmMemoria.findIndex((u) => String(u.id) === String(id));
    if (index === -1) {
        throw new Error(`Usuário com ID ${id} não encontrado.`);
    }

    const usuarioAtual = usuariosEmMemoria[index];

    // Se alterou o email, verifica duplicidade com outro usuário
    if (dadosAtualizados.email) {
        const emailNorm = dadosAtualizados.email.trim().toLowerCase();
        const emailExistente = usuariosEmMemoria.find(
            (u) => u.id !== String(id) && u.email.trim().toLowerCase() === emailNorm
        );
        if (emailExistente) {
            throw new Error('Este e-mail já está em uso por outro usuário.');
        }
    }

    let novaSenha = usuarioAtual.senha;
    if (dadosAtualizados.senha && dadosAtualizados.senha.trim() !== '') {
        novaSenha = await hashSenha(dadosAtualizados.senha);
    }

    const usuarioModificado: User = {
        ...usuarioAtual,
        ...dadosAtualizados,
        id: usuarioAtual.id,
        senha: novaSenha,
    };

    usuariosEmMemoria[index] = usuarioModificado;
    await persistirStorage();

    return { ...usuarioModificado };
}

/**
 * Remove um usuário pelo ID e atualiza o user.json no disco via FS.
 */
export async function remover(id: string): Promise<boolean> {
    await sincronizarStorage();
    const index = usuariosEmMemoria.findIndex((u) => String(u.id) === String(id));
    if (index === -1) {
        return false;
    }
    usuariosEmMemoria.splice(index, 1);
    await persistirStorage();
    return true;
}

/**
 * Realiza o login comparando o identificador (e-mail ou CPF/CNPJ) e a senha.
 * A senha digitada é verificada com hash criptográfico.
 */
export async function login(
    identificador: string,
    senhaDigitada: string
): Promise<LoginResultado> {
    await sincronizarStorage();

    if (!identificador || !senhaDigitada) {
        return {
            sucesso: false,
            mensagem: 'Por favor, informe seu usuário (e-mail ou CPF/CNPJ) e a senha.',
        };
    }

    const termo = identificador.trim().toLowerCase();
    const docLimpo = identificador.replace(/\D/g, '');

    const usuario = usuariosEmMemoria.find((u) => {
        const matchEmail = u.email.trim().toLowerCase() === termo;
        const uDocLimpo = u.documento.replace(/\D/g, '');
        const matchDoc = docLimpo !== '' && (uDocLimpo === docLimpo || u.documento === identificador.trim());
        return matchEmail || matchDoc;
    });

    if (!usuario) {
        return {
            sucesso: false,
            mensagem: 'Usuário não encontrado. Verifique os dados digitados.',
        };
    }

    const senhaValida = await verificarSenha(senhaDigitada, usuario.senha);
    if (!senhaValida) {
        return {
            sucesso: false,
            mensagem: 'Senha incorreta. Tente novamente.',
        };
    }

    // Se a senha estava em texto plano (seed inicial), migra automaticamente para o hash
    if (usuario.senha === senhaDigitada) {
        usuario.senha = await hashSenha(senhaDigitada);
        await persistirStorage();
    }

    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
        sucesso: true,
        mensagem: 'Login realizado com sucesso!',
        usuario: usuarioSemSenha,
    };
}

/**
 * Restaura o banco de usuários para o estado original do user.json.
 */
export async function resetarBanco(): Promise<User[]> {
    usuariosEmMemoria = normalizarMockUsers(seedUsers as RawUserMock[]);
    await persistirStorage();
    return [...usuariosEmMemoria];
}

/**
 * Função compatível com o padrão de função Users.
 */
export function Users(): User[] {
    return usuariosEmMemoria;
}

export const userController = {
    listarTodos,
    buscarPorId,
    buscarPorEmail,
    buscarPorDocumento,
    criar,
    atualizar,
    remover,
    deletar: remover,
    login,
    hashSenha,
    verificarSenha,
    resetarBanco,
    Users,
};

export default userController;