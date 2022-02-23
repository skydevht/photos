import { Dimension, Layout, LayoutManager } from "recyclerlistview";
import { default as Reanimated } from 'react-native-reanimated'
import GridLayoutProvider from "./GridLayoutProvider";

const MAX_COLUMNS = 4;
const MIN_COLUMNS = 2;

type gridLayout = 'upper' | 'current' | 'lower';

// We are basically recreating WrapGridLayoutManager here
export default class GridLayoutManager extends LayoutManager {
    // k is the number of columns
    private _upperLayouts: Layout[]; // hold the layouts for k + 1 columns
    private _lowerLayouts: Layout[]; // hold the layouts for k - 1 columns
    private _currentLayouts: Layout[]; // hold the layouts for k - 1 columns
    private _columnNumber: number;
    private _scale: Reanimated.SharedValue<number>;
    private _layoutProvider: GridLayoutProvider;
    private _window: Dimension;
    private _totalHeight: number;
    private _totalWidth: number;

    constructor(
        layoutProvider: GridLayoutProvider,
        renderWindowSize: Dimension,
        columnsNumber: number,
        scale: Reanimated.SharedValue<number>,
        cachedLayouts?: Layout[],
    ) {
        super();
        this._layoutProvider = layoutProvider;
        this._window = renderWindowSize;
        this._totalHeight = 0;
        this._totalWidth = 0;
        this._upperLayouts = []
        this._lowerLayouts = []
        this._scale = scale;
        this._columnNumber = columnsNumber;
        this._currentLayouts = cachedLayouts ? cachedLayouts : [];
    }
    public getStyleOverridesForIndex(index: number): object | undefined {
        // This is where to put the transform
        return undefined
    }

    public getContentDimension(): Dimension {
        return { height: this._totalHeight, width: this._totalWidth };
    }
    public getLayouts(): Layout[] {
        return this._currentLayouts;
    }

    public getLayoutsForIndex(index: number): Array<Layout | null> {
        if (this._currentLayouts.length > index) {
            const upperLayout = this._upperLayouts.length > index ? this._upperLayouts[index] : null
            const lowerLayout = this._lowerLayouts.length > index ? this._lowerLayouts[index] : null
            return [lowerLayout, this._currentLayouts[index], upperLayout];
        } else {
            throw new Error("No layout available for index: " + index);
        }
    }


    public overrideLayout(index: number, dim: Dimension): boolean {
        // We may look into GridLayoutManager for a better algorithm
        const layout = this._currentLayouts[index];
        if (layout) {
            layout.isOverridden = true;
            layout.width = dim.width;
            layout.height = dim.height;
        }
        return true;
    }

    public setMaxBounds(itemDim: Dimension): void {
        itemDim.width = Math.min(this._window.width, itemDim.width);
    }

    public relayoutFromIndex(startIndex: number, itemCount: number): void {
        // we will calculate the other layouts as well
        let layoutsToConsider = [{ layouts: this._currentLayouts, columnNumber: this._columnNumber }];
        if (this._columnNumber - 1 >= MIN_COLUMNS) layoutsToConsider = [{ layouts: this._lowerLayouts, columnNumber: this._columnNumber - 1 }, ...layoutsToConsider];
        if (this._columnNumber + 1 <= MAX_COLUMNS) layoutsToConsider = [...layoutsToConsider, { layouts: this._upperLayouts, columnNumber: this._columnNumber + 1 }];
        // [-1, 0, 1].filter(d => this._columnNumber + d >= MIN_COLUMNS || this._columnNumber + d <= MAX_COLUMNS)
        layoutsToConsider.forEach(({ layouts, columnNumber }) => {
            let startX = 0;
            let startY = 0;
            let maxBound = 0;
            // Locate which item is the first on the row we're starting
            startIndex = this._locateFirstNeighbourIndex(startIndex);
            const startVal = layouts[startIndex];
            if (startVal) {
                startX = startVal.x;
                startY = startVal.y;
                this._totalHeight = startY; // We know the above rows are good
            }
            // initializing
            const oldItemCount = layouts.length;
            const itemDim = { height: 0, width: 0 };
            let itemRect = null;
            let oldLayout = null;

            for (let i = startIndex; i < itemCount; i++) {
                oldLayout = layouts[i];
                const layoutType = this._layoutProvider.getLayoutTypeForIndex(i);
                if (oldLayout && oldLayout.isOverridden && oldLayout.type === layoutType) {
                    // We're sure the old value are still valid
                    itemDim.height = oldLayout.height;
                    itemDim.width = oldLayout.width;
                } else {
                    // recompute
                    this._layoutProvider.setComputedLayout(layoutType, itemDim, i, columnNumber);
                }
                // make sure the item is not wider than the screen
                this.setMaxBounds(itemDim);
                // wrap the item if needed
                while (!(startX + itemDim.width <= this._window.width)) {
                    startX = 0;
                    startY += maxBound;
                    this._totalHeight += maxBound;

                    maxBound = 0;
                }
                maxBound = Math.max(maxBound, itemDim.height)
                //TODO: Talha creating array upfront will speed this up
                if (i > oldItemCount - 1) {
                    // New items have been added to the dataprovider
                    layouts.push({ x: startX, y: startY, height: itemDim.height, width: itemDim.width, type: layoutType });
                } else {
                    // replacing
                    itemRect = layouts[i];
                    itemRect.x = startX;
                    itemRect.y = startY;
                    itemRect.type = layoutType;
                    itemRect.width = itemDim.width;
                    itemRect.height = itemDim.height;
                }
                // jumping the origin around
                startX += itemDim.width;

            }
            if (oldItemCount > itemCount) {
                // Some elements have been removed from the data provider, so we're trimming the layouts
                layouts.splice(itemCount, oldItemCount - itemCount);
            }
            if (columnNumber === this._columnNumber) {
                // Not storing the other height as we don't want the view to jump around
                this._totalWidth = this._window.width;
                this._totalHeight += maxBound;
            }
        })

    }

    private _locateFirstNeighbourIndex(startIndex: number, layouts = this._currentLayouts): number {
        if (startIndex === 0) {
            return 0;
        }
        let i = startIndex - 1;
        for (; i >= 0; i--) {
            if (layouts[i].x === 0) {
                break;
            }
        }
        return i;
    }

}