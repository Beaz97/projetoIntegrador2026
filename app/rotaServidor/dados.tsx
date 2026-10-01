export default function Dados() {
    const categorias = [
    {
        id: '1',
        nome: 'Hortifruti',
        icone: 'leaf-outline',
    },
    { id: '2', nome: 'Bebidas', icone: 'wine-outline' },
    { id: '3', nome: 'Alimentos', icone: 'restaurant-outline'},
    { id: '4', nome: 'Carnes', icone: 'fish-outline' },
    ];

    const produtos = [
    {
      id: '1',
      nome: 'Banana nanica',
      unidade: 'Kg',
      preco: 'R$ 3,49',
      icone: 'nutrition-outline',
      imagem: 'https://img.freepik.com/premium-photo/close-up-photo-fresh-fruit-banana_983093-21.jpg',
      oferta: true,
      categoria:"1"
    },
    { id: '2', nome: 'Leite integral', unidade: '1L', preco: 'R$ 4,99', icone: 'water-outline', imagem: 'https://images.tcdn.com.br/img/img_prod/1023690/leite_integral_1_lt_c_12_italac_451_1_0d91793cde338bf25e86c23efe22376c.png', oferta: true, categoria:"2" },
    { id: '3', nome: 'Morango', unidade: 'Kg', preco: 'R$ 8,99', icone: 'nutrition-outline', imagem: 'https://media.guiame.com.br/archives/2014/12/19/1556727865-morango.jpg', categoria:"1" },
    { id: '4', nome: 'Arroz branco', unidade: '5Kg', preco: 'R$ 24,90', icone: 'restaurant-outline', imagem: 'https://tse2.mm.bing.net/th/id/OIP.eCA1ztk1wz_2wKwwXC-2-QHaJz?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', oferta: true },
  ];

    const dados = {produtos, categorias};

    return dados;
}