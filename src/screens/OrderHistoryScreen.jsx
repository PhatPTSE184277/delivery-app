import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image
} from 'react-native';
import { Colors, Fonts } from '../contants';
import { Separator } from '../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Display } from '../utils';
import { useSelector } from 'react-redux';
import { authSelector } from '../reduxs/reducers/authReducer';
import axiosClient from '../apis/axiosClient';

const OrderHistoryScreen = ({ navigation }) => {
    const auth = useSelector(authSelector);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        // Sửa: Kiểm tra auth._id thay vì auth.username
        if (auth?._id) {
            fetchOrders();
        }
    }, [auth]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Sửa: Dùng userId thay vì username
            const response = await axiosClient.get(`/order?userId=${auth._id}`);

            console.log('Fetch orders response:', response);

            // Sửa: Kiểm tra response.status thay vì response.status
            if (response.status === true) {
                setOrders(response.data || []);
            } else {
                console.error('Failed to fetch orders:', response.message);
            }
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_payment':
                return Colors.DEFAULT_YELLOW;
            case 'confirmed':
                return Colors.DEFAULT_GREEN;
            case 'preparing':
                return '#FF6B35';
            case 'on_the_way':
                return '#007AFF';
            case 'delivered':
                return Colors.DEFAULT_GREEN;
            case 'cancelled':
                return '#FF3B30';
            default:
                return Colors.DEFAULT_GREY;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending_payment':
                return 'Payment Pending';
            case 'confirmed':
                return 'Confirmed';
            case 'preparing':
                return 'Preparing';
            case 'on_the_way':
                return 'On the Way';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const renderOrderCard = (order) => (
        <TouchableOpacity
            key={order._id}
            style={styles.orderCard}
            onPress={() =>
                navigation.navigate('OrderDetail', { orderId: order._id })
            }
        >
            {/* Order Header */}
            <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdText}>
                        #{order._id.slice(-8)}
                    </Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(order.status) }
                        ]}
                    >
                        <Text style={styles.statusText}>
                            {getStatusText(order.status)}
                        </Text>
                    </View>
                </View>
                <Text style={styles.orderDate}>
                    {formatDate(order.createdAt)}
                </Text>
            </View>

            {/* Order Items Preview */}
            <View style={styles.itemsPreview}>
                <Text style={styles.itemsCount}>
                    {order.items?.length || 0} item(s)
                </Text>
                <Text style={styles.itemNames} numberOfLines={2}>
                    {order.items?.map((item) => item.name).join(', ') ||
                        'No items'}
                </Text>
            </View>

            {/* Order Footer */}
            <View style={styles.orderFooter}>
                <View style={styles.paymentInfo}>
                    <Ionicons
                        name='cash-outline'
                        size={16}
                        color={Colors.DEFAULT_GREY}
                    />
                    <Text style={styles.paymentMethod}>
                        {order.paymentMethod || 'Cash on Delivery'}
                    </Text>
                </View>
                <Text style={styles.totalAmount}>
                    $ {order.totalAmount?.toFixed(2) || '0.00'}
                </Text>
            </View>

            {/* Delivery Address */}
            <View style={styles.addressContainer}>
                <Ionicons
                    name='location-outline'
                    size={14}
                    color={Colors.DEFAULT_GREY}
                />
                <Text style={styles.addressText} numberOfLines={1}>
                    {order.deliveryAddress?.title || 'No address'} -{' '}
                    {order.deliveryAddress?.address || 'No address'}
                </Text>
            </View>
        </TouchableOpacity>
    ); // Sửa: Kiểm tra auth._id thay vì auth.username
    if (!auth?._id) {
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
                    <Text style={styles.headerTitle}>Order History</Text>
                    <View style={{ width: 30 }} />
                </View>

                <View style={styles.emptyContainer}>
                    <Ionicons
                        name='receipt-outline'
                        size={80}
                        color={Colors.DEFAULT_GREY}
                    />
                    <Text style={styles.emptyTitle}>Please Login</Text>
                    <Text style={styles.emptySubtitle}>
                        Login to view your order history
                    </Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('SigninScreen')}
                    >
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                        name='chevron-back-outline'
                        size={30}
                        color={Colors.DEFAULT_BLACK}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order History</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons
                        name='refresh-outline'
                        size={24}
                        color={Colors.DEFAULT_BLACK}
                    />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name='receipt-outline'
                        size={80}
                        color={Colors.DEFAULT_GREY}
                    />
                    <Text style={styles.emptyTitle}>No Orders Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        You haven't placed any orders yet. Start shopping to see
                        your orders here.
                    </Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() =>
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'HomeTabs' }]
                            })
                        }
                    >
                        <Text style={styles.shopButtonText}>
                            Start Shopping
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <Text style={styles.ordersCountText}>
                        {orders.length} order(s) found
                    </Text>
                    {orders.map((order) => renderOrderCard(order))}
                </ScrollView>
            )}
        </View>
    );
};

export default OrderHistoryScreen;

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
    ordersCountText: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY,
        marginVertical: 10
    },
    orderCard: {
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: Colors.LIGHT_GREY
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    orderIdText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginRight: 10
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        fontSize: 10,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_WHITE
    },
    orderDate: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY
    },
    itemsPreview: {
        marginBottom: 12
    },
    itemsCount: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginBottom: 4
    },
    itemNames: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    paymentMethod: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY,
        marginLeft: 4
    },
    totalAmount: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_GREEN
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.LIGHT_GREY
    },
    addressText: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY,
        marginLeft: 4,
        flex: 1
    },
    // Empty State Styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Display.setWidth(8)
    },
    emptyTitle: {
        fontSize: 24,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginTop: 20,
        marginBottom: 10
    },
    emptySubtitle: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY,
        textAlign: 'center',
        marginBottom: 30
    },
    shopButton: {
        backgroundColor: Colors.DEFAULT_GREEN,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8
    },
    shopButtonText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_WHITE
    },
    loginButton: {
        backgroundColor: Colors.DEFAULT_GREEN,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8
    },
    loginButtonText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_WHITE
    },
    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY
    }
});
