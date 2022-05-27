import React, {useState, useRef} from 'react';
import {
  useWindowDimensions,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {getTrending, getGenreShows, getGenresShows} from '../utils/Requests';
import {storeUser, retrieveUser} from '../utils/Storage';
import LinearGradient from 'react-native-linear-gradient';
import GenreView from '../components/GenreView';
import GenreResults from '../components/GenreResults';

const ShowsScreen = ({navigation}) => {
  const [genres, setGenres] = useState(null);
  const [genre, setGenre] = useState(10759);
  const [shows, setShows] = useState(null);
  const [endReached, setEndReached] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingData, setLoadingData] = useState(false);

  const size = useWindowDimensions();
  const width = size.width;
  const height = size.height;

  const styles = StyleSheet.create({
    tinyLogo: {
      width: width * 0.3,
      height: height * 0.3,
      borderRadius: 10,
      margin: 10,
    },
    list: {
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#FFFFFF',
    },
  });

  if (!genres) {
    getGenresShows().then(data => {
      setGenres(data.genres);
    });

    return (
      <View>
        <ActivityIndicator></ActivityIndicator>
      </View>
    );
  }

  if (!shows || endReached) {
    getGenreShows(genre, endReached ? page + 1 : page).then(data => {
      setShows(shows ? shows.concat(data.results) : data.results);
      endReached ? setPage(page + 1) : null;
      endReached ? setEndReached(false) : null;
      endReached ? setLoadingData(false) : null;
    });
    if (!shows) {
      return (
        <View>
          <View style={styles.list}>
            <GenreView data={genres}></GenreView>
          </View>
          <ActivityIndicator></ActivityIndicator>
        </View>
      );
    }
  }

  return (
    <LinearGradient
      colors={['#000000', '#050227']}
      style={{
        flex: 1,
      }}>
      <View style={styles.list}>
        <GenreView
          data={genres}
          onChange={data => {
            setGenre(data);
            console.log(data);
            setShows(null);
          }}></GenreView>
        {!shows && <ActivityIndicator></ActivityIndicator>}
      </View>

      <GenreResults
        data={shows}
        imagestyle={styles.tinyLogo}
        onEndReached={data => {
          console.log(data);
          setEndReached(data);
          setLoadingData(true);
        }}></GenreResults>
      {loadingData && <ActivityIndicator></ActivityIndicator>}
    </LinearGradient>
  );
};

export default ShowsScreen;
