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

export type SelectionState = {
    [index: string]: boolean | undefined
}

interface Props {
    selection: SelectionState,
    handleSelectionChange: (newSelection: SelectionState) => void,
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
    const handleToggleSelect = useCallback((id: string) => {
        const isSelected = !!props.selection[id];
        // don't know if the following is super efficient or we need to use an immutable library
        console.log('grid is selected: ' + id + ' - ' + isSelected)
        props.handleSelectionChange({
            ...props.selection,
            [id]: !isSelected,
        });
    }, [props.selection, props.handleSelectionChange])
    const rowRenderer = (type: string | number, data: layout, index: number) => {
        const isSelected = !!props.selection[data.id];
        console.log("Renderer is selected: " + isSelected)
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
                return <PhotoItem selected={isSelected} photo={data} onToggleSelect={handleToggleSelect} />
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
        layoutProvider,
        selection: props.selection, // to force rerender when the selection state changes
    }), [layoutProvider, props.selection])
    return dataProvider.getSize() ? (
        <RecyclerListView
            style={{
                flex: 1,
            }}
            layoutProvider={layoutProvider}
            dataProvider={dataProvider}
            renderAheadOffset={1000}
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
