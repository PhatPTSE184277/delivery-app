import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
    SplashScreen,
    WelcomeScreen,
    SignInScreen,
    SignupScreen,
    ForgotPasswordScreen,
    RegisterPhoneScreen,
    VerificationScreen,
    RestaurantScreen,
    FoodScreen,
    CheckoutScreen,
    AddressListScreen,
    OrderHistoryScreen,
    RecommendationScreen
} from '../screens';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import {
    removeAuth,
    authSelector,
    addAuth
} from '../reduxs/reducers/authReducer';
import {
    loadCartFromStorage,
    setCartItems
} from '../reduxs/reducers/cartReducer';
import axiosClient from '../apis/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeTabs from './BottomTabs';

const Stack = createStackNavigator();

const Navigators = () => {
    const authData = useSelector(authSelector);
    const dispatch = useDispatch();
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(true);
    const [isFirstTimeUse, setIsFirstTimeUse] = useState(true);

    const appStart = async () => {
        try {
            const isFirstTime = await checkFirstTimeUse();
            setIsFirstTimeUse(isFirstTime);

            const authDataFromStorage = await AsyncStorage.getItem('Auth_Data');
            if (authDataFromStorage) {
                const parsedData = JSON.parse(authDataFromStorage);
                if (parsedData && parsedData.token) {
                    dispatch(addAuth(parsedData));
                    await checkTokenValidity(parsedData.token);
                }
            }

            const savedCart = await loadCartFromStorage();
            if (savedCart) {
                dispatch(setCartItems(savedCart));
            }
        } catch (error) {
            console.log('Error during app start:', error);
        } finally {
            setIsAppLoading(false);
        }
    };

    const checkFirstTimeUse = async () => {
        try {
            const authData = await AsyncStorage.getItem('Auth_Data');
            if (authData) {
                const parsedData = JSON.parse(authData);
                return parsedData.isFirstTimeUse === true;
            }
            return true;
        } catch (error) {
            console.error('Error checking first time use:', error);
            return true;
        }
    };

    const checkTokenValidity = async (tokenToCheck) => {
        const token = tokenToCheck || authData.token;

        if (!token || token === null || token === '') {
            console.log('No token available for validation');
            setIsTokenValid(false);
            return;
        }

        try {
            console.log('Validating token:', token.substring(0, 15) + '...');
            const response = await axiosClient.get('auth/validate-token');
            console.log('Token validation successful');
            setIsTokenValid(true);
        } catch (error) {
            console.log(
                'Token validation error:',
                error.response?.data || error.message
            );
            handleLogout();
            setIsTokenValid(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('Auth_Data');
            dispatch(removeAuth());
            setIsTokenValid(false);
        } catch (error) {
            console.log('Error logout:', error);
        }
    };

    useEffect(() => {
        appStart();
    }, []);

    useEffect(() => {
        if (authData && authData.token) {
            console.log('Auth state updated, token available');
            console.log(authData.token);
            checkTokenValidity(authData.token);
        } else {
            console.log('Auth state updated, no token');
        }
    }, [authData]);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAppLoading ? (
                    <Stack.Screen name='Splash' component={SplashScreen} />
                ) : !authData.token || !isTokenValid ? (
                    <>
                        {isFirstTimeUse && (
                            <Stack.Screen
                                name='Welcome'
                                component={WelcomeScreen}
                            />
                        )}

                        <Stack.Screen name='Signin' component={SignInScreen} />
                        <Stack.Screen name='Signup' component={SignupScreen} />
                        <Stack.Screen
                            name='ForgotPassword'
                            component={ForgotPasswordScreen}
                        />
                        <Stack.Screen
                            name='RegisterPhone'
                            component={RegisterPhoneScreen}
                        />
                        <Stack.Screen
                            name='Verification'
                            component={VerificationScreen}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen name='HomeTabs' component={HomeTabs} />
                        <Stack.Screen
                            name='Restaurant'
                            component={RestaurantScreen}
                        />
                        <Stack.Screen name='Food' component={FoodScreen} />
                        <Stack.Screen
                            name='Checkout'
                            component={CheckoutScreen}
                        />
                        <Stack.Screen
                            name='AddressListScreen'
                            component={AddressListScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name='OrderHistory'
                            component={OrderHistoryScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name='Recommendation'
                            component={RecommendationScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigators;