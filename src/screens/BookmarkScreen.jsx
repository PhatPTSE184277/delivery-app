import React, {useEffect} from 'react';
import {View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity} from 'react-native';
import {Colors, Fonts} from '../contants';
import {BookmarkCard, Separator} from '../components';
import {Display} from '../utils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector, useDispatch} from 'react-redux';
import {fetchBookmarksAsync} from '../reduxs/reducers/bookmarkReducer';

const ListItemSeparator = () => (
  <View
    style={{
      height: 0.8,
      backgroundColor: Colors.DEFAULT_GREY,
      width: '100%',
      marginVertical: 10,
    }}
  />
);

const BookmarkScreen = ({navigation}) => {
  const dispatch = useDispatch();
  
  // Fix: Use correct Redux selector
  const bookmarks = useSelector(state => state.bookmarkReducer.data.bookmarks);
  const loading = useSelector(state => state.bookmarkReducer.data.loading);
  const currentUser = useSelector(state => state.authReducer.data);

  useEffect(() => {
    // Fetch bookmarks when screen loads
    if (currentUser?.username) {
      dispatch(fetchBookmarksAsync(currentUser.username));
    }
  }, [dispatch, currentUser]);

  const navigateToRestaurant = (restaurantId) => {
    navigation.navigate('Restaurant', {restaurantId});
  };

  const renderBookmarkItem = ({item}) => (
    <BookmarkCard
      id={item.id}
      name={item.name}
      image={item.image}
      address={item.address}
      tags={item.tags}
      rating={item.rating}
      navigate={navigateToRestaurant}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.DEFAULT_WHITE}
        translucent
      />
      <Separator height={StatusBar.currentHeight} />
      
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-outline"
            size={30}
            color={Colors.DEFAULT_BLACK}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={{width: 30}} />
      </View>

      {bookmarks?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="bookmark-outline"
            size={100}
            color={Colors.DEFAULT_GREY}
          />
          <Text style={styles.emptyText}>No bookmarks yet</Text>
          <Text style={styles.emptySubtext}>
            Start bookmarking your favorite restaurants!
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.bookmarkList}
          data={bookmarks || []}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => <Separator height={10} />}
          ListFooterComponent={() => <Separator height={10} />}
          ItemSeparatorComponent={() => <ListItemSeparator />}
          renderItem={renderBookmarkItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.DEFAULT_WHITE,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.POPPINS_MEDIUM,
    lineHeight: 20 * 1.4,
    textAlign: 'center',
    color: Colors.DEFAULT_BLACK,
  },
  bookmarkList: {
    marginHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.POPPINS_SEMI_BOLD,
    color: Colors.DEFAULT_BLACK,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.POPPINS_MEDIUM,
    color: Colors.DEFAULT_GREY,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default BookmarkScreen;