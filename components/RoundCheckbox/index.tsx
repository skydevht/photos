import React, { useRef, useEffect } from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import Reanimated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };
interface Props {
  onValueChange: Function;
  icon: 'check';
  size: number;
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
  checked: boolean;
}

const RoundCheckbox: React.FC<Props> = (props) => {


    const { size, backgroundColor, borderColor, icon, iconColor } = props;
    const iconSize = size * 1.3;
    const opacity = useSharedValue(props.checked ? 1 : 0)
    useEffect(()=>{
      opacity.value = withTiming(props.checked ? 1 : 0, { duration: 300})
    }, [props.checked]);

    const _onPress = () => {
      //props.onValueChange(!props.checked.value);
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: interpolate(opacity.value, [0, 0.9], [0, 1])
      }
    })

    const iconAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [{
          scale: opacity.value
        }]
      }
    })

    return (
      <TouchableWithoutFeedback hitSlop={hitSlop} onPress={_onPress}>
        <View style={styles.parentWrapper} shouldRasterizeIOS={true}>
          <Reanimated.View
            style={[
              {
                borderColor,
                backgroundColor: 'transparent',
                width: size,
                height: size,
                borderRadius: size / 2,
              },
              styles.commonWrapperStyles,
              animatedStyle
            ]}
          />
          <Reanimated.View style={
            [
              {
                backgroundColor: backgroundColor,
                borderColor: backgroundColor,
                width: size,
                height: size,
                borderRadius: size / 2,
              },
              iconAnimatedStyle,
              styles.checkedStyles, styles.commonWrapperStyles, 
            ]}>
            <MaterialIcons
              name={icon}
              color={iconColor}
              size={Math.ceil(iconSize/1.5)}
              style={{
                height: iconSize,
                backgroundColor: 'transparent',
                alignSelf: 'center',
                textAlignVertical:'center'
              }}
            />
          </Reanimated.View>
        </View>
      </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
  parentWrapper: {
    position: 'relative',
  },
  commonWrapperStyles: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedStyles: {
    position: 'absolute',
    top: 0,
    left: 0,
  }
});

export default RoundCheckbox