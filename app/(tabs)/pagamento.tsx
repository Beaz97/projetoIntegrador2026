import { View, StyleSheet, Text, Pressable, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function pagamento() {
    
    return (
        <View style={styles.parent}>
            <View style={styles.header}>
                <Pressable style={[styles.voltar, {flex: 1}]}>
                    <Ionicons name="chevron-back-sharp" color={'#315F3C'} size={35}></Ionicons>
                </Pressable>
                <Text style={[styles.titulo, {flex: 3, textAlign: 'center'}]}>Finalizar compra</Text>
                <View style={{flex: 1}}></View>
            </View>
            <View style={styles.main}>
                <View style={styles.entrega}>
                    <Text style={styles.titulo}>Entrega ou retirada</Text>
                    <View style={styles.campo}>
                        <View style={styles.option}>
                            <Pressable style={({pressed})=>[styles.normal, pressed && styles.yPress]}>
                                <View style={styles.align}>
                                    <Pressable style={[styles.selection, {}]} onPress={()=>{}}/>
                                </View>
                                <View style={styles.align}>
                                    <Text style={styles.rotuloMaior}>Entrega</Text>
                                    <Text style={styles.rotuloMenor}>Endereço</Text>
                                </View>
                            </Pressable>
                        </View>
                        <View style={styles.skip}>
                            <Pressable style={({pressed})=>[styles.normal, pressed && styles.yPress]}>
                                <View style={styles.align}>
                                    <Pressable style={styles.selection}/>
                                </View>
                                <View style={styles.align}>
                                    <Text style={styles.rotuloMaior}>Entrega</Text>
                                    <Text style={styles.rotuloMenor}>Endereço</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </View>
                <View style={styles.pagamento}>
                    <Text style={styles.titulo}>Forma de pagamento</Text>
                    <View style={styles.campo}>
                        
                    </View>
                </View>
            </View>
            <View style={styles.footer}>
                <View style={styles.resumo}>
                    <Text style={styles.textoForte}>Resumo do pedido</Text>
                    <View>
                        <View style={styles.dados}>
                            x itens
                            <span/>
                            valor
                        </View>
                        <View style={styles.dados}>
                            Entrega
                            <span/>
                            Tipo entrega
                        </View>
                    </View>
                </View>
                <View style={styles.areaBotao}>
                    <Pressable style={({pressed})=>[styles.botao, pressed && styles.yPress]}>
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
        justifyContent: 'space-around',
        fontFamily: 'Segoe UI'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
        voltar: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
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
            borderRadius: 15,
            overflow: 'hidden'
        },
            option: {
                flex: 1,
                justifyContent: 'center',
                overflow: 'hidden',
                borderBottomWidth: 1
            },
            skip: {
                flex: 1,
                borderBottomWidth: 0
            },
                normal: {flex: 1, flexDirection: 'row', justifyContent: 'flex-start'},
                yPress: {backgroundColor: '#43a062'},
    footer: {
        flex: 3,
    },
        resumo: {
            flex: 3,
            paddingLeft: 50,
            paddingRight: 50,
        },
            dados: {
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
        areaBotao: {
            backgroundColor: '#ffffff00',
            flex: 2,
            paddingLeft: 40,
            paddingRight: 40,
            justifyContent: 'center'
        },
            botao: {
                backgroundColor: '#3E8050',
                color: '#fff',
                borderRadius: 25,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: 20,
                padding: 10
            },



    titulo: {
        fontSize: 25,
        fontWeight: '500',
        color: '#000',
    },
    rotuloMaior: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'left'
    },
    rotuloMenor: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'left'
    },
    textoForte: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    escuro:{color:'#000'}, claro:{color:'#fff'},
    selection: {
        backgroundColor: '#ffffff',
        borderColor: '#3E8050',
        borderWidth: 2,
        borderRadius: 100,
        marginLeft: 10,
        marginRight: 25,
        width: 30,
        height: 30
    },
    align: {
        justifyContent: 'center',
        alignItems: 'center'
    }

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