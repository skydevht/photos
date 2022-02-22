import { useNavigation } from '@react-navigation/native';
import React, { useEffect, } from 'react';
import { Animated, View, useWindowDimensions, Platform, UIManager } from 'react-native';
import PinchZoom from './PinchZoom';
import { prepareLayout, } from '../utils/functions';
import { default as Reanimated, } from 'react-native-reanimated';
import GridProvider from './PhotoGrid/GridContext';
import PhotoGrid from './PhotoGrid';
import useAllPhotosDataProvider, { useRemoveElements } from '../hooks/useAllPhotosDataProvider';
interface Props {
    scrollY2: Reanimated.SharedValue<number>;
    scrollY3: Reanimated.SharedValue<number>;
    scrollY4: Reanimated.SharedValue<number>;
    scale: Reanimated.SharedValue<number>;
    numColumnsAnimated: Reanimated.SharedValue<number>;
    HEADER_HEIGHT: number;
    FOOTER_HEIGHT: number;
    headerShown: Reanimated.SharedValue<number>;
}

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PhotosContainer: React.FC<Props> = (props) => {
    const SCREEN_WIDTH = useWindowDimensions().width;

    //TODO: Change this function to the getPhotos in actions like in AllPhotos
    // useEffect(() => {
    //   if (permission) {
    //     navigation.navigate('HomePage');
    //     getMedia(permission, initialPhotoNumber);
    //   } else if(!permission) {
    //     navigation.navigate('PermissionError');
    //   }
    // }, [permission]);

    useEffect(() => {
        console.log([Date.now() + ': component PhotosContainer rendered']);
    }, []);



    useAllPhotosDataProvider();
    const removeElements = useRemoveElements()
    return (
        <View style={{
                flex: 1,
                flexDirection: 'column',
                width: SCREEN_WIDTH,
                position: 'relative',
            }}>
            <GridProvider>
                <PinchZoom>
                    <PhotoGrid />
                </PinchZoom>
            </GridProvider>
        </View>
    );
};
const isEqual = (prevProps: Props, nextProps: Props) => {
    return (prevProps.HEADER_HEIGHT === nextProps.HEADER_HEIGHT);
}
export default React.memo(PhotosContainer, isEqual);
