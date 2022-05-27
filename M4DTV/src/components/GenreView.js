import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {
  Image,
  TouchableOpacity,
  FlatList,
  Text,
  View,
  touch,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

class GenreView extends PureComponent {
  static propTypes = {
    data: PropTypes.array.isRequired,
  };
  render = () => {
    const {data, navigation} = this.props;
    const width = Dimensions.get('window').width;
    const height = Dimensions.get('window').height;
    const styles = StyleSheet.create({
      button: {
        width: width * 0.1,
        height: height * 0.05,
        borderRadius: 10,
        backgroundColor: '#000000',
        borderColor: '#000000',
        borderWidth: 1,
        paddingTop: 2,
        opacity: '0.8',
        color: '#000000',
        marginRight: 11,
      },
    });
    const AddItem = ({item}) => {
      return (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            this.props.onChange(item.id);
          }}
          style={styles.button}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignContent: 'center',
              }}>
              <Text
                style={{
                  flexDirection: 'column',
                  color: '#FFFFFF',
                  fontSize: width * 0.0146,
                }}>
                {item.name.includes('Action')
                  ? 'Action'
                  : item.name.includes('Sci-Fi')
                  ? 'Sci-Fi'
                  : item.name.includes('Science Fiction')
                  ? 'Sci-Fi'
                  : item.name}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    };
    return (
      <FlatList
        data={data}
        renderItem={AddItem}
        horizontal={true}
        keyExtractor={item => item.id}
      />
    );
  };
}

export default function (props) {
  const navigation = useNavigation();

  return <GenreView {...props} navigation={navigation} />;
}
