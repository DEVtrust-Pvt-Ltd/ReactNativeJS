import React, { Component } from "react";
import { Alert, StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity,Platform } from 'react-native';
import { Text, Icon, Col, Form, Item, Label, Input, Tab, Tabs, TabHeading, CheckBox } from 'native-base';
import Modal from "react-native-modal";
import Tab1 from './Tabs';
import Tab2 from './Mylead';
import Tab3 from './Avlead';
import Autocomplete from 'native-base-autocomplete';
import SimpleReactValidator from 'simple-react-validator';
import AsyncStorage from '@react-native-community/async-storage';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from 'react-native-google-signin';
import { getApiData, postAuthApiData, agentId ,getBaseUrl} from './services/Api';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Moment from 'moment';

//------------------------------------------------------Import section end -----------------------------------
let _this = null;
const API = getBaseUrl+'/front/agent/addShowing/clientSearch';
class Showing extends Component {
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
          ...Platform.select({
            ios: {
              marginTop:1,
            },
            android: {
              marginTop:1,
            },
          }), marginRight: 5, borderRadius: 25, borderColor: '#ffffff', borderWidth: 2, paddingLeft: 14, 
          paddingRight: 15, paddingTop:3, height:28, flex:1,
          textAlign:'center'
        }} onPress={() => _this.goTocreate()}>
           <Text style={{ color: '#fff', fontFamily: 'Montserrat-Bold', fontSize: 11, textTransform: 'uppercase', marginTop: 2, marginBottom: 2, lineHeight:14 }}><Icon type="FontAwesome" name="plus" style={{fontSize: 11, color: 'white'}}/> showings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginLeft:10, marginRight: 10, width: 25, ...Platform.select({
            ios: {
              marginTop:0,
            },
            android: {
              marginTop:0,
            },
          }),}} onPress={() => _this.handleLogout()}>
          <Text style={{ color: '#fff', fontFamily: 'Montserrat-Bold', fontSize: 12, textTransform: 'uppercase', marginTop: 0, marginBottom: 3, lineHeight:12 }}>  <Icon type="Feather" name="log-out" style={{fontSize: 20, color: 'white'}}/></Text>
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
      s_showing_date: '',
      s_showing_time: '',
      employees: [],
      query: '',
      selectedEmployee: null
    };
    this.validator = new SimpleReactValidator();
  }
  goTocreate() {
   // alert('aa');
    this.props.navigation.navigate('CreateScreen');
  }
  //--------------------------------------------DATE TIME PICKER--------------------------------------------
  showDateTimePicker = () => {

    this.setState({ isDateTimePickerVisible: true });
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };
  hideTimePicker = () => {
    this.setState({ isTimePickerVisible: false });
  };
  showTimePicker = () => {

    this.setState({ isTimePickerVisible: true });
  };
  handleDatePicked = date => {
    
    //alert(endOfMonth);
    let startDate = Moment(date).format('YYYY-MM-DD HH:mm:ss');
    let startDate_show = Moment(date).format('MMMM DD,YYYY');
    //September 20, 2019
    this.setState({ showing_date: startDate, s_showing_date: startDate_show })
    console.log("A date has been picked: ", startDate);

    this.hideDateTimePicker();
  };
  handleTimePicked = time => {
    let showingTime;
    showingTime = Moment(time).format('HH:mm:ss');
    this.setState({ showing_time: showingTime, s_showing_time: showingTime });

    console.log("A Time has been picked: ", showingTime);
    this.hideDateTimePicker();
  };
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
            onPress: () => this.setState({ loading: false,logoutstate:0 }),
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
    this.setState({ loading: false });
  
    const { navigation } = this.props;
    //Adding an event listner om focus
    //So whenever the screen will have focus it will set the state to zero
    this.focusListener = navigation.addListener('didFocus', () => {
      this.setState({ count: 0 });
    });
  }
  componentWillUnmount() {
    _isMounted = false;
    this.focusListener.remove();
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
//---------------------------------------------------------------------------------------------------------------------
  getAddress() {
    fetch(`${API}/employees`).then(res => res.json()).then((json) => {
      this.setState({ employees: json });
    });
    let where = [{
      url: "/showings/listingCreator"
      // urlParms: "/" + this.state.categoryId,
    }];
    let dataarray = [];
    getApiData(where).then(res => {
     
      res.data.map((s) => {
        dataarray = s.name;
     
      })
      this.setState({ auto_address: dataarray });
    })
      .catch(error => {
        alert('err' + error);
      });
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
    this.setState({s_showing_date:'',s_showing_time:''})
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
  createShowing() {
    //if checkbox checked created by    
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
      if (this.state.client_id == 0) {

        form.append("client_id", "");
      }
      else {
        form.append("client_id", this.state.client_id);
      }

      form.append("client_name", client_name);
      form.append("listing_add", listing_add);
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
      postAuthApiData(createShowing, form, false).then(res => {
        this.setState({ client_name: '', listing_add: '', listing_unit: '', showing_time: '', showing_date: '', client_contact: '', email: '', split: '', notes: '' })
        this.setState({ s_showing_date: '', s_showing_time: '' })
        alert('Showing Created.');
        
      }).catch(error => {

      });
    }).catch(err => { });
    this.toggleModal();
  }
  testme(emp) {
    alert(emp.name);
      this.setState({ query: emp.name, selectedEmployee: emp })
    
  }
  //--------------- END CREATE SHOWINGS-------------------------------
  render() {
    const { show, date, mode } = this.state;
    
    const { query, selectedEmployee } = this.state;
    const employees = this.findEmployee(query);
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
    const { value } = this.state;
    if (this.state.loading) {
      return (<ActivityIndicator size="large" style={{marginTop:200}}/>);
    }
    //-------
    forceUpdateHandler = (i, ref, from) => {

     this.forceUpdate();
    }
    return (


      <View style={styles.container}>
       
        <ScrollView>
          <Tabs onChangeTab={({ i, ref, from }) => forceUpdateHandler(i, ref, from)} tabContainerStyle={{
            elevation: 0
          }} tabBarUnderlineStyle={{ borderBottomWidth: 4, borderBottomColor: '#004F6B' }} >
            <Tab heading={<TabHeading style={styles.tabing}><Text style={styles.tabView}>Confirmed showings</Text></TabHeading>}>
              <Tab1 key={Math.random()} />
            </Tab>
            <Tab heading={<TabHeading style={styles.tabing}><Text style={styles.tabView}>My Leads</Text></TabHeading>}>
              <Tab2 key={Math.random()} />
            </Tab>
            <Tab heading={<TabHeading style={styles.tabing}><Text style={styles.tabView}>Available Leads</Text></TabHeading>} >
              <Tab3 key={Math.random()} />
            </Tab>
          </Tabs>
          <Modal
            isVisible={this.state.isModalVisible}>

            <View style={styles.modal}>
              <Col style={styles.modalBtn}>
                <Text style={styles.modalBtntxt} onPress={this.toggleModal}><Icon name="ios-close" /> </Text>
              </Col>
              <View style={styles.modalHead}><Text style={styles.heading}>Create a new showing</Text></View>
              <View>

                <View style={styles.modalBody}>
                  <View style={styles.formField}>
                    <Form>
                      <View style={{ marginBottom: 10 }}>
                        <CheckBox checked={this.state.checked}
                          style={{ marginRight: 20, top: 20 }}
                          onPress={this.isAvlLead.bind(this)} />

                        <Label style={styles.formCheckLabel}>An available lead?</Label>

                      </View>

                      <Item stackedLabel>
                        <Label style={styles.formtextLabel}>Address</Label>
                        <Input name="listing_add" onChangeText={(listing_add) => this.setState({ listing_add })} style={styles.formtextField} />
                        <Text style={styles.textError}>  {this.validator.message('listing_add', this.state.listing_add, 'required')}</Text>
                        <Autocomplete
            autoCapitalize="none"
            autoCorrect={false}
            data={employees.length === 1 && comp(query, employees[0].name)
              ? [] : employees}
            defaultValue={query}
            hideResults={selectedEmployee && selectedEmployee.name === query}
            onChangeText={text => this.setState({ query: text })}
            placeholder="Enter employee's name"
            renderItem={emp => <Item
              onPress={() => this.testme(emp)}
            >
              <Text>{emp.name}{emp.id}</Text>
            </Item>}
          />
</Item>
                     

                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <View style={{ flex: 0.6 }}>
                          <Item stackedLabel>
                            <Label style={styles.formtextLabel}>Unit</Label>
                            <Input name="listing_unit" style={styles.formtextField} onChangeText={(listing_unit) => this.setState({ listing_unit })} />
                           
                          </Item>
                          <Text style={styles.textError}>  {this.validator.message('Unit', this.state.listing_unit, 'required')}</Text>
                        </View>
                        <View style={{ flex: 0.6 }}>
                          <Item stackedLabel>
                            <Label style={styles.formtextLabel}>split</Label>
                            <Input name="split" onChangeText={(split) => this.setState({ split })} style={styles.formtextField} />
                          </Item>
                          {this.state.checked ? <Text style={styles.textError}>  {this.validator.message('split', this.state.split, 'required')}</Text>:<Text></Text>}
                          
                        </View>

                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <View style={{ flex: 0.5 }}>
                          <Item stackedLabel>
                            <Label style={styles.formtextLabel}>Time</Label>
                            <Input name="showing_time" onFocus={this.showTimePicker} style={styles.formtextField} defaultValue={this.state.s_showing_time} />
                            <DateTimePicker style={{ zIndex: 99999 }}
                              isVisible={this.state.isTimePickerVisible}
                              onConfirm={this.handleTimePicked}
                              onCancel={this.hideTimePicker}
                              mode="time"
                              
                            />
                          </Item>
                          <Text style={styles.textError}>  {this.validator.message('Time', this.state.showing_time, 'required')}</Text>
                        </View>
                        <View style={{ flex: 0.7 }}>
                          <Item stackedLabel>
                            <Label style={styles.formtextLabel}>Date</Label>

                            <DateTimePicker style={{ zIndex: 99999 }}
                              isVisible={this.state.isDateTimePickerVisible}
                              onConfirm={this.handleDatePicked}
                              onCancel={this.hideDateTimePicker}
                              mode="date"
                              date={new Date()}
                            />

                            <Input name="showing_date" defaultValue={this.state.s_showing_date} onFocus={this.showDateTimePicker} style={styles.formtextField} onSubmitEditing={() => { this.secondTextInput.focus(); }}
                              blurOnSubmit={false} />
                          </Item>
                          <Text style={styles.textError}>  {this.validator.message('Date', this.state.showing_date, 'required')}</Text>
                        </View>

                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <View style={{ flex: 0.6 }}>
                          <Item stackedLabel>
                            <Label style={styles.formtextLabel}>Client Name</Label>
                            <Input name="client_name" onChangeText={(client_name) => this.setState({ client_name })} style={styles.formtextField} ref={(input) => { this.secondTextInput = input; }} />
                          </Item>
                          <Text style={styles.textError}>  {this.validator.message('Name', this.state.client_name, 'required')}</Text>
                        </View>
                        <View style={{ flex: 0.6 }}>
                          <Item stackedLabel>
                            <Label style={styles.formtextLabel}>Client Number</Label>
                            <Input name="client_contact" onChangeText={(client_contact) => this.setState({ client_contact })} style={styles.formtextField} />

                          </Item>
                          <Text style={styles.textError}>  {this.validator.message('client_contact', this.state.client_contact, 'required')}</Text>
                        </View>

                      </View>

                      <Item stackedLabel>
                        <Label style={styles.formtextLabel}>Email Address</Label>
                        <Input name="email" onChangeText={(email) => this.setState({ email })} style={styles.formtextField} />

                      </Item>
                      <Text style={styles.textError}>  {this.validator.message('email', this.state.email, 'required|email')}</Text>
                      <Item stackedLabel>
                        <Label style={styles.formtextLabel}>Notes</Label>
                        <Input name="notes" onChangeText={(notes) => this.setState({ notes })} style={styles.formtextField} />
                      </Item>


                      <View style={styles.btnWrapper}>
                        <TouchableOpacity style={styles.button} onPress={() => this.createShowingValidate()}>
                          <Text style={styles.btnText}> Create </Text>
                        </TouchableOpacity>
                      </View>


                    </Form>
                  </View>



                </View>



              </View>


            </View>

          </Modal>




        </ScrollView>

      </View>


    );
  }
}
export default Showing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    color: '#000',
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
    padding: 10,top:50
  },
  modalHead: {
    padding: 25,
    color: '#070767',
    backgroundColor: '#fff',
    paddingTop: 20,
    textAlign: 'left'
  },
  modalBody: {
    backgroundColor: '#fff',
    padding: 10,
    paddingTop: 0,
    paddingRight: 25,
    paddingBottom: 30,
    textAlign: 'left'
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
    backgroundColor: '#ffffff',
    height: 28,
    width: 28,
    zIndex: 999,
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
    fontWeight:'bold',
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#ffffff'
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
    paddingBottom: 0,
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
  },
  formtextLabel: {
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
    color: '#004F6B',
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase'
  }, formCheckLabel: {
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
    color: '#004F6B',
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase', maxWidth: 200,
    marginLeft: 40,

  },
  btnWrapper: {
    textAlign: 'right',
    marginRight: 15,
    justifyContent: 'flex-end',
    width: '100%',
    flexDirection: 'row'
  },
  button: {
    backgroundColor: '#004F6B',
    borderRadius: 6,
    marginTop: 25,
    width: 100,
    padding: 8,
    paddingLeft: 15,
    paddingRight: 15,
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
    paddingVertical: 13,
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
  textError:{color:'#ff6d6d',fontFamily: 'Montserrat-Regular',
  fontSize: 9,}
});