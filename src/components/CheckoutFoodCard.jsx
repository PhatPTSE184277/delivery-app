import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ApiContants, Colors, Fonts } from '../contants';
import { StaticImageService } from '../services';
import { Display } from '../utils';

const CheckoutFoodCard = ({ id, name, description, price, image, quantity, navigate }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigate()} activeOpacity={0.8}>
                <Image
                    style={styles.image}
                    source={{
                        uri: StaticImageService.getGalleryImage(
                            image,
                            ApiContants.STATIC_IMAGE.SIZE.SQUARE
                        )
                    }}
                />
            </TouchableOpacity>
            <View style={styles.detailsContainer}>
                <TouchableOpacity
                    onPress={() => navigate()}
                    activeOpacity={0.8}
                >
                    <Text numberOfLines={1} style={styles.titleText}>
                        {name}
                    </Text>
                    <Text numberOfLines={2} style={styles.descriptionText}>
                        {description}
                    </Text>
                </TouchableOpacity>
                <View style={styles.footerContainer}>
                    <Text style={styles.priceText}>$ {price}</Text>
                    <View style={styles.quantityDisplayContainer}>
                        <Text style={styles.quantityText}>{quantity}</Text>
                    </View>
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
        backgroundColor: Colors.LIGHT_GREY
    },
    image: {
        height: 100,
        width: 100,
        margin: 6,
        borderRadius: 8
    },
    detailsContainer: {
        marginHorizontal: 5
    },
    titleText: {
        width: Display.setWidth(60),
        color: Colors.DEFAULT_BLACK,
        fontFamily: Fonts.POPPINS_BOLD,
        fontSize: 13,
        lineHeight: 13 * 1.4,
        marginBottom: 8
    },
    descriptionText: {
        width: Display.setWidth(60),
        color: Colors.DEFAULT_GREY,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        fontSize: 10,
        lineHeight: 10 * 1.4,
        marginBottom: 8
    },
    priceText: {
        color: Colors.DEFAULT_YELLOW,
        fontFamily: Fonts.POPPINS_BOLD,
        fontSize: 14,
        lineHeight: 14 * 1.4
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 5
    },
    quantityDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.LIGHT_GREY2,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        minWidth: 40,
        justifyContent: 'center'
    },
    quantityText: {
        color: Colors.DEFAULT_BLACK,
        fontFamily: Fonts.POPPINS_MEDIUM,
        fontSize: 14,
        lineHeight: 14 * 1.4
    }
});

export default CheckoutFoodCard;