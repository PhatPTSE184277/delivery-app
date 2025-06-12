import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AccountScreen, CartScreen, HomeScreen, MapScreen } from '../screens';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../contants';
import { Display } from '../utils';

const BottomTabs = createBottomTabNavigator();

export default () => {
    return (
        <BottomTabs.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    height: Display.setHeight(8),
                    backgroundColor: Colors.DEFAULT_WHITE,
                    borderTopWidth: 0
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: Colors.DEFAULT_GREEN,
                tabBarInactiveTintColor: Colors.INACTIVE_GREY
            }}
        >
            <BottomTabs.Screen
                name='Home'
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons name='home-outline' size={23} color={color} />
                    )
                }}
            />
             <BottomTabs.Screen
                name='Map'
                component={MapScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons name='compass-outline' size={23} color={color} />
                    )
                }}
            />
            <BottomTabs.Screen
                name='Cart'
                component={CartScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons name='cart-outline' size={23} color={color} />
                    )
                }}
            />
              <BottomTabs.Screen
                name='Account'
                component={AccountScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons name='person-outline' size={23} color={color} />
                    )
                }}
            />
        </BottomTabs.Navigator>
    );
};
