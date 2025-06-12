import {
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
    Alert
} from 'react-native';
import { useState } from 'react';
import { Separator, ToggleButton } from '../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { TouchableOpacity } from 'react-native';
import { Colors, Fonts, Images } from '../contants';
import { Display } from '../utils';
import axiosClient from '../apis/axiosClient';
import LottieView from 'lottie-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addAuth, setFirstTimeUse } from '../reduxs/reducers/authReducer';

const SignInScreen = ({ navigation }) => {
    const [isPasswordShow, setIsPasswordShow] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const dispatch = useDispatch();

    const handleLogin = async () => {
        if (!username || !password) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        let user = {
            username,
            password
        };
        
        try {
            setIsLoading(true);
            setErrorMessage('');
            const response = await axiosClient.post('auth/login', user);
            
            if (response && response.data) {
                const authData = {
                    token: response.data.token,
                    username: response.data.username,
                    email: response.data.email,
                    _id: response.data._id || '',
                    isFirstTimeUse: false
                };
                dispatch(setFirstTimeUse(false));
                dispatch(addAuth(authData));
                Alert.alert('Login Successful', response.message);
            }        } catch (error) {
            console.log('Login error:', error);
            
            // Xử lý trường hợp email chưa verify theo format axiosClient
            if (error?.message === 'Please verify your email before logging in') {
                Alert.alert(
                    'Email Not Verified',
                    'Please verify your email before logging in. Would you like to go to verification screen?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel'
                        },                        {
                            text: 'Verify Email',
                            onPress: async () => {                                try {
                                    console.log('Looking up user:', username);
                                    // Tìm user để lấy email
                                    const userResponse = await axiosClient.get(`user/lookup/${username}`);
                                    console.log('User lookup response:', userResponse);
                                    
                                    const userEmail = userResponse.data?.email;
                                    const userUsername = userResponse.data?.username || username;
                                    
                                    if (userEmail) {
                                        console.log('Navigating to verification with email:', userEmail);
                                        navigation.navigate('Verification', { 
                                            email: userEmail,
                                            username: userUsername 
                                        });
                                    } else {
                                        Alert.alert('Error', 'Could not find email for this user');
                                    }                                } catch (err) {
                                    console.log('User lookup error:', err);
                                    // Nếu không tìm được user, try với register API để lấy thông tin
                                    Alert.alert(
                                        'User Lookup Failed', 
                                        'Could not find user information. Please enter your email address to verify.',
                                        [
                                            {
                                                text: 'Cancel',
                                                style: 'cancel'
                                            },
                                            {
                                                text: 'Enter Email',
                                                onPress: () => {
                                                    // Navigate với prompt user nhập email
                                                    Alert.prompt(
                                                        'Enter Email',
                                                        'Please enter the email address for this account:',
                                                        (email) => {
                                                            if (email && email.includes('@')) {
                                                                navigation.navigate('Verification', { 
                                                                    email: email,
                                                                    username: username 
                                                                });
                                                            } else {
                                                                Alert.alert('Error', 'Please enter a valid email address');
                                                            }
                                                        },
                                                        'plain-text'
                                                    );
                                                }
                                            }
                                        ]
                                    );
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Login Failed',
                    error?.message || 'Invalid username or password'
                );
            }
        } finally {
            setIsLoading(false);
        }    };

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
            <Text style={styles.headerTitle}>Sign In</Text>
        </View>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.content}>
            Enter your username and password, and enjoy ordering food
        </Text>
        
        {/* CHỈ GIỮ LẠI 1 USERNAME INPUT */}
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
                    onChangeText={(text) => {
                        setUsername(text);
                        setErrorMessage('');
                    }}
                    value={username}
                />
            </View>
        </View>
        <Separator height={15} />
        
        {/* PASSWORD INPUT */}
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
                    onChangeText={(text) => {
                        setPassword(text);
                        setErrorMessage('');
                    }}
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

        {/* ERROR MESSAGE */}
        {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : (
            <Separator height={15} />
        )}

        <View style={styles.forgotPasswordContainer}>
            <View style={styles.toggleContainer}>
                <ToggleButton size={0.5} />
                <Text style={styles.rememberMeText}>Remember me</Text>
            </View>
            <Text
                style={styles.forgotPasswordText}
                onPress={() => navigation.navigate('ForgotPassword')}
            >
                Forgot Password
            </Text>
        </View>
        
        <TouchableOpacity
            style={[styles.signinButton, isLoading && { opacity: 0.7 }]}
            onPress={() => handleLogin()}
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
                <Text style={styles.signinButtonText}>Sign In</Text>
            )}
        </TouchableOpacity>
            <View style={styles.signupContainer}>
                <Text style={styles.accountText}>Don't have an account?</Text>
                <Text
                    style={styles.signupText}
                    onPress={() => navigation.navigate('Signup')}
                >
                    Sign Up
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

export default SignInScreen;

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
    forgotPasswordContainer: {
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    rememberMeText: {
        marginLeft: 10,
        fontSize: 12,
        lineHeight: 12 * 1.4,
        color: Colors.DEFAULT_GREY,
        fontFamily: Fonts.POPPINS_MEDIUM
    },
    forgotPasswordText: {
        fontSize: 12,
        lineHeight: 12 * 1.4,
        color: Colors.DEFAULT_GREEN,
        fontFamily: Fonts.POPPINS_BOLD
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
    signupContainer: {
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
    signupText: {
        fontSize: 13,
        lineHeight: 13 * 1.4,
        color: Colors.DEFAULT_GREEN,
        fontFamily: Fonts.POPPINS_MEDIUM,
        marginLeft: 5
    },
    orText: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        color: Colors.DEFAULT_BLACK,
        fontFamily: Fonts.POPPINS_MEDIUM,
        marginLeft: 5,
        alignSelf: 'center'
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
    errorMessage: {
        fontSize: 10,
        lineHeight: 10 * 1.4,
        color: Colors.DEFAULT_RED,
        fontFamily: Fonts.POPPINS_MEDIUM,
        marginHorizontal: 20,
        marginTop: 3,
        marginBottom: 10
    }
});