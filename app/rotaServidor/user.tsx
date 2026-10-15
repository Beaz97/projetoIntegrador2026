export interface User {
    id: string;
    nome: string;
    email: string;
    senha: string;
    documento: string;
}


export default function Users() {

    const users: User[] = [
        {
            id: '1',
            nome: 'Rodrigo',
            email: 'rodrigo@prof.senac.br',
            senha: 'asd@!#asd!@#',
            documento: '1234567890'
        },
        {
            id: '2',
            nome: 'Vitoria',
            email: 'vivica@gmail.com',
            senha: 'asd@!#asd!@#',
            documento: '1234567898'
        }
    ]
    return users
}