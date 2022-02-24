import React, { useEffect } from 'react';
import { Appbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { default as Reanimated, useSharedValue, useDerivedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { ReText } from 'react-native-redash';

interface Props {
  visible: boolean;
  actions: Array<{ icon: string; color: string; onPress: Function; name: string; }>;
  moreActions: Array<{ icon: string; color: string; onPress: Function; name: string; }>;
  backAction: Function;
  selectedAssets: string[];
  lastSelectedAssetId: string;
  lastSelectedAssetAction: number;
}
const ActionBar: React.FC<Props> = (props) => {
  const opacity = useSharedValue(0); // default is being non-visible
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      top: opacity.value ? 0 : -200
    };
  });

  const { visible } = props;
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: 250,
      easing: Easing.inOut(Easing.linear)
    })
  }, [props.visible])

  const { selectedAssets } = props;
  const numberSelected = useSharedValue('');
  useEffect(() => {
    if (selectedAssets.length) {
      numberSelected.value = '' + selectedAssets.length;
    } else {
      numberSelected.value = '';
    }
  }, [selectedAssets]);

  return (
    <Reanimated.View style={[styles.actionBar, animatedStyle]}>
      <Appbar.Header style={[styles.actionBar]}>
        <Appbar.Action
          key='back'
          color='black'
          icon='close'
          onPress={() => { props.backAction(); }}
          style={[styles.actionBarIcon]}
        />
        <ReText
          style={{ color: 'grey' }}
          text={numberSelected}
        />
        <Appbar.Content title="" subtitle="" />
        {
          props.actions.map((action) => {
            return (<Appbar.Action
              key={action.name}
              color={action.color}
              icon={action.icon}
              onPress={() => { action.onPress(); }}
              style={[styles.actionBarIcon]}
            />);
          })
        }

      </Appbar.Header>
    </Reanimated.View>
  );
};
const styles = StyleSheet.create({
  actionBar: {
    zIndex: 10,
    marginTop: 0,
    backgroundColor: 'white',
  },
  actionBarIcon: {

  }
});
export default ActionBar;