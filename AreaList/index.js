import React from 'react';
import {View, FlatList, Alert, BackHandler} from 'react-native';
import {Card, List} from './components';
import {ActivityIndicator} from 'react-native-paper';
import {ORANGE_SHADE, HEIGHT} from '../../constants';
import {SearchBar, CustomSegmentedControlTab} from '../../components';
import {
  requestHandler,
  decodePolyline,
  goBack,
  addBackHandler,
} from '../../utils';
import ApiManager from '../../ApiManager';
import Icon from 'react-native-vector-icons/FontAwesome5';
export default class AreaList extends React.Component {
  state = {
    data: [],
    show: false,
    search: '',
    openMod: [],
    closeMod: [],
    selectedIndex: 0,
    open: [],
    close: [],
    refresh: false,
  };

  componentDidMount() {
    const {focus, blur} = addBackHandler(this.props.navigation, () => {
      goBack(this.props.navigation);
      return true;
    });
    this.focus = focus;
    this.blur = blur;

    this.setState({show: false});
    this.getData();
  }
  componentWillUnmount() {
    this.focus();
    this.blur();
  }
  refresh = () => {
    this.setState({refresh: true}, this.getData);
  };
  getData = async () => {
    const id = this.props.route.params.id;
    let data = [];
    if (id == 'all') {
      requestHandler(
        ApiManager.getAllAreas,
        (res) => {
          this.splitData(res.data);
        },
        () => {
          this.setState({show: true, refresh: false});
        },
      );
    } else {
      requestHandler(
        ApiManager.getAreas,
        (res) => {
          this.splitData(res.data);
        },
        () => {
          this.setState({show: true, refresh: false});
        },
        id,
      );
    }
  };
  splitData = (data) => {
    let open = [],
      close = [];
    for (var i = 0; i < data.length; i++) {
      console.log('data item', data[i]);
      if (data[i].status == 'open') {
        open.push(data[i]);
      } else {
        close.push(data[i]);
      }
    }
    console.log(open, close);
    this.setState({
      data,
      show: true,
      open,
      close,
      openMod: open,
      closeMod: close,
      refresh: false,
    });
  };
  cardPress = (id) => {
    this.props.navigation.navigate('area', {id});
  };

  handleSearch = (text) => {
    console.log('filtering');
    const reg = new RegExp('(' + text + ')+');

    const {open, close} = this.state;
    let openMod = open.filter((item) => reg.test(item.name));
    let closeMod = close.filter((item) => reg.test(item.name));
    this.setState({search: text, openMod, closeMod});
  };

  render() {
    return (
      <View
        style={{justifyContent: 'center', flex: 1, backgroundColor: '#e3e3e3'}}>
        {!this.state.show && (
          <View
            style={{
              position: 'absolute',
              elevation: 12,
              backgroundColor: 'transparent',
              zIndex: 12,
              height: HEIGHT,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size={50} color={ORANGE_SHADE} />
          </View>
        )}

        <SearchBar
          text={this.state.search}
          onChange={this.handleSearch}
          containerStyle={{width: '90%'}}
        />

        <FlatList
          data={
            this.state.selectedIndex ? this.state.closeMod : this.state.openMod
          }
          ListHeaderComponent={
            <CustomSegmentedControlTab
              values={['Open', 'Close']}
              tabsContainerStyle={{
                width: '90%',
                alignSelf: 'center',
                marginVertical: 10,
              }}
              selectedIndex={this.state.selectedIndex}
              onTabPress={() => {
                this.setState({
                  selectedIndex: 1 - this.state.selectedIndex,
                });
              }}
            />
          }
          refreshing={this.state.refresh}
          renderItem={(item) => {
            return (
              <Card
                item={item}
                navigation={this.props.navigation}
                onPress={this.cardPress}
              />
            );
          }}
          onRefresh={this.refresh}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{paddingBottom: 40}}
        />
      </View>
    );
  }
}
