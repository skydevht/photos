import { useCallback, useEffect, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useRecoilState } from 'recoil';
import { dataProviderState, mediasState, photosState, preparedMediaState, storiesState } from '../states';
import { getStorageMedia, prepareLayout } from '../utils/functions';
import usePermission from './usePermission';
import { getUserBoxMedia } from '../utils/APICalls';

export default function useAllPhotosDataProvider() {
    const [loading, setLoading] = useState(false);
    const [medias, setMedias] = useRecoilState(mediasState);
    const [stories, setStories] = useRecoilState(storiesState);
    const [preparedMedia, setPreparedMedia] = useRecoilState(preparedMediaState);
    const permission = usePermission();

    async function getMedia(permission: boolean) {
        if (!permission) return [];
        const initialPhotoNumber: number = 50000;
        let hasNext = true;
        setLoading(true)
        let endCursor = ''
        let photos: MediaLibrary.Asset[] = []
        while (hasNext) {
            try {
                const value = await getStorageMedia(permission, initialPhotoNumber, endCursor)
                if (value) {
                    hasNext = value.hasNextPage;
                    endCursor = value.endCursor
                    photos = [...photos, ...value.assets]
                } else {
                    break;
                }
            }
            catch (err) {
                break;
            }
        }
        setLoading(false)
        return photos
    }

    const [dataProvider, setDataProvider] = useRecoilState(dataProviderState);
    useEffect(() => {
        getMedia(permission).then((storagePhotos ) => {
            let boxPhotos: Array<MediaLibrary.Asset> = getUserBoxMedia('');
            let photos: MediaLibrary.Asset[] = []
            if (storagePhotos) {
                photos = [...boxPhotos, ...storagePhotos];
            }
            console.log("Photos size:" + photos.length);
            if (photos?.length) {
                let prepared = prepareLayout(photos, ['day', 'month'], preparedMedia.lastTimestamp, medias.length);
                ////console.log('preparedMedia.layout:',{old:preparedMedia?.layout.length, added:prepared?.layout.length, header:prepared?.headerIndexes.length});
                setPreparedMedia(oldPreparedMedia => ({
                    ...oldPreparedMedia,
                    'layout': oldPreparedMedia.layout.concat(prepared.layout),
                    'headerIndexes': oldPreparedMedia.headerIndexes.concat(prepared.headerIndexes),
                    'stories': oldPreparedMedia.stories.concat(prepared.stories),
                    'lastTimestamp': prepared.lastTimestamp
                }));
                const getStableId = (index: number) => {
                    return [...preparedMedia.layout, ...prepared.layout][index].id;
                }
                setDataProvider(dataProvider.cloneWithRows(dataProvider.getAllData().concat(prepared.layout)));

                let onlyMedias: any[] = prepared.layout.filter(item => typeof item.value !== 'string').map((item) => { return item.value });
                setMedias(oldOnlyMedia => oldOnlyMedia.concat(onlyMedias));
                setStories(oldStories => oldStories.concat(prepared.stories));
            }
        })
    }, [permission]);
    return dataProvider;
}

export function useRemoveElements() {
    const [dataProvider, setDataProvider] = useRecoilState(dataProviderState);

    const removeElements = useCallback((elementIndex: string[]) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setDataProvider(dataProvider.cloneWithRows(
            dataProvider.getAllData().map(
                (x, index) => {
                    if (elementIndex.includes(x.id)) {
                        return { ...x, deleted: true, sortCondition: "deleted" }
                    }
                    return x;
                }
            )
        ))
    }, [dataProvider]);
    return removeElements;
} 