import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IntialScreen from "../screens/IntialScreen";
import DynamicScreen from "../screens/DynamicScreen";
import { createStaticNavigation } from "@react-navigation/native";

export type RootStackParamList = {
    '/': undefined;
    DynamicScreen: { url: string };
};

export const RootStack = createNativeStackNavigator<RootStackParamList>({
    screenOptions: {
        headerShown: false,
        animation: 'default',
    },
    screens: {
        '/': IntialScreen,
        DynamicScreen: DynamicScreen
    },
});

export const DefaultNavigation = createStaticNavigation(RootStack,);




