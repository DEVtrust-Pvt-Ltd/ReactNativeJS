import React, { Component } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Linking, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { Col, Icon, Form, Item, Label } from 'native-base';
import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";
import { postAuthApiData, getApiData, agentId, getBaseUrl } from './services/Api';
import Moment from 'moment';
import Autocomplete from 'native-base-autocomplete';
import DateTimePicker from 'react-native-modal-datetime-picker';
import TimePicker from './services/MyTimepicker';
const BaseUrl = getBaseUrl;

class MyleadScreen extends Component {
  static navigationOptions = {
    header: null
  }
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isModalVisible: false,
      leadData: [],
      isListExist: true,
      address: [],
      address_query: '',
      selectedAddress: null,
      dateSearch: '',
      searchConditions: {},
      TimeSearch: '',
      NameSearch: '',
      AddressSearch: '',
      ShowFilterDate: '',
      ShowFilterTime: ''
    };
  }
  componentDidMount() {
    this._isMounted = true;
    this.setState({ loading: true });
    this.getleadsList();
    this.findAddressApi();

  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  //----------------------------
  dialCall = (number) => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = 'tel:' + number;
    }
    else {
      phoneNumber = 'telprompt:' + number;
    }
    Linking.openURL(phoneNumber);
  };

  //---------------------------
  //_________________________________________FILTER_____________________________________________//
  //____________________________________________________________________________________________//
  //-----------------------------------GET CONFIRMED ADDRESS_----------------------------------//
  async getConfirmed_AddressData() {
    let listingWhere = [{
      url: "/showings/showing/confshowingAdd?agent_id=46",

    }];

    getfetchAuthApiData(listingWhere).then(res => res.json()).then((jsonAddress) => {
      this.setState({ address: jsonAddress });
      console.log(jsonAddress);
    }).catch(err => {
      console.log( err);

    })
  }
  //---------------------------Autocomplete Address-----------------------------------------------//
  //-----------------------------------GET CONFIRMED ADDRESS_----------------------------------//
  findAddressApi = () => {
   
    agentId().then(user_id => {
     
      fetch(BaseUrl + '/front/agent/myLeadshowingAdd/' + user_id).then(response => response.json()).then((jsonAddress) => {
       
        this.setState({ address: jsonAddress });
      });

    });


  }
  //---------------------------AUTO COMPLETE ADDRESS-----------------------------------------------------//
  findAddress(address_query) {
    if (address_query === '') {
      return [];
    }
    const { address } = this.state;
    const regex = new RegExp(`${address_query.trim()}`, 'i');
    return address.filter(addr => addr.listing_info_address.search(regex) >= 0);
  }
  addressautofillHandle(buil_add) {
   
    this.setState({ address_query: buil_add.listing_info_address, selectedAddress: buil_add, AddressSearch: buil_add.listing_info_address });

  }
  //--------------------------DATE TIME PICKER-------------------------------------------------//
  showDateTimePicker = () => {

    this.setState({ isDateTimePickerVisible: true });
   
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
    Keyboard.dismiss();
  };

  handleDatePicked = date => {
    this.setState({ dateSearch: '' });
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
      this.setState({ dateSearch: startDate, ShowFilterDate: startDate_show })
    } else {
      this.setState({ err_msg: "Please select within 7 days." })
    }
    //________________________________________________

    console.log("A date has been picked: ", startDate);
   
    this.hideDateTimePicker();
  };

  
  onCancel() {
    this.TimePicker.close();
  }

  onConfirm(hour, minute) {
    let time = `${hour}:${minute}`;
    this.setState({ err_msg: "" });

    let showingTime = Moment(time, 'h:mm').format('HH:mm:00');
    let displayTime = Moment(time, 'h:mm').format('hh:mm A')
    this.setState({ TimeSearch: showingTime, ShowFilterTime: displayTime })
    console.log("A Time has been picked: ", showingTime);
    this.TimePicker.close();
  }
  /////////////
  //------------------------FILTER CONDITIONS----------------------------------------//
  conditionCombo() {
    if (this.state.dateSearch != '') {
      let SearchDate = Moment(this.state.dateSearch).format('YYYY-MM-DD');
      this.state.searchConditions.showing_date = SearchDate;
    }
    if (this.state.TimeSearch != '') {
      let SearchTime = Moment(this.state.TimeSearch, ['h:mm:ss']).format('HH:mm:ss');
      this.state.searchConditions.showing_time = SearchTime;
    }
    if (this.state.NameSearch != '') {

      this.state.searchConditions.client_name = this.state.NameSearch;
    }
    if (this.state.AddressSearch != '') {

      this.state.searchConditions.showingAddress = this.state.AddressSearch;
    }
  }
  //----------------------FILTER ACTION -----------------------------------------------//
  ApplyFilter = () => {
    //alert('a');
    this.getleadsList();
    this.setState({ ShowFilterDate: '', ShowFilterTime: '', client_query: '', address_query: '' });
  }
  removeFilter(key) {
    this.setState({ searchConditions: {} });
    if (key == 'date') {
      this.setState({ dateSearch: '', ShowFilterDate: '' });
    }
    else if (key == 'time') {
      this.setState({ TimeSearch: '', ShowFilterTime: '' });

    } else if (key == 'name') {
      this.setState({ NameSearch: '', client_query: '' });
    } else {
      this.setState({ AddressSearch: '', address_query: '' });

    }
    this.getleadsList();
  }
  //__________________________________FILTER END________________________________________


  getleadsList() {
    this.setState({ loading: true });
    agentId().then(user_id => {
      let clientRelWhere = [{
        url: "/showings/agentLead/" + user_id

      }];
      this.conditionCombo();
      let Search_condition = Object.keys(this.state.searchConditions);

      if (Search_condition.length > 0) {
        clientRelWhere[0].where = this.state.searchConditions;
      }
      getApiData(clientRelWhere, true).then(res => {
        console.log('ResponseData=>', res.data);
        if (this._isMounted) {
          this.setState({ leadData: res.data, loading: false });
          if (res.data.length) {
            this.setState({ isListExist: true });
          } else {
            this.setState({ isListExist: false });
          }

        }

      }).catch(error => {
        alert(error);
        this.setState({ loading: false });
      });
    }).catch(err => {
      console.log(err);
    });

  }
  //-------------------------------------------------------------------------------

  async checkEligiblityExclusive(listing_id, s_showingTime, s_showingDate) {

    return new Promise((resolve, reject) => {
      var createdTime = Moment(s_showingTime, ['HH:mm:ss']).format('HH:mm:ss');

      var createdDate = Moment(s_showingDate, ['YYYY-MM-DD']).format('YYYY-MM-DD');
      let showingDate = createdDate + ' ' + createdTime;


      let checkEligiblity = [{
        url: "/showings/checkEligiblityExclusive"
      }];
      var form = new FormData();
      form.append("listingId", listing_id);
      form.append("showingDate", showingDate);
      postAuthApiData(checkEligiblity, form, true).then(res => {
      
        if (res.data.length > 0) {
          resolve(3);            //3=> count is greater/equal to three for the day
        }
        else {
          resolve(1);
        }

      }).catch(error => {
        
      });
    });
  }
  //--------------------_________________Confim showing____________________________-------------------------------------

  confirmShowing(id, showing_date, showing_time, showingAddress, address_value, showingUnit, unit_value, reschedule_status, client_email, email, client_name, client_fullname, listing_id) {
    Alert.alert(
      'Confirm Showing',
      'ARE YOU SURE YOU WANT TO CONFIRM THIS SHOWING ?',
      [

        { text: 'Yes', onPress: () => this.confirmShowingAction(id, showing_date, showing_time, showingAddress, address_value, showingUnit, unit_value, reschedule_status, client_email, email, client_name, client_fullname, listing_id) },
        { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
      ],
      { cancelable: false }
    )
  }
  //---------------------------------------------------------
  async confirmShowingAction(
    id,
    showing_date,
    showing_time,
    showingAddress,
    address_value,
    showingUnit,
    unit_value,
    reschedule_status,
    client_email,
    email,
    client_name,
    client_fullname,
    listing_id,
    acceptFlag = false) {
    if (acceptFlag == true) {
      var result = 1;
    }
    else {
      var result = await this.checkEligiblityExclusive(listing_id, showing_time, showing_date);
    }


    if (result == 1) {
      agentId().then(user_id => {
        let confirmShowing = [{
          url: "/showings/confirmShowing"

        }];
        let showingTimeForEmail = Moment(showing_time, ['h:mm:ss']).format('hh:mm A');
        let showingDateForEmail = Moment(showing_date).format('dddd, MMMM Do');
        var form = new FormData();
        let currentDate = this.getCurrentDate('dateTime')

        form.append("clientShowingId", id);
        form.append("agent_id", user_id);
        form.append("updated_at", currentDate);
        form.append("reschedule_status", reschedule_status);
        form.append("clientEmail", client_email != "" ? client_email : email);
        form.append("showingDate", showingDateForEmail);
        form.append("showingTime", showingTimeForEmail);
        form.append("showingAddress", (address_value != "" && address_value !=null)  ? address_value : showingAddress);
        form.append("showingUnit", (showingUnit != "" && showingUnit !=null)  ? showingUnit : unit_value);
        form.append("clientName", (client_name !== "" && client_name !=null ) ? client_name : client_fullname);
        form.append("lead", 0);
        postAuthApiData(confirmShowing, form, true).then(res => {

          if (res.data.success) {
            this.getleadsList();
          }
          else {
            console.log(res.data.message);
          }

        }).catch(error => {

        });
      });

    }
    else {
      if (result == 3) {
        alert("You cannot accept overlapping showing. It should be +30 Min in difference.");
        document.getElementById("closeConfirmSchudling").click();
      }
    }
  }

  //---------
  getCurrentDate(format) {

    var createdTime = Moment(new Date(), ['HH:mm:ss']).format('HH:mm:ss');
    var createdDate = Moment(new Date(), ['YYYY-MM-DD']).format('YYYY-MM-DD');
    if (format == 'dateTime') {
      return createdDate = createdDate + ' ' + createdTime;
    } else {
      return createdDate;
    }

  }
  //-------------------------------------------------------------------------------
  render() {
    if (this.state.loading) {
      return (<ActivityIndicator size="large" style={{ marginTop: 200 }} />);
    }
    const { address_query, selectedAddress } = this.state;
    const address = this.findAddress(address_query);

    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
    return (
      <View style={styles.container}>

        <View>
          {/* Filter section */}
          <View style={styles.badgeWrap}>
            <View style={{ flexDirection: 'row' }}>
              {this.state.dateSearch != "" ? <View style={styles.badge}>
                <Icon type="FontAwesome" name="close" style={{ color: '#6F7374', fontSize: 14, }} />
                <Text style={styles.badgeTxt} onPress={() => this.removeFilter('date')}>Date</Text>
              </View> : <React.Fragment></React.Fragment>}
              {this.state.TimeSearch != "" ? <View style={styles.badge}>
                <Icon type="FontAwesome" name="close" style={{ color: '#6F7374', fontSize: 14, }} />
                <Text style={styles.badgeTxt} onPress={() => this.removeFilter('time')}>Time</Text>
              </View> : <React.Fragment></React.Fragment>}
              {this.state.NameSearch != "" ? <View style={styles.badge}>
                <Icon type="FontAwesome" name="close" style={{ color: '#6F7374', fontSize: 14, }} />
                <Text style={styles.badgeTxt} onPress={() => this.removeFilter('name')}>Name</Text>
              </View> : <React.Fragment></React.Fragment>}
              {this.state.AddressSearch != "" ? <View style={styles.badge}>
                <Icon type="FontAwesome" name="close" style={{ color: '#6F7374', fontSize: 14, }} />
                <Text style={styles.badgeTxt} onPress={() => this.removeFilter('address')}>Address</Text>
              </View> : <React.Fragment></React.Fragment>}
            </View>
          </View>
          <Collapse style={{ margin: 15, marginBottom: 0 }} >
            <CollapseHeader style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', }}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <View style={{ flex: 0.9 }}>


                </View>
                <View style={{ flex: 0.3 }}>
                  <View style={styles.filterWidget}>
                    <Icon type="FontAwesome" name="filter" style={styles.filterIcon} />
                    <Text style={styles.filterTxt}>Filter</Text>
                  </View>
                </View>

              </View>
            </CollapseHeader>
            <CollapseBody style={styles.filterBody}>

              <View style={styles.formField}>
                <Form>
                  {this.state.err_msg != "" ? <Text style={styles.errortxt}>{this.state.err_msg}</Text> : <React.Fragment></React.Fragment>}


                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    <View style={{ flex: 0.6 }}>
                      <Item stackedLabel>
                        <Label style={styles.formtextLabel}>Time</Label>
                       
                        <TimePicker
                          ref={ref => {
                            this.TimePicker = ref;
                          }}
                          onCancel={() => this.onCancel()}
                          onConfirm={(hour, minute) => this.onConfirm(hour, minute)}
                          minuteInterval={15}

                        />
                        <Text onPress={() => this.TimePicker.open()} style={styles.formtextFieldDT} >{this.state.ShowFilterTime != '' ? this.state.ShowFilterTime : "---Select---"}</Text>

                      </Item>

                    </View>
                    <View style={{ flex: 0.6 }}>
                      <Item stackedLabel>
                        <Label style={styles.formtextLabel}>Date</Label>
                        <DateTimePicker
                          isVisible={this.state.isDateTimePickerVisible}
                          onConfirm={this.handleDatePicked}
                          onCancel={this.hideDateTimePicker}
                          mode="date"
                          date={new Date()}
                        />
                        <Text onPress={this.showDateTimePicker} style={styles.formtextFieldDT} >{this.state.ShowFilterDate != '' ? this.state.ShowFilterDate : "--Select--"}</Text>
                      </Item>
                    </View>

                  </View>
                  <View
                  >
                    <View style={{ paddingLeft: 10, marginTop: 4 }}>
                      <View stackedLabel>
                        <Label style={styles.formtextLabelV}>Address</Label>
                        <View style={{ zIndex: 999 }}>
                          <Autocomplete
                            name="listing_add"
                            autoCapitalize="none"
                            autoCorrect={false}
                            listContainerStyle={{ backgroundColor: "#fff", opacity: 1, position: 'relative', zIndex: 999, }}
                            style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', height: 46, }}
                            data={address.length === 1 && comp(address_query, address[0].listing_info_address)
                              ? [] : address}
                            defaultValue={address_query}
                            hideResults={selectedAddress && selectedAddress.listing_info_address === address_query}
                            onChangeText={text => this.setState({ address_query: text, listing_add: text })}
                            placeholder=""
                            renderItem={buil_add => <Item style={{ backgroundColor: '#ffffff', position: 'relative' }}
                              onPress={() => this.addressautofillHandle(buil_add)}
                            >
                              <Text style={{ backgroundColor: '#ffffff', position: 'relative' }} >{buil_add.listing_info_address}</Text>
                            </Item>}
                          /></View>
                      </View>
                    </View>

                  </View>



                  <View style={styles.FilterbtnWrapper}>
                    <TouchableOpacity style={styles.Filterbutton} onPress={this.ApplyFilter}>
                      <Text style={styles.FilterbtnText}> Apply </Text>
                    </TouchableOpacity>
                  </View>


                </Form>
              </View>

            </CollapseBody>
          </Collapse>
          {/* ----- */}
          {this.state.leadData.map((s) => {
            return <Collapse key={s.id} style={{ margin: 15, marginBottom: 0, borderColor: '#e5e5e5', borderWidth: 1, borderRadius: 6, }}>

              <CollapseHeader style={styles.colheader}>
                <View style={styles.calenderWidget} >
                  <Text style={styles.date}> {Moment(s.showing_date).format('D')}</Text>
                  <Text style={styles.year}>{Moment(s.showing_date).format('MMM YYYY')}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.name}>{s.address_value != null ? s.address_value : s.showingAddress}</Text>
                  <Text style={styles.time}><Icon type="FontAwesome" name="clock-o" style={{ fontSize: 13, color: '#7EA8B7' }} /> {(s.showing_time != '23:59:59') ? Moment(s.showing_time, ['h:mm:ss']).format('hh:mm A') : '--'}     </Text>
                </View>
                <View style={styles.downarrow}>
                  <Icon type="FontAwesome" name="angle-down" style={{ fontSize: 25, color: '#7EA8B7' }} />
                </View>

              </CollapseHeader>
              <CollapseBody style={{ backgroundColor: '#fff', padding: 10, borderTopWidth: 1, borderTopColor: '#E5EDF0', }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.addressBlock}>
                    <Text style={styles.heading}>address</Text>
                    <Text style={styles.txt}>{s.address_value != null ? s.address_value : s.showingAddress}</Text>
                  </View>
                  <View style={styles.unit}>
                    <Text style={styles.heading}>Unit</Text>
                    <Text style={styles.txt}>{s.unit_value != null ? s.unit_value : s.showingUnit}</Text>
                  </View>
                  <View style={styles.unit}>
                    <Text style={styles.heading}>Split</Text>
                    <Text style={styles.txt}>{s.split == 'undefined' ? '' : s.split}</Text>
                  </View>

                </View>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.unit1}>
                    <Text style={styles.heading}>BEDROOMS</Text>
                    <Text style={styles.txt}>{s.bedrooms}</Text>
                  </View>
                  <View style={styles.unit1}>
                    <Text style={styles.heading}>BATHROOMS</Text>
                    <Text style={styles.txt}>{s.bathrooms}</Text>
                  </View>
                  <View style={styles.unit1}>
                    <Text style={styles.heading}>PRICE</Text>
                    <Text style={styles.txt}>${s.price}</Text>
                  </View>

                </View>
             
                <View >
                  <Text style={styles.heading}>Notes</Text>
                  <Text style={styles.txt}>{s.notes}</Text>
                </View>
                <View style={{ alignItems: 'center', marginBottom: 10, }}>
                  <TouchableOpacity style={styles.button} onPress={() => this.confirmShowing(s.id, s.showing_date, s.showing_time, s.showingAddress, s.address_value, s.showingUnit, s.unit_value, s.reschedule_status, s.client_email, s.email, s.client_name, s.client_fullname, s.listing_id)} >
                    <Text style={styles.btnText}  >Accept </Text>
                  </TouchableOpacity>

                </View>
              </CollapseBody>
            </Collapse>

          })}

        </View>
        <View style={styles.noShowing}>
          <Text style={styles.txt} style={{ textAlign: 'center' }}>{this.state.isListExist == false ? ('No Leads Found!') : (null)}</Text>
        </View>
      </View>
    );
  }
}
export default MyleadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: '#fff',
    paddingBottom: 20,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    height: '100%'
  },
  main: {
    padding: 15,
  },
  downarrow: {
    position: 'absolute',
    top: 18,
    right: 20,
  },
  mainGrid: {
    padding: 15,
    marginBottom: 0,
    borderRadius: 6,
    borderColor: '#dedede',
    borderWidth: 1,
  },
  calenderWidget: {
    backgroundColor: 'rgba(0, 79, 107, .1)',
    textAlign: 'center',
    alignItems: 'center',
    width: '22%',
    padding: 10,
    paddingTop: 18,
    paddingBottom: 18,

  },
  headerInfo: {
    width: '60%',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    margin: 0

  },
  name: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    color: '#004F6B',
    height: 30
  },
  time: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    color: '#7EA8B7',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#004F6B',
    alignItems: 'center'
  },
  year: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#004F6B',
    textTransform: 'uppercase',
    marginTop: 6,
    alignItems: 'center'
  },
  heading: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#004F6B',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  addressBlock: {
    width: '60%',
  },
  unit: {
    width: '20%'
  },
  unit1: {
    width: '30%'
  },
  txtemail: {
    fontFamily: 'Montserrat-Regular',
    letterSpacing: .5,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 15,
  },
  noShowing: {
    top: 200,
    left: 0,
    height: 300,
  },
  txt: {
    fontFamily: 'Montserrat-Medium',
    letterSpacing: .5,
    fontSize: 14,
    lineHeight: 16,
    marginBottom: 15,
    textAlign: 'left',

  }
  , modal: {
    flex: 1,
    padding: 10,
    top: 150
  },
  modalHead: {
    padding: 25,
    fontSize: 12,
    color: '#070767',
    backgroundColor: '#fff',
    paddingTop: 20,
    textAlign: 'left'
  },
  modalBody: {
    fontSize: 10,
    backgroundColor: '#fff',
    padding: 10,
    paddingTop: 0,
    paddingRight: 25,
    paddingBottom: 30,
    textAlign: 'left'
  },
  heading: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#004F6B',
    textTransform: 'uppercase',
    marginBottom: 10,
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
  infoMsg: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    padding: 15,
    paddingTop: 0,
    letterSpacing: 1,
  },
  modalBtntxt: {
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#ffffff'
  },

  btnWrapper: {
    textAlign: 'left',
    marginLeft: 15,
    justifyContent: 'flex-start',
    width: '100%',
    flexDirection: 'row',

  },
  buttonBorder: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: '#004F6B',
    borderWidth: 1,
    marginTop: 0,
    width: 100,
    padding: 8,
    paddingLeft: 15,
    paddingRight: 15,
    marginLeft: 15,
  },
  BorderbtnText: {
    color: '#004F6B',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    textTransform: 'uppercase',

  }, button: {
    backgroundColor: '#004F6B',
    borderRadius: 6,
    marginTop: 0,
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
  colheader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff'
  },
  colheaderRed: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCDAD4'
  },
  badgeWrap: {
    position: 'absolute',
    top: 15,
    left: 12,
    width: '68%',
    height: 30,
    zIndex: 99999,
    flexDirection: 'column',
    overflow: 'scroll',



  },
  badge: {
    backgroundColor: '#E3E3E3',
    borderRadius: 25,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 7,
    alignItems: 'center',
    marginRight: 2,
    flexDirection: 'row',


  },
  badgeTxt: {
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
    justifyContent: 'flex-end',
    fontSize: 11,
    color: '#6F7374',
    marginLeft: 2,

  },
  filterWidget: {
    width: 90,
    borderColor: '#004F6B',
    borderWidth: 1,
    borderRadius: 25,
    padding: 3,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 4,
    alignItems: 'center',
    flexDirection: 'row'
  },
  filterIcon: {
    color: '#004F6B', fontSize: 13,
  },
  filterIconActive: {
    color: '#fff', fontSize: 13,
  },
  filterWidgetActive: {
    width: 95,
    backgroundColor: '#004F6B',
    borderRadius: 25,
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 7,
    alignItems: 'center',
    flexDirection: 'row'
  },
  filterTxtAcitve: {
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
    justifyContent: 'space-between',
    fontSize: 13,
    color: '#fff',
    marginLeft: 5,
  },
  filterTxt: {
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
    justifyContent: 'space-between',
    fontSize: 13,
    color: '#004F6B',
    marginLeft: 5,
  },
  filterBody: {
    backgroundColor: '#fff',
    padding: 10,
    paddingLeft: 0,
    paddingRight: 15,
    marginTop: 15,
    borderColor: '#e5e5e5',
    borderWidth: 1,
    borderRadius: 6,
    paddingBottom: 35,
  },

  FilterbtnWrapper: {
    textAlign: 'center',
    marginRight: 15,
    alignItems: 'center',
    width: '100%',

  },
  Filterbutton: {
    backgroundColor: '#004F6B',
    borderRadius: 25,
    marginTop: 25,
    width: 100,
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 7,
  },
  FilterbtnText: {
    color: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    textTransform: 'uppercase'
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
  formtextLabel: {
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
    color: '#004F6B',
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase'
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
    height: 21,
    lineHeight: 14,
    top: 8,

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
  }, textErrorhead: {
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
  errortxt: {
    color: '#ff6d6d', fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    textAlign: "center",
    padding: 5,
    margin: 5,
    marginRight: 0,
    marginBottom: 0,
    borderWidth: 0,
    borderColor: '#ff6d6d',
    borderRadius: 6,
  }
});