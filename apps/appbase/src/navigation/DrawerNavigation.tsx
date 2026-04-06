import { createDrawerNavigator } from '@react-navigation/drawer';
import { config } from '../config';
import DynamicScreen from '../screens/DynamicScreen';
import { NavigationContainer } from '@react-navigation/native';
import NavigationEnabledScreen from '../screens/NavigationEnabledScreen';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { getIcon, iconSet } from './BottomTabNavigation';
import { Text, TouchableOpacity } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const Drawer = createDrawerNavigator();

export const DrawerNavigation = () => {

    return (
        <NavigationContainer>
            <Drawer.Navigator screenOptions={({ route, navigation }) => ({
                drawerIcon: ({ focused }) => {
                    const icon = getIcon(route.name);
                    return iconSet[icon as keyof typeof iconSet](focused ? config.primaryColor : "black");
                },
                drawerActiveTintColor: config.primaryColor,
                drawerLabel: ({ focused }) => {
                    return <Text style={{ color: focused ? config.primaryColor : "black" }}>{route.name}</Text>;
                },
                headerLeft: () => {
                    return <TouchableOpacity onPress={() => navigation.toggleDrawer()}><FontAwesome style={{ marginHorizontal: 16 }} name="bars" size={18} />
                    </TouchableOpacity>
                }
            })}>
                {config.navigationConfig.navigations.map((nav) => (
                    <Drawer.Screen name={nav.label} component={() => <NavigationEnabledScreen url={nav.url} />} />
                ))}
            </Drawer.Navigator>
        </NavigationContainer >
    );
}

