/* eslint-disable react-native/no-inline-styles */
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
import {getTrending, getGenreMovies, getGenresMovies} from '../utils/Requests';
import {storeUser, retrieveUser} from '../utils/Storage';
import MediaSlider from '../components/MediaSlider';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GenreView from '../components/GenreView';
import GenreResults from '../components/GenreResults';

const MoviesScreen = ({navigation}) => {
  const [genres, setGenres] = useState(null);
  const [genre, setGenre] = useState(28);
  const [movies, setMovies] = useState(null);
  const [endReached, setEndReached] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingData, setLoadingData] = useState(false);

  const size = useWindowDimensions();
  const width = size.width;
  const height = size.height;

  if (!genres) {
    getGenresMovies().then(data => {
      setGenres(data.genres);
    });

    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  if (!movies || endReached) {
    getGenreMovies(genre, endReached ? page + 1 : page).then(data => {
      setMovies(movies ? movies.concat(data.results) : data.results);
      endReached ? setPage(page + 1) : null;
      endReached ? setEndReached(false) : null;
      endReached ? setLoadingData(false) : null;
    });

    if (!movies) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    }
  }

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

  return (
    <LinearGradient
      colors={['#000000', '#050227']}
      style={{
        flex: 1,
      }}>
      <View style={styles.list}>
        <GenreView data={genres} />
      </View>

      <GenreResults
        data={movies}
        imagestyle={styles.tinyLogo}
        onEndReached={data => {
          console.log(data);
          setEndReached(data);
          setLoadingData(true);
        }}
      />
      {loadingData && <ActivityIndicator />}
    </LinearGradient>
  );
};

export default MoviesScreen;
