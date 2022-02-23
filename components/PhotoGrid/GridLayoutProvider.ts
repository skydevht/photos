import { Dimension, Layout, LayoutManager, BaseLayoutProvider } from "recyclerlistview";
import Reanimated from 'react-native-reanimated'
import { getStoryHeight, HEADER_HEIGHT, MAIN_HEADER_HEIGHT } from "./constants";
import GridLayoutManager from "./GridLayoutManager";

/*
 * This class determines the type of the current row and can estimate its current size
 */
export default class GridLayoutProvider extends BaseLayoutProvider {
    private _getLayoutTypeForIndex: (index: number) => string | number;
    private _renderWindowSize?: Dimension;
    private _tempDim: Dimension;
    private _lastLayoutManager: GridLayoutManager | undefined;
    // animation stuff
    private _columnNumber: number;
    private _scale: Reanimated.SharedValue<number>;
    constructor(
        columnNumber: number,
        scale: Reanimated.SharedValue<number>,
        getLayoutTypeForIndex: (index: number) => string | number,
    ) {
        super();
        this._getLayoutTypeForIndex = getLayoutTypeForIndex;
        this._columnNumber = columnNumber;
        this._scale = scale;
        this._tempDim = { height: 0, width: 0 };
    }

    public newLayoutManager(renderWindowSize: Dimension, isHorizontal?: boolean, cachedLayouts?: Layout[]): LayoutManager {
        this._renderWindowSize = renderWindowSize;
        this._lastLayoutManager = new GridLayoutManager(this, renderWindowSize,  this._columnNumber, this._scale, cachedLayouts)
        return this._lastLayoutManager
    }

    public getLayoutManager(): GridLayoutManager | undefined {
        return this._lastLayoutManager;
    }

    public setComputedLayout(type: string | number, dim: Dimension, index: number, columnNumber = this._columnNumber) {
        if (this._renderWindowSize)
            switch (type) {
                case 'story':
                    dim.width = this._renderWindowSize.width;
                    dim.height = getStoryHeight(this._renderWindowSize.width) + 20 + 1 * MAIN_HEADER_HEIGHT;
                    break;
                case 'header':
                    dim.width = this._renderWindowSize.width;
                    dim.height = HEADER_HEIGHT;
                    break;
                case 'image':
                    const side = this._renderWindowSize.width / columnNumber;
                    dim.width = side;
                    dim.height = side;
                    break;
                default:
                    dim.width = 0;
                    dim.height = 0;
            }
    }
    public getLayoutTypeForIndex(index: number): string | number {
        return this._getLayoutTypeForIndex(index)
    }
    public checkDimensionDiscrepancy(dimension: Dimension, type: string | number, index: number): boolean {
        const dimension1 = dimension;
        this.setComputedLayout(type, this._tempDim, index);
        const dimension2 = this._tempDim;
        if (this._lastLayoutManager) {
            this._lastLayoutManager.setMaxBounds(dimension2);
        }
        return dimension1.height !== dimension2.height || dimension1.width !== dimension2.width;
    }
}