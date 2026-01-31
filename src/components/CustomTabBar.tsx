import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, Mask, Rect, Circle, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomTabBarBackgroundProps {
    colors: any;
}

export const CustomTabBarBackground: React.FC<CustomTabBarBackgroundProps> = ({ colors }) => {
    const tabBarWidth = SCREEN_WIDTH - 40;
    const tabBarHeight = 70;
    const centerX = tabBarWidth / 2;
    const borderRadius = 35;
    const notchRadius = 40;

    return (
        <View style={[StyleSheet.absoluteFill, {
            borderRadius: 35, overflow: 'hidden', width: tabBarWidth, height: tabBarHeight, justifyContent: 'center', alignItems: 'center', left: 20, right: 20, bottom: 20, shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
        }]}>
            <BlurView
                intensity={50}
                tint="light"
                style={StyleSheet.absoluteFill}
            >
                <View style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(255, 255, 255, 0.36)',
                }} />

            </BlurView>
        </View>
    );
};
