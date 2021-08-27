import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {HEIGHT, WIDTH, ORANGE_SHADE} from '../../constants';
import MapView, {PROVIDER_GOOGLE, Callout} from 'react-native-maps';
import {Marker, Polyline} from '../../components';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {isEmptyObject} from '../../utils';
export default class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMapReady: false,
      region: null,
      markers: [],
      tapCoord: null,
    };
  }
  componentDidMount() {
    if (this.props.polyline) {
      console.log('plot polyline', this.props.polyline);
      this.fitToElements();
    }
    this.plotMarkers();
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.polyline != prevProps.polyline) {
      this.fitToElements();
    }
    if (this.props.markers != prevProps.markers) {
      console.log('markers', this.props.markers);
      this.plotMarkers();
    }
  }

  getCoordObj = (decode) => {
    return decode.map((item) => {
      return {latitude: item.lat, longitude: item.lng};
    });
  };

  mapTap = (c, p) => {
    if (c.nativeEvent.action != 'marker-press') {
      this.setState({
        tapCoord: c.nativeEvent.coordinate,
      });
      this.props.mapTap(c.nativeEvent.coordinate);
    }
  };
  fitToElements = () => {
    if (this.state.isMapReady) {
      this.map.fitToElements(true);
    }
  };
  getPolylineRegion = () => {
    let latMin = null,
      latMax = null,
      lngMin = null,
      lngMax = null;
    const c = this.props.polyline;
    for (var i = 0; i < c.length; i++) {
      if (latMax == null || c[i].latitude > latMax) {
        latMax = c[i].latitude;
      }
      if (latMin == null || c[i].latitude < latMin) {
        latMin = c[i].latitude;
      }
      if (lngMin == null || c[i].longitude < lngMin) {
        lngMin = c[i].longitude;
      }

      if (latMin == null || c[i].longitude > lngMax) {
        lngMax = c[i].longitude;
      }
    }
    if (latMax)
      return {
        latitude: (latMax + latMin) / 2,
        longitude: (lngMax + lngMin) / 2,
        longitudeDelta: Math.abs(lngMax - lngMin) + 0.0001,
        latitudeDelta: Math.abs(latMax - latMin) + 0.0001,
      };
    else return null;
  };
  plotMarkers = () => {
    console.log('plotting markers');
    let item;
    let markers = [];
    for (var index = 0; index < this.props.markers.length; index++) {
      item = this.props.markers[index];
      if (
        isEmptyObject(item) ||
        (!parseFloat(item?.coord?.latitude) &&
          !parseFloat(item?.coord?.longitude) &&
          item.color != 'red')
      )
        continue;
      if (item.color == 'red' && this.state.isMapReady) {
        this.map &&
          this.map.animateToRegion({
            latitude: parseFloat(item.coord.latitude),
            longitude: parseFloat(item.coord.longitude),
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
      }
      if (item.color == 'blue') {
        markers.push(
          <Marker
            tracksViewChanges={false}
            identifier={index.toString()}
            key={index}
            coordinate={{
              latitude: parseFloat(item.coord.latitude),
              longitude: parseFloat(item.coord.longitude),
            }}
            pinColor={item.color || 'red'}
            onPress={item.onPress}
            //onPress={
            //  item.onPress
            //    ? () => {
            //        item.onPress(item._id);
            //      }
            //    : null
            //}
          />,
        );
      } else
        markers.push(
          <Marker
            tracksViewChanges={false}
            identifier={index.toString()}
            key={index}
            coordinate={{
              latitude: parseFloat(item.coord.latitude),
              longitude: parseFloat(item.coord.longitude),
            }}
            pinColor={item.color || 'red'}>
            {item.message ? (
              <Callout style={{justifyContent: 'center'}}>
                <Text>{item.message}</Text>
              </Callout>
            ) : null}
          </Marker>,
        );
    }
    //const markers = this.props.markers.map((item, index) => {
    //  if (item.color == 'red' && this.state.isMapReady) {
    //    this.map &&
    //      this.map.animateToRegion({
    //        latitude: parseFloat(item.coord.latitude),
    //        longitude: parseFloat(item.coord.longitude),
    //        latitudeDelta: 0.5,
    //        longitudeDelta: 0.5,
    //      });
    //  }
    //  if (item.color == 'blue') {
    //    return (
    //      <Marker
    //        tracksViewChanges={false}
    //        identifier={index.toString()}
    //        key={index}
    //        coordinate={{
    //          latitude: parseFloat(item.coord.latitude),
    //          longitude: parseFloat(item.coord.longitude),
    //        }}
    //        pinColor={item.color || 'red'}
    //        onPress={item.onPress}
    //        //onPress={
    //        //  item.onPress
    //        //    ? () => {
    //        //        item.onPress(item._id);
    //        //      }
    //        //    : null
    //        //}
    //      />
    //    );
    //  } else
    //    return (
    //      <Marker
    //        tracksViewChanges={false}
    //        identifier={index.toString()}
    //        key={index}
    //        coordinate={{
    //          latitude: parseFloat(item.coord.latitude),
    //          longitude: parseFloat(item.coord.longitude),
    //        }}
    //        pinColor={item.color || 'red'}>
    //        {item.message ? (
    //          <Callout style={{justifyContent: 'center'}}>
    //            <Text>{item.message}</Text>
    //          </Callout>
    //        ) : null}
    //      </Marker>
    //    );
    //});
    this.setState({markers}, () => {
      this.fitToElements();
    });
  };
  render() {
    console.log('Map Rerendered');
    const isAndroid = Platform.OS === 'android';
    return (
      <>
        <TouchableOpacity
          onPress={() => {
            this.fitToElements(true);
          }}
          style={{
            position: 'absolute',
            right: 10,
            top: 10,
            zIndex: 10,
            backgroundColor: ORANGE_SHADE,
            padding: 5,
            borderRadius: 20,
            height: 40,
            width: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon
            name="compress"
            size={25}
            color="white"
            onPress={() => {
              this.fitToElements(this.props.polyline);
            }}
          />
        </TouchableOpacity>
        <MapView
          ref={(ref) => {
            this.map = ref;
          }}
          mapPadding={{
            top: isAndroid ? 0 : 5,
            bottom: isAndroid ? 0 : 5,
            left: isAndroid ? 0 : 5,
            right: isAndroid ? 0 : 5,
          }}
          onMarkerPress={(e) => {
            console.log(e.nativeEvent);
          }}
          onMapReady={() => {
            console.log('map ready');
            this.setState({isMapReady: true}, () => {
              this.fitToElements();
            });
          }}
          onLayout={() => {
            this.fitToElements();
          }}
          onPress={this.mapTap}
          mapType={this.props.mapType}
          provider={PROVIDER_GOOGLE}
          style={{
            ...StyleSheet.absoluteFill,
            position: 'absolute',

            bottom: HEIGHT / 8,
            //borderWidth: 100,
          }}
          showsMyLocationButton={false}
          showsUserLocation={true}>
          {this.props.polyline && (
            <Polyline
              coordinates={this.props.polyline}
              strokeWidth={5}
              strokeColor={this.props.overlayColor}
            />
          )}

          {this.props.markers && this.state.markers}
        </MapView>
      </>
    );
  }
}
