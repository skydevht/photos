import React, { useContext, useEffect, createContext } from 'react';
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

type PossibleContext = Reanimated.SharedValue<number>

const ColumnContext: React.Context<PossibleContext> = createContext({ value: 2 } as PossibleContext);

export function useColumnsNumber() {
  const columns = useContext(ColumnContext);
  return columns;
}

interface Props { }

const ColumnProvider: React.FC<Props> = (props) => {
  const [numColumns, setNumColumns] = useRecoilState(numColumnsState);
  const columns = useSharedValue(numColumns);
  useEffect(() => {
    if (numColumns != columns.value) // numColumns is the source of truthv
      columns.value = numColumns;
  }, [numColumns, columns])
  return (
    <ColumnContext.Provider value={columns}>
      {props.children}
    </ColumnContext.Provider>
  );

}

export default ColumnProvider;