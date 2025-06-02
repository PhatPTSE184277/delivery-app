import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    FlatList,
    RefreshControl
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Display } from '../utils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ApiContants, Colors, Fonts, Images } from '../contants';
import { StaticImageService } from '../services';
import axiosClient from '../apis/axiosClient';
import {
    CategoryListItem,
    FoodCard,
    Separator,
    SkeletonFoodCard
} from '../components';
import { useDispatch, useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import {
    addBookmark,
    removeBookmark,
    addBookmarkAsync,
    removeBookmarkAsync,
    isBookmarkedSelector
} from '../reduxs/reducers/bookmarkReducer';

const ListHeader = () => (
    <View
        style={{
            flexDirection: 'row',
            flex: 1,
            width: 40,
            justifyContent: 'flex-end'
        }}
    >
        <View
            style={{
                backgroundColor: Colors.LIGHT_YELLOW,
                width: 20,
                borderTopLeftRadius: 64,
                borderBottomLeftRadius: 64
            }}
        />
    </View>
);

const ListFooter = () => (
    <View
        style={{
            flexDirection: 'row',
            flex: 1,
            width: 40
        }}
    >
        <View
            style={{
                backgroundColor: Colors.LIGHT_YELLOW,
                width: 20,
                borderTopRightRadius: 64,
                borderBottomRightRadius: 64
            }}
        />
    </View>
);

const RestaurantScreen = ({
    navigation,
    route: {
        params: { restaurantId }
    }
}) => {
    const [restaurant, setRestaurant] = useState();
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState();
    // const [isBookmarked, setIsBookmarked] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const dispatch = useDispatch();

    const isBookmarked = useSelector((state) =>
        isBookmarkedSelector(state, restaurantId)
    );

    const currentUser = useSelector((state) => state.authReducer.data);

    // Handle bookmark toggle
    const handleBookmarkToggle = () => {
        if (!currentUser?.username) {
            console.log('User not logged in');
            return;
        }

        if (isBookmarked) {
            // Remove bookmark
            dispatch(removeBookmark({ id: restaurantId }));
            dispatch(
                removeBookmarkAsync({
                    restaurantId,
                    username: currentUser.username
                })
            );
        } else {
            // Add bookmark
            const bookmarkData = {
                id: restaurantId,
                name: restaurant?.name,
                image: restaurant?.images?.cover,
                description: restaurant?.description || '',
                rating: restaurant?.rating || 4.2,
                address: restaurant?.distance
            };

            dispatch(addBookmark(bookmarkData));
            dispatch(
                addBookmarkAsync({
                    restaurantId,
                    username: currentUser.username
                })
            );
        }
    };

    const getRestaurant = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(
                `restaurant/${restaurantId}`
            );
            if (response && response.data) {
                setRestaurant(response.data.restaurant);
                setSelectedCategory(response.data.restaurant.categories[0]);
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getRestaurant();
    }, []);

    useEffect(() => {
        getRestaurant();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle='default'
                translucent
                backgroundColor='transparent'
            />
            <>
                <Image
                    source={{
                        uri: StaticImageService.getGalleryImage(
                            restaurant?.images?.cover,
                            ApiContants.STATIC_IMAGE.SIZE.SQUARE
                        )
                    }}
                    style={styles.backgroundImage}
                />
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[
                                Colors.DEFAULT_GREEN,
                                Colors.DEFAULT_YELLOW
                            ]}
                            tintColor={Colors.DEFAULT_GREEN}
                            progressBackgroundColor={Colors.DEFAULT_WHITE}
                        />
                    }
                >
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons
                                name='chevron-back-outline'
                                size={30}
                                color={Colors.DEFAULT_WHITE}
                            />
                        </TouchableOpacity>
                    </View>
                    <Separator height={Display.setHeight(35)} />
                    <View style={styles.mainContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{restaurant?.name}</Text>
                            <TouchableOpacity onPress={handleBookmarkToggle}>
                                <Ionicons
                                    name={
                                        isBookmarked
                                            ? 'bookmark'
                                            : 'bookmark-outline'
                                    }
                                    color={
                                        isBookmarked
                                            ? Colors.DEFAULT_YELLOW
                                            : Colors.DEFAULT_GREY
                                    }
                                    size={24}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.tagText}>
                            {restaurant?.tags?.length > 4
                                ? restaurant?.tags?.slice(0, 4).join(' • ') +
                                  ' ...'
                                : restaurant?.tags?.join(' • ')}
                        </Text>
                        <View style={styles.ratingReviewsContainer}>
                            <FontAwesome name='star' />
                            <Text style={styles.ratingText}>4.2</Text>
                            <Text style={styles.reviewsText}>
                                (455 Reviews)
                            </Text>
                        </View>
                        <View style={styles.deliveryDetailsContainer}>
                            <View style={styles.rowAndCenter}>
                                <Image
                                    style={styles.deliveryDetailIcon}
                                    source={Images.DELIVERY_CHARGE}
                                />
                                <Text style={styles.deliveryDetailText}>
                                    Free Delivery
                                </Text>
                            </View>
                            <View style={styles.rowAndCenter}>
                                <Image
                                    style={styles.deliveryDetailIcon}
                                    source={Images.DELIVERY_TIME}
                                />
                                <Text style={styles.deliveryDetailText}>
                                    {restaurant?.time} min
                                </Text>
                            </View>
                            <View style={styles.rowAndCenter}>
                                <Image
                                    style={styles.deliveryDetailIcon}
                                    source={Images.MARKER}
                                />
                                <Text style={styles.deliveryDetailText}>
                                    {restaurant?.distance}
                                </Text>
                            </View>
                            <View style={styles.restaurantType}>
                                <Text style={styles.restaurantTypeText}>
                                    {restaurant?.type}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.categoriesContainer}>
                            <FlatList
                                data={restaurant?.categories}
                                keyExtractor={(item) => item}
                                horizontal
                                ListHeaderComponent={() => <ListHeader />}
                                ListFooterComponent={() => <ListFooter />}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <CategoryListItem
                                        name={item}
                                        isActive={item === selectedCategory}
                                        selectCategory={(category) =>
                                            setSelectedCategory(category)
                                        }
                                    />
                                )}
                            />
                        </View>
                        <View style={styles.foodList}>
                            {loading
                                ? Array.from({ length: 5 }).map((_, index) => (
                                      <SkeletonFoodCard
                                          key={`skeleton-food-${index}`}
                                      />
                                  ))
                                : restaurant?.foods
                                      ?.filter(
                                          (food) =>
                                              food?.category ===
                                              selectedCategory
                                      )
                                      ?.map((item) => (
                                          <FoodCard
                                              key={item?.id}
                                              {...item}
                                              navigate={() =>
                                                  navigation.navigate('Food', {
                                                      foodId: item?.id
                                                  })
                                              }
                                          />
                                      ))}
                            <Separator height={Display.setHeight(2)} />
                        </View>
                    </View>
                </ScrollView>
            </>
        </View>
    );
};

export default RestaurantScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        height: Display.setWidth(100),
        width: Display.setWidth(100)
    },
    mainContainer: {
        backgroundColor: Colors.SECONDARY_WHITE,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 25,
        marginTop: 15
    },
    title: {
        fontSize: 23,
        lineHeight: 23 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_BLACK
    },
    tagText: {
        marginHorizontal: 25,
        marginTop: 5,
        fontSize: 13,
        lineHeight: 13 * 1.4,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_GREY
    },
    ratingReviewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 25,
        marginTop: 10
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 13,
        lineHeight: 13 * 1.4,
        fontFamily: Fonts.POPPINS_BOLD,
        color: Colors.DEFAULT_BLACK
    },
    reviewsText: {
        marginLeft: 5,
        fontSize: 13,
        lineHeight: 13 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK
    },
    deliveryDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 25,
        marginTop: 10,
        justifyContent: 'space-between'
    },
    deliveryDetailText: {
        marginLeft: 3,
        fontSize: 12,
        lineHeight: 12 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK
    },
    deliveryDetailIcon: {
        height: 16,
        width: 16
    },
    rowAndCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    restaurantType: {
        backgroundColor: Colors.LIGHT_YELLOW,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8
    },
    restaurantTypeText: {
        fontSize: 12,
        lineHeight: 12 * 1.4,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_YELLOW
    },
    categoriesContainer: {
        marginVertical: 20
    },
    foodList: {
        marginHorizontal: 15
    },
    backButtonContainer: {
        position: 'absolute',
        top: StatusBar.currentHeight + 10,
        left: 15,
        zIndex: 999
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
