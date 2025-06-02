import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../contants';
import { Display } from '../utils';

const SkeletonFoodCard = () => {
    const fadeAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [fadeAnim]);

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.image,
                    { opacity: fadeAnim }
                ]} 
            />
            <View style={styles.detailsContainer}>
                <Animated.View 
                    style={[
                        styles.titleText,
                        { opacity: fadeAnim }
                    ]}
                />
                <Animated.View 
                    style={[
                        styles.descriptionLine,
                        { opacity: fadeAnim }
                    ]}
                />
                <Animated.View 
                    style={[
                        styles.descriptionLine,
                        { width: '70%', opacity: fadeAnim }
                    ]}
                />
                <View style={styles.footerContainer}>
                    <Animated.View 
                        style={[
                            styles.priceText,
                            { opacity: fadeAnim }
                        ]}
                    />
                    <Animated.View 
                        style={[
                            styles.addButton,
                            { opacity: fadeAnim }
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        marginVertical: 5,
        alignItems: 'center',
        borderRadius: 10,
        elevation: 2,
        backgroundColor: Colors.LIGHT_GREY,
        padding: 6
    },
    image: {
        height: 100,
        width: 100,
        borderRadius: 8,
        backgroundColor: Colors.LIGHT_GREY2
    },
    detailsContainer: {
        marginHorizontal: 10,
        flex: 1
    },
    titleText: {
        width: '80%',
        height: 15,
        backgroundColor: Colors.LIGHT_GREY2,
        borderRadius: 4,
        marginBottom: 10
    },
    descriptionLine: {
        width: '100%',
        height: 10,
        backgroundColor: Colors.LIGHT_GREY2,
        borderRadius: 4,
        marginBottom: 8
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5
    },
    priceText: {
        width: 50,
        height: 18,
        backgroundColor: Colors.LIGHT_GREY2,
        borderRadius: 4
    },
    addButton: {
        width: 70,
        height: 30,
        backgroundColor: Colors.LIGHT_GREY2,
        borderRadius: 8
    }
});

export default SkeletonFoodCard;