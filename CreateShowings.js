import React, { Component } from "react";
import { Alert, StyleSheet, ImageBackground, View, ScrollView, ActivityIndicator, TouchableOpacity, Slider, Image, Dimensions, Keyboard, Platform } from 'react-native';
import { Text, Icon, Col, Form, Item, Label, Input, Textarea, Tab, Tabs, TabHeading, CheckBox, ListItem } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TimePicker from './services/MyTimepicker';
import Autocomplete from 'native-base-autocomplete';
import SimpleReactValidator from 'simple-react-validator';
import AsyncStorage from '@react-native-community/async-storage';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from 'react-native-google-signin';
import { getApiData, postAuthApiData, agentId, getBaseUrl } from './services/Api';
import { decryptvalue } from './services/customdcrypt';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Moment from 'moment';
//------------------------------------------------------Import section end -----------------------------------
let _this = null;
const HOST = getBaseUrl;
const API = HOST + '/front/agent/addShowing/clientSearch';
const API2 = HOST + '/front/agent/getbuildingbyaddress';
const { height } = Dimensions.get('screen');
class Showing2 extends Component {
  //-----------------------------------------------------NAVIGATION SECTION ------------------------------------
  static navigationOptions = {
    headerTitleStyle: {
      fontSize: 24,
      letterSpacing: 1,
      fontFamily: 'Montserrat-Bold',
      marginLeft: 2,
      textTransform: 'uppercase'
    },
    headerLeft: <View><Text style={{
      fontSize: 23,
      letterSpacing: 1,
      fontFamily: 'Montserrat-Bold',
      marginLeft: 5,
      paddingLeft: 5,
      color: '#fff',
      textTransform: 'uppercase'
    }}>Skyward</Text></View>,
    headerRight:
      <View style={{ flexDirection: 'row' }}>
       

        <TouchableOpacity style={{
          marginLeft: 10, marginRight: 10, width: 25, ...Platform.select({
            ios: {
              marginTop: 5,
            },
            android: {
              marginTop: -10,
            },
          }),
        }} onPress={() => _this.handleLogout()}>
          <Text style={{ color: '#fff', fontFamily: 'Montserrat-Bold', fontSize: 12, textTransform: 'uppercase', marginTop: 0, marginBottom: 3, }}>  <Icon type="Feather" name="log-out" style={{ fontSize: 20, color: 'white' }} /></Text>
        </TouchableOpacity>
      </View>,

    headerStyle: {
      backgroundColor: '#004F6B',

    },
    headerTintColor: '#fff',

  };
  //----------------------------------------------END NAVIGATION-------------------------------------------------------------
  _isMounted = false;


  constructor(props) {
    let today = new Date(new Date());//.getTime() + (8 * 24 * 60 * 60 * 1000));
    let todaydate = Moment(today).format('MMMM DD,YYYY');
    let startDatesave = Moment(today).format('YYYY-MM-DD HH:mm:ss');
    super(props);
    this.state = {
      loading: true,
      isModalVisible: false,
      isModalVisible1: false,
      value: 50,
      checked: false,
      logoutstate: 0,
      placeholder: "Enter Email",
      isDateTimePickerVisible: false,
      isTimePickerVisible: false,
      s_showing_date: todaydate,
      showing_date: startDatesave,
      s_showing_time: '',
      employees: [],
      query: '',
      selectedEmployee: null,
      address: [],
      address_query: '',
      selectedAddress: null,
      selected_clientName: '',
      selected_clientId: 0,
      client_contact: '',
      email: '',
      units: [],
      units_query: '',
      selected_Unit: null,
      err_msg: '',
      AddressLoading: true,
      disableButton:0
    };
    this.validator = new SimpleReactValidator();
  }
  goTocreate() {
    this.props.navigation.navigate('ShowingScreen');
  }
  focusTheField = (id) => {
    this.inputs[id]._root.focus();
  }
  //--------------------------------------------DATE TIME PICKER--------------------------------------------
  showDateTimePicker = () => {

    this.setState({ isDateTimePickerVisible: true });
   
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
    Keyboard.dismiss();
  };
 
  
  handleDatePicked = date => {
    this.setState({ s_showing_time: '' });
    this.setState({ err_msg: '' });
    let startDate = Moment(date).format('YYYY-MM-DD HH:mm:ss');
    let startDate_show = Moment(date).format('MMMM DD,YYYY');
    //September 20, 2019
    //___________________LAST DATE_____________________
    var lastday = new Date(new Date().getTime() + (8 * 24 * 60 * 60 * 1000));
    let enddate = Moment(lastday).format('YYYY-MM-DD');
    //___________________START DATE_____________________________
    var minusday = new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000));
    let curr_date = Moment(minusday).format('YYYY-MM-DD');
    //minus 1 day from current for after
    //_______________________SELECTED DATE______________________
    let startdatecmp = Moment(date).format('YYYY-MM-DD');
    //_______________________Compare_________________________________

   
    isbet = Moment(startdatecmp).isBetween(curr_date, enddate);
   
    if (isbet) {
      this.setState({ showing_date: startDate, s_showing_date: startDate_show })
    } else {
      this.setState({ err_msg: "Please select within 7 days." })
    }
    //________________________________________________

    console.log("A date has been picked: ", startDate);
    //Keyboard.dismiss();
    this.hideDateTimePicker();
  };

  //----------------------NEW TIME-------------------------
  onCancel() {
    this.TimePicker.close();
  }

  onConfirm(hour, minute) {
    let time = `${hour}:${minute}`;
    this.setState({ err_msg: "" });

    let showingTime = Moment(time, 'h:mm').format('HH:mm:00');
    let displayTime = Moment(time, 'h:mm').format('hh:mm A')
    this.setState({ err_msg: "" });
    
    let showingTimeCheck = Moment(time, 'HH:mma');

    let endTime = Moment('9:01pm', 'HH:mma');
    let startTime = Moment('6:59am', 'HH:mma');
    amIBetween = showingTimeCheck.isBetween(startTime, endTime);
    let curr_time1 = new Date();

    selected_date = Moment(this.state.s_showing_date).format('MMMM DD,YYYY');
    compdate = Moment(curr_time1).format('MMMM DD,YYYY');
    let curr_time = Moment(curr_time1, 'HH:mma');
    console.log("Sd" + Moment(curr_time1));
    diff_days = Moment(selected_date).diff(Moment(curr_time1), 'days');
    let aftercurrenttime = showingTimeCheck.isAfter(curr_time);
    console.log(diff_days + "--" + aftercurrenttime);
   
    var now = Moment();

    if (now >= Moment(selected_date)) {
      // date is past
      if (amIBetween && aftercurrenttime) {
        this.setState({ showing_time: showingTime, s_showing_time: displayTime });
      } else {
        this.setState({ showing_time: '', s_showing_time: '', err_msg: "This time slot has expired! Please select an available slot." });
      
      }
    } else {
      if (amIBetween) {
        this.setState({ showing_time: showingTime, s_showing_time: displayTime });
      } else {
        this.setState({ showing_time: '', s_showing_time: '', err_msg: "Time slots should between 7am to 9pm" });
      
      }
    }




    console.log("A Time has been picked: ", showingTime);
   
    this.TimePicker.close();
  }
 
  //----------------------------------------------------------------------------------------------
  //----------------------------------------------LOG OUT ----------------------------------------
  handleLogout() {
    this.setState({ loading: true });
    if (this.state.logoutstate == 0) {
      this.setState({ logoutstate: 1 });
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            onPress: () => this.setState({ loading: false }),
            style: "cancel"
          },
          {
            text: "OK",
            onPress: () => this._signOut()
          }
        ],
        { cancelable: false }
      );
    } else {
      alert('Logging out please wait...')
    }

  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('LandingScreen');
  };
  _signOut = async () => {
    //Remove user session from the device.
    this.setState({ loading: true });
    try {

      console.log('google revoke');
      await GoogleSignin.signOut();
      console.log('google signout');
      this.setState({ userInfo: null }); // Remove the user from your app's state as well
      this._signOutAsync();
      this.setState({ loading: false });
    } catch (error) {
      console.error(error);
      this.setState({ loading: false });
    }
  };
  //----------------------------------------------------------------------------------------------------------
  //-------convert phone number-------------------------------------------------------------------------------
  covertPhonenumber(phone_no) {
    var res = phone_no.replace(/\D+/g, '').replace(/^(\d{3})(\d{3})(\d{4}).*/, '$1-$2-$3');
    return res;
  }
  //--------------------------------------------COMPONENT MOUNT UN-MOUNT----------------------------------------------------------------
  componentDidMount() {
    _this = this;
    _isMounted = true;
    this.setState({ loading: true });
    //this.getAddress(); 
    fetch(`${API2}`).then(res => res.json()).then((jsonAddress) => {
      this.setState({ address: jsonAddress, AddressLoading: false });
    });
    ///------------------------------
    fetch(`${API}`).then(res => res.json()).then((json) => {
      this.setState({ employees: json });
    });
  

    this.setState({ loading: false });
  }
  componentWillUnmount() {
    _isMounted = false;
  }
  //---------------------------------------------------------------------------------------------------------------------
  //------------------------------------------AUTO COMPLETE-AND FETCH FOR AUTOCOMPLETE ADDRESS----------------------------
  findEmployee(query) {
    if (query === '') {
      return [];
    }
    const { employees } = this.state;
    const regex = new RegExp(`${query.trim()}`, 'i');
    return employees.filter(employee => employee.name.search(regex) >= 0);
  }
  //------------------------------------------
  //------------------------------------------AUTO COMPLETE-AND FETCH FOR AUTOCOMPLETE ADDRESS----------------------------
  findAddress(address_query) {
    if (address_query === '') {
      return [];
    }
    const { address } = this.state;
    const regex = new RegExp(`${address_query.trim()}`, 'i');
    return address.filter(addr => addr.building_address.search(regex) >= 0);
  }

  //----------------------------CONVERT VALUE UNUSED ----------------------------------------------
  change(value) {
    this.setState(() => {
      return {
        value: parseFloat(value),
      };
    });
  }
  //------------------------------------OPEN SHOWOING CREATION POPUP------------------------------------
  toggleModal = () => {
    this.setState({ s_showing_date: '', s_showing_time: '' })
    this.setState({ isModalVisible: !this.state.isModalVisible });

  };
  //-----------------------------------CHECK STATUS OF AV.LEADS TO SHOW HIDE BUTTONS -----------------------
  isAvlLead() {
    this.setState({ checked: !this.state.checked });
  }
  //-----------------------------------CREATE SHOWINGS VALIDATION AND ACTIONS -----------------------------------
  createShowingValidate() {
    if (this.validator.allValid()) {
      this.createShowing();
    } else {
  
      this.validator.showMessages();
      // rerender to show messages for the first time
      // you can use the autoForceUpdate option to do this automatically`
      this.forceUpdate();
    }
  }
  //------------------------------
  createShowing() {
    //if checkbox checked created by   
    this.setState({disableButton:1}) ;
    const {
      client_id,
      listing_add,
      listing_unit,
      showing_time,
      showing_date,
      client_contact,
      email,
      split,
      status,
      notes,
      client_name } = this.state;
    agentId().then(user_id => {
      var form = new FormData();
      if (this.state.checked) {
        form.append("created_by", user_id);
      } else {
        form.append("agent_id", user_id);
      }
      if (this.state.selected_clientId == 0) {

        form.append("client_id", "");
      }
      else {
        form.append("client_id", this.state.selected_clientId);
      }
      if (client_name != '') {
        form.append("client_name", client_name);
      } else {
        form.append("client_name", this.state.selected_clientName);
      }
      if (listing_add != '') {
        form.append("listing_add", listing_add);

      } else {
        form.append("listing_add", this.state.address_query);
      }

      form.append("listing_unit", listing_unit);
      form.append("showing_time", showing_time);
      form.append("showing_date", showing_date);
      form.append("client_contact", this.covertPhonenumber(client_contact));
      form.append("email", (email));
      form.append("split", split);
      form.append("notes", notes);
      form.append("status", 2);
    
      let createShowing = [{
        url: "/showings/createShowing"

      }];
      console.log("form");
      postAuthApiData(createShowing, form, false).then(res => {
        console.log(res + "hh");
        this.setState({ client_name: '', listing_add: '', listing_unit: '', showing_time: '', showing_date: '', client_contact: '', email: '', split: '', notes: '' })
        this.setState({ s_showing_date: '', s_showing_time: '' })
        alert('New Showing Created Successfully.');
        this.props.navigation.navigate('ShowingScreen');
      }).catch(error => {

      });
    }).catch(err => { });
    this.toggleModal();
  }
  clientnameautofillHandle(emp) {
  
    this.setState({ query: emp.name, selectedEmployee: emp });
    if (emp.name != '') {
      this.setState({ selected_clientName: emp.name, selected_clientId: emp.id });
      this.setState({ client_name: '' });
      this.clientphone(emp.id);
      this.clientfillemail(emp.id)
    }


  }
  //------------------------
  AddressUnitsHandler(listunit) {
    this.setState({ units_query: listunit.unit, selected_Unit: listunit, listing_unit: listunit.unit });

  }
  //-----------------------------------------------------------------------
  addressautofillHandle(buil_add) {
    // alert(emp.name);
    this.setState({ address_query: buil_add.building_address, selectedAddress: buil_add, listing_add: '' });
    this.findunits(buil_add.building_address);
  }
  //--------------- END CREATE SHOWINGS---------------------------------------------------------
  async clientphone(id) {
    let clientParam = [{
      url: "/showings/clientphone/" + id
    }];
    getApiData(clientParam, true).then(res => {
      this.setState({ client_contact: decryptvalue(res.data[0].phone_number) });
    }).catch(error => {
      if (error.response) {
        this.setState({ myerrormsg: error.response.data.error.message });
      }
    });
  }
  //--------------------------------------------------------------------------------------------------
  async clientfillemail(id) {

    let clientParam = [{
      url: "/showings/clientemail/" + id
    }];


    getApiData(clientParam, true).then(res => {
      console.log('client_fill_email', res.data);
      this.setState({ email: decryptvalue(res.data[0].email) });


    }).catch(error => {
      if (error.response) {
        this.setState({ myerrormsg: error.response.data.error.message });
      }
    });
  }
  //------------------------------------------------------------------------------------
  findunits(id) {
    //  https://stage.moveskyward.com/showings/UnitlistingCreator?listingname=161%20Taaffe%20Pl,%20Brooklyn,%20NY,%2011205

    fetch(HOST + '/front/agent/UnitlistingCreator?listingname=' + id).then(res => res.json()).then((json) => {
      console.log("uuuuuu" + json);
      this.setState({ units: json });
    });

  }
  //--------------------------------------------------------------------------------------------------------------------
  findUnitshandle(units_query) {
    //  alert('a');
    if (units_query === '') {
      return [];
    }
    const { units } = this.state;
    const regex = new RegExp(`${units_query.trim()}`, 'i');
    return units.filter(un => un.unit.search(regex) >= 0);
  }
  //----------------------------------------------------------------------------------
  render() {
    const { address_query, selectedAddress, query, selectedEmployee, units_query, selected_Unit } = this.state;
    const employees = this.findEmployee(query);
 
    const units = this.findUnitshandle(units_query);
  
    const address = this.findAddress(address_query);

    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
   
    if (this.state.loading) {
      return (<ActivityIndicator size="large" />);
    }
    //----------------------------------------------------
    forceUpdateHandler = (i, ref, from) => {

      
    }
    return (


      <View style={styles.container}>
       
        <KeyboardAwareScrollView>


          <View style={styles.modal}>

            <Col style={styles.modalBtn}>
              <Text style={styles.modalBtntxt} onPress={() => this.props.navigation.navigate('ShowingScreen')}><Icon name="ios-close" /> </Text>
            </Col>
            <View style={styles.modalHead}><Text style={styles.heading}>Create a new showing</Text></View>
            <View>

              <View style={styles.modalBody} >
                <Text style={styles.textErrorhead}>{this.state.err_msg}</Text>
                <View style={styles.formField} >
                  <Form>
                    <View style={{ marginBottom: 10 }}>
                      <CheckBox checked={this.state.checked}
                        style={{ marginRight: 20, top: 18 }}
                        onPress={this.isAvlLead.bind(this)} />
                      <Label style={styles.formCheckLabel}>An available lead?</Label>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Label style={styles.formtextLabelV}>Address</Label>
                      {this.state.AddressLoading ? (<ActivityIndicator style={{ top: 5, left: 80, position: "absolute" }} size="small" color="#ccc" />) : (<React.Fragment></React.Fragment>)}
                      <View style={{ zIndex: 999 }}>
                        <Autocomplete
                          name="listing_add"
                          autoCapitalize="none"
                          autoCorrect={false}
                          listContainerStyle={{ backgroundColor: "#fff", opacity: 1, position: 'relative', zIndex: 999, }}
                          style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', height: 42, }}
                          data={address.length === 1 && comp(address_query, address[0].building_address)
                            ? [] : address}
                          defaultValue={address_query}
                          hideResults={selectedAddress && selectedAddress.building_address === address_query}
                          onChangeText={text => this.setState({ address_query: text, listing_add: text })}
                          placeholder=""
                          renderItem={buil_add => <Item style={{ backgroundColor: '#ffffff', position: 'relative' }}
                            onPress={() => this.addressautofillHandle(buil_add)}
                          >
                            <Text style={{ backgroundColor: '#ffffff', position: 'relative' }} >{buil_add.building_address}</Text>
                          </Item>}
                        /></View>
                      {/* <Input name="listing_add" onChangeText={(listing_add) => this.setState({ listing_add })} style={styles.formtextField} /> */}
                      <Text style={styles.textError}>  {this.validator.message('listing_add', this.state.address_query, 'required')}</Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <View style={{ flex: 0.6 }}>
                        <View style={{ marginLeft: 10, marginTop: -4 }}>
                          <Label style={styles.formtextLabelV}>Unit</Label>
                          <View style={{ flex: 1, width: '100%', top: 5 }}>
                            <Autocomplete
                              name="listing_unit"
                              listContainerStyle={{ backgroundColor: "#fff", opacity: 1, position: 'relative', zIndex: 999, }}
                              style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', height: 39, marginTop: 3 }}
                              autoCapitalize="none"
                              autoCorrect={false}
                              data={units.length === 1
                                ? [] : units}
                              defaultValue={units_query}
                              hideResults={selected_Unit && selected_Unit.unit === units_query}
                              onChangeText={text => this.setState({ units_query: text, listing_unit: text })}
                              placeholder=""
                              renderItem={listunit => <Item style={{ zIndex: 999999, backgroundColor: '#ffffff', flexDirection: 'row', position: 'relative' }}

                                onPress={() => this.AddressUnitsHandler(listunit)}
                              >
                                <Text style={{ backgroundColor: '#ffffff', position: 'relative' }}>{listunit.unit}</Text>
                              </Item>}
                            /></View>
                          <Text style={styles.textError, styles.topSpace}>  {this.validator.message('Unit', this.state.listing_unit, 'required')}</Text>
                        </View>

                      </View>
                      <View style={{ flex: 0.6 }}>
                        <Item stackedLabel style={{ marginTop: -6 }}>
                          <Label style={styles.formtextLabel}>split</Label>
                          <Input name="split" onChangeText={(split) => this.setState({ split })} style={styles.formtextField} />
                        </Item>
                        {this.state.checked ? <Text style={{
                          color: '#ff6d6d', fontFamily: 'Montserrat-Regular',
                          fontSize: 9, marginTop: 2, marginLeft: 10, letterSpacing: -.3
                        }}>  {this.validator.message('split', this.state.split, 'required')}</Text> : <Text></Text>}

                      </View>

                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <View style={{ flex: 0.5 }}>
                        <Item stackedLabel style={{ marginTop: -8 }}>
                          <Label style={styles.formtextLabel}>Time</Label>
                        
                        <TimePicker
                          ref={ref => {
                            this.TimePicker = ref;
                          }}
                          onCancel={() => this.onCancel()}
                          onConfirm={(hour, minute) => this.onConfirm(hour, minute)}
                          minuteInterval={15}

                        />
                        <Text onPress={() => this.TimePicker.open()} style={styles.formtextFieldDT} >{this.state.s_showing_time == '' ? "---Select---" : this.state.s_showing_time}</Text>
                        
                        </Item>
                        <Text style={{
                          color: '#ff6d6d', fontFamily: 'Montserrat-Regular',
                          fontSize: 9, marginTop: 2, marginLeft: 10, letterSpacing: -.3
                        }}>  {this.validator.message('Time', this.state.showing_time, 'required')}</Text>
                      </View>
                      <View style={{ flex: 0.7 }}>
                        <Item stackedLabel style={{ marginTop: -8 }}>
                          <Label style={styles.formtextLabel}>Date</Label>

                          <DateTimePicker
                            isVisible={this.state.isDateTimePickerVisible}
                            onConfirm={this.handleDatePicked}
                            onCancel={this.hideDateTimePicker}
                            mode="date"
                            date={new Date()}
                          />
                          <Text onPress={this.showDateTimePicker} style={styles.formtextFieldDT} >{this.state.s_showing_date}</Text>
                         
                        </Item>
                        <Text style={styles.textError}>  {this.validator.message('Date', this.state.showing_date, 'required')}</Text>
                      </View>

                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <View style={{ flex: 0.6 }}>
                        <View style={{ flex: 1, marginLeft: 10, marginTop: -4 }}>
                          <Label style={styles.formtextLabelV}>Client Name</Label>
                         
                          <View style={{ flex: 1, width: '100%', top: 2 }}>
                            <Autocomplete
                              name="client_name"
                              autoCapitalize="none"
                              listContainerStyle={{ backgroundColor: "#fff", opacity: 1, position: 'relative', zIndex: 999, }}
                              style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', height: 43 }}
                              autoCorrect={false}
                              data={employees.length === 1 && comp(query, employees[0].name)
                                ? [] : employees}
                              defaultValue={query}
                              hideResults={selectedEmployee && selectedEmployee.name === query}
                              onChangeText={text => this.setState({ query: text, client_name: text })}
                              placeholder=""
                              renderItem={emp => <Item style={styles.autocomplist}
                                onPress={() => this.clientnameautofillHandle(emp)}
                              >
                                <Text style={{ backgroundColor: '#ffffff', position: 'relative' }}>{emp.name}</Text>
                              </Item>}
                            /></View>
                          <Text style={styles.textError}>  {this.validator.message('Name', this.state.query, 'required')}</Text>
                        </View>

                      </View>
                      <View style={{ flex: 0.6 }}>
                        <Item stackedLabel style={{ marginTop: -6 }}>
                          <Label style={styles.formtextLabel}>Client No.</Label>
                          <Input getRef={input => { this.inputs['field2'] = input }} ref="field2" name="client_contact" defaultValue={this.state.client_contact} onChangeText={(client_contact) => this.setState({ client_contact })} style={styles.formtextField} />

                        </Item>
                        <Text style={{
                          color: '#ff6d6d', fontFamily: 'Montserrat-Regular',
                          fontSize: 9, marginTop: 2, marginLeft: 10, letterSpacing: -.3
                        }}>  {this.validator.message('Contact', this.state.client_contact, 'required')}</Text>
                      </View>

                    </View>

                    <Item stackedLabel style={{ marginTop: -6 }}>
                      <Label style={styles.formtextLabel}>Email Address</Label>
                      <Input name="email" onChangeText={(email) => this.setState({ email })} style={styles.formtextField} defaultValue={this.state.email} />

                    </Item>
                    <Text style={{
                      color: '#ff6d6d', fontFamily: 'Montserrat-Regular',
                      fontSize: 9, marginTop: 2, marginLeft: 10, letterSpacing: -.3
                    }}>  {this.validator.message('email', this.state.email, 'required|email')}</Text>
                    <View style={{ marginTop: -6, marginLeft: 10, }}>
                      <Label style={styles.formtextLabelV}>Notes</Label>
                      <Textarea style={styles.formtextareaField} name="notes" onChangeText={(notes) => this.setState({ notes })} />
                    </View>



                    <View style={styles.btnWrapper}>
                      { this.state.disableButton==0 ?(<TouchableOpacity style={styles.button} onPress={() => this.createShowingValidate()}>
                        <Text style={styles.btnText}> Create </Text>
                      </TouchableOpacity>):(
                       
                        <TouchableOpacity style={styles.button} >
                            <Text style={styles.btnText}> Create </Text>
                          </TouchableOpacity>
                        
                      )}
                      
                    </View>
                    
                  </Form>
                </View>



              </View>



            </View>


          </View>






          </KeyboardAwareScrollView>

      </View>


    );
  }
}
export default Showing2;

const styles = StyleSheet.create({
  autocomplist: {
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#FFF',
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
  },
  autocontainer: {
    flex: 1, width: '100%', zIndex: 9999
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 8,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10
  },
  tabView: {
    textTransform: 'uppercase',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
    letterSpacing: 2,
    color: '#698A96',

  },
  tabing: {
    backgroundColor: '#fff',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(124, 124, 124, .30)'
  },

  modal: {
    flex: 1,
    padding: 0,
    borderWidth: 0,
    borderColor: '#FFF',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,

    elevation: 24,
  },
  modalHead: {
    padding: 25,
    paddingBottom: 0,
    color: '#070767',
    backgroundColor: '#FFF',

    textAlign: 'left'
  },
  modalBody: {
    backgroundColor: '#fff',
    padding: 10,
    paddingTop: 0,
    paddingRight: 25,
    paddingBottom: 20,
    textAlign: 'left',
    zIndex: -1
  },
  heading: {
    textTransform: 'uppercase',
    fontFamily: 'Montserrat-Bold',
    color: '#004F6B',
    fontSize: 14,
    letterSpacing: 2,

  },
  modalBtn: {
    fontSize: 14,
    letterSpacing: 2,
    backgroundColor: '#FFF',
    height: 28,
    width: 28,
    zIndex: 99,
    marginTop: 0,
    textAlign: 'center',
    right: 0,
    top: 0,
    paddingLeft: 3,
    position: 'absolute',
    right: 10,
    top: 10,


  },

  modalBtntxt: {
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#000'
  },

  modalLBtntxt: {
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#070767'
  },

  formField: {
    color: '#42428B',
    flexDirection: 'column',
  },

  formtextField: {
    alignItems: 'center',
    color: '#000',
    marginBottom: 7,
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    height: 22,
    lineHeight: 22,
    top: 7,

  },
  formtextareaField: {
    color: '#000',
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    borderBottomWidth: 1,
    borderColor: "#c7c6c1",
    padding: 0,
    marginTop: 10,
    marginLeft: 5,
    paddingLeft: 0
  },
  formtextFieldDT: {
    alignSelf: "stretch",
    color: '#000',
    paddingBottom: 0,
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    top: 18,
    height: 25
  },
  formtextLabelV: {
    flex: 1,
    fontSize: 12,
    letterSpacing: 2,
    left: 5,
    top: 8,
    color: '#004F6B',
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase'
  },
  formtextLabel: {
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
    color: '#004F6B',
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase'
  },
  formCheckLabel: {
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
    color: '#004F6B',
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase', maxWidth: 200,
    marginLeft: 30,

  },
  btnWrapper: {
    textAlign: 'right',
    marginRight: 15,
    justifyContent: 'flex-end',
    width: '100%',
    flexDirection: 'row',
    zIndex: 0
  },
  button: {
    backgroundColor: '#004F6B',
    borderRadius: 6,
    marginTop: 25,
    width: 100,
    padding: 8,
    paddingLeft: 15,
    paddingRight: 15,
    zIndex: 0
  },
  btnText: {
    color: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  checllabel: {
    fontFamily: 'Montserrat-Medium',
    letterSpacing: 2,
    fontSize: 12,
  },
  // Autocomplete css
  autocompletesContainer: {
    paddingTop: 0,
    zIndex: 1,
    width: "100%",
    paddingHorizontal: 8,
  },
  input: { maxHeight: 40 },
  inputContainer: {
    display: "flex",
    flexShrink: 0,
    flexGrow: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#c7c6c1",
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: "5%",
    width: "100%",
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  plus: {
    position: "absolute",
    left: 15,
    top: 10,
  },
  textError: {
    color: '#ff6d6d', fontFamily: 'Montserrat-Regular',
    fontSize: 9,
  },
  textErrorhead: {
    color: '#ff6d6d', fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    textAlign: "center",
    padding: 5,
    margin: 15,
    marginRight: 0,
    marginBottom: 0,
    borderWidth: 0,
    borderColor: '#ff6d6d',
    borderRadius: 6,

  },
  topSpace: {
    marginTop: 5,
    color: '#ff6d6d', fontFamily: 'Montserrat-Regular',
    fontSize: 9,
  }
});