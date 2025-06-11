import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions,
    FlatList,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors, Fonts } from '../contants';
import { Separator } from '../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Display } from '../utils';
import { useSelector } from 'react-redux';
import { authSelector } from '../reduxs/reducers/authReducer';
import axiosClient from '../apis/axiosClient';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation, route }) => {
    const [searchText, setSearchText] = useState('');
    const [selectedTag, setSelectedTag] = useState('Home');
    const [selectedAddress, setSelectedAddress] = useState('');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [tempAddress, setTempAddress] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const auth = useSelector(authSelector);

    const [region, setRegion] = useState({
        latitude: 10.7769,
        longitude: 106.7009,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121
    });
    const [markerCoordinate, setMarkerCoordinate] = useState({
        latitude: 10.7769,
        longitude: 106.7009
    });

    const mapRef = useRef(null);
    const { onAddressSelect } = route.params || {};

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        setIsLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission denied',
                    'Please allow location access to use this feature'
                );
                setSelectedAddress('Location permission denied');
                setIsLoadingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                maximumAge: 10000,
                timeout: 15000
            });

            const vietnamBounds = {
                minLat: 8.0,
                maxLat: 24.0,
                minLng: 102.0,
                maxLng: 110.0
            };

            const isInVietnam =
                location.coords.latitude >= vietnamBounds.minLat &&
                location.coords.latitude <= vietnamBounds.maxLat &&
                location.coords.longitude >= vietnamBounds.minLng &&
                location.coords.longitude <= vietnamBounds.maxLng;

            if (!isInVietnam) {
                location = {
                    coords: {
                        latitude: 10.7769,
                        longitude: 106.7009,
                        accuracy: 50
                    }
                };
            }

            setCurrentLocation(location);

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121
            };

            setRegion(newRegion);
            setMarkerCoordinate({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000);
            }

            await getAddressFromCoordinates(
                location.coords.latitude,
                location.coords.longitude
            );
        } catch (error) {
            console.log('Location error:', error);
            Alert.alert('Error', 'Could not get your location');
            setSelectedAddress('Unable to get location');
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const getAddressFromCoordinates = async (latitude, longitude) => {
        try {
            let addressResponse = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (addressResponse && addressResponse.length > 0) {
                const addr = addressResponse[0];
                let fullAddress = '';

                if (addr.streetNumber) fullAddress += addr.streetNumber + ' ';
                if (addr.street) fullAddress += addr.street;
                if (addr.district) {
                    fullAddress += (fullAddress ? ', ' : '') + addr.district;
                } else if (addr.subregion) {
                    fullAddress += (fullAddress ? ', ' : '') + addr.subregion;
                }
                if (addr.city && addr.city !== addr.region) {
                    fullAddress += (fullAddress ? ', ' : '') + addr.city;
                }
                if (addr.region) {
                    fullAddress += (fullAddress ? ', ' : '') + addr.region;
                }

                if (!fullAddress.trim()) {
                    fullAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(
                        6
                    )}`;
                }

                setSelectedAddress(fullAddress.trim());
            } else {
                const coordsAddress = `${latitude.toFixed(
                    6
                )}, ${longitude.toFixed(6)}`;
                setSelectedAddress(coordsAddress);
            }
        } catch (geocodeError) {
            console.log('Geocoding error:', geocodeError);
            const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(
                6
            )}`;
            setSelectedAddress(coordsAddress);
        }
    };

    const handleSaveAddress = async () => {
        if (!selectedAddress.trim()) {
            Alert.alert('Error', 'Please select a valid address');
            return;
        }

        console.log('Auth check:', auth);

        if (!auth || !auth._id) {
            Alert.alert('Error', 'User not logged in. Please login first.');
            return;
        }

        setIsSaving(true);

        const addressData = {
            userId: auth._id,
            title: selectedTag,
            address: selectedAddress,
            coordinates: markerCoordinate,
            isDefault: false
        };

        console.log('Address data to send:', addressData);

        try {
            const response = await axiosClient.post('address', addressData);

            console.log('Response from server:', response);

            // Vì axiosClient đã return res.data, nên response chính là data từ server
            if (response.status === true) {
                Alert.alert(
                    'Success',
                    response.message || 'Address saved successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                if (onAddressSelect) {
                                    onAddressSelect({
                                        title: selectedTag,
                                        address: selectedAddress,
                                        coordinates: markerCoordinate
                                    });
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Error',
                    response.message || 'Failed to save address'
                );
            }
        } catch (error) {
            console.error('Save address error:', error);

            const errorMessage = error.message || 'An error occurred';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Search functionality for places
    const searchPlaces = useCallback(async (text) => {
        if (!text.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const results = await Location.geocodeAsync(text);

            if (results && results.length > 0) {
                const formattedResults = results.map((result, index) => ({
                    id: index,
                    title: text,
                    subtitle: `${result.latitude.toFixed(
                        6
                    )}, ${result.longitude.toFixed(6)}`,
                    coordinates: {
                        latitude: result.latitude,
                        longitude: result.longitude
                    }
                }));

                setSearchResults(formattedResults);
                setShowSearchResults(true);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        } catch (error) {
            console.log('Search error:', error);
            setSearchResults([]);
            setShowSearchResults(false);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearchResultPress = (result) => {
        const { coordinates } = result;

        setMarkerCoordinate(coordinates);
        setRegion({
            ...coordinates,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121
        });

        if (mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    ...coordinates,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121
                },
                1000
            );
        }

        getAddressFromCoordinates(coordinates.latitude, coordinates.longitude);
        setShowSearchResults(false);
        setSearchText('');
    };

    const tags = ['Home', 'Work', 'Other'];

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle='dark-content'
                backgroundColor='transparent'
                translucent
            />

            {/* Fixed Map Background */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={region}
                    onPress={(event) => {
                        const { latitude, longitude } =
                            event.nativeEvent.coordinate;
                        setMarkerCoordinate({ latitude, longitude });
                        getAddressFromCoordinates(latitude, longitude);
                        setShowSearchResults(false);
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    provider='google'
                    mapType='standard'
                >
                    <Marker
                        coordinate={markerCoordinate}
                        draggable
                        onDragEnd={(event) => {
                            const { latitude, longitude } =
                                event.nativeEvent.coordinate;
                            setMarkerCoordinate({ latitude, longitude });
                            getAddressFromCoordinates(latitude, longitude);
                        }}
                    >
                        <View style={styles.customMarker}>
                            <View style={styles.markerInner}>
                                <Ionicons
                                    name='location'
                                    size={24}
                                    color={Colors.DEFAULT_WHITE}
                                />
                            </View>
                        </View>
                    </Marker>
                </MapView>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons
                            name='search'
                            size={20}
                            color={Colors.DEFAULT_GREY}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder='Search for a place...'
                            value={searchText}
                            onChangeText={(text) => {
                                setSearchText(text);
                                searchPlaces(text);
                            }}
                            onFocus={() =>
                                setShowSearchResults(searchResults.length > 0)
                            }
                        />
                        {isSearching && (
                            <ActivityIndicator
                                size='small'
                                color={Colors.DEFAULT_GREEN}
                                style={styles.searchLoader}
                            />
                        )}
                    </View>

                    {/* Search Results */}
                    {showSearchResults && searchResults.length > 0 && (
                        <View style={styles.searchResultsContainer}>
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.searchResultItem}
                                        onPress={() =>
                                            handleSearchResultPress(item)
                                        }
                                    >
                                        <Ionicons
                                            name='location-outline'
                                            size={20}
                                            color={Colors.DEFAULT_GREY}
                                        />
                                        <View style={styles.searchResultText}>
                                            <Text
                                                style={styles.searchResultTitle}
                                            >
                                                {item.title}
                                            </Text>
                                            <Text
                                                style={
                                                    styles.searchResultSubtitle
                                                }
                                            >
                                                {item.subtitle}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                style={styles.searchResultsList}
                            />
                        </View>
                    )}
                </View>

                {/* My Location Button */}
                <TouchableOpacity
                    style={styles.myLocationButton}
                    onPress={getCurrentLocation}
                    disabled={isLoadingLocation}
                >
                    <View style={styles.compassIcon}>
                        {isLoadingLocation ? (
                            <ActivityIndicator
                                size='small'
                                color={Colors.DEFAULT_GREEN}
                            />
                        ) : (
                            <Ionicons
                                name='compass'
                                size={24}
                                color={Colors.DEFAULT_GREEN}
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            {/* Scrollable Bottom Content */}
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.backButtonContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons
                            name='chevron-back-outline'
                            size={30}
                            color={Colors.DEFAULT_BLACK}
                        />
                    </TouchableOpacity>
                </View>

                {/* Spacer to push content down */}
                <Separator height={Display.setHeight(50)} />

                {/* Bottom Sheet Content */}
                <View style={styles.bottomSheet}>
                    {/* Handle */}
                    <View style={styles.bottomSheetHandle} />

                    {/* Title */}
                    <Text style={styles.bottomSheetTitle}>Select Location</Text>

                    {/* Your Location Section */}
                    <View style={styles.locationSection}>
                        <Text style={styles.sectionLabel}>Your Location</Text>
                        <View style={styles.locationRow}>
                            <Ionicons
                                name='location-outline'
                                size={20}
                                color={Colors.DEFAULT_GREY}
                            />
                            <Text style={styles.locationText} numberOfLines={2}>
                                {selectedAddress}
                            </Text>
                        </View>
                    </View>

                    {/* Tag Section */}
                    <View style={styles.tagSection}>
                        <Text style={styles.sectionLabel}>
                            Tag This Location For Later
                        </Text>
                        <View style={styles.tagsContainer}>
                            {tags.map((tag) => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[
                                        styles.tagButton,
                                        selectedTag === tag &&
                                            styles.selectedTagButton
                                    ]}
                                    onPress={() => setSelectedTag(tag)}
                                >
                                    <Text
                                        style={[
                                            styles.tagText,
                                            selectedTag === tag &&
                                                styles.selectedTagText
                                        ]}
                                    >
                                        {tag}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            isSaving && styles.disabledButton
                        ]}
                        onPress={handleSaveAddress}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator
                                size='small'
                                color={Colors.DEFAULT_WHITE}
                            />
                        ) : (
                            <Text style={styles.saveButtonText}>
                                Save Address
                            </Text>
                        )}
                    </TouchableOpacity>

                    <Separator height={100} />
                </View>
            </ScrollView>
        </View>
    );
};

export default MapScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DEFAULT_WHITE
    },
    mapContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    map: {
        flex: 1
    },
    customMarker: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    markerInner: {
        backgroundColor: Colors.DEFAULT_GREEN,
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.DEFAULT_WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5
    },
    searchContainer: {
        position: 'absolute',
        top: StatusBar.currentHeight + 70,
        left: 20,
        right: 70,
        zIndex: 1000
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 25,
        paddingHorizontal: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3
    },
    searchIcon: {
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_BLACK
    },
    searchLoader: {
        marginLeft: 10
    },
    searchResultsContainer: {
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 15,
        marginTop: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        maxHeight: 200
    },
    searchResultsList: {
        padding: 5
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.LIGHT_GREY
    },
    searchResultText: {
        flex: 1,
        marginLeft: 10
    },
    searchResultTitle: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK
    },
    searchResultSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY,
        marginTop: 2
    },
    myLocationButton: {
        position: 'absolute',
        top: StatusBar.currentHeight + 80,
        right: 20,
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3
    },
    compassIcon: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    scrollContainer: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3
    },
    bottomSheet: {
        backgroundColor: Colors.DEFAULT_WHITE,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        minHeight: height * 0.6
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: Colors.LIGHT_GREY,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20
    },
    bottomSheetTitle: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
        marginBottom: 25
    },
    locationSection: {
        marginBottom: 25
    },
    sectionLabel: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_GREY,
        marginBottom: 10
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5
    },
    locationText: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.POPPINS_REGULAR,
        color: Colors.DEFAULT_BLACK,
        marginLeft: 10
    },
    changeText: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: '#FF8C00'
    },
    tagSection: {
        marginBottom: 30
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap'
    },
    tagButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.LIGHT_GREY,
        borderWidth: 1,
        borderColor: Colors.LIGHT_GREY
    },
    selectedTagButton: {
        backgroundColor: '#FF8C00',
        borderColor: '#FF8C00'
    },
    tagText: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_GREY
    },
    selectedTagText: {
        color: Colors.DEFAULT_WHITE
    },
    saveButton: {
        backgroundColor: Colors.DEFAULT_GREEN,
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center'
    },
    disabledButton: {
        opacity: 0.6
    },
    saveButtonText: {
        fontSize: 16,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_WHITE
    }
});
