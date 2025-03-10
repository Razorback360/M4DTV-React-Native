import React, { useState, useRef } from 'react';
import { useWindowDimensions, Text, View, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { getWatchlist } from "../utils/Requests";
import GenreResults from '../components/GenreResults';
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";

const WatchlistScreen = ({ navigation }) => {
    const inputRef = useRef(null);
    const [isLoadingWatchlist, setLoadingWatchlist] = useState(true);
    const [watchlist, setWatchlist] = useState(null);
    const [searchTerm, setSearchTerm] = useState(null);


    if (!watchlist) {
        getWatchlist().then((data) => {
            setWatchlist(data);
            setLoadingWatchlist(false);
        });
    }

    const size = useWindowDimensions();
    const width = size.width;
    const height = size.height;


    const styles = StyleSheet.create({
        tinyLogo: {
            width: width * 0.3,
            height: height * 0.3,
            borderRadius: 10,
            margin: 10
        },
        headerText: {
            margin: "auto",
            fontSize: width * 0.017,
            color: "#FFFFFF"
        },
        searchBar: {
            width: "40%",
            backgroundColor: "#2D2F3E",
            borderRadius: 5,
            margin: 10,
            padding: 2,
            paddingLeft: 5,
            color: "#FFFFFF",
            alignSelf: "flex-end"

        },
        icon: {
            position: "absolute",
            color: "#FFFFFF",
            right: "2%",
            top: "25%",
            fontSize: width * 0.0261
        },
        navView: {
            flexDirection: 'row',
            alignSelf: "stretch"
        },
        textStyle: {
            marginLeft: 10,
            marginTop: 10,
            color: "#FFFFFF",
            fontSize: width * 0.021,
        },
        navComp: {
            flexDirection: 'row',
        },
        icons: {
            bottom: "40%"
        }
    });

    if (isLoadingWatchlist) {
        return (<View>
            <ActivityIndicator></ActivityIndicator>
        </View>)
    }
    return (
        <LinearGradient
            colors={['#000000', '#050227']}
            style={{
                flex: 1,
            }}>
            <View style={styles.navView}>
                <TouchableOpacity onPress={() => {
                    navigation.navigate("Movies")
                }} hasTVPreferredFocus={true}>
                    <Text style={styles.textStyle}>   Movies  </Text>
                    <Icon name={"movie"} color={"#ffffff"} size={width * 0.021} style={styles.icons} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    navigation.navigate("Shows")
                }}>
                    <Text style={styles.textStyle}>   TV  </Text>
                    <Icon name={"tv"} color={"#ffffff"} size={width * 0.021} style={styles.icons} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.textStyle}>   Watchlist  </Text>
                    <Icon name={"format-list-bulleted"} color={"#ffffff"} size={width * 0.021} style={styles.icons} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    navigation.navigate("History")
                }}>
                    <Text style={styles.textStyle}>   History</Text>
                    <Icon name={"access-time"} color={"#ffffff"} size={width * 0.021} style={styles.icons} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { inputRef.current.focus() }} activeOpacity={0.6} style={{ width: "62%" }}>
                    <TextInput ref={inputRef} style={styles.searchBar} editable placeholder="Search" placeholderTextColor="#ffffff" onSubmitEditing={() => {
                        navigation.navigate("Search", { search_term: searchTerm })
                    }} onChangeText={(data) => {
                        setSearchTerm(data)
                    }}></TextInput>
                    <Icon name="search" style={styles.icon}></Icon>
                </TouchableOpacity>
            </View>
            <GenreResults data={watchlist} imagestyle={styles.tinyLogo} onEndReached={(data) => { }} />
        </LinearGradient>);
};


export default WatchlistScreen;
