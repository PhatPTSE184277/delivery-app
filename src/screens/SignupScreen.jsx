import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
    Alert
} from 'react-native';
import React, { useState } from 'react';
import { Colors, Fonts, Images } from '../contants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { Display } from '../utils';
import { Separator } from '../components';
import { TouchableOpacity } from 'react-native';
import axiosClient from '../apis/axiosClient';
import LottieView from 'lottie-react-native';
import { useDispatch } from 'react-redux';
import { setFirstTimeUse } from '../reduxs/reducers/authReducer';

const SignupScreen = ({ navigation }) => {
    const [isPasswordShow, setIsPasswordShow] = useState(false);
    const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const handleRegister = async () => {
        // Validation
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        let user = {
            username,
            email,
            password
        };

        try {
            setIsLoading(true);
            const response = await axiosClient.post('auth/register', user);

            if (response && response.message) {
                Alert.alert(
                    'Registration Successful!',
                    'Please check your email for verification code.',
                    [
                        {
                            text: 'OK',
                            onPress: () =>
                                navigation.navigate('Verification', {
                                    email: email,
                                    username: username
                                })
                        }
                    ]
                );
            }
        } catch (error) {
            console.log('Registration error:', error);
            Alert.alert(
                'Registration Failed',
                error?.response?.data?.message ||
                    error?.message ||
                    'Something went wrong'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle='dark-content'
                backgroundColor={Colors.DEFAULT_WHITE}
                translucent
            />
            <Separator height={StatusBar.currentHeight} />
            <View style={styles.headerContainer}>
                <Ionicons
                    name='chevron-back-outline'
                    size={30}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.headerTitle}>Sign Up</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.content}>
                Enter your email, choose a username and password
            </Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
                <View style={styles.inputSubContainer}>
                    <Feather
                        name='user'
                        size={22}
                        color={Colors.DEFAULT_GREY}
                        style={{ marginRight: 10 }}
                    />
                    <TextInput
                        placeholder='Username'
                        placeholderTextColor={Colors.DEFAULT_GREY}
                        selectionColor={Colors.DEFAULT_GREY}
                        style={styles.inputText}
                        onChangeText={(text) => setUsername(text)}
                        value={username}
                    />
                </View>
            </View>
            <Separator height={15} />

            {/* Email Input */}
            <View style={styles.inputContainer}>
                <View style={styles.inputSubContainer}>
                    <Feather
                        name='mail'
                        size={22}
                        color={Colors.DEFAULT_GREY}
                        style={{ marginRight: 10 }}
                    />
                    <TextInput
                        placeholder='Email'
                        placeholderTextColor={Colors.DEFAULT_GREY}
                        selectionColor={Colors.DEFAULT_GREY}
                        style={styles.inputText}
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        keyboardType='email-address'
                        autoCapitalize='none'
                    />
                </View>
            </View>
            <Separator height={15} />

            {/* Password Input */}
            <View style={styles.inputContainer}>
                <View style={styles.inputSubContainer}>
                    <Feather
                        name='lock'
                        size={22}
                        color={Colors.DEFAULT_GREY}
                        style={{ marginRight: 10 }}
                    />
                    <TextInput
                        secureTextEntry={isPasswordShow ? false : true}
                        placeholder='Password'
                        placeholderTextColor={Colors.DEFAULT_GREY}
                        selectionColor={Colors.DEFAULT_GREY}
                        style={styles.inputText}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                    />
                    <Feather
                        name={isPasswordShow ? 'eye-off' : 'eye'}
                        size={22}
                        color={Colors.DEFAULT_GREY}
                        style={{ marginRight: 10 }}
                        onPress={() => setIsPasswordShow(!isPasswordShow)}
                    />
                </View>
            </View>
            <Separator height={15} />

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
                <View style={styles.inputSubContainer}>
                    <Feather
                        name='lock'
                        size={22}
                        color={Colors.DEFAULT_GREY}
                        style={{ marginRight: 10 }}
                    />
                    <TextInput
                        secureTextEntry={isConfirmPasswordShow ? false : true}
                        placeholder='Confirm Password'
                        placeholderTextColor={Colors.DEFAULT_GREY}
                        selectionColor={Colors.DEFAULT_GREY}
                        style={styles.inputText}
                        onChangeText={(text) => setConfirmPassword(text)}
                        value={confirmPassword}
                    />
                    <Feather
                        name={isConfirmPasswordShow ? 'eye-off' : 'eye'}
                        size={22}
                        color={Colors.DEFAULT_GREY}
                        style={{ marginRight: 10 }}
                        onPress={() =>
                            setIsConfirmPasswordShow(!isConfirmPasswordShow)
                        }
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.signinButton, isLoading && { opacity: 0.7 }]}
                onPress={() => handleRegister()}
                disabled={isLoading}
            >
                {isLoading ? (
                    <LottieView
                        source={Images.LOADING}
                        autoPlay
                        loop
                        style={{ width: 50, height: 50 }}
                    />
                ) : (
                    <Text style={styles.signinButtonText}>Create Account</Text>
                )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
                <Text style={styles.accountText}>Already have an account?</Text>
                <Text
                    style={styles.signinText}
                    onPress={() => navigation.navigate('Signin')}
                >
                    Sign In
                </Text>
            </View>

            <Text style={styles.orText}>OR</Text>
            <TouchableOpacity style={styles.facebookButton}>
                <View style={styles.socialButtonsContainer}>
                    <View style={styles.signinButtonLogoContainer}>
                        <Image
                            source={Images.FACEBOOK}
                            style={styles.signinButtonLogo}
                        />
                    </View>
                    <Text style={styles.socialSigninButtonText}>
                        Connect with Facebook
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.googleButton}>
                <View style={styles.socialButtonsContainer}>
                    <View style={styles.signinButtonLogoContainer}>
                        <Image
                            source={Images.GOOGLE}
                            style={styles.signinButtonLogo}
                        />
                    </View>
                    <Text style={styles.socialSigninButtonText}>
                        Connect with Google
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_MEDIUM,
        lineHeight: 20 * 1.4,
        width: Display.setWidth(80),
        textAlign: 'center'
    },
    title: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_MEDIUM,
        lineHeight: 20 * 1.4,
        marginTop: 50,
        marginBottom: 10,
        marginHorizontal: 20
    },
    content: {
        fontSize: 18,
        fontFamily: Fonts.POPPINS_LIGHT,
        marginTop: 10,
        marginBottom: 20,
        marginHorizontal: 20
    },
    inputContainer: {
        backgroundColor: Colors.LIGHT_GREY,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: Colors.LIGHT_GREY2,
        justifyContent: 'center'
    },
    inputSubContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    inputText: {
        fontSize: 18,
        textAlignVertical: 'center',
        padding: 0,
        height: Display.setHeight(6),
        color: Colors.DEFAULT_BLACK,
        flex: 1
    },
    signinButton: {
        backgroundColor: Colors.DEFAULT_GREEN,
        borderRadius: 8,
        marginHorizontal: 20,
        height: Display.setHeight(6),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    signinButtonText: {
        fontSize: 18,
        lineHeight: 18 * 1.4,
        color: Colors.DEFAULT_WHITE,
        fontFamily: Fonts.POPPINS_MEDIUM
    },
    orText: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        color: Colors.DEFAULT_BLACK,
        fontFamily: Fonts.POPPINS_MEDIUM,
        marginLeft: 5,
        alignSelf: 'center',
        marginTop: 20
    },
    facebookButton: {
        backgroundColor: Colors.FABEBOOK_BLUE,
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 8,
        marginVertical: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    googleButton: {
        backgroundColor: Colors.GOOGLE_BLUE,
        paddingVertical: 15,
        marginHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    signinButtonLogo: {
        height: 18,
        width: 18
    },
    signinButtonLogoContainer: {
        backgroundColor: Colors.DEFAULT_WHITE,
        padding: 2,
        borderRadius: 3,
        position: 'absolute',
        left: 25
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    socialSigninButtonText: {
        color: Colors.DEFAULT_WHITE,
        fontSize: 13,
        lineHeight: 13 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    signinContainer: {
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    accountText: {
        fontSize: 13,
        lineHeight: 13 * 1.4,
        color: Colors.DEFAULT_BLACK,
        fontFamily: Fonts.POPPINS_MEDIUM
    },
    signinText: {
        fontSize: 13,
        lineHeight: 13 * 1.4,
        color: Colors.DEFAULT_GREEN,
        fontFamily: Fonts.POPPINS_MEDIUM,
        marginLeft: 5
    }
});
