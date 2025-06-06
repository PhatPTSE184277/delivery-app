import {
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import React, { useState } from 'react';
import { Colors, Fonts } from '../contants';
import General from '../contants/General';
import WelcomeCard from '../components/WelcomeCard';
import { Display } from '../utils';
import { Separator } from '../components';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setFirstTimeUse } from '../reduxs/reducers/authReducer'; //

const pageStyle = (isActive) =>
    isActive
        ? styles.page
        : { ...styles.page, backgroundColor: Colors.DEFAULT_GREY };

const Pagination = ({ index }) => {
    return (
        <View style={styles.pageContainer}>
            {[...Array(General.WELCOME_CONTENTS.length).keys()].map((_, i) =>
                i === index ? (
                    <View style={pageStyle(true)} key={i} />
                ) : (
                    <View style={pageStyle(false)} key={i} />
                )
            )}
        </View>
    );
};

const WelcomeScreen = ({navigation}) => {
    const [welcomeListIndex, setWelcomeListIndex] = useState(0);
    const welcomeList = useRef();
    const onViewRef = useRef(({ changed }) => {
        setWelcomeListIndex(changed[0].index);
    });
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const pageScroll = () => {
        welcomeList.current.scrollToIndex({
            index:
                welcomeListIndex < 2 ? welcomeListIndex + 1 : welcomeListIndex
        });
    };

    const dispatch = useDispatch();

      const navigate = () => {
        dispatch(setFirstTimeUse(false));
        navigation.navigate('Signin');
    }

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle='dark-content'
                backgroundColor={Colors.DEFAULT_WHITE}
                translucent
            />
            <Separator height={StatusBar.currentHeight} />
            <Separator height={Display.setHeight(8)} />
            <View style={styles.welcomeListContainer}>
                <FlatList
                    ref={welcomeList}
                    data={General.WELCOME_CONTENTS}
                    keyExtractor={(item) => item.title}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    viewabilityConfig={viewConfigRef.current}
                    onViewableItemsChanged={onViewRef.current}
                    overScrollMode='never'
                    renderItem={({ item }) => <WelcomeCard {...item} />}
                />
            </View>
            <Separator height={Display.setHeight(8)} />
            <Pagination index={welcomeListIndex} />
            <Separator height={Display.setHeight(8)} />
            {welcomeListIndex === 2 ? (
                <TouchableOpacity style={styles.gettingStartedButton} activeOpacity={0.8}>
                    <Text style={styles.gettingStartedButtonText} onPress={() => navigate()}>
                        Get Started
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={{ marginLeft: 10 }}
                        onPress={() => welcomeList.current.scrollToEnd()}
                    >
                        <Text style={styles.buttonText}>SKIP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.8}
                        onPress={() => pageScroll()}
                    >
                        <Text style={styles.buttonText}>NEXT</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Colors.DEFAULT_WHITE
    },
    welcomeListContainer: {
        height: Display.setHeight(60)
    },
    pageContainer: {
        flexDirection: 'row'
    },
    page: {
        height: 8,
        width: 15,
        backgroundColor: Colors.DEFAULT_GREEN,
        borderRadius: 32,
        marginHorizontal: 5
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: Display.setWidth(90),
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_BOLD,
        lineHeight: 16 * 1.4
    },
    button: {
        backgroundColor: Colors.LIGHT_GREEN,
        paddingVertical: 20,
        paddingHorizontal: 11,
        borderRadius: 32
    },
    gettingStartedButton: {
        backgroundColor: Colors.DEFAULT_GREEN,
        paddingVertical: 5,
        paddingHorizontal: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2
    },
    gettingStartedButtonText: {
        fontSize: 20,
        color: Colors.DEFAULT_WHITE,
        lineHeight: 20 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM
    }
});
