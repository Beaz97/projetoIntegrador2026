import { createContext, useContext, useState, ReactNode } from "react";

export type ItemCarrinho = {
  id: string;
  nome: string;
  preco: number;
  descricao?: string;
  imagem?: string;
  unidade?: string;
  quantidade: number;
};

type CarrinhoContextType = {
  itens: ItemCarrinho[];
  adicionar: (item: Omit<ItemCarrinho, "quantidade">) => void;
  aumentar: (id: string) => void;
  diminuir: (id: string) => void;
  remover: (id: string) => void;
  limpar: () => void;
};

const CarrinhoContext = createContext<CarrinhoContextType | null>(null);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  const adicionar = (item: Omit<ItemCarrinho, "quantidade">) => {
    setItens((atual) => {
      const existe = atual.find((i) => i.id === item.id);
      if (existe) {
        return atual.map((i) =>
          i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...atual, { ...item, quantidade: 1 }];
    });
  };

  const remover = (id: string) => {
    setItens((atual) => atual.filter((i) => i.id !== id));
  };

  const aumentar = (id: string) => {
    setItens((atual) =>
      atual.map((item) =>
        item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item
      )
    );
  };

  const diminuir = (id: string) => {
    setItens((atual) =>
      atual.flatMap((item) => {
        if (item.id !== id) return [item];
        if (item.quantidade <= 1) return [];
        return [{ ...item, quantidade: item.quantidade - 1 }];
      })
    );
  };

  const limpar = () => setItens([]);

  return (
    <CarrinhoContext.Provider
      value={{ itens, adicionar, aumentar, diminuir, remover, limpar }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error("useCarrinho precisa estar dentro do CarrinhoProvider");
  return ctx;
}