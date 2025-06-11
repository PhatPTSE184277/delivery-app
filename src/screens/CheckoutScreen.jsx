import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Colors, Fonts } from '../contants';
import { CheckoutFoodCard, Separator } from '../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { Display } from '../utils';
import { useSelector, useDispatch } from 'react-redux';
import {
    cartSelector,
    cartTotalSelector
} from '../reduxs/reducers/cartReducer';
import { authSelector } from '../reduxs/reducers/authReducer';
import { clearCart } from '../reduxs/reducers/cartReducer';
import axiosClient from '../apis/axiosClient';

const CheckoutScreen = ({ navigation, route }) => {
    const cart = useSelector(cartSelector);
    const total = useSelector(cartTotalSelector);
    const auth = useSelector(authSelector);
    const dispatch = useDispatch();

    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

    // Get delivery address from navigation params (passed from CartScreen)
    const [deliveryAddress, setDeliveryAddress] = useState(
        route.params?.deliveryAddress || {
            title: 'No Address',
            address: 'Please select a delivery address',
            _id: null
        }
    );

    const deliveryFee = 0;
    const itemTotal = total;
    const grandTotal = itemTotal + deliveryFee;

    const handleConfirmOrder = async () => {
        if (!deliveryAddress._id) {
            Alert.alert('Error', 'Please go back to cart and select a delivery address first');
            return;
        }

        // Sửa: Kiểm tra auth._id thay vì auth.username
        if (!auth?._id) {
            Alert.alert('Error', 'Please login to place order');
            navigation.navigate('SigninScreen');
            return;
        }

        setIsProcessingOrder(true);

        try {
            // Sửa: Prepare order data với userId
            const orderData = {
                userId: auth._id, // Sửa: userId thay vì username
                items: cart.items.map((item) => ({
                    foodId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.count,
                    image: item.image,
                    total: item.price * item.count
                })),
                totalAmount: grandTotal,
                deliveryAddress: {
                    title: deliveryAddress.title,
                    address: deliveryAddress.address,
                    coordinates: deliveryAddress.coordinates || null
                },
                restaurantId: cart.items[0]?.restaurantId || 'default-restaurant',
                paymentMethod: 'Cash on Delivery', // Chỉ có Cash on Delivery
                deliveryFee: deliveryFee
            };

            console.log('Sending order data:', orderData);

            const response = await axiosClient.post('/order', orderData);

            console.log('Order response:', response);

            // Sửa: Kiểm tra response.status thay vì response.status
            if (response.status === true) {
                // Clear cart from Redux
                dispatch(clearCart());

                // Sửa: Dùng response.data._id thay vì response.data.orderId
                Alert.alert(
                    'Order Confirmed!', 
                    `Order ID: ${response.data._id}\nYou will pay when you receive your order.\nTotal: $ ${grandTotal.toFixed(2)}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navigate back to Home
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'HomeTabs' }]
                                });
                            }
                        }
                    ]
                );
            } else {
                throw new Error(response.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Order creation error:', error);
            Alert.alert('Error', 'Failed to create order. Please try again.');
        } finally {
            setIsProcessingOrder(false);
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

            {/* Header */}
            <View style={styles.headerContainer}>
                <Ionicons
                    name='chevron-back-outline'
                    size={30}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView style={styles.scrollContainer}>
                {/* Delivery Address */}
                <View style={styles.deliveryAddressContainer}>
                    <View style={styles.deliveryAddressHeader}>
                        <View style={styles.deliveryToContainer}>
                            {/* Mini Map Placeholder */}
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
                                        <View style={[styles.gridLine, styles.horizontalLine1]} />
                                        <View style={[styles.gridLine, styles.horizontalLine2]} />
                                        <View style={[styles.gridLine, styles.verticalLine1]} />
                                        <View style={[styles.gridLine, styles.verticalLine2]} />
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
                                            !deliveryAddress._id && styles.noAddressText
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {deliveryAddress.address}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Warning if no address */}
                    {!deliveryAddress._id && (
                        <View style={styles.addressWarning}>
                            <Ionicons
                                name='warning-outline'
                                size={16}
                                color={Colors.DEFAULT_YELLOW}
                            />
                            <Text style={styles.warningText}>
                                Please go back to cart and select a delivery address
                            </Text>
                        </View>
                    )}
                </View>

                {/* Order Items */}
                <View style={styles.orderItemsContainer}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    {cart?.items?.length > 0 ? (
                        cart.items.map((item) => (
                            <CheckoutFoodCard
                                id={item.id}
                                name={item.name}
                                description={item.description}
                                price={item.price}
                                image={item.image}
                                quantity={item.count}
                                key={item?.id}
                                navigate={() =>
                                    navigation.navigate('Food', {
                                        foodId: item?.id
                                    })
                                }
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyCartText}>No items in cart</Text>
                    )}
                </View>

                {/* Payment Method - Chỉ hiển thị Cash on Delivery */}
                <View style={styles.paymentContainer}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    
                    <View style={[styles.paymentMethod, styles.selectedPaymentMethod]}>
                        <View style={styles.paymentMethodContent}>
                            <View style={[styles.paymentIcon, { backgroundColor: Colors.DEFAULT_GREEN }]}>
                                <Ionicons
                                    name='cash-outline'
                                    size={20}
                                    color={Colors.DEFAULT_WHITE}
                                />
                            </View>
                            <View style={styles.paymentDetails}>
                                <Text style={styles.paymentName}>Cash on Delivery</Text>
                                <Text style={styles.paymentSubtitle}>
                                    Pay when you receive your order
                                </Text>
                            </View>
                        </View>
                        <View style={styles.selectedIndicator}>
                            <Ionicons
                                name='checkmark'
                                size={16}
                                color={Colors.DEFAULT_WHITE}
                            />
                        </View>
                    </View>
                </View>

                {/* Promo Code */}
                <View style={styles.promoCodeContainer}>
                    <View style={styles.promoCodeContent}>
                        <Entypo
                            name='ticket'
                            size={24}
                            color={Colors.DEFAULT_YELLOW}
                        />
                        <Text style={styles.promoCodeText}>Add Promo Code</Text>
                    </View>
                    <Ionicons
                        name='chevron-forward-outline'
                        size={20}
                        color={Colors.DEFAULT_BLACK}
                    />
                </View>

                {/* Order Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Item Total</Text>
                        <Text style={styles.summaryValue}>$ {itemTotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee</Text>
                        <Text style={[styles.summaryValue, { color: Colors.DEFAULT_GREEN }]}>
                            Free
                        </Text>
                    </View>
                </View>

                {/* Total */}
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>$ {grandTotal.toFixed(2)}</Text>
                </View>
            </ScrollView>

            {/* Confirm Order Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        (!deliveryAddress._id || isProcessingOrder) && styles.disabledButton
                    ]}
                    onPress={handleConfirmOrder}
                    disabled={!deliveryAddress._id || isProcessingOrder}
                >
                    <Text style={styles.confirmButtonText}>
                        {isProcessingOrder
                            ? 'Processing Order...'
                            : !deliveryAddress._id
                            ? 'Go Back to Select Address'
                            : 'Confirm Order'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>    );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: Display.setWidth(4)
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginBottom: 10
    },
    // Delivery Address Styles
    deliveryAddressContainer: {
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
    deliveryToText: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginBottom: 4
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center'
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
    orderItemsContainer: {
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.LIGHT_GREY
    },
    emptyCartText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY,
        textAlign: 'center',
        paddingVertical: 20
    },
    // Payment Method Styles
    paymentContainer: {
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.LIGHT_GREY
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    paymentTitle: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.LIGHT_GREY
    },
    selectedPaymentMethod: {
        borderColor: Colors.DEFAULT_GREEN,
        backgroundColor: '#E8F5E8'
    },
    paymentMethodContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    paymentIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    paymentDetails: {
        flex: 1
    },
    paymentName: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginBottom: 2
    },
    paymentSubtitle: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY
    },
    selectedIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.DEFAULT_GREEN,
        justifyContent: 'center',
        alignItems: 'center'
    },
    // Promo Code Styles
    promoCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.LIGHT_GREY
    },
    promoCodeContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    promoCodeText: {
        fontSize: 15,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginLeft: 10
    },
    // Summary Styles
    summaryContainer: {
        paddingVertical: 15
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5
    },
    summaryLabel: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_BLACK
    },
    summaryValue: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_BLACK
    },
    // Total Styles
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderTopWidth: 0.5,
        borderTopColor: Colors.LIGHT_GREY,
        marginBottom: 20
    },
    totalLabel: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_BLACK
    },
    totalValue: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_BLACK
    },
    // Button Styles
    buttonContainer: {
        padding: Display.setWidth(4),
        backgroundColor: Colors.DEFAULT_WHITE
    },
    confirmButton: {
        backgroundColor: Colors.DEFAULT_GREEN,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    disabledButton: {
        backgroundColor: Colors.LIGHT_GREY
    },
    confirmButtonText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_WHITE
    }
});
