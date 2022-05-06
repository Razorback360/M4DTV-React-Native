import PropTypes from "prop-types";
import React, { PureComponent } from 'react';
import { Image, TouchableOpacity, FlatList, Text, View, touch, Dimensions } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';

class SeasonList extends PureComponent {
    static propTypes = {
        data: PropTypes.array.isRequired,
    }
    render = () => {
        const { data, navigation } = this.props;
        const width = Dimensions.get('window').width;
        const height = Dimensions.get('window').height;
        const AddItem = ({ item }) => {
            console.log(item)
            return (
                <TouchableOpacity activeOpacity={0.5} onPress={() => {
                    this.props.onChange(item)
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{padding: 5 ,color: "#ffffff", marginTop: 5, marginLeft: 15, flexDirection: 'row', fontSize: width * 0.021 }}>{item}</Text>
                        </View>
                    </View>
                </TouchableOpacity>)
        }
        return (
            <FlatList
                data={data}
                renderItem={AddItem}
                horizontal={true}
                keyExtractor={item => item}
            />
        );
    }
}

export default function (props) {
    const navigation = useNavigation();

    return <SeasonList {...props} navigation={navigation} />;
}