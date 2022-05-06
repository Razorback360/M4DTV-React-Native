import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUser = async (user_id) => {
  try {
    await AsyncStorage.setItem("user_id", user_id);
    return "Success";
  } catch (error) {
    console.log(error)
  }
};

export const retrieveUser = async () => {
  const data = await AsyncStorage.getItem("user_id");
  return data
};

