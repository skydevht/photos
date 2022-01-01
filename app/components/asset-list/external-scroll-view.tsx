import React, { useEffect, useState, useRef } from 'react';
import {
    Text,
    StyleSheet,
    StatusBar,
    View,
    FlatList,
    SafeAreaView,
} from 'react-native';
import { BaseScrollView } from 'recyclerlistview';
import Animated from 'react-native-reanimated';
export default class ExternalScrollView extends BaseScrollView {
    scrollTo(...args: any[]) {
        (this.props as any).scrollRefExternal?.current?.scrollTo(...args);
    }
    render() {
        return (
            <Animated.ScrollView {...this.props}
                style={{ zIndex: 1 }}
                ref={(this.props as any).scrollRefExternal}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
            >
                {this.props.children}
            </Animated.ScrollView>
        );
    }
}