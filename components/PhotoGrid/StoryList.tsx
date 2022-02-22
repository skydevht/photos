import React from 'react';
import { Dimensions, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useRecoilState } from 'recoil';
import { storiesState } from '../../states';
import { story } from '../../types/interfaces';
import Highlights from '../Highlights';
import { getStoryHeight } from './constants';

interface Props { }

const StoryList: React.FC<Props> = (props) => {
    const [stories, setStories] = useRecoilState(storiesState);
    const SCREEN_WIDTH = Dimensions.get('window').width;
    return <FlatList
        data={stories}
        horizontal={true}
        keyExtractor={(item: story, index: number) => 'StoryItem_' + index + '_' + item.text}
        getItemLayout={(data, index) => {
            return {
                length: 15 + getStoryHeight(SCREEN_WIDTH) / 1.618,
                offset: index * (15 + getStoryHeight(SCREEN_WIDTH) / 1.618),
                index: index
            }
        }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
            <View style={{
                width: 15 + getStoryHeight(SCREEN_WIDTH) / 1.618,
                height: getStoryHeight(SCREEN_WIDTH) + 25,
            }}>
                <Highlights
                    story={item}
                    height={getStoryHeight(SCREEN_WIDTH)}
                />
            </View>
        )}
    />
}
export default StoryList;