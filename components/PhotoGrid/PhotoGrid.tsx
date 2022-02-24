import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, View, Text } from 'react-native';
import { default as Reanimated, Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useRecoilState } from 'recoil';
import { BaseScrollView, Layout, LayoutProvider, RecyclerListView } from 'recyclerlistview';
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
    const [numColumns] = useColumnsNumber();
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
    const renderItemContainer = useCallback((props: any, parentProps: any, children: React.ReactNode) => {
        return (
            <Cell {...props} scale={scale} columnNumber={numColumns} layoutProvider={parentProps.extendedState.layoutProvider} index={parentProps.index}>
                {children}
            </Cell>
        );
    }, [numColumns])
    const extendedState = useMemo(() => ({
        layoutProvider
    }), [layoutProvider])
    return dataProvider.getSize() ? (
        <RecyclerListView
            style={{
                flex: 1,
            }}
            layoutProvider={layoutProvider}
            dataProvider={dataProvider}
            rowRenderer={rowRenderer}
            renderItemContainer={renderItemContainer}
            extendedState={extendedState}
        />
    ) : null
}

interface CellProps {
    layoutProvider: GridLayoutProvider
    style: object,
    index: number,
    columnNumber: number,
    scale: Reanimated.SharedValue<number>
}

const Cell: React.FC<CellProps> = React.forwardRef(({ layoutProvider, columnNumber, index, scale, style, ...props }, ref) => {
    let layouts = layoutProvider.getLayoutManager()?.getLayoutsForIndex(index);
    const animationStyle = useAnimatedStyle(() => {
        if (layouts) {
            const currentLayout = layouts.find(o => o.colNum === columnNumber)?.layout as Layout;
            const finalLayouts = layouts.map((el, idx) => ({
                layout: el.layout,
                from: el.colNum,
            })) as Array<{ layout: Layout, from: number }>;
            if (finalLayouts.length === 1) return {};
            const fromValues = finalLayouts.map(el => el.from);

            const extrapolation = {
                extrapolateLeft: Extrapolate.CLAMP,
                extrapolateRight: Extrapolate.CLAMP,
            };
            const finalScale = interpolate(scale.value, fromValues, finalLayouts.map(el => {
                if (el.layout.width && currentLayout.width) {
                    return el.layout.width / currentLayout.width;
                }
                return 1;
            }));
            const translateOrigin = (center: number, d: number) => {
                // Scale transform is centered, so we adjust the translation to make it appears as it happens from the top-left corner
                return center - d / 2;
            }

            return {
                transform: [{
                    translateX: interpolate(
                        scale.value,
                        fromValues,
                        finalLayouts.map(el => translateOrigin(el.layout.x - currentLayout.x, currentLayout.width - el.layout.width)),
                    ),
                }, {
                    translateY: interpolate(
                        scale.value,
                        fromValues,
                        finalLayouts.map(el => translateOrigin(el.layout.y - currentLayout.y, currentLayout.width - el.layout.width)),
                    )
                }, {
                    scale: finalScale
                }]
            }
        }
        return {}
    })
    return (
        <Reanimated.View style={[style, animationStyle]} {...props}>
            {props.children}
        </Reanimated.View >
    );
})

export default PhotoGrid
