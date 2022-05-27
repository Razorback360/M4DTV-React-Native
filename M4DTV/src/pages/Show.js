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
import {getShow, addWatchlist, deleteWatchlist} from '../utils/Requests';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Video} from 'expo-av';
import EpisodeList from '../components/EpisodeList';
import SeasonList from '../components/SeasonList';

const ShowScreen = ({navigation, route}) => {
  const {id} = route.params;
  const [isLoading, setLoading] = useState(true);
  const [show, setShow] = useState(null);
  const [season, setSeason] = useState(1);
  const [streamModalVisible, setStreamModalVisible] = useState(false);
  const [trailerModalVisible, setTrailerModalVisible] = useState(false);
  const [testvar, setTestVar] = useState('no');
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [watchlist, setWatchlist] = useState(null);
  if (!show) {
    getShow(id).then(data => {
      setShow(data);
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
      backgroundColor: '#000000',
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
    modalView: {
      margin: 20,
      backgroundColor: 'rgba(0,0,0,0.01)',
      borderRadius: 20,
      padding: 35,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
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
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    video: {
      alignSelf: 'center',
      width: '100%',
      height: '100%',
    },
    tinyLogo: {
      width: width * 0.3,
      height: height * 0.3,
      borderRadius: 10,
      margin: 10,
      borderColor: '#FFFFFF',
      borderWidth: 1,
    },
    season: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255, 0.6)',
      marginBottom: 10,
      borderRadius: 5,
      paddingLeft: 5,
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
      source={{uri: `https://image.tmdb.org/t/p/original${show.backdrop_path}`}}
      style={styles.backgroundImage}>
      <View style={styles.mainContainer}>
        <View style={styles.posterContainer}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/original${show.poster_path}`,
            }}
            style={styles.poster}
            resizeMode="contain"></Image>
        </View>
        <View style={styles.informationContainer}>
          <View style={styles.logoContainer}>
            {show.logo && (
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/original${
                    show.logo.includes('.svg')
                      ? show.logo.replace('.svg', '.png')
                      : show.logo
                  }`,
                }}
                style={styles.logo}
                resizeMode="contain"></Image>
            )}
            {!show.logo && <Text style={{color: '#FFFFFF'}}>{show.name}</Text>}
          </View>
          <View style={styles.extrasContainer}>
            <Icon name="calendar-outline" style={styles.icons}></Icon>
            <Text style={styles.extras}>
              {' '}
              {show.first_air_date.slice(0, 4)} •{' '}
            </Text>
            <Icon name="clock-time-four-outline" style={styles.icons}></Icon>
            <Text style={styles.extras}>
              {' '}
              {Math.floor(show.runtime / 60)}h{show.runtime % 60}m each •{' '}
            </Text>
            <Icon name="star" style={styles.icons}></Icon>
            <Text style={styles.extras}> {show.vote_average}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                setStreamModalVisible(true);
              }}
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
                  name="play-circle"></Icon>
                <Text
                  style={{
                    flexDirection: 'column',
                    color: '#000000',
                    fontSize: width * 0.0146,
                  }}>
                  Stream
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTrailerModalVisible(true);
              }}
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
                  name="video-vintage"></Icon>
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
                watchlist ? deleteWatchlist(id, true) : addWatchlist(id, true);
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
                    name="playlist-plus"></Icon>
                )}
                {watchlist && (
                  <Icon
                    style={{
                      flexDirection: 'column',
                      color: '#000000',
                      fontSize: width * 0.0197,
                    }}
                    name="playlist-remove"></Icon>
                )}
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.overviewContainer}>
            <Text style={styles.overview}>{show.overview}</Text>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={trailerModalVisible}
          onRequestClose={() => {
            setTrailerModalVisible(false);
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
        <Modal
          animationType="slide"
          transparent={false}
          visible={streamModalVisible}
          onRequestClose={() => {
            setStreamModalVisible(false);
          }}>
          <ImageBackground
            imageStyle={{opacity: 0.3}}
            source={{
              uri: `https://image.tmdb.org/t/p/original${show.backdrop_path}`,
            }}
            style={styles.backgroundImage}>
            <View style={styles.modalView}>
              <View style={styles.season}>
                <Text
                  style={{color: '#FFFFFF', fontSize: width * 0.021, top: 10}}>
                  Seasons:{' '}
                </Text>
                <SeasonList
                  data={show.seasons}
                  onChange={data => {
                    setSeason(data);
                  }}></SeasonList>
              </View>
              <EpisodeList
                data={show.episodes.filter(s => s.seasonNumber === season)}
                imagestyle={styles.tinyLogo}
                season={season}
                onChange={data => {
                  setStreamModalVisible(data);
                }}></EpisodeList>
            </View>
          </ImageBackground>
        </Modal>
      </View>
    </ImageBackground>
  );
};

export default ShowScreen;
