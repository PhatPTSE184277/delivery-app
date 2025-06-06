import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Fonts } from '../contants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StaticImageService } from '../services';
import { useDispatch, useSelector } from 'react-redux';
import {
    addBookmark,
    removeBookmark,
    addBookmarkAsync,
    removeBookmarkAsync,
    isBookmarkedSelector
} from '../reduxs/reducers/bookmarkReducer';

const RestaurantCard = ({
    id,
    name,
    images: { poster },
    tags,
    distance,
    time,
    navigate
}) => {
    const dispatch = useDispatch();

    // Get bookmark status from Redux
    const isBookmarked = useSelector((state) =>
        isBookmarkedSelector(state, id)
    );

    // Get current user
    const currentUser = useSelector((state) => state.authReducer.data);

    // Handle bookmark toggle
    const handleBookmarkToggle = () => {
        if (!currentUser?.username) {
            console.log('User not logged in');
            return;
        }

        if (isBookmarked) {
            // Remove bookmark
            dispatch(removeBookmark({ id }));
            dispatch(
                removeBookmarkAsync({
                    restaurantId: id,
                    username: currentUser.username
                })
            );
        } else {
            // Add bookmark
            const bookmarkData = {
                id,
                name,
                image: poster,
                description: '',
                rating: 4.0,
                address: distance
            };

            dispatch(addBookmark(bookmarkData));
            dispatch(
                addBookmarkAsync({
                    restaurantId: id,
                    username: currentUser.username
                })
            );
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.8}
            onPress={() => navigate(id)}
        >
            <TouchableOpacity onPress={handleBookmarkToggle} style={styles.bookmark}>
                <Ionicons
                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    color={
                        isBookmarked
                            ? Colors.DEFAULT_YELLOW
                            : Colors.DEFAULT_GREY
                    }
                    size={24}
                />
            </TouchableOpacity>
            <Image
                source={{ uri: StaticImageService.getPoster(poster) }}
                style={styles.posterStyle}
            />
            <Text style={styles.titleText}>{name}</Text>
            <Text style={styles.tagText} numberOfLines={1} ellipsizeMode='tail'>
                {tags?.length > 4
                    ? tags.slice(0, 4).join(' • ') + ' ...'
                    : tags?.join(' • ')}
            </Text>
            <View style={styles.footerContainer}>
                <View style={styles.rowAndCenter}>
                    <FontAwesome
                        name='star'
                        size={14}
                        color={Colors.DEFAULT_YELLOW}
                    />
                    <Text style={styles.ratingText}>4</Text>
                    <Text style={styles.reviewsText}>({10})</Text>
                </View>
                <View style={styles.rowAndCenter}>
                    <View style={styles.timeAndDistanceContainer}>
                        <Ionicons
                            name='location-outline'
                            color={Colors.DEFAULT_YELLOW}
                            size={15}
                        />
                        <Text style={styles.timeAndDistanceText}>
                            {distance}
                        </Text>
                    </View>
                    <View style={styles.timeAndDistanceContainer}>
                        <Ionicons
                            name='time-outline'
                            color={Colors.DEFAULT_YELLOW}
                            size={15}
                        />
                        <Text style={styles.timeAndDistanceText}>{time}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        margin: 5
    },
    titleText: {
        marginLeft: 8,
        fontSize: 15,
        lineHeight: 15 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_BLACK
    },
    tagText: {
        marginLeft: 8,
        fontSize: 11,
        lineHeight: 11 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_GREY,
        marginBottom: 5
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 3,
        backgroundColor: Colors.LIGHT_YELLOW,
        borderRadius: 12,
        marginHorizontal: 3
    },
    timeAndDistanceText: {
        fontSize: 10,
        lineHeight: 10 * 1.4,
        fontFamily: Fonts.POPPINS_BOLD,
        color: Colors.DEFAULT_YELLOW
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 10,
        lineHeight: 10 * 1.4,
        fontFamily: Fonts.POPPINS_BOLD,
        color: Colors.DEFAULT_BLACK
    },
    reviewsText: {
        fontSize: 10,
        lineHeight: 10 * 1.4,
        fontFamily: Fonts.POPPINS_BOLD,
        color: Colors.DEFAULT_BLACK
    },
    bookmark: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10
    }
});

export default RestaurantCard;
