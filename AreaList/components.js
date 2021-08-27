import React from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import {GRADIENT_COLORS, HEIGHT} from '../../constants';
import LinearGradient from 'react-native-linear-gradient';
import {Button, CustomSegmentedControlTab} from '../../components';
getDate = date => {
  return (
    date.getDate().toString() +
    '/' +
    date.getMonth().toString() +
    '/' +
    date.getYear().toString()
  );
};
export const Card = props => {
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
              props.onPress(item._id);
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
// export const List = React.memo(
//   props => {
//     return (
//       <FlatList
//         data={props.list}
//         ListHeaderComponent={
//           <CustomSegmentedControlTab
//             values={['Open', 'Close']}
//             tabsContainerStyle={{
//               width: '90%',
//               alignSelf: 'center',
//               marginVertical: 10,
//             }}
//             selectedIndex={props.selectedIndex}
//             onTabPress={props.tabPress}
//           />
//         }
//         refreshing={props.refreshing}
//         renderItem={item => {
//           if (
//             (props.selectedIndex == 0 && item.item.status != 'Open') ||
//             (props.selectedIndex == 1 && item.item.status != 'Close')
//           )
//             return null;

//           return (
//             <Card
//               item={item}
//               navigation={props.navigation}
//               onPress={props.cardPress}
//             />
//           );
//         }}
//         onRefresh={props.refresh}
//         keyExtractor={item => item._id}
//         contentContainerStyle={{paddingBottom: 40}}
//       />
//     );
//   },
//   (prevProps, nextProps) => {
//     if (prevProps.list == nextProps.list) return true;
//     else return false;
//   },
// );
// export const Button = props => {
//   return (
//     <TouchableOpacity
//       style={[
//         {
//           height: 40 < HEIGHT / 14 ? 40 : HEIGHT / 14,
//           borderRadius: 10,
//           justifyContent: 'center',
//           alignItems: 'center',
//           padding: 5,
//         },
//         props.style,
//       ]}
//       onPress={props.onPress}>
//       <LinearGradient
//         colors={props.colors || GRADIENT_COLORS}
//         style={[
//           {
//             position: 'absolute',
//             left: 0,
//             right: 0,
//             top: 0,
//             bottom: 0,
//             borderRadius: 10,
//           },
//           props.gradientStyle,
//         ]}
//       />
//       <Text style={{color: 'white', fontSize: 17}}>
//         {props.label || 'Button'}
//       </Text>
//     </TouchableOpacity>
//   );
// };
