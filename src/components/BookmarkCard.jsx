import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Colors, Fonts } from '../contants';
import { StaticImageService } from '../services';
import { useDispatch, useSelector } from 'react-redux';
import {
    removeBookmark,
    removeBookmarkAsync
} from '../reduxs/reducers/bookmarkReducer';

const BookmarkCard = ({ id, name, image, address, tags, rating, navigate }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.authReducer.data);

    const handleRemoveBookmark = () => {
        dispatch(removeBookmark({ id }));

        if (currentUser?.username) {
            dispatch(
                removeBookmarkAsync({
                    restaurantId: id,
                    username: currentUser.username
                })
            );
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.removeIcon}
                onPress={handleRemoveBookmark}
            >
                <Ionicons
                    name='close-circle'
                    color={Colors.DEFAULT_GREY}
                    size={22}
                />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={() => navigate(id)}>
                <Image
                    source={{ uri: StaticImageService.getPoster(image) }}
                    style={styles.posterStyle}
                />
            </TouchableOpacity>

            <View style={styles.labelContainer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigate(id)}
                >
                    <Text style={styles.titleText}>{name}</Text>
                </TouchableOpacity>

                <View style={styles.rowAndCenter}>
                    <Entypo
                        name='location'
                        size={10}
                        color={Colors.DEFAULT_GREY}
                    />
                    <Text style={styles.locationText}>{address}</Text>
                </View>
                <Text style={styles.tagText}>
                    {tags?.slice(0, 3).join(' • ') || 'Restaurant'}
                </Text>
                <View style={styles.buttonLabelRow}>
                    <View style={styles.rowAndCenter}>
                        <FontAwesome
                            name='star'
                            size={13}
                            color={Colors.DEFAULT_YELLOW}
                        />
                        <Text style={styles.ratingText}>{rating || '4.0'}</Text>
                    </View>
                    <View style={styles.rowAndCenter}>
                        <Ionicons
                            name='time-outline'
                            color={Colors.GOOGLE_BLUE}
                            size={15}
                        />
                        <Text style={styles.ratingText}>20 mins</Text>
                    </View>
                    <View style={styles.rowAndCenter}>
                        <Ionicons
                            name='location-outline'
                            color={Colors.SECONDARY_GREEN}
                            size={15}
                        />
                        <Text style={styles.ratingText}>2.5 KM</Text>
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
        alignItems: 'center',
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 10,
        elevation: 2,
        marginVertical: 5,
        paddingVertical: 10,
        position: 'relative'
    },
    posterStyle: {
        width: 80,
        height: 80,
        borderRadius: 10,
        margin: 5
    },
    removeIcon: {
        position: 'absolute',
        zIndex: 5,
        top: 5,
        right: 5,
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 11
    },
    labelContainer: {
        flex: 1,
        paddingHorizontal: 10
    },
    titleText: {
        fontSize: 15,
        lineHeight: 15 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginBottom: 5
    },
    tagText: {
        fontSize: 11,
        lineHeight: 11 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_GREY,
        marginBottom: 5
    },
    rowAndCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    locationText: {
        fontSize: 11,
        lineHeight: 11 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_GREY,
        marginBottom: 5,
        marginLeft: 5
    },
    ratingText: {
        fontSize: 12,
        lineHeight: 12 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_BLACK,
        marginLeft: 3
    },
    buttonLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 5
    }
});

export default BookmarkCard;
