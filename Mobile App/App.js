import React ,{useEffect, useState} from "react";
import {Text,HStack,Center,NativeBaseProvider,extendTheme,VStack,Button,ScrollView} from "native-base";
import { VictoryChart,VictoryTheme,VictoryLine, VictoryLabel, VictoryAxis} from "victory-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTemperatureThreeQuarters,faDroplet, faEraser, faBell } from "@fortawesome/free-solid-svg-icons";
import { Dimensions } from "react-native";
import axios from "axios";
// Define the config
const config = {
  useSystemColorMode: false,
  initialColorMode: "dark",
};
// extend the theme
export const theme = extendTheme({ config });

axios.defaults.baseURL = 'http://remote-monitoring-api.herokuapp.com/readings'

export default function App() {
  const [tempData, setTempData] = useState([]);
  const [humData, setHumData] = useState([]);
  const [alarmStatusMessage,setAlarmStatusMessage] = useState('Set');
  const [minX,setMinX]= useState(0);
  const [maxX,setMaxX]= useState(50);

  //get temp data
  const getTempData = async ()=>{
    try{
      const resp = await axios.get('/temp',{
        headers: {
          'Content-Type': 'application/json'
      }
      })
      if(resp.data.temperatures.length % 50 == 0){
        setMinX(resp.data.temperatures.length);
        setMaxX(50+resp.data.temperatures.length);
      }
      setTempData(resp.data.temperatures);

    }
    catch (err){
      throw (err.message);
    }
  }
  //plot temp data
  const PlotTemperatureData=()=>{
    setInterval(()=>{
      getTempData();
    },2200)
  }

  //get humidity data
  const getHumData = async ()=>{
    try{
      const resp = await axios.get('/humidity',{
        headers: {
          'Content-Type': 'application/json'
      }
      })
      setHumData(resp.data.humidities);
    }
    catch (err){
      throw (err.message);
    }
  }
  //plot humitiy data
  const PlotHumidityData=()=>{
    setInterval(()=>{
      getHumData()
    },2200)
  }
  const setAlarm = (status)=>{
    axios.post('/control/alarm',{
      "is_set": status
    })
    .then((res)=>{
      console.log(res.status);
    })
    .catch((err)=>{
      console.log(err.message);
    })
  }
  const toggleAlarm=()=>{
    axios.get('/control/alarm')
    .then((res)=>{
      if(res.data.alarm == 1){
        setAlarmStatusMessage('Set')
        setAlarm(0);
      }
      else{
        setAlarmStatusMessage('Disable')
        setAlarm(1);
      }
    })
    .catch((err)=>{
      throw(err.message)
    })
  }

  const deleteData=()=>{
    setTempData([]);
    setHumData([]);
  }

  return (
    <NativeBaseProvider>
      <Center height='94%' >
        <ScrollView>
        <VStack safeArea > 
            <Text mt={1} textAlign='center' color='tertiary.600'> <FontAwesomeIcon  color="#059669" icon={faTemperatureThreeQuarters}/> Tempreature Graph</Text>
            <Center>
              <HStack >
                <ScrollView mx={5} horizontal={true}>
                    <VictoryChart  width={Dimensions.get('window').width} theme={VictoryTheme.material} >
                      <VictoryLine  style={{
                        data: { stroke: '#059669'}
                      }} animate={{
                        duration:5000,
                        easing:'sinIn'
                      }}
                      data={tempData}  y="temperature" />
                      <VictoryAxis domain={{x:[minX,maxX]}} style={{axisLabel:{
                        fontSize: 15, fill:'#059669'
                      }}} crossAxis label='Time' axisLabelComponent={<VictoryLabel dy={25}  textAnchor='inherit' />}/>
                      <VictoryAxis style={{axisLabel:{
                        fontSize: 15, fill:'#059669'
                      }}} dependentAxis crossAxis  label='Temperature'   axisLabelComponent={<VictoryLabel  dy={-30} textAnchor='inherit' />}/>
                      
                    </VictoryChart>
                </ScrollView>
              </HStack>
            </Center>
            <Text mt={1} textAlign='center' color='primary.500' >  <FontAwesomeIcon color="#06b6d4" icon={faDroplet} /> Humidity Graph</Text>
            <Center>
              <HStack >
                <ScrollView mx={5} horizontal={true}>
                    <VictoryChart  width={Dimensions.get('window').width-25} theme={VictoryTheme.material}>
                      <VictoryLine style={{
                        data: { stroke: '#06b6d4'}
                      }}
                      y='humidity'
                      animate={{
                        duration:5000,
                        easing: 'sinOut'
                      }} data={humData}  />
                      <VictoryAxis style={{axisLabel:{
                        fontSize: 15, fill:'#06b6d4'
                      }}} crossAxis label='Time' axisLabelComponent={<VictoryLabel dy={25}  textAnchor='inherit' />}/>
                      <VictoryAxis style={{axisLabel:{
                        fontSize: 15, fill:'#06b6d4'
                      }}} dependentAxis crossAxis  label='Humidity'   axisLabelComponent={<VictoryLabel  dy={-30} textAnchor='inherit' />}/>
                    </VictoryChart>
                </ScrollView>
              </HStack>
            </Center>
          </VStack>
        </ScrollView>
      </Center>
      <Center height='6%'>
        <VStack>
          <ScrollView horizontal={true}>
            <HStack p={1}  my={1} justifyContent='space-around' >
              <Button borderRadius={50} mx={3}  colorScheme="tertiary"  onPress={PlotTemperatureData}><Text color='white' >Get Temperature <FontAwesomeIcon  color="#ffffff" icon={faTemperatureThreeQuarters}/></Text></Button>
              <Button  borderRadius={50} mx={3}   colorScheme="primary" onPress={PlotHumidityData}><Text color='white'>Get Humidity <FontAwesomeIcon  color="#ffffff" icon={faDroplet}/></Text></Button>
              <Button  borderRadius={50} colorScheme='yellow' onPress={toggleAlarm} on ><Text color='white'>{alarmStatusMessage} Alarm <FontAwesomeIcon  color="#ffffff" icon={faBell}/></Text></Button>
              <Button  borderRadius={50} mx={3}   colorScheme="danger" onPress={deleteData}><Text color='white'> Clear Graph <FontAwesomeIcon  color="#ffffff" icon={faEraser}/></Text></Button>
            </HStack>
          </ScrollView>
        </VStack>
      </Center>
    </NativeBaseProvider>
  );
}