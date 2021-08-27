import React from 'react';
import {
  View,
  Text,
  Alert,
  BackHandler,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {CustomTextInput, Button, Calendar, Menu, PopUp} from '../../components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import PhoneInput from 'react-native-phone-input';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {
  ORANGE_SHADE,
  INACTIVE_COLOR,
  HEIGHT,
  ORGANIZATION_ID,
  USER_ID,
} from '../../constants';
import {ActivityIndicator} from 'react-native-paper';
import {requestHandler, getParent, goBack, functionHandler} from '../../utils';
import ApiManager from '../../ApiManager';
import IdManager from '../../IdManager';
import {Calendar as CalendarView} from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
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
export default class AddProspect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //handles activity indicator
      showIndicator: true,
      expandGeneralInfo: false,
      showMenu: null,
      //maintains an initial json for form
      value: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        marital_status: '',
        prospect_status: '',
        country_code: 1,
        latitude: 0,
        longitude: 0,
        address: '',
        organization_id: '',
        added_by: '',
        note: {
          message: '',
        },
      },
    };

    //hold function to unsubscribe from navigation listener
    this.focus = null;
    this.blur = null;

    //memory for funnctions timestamps
    this.memory = {};

    //result after save
    this.result = {};
  }

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
    });
    //handles case when user navigates from map screen and cancels adding prospect
    this.focus = this.props.navigation.addListener('focus', () => {
      this.backhandler = BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBackPress,
      );

      //Checks and sets address from Area and EditAddress Screens
      console.log('focus', this.state.showMenu);
      if (this.state.showMenu == 'waiver') {
        console.log('focus waiver');
        this.setState({showMenu: 'popup'});
      }
      if (this.props.route.params) {
        if (getParent(this.props.navigation) == 'area') {
          const {params} = this.props.route;
          console.log(params);
          this.setState({
            value: {
              ...this.state.value,
              address: params.address,
              latitude: params.value.latitude,
              longitude: params.value.longitude,
              area_id: params.area_id,
            },
          });
        } else {
          this.setState({
            value: {
              ...this.state.value,
              address: this.props.route.params.address,
              latitude: this.props.route.params.latitude,
              longitude: this.props.route.params.longitude,
            },
          });
        }
      }
    });

    //removes listener for backhandler
    this.blur = this.props.navigation.addListener('blur', () => {
      if (this.backhandler) this.backhandler.remove();
    });
  }
  componentWillUnmount() {
    this.focus();
    this.blur();
  }

  handleBackPress = () => {
    if (this.state.showMenu) {
      this.setState({showMenu: null});
    } else if (getParent(this.props.navigation) == 'area') {
      //sending prospect false ensures in area screen that marker is removed
      this.props.navigation.navigate('area', {prospect: null});
    } else {
      goBack(this.props.navigation);
    }
    return true;
  };
  //ensures necessary keys and removes unnecessary keys before submitting form
  getValue = async () => {
    //checks for compulsory first name
    if (this.state.value.first_name == '') {
      Alert.alert(
        'Alert',
        'Please add First Name',
        [
          {
            text: 'Ok',
            onPress: () => {
              this.setState({showIndicator: true});
            },
          },
        ],
        {cancelable: false},
      );
      return false;
    }

    //checks and removes empty or null keys
    const keys = Object.keys(this.state.value);
    var value = {};
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] == 'note') {
        if (this.state.value.note.message == '') continue;
        else {
          value.notes = [
            {
              user_id: IdManager.getUserID(),
              text: this.state.value.note.message,
            },
          ];
        }
        continue;
      }
      if (
        this.state.value[keys[i]] != '' &&
        this.state.value[keys[i]] != null &&
        this.state.value[keys[i]]
      )
        value[keys[i]] = this.state.value[keys[i]];
    }

    //adds user id and church id
    value.organization_id = await ORGANIZATION_ID();
    value.user_id = await USER_ID();
    value.location_ids = [IdManager.getLocationID()];
    //Sets latlng to zero if missing
    if (!value.latitude) {
      value.latitude = 0;
    }
    if (!value.longitude) {
      value.longitude = 0;
    }
    if (value.country_code) value.country_code = value.country_code.toString();
    return value;
  };

  handleNavigationAfterSave = () => {
    const {value, res} = this.result;
    if (getParent(this.props.navigation) == 'area')
      this.props.navigation.navigate('area', {
        prospect: (value.first_name + ' ' + (value.last_name || '')).trim(),
      });
    else this.props.navigation.navigate('prospectlist', {data: res});
  };

  //makes api request to add new prospect
  save = async () => {
    //get modified value for api
    const value = await this.getValue();
    if (value != false) {
      //show indicator
      this.setState({showIndicator: true});
      console.log(value);
      //makes api request
      requestHandler(
        ApiManager.addProspect,
        (res) => {
          this.result = {res, value, id: res.data._id};
          // show popup
          this.setState({showMenu: 'waiver'});
          //if yes show calendar
          //else handle navigation
        },
        () => {
          this.setState({showIndicator: false});
        },
        value,
      );
    }
  };
  setValue = (key, val) => {
    let {value} = this.state;
    value[key] = val;
    this.setState({value});
  };
  isMarked = () => {
    //check if the date is marked, i.e. , if the date has an appointment
    return true;
  };
  handleDateSelect = (day) => {
    this.setState({showMenu: 'list'});
  };
  handleTimeSelect = (event, select) => {
    console.log(new Date(select).toLocaleTimeString());
    this.setState({showMenu: null});
    //if time is not marked add appointment else throw error
  };

  showCalendar = () => {
    switch (this.state.showMenu) {
      case 'popup':
        return (
          <PopUp
            heading="Do you want to add an appointment?"
            options={['Yes', 'No']}
            onPress={(choice) => {
              this.setState({showMenu: null});
              if (choice == 'Yes') {
                this.props.navigation.replace('setappointment', {
                  id: this.result.id,
                  afterSave: {
                    ...this.result,
                    parent: getParent(this.props.navigation),
                  },
                });
              } else {
                this.handleNavigationAfterSave();
              }
            }}
          />
        );
      case 'waiver':
        return (
          <PopUp
            heading="Do you want to sign a contract?"
            options={['Yes', 'No']}
            onPress={(choice) => {
              if (choice == 'Yes') {
                this.props.navigation.push('contractlist', {
                  id: this.result.id,
                  contractValue: 0,
                  contract: [],
                });
              } else {
                this.setState({showMenu: 'popup'});
              }
            }}
          />
        );
      case 'list':
        return (
          <View
            style={{
              margin: 10,
              height: 400,
              width: 300,
              backgroundColor: 'white',
              elevation: 12,
              borderRadius: 10,
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
              style={{
                borderWidth: 0,
                padding: 5,
                backgroundColor: 'white',
              }}
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
                this.setState({showMenu: 'time'});
              }}
            />
          </View>
        );

      case 'calendar':
        return (
          <CalendarView
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

      case 'time':
        return (
          <DateTimePicker
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
    }
  };
  render() {
    const {value} = this.state;
    return (
      <KeyboardAwareScrollView
        alwaysBounceHorizontal={false}
        alwaysBounceVertical={false}
        bounces={false}
        overScrollMode="never"
        scrollToOverflowEnabled={false}
        keyboardShouldPersistTaps="handled"
        style={{backgroundColor: '#e3e3e3'}}
        onScroll={() => Keyboard.dismiss()}>
        {!this.state.showIndicator && (
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

        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: '#e3e3e3',
            paddingBottom: 40,
            paddingTop: 10,
          }}>
          {this.state.showMenu && (
            <TouchableWithoutFeedback
              onPress={() => {
                this.setState({showMenu: null});
              }}>
              <View
                style={{
                  position: 'absolute',
                  ...StyleSheet.absoluteFillObject,
                  //backgroundColor: 'rgba(0,0,0,0.4)',
                  zIndex: 20,
                  elevation: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {this.showCalendar()}
              </View>
            </TouchableWithoutFeedback>
          )}
          <View
            style={{
              width: '90%',
              borderWidth: 0,
              margin: 10,
              backgroundColor: 'white',
              borderRadius: 10,
              elevation: 12,
              padding: 10,
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 15, color: 'grey'}}>
              PERSONAL INFORMATION
            </Text>
            <CustomTextInput
              value={value.first_name}
              onChangeText={(text) => {
                this.setValue('first_name', text);
                // this.setState({value: {...value, }});
              }}
              style={{
                width: '100%',
                borderRadius: 5,
                height: 40,
                fontSize: 12,
              }}
              textStyle={{height: 50 < HEIGHT / 12 ? 50 : HEIGHT / 12}}
              placeholder="First Name"
            />
            <CustomTextInput
              value={value.last_name}
              onChangeText={(text) => {
                this.setValue('last_name', text);
                // this.setState({value: {...value, }});
              }}
              style={{
                width: '100%',
                borderRadius: 5,
                height: 40,
                fontSize: 12,
              }}
              textStyle={{height: 50 < HEIGHT / 12 ? 50 : HEIGHT / 12}}
              placeholder="Last Name"
            />
            <Calendar
              label="Date of Birth"
              date={value.date_of_birth}
              onChange={(date) => {
                this.setValue('date_of_birth', date);
                // this.setState({
                //   value: {...value, : },
                // });
              }}
            />
            <Menu
              onChange={(selection) => {
                this.setValue('gender', selection);
                // this.setState({value: {...value, : }});
              }}
              value={value.gender}
              placeholder="Gender"
              options={['Male', 'Female']}
              style={{
                width: '100%',
                borderWidth: 1,
                height: 40,
              }}
            />
          </View>
          {/*<View
            style={{
              width: '90%',
              borderWidth: 0,
              margin: 10,
              backgroundColor: 'white',
              borderRadius: 10,
              elevation: 12,
              padding: 10,
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 15, color: 'grey'}}>
              CONTACT INFORMATION
            </Text>
          </View>
          <View
            style={{
              width: '90%',
              borderWidth: 0,
              margin: 10,
              backgroundColor: 'white',
              borderRadius: 10,
              elevation: 12,
              padding: 10,
            }}>
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 15,
                color: 'grey',
                marginBottom: 5,
              }}>
              SPIRITUAL INFORMATION
            </Text>
          </View>*/}

          <View
            style={{
              width: '90%',
              borderWidth: 0,
              margin: 10,
              backgroundColor: 'white',
              borderRadius: 10,
              elevation: 12,
              padding: 10,
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 15, color: 'grey'}}>
              NOTE
            </Text>
            <View
              style={{
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <CustomTextInput
                value={value.note.message}
                onChangeText={(text) => {
                  this.setState({value: {...value, note: {message: text}}});
                }}
                style={{
                  width: '100%',
                  borderRadius: 5,
                  height: 40,
                  fontSize: 12,
                }}
                placeholder="Add Note"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          <View
            style={{
              width: '90%',
              borderWidth: 0,
              margin: 10,
              backgroundColor: 'white',
              borderRadius: 10,
              elevation: 12,
              padding: 10,
              justifyContent: 'center',
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontWeight: 'bold', fontSize: 15, color: 'grey'}}>
                GENERAL INFORMATION
              </Text>
              <Icon
                name={this.state.expandGeneralInfo ? 'minus' : 'plus'}
                style={{
                  position: 'absolute',

                  right: 10,
                  color: 'grey',
                }}
                size={15}
                onPress={() => {
                  this.setState({
                    expandGeneralInfo: !this.state.expandGeneralInfo,
                  });
                }}
              />
            </View>
            {this.state.expandGeneralInfo && (
              <View
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: 0,
                }}>
                <CustomTextInput
                  value={value.email}
                  onChangeText={(text) => {
                    this.setValue('email', text);
                    // this.setState({value: {...value, : }});
                  }}
                  style={{
                    width: '100%',
                    borderRadius: 5,
                    height: 40,
                    fontSize: 12,
                  }}
                  textStyle={{height: 50 < HEIGHT / 12 ? 50 : HEIGHT / 12}}
                  placeholder="EMAIL"
                />
                <PhoneInput
                  pickerBackgroundColor="#e3e3e3"
                  pickerButtonColor={ORANGE_SHADE}
                  flagStyle={{marginLeft: 10}}
                  ref={(phone) => {
                    this.phone = phone;
                  }}
                  textProps={{
                    onFocus: () => {
                      this.setState({phoneInput: 1});
                    },
                    onBlur: () => {
                      this.setState({phoneInput: 0});
                    },
                    placeholder: 'Phone Number',
                    style: {fontSize: 12},
                  }}
                  style={[
                    {
                      width: '100%',
                      borderWidth: 1,
                      height: 40,
                      borderRadius: 5,
                      marginVertical: 5,
                      borderColor: this.state.phoneInput
                        ? ORANGE_SHADE
                        : INACTIVE_COLOR,
                    },
                  ]}
                  textStyle={{flex: 1}}
                  value={this.state.number}
                  onChangePhoneNumber={(number) => {
                    this.setValue('phone', number);
                    // this.setState({value: {...value, : }});
                  }}
                  onSelectCountry={(iso2) => {
                    console.log(this.phone.getCountryCode());
                    this.setValue('country_code', this.phone.getCountryCode());
                  }}
                />
                <Menu
                  onChange={(selection) => {
                    this.setState({
                      value: {...value, marital_status: selection},
                    });
                  }}
                  value={value.marital_status}
                  placeholder="Marital Status"
                  options={['Single', 'Married', 'Widow', 'Widower']}
                  style={{
                    borderWidth: 1,
                    height: 40,
                    //width: 200,
                  }}
                />
                <Menu
                  onChange={(selection) => {
                    this.setState({
                      value: {...value, prospect_status: selection},
                    });
                  }}
                  value={value.prospect_status}
                  placeholder="Prospect Status"
                  options={[
                    'Active',
                    'Added to Organization',
                    'Inactive',
                    'Dead End',
                  ]}
                  style={{
                    borderWidth: 1,
                    height: 40,
                    //width: '90%',
                  }}
                />
                <CustomTextInput
                  value={value.address}
                  onChangeText={(text) => {
                    this.setValue('address', text);
                    // this.setState({value: {...value, : }});
                  }}
                  style={{
                    width: '100%',
                    borderRadius: 5,
                    padding: 5,
                    lineHeight: 15,
                    fontSize: 12,
                  }}
                  placeholder="Address"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}
          </View>
          {/*<TouchableOpacity
            onPress={() => {
              this.setState({showMenu: 'popup'});
              
            }}
            style={{
              width: '90%',
              borderWidth: 0,
              margin: 10,
              backgroundColor: 'white',
              borderRadius: 10,
              elevation: 12,
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 15, color: 'grey'}}>
              SET DATE
            </Text>
          </TouchableOpacity>*/}
          {!(this.props.route.params && this.props.route.params.area_id) && (
            <Button
              label="Edit Address"
              style={{width: '90%', margin: 10}}
              colors={['#522271', '#472d58']}
              onPress={() => {
                this.props.navigation.push('editaddress');
              }}
            />
          )}
          <View style={{width: '90%'}}>
            <Button
              label="Save"
              style={{marginVertical: 5, width: '100%'}}
              onPress={() => {
                functionHandler(this, 'save');
              }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}
