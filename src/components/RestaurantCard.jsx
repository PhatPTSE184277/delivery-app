import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Fonts } from '../contants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { StaticImageService } from '../services';
const RestaurantCard = ({
    id,
    name,
    images: { poster },
    location,
    navigate
}) => {

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.8}
            onPress={() => navigate(id)}
        >
            <Image
                source={{ uri: StaticImageService.getPoster(poster) }}
                style={styles.posterStyle}
            />
            <Text style={styles.titleText}>{name}</Text>
            <Text
                style={[styles.tagText, { maxWidth: 250 }]}
                ellipsizeMode='tail'
            >
                {location}
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
    }
});

export default RestaurantCard;
