import { View, StyleSheet, Text, Pressable, } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function pagamento() {
    return (
        <View style={styles.parent}>
            <View style={styles.header}>
                <Pressable style={styles.voltar}>
                    <Ionicons name="chevron-back-sharp" color={'#315F3C'} size={35}></Ionicons>
                </Pressable>
                <Text style={styles.titulo}>Finalizar compra</Text>
            </View>
            <View style={styles.main}>
                <View style={styles.entrega}>
                    <Text style={styles.titulo}>Entrega ou retirada</Text>
                    <View style={styles.campo}>
                        <option value="" style={styles.option}>
                            <Text>Entrega em casa</Text>
                        </option>
                        <option value="" style={styles.option}>
                            Retirar na loja
                        </option>
                    </View>
                </View>
                <View style={styles.pagamento}>
                    <Text style={styles.titulo}>Forma de pagamento</Text>
                    <View style={styles.campo}>
                        <option value="" style={styles.option}>
                            Pix
                        </option>
                        <option value="" style={styles.option}>
                            Cartão de crédito
                        </option>
                        <option value="" style={styles.option}>
                            Cartão de débito
                        </option>
                        <option value="" style={styles.option}>
                            Dinheiro
                        </option>
                    </View>
                </View>
            </View>
            <View style={styles.footer}>
                <View style={styles.resumo}>
                    <Text style={styles.textoForte}>Resumo do pedido</Text>
                    ...
                </View>
                <View style={styles.areaBotao}>
                    <Pressable style={styles.botao}>
                        Finalizar
                    </Pressable>
                </View>
                
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    parent: {
        backgroundColor: '#FFF',
        flex: 1,
        justifyContent: 'space-around'
    },
    header: {
        flex: 1,
        flexDirection: 'row',
    },
        voltar: {
            paddingRight: 15,
            paddingLeft: 15
        },
    main: {
        flex: 8,
    },
        entrega: {
            flex: 2,
            margin: 5,
            paddingLeft: 35,
            paddingRight: 35,
        },
        pagamento: {
            flex: 4,
            margin: 5,
            paddingLeft: 35,
            paddingRight: 35,
        },
        campo: {
            flex: 1,
            borderWidth: 1,
            borderRadius: 15
        },
            option: {
                flex: 1
            },
    footer: {
        flex: 3,
    },
        resumo: {
            backgroundColor: '#757575',
            flex: 2,
            paddingLeft: 50,
            paddingRight: 50,
        },
        areaBotao: {
            backgroundColor: '#505050',
            flex: 3,
            paddingLeft: 35,
            paddingRight: 35,
        },
            botao: {
                backgroundColor: '#315F3C',
                padding: 10,
                borderRadius: 25,
            },



    titulo: {
        fontSize: 30,
        fontWeight: '500',
        color: '#000'
    },
    rotulo: {
        fontSize: 30,
        fontWeight: '500',
        color: '#fff',
        textAlign: 'center'
    },
    textoForte: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    escuro:{color:'#000'}, claro:{color:'#fff'}

})

/*
| Font                | General category | Common association        |
| ------------------- | ---------------- | ------------------------- |
| **Arial**           | Sans-serif       | General documents/UI      |
| **Times New Roman** | Serif            | Academic/formal documents |
| **Helvetica**       | Sans-serif       | Graphic design/print      |
| **Calibri**         | Sans-serif       | Microsoft Office          |
| **Georgia**         | Serif            | Web/document text         |
| **Verdana**         | Sans-serif       | Screen/UI text            |
| **Courier New**     | Monospace        | Programming/terminals     |
| **Tahoma**          | Sans-serif       | Windows UI                |
| **Trebuchet MS**    | Sans-serif       | Web/UI                    |
*/