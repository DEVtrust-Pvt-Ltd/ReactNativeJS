import React from 'react';
import {
  View,
  Animated,
  ScrollView,
  FlatList,
  StyleSheet,
  Text,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {HEIGHT} from '../../constants';

import {HistoryCard, SearchBar, ImageNoteCard, CardList} from './components';
import {CustomSegmentedControlTab} from '../../components';

export default class SlidingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      movable: false,
      mode: false,

      image: null,
    };
    this._draggedValue = new Animated.Value(HEIGHT / 10);
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   console.log(
  //     'sliding panel',
  //     nextProps.notes.length,
  //     this.props.notes.length,
  //   );
  //   if (
  //     nextProps.history != this.props.history ||
  //     nextProps.notes != this.props.notes
  //   )
  //     return true;
  //   else if (nextState != this.state) {
  //     return true;
  //   } else return false;
  // }
  handlePreview = (image) => {
    this.setState({image});
  };
  render() {
    // console.log('Sliding panel');
    return (
      <>
        {this.state.image && (
          <TouchableWithoutFeedback
            onPress={() => {
              this.setState({image: null});
            }}>
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                },
              ]}>
              <Image
                source={this.state.image}
                resizeMode="contain"
                style={{height: '80%', width: '80%'}}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
        <SlidingUpPanel
          draggableRange={{
            bottom: HEIGHT / 8,
            top: HEIGHT - HEIGHT / 10 - 20,
          }}
          allowDragging={this.state.movable}
          animatedValue={this._draggedValue}
          height={HEIGHT}
          friction={0.5}
          snappingPoints={[]}
          containerStyle={{zIndex: 3}}
          onDragEnd={() => {
            this.setState({movable: false});
          }}>
          <View
            style={[
              styles.panel,
              {backgroundColor: '#e3e3e3', borderWidth: 0},
            ]}>
            <TouchableWithoutFeedback
              onPressIn={() => {
                this.setState({movable: true});
              }}>
              <View
                style={{
                  height: HEIGHT / 8,
                  backgroundColor: '#e3e3e3',
                  borderWidth: 0,
                  borderTopLeftRadius: 30,
                  borderTopRightRadius: 30,
                }}>
                <View
                  style={{
                    width: 50,
                    height: 3,
                    borderWidth: 2,
                    alignSelf: 'center',
                    margin: 10,
                    borderRadius: 10,
                    borderColor: 'grey',
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
            <ScrollView
              alwaysBounceHorizontal={false}
              alwaysBounceVertical={false}
              bounces={false}
              overScrollMode="never"
              scrollToOverflowEnabled={false}
              style={{
                borderWidth: 0,
                backgroundColor: '#e3e3e3',
                paddingHorizontal: 0,
              }}>
              <View style={{marginBottom: 10, borderWidth: 0}}>
                <CustomSegmentedControlTab
                  tabsContainerStyle={{
                    width: '90%',
                    height: HEIGHT / 20,
                    alignSelf: 'center',
                  }}
                  tabStyle={{}}
                  values={['History', 'Street Notes']}
                  selectedIndex={this.state.mode ? 0 : 1}
                  onTabPress={(index) => {
                    this.setState({mode: index == 0 ? true : false});
                  }}
                />
                <SearchBar />
                {this.state.mode && (
                  <CardList
                    list={this.props.history}
                    renderItem={(item) => {
                      return <HistoryCard key={item.index} item={item} />;
                    }}
                  />
                )}
                {!this.state.mode && (
                  <CardList
                    list={this.props.notes}
                    renderItem={(item) => {
                      return (
                        <ImageNoteCard
                          key={item.index}
                          item={item}
                          onPress={this.handlePreview}
                        />
                      );
                    }}
                  />
                )}
              </View>
              <View
                style={{
                  height: HEIGHT / 10 + 60,
                  backgroundColor: 'transparent',
                }}
              />
            </ScrollView>
          </View>
        </SlidingUpPanel>
      </>
    );
  }
}
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#efebef',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  panel: {
    flex: 1,
    position: 'relative',
    borderWidth: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
  },
};
