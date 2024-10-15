import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

const AuthenticationStack = createNativeStackNavigator();

const AuthenticationNavigation = () => {
    return (
        <AuthenticationStack.Navigator>
        <AuthenticationStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
        />
        <AuthenticationStack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ title: "Signup" }}
        />
        </AuthenticationStack.Navigator>
    );
};
