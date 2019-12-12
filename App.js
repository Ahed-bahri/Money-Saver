import React, { Component } from "react";
import LoginRoutes from "./src/authentication/login/LoginRoutes";
import * as firebase from "firebase";
import { AppLoading, Font,Notifications, Permissions, Constants  } from "expo";
import { FontAwesome } from '@expo/vector-icons';
import { isNotficationOn, checkIfNewLogin,setUserID, restoreBackup } from './src/storage/StorageManager';
console.disableYellowBox = true;
import { NavigationActions } from 'react-navigation';
import HomeNav from './src/navigation/HomeNav';
const firebaseConfig = {
  apiKey: "AIzaSyD_3pwgVXx9Cgov5oRNuKf3LWi6Yj7XsSg",
  authDomain: "moneysaver-5b6fb.firebaseapp.com",
  databaseURL: "https://moneysaver-5b6fb.firebaseio.com",
  projectId: "moneysaver-5b6fb",
  storageBucket: ""
};
var defaultApp = firebase.initializeApp(firebaseConfig);

class App extends Component {
  state = { fontsAreLoaded: false, signedIn: false };

  goToRoot() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: "Login" }),]
    });
    this.props.navigation.dispatch(resetAction);
  }
  async componentDidMount() {
    await firebase.auth().signOut();
    // Listen for authentication state to change.
    firebase.auth().onAuthStateChanged((user) => {
      if (user != null) {
        if (user.uid) {
          this.onLoggedIn(user.uid)
        }
        console.log("We are authenticated now!");
      }
      else {
        this.setState({ signedIn: false });
      }
    });
  }
  async onLoggedIn(id) {
    let isNewUser = await checkIfNewLogin(id);
    await setUserID(id);
    if (isNewUser) {
      await restoreBackup();
      this.setState({ signedIn: true });
    } else {
      console.log("Fb user id " + id);
      this.setState({ signedIn: true });
    }
  }
  async componentWillMount() {
    await isNotficationOn().then((isOn) => {if(isOn && isOn===true){this.scheduleMissYouNotificationAfterOneWeek()}});
    await Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
      'Ionicons': require('@expo/vector-icons/fonts/Ionicons.ttf'),
      'MaterialCommunityIcons': require('@expo/vector-icons/fonts/MaterialCommunityIcons.ttf'),
    });
    await Font.loadAsync(FontAwesome.font);
    this.setState({ fontsAreLoaded: true });
  }
  async componentWillUnmount() {
    await isNotficationOn().then((isOn) => {
      if (isOn) {
        this.scheduleMissYouNotificationAfterOneWeek();
      }
      else {
        Notifications.cancelAllScheduledNotificationsAsync();
      }
    });
  }

  render() {
    const { signedIn, fontsAreLoaded } = this.state;
    if (fontsAreLoaded) {
      if (signedIn) {
        return <HomeNav />;
      }
      else {
        return <LoginRoutes />;
      }
    }
    else {
      return <AppLoading />;
    }
  }
  scheduleMissYouNotificationAfterOneWeek() {
    Notifications.cancelAllScheduledNotificationsAsync();
    Notifications.scheduleLocalNotificationAsync(localNotification, schedulingOptions);
  }
}
//Notification related variables.
let t = new Date();
//For project we have to set it to one week which is 604800 seconds, for testing let it be 10 seconds
//let timeIntervalSecs = 604800;
let timeIntervalSecs = 10;
t.setSeconds(t.getSeconds() + timeIntervalSecs);
const schedulingOptions = {
  time: t};
const localNotification = {
  title: 'We miss you so much !',
  body: 'Track your expenses and save more!',
  ios: { 
    sound: true 
  },
  android: 
    {
      sound: true,
      priority: 'high',
      sticky: false,
      vibrate: true 
    }
};
export { defaultApp };
export default App;
