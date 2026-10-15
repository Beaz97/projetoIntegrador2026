export interface Categoria {
  id: string;
  nome: string;
  icone: string;
}

export interface Produto {
  id: string;
  nome: string;
  unidade: string;
  preco: number;
  icone: string;
  imagem?: string;
  oferta?: boolean;
  categoria?: string;
}

export default function Dados() {
  const categorias: Categoria[] = [
    { id: '1', nome: 'Hortifruti', icone: 'leaf-outline' },
    { id: '2', nome: 'Bebidas', icone: 'wine-outline' },
    { id: '3', nome: 'Alimentos', icone: 'restaurant-outline' },
    { id: '4', nome: 'Carnes', icone: 'fish-outline' },
  ];

  const produtos: Produto[] = [
    {
      id: '1',
      nome: 'Banana nanica',
      unidade: 'Kg',
      preco: 3.49,
      icone: 'nutrition-outline',
      imagem: 'https://img.freepik.com/premium-photo/close-up-photo-fresh-fruit-banana_983093-21.jpg',
      oferta: true,
      categoria: '1',
    },
    {
      id: '2',
      nome: 'Leite integral',
      unidade: '1L',
      preco: 4.99,
      icone: 'water-outline',
      imagem: 'https://images.tcdn.com.br/img/img_prod/1023690/leite_integral_1_lt_c_12_italac_451_1_0d91793cde338bf25e86c23efe22376c.png',
      oferta: true,
      categoria: '2',
    },
    {
      id: '3',
      nome: 'Morango',
      unidade: 'Kg',
      preco: 8.99,
      icone: 'nutrition-outline',
      imagem: 'https://media.guiame.com.br/archives/2014/12/19/1556727865-morango.jpg',
      categoria: '1',
    },
    {
      id: '4',
      nome: 'Arroz branco',
      unidade: '5Kg',
      preco: 24.90,
      icone: 'restaurant-outline',
      imagem: 'https://tse2.mm.bing.net/th/id/OIP.eCA1ztk1wz_2wKwwXC-2-QHaJz?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      oferta: true,
      categoria: '3',
    },

    // ===== HORTIFRUTI =====
    {
      id: '5',
      nome: 'Maçã fuji',
      unidade: 'Kg',
      preco: 6.99,
      icone: 'nutrition-outline',
      imagem: 'https://tse4.mm.bing.net/th/id/OIP.uk4sqGbS9N3gCaG1mqOqcQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      oferta: true,
      categoria: '1',
    },
    {
      id: '6',
      nome: 'Tomate',
      unidade: 'Kg',
      preco: 5.49,
      icone: 'leaf-outline',
      imagem: 'https://tse4.mm.bing.net/th/id/OIP.9XpYZuQ4u0WnNQrrOdK2cQHaE6?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      categoria: '1',
    },
    {
      id: '7',
      nome: 'Alface crespa',
      unidade: 'Un',
      preco: 2.99,
      icone: 'leaf-outline',
      imagem: 'https://tse1.mm.bing.net/th/id/OIP.4-H-nntg_Si0-DmJTmcOLgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      categoria: '1',
    },
    {
      id: '8',
      nome: 'Batata inglesa',
      unidade: 'Kg',
      preco: 4.79,
      icone: 'nutrition-outline',
      imagem: 'https://tse3.mm.bing.net/th/id/OIP.FLk5OC9exYggVsXoGCEyXAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      categoria: '1',
    },

    // ===== BEBIDAS =====
    {
      id: '9',
      nome: 'Suco de laranja',
      unidade: '1L',
      preco: 7.5,
      icone: 'water-outline',
      imagem: 'https://tse4.mm.bing.net/th/id/OIP.DXX8_G3kJTSQKNcxBIbVGQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      categoria: '2',
    },
    {
      id: '10',
      nome: 'Refrigerante coca-cola',
      unidade: '2L',
      preco: 8.99,
      icone: 'wine-outline',
      imagem: 'https://tse1.mm.bing.net/th/id/OIP.PS6pSkpYvOnlb_zl5-F9RQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      oferta: true,
      categoria: '2',
    },
    {
      id: '11',
      nome: 'Água mineral',
      unidade: '1,5L',
      preco: 2.49,
      icone: 'water-outline',
      imagem: 'https://static.paodeacucar.com/img/uploads/1/626/24660626.png',
      categoria: '2',
    },
    {
      id: '12',
      nome: 'Cerveja lata',
      unidade: '350ml',
      preco: 3.99,
      icone: 'beer-outline',
      imagem: 'https://static.paodeacucar.com/img/uploads/1/635/12963635.jpg',
      categoria: '2',
    },

    // ===== ALIMENTOS =====
    {
      id: '13',
      nome: 'Feijão carioca',
      unidade: '1Kg',
      preco: 7.99,
      icone: 'restaurant-outline',
      imagem: 'https://tse3.mm.bing.net/th/id/OIP.kB6NTeiXqMUeYFwGAnCZuAAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      oferta: true,
      categoria: '3',
    },
    {
      id: '14',
      nome: 'Macarrão espaguete',
      unidade: '500g',
      preco: 4.49,
      icone: 'restaurant-outline',
      imagem: 'https://cdn.awsli.com.br/2500x2500/1775/1775051/produto/217811761/7896417204017-498icg5i9d.jpg',
      categoria: '3',
    },
    {
      id: '15',
      nome: 'Ovos brancos',
      unidade: '12 un',
      preco: 12.9,
      icone: 'egg-outline',
      imagem: 'https://tse4.mm.bing.net/th/id/OIP.V5VL5wlVNmKXyzNkl0bm7AHaE7?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      categoria: '3',
    },
    {
      id: '16',
      nome: 'Pão de forma',
      unidade: '500g',
      preco: 8.49,
      icone: 'fast-food-outline',
      imagem: 'https://images.tcdn.com.br/img/img_prod/462274/kit_com_1_000_sacos_28x50cm_para_pao_de_forma_grande_3972_2_cd099c5e57e406ab49553cc3ec266fab.jpg',
      categoria: '3',
    },

    // ===== CARNES =====
    {
      id: '17',
      nome: 'Peito de frango',
      unidade: 'Kg',
      preco: 18.9,
      icone: 'fish-outline',
      imagem: 'https://mercantilnovaera.vteximg.com.br/arquivos/ids/172884-1000-1000/File-de-Peito-de-Frango-SADIA-Na-Medida-Temperado-Saco-1kg.jpg?v=637448734028330000',
      oferta: true,
      categoria: '4',
    },
    {
      id: '18',
      nome: 'Carne moída',
      unidade: 'Kg',
      preco: 36.9,
      icone: 'fish-outline',
      imagem: 'https://cdn.b4c.inf.br/storage/acouguebg/original/carne-moida-400gr-carne-bovina-best-beef-1732301177.webp',
      categoria: '4',
    },
    {
      id: '19',
      nome: 'Filé de tilápia',
      unidade: 'Kg',
      preco: 39.9,
      icone: 'fish-outline',
      imagem: 'https://tse3.mm.bing.net/th/id/OIP.YCZNkZ_lnqQGAul1Xhh8xgHaIa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      categoria: '4',
    },
    {
      id: '20',
      nome: 'Linguiça toscana',
      unidade: 'Kg',
      preco: 19.9,
      icone: 'flame-outline',
      imagem: 'https://www.sadia.com.br/assets/images/_/products/39721c564ca143c8caeb442f2a2d833c6c5aa0a9.webp',
      categoria: '4',
    },
  ];

  return { produtos, categorias };
}
