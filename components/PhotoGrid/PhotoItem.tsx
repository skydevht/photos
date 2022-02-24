import React, { useEffect } from 'react'
import { Asset } from 'expo-media-library';
import { StyleSheet, Image, View, Text } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import Reanimated, { Easing, interpolate, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { prettyTime } from '../../utils/functions';
import { layout } from '../../types/interfaces';
import { LongPressGestureHandler, TapGestureHandler, TapGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import RoundCheckbox from '../RoundCheckbox';


interface ThumbnailProps {
    media: Asset,
    loading?: boolean
}
const VideoThumbnail: React.FC<ThumbnailProps> = (props) => {
    return (
        <>
            <Image source={{ uri: props.media.uri }}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                    flex: 1,
                    backgroundColor: props.loading ? 'grey' : 'white',
                    margin: 2.5,
                    zIndex: 4,
                }} />
            <View style={styles.videoText} >
                <Text style={styles.durationText}>{prettyTime(props.media.duration)}</Text>
                <MaterialIcons name="play-circle-filled" size={20} color="white" />
            </View>
        </>
    )
}

const ImageThumbnail: React.FC<ThumbnailProps> = (props) => {
    return (
        <Image source={{ uri: props.media.uri }}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
                flex: 1,
                backgroundColor: 'grey',
                margin: 2.5,
                zIndex: 4,
            }} />
    );
}

interface Props {
    photo: layout,
    selected: boolean,
    onToggleSelect: (photoId: string) => void,
}

const PhotoItem: React.FC<Props> = (props) => {
    const media = props.photo.value as Asset;
    // the library has two definitions which clashes when using useRef
    const longTapRef = React.createRef<LongPressGestureHandler>();
    const singleTapRef = React.createRef<TapGestureHandler>();

    const { selected } = props;
    const selection = useSharedValue(selected ? 1 : 0);
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{
                scale: interpolate(selection.value, [0, 1], [1, 0.9])
            }]
        };
    })
    const checkboxAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: selection.value,
        };
    })
    useEffect(() => {
        console.log("Is Selected: " + selected)
        selection.value = withTiming(selected ? 1 : 0, {
            duration: 300,
            easing: Easing.inOut(Easing.linear),
        })
    }, [selected])
    const _hanldleStatusChange = (id: string) => {
        props.onToggleSelect(id)
    }
    const _onTapGestureEvent = useAnimatedGestureHandler<TapGestureHandlerGestureEvent, {}>({
        onActive: (event, ctx) => {
            if (selected) {
                runOnJS(_hanldleStatusChange)(props.photo.id)
            } else {
                // showSingleImage
            }
        }
    }, [selected, props.photo.id])

    const _onLongGestureEvent = useAnimatedGestureHandler<TapGestureHandlerGestureEvent, { time: number, absoluteX: number }>({
        onActive: (event, ctx) => {
            const timeDiff = (new Date().getTime()) - ctx.time;
            console.log('onLongActive');
            console.log(timeDiff);
            if (timeDiff > 500 || ctx.absoluteX !== event.absoluteX) {
                ctx.absoluteX = event.absoluteX;
                ctx.time = new Date().getTime();
                console.log('Selecting');
                runOnJS(_hanldleStatusChange)(props.photo.id)
            } else {
                ctx.absoluteX = event.absoluteX;
                ctx.time = new Date().getTime();
            }
        },
    }, [selected, props.photo.id, props.onToggleSelect])

    const upload = useSharedValue(0);
    const uploadAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: upload.value,
        };
    })
    return (
        <Reanimated.View style={[styles.root, animatedStyle]}>
            <LongPressGestureHandler ref={longTapRef} onGestureEvent={_onLongGestureEvent} minDurationMs={400} >
                <Reanimated.View style={{ flex: 1, zIndex: 5 }}>
                    <TapGestureHandler ref={singleTapRef} onGestureEvent={_onTapGestureEvent} >
                        <Reanimated.View style={{ flex: 1 }}>
                            {media.duration > 0 ? <VideoThumbnail media={media} loading={false} /> : <ImageThumbnail media={media} />}
                        </Reanimated.View>
                    </TapGestureHandler>
                </Reanimated.View>
            </LongPressGestureHandler>
            <Reanimated.View style={
                [
                    styles.checkBox,
                    checkboxAnimatedStyle
                ]
            } >
                <RoundCheckbox
                    size={24}
                    checked={selected}
                    borderColor='whitesmoke'
                    icon='check'
                    backgroundColor='#007AFF'
                    iconColor='white'
                    onValueChange={() => { }}
                />
            </Reanimated.View>
            <Reanimated.View
                style={[
                    styles.uploadStatus,
                    uploadAnimatedStyle
                ]}
            >
                <MaterialIcons name="cloud-off" size={20} color="white" />
            </Reanimated.View>
        </Reanimated.View>
    )
}

export default PhotoItem

const styles = StyleSheet.create({
    root: {
        zIndex: 4,
        flex: 1,
        opacity: 1,
    },
    durationText: {
        color: 'whitesmoke',
        position: 'relative',
        marginRight: 5
    },
    videoText: {
        zIndex: 4,
        height: 20,
        position: 'absolute',
        top: 5,
        right: 5,
        flex: 1,
        flexDirection: 'row',
    },
    uploadStatus: {
        zIndex: 5,
        height: 20,
        position: 'absolute',
        bottom: 5,
        left: 5,
        flex: 1,
        flexDirection: 'row',
        color: 'white',
    },
    checkBox: {
        zIndex: 10,
        position: 'absolute',
        top: -5,
        left: -5,
        flex: 1,
        flexDirection: 'row',
        color: 'white',
    }
});