/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef} from 'react';
import {
  useWindowDimensions,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {addWatchlist, getMovie, deleteWatchlist} from '../utils/Requests';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Video} from 'expo-av';
//import AsyncStorage from '@react-native-async-storage/async-storage';

const MovieScreen = ({navigation, route}) => {
  const {id} = route.params;
  const [isLoading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [watchlist, setWatchlist] = useState(null);

  if (!movie) {
    getMovie(id).then(data => {
      setMovie(data);
      setLoading(false);
      setWatchlist(data.inWatchlist);
    });
  }
  const size = useWindowDimensions();
  const width = size.width;
  const height = size.height;
  const styles = StyleSheet.create({
    backgroundImage: {
      width: '100%',
      height: '100%',
    },
    mainContainer: {
      flexDirection: 'row',
    },
    posterContainer: {
      flexDirection: 'column',
    },
    poster: {
      width: width * 0.22,
      height: height * 0.6,
      borderRadius: 10,
      top: '30%',
      left: '70%',
    },
    overview: {
      color: '#FFFFFF',
      fontSize: width * 0.0128,
      textAlign: 'center',
    },
    overviewContainer: {
      width: '55%',
    },
    button: {
      width: width * 0.1,
      height: height * 0.05,
      borderRadius: 100,
      backgroundColor: '#FFFFFF',
      borderColor: '#000000',
      borderWidth: 1,
      paddingTop: 2,
      opacity: '0.8',
      color: '#000000',
      marginRight: 11,
    },
    informationContainer: {
      left: '90%',
      top: '25%',
    },
    buttonContainer: {
      flexDirection: 'row',
      marginBottom: 5,
      left: '5%',
    },
    circleButton: {
      width: width * 0.03,
      height: height * 0.05,
      borderRadius: 100,
      backgroundColor: '#FFFFFF',
      borderColor: '#000000',
      borderWidth: 1,
      paddingTop: 2,
      opacity: '0.8',
      color: '#000000',
    },
    logoContainer: {
      bottom: '15%',
    },
    logo: {
      width: width * 0.1,
      height: height * 0.1,
      transform: [{scale: 2.55}],
      left: '18%',
    },
    extrasContainer: {
      flexDirection: 'row',
      width: width * 0.28,
      justifyContent: 'center',
    },
    extras: {
      color: '#FFFFFF',
      marginBottom: 5,
    },
    icons: {
      color: '#FFFFFF',
      top: '1.5%',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      height: '100%',
      width: '100%',
    },
    modalView: {
      alignItems: 'center',
      elevation: 5,
      height: '100%',
      width: '100%',
    },
    backgroundVideo: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: '100%',
      height: '100%',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
    },
    video: {
      alignSelf: 'center',
      width: '100%',
      height: '100%',
    },
  });

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <ImageBackground
      imageStyle={{opacity: 0.3}}
      source={{
        uri: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
      }}
      style={styles.backgroundImage}>
      <View style={styles.mainContainer}>
        <View style={styles.posterContainer}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
            }}
            style={styles.poster}
            resizeMode="contain"
          />
        </View>
        <View style={styles.informationContainer}>
          <View style={styles.logoContainer}>
            {movie.images.logos.length !== 0 && (
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/original${
                    movie.images.logos[0].file_path.includes('.svg')
                      ? movie.images.logos[0].file_path.replace('.svg', '.png')
                      : movie.images.logos[0].file_path
                  }`,
                }}
                style={styles.logo}
                resizeMode="contain"
              />
            )}
            {movie.images.logos.length === 0 && (
              <Text style={{color: '#FFFFFF'}}>{movie.title}</Text>
            )}
          </View>
          <View style={styles.extrasContainer}>
            <Icon name="calendar-outline" style={styles.icons} />
            <Text style={styles.extras}>
              {' '}
              {movie.release_date.slice(0, 4)} •{' '}
            </Text>
            <Icon name="clock-time-four-outline" style={styles.icons} />
            <Text style={styles.extras}>
              {' '}
              {Math.floor(movie.runtime / 60)}h{movie.runtime % 60}m •{' '}
            </Text>
            <Icon name="star" style={styles.icons} />
            <Text style={styles.extras}> {movie.vote_average}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Stream', {
                  tmdb_id: movie.id,
                  isShow: false,
                  mediaTitle: movie.title,
                  mediaYear: movie.release_date.slice(0, 4),
                });
              }}
              style={styles.button}
              activeOpacity={0.7}
              disabled={!movie.available ? true : false}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignContent: 'center',
                }}>
                <Icon
                  style={{
                    flexDirection: 'column',
                    color: '#000000',
                    fontSize: width * 0.0197,
                  }}
                  name={!movie.available ? 'eye-off' : 'play-circle'}
                />
                <Text
                  style={{
                    flexDirection: 'column',
                    color: '#000000',
                    fontSize: width * 0.0146,
                  }}>
                  {!movie.available ? 'Unavailable' : 'Stream'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {}}
              style={styles.button}
              activeOpacity={0.7}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignContent: 'center',
                }}>
                <Icon
                  style={{
                    flexDirection: 'column',
                    color: '#000000',
                    fontSize: width * 0.0197,
                  }}
                  name="video-vintage"
                />
                <Text
                  style={{
                    flexDirection: 'column',
                    color: '#000000',
                    fontSize: width * 0.0146,
                  }}>
                  {' '}
                  Trailer
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                watchlist
                  ? deleteWatchlist(movie.id, false)
                  : addWatchlist(movie.id, false);
                setWatchlist(!watchlist);
              }}
              style={styles.circleButton}
              activeOpacity={0.7}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignContent: 'center',
                }}>
                {!watchlist && (
                  <Icon
                    style={{
                      flexDirection: 'column',
                      color: '#000000',
                      fontSize: width * 0.0197,
                    }}
                    name="playlist-plus"
                  />
                )}
                {watchlist && (
                  <Icon
                    style={{
                      flexDirection: 'column',
                      color: '#000000',
                      fontSize: width * 0.0197,
                    }}
                    name="playlist-remove"
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.overviewContainer}>
            <Text style={styles.overview}>{movie.overview}</Text>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}>
          <View style={styles.container}>
            <View style={styles.container}>
              <Video
                ref={video}
                style={styles.video}
                source={{
                  uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
                }}
                useNativeControls
                resizeMode="contain"
                isLooping
                onPlaybackStatusUpdate={status => setStatus(() => status)}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

export default MovieScreen;
