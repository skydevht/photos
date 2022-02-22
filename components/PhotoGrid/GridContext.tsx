import React, { useContext, useEffect, createContext, useState } from 'react';
import {
  useRecoilState,
} from 'recoil';
import { numColumnsState } from '../../states';
import {
  default as Reanimated,
  useAnimatedGestureHandler,
  Easing,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type PossibleContext = {columns?: number, setColumns?: Function, scale?: Reanimated.SharedValue<number> }

const GridContext: React.Context<PossibleContext> = createContext({} as PossibleContext);

export function useColumnsNumber() {
  const {columns, setColumns} = useContext(GridContext);
  return [columns, setColumns];
}

export function useScale() {
  const {scale} = useContext(GridContext);
  return scale as Reanimated.SharedValue<number>;
}

interface Props { }

const GridProvider: React.FC<Props> = (props) => {
  const [numColumns, setNumColumns] = useRecoilState(numColumnsState);
  const [columns, setColumns] = useState(numColumns);
  const scale = useSharedValue(1);
  return (
    <GridContext.Provider value={{columns, setColumns, scale }}>
      {props.children}
    </GridContext.Provider>
  );

}

export default GridProvider;