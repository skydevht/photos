import React, {useEffect, useRef, createRef} from 'react';
import { View, useWindowDimensions, StyleSheet, Image, Text } from 'react-native';
import {story, } from '../../../types/interfaces';
import {
  TapGestureHandler,
  HandlerStateChangeEvent,
  TapGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';
import {useRecoilState} from 'recoil';
// import {storyState} from '../../states/photos';

interface Props {
  story:story;
  duration: number;
  text?: string | undefined;
  height: number;
}

const Highlights: React.FC<Props> = (props) => {
  // const [story, setStory] = useRecoilState(storyState);

  const isMounted = useRef(false);
  useEffect(() => {
      isMounted.current = true;
      return () => {isMounted.current = false;}
  }, []);

  const SCREEN_WIDTH = useWindowDimensions().width;

  const _tapRef = createRef<TapGestureHandler>();

  const openHighlight = () => {
    // setStory(props.story);
  }

  const _onTapHandlerStateChange = ( event:HandlerStateChangeEvent<TapGestureHandlerEventPayload> ) => {
    if (event.nativeEvent.state === State.END){
      if(props.story && props.story.medias){
        openHighlight();
      }
    }
  }

  return props.story ? (
    <TapGestureHandler
      maxDist={3}
      numberOfTaps={1}
      ref={_tapRef}
      onHandlerStateChange={_onTapHandlerStateChange}
    >
      <View 
        style= {[
          styles.container, 
          {
            width: props.height/1.618,
            height: props.height
          }
        ]}
      >
        <Image
          style= {[
            styles.media, 
            {
              width: SCREEN_WIDTH/3,
              height: 1.618*SCREEN_WIDTH/3
            }
          ]}
          source={
            {uri: props.story?.medias[0]?.uri}
          }
        />
        <View
          style={[
            styles.mediaOverlay, {
              width: SCREEN_WIDTH/3,
              height: 1.618*SCREEN_WIDTH/3
            }
          ]}
        >

        </View>
        <View style={styles.textHolder}>
          <Text style={styles.text}>
            {props.story?.text}
          </Text>
        </View>
      </View>
    </TapGestureHandler>
  ) : (
    <Text></Text>
  );
};

const styles = StyleSheet.create({
  media: {
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.5,
  },
  mediaOverlay: {
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.3,
    backgroundColor: 'black'
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontSize: 22,
    textShadowColor: 'black',
    textShadowRadius: 4
  },
  textHolder:{
    height: 50,
    width:'100%',
    position: 'absolute',
    bottom: 0,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex:5,
    alignItems: 'center',
  },
});

export default Highlights;