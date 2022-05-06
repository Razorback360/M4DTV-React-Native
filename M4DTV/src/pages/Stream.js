import React, { useState, useRef } from 'react';
import {
    useWindowDimensions,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Modal,
    useTVEventHandler
} from 'react-native';
import { getStreamMovie, getStreamTV } from "../utils/Requests";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Video } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';
import * as Progress from 'react-native-progress';
import Subtitles from "react-native-subtitles"

const StreamScreen = ({ navigation, route }) => {
    const { tmdb_id, isShow, tvdb_id, season, episode } = route.params;
    const [isLoadingParams, setisLoadingParams] = useState(true) // Check to see if parameters for stream are loaded or not yet
    const [isLoadingStream, setIsLoadingStream] = useState(true) // Check to see if stream is loaded or not yet
    const video = useRef(null); // Used to control Video player.
    const [settingsVisible, setSettingVisible] = useState(false) // Determines if settings menu is visible or not
    const [serversVisible, setServersVisible] = useState(false) // Determines if servers submenu is visible or not
    const [isdisabledOpacity, setIsDisabledOpacity] = useState(false) // :shrug: Later use
    const [isPaused, setIsPaused] = useState(false) // Determines if video player is paused
    const [key, setKey] = useState(null) // Sets streaming key to get the stream from the server
    const [tutorialVisible, setTutorialVisible] = useState(true)
    const [status, setStatus] = useState({}) // Gets video status for use with video overlay
    const [progress, setProgress] = useState(0); // Video progress
    const [statusOverlayVisible, setStatusOverlayVisible] = useState(0) // Sets if progress overlay is visible or not

    // Remote control keybinds for special interaction with video player. (Improvise adapt overcome)!
    const myTVEventHandler = (evt) => {
        if (!tutorialVisible) {

            // Show video player settings.
            if (evt.eventType === "down" && !settingsVisible) {
                setSettingVisible(true)
                if (isPaused === false) {
                    video.current.pauseAsync()
                    setIsPaused(true)
                }
            }

            // Show/Hide video player progress.
            else if (evt.eventType === "up" && !settingsVisible) {
                statusOverlayVisible === 1 ? setStatusOverlayVisible(0) : setStatusOverlayVisible(1)
            }

            // Rewind 10 seconds from current position.
            else if (evt.eventType === "left" && !settingsVisible) {
                video.current.getStatusAsync().then((data) => {
                    video.current.setPositionAsync(data.positionMillis - 10000).then(() => { })
                })
            }

            // Fast forward 10 seconds from current position.
            else if (evt.eventType === "right" && !settingsVisible) {
                video.current.getStatusAsync().then((data) => {
                    video.current.setPositionAsync(data.positionMillis + 10000).then(() => { })
                })
            }

            // Play/Pause video player (Select button).
            else if (evt.eventType === "select" && !settingsVisible) {
                isPaused === true ? video.current.playAsync() : video.current.pauseAsync()
                isPaused === true ? setIsPaused(false) : setIsPaused(true)
            }

            // Play/Pause video player (Play/Pause button).
            else if (evt.eventType === "playPause" && !settingsVisible) {
                isPaused === true ? video.current.playAsync() : video.current.pauseAsync()
                isPaused === true ? setIsPaused(false) : setIsPaused(true)
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
            flexDirection: "row"
        },
        button: {
            width: width * 0.1,
            height: height * 0.05,
            borderRadius: 100,
            backgroundColor: '#FFFFFF',
            borderColor: "#000000",
            borderWidth: 1,
            paddingTop: 2,
            opacity: "0.8",
            color: "#000000",
            marginRight: 11
        },
        video: {
            alignSelf: 'center',
            width: "100%",
            height: "100%",
        },
        buttons: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        settingsMain: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: '#282828',
            marginTop: "36%"
        },
        settingSection: {
            flexDirection: 'row',
            alignContent: 'center',
            borderColor: "#282828",
            borderTopWidth: 1,
            margin: 10
        },
        settingSectionText: {
            alignContent: "center",
            color: "#FFFFFF",
            fontSize: width * 0.0314
        },
        settingSectionIcon: {
            alignContent: "center",
            color: "#FFFFFF",
            marginTop: 5,
            fontSize: width * 0.0314
        },
        overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            top: "90%",
            opacity: statusOverlayVisible,
            position: "absolute",
            left: "4%"
        }
    });

    if (tutorialVisible) {
        return (
            <View style={styles.containerTut}>
                <View style={{ flexDirection: "column", width: "50%", height: "100%" }}>
                    <Text>Controls Tutorial:</Text>
                    <Image source={require("../static/controls.png")} style={{ width: "120%", height: "85%" }}></Image>
                </View>
                <View style={{ flexDirection: "column", width: "50%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => { setTutorialVisible(false) }} style={styles.button} activeOpacity={0.7}>
                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ flexDirection: 'column', color: "#000000", fontSize: width * 0.0146 }}> Got It!</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    if (isShow && isLoadingParams && isLoadingStream && !tutorialVisible) {
        const { season, episode } = route.params;
        setisLoadingParams(false)
        setIsLoadingStream(false)
        getStreamTV(tvdb_id, season, episode).then((res) => {
            if ("detail" in res) {
                navigation.goBack()
            }
            setKey(res.key)
        })
    } else if (isLoadingStream && !isShow && !tutorialVisible) {
        setIsLoadingStream(false)
        setisLoadingParams(false)
        getStreamMovie(tmdb_id).then((res) => {
            if ("detail" in res) {
                navigation.goBack()
            }
            setKey(res.key)
        })
    }

    if (isLoadingStream === true && !tutorialVisible) {
        return (<View>
            <ActivityIndicator></ActivityIndicator>
        </View>)
    }

    // The 3 stream servers, EU is on by default, may use user configured default later on
    const EU = `https://eu.movies4discord.xyz/?viewkey=${key}`
    const AS = `https://as.movies4discord.xyz/?viewkey=${key}`
    const US = `https://us.movies4discord.xyz/?viewkey=${key}`

    function convertMsToTime(milliseconds) {
        function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
        }
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);

        seconds = seconds % 60;
        minutes = minutes % 60;

        return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
            seconds,
        )}`;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => { }} disabled={isdisabledOpacity} activeOpacity={1} hasTVPreferredFocus>
                <Video
                    ref={video}
                    style={styles.video}
                    source={{
                        uri: EU,
                    }}
                    useNativeControls
                    shouldPlay={true}
                    resizeMode="contain"
                    onPlaybackStatusUpdate={(status) => {
                        setStatus(status)
                        setProgress(status.positionMillis / status.durationMillis)
                    }} />
            </TouchableOpacity>
            <View style={styles.overlay}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                }}>
                    <Text style={{ color: "#FFFFFF" }}>{convertMsToTime(status.positionMillis)}</Text>
                    <Progress.Bar width={width * 0.8} borderWidth={1} unfilledColor={"#343434"} borderRadius={0} progress={parseFloat(progress.toFixed(2))} />
                    <Text style={{ color: "#FFFFFF" }}>{convertMsToTime(status.durationMillis)}</Text>
                </View>
            </View>
            <Modal animationType="slide" transparent={true} visible={settingsVisible} onRequestClose={() => {
                setSettingVisible(false)
                setIsPaused(false)
                video.current.playAsync()
            }}>
                <View style={styles.settingsMain}>
                    <TouchableOpacity onPress={() => {
                        setServersVisible(true)
                    }}>
                        <View style={styles.settingSection}>
                            <Icon name="location-on" style={styles.settingSectionIcon}></Icon>
                            <Text style={styles.settingSectionText}> Servers</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View style={styles.settingSection}>
                            <Icon name="subtitles" style={styles.settingSectionIcon}></Icon>
                            <Text style={styles.settingSectionText}> Subtitles</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View style={styles.settingSection}>
                            <Text style={styles.settingSectionText}>Quality</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal animationType="slide" transparent={true} visible={serversVisible} onRequestClose={() => {
                setServersVisible(false)
            }}>
                <View style={styles.settingsMain}>
                    <TouchableOpacity onPress={() => {
                        video.current.getStatusAsync().then((data) => {
                            video.current.unloadAsync().then(() => {
                                video.current.loadAsync({ uri: AS }, { positionMillis: data.positionMillis, shouldPlay: true })
                            })
                        })
                    }}>
                        <View style={styles.settingSection}>
                            <Text style={styles.settingSectionText}>AS</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        video.current.getStatusAsync().then((data) => {
                            video.current.unloadAsync().then(() => {
                                video.current.loadAsync({ uri: EU }, { positionMillis: data.positionMillis, shouldPlay: true })
                            })
                        })
                    }}>
                        <View style={styles.settingSection}>
                            <Text style={styles.settingSectionText}>EU (Default)</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        video.current.getStatusAsync().then((data) => {
                            video.current.unloadAsync().then(() => {
                                video.current.loadAsync({ uri: US }, { positionMillis: data.positionMillis, shouldPlay: true })
                            })
                        })
                    }}>
                        <View style={styles.settingSection}>
                            <Text style={styles.settingSectionText}>US</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View >
    )
};



export default StreamScreen;
