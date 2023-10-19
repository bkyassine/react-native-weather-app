import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme/index";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";

import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";

import * as Progress from "react-native-progress";

import { storeData, getData } from "../utils/asyncStorage";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);


  const handleLocation = (loc) => {
    // console.log("location: ", loc);
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({cityName: loc.name, days: "7"}).then(data=>{
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name)
      // console.log("got forecast: ",data);
    });
  };

  const handleSearch = (value) => {
    // Fetch locations
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };


  useEffect(()=>{
    fetchMyWeatherData();
  },[]);

  const fetchMyWeatherData = async()=>{
    let myCity = await getData('city');
    let cityName = "Casablanca";
    if(myCity) cityName=myCity;
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false)
    });
  };

  const handleTextDeboune = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  
  return (
    // Parent View
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={-300}
      behavior="height"
    >
      <View className="flex-1">
        {/* StatusBar color change to light so that it can be clear */}
        <StatusBar style="light" />
        {/* Background image of the mobile app */}
        <Image
          blurRadius={70}
          className="absolute w-full h-full"
          source={require("../assets/images/bg.png")}
        />

        {
          loading? (
            <View className="flex-1 flex-row justify-center items-center">
              <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2"  />
            </View>
          ): (
        <SafeAreaView className="flex flex-1">
          {/* A view that takes 7% of the parent view */}
          <View className="h-[7%] mx-4 relative z-50">
            {/* Subview that will contain TextInput and icon to search */}
            <View
              className="flex-row justify-end items-center rounded-full mt-4"
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : "transparent",
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDeboune}
                  className="flex-1 h-10 text-base pl-6 text-white"
                  placeholder="Search City"
                  placeholderTextColor={"lightgray"}
                />
              ) : null}

              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                className="p-3 m-1 rounded-full"
                style={{ backgroundColor: theme.bgWhite(0.3) }}
              >
                <MagnifyingGlassIcon size={25} color={"white"} />
              </TouchableOpacity>
            </View>

            {locations.length > 0 && showSearch ? (
              <View className="absolute w-full bg-gray-300 top-20 rounded-3xl">
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder
                    ? "border-b-2 border-b-gray-400"
                    : "";
                  return (
                    <TouchableOpacity
                      className={
                        "flex-row items-center border-0 p-3 px-4 mb-1 " +
                        borderClass
                      }
                      key={index}
                      onPress={() => handleLocation(loc)}
                    >
                      <MapPinIcon size="20" color={"white"} />
                      <Text className="text-black text-lg ml-2">
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* Forecast section */}
          <View className="mx-4 flex justify-around flex-1 mb-2">
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},{" "}
              <Text className="text-lg font-semibold text-gray-300">
                {location?.country}
              </Text>
            </Text>

            {/* weather image */}
            <View className="flex-row justify-center">
              <Image
                source={weatherImages[current?.condition?.text]}
                className="w-52 h-52"
              />
            </View>

            {/* Degre celcius */}
            <View className="space-y-2">
              <Text className="text-center font-bold text-white text-6xl ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center text-white text-xl tracking-widest">
                {current?.condition?.text}
              </Text>
            </View>

            {/* Other stats */}
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/wind.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">{current?.wind_kph} km</Text>
              </View>

              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/drop.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">{current?.humidity} %</Text>
              </View>

              <View className="flex-row space-x-2 items-center">
                <Image
                  source={require("../assets/icons/sun.png")}
                  className="h-6 w-6"
                />
                <Text className="text-white font-semibold text-base">{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
              </View>
            </View>
          </View>

          {/* Forecast for next days */}
          <View className="mb-2 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2">
              <CalendarDaysIcon size="22" color="white" />
              <Text className="text-white text-base">Daily forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {
                weather?.forecast?.forecastday?.map((item, index)=>{
                  let date = new Date(item.date);
                  let options = {weekday: 'long'};
                  let dayName = date.toLocaleDateString('en-US', options);
                  dayName = dayName.split(',')[0];
                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      style={{ backgroundColor: theme.bgWhite(0.15) }}
                    >
                      <Image
                        source={weatherImages[item?.day?.condition?.text]}
                        className="h-11 w-11"
                      />
                      <Text className="text-white">{dayName}</Text>
                      <Text className="text-white text-xl font-semibold">
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  )
                })
              }
              
             
            </ScrollView>
          </View>
        </SafeAreaView>
          )
        }

        
      </View>
    </KeyboardAvoidingView>
  );
}
