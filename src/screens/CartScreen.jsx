import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import { Colors, Fonts, Images } from '../contants';
import { FoodCard, Separator } from '../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Display } from '../utils';
import { useSelector } from 'react-redux';
import {
    cartSelector,
    cartTotalSelector,
    cartCountSelector
} from '../reduxs/reducers/cartReducer';
import { authSelector } from '../reduxs/reducers/authReducer';
import axiosClient from '../apis/axiosClient';
import MapView, { Marker } from 'react-native-maps';

const CartScreen = ({ navigation }) => {
    const cart = useSelector(cartSelector);
    const total = useSelector(cartTotalSelector);
    const count = useSelector(cartCountSelector);
    const auth = useSelector(authSelector);

    const [deliveryAddress, setDeliveryAddress] = useState({
        title: 'Select Address',
        address: 'No delivery address selected',
        _id: null
    });
    const [isLoadingAddress, setIsLoadingAddress] = useState(true);

    const discount = 0;
    const grandTotal = total - discount;

    useEffect(() => {
        loadDefaultAddress();
    }, [auth?._id]);

    const loadDefaultAddress = async () => {
        if (!auth?._id) {
            setIsLoadingAddress(false);
            return;
        }

        try {
            const response = await axiosClient.get(
                `/address?userId=${auth._id}`
            );

            console.log('Load address response:', response);

            if (response.status === true && response.data.length > 0) {
                const defaultAddr =
                    response.data.find((addr) => addr.isDefault) ||
                    response.data[0];
                setDeliveryAddress(defaultAddr);
            } else {
                setDeliveryAddress({
                    title: 'No Address',
                    address: 'Please add a delivery address',
                    _id: null
                });
            }
        } catch (error) {
            console.error('Load address error:', error);
            setDeliveryAddress({
                title: 'Error',
                address: 'Failed to load address',
                _id: null
            });
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const onAddressSelect = (selectedAddress) => {
        console.log('Selected address in Cart:', selectedAddress);
        setDeliveryAddress({
            _id: selectedAddress._id || new Date().getTime().toString(),
            title: selectedAddress.title,
            address: selectedAddress.address,
            coordinates: selectedAddress.coordinates
        });
    };

    const handleAddressChange = () => {
        navigation.navigate('AddressListScreen', {
            onAddressSelect: onAddressSelect
        });
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
                <Text style={styles.headerTitle}>My Cart</Text>
            </View>
            {cart?.items?.length > 0 ? (
                <ScrollView>
                    <View style={styles.foodList}>
                        {cart?.items?.map((item) => (
                            <FoodCard
                                {...item}
                                key={item?.id}
                                navigate={() =>
                                    navigation.navigate('Food', {
                                        foodId: item?.id
                                    })
                                }
                            />
                        ))}
                    </View>
                    <View style={styles.promoCodeContainer}>
                        <View style={styles.rowAndCenter}>
                            <Entypo
                                name='ticket'
                                size={30}
                                color={Colors.DEFAULT_YELLOW}
                            />
                            <Text style={styles.promoCodeText}>
                                Add Promo Code
                            </Text>
                        </View>
                        <Ionicons
                            name='chevron-forward-outline'
                            size={20}
                            color={Colors.DEFAULT_BLACK}
                        />
                    </View>
                    <View style={styles.amountContainer}>
                        <View style={styles.amountSubContainer}>
                            <Text style={styles.amountLabelText}>
                                Item Total
                            </Text>
                            <Text style={styles.amountText}>
                                $ {total.toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.amountSubContainer}>
                            <Text style={styles.amountLabelText}>Discount</Text>
                            <Text style={styles.amountText}>
                                $ {discount.toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.amountSubContainer}>
                            <Text style={styles.amountLabelText}>
                                Delivery Fee
                            </Text>
                            <Text
                                style={{
                                    ...styles.amountText,
                                    color: Colors.DEFAULT_GREEN
                                }}
                            >
                                Free
                            </Text>
                        </View>
                    </View>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>Total</Text>
                        <Text style={styles.totalText}>
                            $ {grandTotal.toFixed(2)}
                        </Text>
                    </View>

                    {/* Updated Delivery Address Section */}
                    <View style={styles.deliveryAddressContainer}>
                        <View style={styles.deliveryAddressHeader}>
                            <View style={styles.deliveryToContainer}>
                                <View style={styles.miniMapContainer}>
                                    <View style={styles.mapPlaceholder}>
                                        <Ionicons
                                            name={
                                                deliveryAddress._id
                                                    ? 'location'
                                                    : 'location-outline'
                                            }
                                            size={24}
                                            color={
                                                deliveryAddress._id
                                                    ? Colors.DEFAULT_GREEN
                                                    : Colors.DEFAULT_GREY
                                            }
                                        />
                                        <View style={styles.mapGrid}>
                                            <View
                                                style={[
                                                    styles.gridLine,
                                                    styles.horizontalLine1
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.gridLine,
                                                    styles.horizontalLine2
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.gridLine,
                                                    styles.verticalLine1
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.gridLine,
                                                    styles.verticalLine2
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.deliveryTextContainer}>
                                    <Text style={styles.deliveryToText}>
                                        Deliver To: {deliveryAddress.title}
                                    </Text>
                                    <View style={styles.addressContainer}>
                                        <Ionicons
                                            name='location'
                                            size={12}
                                            color={
                                                deliveryAddress._id
                                                    ? Colors.DEFAULT_GREY
                                                    : Colors.LIGHT_GREY
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.addressText,
                                                !deliveryAddress._id &&
                                                    styles.noAddressText
                                            ]}
                                            numberOfLines={2}
                                        >
                                            {isLoadingAddress
                                                ? 'Loading address...'
                                                : deliveryAddress.address}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleAddressChange}
                                style={styles.changeButton}
                            >
                                <Text style={styles.changeText}>
                                    {deliveryAddress._id ? 'Change' : 'Add'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Show warning if no address selected */}
                        {!deliveryAddress._id && !isLoadingAddress && (
                            <View style={styles.addressWarning}>
                                <Ionicons
                                    name='warning-outline'
                                    size={16}
                                    color={Colors.DEFAULT_YELLOW}
                                />
                                <Text style={styles.warningText}>
                                    Please select a delivery address to continue
                                </Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.checkoutButton,
                            !deliveryAddress._id &&
                                styles.disabledCheckoutButton
                        ]}
                        onPress={() => {
                            if (!deliveryAddress._id) {
                                handleAddressChange();
                                return;
                            }
                            navigation.navigate('Checkout', {
                                deliveryAddress: deliveryAddress,
                                cartItems: cart?.items,
                                total: grandTotal
                            });
                        }}
                        disabled={isLoadingAddress}
                    >
                        <View style={styles.rowAndCenter}>
                            <Ionicons
                                name='cart-outline'
                                color={Colors.DEFAULT_WHITE}
                                size={20}
                            />
                            <Text style={styles.checkoutText}>
                                {!deliveryAddress._id
                                    ? 'Select Address'
                                    : 'Checkout'}
                            </Text>
                        </View>
                        <Text style={styles.checkoutText}>
                            $ {grandTotal.toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                    <Separator height={Display.setHeight(9)} />
                </ScrollView>
            ) : (
                <View style={styles.emptyCartContainer}>
                    <Image
                        style={styles.emptyCartImage}
                        source={Images.EMPTY_CART}
                        resizeMode='contain'
                    />
                    <Text style={styles.emptyCartText}>Cart Empty</Text>
                    <Text style={styles.emptyCartSubText}>
                        Go ahead and order some tasty food
                    </Text>
                    <TouchableOpacity
                        style={styles.addButtonEmpty}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <AntDesign
                            name='plus'
                            color={Colors.DEFAULT_WHITE}
                            size={20}
                        />
                        <Text style={styles.addButtonEmptyText}>Add Food</Text>
                    </TouchableOpacity>
                    <Separator height={Display.setHeight(15)} />
                </View>
            )}
        </View>
    );
};

export default CartScreen;

const styles = StyleSheet.create({
    deliveryToText: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginBottom: 4
    },
    changeButton: {
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    changeText: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_GREEN // Changed from DEFAULT_YELLOW to GREEN
    },
    addressText: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY,
        marginLeft: 4,
        flex: 1
    },
    noAddressText: {
        fontStyle: 'italic',
        color: Colors.LIGHT_GREY
    },
    // New styles
    addressWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FFF9E6',
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: Colors.DEFAULT_YELLOW
    },
    warningText: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_YELLOW,
        marginLeft: 6,
        flex: 1
    },
    disabledCheckoutButton: {
        backgroundColor: Colors.LIGHT_GREY
    },

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
    foodList: {
        marginHorizontal: Display.setWidth(4)
    },
    promoCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Display.setWidth(4),
        paddingVertical: 15,
        marginTop: 10,
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        justifyContent: 'space-between'
    },
    promoCodeText: {
        fontSize: 15,
        fontFamily: Fonts.POPPINS_MEDIUM,
        lineHeight: 15 * 1.4,
        color: Colors.DEFAULT_BLACK,
        marginLeft: 10
    },
    rowAndCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    amountContainer: {
        marginHorizontal: Display.setWidth(4),
        paddingVertical: 20,
        borderBottomWidth: 0.5
    },
    amountSubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 3
    },
    amountLabelText: {
        fontSize: 15,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        lineHeight: 15 * 1.4,
        color: Colors.DEFAULT_GREEN
    },
    amountText: {
        fontSize: 15,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        lineHeight: 15 * 1.4,
        color: Colors.DEFAULT_BLACK
    },
    totalContainer: {
        marginHorizontal: Display.setWidth(4),
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    totalText: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        lineHeight: 20 * 1.4,
        color: Colors.DEFAULT_BLACK
    },
    deliveryAddressContainer: {
        marginHorizontal: Display.setWidth(4),
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.LIGHT_GREY
    },
    deliveryAddressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    deliveryToContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    miniMapContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12
    },
    mapPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E8F5E8',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        position: 'relative'
    },
    mapGrid: {
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    gridLine: {
        position: 'absolute',
        backgroundColor: Colors.LIGHT_GREY2 || '#E0E0E0'
    },
    horizontalLine1: {
        width: '100%',
        height: 1,
        top: '30%'
    },
    horizontalLine2: {
        width: '100%',
        height: 1,
        top: '70%'
    },
    verticalLine1: {
        width: 1,
        height: '100%',
        left: '30%'
    },
    verticalLine2: {
        width: 1,
        height: '100%',
        left: '70%'
    },
    deliveryTextContainer: {
        flex: 1
    },
    checkoutButton: {
        flexDirection: 'row',
        width: Display.setWidth(80),
        backgroundColor: Colors.DEFAULT_GREEN,
        alignSelf: 'center',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        height: Display.setHeight(7),
        marginTop: 10
    },
    checkoutText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        lineHeight: 16 * 1.4,
        color: Colors.DEFAULT_WHITE,
        marginLeft: 8
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyCartText: {
        fontSize: 30,
        fontFamily: Fonts.POPPINS_LIGHT,
        lineHeight: 30 * 1.4,
        color: Colors.DEFAULT_GREEN
    },
    emptyCartSubText: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_MEDIUM,
        lineHeight: 12 * 1.4,
        color: Colors.INACTIVE_GREY
    },
    addButtonEmpty: {
        flexDirection: 'row',
        backgroundColor: Colors.DEFAULT_YELLOW,
        borderRadius: 8,
        paddingHorizontal: Display.setWidth(4),
        paddingVertical: 5,
        marginTop: 10,
        justifyContent: 'space-evenly',
        elevation: 3,
        alignItems: 'center'
    },
    addButtonEmptyText: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_MEDIUM,
        lineHeight: 12 * 1.4,
        color: Colors.DEFAULT_WHITE,
        marginLeft: 10
    },
    emptyCartImage: {
        height: Display.setWidth(60),
        width: Display.setWidth(60)
    }
});
