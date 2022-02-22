import { Dimension, Layout, WrapGridLayoutManager as LayoutManager } from "recyclerlistview";
import {default as Reanimated} from 'react-native-reanimated'
import GridLayoutProvider from "./GridLayoutProvider";

export default class GridLayoutManager extends LayoutManager {
    constructor(layoutProvider: GridLayoutProvider, renderWindowSize: Dimension, cachedLayouts?: Layout[], scale: Reanimated.SharedValue<number>) {
        super(layoutProvider, renderWindowSize, false, cachedLayouts)
    }
    public getStyleOverridesForIndex(index: number): object | undefined {
        // This is where to put the transform
        return undefined
    }
}