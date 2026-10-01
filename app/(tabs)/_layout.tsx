import { SymbolView } from 'expo-symbols';
import { Ionicons } from "@expo/vector-icons";
import { Tabs, Link } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import InputBusca from "../components/inputBusca";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "left",
        headerTitle: (props) => (
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitleText}>{props.children}</Text>
            <View>
              <Link href="/(tabs)/rotas/pagamento/pagamento" style={styles.test}>
                <SymbolView
                name={{ ios: 'info.circle', android: 'info', web: 'info' }}
                size={25}
                />
                ...
              </Link>
            </View>
          </View>
          
        ),
        headerStyle: {
          backgroundColor: "#358B40",
          height: Platform.OS === "ios" ? 100 : 75,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "rgb(37, 6, 6)",
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#358B40",
          borderTopWidth: 1,
          borderTopColor: "#000000",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 30 : 80,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "integrador",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "link" : "eye"}
              size={24}
              color={color}
            />
          ),
        }}
        
        />

      {/* Rota de Busca dentro das abas (oculta do menu inferior com href: null) */}
      <Tabs.Screen
        name="rotas/busca/[query]"
        options={{
          title: "Busca",
          href: null,
        }}
      />

      {/* Rota de Produtos dentro das abas (oculta do menu inferior com href: null) */}
      <Tabs.Screen
        name="rotas/produtos/[id]"
        options={{
          title: "Produto",
          href: null,
        }}
      />

      <Tabs.Screen
        name="rotas/pagamento/pagamento"
        options={{
          title: "Pagamento",
          href: null,
        }}
      />
    </Tabs>

    
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingRight: 16,
    gap: 12,
  },
  headerTitleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  inputContainer: {
    flex: 1,
  },
  test: {
    backgroundColor: "#ffffff"
  },
});