import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IntialScreen from '../screens/IntialScreen';
import { config } from '../config';
import NavigationEnabledScreen from '../screens/NavigationEnabledScreen';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createBottomTabNavigator();


export const iconSet = {
    home: (color: string) => <FontAwesome name="home" size={24} color={color} />,
    user: (color: string) => <FontAwesome name="user" size={24} color={color} />,
    settings: (color: string) => <FontAwesome name="cog" size={24} color={color} />,
    search: (color: string) => <FontAwesome name="search" size={24} color={color} />,
    notifications: (color: string) => <FontAwesome name="bell" size={24} color={color} />,
}

export const getIcon = (label: string) => config.navigationConfig.navigations.find((navigation) => navigation.label.toLowerCase() === label.toLowerCase())?.icon


export const BottomTabNavigation = () => {

    const { navigations } = config.navigationConfig;

    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={({ route }) => ({
                headerShown: config.navigationConfig.showAppbar,
                tabBarLabel: ({ focused }) => {
                    const icon = getIcon(route.name);
                    return <Text style={{ color: focused ? config.primaryColor : "black" }}>{route.name}</Text>;
                },
                tabBarActiveTintColor: config.primaryColor,

                tabBarIcon: ({ focused }) => {
                    const icon = getIcon(route.name);
                    return iconSet[icon as keyof typeof iconSet](focused ? config.primaryColor : "black");
                }
            })}>
                {
                    navigations.map((navigation) => (
                        <Tab.Screen name={navigation.label} component={() => <NavigationEnabledScreen url={navigation.url} />} />
                    ))
                }
            </Tab.Navigator>
        </NavigationContainer>
    );
}

