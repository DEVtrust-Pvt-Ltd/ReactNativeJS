import React, {useState} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import {
  HEIGHT,
  INACTIVE_COLOR,
  WIDTH,
  PURPLE_GRADIENT,
  ORANGE_SHADE,
  GRADIENT_COLORS,
} from '../../constants';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {Button, CustomTextInput} from '../../components';

import normalize from 'react-native-normalize';
import ImagePicker from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {KeyboardAvoidingView} from '../../components';
import {ActivityIndicator} from 'react-native-paper';
import {baseURL} from '../../axios';
import {getValue} from '../../utils';

export const SearchBar = (props) => {
  return (
    <View style={[styles.searchContainer, props.style]}>
      <Icon
        name="search"
        color={props.iconColor || props.color || INACTIVE_COLOR}
        style={[{position: 'absolute', left: 20}, props.iconStyle]}
        size={props.size || 20}
      />
      <TextInput
        placeholder={props.placeholder || 'Search'}
        style={[{fontSize: HEIGHT / 40}, props.textStyle]}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: 'grey',
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 15,
    elevation: 12,
    height: HEIGHT / 15,
  },
  historyContainer: {
    borderWidth: 0,
    padding: 15,
    minHeight: HEIGHT / 8,
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginVertical: 7,
    width: '96%',
    alignSelf: 'center',
    borderRadius: 10,
    elevation: 8,
  },
  noteContainer: {
    minHeight: HEIGHT / 6,
    width: '96%',
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 8,
    alignSelf: 'center',
    marginVertical: 7,
    flexDirection: 'row',
  },
});
export const HistoryCard = (props) => {
  const getDate = (date) => {
    return new Date(date * 1000).toLocaleDateString();
  };
  console.log('history', props.item.item);
  return (
    <View style={styles.historyContainer}>
      <Text style={{fontSize: HEIGHT / 40, color: 'black'}}>
        {getValue(props, 'props.item.item.user.first_name') +
          ' ' +
          getValue(props, 'props.item.item.user.last_name')}
      </Text>
      <Text style={{fontSize: HEIGHT / 45, color: 'grey'}}>
        Completed on {getDate(props.item.item.start_time)}
      </Text>
    </View>
  );
};

export class ImageNoteCard extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   image: null,
    // };
  }
  // componentDidMount() {
  //   const item = this.props.item.item;
  //   if (item.uri) {
  //     {
  //       console.log('here is the problem');
  //       this.setState({image: item.uri});
  //     }
  //   } else if (item.media && item.media.length > 0) {
  //     this.setState({image: baseURL + 'download/' + item.media[0]});
  //   }
  // }
  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.item.item.uri != this.props.item.item.uri) {
  //     this.setState({image: this.props.item.item.uri});
  //   }
  // }
  render() {
    const item = this.props.item.item;
    const image =
      item.uri ||
      (item.media && item.media.length > 0
        ? baseURL + 'download/' + item.media[0]
        : null);
    return (
      <View style={styles.noteContainer}>
        <TouchableOpacity
          onPress={() => {
            if (image) this.props.onPress({uri: image});
            else {
              Alert.alert('Alert', 'No Image Available');
              return;
            }
          }}
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          {!image ? (
            <View>
              <Icon name="images" size={75} color="grey" />
            </View>
          ) : (
            <Image
              style={{height: HEIGHT / 6 - 20, width: '80%'}}
              source={{uri: image}}
              defaultSource={require('../../images/defaultImage.jpg')}
            />
          )}
        </TouchableOpacity>
        <View style={{flex: 2, padding: 10}}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
            }}>
            {item.user && (
              <Text style={{maxWidth: '70%', fontWeight: 'bold'}}>
                {(
                  item.user.first_name +
                  ' ' +
                  (item.user.last_name || '')
                ).trim()}
              </Text>
            )}
            <Text>{item.date_added}</Text>
          </View>
          <View style={{marginTop: 10}}>
            <Text style={{color: 'grey'}}>{item.text}</Text>
          </View>
        </View>
      </View>
    );
  }
}
// export const ImageNoteCard = props => {
//   const item = props.item.item;
//   // console.log(item.media ? item.media[0] : item);
//   const [image, setImage] = useState(null);
//   console.log('uri', image, item.uri);
//   if (!image && item.uri) {
//     {
//       console.log('here is the problem');
//       setImage(item.uri);
//     }
//   } else if (!image && item.media && item.media.length > 0) {
//     setImage(baseURL + 'download/' + item.media[0]);
//   }
//   return (
//     <View style={styles.noteContainer}>
//       <TouchableOpacity
//         onPress={() => {
//           if (image) props.onPress({uri: image});
//           else {
//             Alert.alert('Alert', 'No Image Available');
//             return;
//           }
//         }}
//         style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//         {!image ? (
//           <View>
//             <Icon name="images" size={75} color="grey" />
//           </View>
//         ) : (
//           <Image
//             style={{height: HEIGHT / 6 - 20, width: '80%'}}
//             source={{uri: image}}
//             defaultSource={require('../../images/defaultImage.jpg')}
//           />
//         )}
//       </TouchableOpacity>
//       <View style={{flex: 2, padding: 10}}>
//         <View
//           style={{
//             flexDirection: 'row',
//             width: '100%',
//             justifyContent: 'space-between',
//           }}>
//           <Text style={{maxWidth: '70%', fontWeight: 'bold'}}>
//             {(item.user.first_name + ' ' + (item.user.last_name || '')).trim()}
//           </Text>
//           <Text>{item.date_added}</Text>
//         </View>
//         <View style={{marginTop: 10}}>
//           <Text style={{color: 'grey'}}>{item.text}</Text>
//         </View>
//       </View>
//     </View>
//   );
// };
export class CardList extends React.Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps) {
    // console.log(nextProps.list.length, this.props.list.length);
    if (
      nextProps.list != this.props.list ||
      nextProps.list.length != this.props.list.length
    ) {
      // console.log('check again');
      // if(nextProps.list)
      // nextProps.list.pop();
      return true;
    } else {
      return false;
    }
  }
  render() {
    return (
      <View>
        <FlatList
          data={this.props.list}
          renderItem={this.props.renderItem}
          keyExtractor={(item) => item.index}
          contentContainerStyle={{
            paddingHorizontal: 5,
            paddingVertical: 10,
          }}
          // inverted={true}
        />
      </View>
    );
  }
}
// export const CardList = React.memo(CardListProto);
export class ConfirmAddress extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      addr: '',
    };
  }
  componentDidMount() {
    this.setState({addr: this.props.address});
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.addr != this.props.address)
      this.setState({addr: this.props.address});
  }
  render() {
    return (
      <View
        style={{
          position: 'absolute',
          top: HEIGHT / 10,
          backgroundColor: 'white',
          padding: 10,
          width: WIDTH / 1.1,
          elevation: 12,
          borderRadius: 10,
        }}>
        <Text style={{fontSize: HEIGHT / 40}}>Confirm Address</Text>
        <TextInput
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Address"
          value={this.state.addr}
          onChangeText={(text) => {
            this.setState({addr: text});
          }}
          style={{
            borderWidth: 1,
            marginVertical: 10,
            borderColor: ORANGE_SHADE,
            borderRadius: 10,
            height: HEIGHT / 7,
          }}
        />
        <View style={{flexDirection: 'row'}}>
          <Button
            style={{marginRight: 5, flex: 1, alignSelf: 'center'}}
            label="Save"
            onPress={this.props.onConfirm}
          />
          <Button
            label="Cancel"
            style={{marginLeft: 5, flex: 1, alignSelf: 'center'}}
            colors={PURPLE_GRADIENT}
            onPress={this.props.onCancel}
          />
        </View>
      </View>
    );
  }
}

// export const InfoWinNote = props => {
//   console.log(props.image);
//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.6)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 10,
//         borderWidth: 0,
//         width: '100%',
//       }}>
//       <View
//         style={{
//           minHeight: HEIGHT / 2,
//           width: '80%',
//           backgroundColor: 'white',
//           borderRadius: 10,
//           elevation: 12,
//           position: 'absolute',
//         }}>
//         <View style={{flex: 1, justifyContent: 'center'}}>
//           <View
//             style={{
//               flex: 1.5,
//               borderWidth: 0,
//             }}>
//             <LinearGradient
//               colors={GRADIENT_COLORS}
//               style={{
//                 ...StyleSheet.absoluteFill,
//                 borderTopLeftRadius: 10,
//                 borderTopRightRadius: 10,
//               }}
//             />

//             <View
//               style={{
//                 height: '100%',
//                 width: '75%',
//                 alignSelf: 'center',
//                 bottom: '-20%',
//                 borderRadius: 10,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 backgroundColor: !props.image ? 'grey' : 'grey',

//                 borderRadius: 20,
//               }}>
//               {!props.image && (
//                 <Image
//                   style={{
//                     height: '100%',
//                     width: '100%',
//                     alignSelf: 'center',

//                     borderRadius: 10,
//                   }}
//                   source={require('../../images/no_image.png')}
//                 />
//               )
//               // <Icon name="images" color="white" size={75} />
//               }
//               {props.image && (
//                 <Image
//                   style={{
//                     height: '100%',
//                     width: '100%',
//                     alignSelf: 'center',

//                     borderRadius: 10,
//                   }}
//                   source={{uri: props.image}}
//                 />
//               )}
//             </View>
//           </View>
//           <View
//             style={{
//               minHeight: normalize(HEIGHT / 4),
//               justifyContent: 'center',
//             }}>
//             <Text
//               style={{
//                 bottom: '-20%',
//                 alignSelf: 'center',
//                 color: 'grey',
//                 fontSize: 10,
//               }}>
//               Added On {props.date}
//             </Text>
//             <View
//               style={{
//                 bottom: 10,
//                 width: '100%',
//                 alignSelf: 'center',
//                 borderWidth: 0,
//                 marginTop: '20%',
//                 alignItems: 'center',
//               }}>
//               {/* <CustomTextInput
//                   onKeyPress={e => {
//                     if (e.nativeEvent.key == 'Enter') {
//                       dismiss();
//                     }
//                   }}
//                   multiline={true}
//                   numberOfLines={3}
//                   style={{width: '90%'}}
//                   value={text}
//                   onChangeText={text => {
//                     setText(text);
//                   }}
//                 /> */}
//               <Text style={{textAlign: 'center', fontSize: 20}}>
//                 {props.text}
//               </Text>
//               <View
//                 style={{
//                   justifyContent: 'center',
//                   marginVertical: '5%',
//                   alignItems: 'center',
//                 }}>
//                 <Button
//                   label="Dismiss"
//                   style={{
//                     width: '80%',
//                     margin: 10,
//                     padding: 5,
//                     paddingHorizontal: 20,
//                   }}
//                   onPress={props.onCancel}
//                 />
//               </View>
//             </View>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// };

export const InfoWinNote = (props) => {
  const [text, setText] = useState(props.text || '');
  const [image, setImage] = useState(props.image || false);
  const [loading, setLoading] = useState(false);
  const handleImages = () => {
    if (!props.editable) return;
    ImagePicker.showImagePicker(
      {quality: 0.5, maxHeight: 800, maxWidth: 800},
      (response) => {
        if (response.uri) {
          if (response.fileSize >= 5 * 1024 * 1024) {
            Alert.alert('Alert', 'File Size too big');
            return;
          }
          setImage(response);
        } else {
          Alert.alert('Alert', 'Unable to fetch image. Please try again');
          return;
        }
      },
    );
  };
  const handleSave = () => {
    if (!image && !text) {
      Alert.alert('Alert', 'Please fill atleast one field');
      return;
    }
    setLoading(true);
    props.onSave({
      image,
      text,
      onFail: (msg) => {
        Alert.alert('Alert', msg + ' Please try again', [
          {
            text: 'OK',
            onPress: () => {
              setLoading(false);
            },
          },
        ]);
      },
    });
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 0,
        width: '100%',
      }}>
      <KeyboardAvoidingView
        style={{
          minHeight: HEIGHT / 2,
          width: '80%',
          backgroundColor: 'white',
          borderRadius: 10,
          elevation: 12,
          position: 'absolute',
        }}>
        {(dismiss) => (
          <View style={{flex: 1, justifyContent: 'center'}}>
            {loading && (
              <ActivityIndicator
                color={ORANGE_SHADE}
                size="large"
                style={{position: 'absolute', zIndex: 15, alignSelf: 'center'}}
              />
            )}
            <View
              style={{
                flex: 1.5,
                borderWidth: 0,
              }}>
              <LinearGradient
                colors={GRADIENT_COLORS}
                style={{
                  ...StyleSheet.absoluteFill,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}
              />

              <TouchableWithoutFeedback onPress={handleImages}>
                <View
                  style={{
                    height: '100%',
                    width: '75%',
                    alignSelf: 'center',
                    bottom: '-20%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: !image ? '#acacac' : null,
                    borderWidth: 0,
                    borderRadius: 20,
                  }}>
                  {!image && <Icon name="images" color="white" size={75} />}
                  {image && (
                    <>
                      {props.editable && (
                        <TouchableOpacity
                          onPress={handleImages}
                          style={{
                            top: -10,
                            right: -10,
                            position: 'absolute',
                            zIndex: 2,
                            backgroundColor: 'red',
                            padding: 5,
                            height: 20,
                            width: 20,
                            borderRadius: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Icon
                            name="times"
                            size={10}
                            style={{zIndex: 4}}
                            color="white"
                            onPress={handleImages}
                          />
                        </TouchableOpacity>
                      )}
                      <Image
                        style={{
                          height: '100%',
                          width: '100%',
                          alignSelf: 'center',

                          borderRadius: 10,
                        }}
                        source={{uri: image.uri || image}}
                      />
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
            <View
              style={{
                minHeight: normalize(HEIGHT / 4),
                justifyContent: 'center',
              }}>
              {props.date && (
                <Text
                  style={{
                    bottom: '-20%',
                    alignSelf: 'center',
                    color: 'grey',
                    fontSize: 10,
                  }}>
                  Added On {new Date(props.date * 1000).toDateString()}
                </Text>
              )}
              <View
                style={{
                  bottom: 10,
                  width: '100%',
                  alignSelf: 'center',
                  borderWidth: 0,
                  marginTop: '20%',
                }}>
                {props.editable ? (
                  <CustomTextInput
                    onKeyPress={(e) => {
                      if (e.nativeEvent.key == 'Enter') {
                        dismiss();
                      }
                    }}
                    multiline={true}
                    numberOfLines={3}
                    style={{width: '90%'}}
                    value={text}
                    onChangeText={(text) => {
                      setText(text);
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      alignSelf: 'center',
                      borderWidth: 0.5,
                      padding: 10,
                      width: '90%',
                      textAlign: 'center',
                      borderRadius: 10,
                      textAlignVertical: 'center',
                    }}>
                    {text}
                  </Text>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginVertical: '5%',
                  }}>
                  {props.editable && (
                    <Button
                      label="Save"
                      style={{width: '40%', marginHorizontal: 5}}
                      onPress={handleSave}
                    />
                  )}
                  <Button
                    label="Cancel"
                    style={{width: '40%', marginHorizontal: 5}}
                    onPress={props.onCancel}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};
