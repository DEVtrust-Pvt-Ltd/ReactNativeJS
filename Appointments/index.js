import React from 'react';
import {View, FlatList, BackHandler, StyleSheet, Modal} from 'react-native';
import {
  ProspectCard,
  AreaCard,
  CalendarView,
  CalendarLegend,
} from './components';
import {ActivityIndicator} from 'react-native-paper';
import {ORANGE_SHADE, HEIGHT} from '../../constants';
import {requestHandler, goBack, getValue} from '../../utils';
import ApiManager from '../../ApiManager';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  SearchBar,
  CustomSegmentedControlTab,
  Calendar,
  Button,
} from '../../components';
export default class Appointments extends React.Component {
  state = {
    prospects: [],
    modProspects: [],
    areas: [],
    modAreas: [],
    show: false,
    selectedIndex: 0,
    refresh: false,
    selectedDate: Date.now(),
    showCalendar: false,
    markedDates: [],
  };

  componentDidMount() {
    this.props.navigation.setOptions({
      headerLeft: () => {
        return (
          <Icon
            name="arrow-left"
            size={25}
            color="white"
            style={{marginLeft: 10, padding: 5}}
            onPress={this.handleBackPress}
          />
        );
      },
      headerRight: () => {
        return (
          <Icon
            name="calendar"
            size={25}
            color="white"
            style={{marginRight: 10, padding: 5}}
            onPress={() => {
              this.setState({showCalendar: !this.state.showCalendar});
            }}
          />
        );
      },
    });
    this.focus = this.props.navigation.addListener('focus', () => {
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBackPress,
      );
      this.setState({show: false});
      this.getData();
    });
    this.blur = this.props.navigation.addListener('blur', () => {
      if (this.backHandler) this.backHandler.remove();
    });

    this.getData();
  }
  handleBackPress = () => {
    if (!this.state.showCalendar) {
      this.setState({showCalendar: true});
    } else goBack(this.props.navigation);
    return true;
  };
  componentWillUnmount() {
    this.focus();
    this.blur();
  }
  convertObjectToDate = (timestamp) => {
    console.log('timestamp', timestamp);
    const date = new Date(timestamp * 1000);
    console.log('date', date);
    const handleNumbers = (num) => {
      //adds zero before single digit numbers
      if (num <= 9) return '0' + num;
      else return num;
    };
    let s =
      date.getFullYear() +
      '-' +
      handleNumbers(date.getMonth() + 1) +
      '-' +
      handleNumbers(date.getDate());
    console.log('s', s);
    return s;
  };

  getProspectAppointments = () => {
    return new Promise((resolve, reject) => {
      requestHandler(
        ApiManager.getAppointments,
        (res) => {
          resolve(res.data);
        },
        (e) => {
          reject();
        },
      );
    });
  };
  getAreaAppointments = () => {
    return new Promise((resolve, reject) => {
      requestHandler(
        ApiManager.getAreaAppointments,
        (res) => {
          resolve(res.data);
        },
        () => {
          reject();
        },
      );
    });
  };
  getData = async () => {
    Promise.all([this.getAreaAppointments(), this.getProspectAppointments()])
      .then((result) => {
        console.log(result);
        let markedDates = {};
        const prospectAppointments = result[1];

        for (var i = 0; i < prospectAppointments.length; i++) {
          if (
            getValue(
              prospectAppointments[i],
              'prospectAppointments[i].appointment.start_time',
            )
          ) {
            const date = this.convertObjectToDate(
              prospectAppointments[i].appointment.start_time,
            );
            console.log(
              'i',
              i,
              date,
              prospectAppointments[i].appointment.start_time,
            );
            if (!markedDates[date]) {
              markedDates[date] = {dots: [{color: '#E3BC08'}]};
            }
          }
        }
        console.log('marked dates', markedDates);
        const areaAppointments = result[0];
        for (var i = 0; i < areaAppointments.length; i++) {
          if (
            getValue(
              areaAppointments[i],
              'prospectAppointments[i].appointment.start_time',
            )
          ) {
            const date = this.convertObjectToDate(
              areaAppointments[i].appointment.start_time,
            );
            if (!markedDates[date]) {
              markedDates[date] = {dots: [{color: '#5ad9a2'}]};
            } else if (
              markedDates[date].dots[0].color == '#E3BC08' &&
              markedDates[date].dots.length == 1
            ) {
              markedDates[date].dots[1] = {color: '#5ad9a2'};
            }
          }
        }
        console.log('marked dates', markedDates['2020-09-30']);
        this.setState({
          prospects: result[1],
          modProspects: result[1],
          areas: result[0],
          show: true,
          modAreas: result[0],
          refresh: false,
          markedDates,
          showCalendar: true,
        });
      })
      .catch(() => {
        goBack(this.props.navigation);
      });
  };
  refresh = () => {
    this.setState({refresh: true}, this.getData);
  };
  onChange = (text) => {
    const reg = new RegExp('(' + text + ')+');
    let {areas, prospects} = this.state;
    let modAreas = areas.filter((item) => {
      return reg.test(item.name);
    });
    let modProspects = prospects.filter((item) => {
      return reg.test(item.first_name + ' ' + item.last_name);
    });
    this.setState({search: text, modAreas, modProspects});
  };
  render() {
    const {selectedDate, show, showCalendar} = this.state;
    return (
      <View style={{justifyContent: 'center', flex: 1}}>
        <>
          {show && showCalendar && (
            <View
              style={{
                position: 'absolute',

                ...StyleSheet.absoluteFill,
                width: '100%',

                justifyContent: 'center',
                alignItems: 'center',
                elevation: 12,
                zIndex: 12,
              }}>
              <CalendarView
                markedDates={this.state.markedDates}
                selectedDay={selectedDate}
                onDayPress={(day) => {
                  console.log('day', day);
                  this.setState({selectedDate: day, showCalendar: false});
                }}
                style={{alignSelf: 'center', height: HEIGHT / 2}}
              />
              {/*<Button
                label="Close"
                style={{marginTop: 20, width: '90%'}}
                onPress={() => {
                  this.setState({showCalendar: false});
                }}
              />*/}
              <CalendarLegend />
            </View>
          )}
          {!show && !showCalendar && (
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
          {show && !showCalendar && (
            <>
              <View>
                <SearchBar
                  containerStyle={{
                    width: '90%',
                    backgroundColor: this.state.confirmDelete ? null : 'white',
                    elevation:
                      this.state.confirmDelete || showCalendar ? null : 12,
                  }}
                  text={this.state.search}
                  onChange={this.onChange}
                />
              </View>
              <FlatList
                onRefresh={this.refresh}
                refreshing={this.state.refresh}
                data={
                  this.state.selectedIndex
                    ? this.state.modAreas
                    : this.state.modProspects
                }
                ListHeaderComponent={
                  <CustomSegmentedControlTab
                    values={['Prospects', 'Areas']}
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
                renderItem={(item) => {
                  const data = item.item;
                  console.log(
                    new Date(data.appointment.start_time * 1000).toDateString(),
                    new Date(this.state.selectedDate).toDateString(),
                  );
                  if (
                    new Date(
                      data.appointment.start_time * 1000,
                    ).toDateString() ==
                    new Date(this.state.selectedDate).toDateString()
                  ) {
                    if (this.state.selectedIndex)
                      return (
                        <AreaCard
                          item={item}
                          navigation={this.props.navigation}
                        />
                      );
                    else
                      return (
                        <ProspectCard
                          item={item}
                          navigation={this.props.navigation}
                        />
                      );
                  }
                }}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{paddingBottom: 40}}
              />
            </>
          )}
        </>
      </View>
    );
  }
}
