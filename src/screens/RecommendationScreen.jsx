import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    FlatList,
    StatusBar,
    ScrollView,
    RefreshControl,
    Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Fonts, ApiContants } from '../contants';
import { Display } from '../utils';
import { Separator } from '../components';
import { StaticImageService } from '../services';
import recommendationService from '../apis/recommendationService';

const RecommendationScreen = ({ navigation }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiMetadata, setAiMetadata] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const response = await recommendationService.getRecommendations();
            
            if (response.success) {
                setRecommendations(response.data.recommendations);
                setAiMetadata(response.data.ai_metadata);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load AI recommendations');
            console.error('Fetch recommendations error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchRecommendations();
    };

    const navigateToFood = (food) => {
        navigation.navigate('Food', { foodId: food._id });
    };

    const renderFoodItem = ({ item: food }) => (
        <TouchableOpacity 
            style={styles.foodCard}
            onPress={() => navigateToFood(food)}
            activeOpacity={0.8}
        >
            <View style={styles.foodImageContainer}>
                <Image
                    source={{
                        uri: StaticImageService.getGalleryImage(
                            food.image,
                            ApiContants.STATIC_IMAGE.SIZE.SQUARE
                        )
                    }}
                    style={styles.foodImage}
                   
                />
            </View>
            <View style={styles.foodInfo}>
                <Text style={styles.foodName} numberOfLines={2}>
                    {food.name}
                </Text>
                <Text style={styles.foodCategory}>
                    {food.category}
                </Text>
                <Text style={styles.foodPrice}>
                    $ {food.price}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderRecommendationSection = ({ item: section }) => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    {section.title}
                </Text>
                <Text style={styles.sectionSubtitle}>
                    {section.subtitle}
                </Text>
                {section.confidence && (
                    <View style={styles.confidenceContainer}>
                        <Text style={styles.confidenceText}>
                            Confidence: {section.confidence}
                        </Text>
                        {section.model && (
                            <Text style={styles.modelText}>
                                Model: {section.model}
                            </Text>
                        )}
                    </View>
                )}
            </View>
            
            <FlatList
                data={section.items}
                renderItem={renderFoodItem}
                keyExtractor={(food) => food._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ListHeaderComponent={() => <Separator width={20} />}
                ListFooterComponent={() => <Separator width={20} />}
                ItemSeparatorComponent={() => <Separator width={10} />}
            />
        </View>
    );

    if (loading && !refreshing) {
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
                    <Text style={styles.headerTitle}>AI Recommendations</Text>
                    <View style={{ width: 30 }} />
                </View>

                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.DEFAULT_GREEN} />
                    <Text style={styles.loadingText}>
                        🤖 AI is analyzing your preferences...
                    </Text>
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
                <Text style={styles.headerTitle}>🤖 AI Recommendations</Text>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons
                        name='refresh-outline'
                        size={24}
                        color={Colors.DEFAULT_BLACK}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.DEFAULT_GREEN, Colors.DEFAULT_YELLOW]}
                        tintColor={Colors.DEFAULT_GREEN}
                        progressBackgroundColor={Colors.DEFAULT_WHITE}
                    />
                }
            >
                {/* AI Metadata */}
                {aiMetadata && (
                    <View style={styles.aiMetadataContainer}>
                        <View style={styles.aiMetadataHeader}>
                            <Ionicons name="hardware-chip-outline" size={20} color={Colors.DEFAULT_GREEN} />
                            <Text style={styles.aiProviderText}>
                                {aiMetadata.ai_provider}
                            </Text>
                        </View>
                        <Text style={styles.modelVersion}>
                            Model: {aiMetadata.model_version}
                        </Text>
                        <View style={styles.aiStatsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Processing Time</Text>
                                <Text style={styles.statValue}>{aiMetadata.computation_time}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Confidence</Text>
                                <Text style={styles.confidenceScore}>
                                    {Math.round(aiMetadata.confidence_score * 100)}%
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Recommendations List */}
                <FlatList
                    data={recommendations}
                    renderItem={renderRecommendationSection}
                    keyExtractor={(section) => section.type}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    contentContainerStyle={styles.listContainer}
                />

                <Separator height={Display.setHeight(10)} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.SECONDARY_WHITE,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.DEFAULT_WHITE,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_MEDIUM,
        color: Colors.DEFAULT_BLACK,
    },
    scrollContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Display.setWidth(8),
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: Colors.DEFAULT_GREY,
        textAlign: 'center',
        fontFamily: Fonts.POPPINS_MEDIUM,
    },
    aiMetadataContainer: {
        backgroundColor: Colors.DEFAULT_WHITE,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: Colors.DEFAULT_GREEN,
    },
    aiMetadataHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    aiProviderText: {
        fontSize: 18,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_BLACK,
        marginLeft: 8,
    },
    modelVersion: {
        fontSize: 14,
        color: Colors.DEFAULT_GREY,
        fontFamily: Fonts.POPPINS_REGULAR,
        marginBottom: 12,
    },
    aiStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.DEFAULT_GREY,
        fontFamily: Fonts.POPPINS_REGULAR,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        color: Colors.DEFAULT_BLACK,
        fontFamily: Fonts.POPPINS_MEDIUM,
    },
    confidenceScore: {
        fontSize: 14,
        color: Colors.DEFAULT_GREEN,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
    },
    listContainer: {
        paddingBottom: 20,
    },
    sectionContainer: {
        marginBottom: 30,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_BLACK,
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.DEFAULT_GREY,
        marginBottom: 10,
        fontFamily: Fonts.POPPINS_REGULAR,
    },
    confidenceContainer: {
        backgroundColor: '#E8F5E8',
        padding: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    confidenceText: {
        fontSize: 12,
        color: Colors.DEFAULT_GREEN,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
    },
    modelText: {
        fontSize: 10,
        color: Colors.DEFAULT_GREY,
        marginTop: 2,
        fontFamily: Fonts.POPPINS_REGULAR,
    },
    horizontalList: {
        paddingVertical: 5,
    },
    foodCard: {
        backgroundColor: Colors.DEFAULT_WHITE,
        borderRadius: 12,
        width: 160,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },    foodImageContainer: {
        width: '100%',
        height: 100,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        backgroundColor: Colors.LIGHT_GREY,
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodImage: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    foodImagePlaceholder: {
        fontSize: 40,
    },
    foodInfo: {
        padding: 12,
    },
    foodName: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_BLACK,
        marginBottom: 4,
        lineHeight: 14 * 1.4,
    },
    foodCategory: {
        fontSize: 11,
        color: Colors.DEFAULT_GREY,
        marginBottom: 6,
        fontFamily: Fonts.POPPINS_REGULAR,
        lineHeight: 11 * 1.4,
    },
    foodPrice: {
        fontSize: 14,
        fontFamily: Fonts.POPPINS_SEMI_BOLD,
        color: Colors.DEFAULT_YELLOW,
        lineHeight: 14 * 1.4,
    },
});

export default RecommendationScreen;