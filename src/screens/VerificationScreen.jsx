import {
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
    Alert,
    TouchableOpacity
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Colors, Fonts } from '../contants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Display } from '../utils';
import { Separator } from '../components';
import axiosClient from '../apis/axiosClient';
import LottieView from 'lottie-react-native';
import { Images } from '../contants';

const VerificationScreen = ({
    navigation,
    route: {
        params: { email, username }
    }
}) => {
    const [otp, setOtp] = useState({ 1: '', 2: '', 3: '', 4: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const firstInput = useRef();
    const secondInput = useRef();
    const thirdInput = useRef();
    const fourthInput = useRef();

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };
    const handleVerifyOTP = async () => {
        const otpCode = otp[1] + otp[2] + otp[3] + otp[4];

        console.log('OTP Code:', otpCode);
        console.log('Email:', email);

        if (otpCode.length !== 4) {
            Alert.alert('Error', 'Please enter 4-digit code');
            return;
        }

        try {
            setIsLoading(true);

            const response = await axiosClient.post('auth/verify-otp', {
                email: email,
                otp: otpCode
            });

            console.log('Verification response:', response); // Bây giờ response = res.data

            // Vì interceptor return res.data, nên response chính là data
            if (response && response.success) {
                // Thay vì response.data.success
                console.log('Verification successful - showing alert');
                Alert.alert(
                    'Verification Successful!',
                    'Your email has been verified. Redirecting to login...',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Signin')
                        }
                    ]
                );

                setTimeout(() => {
                    console.log('Auto navigation timeout');
                    navigation.navigate('Signin');
                }, 2000);
            } else {
                console.log('Response not successful:', response);
                Alert.alert(
                    'Error',
                    response?.message ||
                        'Verification failed. Please try again.'
                );
            }
        } catch (error) {
            console.log('Verification error:', error);
            Alert.alert('Verification Failed', error?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) {
            Alert.alert(
                'Please wait',
                `Resend available in ${formatTime(countdown)}`
            );
            return;
        }
        try {
            setIsLoading(true);
            const response = await axiosClient.post('auth/resend-otp', {
                email: email
            });

            console.log('Resend OTP response:', response.data);

            if (response && response.data && response.data.success) {
                Alert.alert(
                    'Success',
                    response.data.message ||
                        'New OTP has been sent to your email'
                );

                setCountdown(60);
                setCanResend(false);
                setOtp({ 1: '', 2: '', 3: '', 4: '' });
                firstInput.current.focus();
            } else {
                Alert.alert(
                    'Error',
                    response.data?.message || 'Failed to resend OTP'
                );
            }
        } catch (error) {
            console.log('Resend OTP error:', error);
            Alert.alert(
                'Error',
                error?.response?.data?.message || 'Failed to resend OTP'
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
                <Text style={styles.headerTitle}>OTP Verification</Text>
            </View>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.content}>
                Enter the 4-digit code sent to{' '}
                <Text style={styles.phoneNumberText}>{email}</Text>
            </Text>

            <View style={styles.otpContainer}>
                <View style={styles.otpBox}>
                    <TextInput
                        style={styles.otpText}
                        keyboardType='number-pad'
                        maxLength={1}
                        ref={firstInput}
                        value={otp[1]}
                        onChangeText={(text) => {
                            setOtp({ ...otp, 1: text });
                            text && secondInput.current.focus();
                        }}
                    />
                </View>
                <View style={styles.otpBox}>
                    <TextInput
                        style={styles.otpText}
                        keyboardType='number-pad'
                        maxLength={1}
                        ref={secondInput}
                        value={otp[2]}
                        onChangeText={(text) => {
                            setOtp({ ...otp, 2: text });
                            text
                                ? thirdInput.current.focus()
                                : firstInput.current.focus();
                        }}
                    />
                </View>
                <View style={styles.otpBox}>
                    <TextInput
                        style={styles.otpText}
                        keyboardType='number-pad'
                        maxLength={1}
                        ref={thirdInput}
                        value={otp[3]}
                        onChangeText={(text) => {
                            setOtp({ ...otp, 3: text });
                            text
                                ? fourthInput.current.focus()
                                : secondInput.current.focus();
                        }}
                    />
                </View>
                <View style={styles.otpBox}>
                    <TextInput
                        style={styles.otpText}
                        keyboardType='number-pad'
                        maxLength={1}
                        ref={fourthInput}
                        value={otp[4]}
                        onChangeText={(text) => {
                            setOtp({ ...otp, 4: text });
                            !text && thirdInput.current.focus();
                        }}
                    />
                </View>
            </View>
            {/* Countdown Timer */}
            <View style={styles.timerContainer}>
                <Text
                    style={[
                        styles.timerText,
                        {
                            color: canResend
                                ? Colors.DEFAULT_GREEN
                                : Colors.DEFAULT_GREY
                        }
                    ]}
                >
                    {canResend
                        ? 'You can resend OTP now'
                        : `Resend OTP in ${formatTime(countdown)}`}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.signinButton, isLoading && { opacity: 0.7 }]}
                onPress={handleVerifyOTP}
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
                    <Text style={styles.signinButtonText}>Verify</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.resendButton,
                    !canResend && styles.resendButtonDisabled
                ]}
                onPress={handleResendOTP}
                disabled={!canResend}
            >
                <Text
                    style={[
                        styles.resendText,
                        !canResend && styles.resendTextDisabled
                    ]}
                >
                    Resend OTP
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default VerificationScreen;

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
    phoneNumberText: {
        fontSize: 18,
        fontFamily: Fonts.POPPINS_REGULAR,
        lineHeight: 18 * 1.4,
        color: Colors.DEFAULT_YELLOW
    },
    otpContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row'
    },
    otpBox: {
        borderRadius: 5,
        borderColor: Colors.DEFAULT_GREEN,
        borderWidth: 1
    },
    otpText: {
        fontSize: 25,
        color: Colors.DEFAULT_BLACK,
        padding: 0,
        textAlign: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 20
    },
    timerText: {
        fontSize: 14,
        color: Colors.DEFAULT_GREY,
        fontFamily: Fonts.POPPINS_MEDIUM
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
    resendButton: {
        marginTop: 20,
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    resendButtonDisabled: {
        opacity: 0.5
    },
    resendText: {
        fontSize: 16,
        color: Colors.DEFAULT_GREEN,
        fontFamily: Fonts.POPPINS_MEDIUM,
        textDecorationLine: 'underline'
    },
    resendTextDisabled: {
        color: Colors.DEFAULT_GREY,
        textDecorationLine: 'none'
    }
});
