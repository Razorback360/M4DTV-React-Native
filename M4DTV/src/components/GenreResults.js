import PropTypes from "prop-types";
import React, { PureComponent } from 'react';
import { Image, TouchableOpacity, FlatList, Text, View, Dimensions } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';

class GenreResults extends PureComponent {
    static propTypes = {
        data: PropTypes.array.isRequired,
        imagestyle: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.number,
            PropTypes.shape({}),
        ]).isRequired,
    }
    render = () => {
        const { data, navigation, imagestyle } = this.props;
        const width = Dimensions.get('window').width;
        const height = Dimensions.get('window').height;
        const AddItem = ({ item }) => {
            if (item.media_type !== "person" && Object.keys(item).includes("media_type")) {
                return (<TouchableOpacity activeOpacity={0.5} onPress={() => {
                    navigation.navigate(item.media_type == "movie" ? 'Movie' : "tv", { id: item.id })
                }}>
                    <Image
                        style={imagestyle}
                        source={{
                            uri: item && item.backdrop_path !== null && item.backdrop_path !== "null" && !item.backdrop_path.includes("tvdb") && !item.backdrop_path.includes("tmdb") ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : item && item.backdrop_path && item.backdrop_path.includes("tvdb") ? item.backdrop_path : item && item.backdrop_path && item.backdrop_path.includes("tmdb") ? item.backdrop_path : "https://cdn.discordapp.com/attachments/836568944751804466/950428265514950696/th.png",
                        }}
                    />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text style={{ color: "#ffffff", margin: "auto", marginLeft: 15, flexDirection: 'row' }}>{item.media_type == "movie" ? item.title.length > 27 ? item.title.slice(0, 26) : item.title : item.name.length > 27 ? item.name.slice(0, 26) : item.name}</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Icon name={item.media_type == "movie" ? "movie" : "tv"} color={"#ffffff"} size={width * 0.0261} />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text style={{ color: "#acacac", marginLeft: 15, flexDirection: 'row', fontSize: width * 0.0127 }}>{item.media_type == "movie" ? item.release_date ? item.release_date.slice(0, 4) : "Unknown" : item.first_air_date ? item.first_air_date.slice(0, 4) : "Unknown"}</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Icon name="star" color={"#acacac"} size={width * 0.0127} style={{ top: 2 }} />
                            <Text style={{ color: "#acacac", fontSize: width * 0.0127 }}> {item.vote_average}</Text>
                        </View>
                    </View>
                </TouchableOpacity>)

            }

            else if (!Object.keys(item).includes("media_type")) {
                return (<TouchableOpacity activeOpacity={0.5} onPress={() => {
                    navigation.navigate(Object.keys(item).includes("release_date") ? 'Movie' : "tv", { id: item.id })
                }}>
                    <Image
                        style={imagestyle}
                        source={{
                            uri: item && item.backdrop_path && !item.backdrop_path.includes("tvdb") && !item.backdrop_path.includes("tmdb") ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : item && item.backdrop_path && item.backdrop_path.includes("tvdb") ? item.backdrop_path : item && item.backdrop_path && item.backdrop_path.includes("tmdb") ? backdrop_path : "https://cdn.discordapp.com/attachments/836568944751804466/950428265514950696/th.png",
                        }}
                    />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text style={{ color: "#ffffff", margin: "auto", marginLeft: 15, flexDirection: 'row' }}>{Object.keys(item).includes("release_date") ? item.title.length > 27 ? item.title.slice(0, 26) : item.title : item.name.length > 27 ? item.name.slice(0, 26) : item.name}</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Icon name={Object.keys(item).includes("release_date") ? "movie" : "tv"} color={"#ffffff"} size={width * 0.0261} />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text style={{ color: "#acacac", marginLeft: 15, flexDirection: 'row', fontSize: width * 0.0127 }}>{Object.keys(item).includes("release_date") ? item.release_date ? item.release_date.slice(0, 4) : "Unknown" : item.first_air_date ? item.first_air_date.slice(0, 4) : "Unknown"}</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Icon name="star" color={"#acacac"} size={width * 0.0127} style={{ top: 2 }} />
                            <Text style={{ color: "#acacac", fontSize: width * 0.0127 }}> {item.vote_average}</Text>
                        </View>
                    </View>
                </TouchableOpacity>)
            }

        }
        return (
            <FlatList
                data={data}
                renderItem={AddItem}
                numColumns={3}
                keyExtractor={item => item.id}
                onEndReached={() => {
                    this.props.onEndReached(true)
                }}
            />
        );
    }
}

export default function (props) {
    const navigation = useNavigation();

    return <GenreResults {...props} navigation={navigation} />;
}