import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import userController, { type User } from '@/app/rotaServidor/userController';

export type UsuarioLogado = Omit<User, 'senha'>;

interface AutenticaTelasProps {
  /**
   * Tipo ou lista de tipos permitidos nesta tela (ex: 'cliente', 'empresa', ou ['cliente', 'empresa']).
   * Se não for fornecido, qualquer usuário autenticado tem acesso.
   */
  tipoPermitido?: string | string[];
  /**
   * Rota para onde o usuário será redirecionado caso não esteja autenticado ou não tenha permissão.
   * Padrão: '/senha'
   */
  rotaRedirecionamento?: string;
  /**
   * Conteúdo da tela que só será renderizado se o usuário estiver autenticado e autorizado.
   */
  children: React.ReactNode | ((usuario: UsuarioLogado) => React.ReactNode);
}

/**
 * Hook reutilizável para autenticação e verificação de permissão em telas.
 */
export function useAutenticacao(tipoPermitido?: string | string[], rotaRedirecionamento = '/senha') {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(userController.getUsuarioLogado());
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    let montado = true;

    async function verificarPermissao() {
      try {
        const u = await userController.carregarUsuarioLogado();

        if (!montado) return;

        // 1. Se não tiver usuário logado -> redireciona
        if (!u) {
          setAutorizado(false);
          router.replace(rotaRedirecionamento as any);
          return;
        }

        // 2. Se houver tipos permitidos, valida a permissão
        if (tipoPermitido) {
          const tipos = Array.isArray(tipoPermitido)
            ? tipoPermitido.map((t) => t.toLowerCase())
            : [tipoPermitido.toLowerCase()];

          const tipoAtual = (u.tipo || 'cliente').toLowerCase();

          if (!tipos.includes(tipoAtual)) {
            setAutorizado(false);
            router.replace(rotaRedirecionamento as any);
            return;
          }
        }

        setUsuario(u);
        setAutorizado(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        if (montado) {
          setAutorizado(false);
          router.replace(rotaRedirecionamento as any);
        }
      } finally {
        if (montado) {
          setCarregando(false);
        }
      }
    }

    verificarPermissao();

    return () => {
      montado = false;
    };
  }, [tipoPermitido, rotaRedirecionamento]);

  return { usuario, carregando, autorizado };
}

/**
 * Componente Wrapper para proteger telas.
 */
export default function AutenticaTelas({
  tipoPermitido,
  rotaRedirecionamento = '/senha',
  children,
}: AutenticaTelasProps) {
  const { usuario, carregando, autorizado } = useAutenticacao(tipoPermitido, rotaRedirecionamento);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2f7a4b" />
      </View>
    );
  }

  if (!autorizado || !usuario) {
    return null;
  }

  return (
    <>
      {typeof children === 'function' ? children(usuario) : children}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
