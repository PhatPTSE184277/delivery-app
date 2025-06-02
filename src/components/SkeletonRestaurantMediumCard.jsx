import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../contants';
import { useEffect, useRef } from 'react';

const SkeletonRestaurantMediumCard = () => {
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
                    styles.imageContainer, 
                    { opacity: fadeAnim }
                ]} 
            />
            <View style={styles.infoContainer}>
                <Animated.View 
                    style={[
                        styles.titleBar, 
                        { opacity: fadeAnim }
                    ]}
                />
                <Animated.View 
                    style={[
                        styles.tagBar,
                        { opacity: fadeAnim }
                    ]}
                />
                <View style={styles.rowContainer}>
                    <Animated.View 
                        style={[
                            styles.ratingBox,
                            { opacity: fadeAnim }
                        ]}
                    />
                    <Animated.View 
                        style={[
                            styles.timeBox,
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
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
        marginVertical: 5,
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 10,
        elevation: 3,
        padding: 10
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: Colors.LIGHT_GREY
    },
    infoContainer: {
        flex: 1,
        marginLeft: 10
    },
    titleBar: {
        height: 18,
        width: '80%',
        backgroundColor: Colors.LIGHT_GREY,
        borderRadius: 4,
        marginBottom: 10
    },
    tagBar: {
        height: 14,
        width: '90%',
        backgroundColor: Colors.LIGHT_GREY,
        borderRadius: 4,
        marginBottom: 10
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    ratingBox: {
        width: 60,
        height: 20,
        backgroundColor: Colors.LIGHT_GREY,
        borderRadius: 4
    },
    timeBox: {
        width: 80,
        height: 20,
        backgroundColor: Colors.LIGHT_GREY,
        borderRadius: 4
    }
});

export default SkeletonRestaurantMediumCard;