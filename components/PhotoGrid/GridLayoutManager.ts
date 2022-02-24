import { Dimension, Layout, LayoutManager } from "recyclerlistview";
import { default as Reanimated } from 'react-native-reanimated'
import GridLayoutProvider from "./GridLayoutProvider";

const MAX_COLUMNS = 4;
const MIN_COLUMNS = 2;

type gridLayout = 'upper' | 'current' | 'lower';

// We are basically recreating WrapGridLayoutManager here
export default class GridLayoutManager extends LayoutManager {
    // k is the number of columns
    private _allLayouts: Layout[][]; // hold MAX_COLUMNS - MIN_COLUMNS + 1 sets of layouts
    private _columnNumber: number;
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
        this._columnNumber = columnsNumber;
        this._allLayouts = [[], [], []]
        this._allLayouts[this._columnNumber - MIN_COLUMNS] = cachedLayouts ? cachedLayouts : [];
    }

    public getStyleOverridesForIndex(index: number): object | undefined {
        // This is where to put the transform
        return undefined
    }

    public getContentDimension(): Dimension {
        return { height: this._totalHeight, width: this._totalWidth };
    }
    public getLayouts(): Layout[] {
        return this._allLayouts[this._columnNumber - MIN_COLUMNS];
    }

    public getLayoutsForIndex(index: number): Array<{ layout: Layout, colNum: number }> {
        if (this._allLayouts.every((layout => index < layout.length))) {
            return this._allLayouts.map((layouts, idx) => ({ layout: layouts[index], colNum: idx + MIN_COLUMNS }))
        } else {
            throw new Error('Layouts unavalaible')
        }
    }


    public overrideLayout(index: number, dim: Dimension): boolean {
        // We may look into GridLayoutManager for a better algorithm
        const layout = this.getLayouts()[index];
        if (layout) {
            const heightDiff = Math.abs(dim.height - layout.height);
            const widthDiff = Math.abs(dim.width - layout.width);
            if (widthDiff < 3) {
                if (heightDiff === 0) {
                    return false;
                }
                dim.width = layout.width;
            }
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
        // [-1, 0, 1].filter(d => this._columnNumber + d >= MIN_COLUMNS || this._columnNumber + d <= MAX_COLUMNS)
        this._allLayouts.map((layouts, idx) => ({ layouts, columnNumber: idx + MIN_COLUMNS })).forEach(({ layouts, columnNumber }) => {
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

    private _locateFirstNeighbourIndex(startIndex: number, layouts = this.getLayouts()): number {
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