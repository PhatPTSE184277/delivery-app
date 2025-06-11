import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Colors, Fonts } from '../contants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { authSelector } from '../reduxs/reducers/authReducer';
import axiosClient from '../apis/axiosClient';

const AddressListScreen = ({ navigation, route }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const auth = useSelector(authSelector);
    const { onAddressSelect } = route.params || {};

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        if (!auth?._id) return;

        try {
            const response = await axiosClient.get(
                `/address?userId=${auth._id}`
            );

            console.log('Load addresses response:', response);

            // Sửa: axiosClient trả về response.data trực tiếp, không cần .data.status
            if (response.status === true) {
                setAddresses(response.data);
            }
        } catch (error) {
            console.error('Load addresses error:', error);
            Alert.alert('Error', 'Failed to load addresses');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadAddresses();
    };

    const handleSelectAddress = (address) => {
        if (onAddressSelect) {
            onAddressSelect(address);
            navigation.goBack();
        }
    };

    const handleDeleteAddress = (addressId) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteAddress(addressId)
                }
            ]
        );
    };

    const deleteAddress = async (addressId) => {
        try {
            const response = await axiosClient.delete(`/address/${addressId}`, {
                data: { userId: auth._id }
            });

            console.log('Delete address response:', response);

            if (response.status === true) {
                setAddresses((prev) =>
                    prev.filter((addr) => addr._id !== addressId)
                );
                Alert.alert('Success', 'Address deleted successfully');
            }
        } catch (error) {
            console.error('Delete address error:', error);
            Alert.alert('Error', 'Failed to delete address');
        }
    };
    const renderAddressItem = ({ item }) => (
        <TouchableOpacity
            style={styles.addressItem}
            onPress={() => handleSelectAddress(item)}
        >
            <View style={styles.addressHeader}>
                <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{item.title}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleDeleteAddress(item._id)}
                    style={styles.deleteButton}
                >
                    <Ionicons
                        name='trash-outline'
                        size={20}
                        color={Colors.DEFAULT_RED}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.addressContent}>
                <Ionicons
                    name='location-outline'
                    size={20}
                    color={Colors.DEFAULT_GREY}
                />
                <Text style={styles.addressText} numberOfLines={2}>
                    {item.address}
                </Text>
            </View>

            <Text style={styles.dateText}>
                Saved on {new Date(item.createdAt).toLocaleDateString()}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={Colors.DEFAULT_GREEN} />
                <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle='dark-content'
                backgroundColor={Colors.DEFAULT_WHITE}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons
                        name='chevron-back'
                        size={24}
                        color={Colors.DEFAULT_BLACK}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Addresses</Text>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('MapScreen', { onAddressSelect })
                    }
                    style={styles.addButton}
                >
                    <Ionicons
                        name='add'
                        size={24}
                        color={Colors.DEFAULT_GREEN}
                    />
                </TouchableOpacity>
            </View>

            {/* Address List */}
            {addresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name='location-outline'
                        size={80}
                        color={Colors.LIGHT_GREY}
                    />
                    <Text style={styles.emptyText}>No saved addresses</Text>
                    <Text style={styles.emptySubtext}>
                        Add your first address
                    </Text>
                    <TouchableOpacity
                        style={styles.addFirstButton}
                        onPress={() =>
                            navigation.navigate('Map', { onAddressSelect })
                        }
                    >
                        <Text style={styles.addFirstButtonText}>
                            Add Address
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item._id}
                    renderItem={renderAddressItem}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default AddressListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.LIGHT_GREY
    },
    backButton: {
        padding: 5
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK
    },
    addButton: {
        padding: 5
    },
    listContainer: {
        padding: 20
    },
    addressItem: {
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    tagContainer: {
        backgroundColor: Colors.DEFAULT_GREEN,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12
    },
    tagText: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_WHITE
    },
    deleteButton: {
        padding: 5
    },
    addressContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    addressText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_BLACK
    },
    dateText: {
        fontSize: 12,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40
    },
    emptyText: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginTop: 20
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY,
        marginTop: 5,
        marginBottom: 30
    },
    addFirstButton: {
        backgroundColor: Colors.DEFAULT_GREEN,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25
    },
    addFirstButtonText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_WHITE
    }
});
