import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "../screens/Home";

const CoreStack = createNativeStackNavigator();

const HomeNavigation = () => {
  return (
    <CoreStack.Navigator>
      <CoreStack.Screen
        name="Home"
        component={Home}
        options={{ title: "Home" }}
      />
    </CoreStack.Navigator>
  );
};

export default HomeNavigation;
