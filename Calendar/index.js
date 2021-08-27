import React from 'react';
import {View, Text, FlatList} from 'react-native';
import {Calendar} from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import {INACTIVE_COLOR, ORANGE_SHADE} from '../../constants';
import {Button} from '../../components';
const Card = (props) => {
  return (
    <View
      style={{
        marginVertical: 5,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        //elevation: 12,
        borderBottomWidth: 0.4,
        alignItems: 'center',
      }}>
      <Text>{props.item.item.time}</Text>
    </View>
  );
};

export default class CalendarView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'list',
    };
  }
  isMarked = () => {
    //check if the date is marked, i.e. , if the date has an appointment
    return true;
  };
  handleDateSelect = (day) => {
    this.setState({show: 'list'});
  };
  handleTimeSelect = (event, select) => {
    console.log(new Date(select).toLocaleTimeString());
    //if time is not marked add appointment else throw error
  };
  showCalendar = () => {
    switch (this.state.show) {
      case 'list':
        return (
          <View
            style={{
              margin: 10,
              height: 400,
              width: 300,
              backgroundColor: 'white',
              elevation: 12,
            }}>
            <View
              style={{
                padding: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <Text
                style={{fontSize: 20, color: ORANGE_SHADE, fontWeight: 'bold'}}>
                Booked Appointments
              </Text>
            </View>
            <FlatList
              data={[
                {time: '1:00 PM'},
                {time: '1:00 PM'},
                {time: '1:00 PM'},
                {time: '1:00 PM'},
                {time: '1:00 PM'},
                {time: '1:00 PM'},
                {time: '1:00 PM'},
                {time: '1:00 PM'},
                {time: '1:00 PM'},
                {time: '1:00 PM'},
                {time: '1:00 PM'},
              ]}
              //  contentContainerStyle={{height: 200}}
              style={{
                borderWidth: 0,
                padding: 5,
                backgroundColor: 'white',
              }}
              //ListHeaderComponent={() => {
              //  return (
              //    <View
              //      style={{
              //        padding: 10,
              //        alignItems: 'center',
              //        justifyContent: 'space-between',
              //        width: '100%',
              //      }}>
              //      <Text style={{fontSize: 20}}>Booked Appointments</Text>
              //    </View>
              //  );
              //}}
              ListHeaderComponentStyle={{
                marginVertical: 10,
                alignItems: 'center',
                backgroundColor: 'white',
              }}
              renderItem={(item) => <Card item={item} />}
              keyExtractor={(item, index) => index.toString()}
            />
            <Button
              label="Add"
              style={{margin: 10}}
              onPress={() => {
                this.setState({show: 'time'});
              }}
            />
          </View>
        );
        break;
      case 'calendar':
        return (
          <Calendar
            style={{height: 400, width: 300, elevation: 12}}
            onDayPress={this.handleDateSelect}
            markedDates={{
              '2020-08-20': {
                selected: false,
                marked: true,
                dotColor: 'red',
              },
              '2020-08-21': {
                selected: false,
                marked: true,
                dotColor: 'red',
              },
              '2020-08-22': {
                selected: false,
                marked: true,
                dotColor: ORANGE_SHADE,
              },
              '2020-08-23': {
                selected: false,
                marked: true,
                dotColor: 'red',
              },
            }}
          />
        );
        break;
      case 'time':
        return (
          <DateTimePicker
            //testID="dateTimePicker"
            value={new Date()}
            mode={'time'}
            is24Hour={true}
            display="default"
            onChange={this.handleTimeSelect}
            onTouchCancel={() => {
              console.log('check here');
              this.setState((prevState) => {
                console.log('check', prevState);
                return {show: 'list'};
              });
            }}
          />
        );
        break;
    }
  };
  render() {
    const {show} = this.state;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 0,
        }}>
        {this.showCalendar()}
      </View>
    );
  }
}
