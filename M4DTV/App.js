import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './src/pages/Home';
import MovieScreen from './src/pages/Movie';
import StreamScreen from './src/pages/Stream';
import ShowScreen from './src/pages/Show';
import ShowsScreen from './src/pages/TV';
import MoviesScreen from './src/pages/Movies';
import HistoryScreen from './src/pages/History';
import WatchlistScreen from './src/pages/Watchlist';
import SearchScreen from './src/pages/Search';
import LoginScreen from './src/pages/Login';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{contentStyle: {backgroundColor: '#000000'}}}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Movie"
          component={MovieScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="tv"
          component={ShowScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Stream"
          component={StreamScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Shows"
          component={ShowsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Movies"
          component={MoviesScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Watchlist"
          component={WatchlistScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
