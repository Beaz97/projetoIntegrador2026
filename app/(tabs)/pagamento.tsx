import { View, StyleSheet, Text, Pressable, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carrinho from "./carrinho";

export default function pagamento() {
    const router = useRouter()
    const [stateUm, setStateUm] = useState('Entrega');
    const [stateDois, setStateDois] = useState('Pix');

    async function atualizar() {
        const lista = await AsyncStorage.getItem('carrinho');
        if (lista) {
            setProdutos(JSON.parse(lista));
        }
        
    }
    // Chama a função atualizar sempre que a tela ganha foco.
    useFocusEffect(
        useCallback(() => {
            atualizar();
        }, [])
    );

  const [produtos, setProdutos] = useState([]);
    

    return (
        <View style={styles.parent}>
            <View style={styles.header}>
                <View style={[styles.voltar, {flex: 1}]}>
                    <Pressable onPress={router.back}>
                        <Ionicons name="chevron-back-sharp" color={'#315F3C'} size={35}></Ionicons>
                    </Pressable>
                </View>
                <Text style={[styles.titulo, {flex: 3, textAlign: 'center'}]}>Finalizar compra </Text>
                <View style={{flex: 1}}></View>
            </View>
            <View style={styles.main}>
                <View style={styles.entrega}>
                    <Text style={styles.titulo}>Entrega ou retirada</Text>
                    <View style={styles.campo}>
                        <View style={styles.option}>
                            <Pressable style={({pressed})=>[styles.nPress, pressed && styles.yPress]} onPress={()=>{
                                        setStateUm('Entrega')
                                        }}>
                                <View style={styles.align}>
                                    <View style={stateUm == 'Entrega'? styles.selected : styles.unselected}/>
                                </View>
                                <View style={styles.align}>
                                    <Text style={styles.rotuloMaior}>Entrega em casa</Text>
                                    <Text style={styles.rotuloMenor}>Endereço</Text>
                                    
                                </View>
                            </Pressable>
                        </View>
                        <View style={styles.skip}>
                            <Pressable style={({pressed})=>[styles.nPress, pressed && styles.yPress]} onPress={()=>{
                                        setStateUm('Retirar')
                                        }}>
                                <View style={styles.align}>
                                    <View style={stateUm == 'Retirar'? styles.selected : styles.unselected}/>
                                </View>
                                <View style={styles.align}>
                                    <Text style={styles.rotuloMaior}>Retirar na loja</Text>
                                    <Text style={styles.rotuloMenor}>Encontre o mercado mais próximo</Text>
                                    
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </View>
                <View style={styles.pagamento}>
                    <Text style={styles.titulo}>Forma de pagamento</Text>
                    <View style={styles.campo}>
                        <View style={styles.option}>
                            <Pressable style={({pressed})=>[styles.nPress, pressed && styles.yPress]} onPress={()=>{
                                        setStateDois('Pix')
                                        }}>
                                <View style={styles.align}>
                                    <View style={stateDois == 'Pix'? styles.selected : styles.unselected}/>
                                </View>
                                <View style={styles.align}>
                                    <Text style={styles.rotuloMaior}>Pix</Text>
                                    <Text style={styles.rotuloMenor}>Pagamento Instantâneo</Text>
                                    
                                </View>
                            </Pressable>
                        </View>
                        <View style={styles.option}>
                            <Pressable style={({pressed})=>[styles.nPress, pressed && styles.yPress]} onPress={()=>{
                                        setStateDois('Credito')
                                        }}>
                                <View style={styles.align}>
                                    <View style={stateDois == 'Credito'? styles.selected : styles.unselected}/>
                                </View>
                                <View style={styles.align}>
                                    <Text style={styles.rotuloMaior}>Cartão de Crédito</Text>
                                    <Text style={styles.rotuloMenor}>Em até 12x</Text>
                                    
                                </View>
                            </Pressable>
                        </View>
                        <View style={styles.option}>
                            <Pressable style={({pressed})=>[styles.nPress, pressed && styles.yPress]} onPress={()=>{
                                        setStateDois('Debito')
                                        }}>
                                <View style={styles.align}>
                                    <View style={stateDois == 'Debito'? styles.selected : styles.unselected}/>
                                </View>
                                <View style={styles.align}>
                                    <Text style={styles.rotuloMaior}>Cartão de Débito</Text>
                                    <Text style={styles.rotuloMenor}></Text>
                                    
                                </View>
                            </Pressable>
                        </View>
                        <View style={styles.skip}>
                            <Pressable style={({pressed})=>[styles.nPress, pressed && styles.yPress]} onPress={()=>{
                                        setStateDois('Dinheiro')
                                        }}>
                                <View style={styles.align}>
                                    <View style={stateDois == 'Dinheiro'? styles.selected : styles.unselected}/>
                                </View>
                                <View style={styles.align}>
                                    <Text style={styles.rotuloMaior}>Dinheiro</Text>
                                    <Text style={styles.rotuloMenor}></Text>
                                    
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.footer}>
                <View style={styles.resumo}>
                    <Text style={styles.textoForte}>Resumo do pedido</Text>
                    <View>
                        <View style={styles.dados}>
                            <Text>{QuantidadeTotal} itens</Text>
                            <span/>
                            <Text>valor</Text>
                        </View>
                        <View style={styles.dados}>
                            <Text>Entrega</Text>
                            <span/>
                            <Text>Tipo entrega</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.areaBotao}>
                    <Pressable style={({pressed})=>[styles.botao, pressed && styles.yPress]}>
                        <Text style={styles.botaoText}>Finalizar</Text>
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
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
        voltar: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
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
                nPress: {flex: 1, flexDirection: 'row', justifyContent: 'flex-start'},
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
                borderRadius: 25,
                padding: 10
            },
            botaoText: {
                color: '#fff',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: 20,
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
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'left'
    },
    textoForte: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    escuro:{color:'#000'}, claro:{color:'#fff'},
    unselected: {
        backgroundColor: '#ffffff',
        borderColor: '#3E8050',
        borderWidth: 2,
        borderRadius: 100,
        marginLeft: 10,
        marginRight: 25,
        width: 30,
        height: 30
    },
    selected: {
        backgroundColor: '#3E8050',
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
        alignItems: 'flex-start'
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