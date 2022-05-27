import React, {useState, useRef} from 'react';
import {
  useWindowDimensions,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {login} from '../utils/Requests';
import {storeUser, retrieveUser} from '../utils/Storage';
import LinearGradient from 'react-native-linear-gradient';

const LoginScreen = ({navigation}) => {
  const inputRef = useRef(null);
  const [pincode, setPincode] = useState(null);
  const [isError, setIsError] = useState(false);
  const [check, setCheck] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const size = useWindowDimensions();
  const width = size.width;
  const height = size.height;
  const handleSubmit = async () => {
    const data = await login(pincode);

    if (data.user_id) {
      await storeUser(data.user_id);
      const user = await retrieveUser('user_id');
      console.log(user);
      isError ? setIsError(false) : null;
      navigation.replace('Home');
    } else {
      !isError ? setIsError(true) : null;
    }
  };

  if (check) {
    retrieveUser('user_id').then(user_id => {
      if (user_id !== null) {
        console.log(user_id);
        navigation.replace('Home');
      }
    });
  }

  return (
    <LinearGradient
      colors={['#000000', '#050227']}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
      <View
        style={{
          backgroundColor: '#000000',
          width: '25%',
          height: '50%',
          borderRadius: 10,
          alignItems: 'center',
        }}>
        <Image
          source={require('../static/logo.png')}
          style={{width: '35%', height: '32%', marginTop: '10%'}}></Image>
        <TouchableOpacity
          onPress={() => {
            inputRef.current.focus();
          }}
          activeOpacity={0.6}
          style={{width: '100%'}}>
          <TextInput
            ref={inputRef}
            style={{
              width: '75%',
              backgroundColor: '#2D2F3E',
              borderRadius: 5,
              marginTop: '10%',
              marginLeft: '10%',
              marginRight: '12%',
              marginBottom: '5%',
              padding: 2,
              paddingLeft: 5,
              color: '#FFFFFF',
              alignSelf: 'flex-end',
            }}
            editable
            placeholder="Pincode"
            placeholderTextColor="#ffffff"
            keyboardType="numeric"
            onSubmitEditing={async () => {
              handleSubmit();
            }}
            onChangeText={data => {
              setPincode(data);
            }}></TextInput>
        </TouchableOpacity>
        {isError && (
          <Text style={{color: 'red', fontSize: width * 0.013}}>
            {' '}
            INCORRECT PINCODE!
          </Text>
        )}
        <Text style={{color: '#FFFFFF', fontSize: width * 0.013}}>
          Need a pincode? Head over to
        </Text>
        <Text style={{color: '#0b8fff', fontSize: width * 0.013}}>
          https://movies4discord.xyz/connect
        </Text>
      </View>
    </LinearGradient>
  );
};

export default LoginScreen;
