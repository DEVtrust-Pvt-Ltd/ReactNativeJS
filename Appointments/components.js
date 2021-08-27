import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {HEIGHT, INACTIVE_COLOR, ORANGE_SHADE, WIDTH} from '../../constants';
import {Button} from '../../components';
import {Calendar} from 'react-native-calendars';
import moment from 'moment';
export const CalendarLegend = (props) => {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'white',
        elevation: 12,
        borderRadius: 10,
        marginTop: 40,
        margin: 20,
      }}>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderWidth: 0,
          marginVertical: 5,
        }}>
        <View
          style={{
            height: 30,
            width: 30,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>17</Text>
          <View
            style={{
              height: 5,
              width: 5,
              borderRadius: 3,
              backgroundColor: '#E3BC08',
            }}
          />
        </View>
        <Text style={{flex: 1}}>
          This date has one or more Prospect Appointments
        </Text>
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderWidth: 0,
          marginVertical: 5,
        }}>
        <View
          style={{
            height: 30,
            width: 30,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>17</Text>
          <View
            style={{
              height: 5,
              width: 5,
              borderRadius: 3,
              backgroundColor: '#5ad9a2',
            }}
          />
        </View>
        <Text style={{flex: 1}}>
          This date has one or more Area Appointments
        </Text>
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderWidth: 0,
          marginVertical: 5,
        }}>
        <View
          style={{
            height: 30,
            width: 30,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: ORANGE_SHADE,
          }}>
          <Text style={{color: 'white'}}>17</Text>
        </View>
        <Text style={{flex: 1, margin: 5}}>Currently Selected Date</Text>
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          borderWidth: 0,
          marginVertical: 5,
        }}>
        <View
          style={{
            height: 30,
            width: 30,
            borderRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: ORANGE_SHADE}}>17</Text>
        </View>
        <Text style={{flex: 1, margin: 5}}>Today's Date</Text>
      </View>
    </View>
  );
};
export const CalendarView = (props) => {
  const convertDateToObject = (day) => {
    const mm = moment(day).utc();

    const newDate = moment()
      .date(mm.date())
      .month(mm.month())
      .year(mm.year())
      .toDate();
    console.log(
      'check',
      mm.date(),
      mm.month(),
      mm.year(),
      newDate.toDateString(),
    );
    props.onDayPress(Date.parse(newDate));
  };
  const convertObjectToDate = (timestamp) => {
    const date = new Date(timestamp);

    let s =
      date.getFullYear() +
      '-' +
      handleNumbers(date.getMonth() + 1) +
      '-' +
      handleNumbers(date.getDate());

    return s;
  };
  const handleNumbers = (num) => {
    //adds zero before single digit numbers
    if (num <= 9) return '0' + num;
    else return num;
  };
  console.log(props.markedDates);
  return (
    <Calendar
      theme={{
        todayTextColor: ORANGE_SHADE,
        arrowColor: ORANGE_SHADE,
        monthTextColor: ORANGE_SHADE,
      }}
      //headerStyle={{borderWidth: 1}}
      style={[
        {
          //top: -50,
          //position: 'absolute',
          zIndex: 50,
          height: 350,
          marginTop: 20,
          width: WIDTH - 40,
          elevation: 12,
          borderRadius: 10,
        },
        props.style,
      ]}
      onDayPress={(day) => {
        convertDateToObject(day.timestamp);
      }}
      markingType="multi-dot"
      markedDates={{
        ...props.markedDates,
        [convertObjectToDate(props.selectedDay)]: {
          ...props.markedDates[convertObjectToDate(props.selectedDay)],
          selected: true,
          selectedColor: ORANGE_SHADE,
        },
      }}
    />
  );
};

export const ProspectCard = (props) => {
  const item = props.item.item;
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View
          style={{flex: 2, justifyContent: 'space-between', borderWidth: 0}}>
          {item.name ? (
            <Text style={styles.headerStyle}>{item.name}</Text>
          ) : (
            <Text style={styles.headerStyle}>
              {(item.first_name + ' ' + (item.last_name || '')).trim()}
            </Text>
          )}
          <View style={{borderWidth: 0, marginTop: 10}}>
            <Text style={{fontSize: 15, color: 'black'}}>
              Visit Count:{' '}
              <Text style={{fontWeight: 'normal', color: INACTIVE_COLOR}}>
                {item.total_visit_count}
              </Text>
            </Text>
            <Text style={{fontSize: 15, color: 'black', marginTop: 5}}>
              Date of Contact:{' '}
              <Text style={{fontWeight: 'normal', color: INACTIVE_COLOR}}>
                {new Date(
                  item.last_follow_up?.date_updated * 1000 ||
                    item.last_follow_up_date,
                ).toLocaleDateString()}
              </Text>
            </Text>
          </View>
        </View>
        <View
          style={{
            borderWidth: 0,
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <Button
            style={{width: '90%', marginBottom: 10}}
            label="Select"
            onPress={() => {
              props.navigation.navigate('details', {id: item._id});
            }}
          />
        </View>
      </View>
    </View>
  );
};
export const AreaCard = (props) => {
  // console.log(props.item.item);
  const item = props.item.item;
  return (
    <View
      style={{
        borderWidth: 0,
        alignSelf: 'center',
        marginVertical: 10,
        elevation: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        width: '90%',
        padding: 10,
        paddingVertical: 15,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderWidth: 0,
          marginBottom: 5,
        }}>
        <View style={{flex: 1.5, borderWidth: 0, justifyContent: 'flex-start'}}>
          <Text
            style={{
              fontSize: HEIGHT / 35,
              fontWeight: 'bold',
            }}>
            {item.name}
          </Text>

          <Text style={{fontSize: HEIGHT / 40, marginTop: 10}}>
            {item.number_of_doors} Doors
          </Text>
        </View>
        <View style={{flex: 1, padding: 5, justifyContent: 'center'}}>
          <Button
            label="Select"
            onPress={() => {
              props.navigation.navigate('area', {id: item._id});
            }}
          />
        </View>
      </View>
      {item.checkin && item.checkin.user && (
        <View style={{marginTop: 5}}>
          <Text style={{color: '#505050'}}>
            Completed by{' '}
            {item.checkin.user.first_name + ' ' + item.checkin.user.last_name}{' '}
            on {new Date(item.checkin.start_time * 1000).toDateString()}
          </Text>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    borderWidth: 0,
    alignSelf: 'center',
    marginVertical: 10,
    elevation: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    padding: 15,
  },
  headerStyle: {
    fontSize: HEIGHT / 30,
    fontWeight: '600',
    borderWidth: 0,
  },
});
