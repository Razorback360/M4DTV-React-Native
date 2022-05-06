import React, { useState, useRef } from 'react';
import { useWindowDimensions, Text, View, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { getSearchResults } from "../utils/Requests";
import { storeUser, retrieveUser } from "../utils/Storage";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import GenreResults from '../components/GenreResults';

const SearchScreen = ({ navigation,route }) => {
    const inputRef = useRef(null);
    const { search_term } = route.params;
    const [query, setQuery] = useState(search_term);
    const [newQuery, setNewQuery] = useState(false)
    const [results, setResults] = useState(null);
    const [endReached, setEndReached] = useState(false);
    const [alreadySearched, setAlreadySearched] = useState(false)
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
            margin: 10
        },
        headerText: {
            margin: "auto",
            fontSize: width * 0.017,
            color: "#FFFFFF"
        },
        searchBar: {
            width: "100%",
            backgroundColor: "#2D2F3E",
            borderRadius: 5,
            marginTop: 10,
            padding: 2,
            paddingLeft: 5,
            color: "#FFFFFF",

        },
        icon: {
            position: "absolute",
            color: "#FFFFFF",
            right: "0.5%",
            top: "30%",
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

    if(query && !alreadySearched || endReached){
        getSearchResults(query, endReached ? page + 1 : 1).then((data) => {
            setResults(!endReached? data.results : results.concat(data.results))
            !endReached ? setAlreadySearched(true): null
            endReached ? setPage(page+1) : null
            endReached ? setEndReached(false): null
        })
    }

    return (
        <LinearGradient
            colors={['#000000', '#050227']}
            style={{
                flex: 1,
            }}>
            <TouchableOpacity onPress={() => { inputRef.current.focus() }} activeOpacity={0.6} >
                <TextInput ref={inputRef} style={styles.searchBar} editable placeholder="Search" placeholderTextColor="#ffffff" 
                onChangeText={(data) => {
                    setQuery(data)
                    setTimeout(function() {
                        setAlreadySearched(false)
                    }, 2000);
                }}>{search_term}</TextInput>
                <Icon name="search" style={styles.icon}></Icon>
            </TouchableOpacity>
            <GenreResults data={results} imagestyle={styles.tinyLogo} onEndReached={(data) => {
                setEndReached(data)
            }}></GenreResults>
            {endReached && <ActivityIndicator></ActivityIndicator> || !alreadySearched && <ActivityIndicator></ActivityIndicator>}
        </LinearGradient>);
};


export default SearchScreen;
