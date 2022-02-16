import React, { createRef, useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { sortCondition } from '../types/interfaces';
import {
  changeSortCondition,
} from '../utils/functions';
import {
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import {
  useRecoilState,
} from 'recoil';
import { numColumnsState } from '../states';
import {
  default as Reanimated,
  useAnimatedGestureHandler,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { useColumnsNumber } from './animation/ColumnsNumber'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  scale: Reanimated.SharedValue<number>;
  numColumnsAnimated: Reanimated.SharedValue<number>
  focalX: Animated.Value;
  focalY: Animated.Value;
  numberOfPointers: Animated.Value;
  velocity: Animated.Value;
}

const PinchZoom: React.FC<Props> = (props) => {
  const sortCondition = useRef<sortCondition>('day');
  const numColumns = useColumnsNumber();

  useEffect(() => {
    console.log([Date.now() + ': component PinchZoom' + numColumns + ' rendered']);
  });
  let pinchRef = createRef<PinchGestureHandler>();

  const _onPinchGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, {}>({
    onStart: (_, ctx) => {

    },
    onActive: (event, ctx) => {
      numColumns.value = numColumns.value * event.scale;
    },
    onEnd: (event) => {
      numColumns.value = withTiming(
        Math.round(numColumns.value),
        {
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
      ), () => {
        let _pinchOrZoom: "pinch" | "zoom" | undefined;
        if (event.scale > 1) {
          _pinchOrZoom = 'pinch';
        } else if (event.scale < 1) {
          _pinchOrZoom = 'zoom';
        }
        let endValue = Math.round(numColumns.value);
        if (endValue > 4) endValue = 4;
        else if (endValue < 2) endValue = 2;
        let _sortCondition = changeSortCondition(
          sortCondition.current,
          _pinchOrZoom,
          endValue as 2 | 3 | 4,
        );

        sortCondition.current = _sortCondition.sortCondition;
      }
    },
  });

  return (

    <PinchGestureHandler
      ref={pinchRef}
      onGestureEvent={_onPinchGestureEvent}
    >
      <Reanimated.View
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          zIndex: 3,
        }}
      >
        {props.children}
      </Reanimated.View>
    </PinchGestureHandler>

  );
};

export default PinchZoom;
