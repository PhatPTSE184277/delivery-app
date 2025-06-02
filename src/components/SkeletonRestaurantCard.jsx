import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../contants';
import { useEffect, useRef } from 'react';

const SkeletonRestaurantCard = () => {
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
                    styles.posterStyle, 
                    { opacity: fadeAnim }
                ]} 
            />
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
            <View style={styles.footerContainer}>
                <Animated.View 
                    style={[
                        styles.ratingBox,
                        { opacity: fadeAnim }
                    ]}
                />
                <View style={styles.rowAndCenter}>
                    <Animated.View 
                        style={[
                            styles.timeAndDistanceContainer,
                            { opacity: fadeAnim }
                        ]}
                    />
                    <Animated.View 
                        style={[
                            styles.timeAndDistanceContainer,
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
        width: 280,
        justifyContent: 'center',
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 10,
        elevation: 3,
        marginBottom: 5
    },
    posterStyle: {
        width: 1920 * 0.15,
        height: 1080 * 0.15,
        borderRadius: 10,
        margin: 5,
        backgroundColor: Colors.LIGHT_GREY
    },
    titleBar: {
        marginLeft: 8,
        height: 15,
        width: '70%',
        backgroundColor: Colors.LIGHT_GREY,
        borderRadius: 4,
        marginBottom: 8
    },
    tagBar: {
        marginLeft: 8,
        height: 11,
        width: '80%',
       backgroundColor: Colors.LIGHT_GREY,
        borderRadius: 4,
        marginBottom: 8
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginBottom: 6,
        justifyContent: 'space-between'
    },
    rowAndCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    timeAndDistanceContainer: {
        width: 60,
        height: 20,
        backgroundColor: Colors.LIGHT_GREY,
        borderRadius: 12,
        marginHorizontal: 3
    },
    ratingBox: {
        width: 40,
        height: 20,
        backgroundColor: Colors.LIGHT_GREY,
        borderRadius: 4
    }
});

export default SkeletonRestaurantCard;