import PropTypes from "prop-types";
import React, { PureComponent } from 'react';
import { Image, TouchableOpacity, FlatList, Text, View, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

class EpisodeList extends PureComponent {
    static propTypes = {
        data: PropTypes.array.isRequired,
        imagestyle: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.number,
            PropTypes.shape({}),
        ]).isRequired,
        season: PropTypes.number.isRequired,
    }
    render = () => {
        const { data, imagestyle, navigation, season } = this.props;
        const width = Dimensions.get('window').width;
        const height = Dimensions.get('window').height;
        const AddItem = ({ item }) => {
            if (item.seasonNumber === season) {
                return (
                    <TouchableOpacity activeOpacity={0.5} onPress={() => {
                        if(item.available){
                            navigation.navigate("Stream", { tvdb_id: item.tvdb_id, season: item.seasonNumber, episode: item.episodeNumber, isShow: true, tmdb_id: item.tmdb_id})
                        }
                        this.props.onChange(false)
                    }} disabled={!item.available? true : false}>
                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: 'rgba(255,255,255, 0.5)', marginTop: 5, }}>
                            <View style={{ flexDirection: 'column' }}>
                                <Image
                                    style={imagestyle}
                                    source={{
                                        uri: item.image ?? "https://cdn.discordapp.com/attachments/836568944751804466/950428265514950696/th.png",
                                    }}
                                />
                            </View>
                            <View style={{ flexDirection: 'column', flexWrap: "wrap", flexShrink: 1 }}>
                                <Text style={{ color: "#ffffff", marginTop: 10, marginLeft: 15, flexDirection: 'row', fontSize: width * 0.021 }}>{item.episodeNumber}. {item.title}</Text>
                                <Text style={{ color: "#acacac", margin: "auto", marginLeft: 15, flexDirection: 'row' }}>S{item.seasonNumber}E{item.episodeNumber} | {item.airDate}</Text>
                                <Text style={{ color: "#ffffff", margin: "auto", marginLeft: 15, flexDirection: 'row', width: "90%" }}>{item.overview}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>)
            }
        }
        return (
            <FlatList
                data={data}
                renderItem={AddItem}
                keyExtractor={item => item.episodeNumber}
            />
        );
    }
}

export default function (props) {
    const navigation = useNavigation();

    return <EpisodeList {...props} navigation={navigation} />;
}