/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef} from 'react';
import {
  useWindowDimensions,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  useTVEventHandler,
  ScrollView,
} from 'react-native';
import {
  getStreamMovie,
  getStreamTV,
  addHistory,
  getSingleHistory,
} from '../utils/Requests';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Video} from 'expo-av';
import {useKeepAwake} from 'expo-keep-awake';
import * as Progress from 'react-native-progress';
import Subtitles from '../utils/Subtitles';

const StreamScreen = ({navigation, route}) => {
  const {tmdb_id, isShow, tvdb_id, season, episode, mediaTitle, mediaYear} =
    route.params;
  const [isLoadingParams, setisLoadingParams] = useState(true); // Check to see if parameters for stream are loaded or not yet
  const [isLoadingStream, setIsLoadingStream] = useState(true); // Check to see if stream is loaded or not yet
  const video = useRef(null); // Used to control Video player.
  const [settingsVisible, setSettingVisible] = useState(false); // Determines if settings menu is visible or not
  const [serversVisible, setServersVisible] = useState(false); // Determines if servers submenu is visible or not
  const [isdisabledOpacity, setIsDisabledOpacity] = useState(false); // :shrug: Later use
  const [isPaused, setIsPaused] = useState(false); // Determines if video player is paused
  const [key, setKey] = useState(null); // Sets streaming key to get the stream from the server
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [status, setStatus] = useState({}); // Gets video status for use with video overlay
  const [progress, setProgress] = useState(0); // Video progress
  const [statusOverlayVisible, setStatusOverlayVisible] = useState(0); // Sets if progress overlay is visible or not
  const [durationSet, setDurationSet] = useState(false);
  const [seekingMultiplier, setSeekingMultiplier] = useState(1);
  const [isMenuVisible, setIsMenuVisible] = useState(false); // checks if any menu is visible. used to change subtitles position when a menu is visible (totaly useless)
  const [hasSeeked, setHasSeeked] = useState(0); // Checks if video is seeked; used to help sync subtitles
  const [subtitlesVisible, setSubtitlesVisible] = useState(true); // Checks and Determines subtitle visibility
  const [subtitlesColor, setSubtitlesColor] = useState('#FFFFFF'); // Checks and Determines subtitles' color
  const [subtitlesMenuVisible, setSubtitlesMenuVisible] = useState(false); // Checks and Determines if Subtitles submenu is visible or not
  const [subtitlesSizeMultiplier, setSubtitlesSizeMultiplier] = useState(0.02); // just read the name lmao
  const [subtitleSizeMenuVisible, setSubtitleSizeMenuVisible] = useState(false); // Checks and Determines if Subtitles' size submenu is visible or not
  const [subtitlesColorsMenuVisible, setSubtitlesColorsMenuVisible] =
    useState(false); // Checks and Determines if Subtitles' colors' submenu is visible or not
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false); // Checks and Determines if options submenu is visible or not
  const [seekingMultiplierMenuVisible, setSeekingMultiplierMenuVisible] =
    useState(false); // Checks and Determines if seekingMultiplier submenu is visible or not

  // Remote control keybinds for special interaction with video player. (Improvise adapt overcome)!
  const myTVEventHandler = evt => {
    if (!tutorialVisible) {
      // Show video player settings.
      if (evt.eventType === 'down' && !settingsVisible) {
        setSettingVisible(true);
        setIsMenuVisible(true);
        if (isPaused === false) {
          video.current.pauseAsync();
          setIsPaused(true);
        }
      }

      // Show/Hide video player progress.
      else if (evt.eventType === 'up' && !settingsVisible) {
        statusOverlayVisible === 1
          ? setStatusOverlayVisible(0)
          : setStatusOverlayVisible(1);
      }

      // Rewind 10 seconds from current position.
      else if (evt.eventType === 'left' && !settingsVisible) {
        video.current.getStatusAsync().then(data => {
          video.current.pauseAsync();
          setIsPaused(true);
          video.current
            .setPositionAsync(data.positionMillis - 10000 * seekingMultiplier)
            .then(() => {});
          video.current.playAsync();
          setIsPaused(false);
        });
        setHasSeeked(hasSeeked + 1);
      }

      // Fast forward 10 seconds from current position.
      else if (evt.eventType === 'right' && !settingsVisible) {
        video.current.getStatusAsync().then(data => {
          video.current.pauseAsync();
          setIsPaused(true);
          video.current
            .setPositionAsync(data.positionMillis + 10000 * seekingMultiplier)
            .then(() => {});
          video.current.playAsync();
          setIsPaused(false);
        });
        setHasSeeked(hasSeeked + 1);
      }

      // Play/Pause video player (Select button).
      else if (evt.eventType === 'select' && !settingsVisible) {
        isPaused === true
          ? video.current.playAsync()
          : video.current.pauseAsync();
        isPaused === true ? setIsPaused(false) : setIsPaused(true);
      }

      // Play/Pause video player (Play/Pause button).
      else if (evt.eventType === 'playPause' && !settingsVisible) {
        isPaused === true
          ? video.current.playAsync()
          : video.current.pauseAsync();
        isPaused === true ? setIsPaused(false) : setIsPaused(true);
      }
    }
  };

  useTVEventHandler(myTVEventHandler);
  useKeepAwake();
  const size = useWindowDimensions();
  const width = size.width;
  const height = size.height;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#000000',
    },
    containerTut: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#000000',
      flexDirection: 'row',
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
    video: {
      alignSelf: 'center',
      width: '100%',
      height: '100%',
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingsMain: {
      flex: 1,
      flexShrink: 1,
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: '#050227',
      padding: 10,
      //marginTop: '36%',
      maxHeight: height * 0.45,
      //minHeight: '65%',
      minWidth: width * 0.3,
      borderWidth: 1,
      //borderTopLeftRadius: 20,
      //borderTopRightRadius: 20,
      borderRadius: 10,
      position: 'absolute',
      bottom: '0.1%',
    },
    settingSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
      borderColor: '#282828',
      borderTopWidth: 1,
      padding: 10,
      paddingHorizontal: 40,
    },
    settingSectionText: {
      alignContent: 'center',
      color: '#FFFFFF',
      fontSize: width * 0.02,
    },
    settingSectionIcon: {
      alignContent: 'center',
      color: '#FFFFFF',
      marginTop: 5,
      fontSize: width * 0.02,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      top: '90%',
      opacity: statusOverlayVisible,
      position: 'absolute',
      left: '4%',
    },
    subtitlesContainerStyle: {
      // a view that is as wide as the screen and as tall as the text.
      // is located in the lower half of the screen
      // responsible mainly to hold the subtitles
      // some padding and other things half of them are probably useless
      // dont ask it just works
      flexDirection: 'row',
      flex: 1,
      justifyContent: 'center',
      width: '100%',
      alignContent: 'center',
      bottom: isMenuVisible ? '45%' : '10%',
      position: 'absolute',
      paddingHorizontal: '30%',
      marginBottom: 10,
    },
    subtitlesTextStyle: {
      textAlign: 'center',
      color: subtitlesColor,
      fontSize: width * subtitlesSizeMultiplier,
      padding: 5,
      textShadowColor: '#000000',
      textShadowOffset: {width: 1, height: 1},
      textShadowRadius: 5,
    },
  });

  if (tutorialVisible) {
    return (
      <View style={styles.containerTut}>
        <View style={{flexDirection: 'column', width: '50%', height: '100%'}}>
          <Text>Controls Tutorial:</Text>
          <Image
            source={require('../static/controls.png')}
            style={{width: '120%', height: '85%'}}
          />
        </View>
        <View
          style={{
            flexDirection: 'column',
            width: '50%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              setTutorialVisible(false);
            }}
            style={styles.button}
            activeOpacity={0.7}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text
                style={{
                  flexDirection: 'column',
                  color: '#000000',
                  fontSize: width * 0.0146,
                }}>
                {' '}
                Got It!
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isShow && isLoadingParams && isLoadingStream && !tutorialVisible) {
    setisLoadingParams(false);
    setIsLoadingStream(false);
    getStreamTV(tvdb_id, season, episode).then(res => {
      if ('detail' in res) {
        navigation.goBack();
      }
      setKey(res.key);
    });
  } else if (isLoadingStream && !isShow && !tutorialVisible) {
    setIsLoadingStream(false);
    setisLoadingParams(false);
    getStreamMovie(tmdb_id).then(res => {
      if ('detail' in res) {
        navigation.goBack();
      }
      setKey(res.key);
    });
  }

  if (isLoadingStream === true && !tutorialVisible) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  // The 3 stream servers, EU is on by default, may use user configured default later on
  const EU = `https://eu.movies4discord.xyz/?viewkey=${key}`;
  const AS = `https://as.movies4discord.xyz/?viewkey=${key}`;
  const US = `https://us.movies4discord.xyz/?viewkey=${key}`;

  const convertMsToTime = milliseconds => {
    const padTo2Digits = num => {
      return num.toString().padStart(2, '0');
    };
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
      seconds,
    )}`;
  };
  const modifyHistory = async () => {
    if (isShow) {
      await addHistory(tvdb_id, tmdb_id, season, episode, progress * 100);
    } else {
      await addHistory(0, tmdb_id, 0, 0, progress * 100);
    }
  };

  if (status.isLoaded && !durationSet && !tutorialVisible) {
    if (isShow) {
      getSingleHistory(tvdb_id, tmdb_id, season, episode).then(data => {
        data.percentage !== null
          ? video.current
              .setPositionAsync(status.durationMillis * (data.percentage / 100))
              .then(() => {})
          : null;
        setDurationSet(true);
      });
    } else {
      getSingleHistory(0, tmdb_id, 0, 0).then(data => {
        data.percentage !== null
          ? video.current
              .setPositionAsync(status.durationMillis * (data.percentage / 100))
              .then(() => {})
          : null;
        setDurationSet(true);
      });
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {}}
        disabled={isdisabledOpacity}
        activeOpacity={1}
        hasTVPreferredFocus={true}>
        <Video
          ref={video}
          style={styles.video}
          source={{
            uri: EU,
          }}
          useNativeControls={false}
          shouldPlay={true}
          resizeMode="contain"
          onPlaybackStatusUpdate={async Status => {
            setStatus(() => Status);
            setProgress(Status.positionMillis / Status.durationMillis);
            if (durationSet && !tutorialVisible) {
              await modifyHistory();
            }
          }}
        />
      </TouchableOpacity>
      <View style={styles.subtitlesContainerStyle}>
        {subtitlesVisible && (
          <Subtitles // here lies the subtitles file please look here while searching for the subtitle file
            currentTime={status.positionMillis}
            mediaTitle={mediaTitle}
            mediaYear={mediaYear}
            isShow={isShow}
            hasSeeked={hasSeeked}
            textStyle={styles.subtitlesTextStyle}
            season={season}
            episode={episode}
          />
        )}
      </View>
      <View style={styles.overlay}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          }}>
          <Text style={{color: '#FFFFFF'}}>
            {convertMsToTime(status.positionMillis)}
          </Text>
          {!isNaN(progress) && (
            <Progress.Bar
              width={width * 0.8}
              borderWidth={1}
              unfilledColor={'#343434'}
              borderRadius={0}
              progress={parseFloat(progress.toFixed(2))}
            />
          )}
          <Text style={{color: '#FFFFFF'}}>
            {convertMsToTime(status.durationMillis)}
          </Text>
        </View>
      </View>
      <Modal // main menu used to access other submenus. also changes subtitles' position to enable better visibility
        animationType="slide"
        transparent={true}
        visible={settingsVisible}
        onRequestClose={() => {
          setSettingVisible(false);
          setIsPaused(false);
          setIsMenuVisible(false);
          video.current.playAsync();
        }}>
        <View style={styles.settingsMain}>
          <ScrollView>
            <TouchableOpacity
              onPress={() => {
                setServersVisible(true);
              }}>
              <View style={styles.settingSection}>
                <Icon name="location-on" style={styles.settingSectionIcon} />
                <Text style={styles.settingSectionText}> Servers</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesMenuVisible(true);
              }}>
              <View style={styles.settingSection}>
                <Icon name="subtitles" style={styles.settingSectionIcon} />
                <Text style={styles.settingSectionText}> Subtitles</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>Quality</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setOptionsMenuVisible(true);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>Options</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      <Modal // servers' submenu used to choose from different servers
        animationType="slide"
        transparent={true}
        visible={serversVisible}
        onRequestClose={() => {
          setServersVisible(false);
        }}>
        <View style={styles.settingsMain}>
          <ScrollView>
            <TouchableOpacity
              onPress={() => {
                video.current.getStatusAsync().then(data => {
                  video.current.unloadAsync().then(() => {
                    video.current.loadAsync(
                      {uri: AS},
                      {positionMillis: data.positionMillis, shouldPlay: true},
                    );
                  });
                });
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>AS</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                video.current.getStatusAsync().then(data => {
                  video.current.unloadAsync().then(() => {
                    video.current.loadAsync(
                      {uri: EU},
                      {positionMillis: data.positionMillis, shouldPlay: true},
                    );
                  });
                });
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>EU (Default)</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                video.current.getStatusAsync().then(data => {
                  video.current.unloadAsync().then(() => {
                    video.current.loadAsync(
                      {uri: US},
                      {positionMillis: data.positionMillis, shouldPlay: true},
                    );
                  });
                });
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>US</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      <Modal // subtitles submenu used to urn subtitles on and off, also used to access subtitles' color submenu and size submenu
        animationType="slide"
        transparent={true}
        visible={subtitlesMenuVisible}
        onRequestClose={() => {
          setSubtitlesMenuVisible(false);
        }}>
        <View style={styles.settingsMain}>
          <ScrollView>
            <TouchableOpacity
              onPress={() => {
                //turn subtitles on or off depending on subtitleVisible variable
                subtitlesVisible
                  ? setSubtitlesVisible(false)
                  : setSubtitlesVisible(true);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>
                  {subtitlesVisible //rename the button depending on subtitleVisible variable
                    ? 'turn subtitles off'
                    : 'turn subtitles on'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                //open subtitle size menu
                setSubtitleSizeMenuVisible(true);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>
                  change subtitle font size
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                // opens the subtitles' colors' submenu
                setSubtitlesColorsMenuVisible(true);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>
                  change subtitle font color
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      <Modal // subtitles' size submenu used to change subtitles font size. change Font size by 0.0025 level
        animationType="slide"
        transparent={true}
        visible={subtitleSizeMenuVisible}
        onRequestClose={() => {
          setSubtitleSizeMenuVisible(false);
        }}>
        <View style={styles.settingsMain}>
          <ScrollView>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesSizeMultiplier(0.02);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>20%</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesSizeMultiplier(0.0225);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>40%</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesSizeMultiplier(0.025);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>60%</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesSizeMultiplier(0.0275);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>80%</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesSizeMultiplier(0.03);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>100%</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      <Modal // subtitles' colors' submenu used to change subtitles' color
        animationType="slide"
        transparent={true}
        visible={subtitlesColorsMenuVisible}
        onRequestClose={() => {
          setSubtitlesColorsMenuVisible(false);
        }}>
        <View style={styles.settingsMain}>
          <ScrollView>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesColor('#FFFFFF');
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>white</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesColor('#00FFFF');
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>cyan</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesColor('#FF0000');
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>red</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesColor('#00F400');
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>green</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesColor('#FEFE00');
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>yellow</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesColor('#CA01CA');
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>magenta</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesColor('#0000CA');
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>blue</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSubtitlesColor('#CC7700');
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>ochre</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      <Modal // options submenu used to access seeking multiplier submenu
        animationType="slide"
        transparent={true}
        visible={optionsMenuVisible}
        onRequestClose={() => {
          setOptionsMenuVisible(false);
        }}>
        <View style={styles.settingsMain}>
          <ScrollView>
            <TouchableOpacity
              onPress={() => {
                setSeekingMultiplierMenuVisible(true);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>
                  change fast forward & rewind time
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      <Modal // seeking multiplier submenu used to change the seeking time
        animationType="slide"
        transparent={true}
        visible={seekingMultiplierMenuVisible}
        onRequestClose={() => {
          setSeekingMultiplierMenuVisible(false);
        }}>
        <View style={styles.settingsMain}>
          <ScrollView>
            <TouchableOpacity
              onPress={() => {
                setSeekingMultiplier(1);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>10s (boring)</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSeekingMultiplier(3);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>30s (boring)</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSeekingMultiplier(6);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>1m (boring)</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSeekingMultiplier(6.9);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>69s (nice)</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSeekingMultiplier(42);
              }}>
              <View style={styles.settingSection}>
                <Text style={styles.settingSectionText}>420s (nice)</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default StreamScreen;
