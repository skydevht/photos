import { Dimension, Layout, LayoutManager, LayoutProvider } from "recyclerlistview";
import Reanimated from 'react-native-reanimated'
import { getStoryHeight, HEADER_HEIGHT, MAIN_HEADER_HEIGHT } from "./constants";
import GridLayoutManager from "./GridLayoutManager";

export default class GridLayoutProvider extends LayoutProvider {
    private _renderWindowSize?: Dimension;
    private _dataSet?: Array<any>;
    private columnNumber: number;
    scale: Reanimated.SharedValue<number>;
    constructor(
        columnNumber: number,
        scale: Reanimated.SharedValue<number>,
        getLayoutType: (index: number) => string | number,
    ) {
        super(getLayoutType, (type, dim, index) => {
            this.setLayout(type, dim, index);
        })
        this.columnNumber = columnNumber;
        this.scale = scale;
    }

    public newLayoutManager(renderWindowSize: Dimension, isHorizontal?: boolean, cachedLayouts?: Layout[]): LayoutManager {
        this._renderWindowSize = renderWindowSize;
        return new GridLayoutManager(this, renderWindowSize, cachedLayouts)
    }

    private setLayout(type: string | number, dim: Dimension, index: number) {
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
                    const side = this._renderWindowSize.width / this.columnNumber;
                    dim.width = side;
                    dim.height = side;
                    break;
                default:
                    dim.width = 0;
                    dim.height = 0;
            }
    }
}