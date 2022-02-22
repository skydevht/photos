import React from 'react'
import {Asset} from 'expo-media-library';
import { StyleSheet, Image, View, Text } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import { prettyTime } from '../../utils/functions';
import { layout } from '../../types/interfaces';


interface ThumbnailProps {
    media: Asset,
    loading?: boolean
}
const VideoThumbnail: React.FC<ThumbnailProps> = (props) => {
    return (
        <>
            <Image
                source={{ uri: props.media.uri }}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                    flex: 1,
                    backgroundColor: props.loading ? 'grey' : 'white',
                    margin: 2.5,
                    zIndex: 4,
                }}
            />
            <View
                style={styles.videoText}
            >
                <Text style={styles.durationText}>{prettyTime(props.media.duration)}</Text>
                <MaterialIcons name="play-circle-filled" size={20} color="white" />
            </View>
        </>
    )
}

const ImageThumbnail: React.FC<ThumbnailProps> = (props) => {
    return (
        <Image
            source={{ uri: props.media.uri }}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
                flex: 1,
                backgroundColor: 'grey',
                margin: 2.5,
                zIndex: 4,
            }}
        />
    );
}

interface Props { 
    photo: layout
}

const PhotoItem: React.FC<Props> = (props) => {
    const media = props.photo.value as Asset;
    return media.duration > 0 ? <VideoThumbnail media={media} loading={false} /> : <ImageThumbnail media={media} />
}

export default PhotoItem

const styles = StyleSheet.create({
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
        zIndex: 5,
        position: 'absolute',
        top: -5,
        left: -5,
        flex: 1,
        flexDirection: 'row',
        color: 'white',
    }
});