import React from 'react';
import {View, Alert, BackHandler, Linking, Platform} from 'react-native';
import {
  HEIGHT,
  ORANGE_SHADE,
  INACTIVE_COLOR,
  GOOGLE_API_KEY,
  ORGANIZATION_ID,
  USER_ID,
  MAP_PROPS,
  USERNAME,
} from '../../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {FAB, ActivityIndicator} from 'react-native-paper';

import {ConfirmAddress, InfoWinNote} from './components';
import {PopUp, ImageNote} from '../../components';
import Share from 'react-native-share';
import Geocoder from 'react-native-geocoding';
import Geolocation from 'react-native-geolocation-service';
import {
  requestHandler,
  getValue,
  getParent,
  goBack,
  isEmptyObject,
} from '../../utils';
import ApiManager from '../../ApiManager';
import Map from './Map';
import SlidingPanel from './SlidingPanel';
import RNFetchBlob from 'rn-fetch-blob';
import {baseURL} from '../../axios';
import {decodePolyline} from '../../utils';

class Area extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      show: 'loader',
      checkIn: false,
      mapType: 'normal',
      prospectAddress: '',
      tapCoord: null,
      markers: [],
      data: null,
      showCheckIn: false,
      showCheckOut: false,
      image: null,
      note: null,
      notes: null,
      history: null,
      id: null,
      markerIndex: null,
      notesIndex: null,
    };
    this.map = null;
    this.backHandler = null;
  }

  componentDidMount() {
    Geocoder.init(GOOGLE_API_KEY);
    this.getData();
    this.props.navigation.addListener('focus', () => {
      //To prevent back press while checked in
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBackPress,
      );
      console.log('Params', this.state.data);
      if (!this.props.route.params.prospect) {
        //When addition of new prospect is cancelled

        this.setState({show: 'none', markers: this.popMarker()});
      } else {
        //When a new prospect is added
        let markers = this.popMarker();
        console.log('prospect name', this.props.route.params.prospect);
        markers = this.addMarker('green', this.props.route.params.prospect);
        this.setState({show: 'none', markers});
      }
    });

    this.props.navigation.addListener('blur', () => {
      if (this.backHandler) this.backHandler.remove();
    });

    //Handles back press on header
    this.props.navigation.setOptions({
      headerLeft: () => {
        return (
          <Icon
            name="arrow-left"
            size={25}
            color="white"
            style={{marginLeft: 10, padding: 5}}
            onPress={() => {
              if (this.state.checkIn) {
                Alert.alert('Alert', 'Check out before leaving screen');
              } else if (!this.props.navigation.dangerouslyGetParent()) {
                this.props.navigation.replace('dashboard');
              } else if (this.props.navigation.canGoBack()) {
                this.props.navigation.goBack();
              } else {
                this.props.navigation.reset({
                  index: 0,
                  routes: [{name: 'dashboard'}],
                });
              }
            }}
          />
        );
      },
    });
  }
  getData = async () => {
    console.log(this.props.route.params.id);
    //setTimeout(() => {
    requestHandler(
      ApiManager.getArea,
      async (res) => {
        console.log('notes', res.data.notes, res.data.checkins);
        let notes = res.data.notes.reverse();
        let history = res.data.checkins.reverse();
        this.props.navigation.setOptions({
          title: res.data.name,
        });
        let data = res.data;
        if (res.data.encoded_path)
          data = {
            ...data,
            polyline: await decodePolyline(res.data.encoded_path),
          };
        //console.log('polyline', decodePolyline(res.data.encoded_path));
        this.setState({data, show: 'none', notes, history}, this.putMarkers);
      },
      () => {
        this.setState({show: 'none'});
        goBack();
      },
      this.props.route.params.id,
    );
    //}, 5000);
  };
  putMarkers = () => {
    let markers = this.state.data.pins.map((item, index) => {
      if (isEmptyObject(item)) return null;
      var color = 'orange';
      let message = '';
      if (item.type == 'no_one_home') {
        color = 'yellow';
        message = 'No One Home';
      } else if (item.type == 'do_not_knock') {
        color = 'orange';
        message = 'Do Not Knock';
      }
      return {
        coord: {
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
        },
        color,
        message,
      };
    });
    markers = [
      ...markers,
      ...this.state.data.prospects.map((item) => {
        if (isEmptyObject(item)) return null;
        return {
          coord: {
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
          },
          color: 'green',
          message: (item.first_name + ' ' + (item.last_name || '')).trim(),
        };
      }),
    ];
    console.log(markers.length);
    const l = markers.length;
    markers = [
      ...markers,
      ...this.state.data.notes.map((item, index) => {
        if (isEmptyObject(item)) return null;
        // console.log(
        //   'note marker',
        //   item,
        //   index,
        //   markers.length,
        //   markers.length + index,
        // );
        const handleMarkerPress = () => {
          console.log('marker pressed', item, index, markers.length, l + index);
          if (item.media && item.media.length > 0)
            this.setState({
              show: 'InfoWinNote',
              note: {
                image: baseURL + 'download/' + item.media[0],
                note: item.text,
                date: item.date_added,
                id: item._id,
                notesIndex: index,
                markerIndex: l + index,
              },
            });
          else
            this.setState({
              show: 'InfoWinNote',
              note: {
                image: null,
                date: item.date_added,
                note: item.text,
                id: item._id,
                notesIndex: index,
                markerIndex: l + index,
              },
            });
        };

        return {
          coord: {
            latitude: parseFloat(item.latitude) || 0,
            longitude: parseFloat(item.longitude) || 0,
          },
          color: 'blue',
          message: item.text,
          onPress: handleMarkerPress,
        };
      }),
    ];

    console.log('markers', markers.length);
    if (this.state.data.latitude && this.state.data.longitude) {
      markers = [
        ...markers,
        {
          coord: {
            latitude: parseFloat(this.state.data.latitude) || 0,
            longitude: parseFloat(this.state.data.longitude) || 0,
          },
          color: 'red',
          message: '',
        },
      ];
    }

    this.setState({markers: [...this.state.markers, ...markers]});
  };
  handleBackPress = () => {
    if (this.state.checkIn) {
      Alert.alert('Alert', 'Check out before leaving screen');
    } else if (!this.props.navigation.dangerouslyGetParent()) {
      this.props.navigation.replace('dashboard');
    } else if (this.props.navigation.canGoBack()) {
      this.props.navigation.goBack();
    } else {
      this.props.navigation.reset({
        index: 0,
        routes: [{name: 'dashboard'}],
      });
    }
    return true;
  };
  shareUrl = async () => {
    Share.open({
      title: 'Welcome',
      message:
        'Copy the text below and paste it in Google Chrome or Safari Browser',
      url:
        'https://www.knockyoursalesoff.com/homestack/area/' +
        this.props.route.params.id,
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        err && console.log(err);
      });
  };

  checkIn = async () => {
    this.setState({show: 'loader'}, async () => {
      await Geolocation.getCurrentPosition(
        async (position) => {
          const value = {
            area_id: this.props.route.params.id,
            organization_id: await ORGANIZATION_ID(),
            user_id: await USER_ID(),

            checkin_latitude: position.coords.latitude,
            checkin_longitude: position.coords.longitude,
          };
          console.log('check in', value);
          requestHandler(
            ApiManager.areaCheckIn,
            (res) => {
              this.setState(
                {
                  showCheckIn: true,
                  checkin_id: res.data._id,
                  show: 'checkIn',
                  checkIn: true,
                },
                // () => {
                //   this.props.navigation.reset({
                //     index: 0,
                //     routes: [
                //       {name: 'Area', params: {id: this.props.route.params.id}},
                //     ],
                //   });
                // },
              );
            },
            () => {
              this.setState({show: 'none'});
            },
            value,
          );
        },
        (error) => {
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
      );
    });
  };

  checkOut = async () => {
    this.setState({show: 'loader'});
    const start = new Date();
    await Geolocation.getCurrentPosition(
      async (position) => {
        var coord = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const value = {
          area_id: this.props.route.params.id,
          checkin_id: this.state.checkin_id,
          organization_id: await ORGANIZATION_ID(),
          user_id: await USER_ID(),

          checkout_latitude: position.coords.latitude,
          checkout_longitude: position.coords.longitude,
        };
        console.log(value);
        requestHandler(
          ApiManager.areaCheckOut,
          (res) => {
            this.setState({
              showCheckOut: true,
              show: 'checkOut',
            });
          },
          () => {
            this.setState({show: 'none'});
          },
          value,
        );
      },
      (error) => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
    );
  };
  normalMap = () => {
    this.setState({mapType: 'normal'});
  };
  earthMap = () => {
    this.setState({mapType: 'earth'});
  };
  //getAddress = latlng => {
  //  Geocoder.from(latlng.latitude, latlng.longitude).then(obj => {
  //    console.log(obj, obj.formatted_address, obj.results[0].formatted_address);
  //    this.setState({
  //      addr: obj.formatted_address || obj.results[0].formatted_address,
  //      latMid: latlng.latitude,
  //      longMid: latlng.longitude,
  //    });
  //  });
  //};
  selectOption = async (action) => {
    if (action == 'Add Note') {
      this.setState({
        markers: this.addMarker('blue', 'New Note'),
        show: 'note',
      });
    } else if (action == 'Prospect') {
      Geocoder.from(
        this.state.tapCoord.latitude,
        this.state.tapCoord.longitude,
      ).then((obj) => {
        this.setState({
          prospectAddress: obj.results[0].formatted_address,
          markers: this.addMarker('green', 'New Prospect'),
          show: 'confirmAddress',
        });
      });
    } else if (action == 'Do Not Knock') {
      this.setState({show: 'loader'});
      requestHandler(
        ApiManager.dropPins,
        (res) => {
          this.setState({
            markers: this.addMarker('orange', 'Do Not Knock'),
            show: 'none',
          });
        },
        () => {
          this.setState({show: 'none'});
        },
        {
          area_id: this.props.route.params.id,
          user_id: await USER_ID(),
          organization_id: await ORGANIZATION_ID(),
          latitude: this.state.tapCoord.latitude,
          longitude: this.state.tapCoord.longitude,
          //date_added: new Date().toLocaleDateString(),
          type: 'do_not_knock',
        },
      );
    } else if (action == 'No One Home') {
      this.setState({show: 'loader'});
      requestHandler(
        ApiManager.dropPins,
        (res) => {
          this.setState({
            markers: this.addMarker('yellow', 'No One Home'),
            show: 'none',
          });
        },
        () => {
          this.setState({show: 'none'});
        },
        {
          area_id: this.props.route.params.id,
          user_id: await USER_ID(),
          organization_id: await ORGANIZATION_ID(),
          latitude: this.state.tapCoord.latitude,
          longitude: this.state.tapCoord.longitude,
          //date_added: new Date().toLocaleDateString(),
          type: 'no_one_home',
        },
      );
    } else if (action == 'Cancel') {
      this.setState({show: 'none'});
    }
  };

  confirmProspectAddress = () => {
    console.log({
      address: this.state.prospectAddress,
      value: this.state.tapCoord,
      type: 'new',
      area_id: this.props.route.params.id || null,
    });
    this.props.navigation.push('addprospect', {
      address: this.state.prospectAddress,
      value: this.state.tapCoord,
      type: 'new',
      area_id: this.props.route.params.id || null,
    });
  };
  mapTap = (c) => {
    if (!this.state.checkIn) {
      return;
    } else if (this.state.show == 'none') {
      this.setState({show: 'menu', tapCoord: c});
    } else if (this.state.show == 'confirmAddress') {
      this.setState({show: 'none', markers: this.popMarker()});
    } else {
      this.setState({show: 'none'});
    }
  };
  addMarker = (color, message) => {
    const markers = [...this.state.markers];
    markers.push({
      coord: this.state.tapCoord,
      color: color || 'red',
      message: message || 'callout',
    });
    return markers;
  };

  addNote = async ({image, text, onFail}) => {
    // this.setState({show: 'loader'});
    const value = {
      area_id: this.props.route.params.id,
      user_id: await USER_ID(),
      organization_id: await ORGANIZATION_ID(),
      text: text || 'Added Note',
      date_added: new Date().toLocaleDateString(),
      latitude: this.state.tapCoord.latitude.toString(),
      longitude: this.state.tapCoord.longitude.toString(),
    };
    const arr = [
      {name: 'area_id', data: value.area_id},
      {name: 'user_id', data: value.user_id},
      {name: 'organization_id', data: value.organization_id},
      {name: 'text', data: value.text},
      //{name: 'date_added', data: value.date_added},
      {name: 'latitude', data: value.latitude},
      {name: 'longitude', data: value.longitude},
    ];
    if (image && image.type && image.data) {
      arr.push({
        name: 'photos',
        filename: 'image',
        data: image.data,
        type: image.type,
      });
    }

    ApiManager.addNote(
      arr,
      async (res) => {
        try {
          const r = JSON.parse(res.data);
          console.log('added successfully', r, r.data.media, r.data.date_added);
          // const {data}=res.data
          // const {notes} = this.state.data;
          const newNote = {
            date_added: r.data.date_added,
            user: {first_name: await USERNAME(), last_name: ''},
            text: value.text,
            uri: image.uri,
          };
          const notes = [...this.state.data.notes, newNote];
          // const {markers} = this.state

          const markers = this.popMarker();
          const l = markers.length;
          const media = r.data.media;
          const handleMarkerPress = () => {
            if (media && media.length > 0)
              this.setState({
                show: 'InfoWinNote',
                note: {
                  image: baseURL + 'download/' + media[0],
                  note: value.text,
                  date: r.data.date_added,

                  notesIndex: notes.length - 1,
                  markerIndex: l,
                  id: r.data._id,
                },
              });
            else
              this.setState({
                show: 'InfoWinNote',
                note: {
                  image: null,
                  date: r.data.date_added,
                  note: value.text,
                  notesIndex: notes.length - 1,
                  markerIndex: l,
                  id: r.data._id,
                },
              });
          };
          markers.push({
            coord: {
              latitude: value.latitude,
              longitude: value.longitude,
            },
            color: 'blue',
            message: value.text,
            onPress: handleMarkerPress,
          });

          // console.log(notes, markers);
          this.setState(
            {
              data: {...this.state.data, notes},
              show: 'none',
              markers,
              notes,
            },
            () => {
              Alert.alert('Alert', 'Note Added Successfully');
            },
          );
        } catch (e) {
          console.log(e);
          this.setState({show: 'none', markers: this.popMarker()}, () => {
            onFail('Something went wrong');
          });
        }
      },
      (e) => {
        this.setState({show: 'none', markers: this.popMarker()}, () => {
          onFail('Something went wrong');
        });
      },
    );
  };
  editNote = async ({image, text, onFail}) => {
    const value = {
      id: this.state.note.id,
      area_id: this.props.route.params.id,
      user_id: await USER_ID(),
      organization_id: await ORGANIZATION_ID(),
      text: text || 'Added Note',
      // date_added: new Date().toLocaleDateString(),
      // latitude: this.state.tapCoord.latitude.toString(),
      // longitude: this.state.tapCoord.longitude.toString(),
    };
    const arr = [
      {name: 'note_id', data: value.id},
      {name: 'area_id', data: value.area_id},
      {name: 'user_id', data: value.user_id},
      {name: 'organization_id', data: value.organization_id},
      {name: 'text', data: value.text},
      // {name: 'date_added', data: value.date_added},
      // {name: 'latitude', data: value.latitude},
      // {name: 'longitude', data: value.longitude},
    ];
    if (image && image.type && image.data) {
      arr.push({
        name: 'photos',
        filename: 'image',
        data: image.data,
        type: image.type,
      });
    }
    console.log('arr', arr);
    ApiManager.editNote(
      arr,
      async (res) => {
        let r = JSON.parse(res.data);
        console.log('request succesful', r.status, r.data._id);
        // r = JSON.parse(r.data);
        // console.log('edited successfully', r, r.data.media);

        // const newNote = {
        //   date_added: value.date_added,
        //   user: {first_name: await USERNAME(), last_name: ''},
        //   text: value.text,
        //   uri: image.uri,
        // };
        const {markerIndex, notesIndex} = this.state.note;
        console.log('note state', this.state.note, markerIndex, notesIndex);
        let notes = [...this.state.notes];
        notes[notesIndex] = {
          ...notes[notesIndex],
          text: value.text,
          uri: baseURL + 'download/' + r.data.media[0],
        };

        console.log('note', notes[notesIndex]);
        // const markers = this.popMarker();
        const handleMarkerPress = () => {
          console.log('note marker pressed', {
            id: r.data._id,
            markerIndex,
            notesIndex,
            image: baseURL + 'download/' + r.data.media[0],
            note: value.text,
            date: value.date_added,
          });
          if (r.data.media && r.data.media.length > 0)
            this.setState({
              show: 'InfoWinNote',
              note: {
                id: r.data._id,
                markerIndex,
                notesIndex,
                image: baseURL + 'download/' + r.data.media[0],
                note: value.text,
                date: value.date_added,
              },
            });
          else
            this.setState({
              show: 'InfoWinNote',
              note: {
                id: r.data._id,
                markerIndex,
                notesIndex,
                image: null,
                date: value.date_added,
                note: value.text,
              },
            });
        };
        // markers.push({
        //   coord: {
        //     latitude: value.latitude,
        //     longitude: value.longitude,
        //   },
        //   color: 'blue',
        //   message: value.text,
        //   onPress: handleMarkerPress,
        // });
        let markers = [...this.state.markers];
        markers[markerIndex] = {
          ...markers[markerIndex],
          message: value.text,
          onPress: handleMarkerPress,
        };
        console.log(
          'Marker',
          markerIndex,
          this.state.markers.length,
          markers[markerIndex],
        );
        this.setState(
          {
            data: {...this.state.data, notes},
            show: 'none',
            markers,
            notes: notes,
          },
          () => {
            console.log(this.state.data.notes);
            Alert.alert('Alert', 'Note Edited Successfully');
          },
        );
      },
      (e) => {
        this.setState({show: 'none'}, () => {
          onFail('Something went wrong');
        });
      },
    );
  };
  showMenu = (value) => {
    switch (this.state.show) {
      case 'none':
        return null;
        break;
      case 'menu':
        return (
          <PopUp
            text="What do you want to add at this location?"
            primaryColor="green"
            icon="map-pin"
            iconStyle={{color: 'white', backgroundColor: 'green'}}
            options={[
              'Prospect',
              'Do Not Knock',
              'No One Home',
              'Add Note',
              {color: 'red', text: 'Cancel'},
            ]}
            onPress={this.selectOption}
          />
        );
        break;
      case 'note':
        return (
          <ImageNote
            onSave={this.addNote}
            onCancel={() => {
              this.setState({show: 'none', markers: this.popMarker()});
            }}
          />
        );
        break;
      case 'confirmAddress':
        return (
          <PopUp
            containerStyle={{position: 'absolute', top: HEIGHT / 10}}
            heading="Confirm Address"
            input={true}
            value={this.state.prospectAddress}
            options={['Confirm', 'Cancel']}
            alignHorizontal={true}
            inputProps={{
              multiline: true,
              numberOfLines: 4,
              textAlignVertical: 'top',
              placeholder: 'Address',
            }}
            onPress={(choice) => {
              switch (choice) {
                case 'Confirm':
                  this.confirmProspectAddress();
                  break;
                case 'Cancel':
                default:
                  this.setState({show: 'none', markers: this.popMarker()});
              }
            }}
          />
          //<ConfirmAddress
          //  address={this.state.prospectAddress}
          //  onConfirm={this.confirmProspectAddress}
          //  onCancel={() => {
          //    this.setState({show: 'none', markers: this.popMarker()});
          //  }}
          ///>
        );
        break;
      case 'loader':
        return <ActivityIndicator size={50} color={ORANGE_SHADE} />;
        break;
      case 'checkIn':
        return (
          <PopUp
            heading="Checked In"
            primaryColor="green"
            text="You have successfully checked in"
            options={['OK']}
            onPress={(item) => {
              this.setState({checkIn: true, show: 'none', showCheckIn: false});
            }}
          />
        );
        break;
      case 'checkOut':
        return (
          <PopUp
            heading="Checked Out"
            primaryColor="red"
            text="You have successfully checked out"
            options={['OK']}
            onPress={(item) => {
              this.setState(
                {
                  checkIn: false,
                  show: 'none',
                  showCheckOut: false,
                },
                () => {
                  this.props.navigation.reset({
                    index: 0,
                    routes: [{name: 'dashboard'}],
                  });
                },
              );
            }}
          />
        );
        break;
      case 'InfoWinNote':
        return (
          <InfoWinNote
            image={this.state.note.image}
            text={this.state.note.note}
            date={this.state.note.date}
            onSave={this.editNote}
            onCancel={() => {
              console.log('check');
              this.setState({show: 'none', note: null, image: null});
            }}
            editable={this.state.checkIn}
          />
          // <ImageNote
          //   image={this.state.image}
          //   text={this.state.note}
          //   date={this.state.date}
          //   onSave={this.editNote}
          //   onCancel={() => {
          //     console.log('check');
          //     this.setState({show: 'none', note: null, image: null});
          //   }}
          // />
        );
    }
  };
  popMarker = () => {
    const markers = [...this.state.markers];
    markers.pop();
    return markers;
  };
  handleNavigation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log(this.state.data.overlay_data, this.state.data.position);
        let destination = {};
        if (this.state.data.polyline && this.state.data.polyline.length > 0) {
          destination = {
            lat: this.state.data.polyline[0].latitude,
            lng: this.state.data.polyline[0].longitude,
          };
        } else if (this.state.data.latitude && this.state.data.longitude) {
          console.log('check');
          destination = {
            lat: this.state.data.latitude,
            lng: this.state.data.longitude,
          };
        }
        let url;
        if (Platform.OS == 'android') {
          url =
            'https://www.google.com/maps/dir/?api=1&origin=' +
            origin.lat +
            ',' +
            origin.lng +
            '&destination=' +
            destination.lat +
            ',' +
            destination.lng;
        } else {
          url =
            'https://maps.apple.com/ ?saddr=' +
            origin.lat +
            ',' +
            origin.lng +
            '&daddr=' +
            destination.lat +
            ',' +
            destination.lng;
        }
        Linking.canOpenURL(url).then((res) => {
          if (res) {
            Linking.openURL(url).then((res) => {
              if (!res) {
                Alert.alert('Alert', 'Could not open Link');
              }
            });
          } else {
            Alert.alert('Alert', 'Could not open Link');
          }
        });
      },
      (error) => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
    );
  };
  render() {
    return (
      <View style={styles.container}>
        <FAB.Group
          style={{
            position: 'absolute',
            bottom: 0,
            zIndex: 1,
            paddingBottom: HEIGHT / 8,
          }}
          open={this.state.open}
          color={INACTIVE_COLOR}
          fabStyle={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
          }}
          icon={() => {
            return this.state.open ? (
              <Icon
                style={{alignSelf: 'center'}}
                name="times"
                size={22}
                color={ORANGE_SHADE}
              />
            ) : (
              <Icon
                style={{alignSelf: 'center'}}
                name="check"
                size={22}
                color={ORANGE_SHADE}
              />
            );
          }}
          theme={{colors: {text: 'black'}}}
          actions={[
            {
              icon: () => (
                <Icon
                  style={{alignSelf: 'center'}}
                  name="share-alt"
                  color={ORANGE_SHADE}
                  size={20}
                />
              ),
              label: 'Share URL',
              onPress: () => this.shareUrl(),
            },
            this.state.mapType == 'earth'
              ? {
                  icon: () => (
                    <Icon
                      style={{alignSelf: 'center'}}
                      name="satellite"
                      color={ORANGE_SHADE}
                      size={20}
                    />
                  ),
                  label: 'Normal View',
                  onPress: this.normalMap,
                }
              : {
                  icon: () => (
                    <Icon
                      style={{alignSelf: 'center'}}
                      name="globe-americas"
                      color={ORANGE_SHADE}
                      size={20}
                    />
                  ),
                  label: 'Earth View',
                  onPress: this.earthMap,
                },
            {
              icon: () => (
                <Icon
                  style={{alignSelf: 'center'}}
                  name="map-marked"
                  color={ORANGE_SHADE}
                  size={20}
                />
              ),
              label: 'Navigation',
              onPress: this.handleNavigation,
            },
            this.state.checkIn
              ? {
                  icon: () => (
                    <Icon
                      style={{alignSelf: 'center'}}
                      name="door-closed"
                      color={ORANGE_SHADE}
                      size={20}
                    />
                  ),
                  label: 'Check Out',
                  onPress: this.checkOut,
                }
              : {
                  icon: () => (
                    <Icon
                      style={{alignSelf: 'center'}}
                      name="door-open"
                      color={ORANGE_SHADE}
                      size={20}
                    />
                  ),
                  label: 'Check In',
                  onPress: this.checkIn,
                },
          ]}
          onStateChange={({open}) => {
            this.setState({open});
          }}
          onPress={() => {
            this.setState({open: true});
          }}
        />

        {/*<Map
          {...MAP_PROPS}
          mapType={this.state.mapType == 'normal' ? 'standard' : 'satellite'}
          polyline={getValue(this, 'this.state.data.polyline') || []}
          mapTap={this.mapTap}
          markers={this.state.markers}
        />*/}
        {this.state.data && (
          <>
            <Map
              {...MAP_PROPS}
              mapType={
                this.state.mapType == 'normal' ? 'standard' : 'satellite'
              }
              polyline={this.state.data.polyline}
              mapTap={this.mapTap}
              markers={this.state.markers}
              overlayColor={this.state.data?.overlay_color || 'red'}
            />
          </>
        )}
        <SlidingPanel
          notes={this.state.notes || []}
          history={this.state.history || []}
        />
        {/* <InfoWinNote text="check" image={null} onCancel={() => {}} /> */}
        {this.state.checkIn && this.showMenu()}
        {!this.state.checkIn &&
          this.state.show == 'InfoWinNote' &&
          this.showMenu()}
      </View>
    );
  }
}

export default Area;
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
