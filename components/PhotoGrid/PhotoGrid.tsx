import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, View, Text } from 'react-native';
import { default as Reanimated } from 'react-native-reanimated';
import { useRecoilState } from 'recoil';
import { BaseScrollView, LayoutProvider, RecyclerListView } from 'recyclerlistview';
import { dataProviderState } from '../../states'
import { layout } from '../../types/interfaces';
import { useColumnsNumber, useScale } from './GridContext';
import GridLayoutProvider from './GridLayoutProvider';
import PhotoItem from './PhotoItem';
import StoryList from './StoryList';


class ExternalScrollView extends BaseScrollView {
    scrollTo(...args: any[]) {
        //if ((this.props as any).scrollRefExternal?.current) { 
        (this.props as any).scrollRefExternal?.current?.scrollTo(...args);
        //reanimatedScrollTo((this.props as any).scrollRefExternal, 0, args[0].y, true);
        //(this.props as any).scroll.value = args[0].y;
        //}
    }
    render() {
        return (
            <Reanimated.ScrollView {...this.props}
                style={{ zIndex: 1 }}
                ref={(this.props as any).scrollRefExternal}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
            //onScroll={(this.props as any)._onScrollExternal}
            //onScroll={Reanimated.event([(this.props as any).animatedEvent], {listener: this.props.onScroll, useNativeDriver: true})}
            >
                {this.props.children}
            </Reanimated.ScrollView>
        );
    }
}

interface Props {
}

const PhotoGrid: React.FC<Props> = (props) => {
    const SCREEN_WIDTH = Dimensions.get('window').width;
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const [numColumns] = useColumnsNumber() as [number];
    const scale = useScale();
    const [dataProvider] = useRecoilState(dataProviderState);
    const data = dataProvider.getAllData();
    const [groupBy, setGroupBy] = useState('day')
    const getLayoutType = useCallback((index) => {
        if (index === 0) return 'story';
        else if (data[index]?.deleted) return 'hidden';
        else if (data[index]?.sortCondition === groupBy || data[index]?.sortCondition === '') {
            if (typeof data[index]?.value === 'string') return 'header';
            return 'image';
        }
        return 'unknown'
    }, [data])
    const layoutProvider = useMemo(() => (new GridLayoutProvider(numColumns, scale, getLayoutType)), [getLayoutType, numColumns])
    const rowRenderer = (type: string | number, data: layout, index: number) => {
        switch (type) {
            case 'story':
                return <StoryList />;
            case 'header':
                return (
                    <View style={{ flex: 1, width: SCREEN_WIDTH, }}>
                        <Text>{data.value}</Text>
                    </View>
                );
            case 'image':
                return <PhotoItem photo={data} />
            default: return null;
        }

    }
    return dataProvider.getSize() ? (
        <RecyclerListView
            style={{
                flex: 1,
            }}
            layoutProvider={layoutProvider}
            dataProvider={dataProvider}
            rowRenderer={rowRenderer}
        />
    ) : null
}

export default PhotoGrid
