import axios from "axios";
import { useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "utils/axios";

const api = axios.create({
baseURL: "/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const endpoints = {
  key: "/api/v1/",
  stations: "/stations",
};

export interface Station {
    id: string;
    sensorId: string;
    name: string;
    aqi: number;
    pm25: number;
    pm10: number;
    lat: number;
    lng: number;
    sensorType?: string;
    time?: string; 
    
  }

  export interface Sensor {
    id: number;
    sensor_id: string;
    location: string;
    description: string;
    lat: number;
    lng: number;
    sensorType: string;
    
  }
  

  export interface HistoricalData {
    pm25: number;
    aqi: number;
    timestamp: string | number | Date;
    pm10: number;
    date: string;
    avg_aqi: number;
    avg_pm25: number;
    avg_pm10: number;
  }

  
  export const getStations = async () => {
    const response = await api.get("/stations");
    const stations = response.data;
  
    // Ensure it's an array before mapping
    return Array.isArray(stations)
      ? stations.map((station: any) => ({
          ...station,
          pm10: station.pm10 ? Number(station.pm10.toFixed(2)) : null,
          pm25: station.pm25 ? Number(station.pm25.toFixed(2)) : null
        }))
      : stations;
  };
  

  export const getOneStation = async (id: string) => {
    const response = await api.get(`/sensors/${id}`);
    return response.data;
  };

  export const getHistoricalData = async (sensorId= '1', period=24) => {
    const response = await api.get(`/sensors/${sensorId}/readings/?range=${period}`);
    return response.data;
  };
  


  // export function useGetStations(page: number = 0, size: number = 10) {
  //   const fetchWithParams = (key: string) => fetcher([key, { params: { page, size } }]);
  
  //   const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.stations, fetchWithParams, {
  //     revalidateIfStale: true,
  //     revalidateOnFocus: false,
  //     revalidateOnReconnect: false,
  //   });
  
  //   useEffect(() => {
  //     mutate(endpoints.key + endpoints.stations);
  //   }, [page, size]);
  
  //   const memoizedValue = useMemo(
  //     () => ({
  //       stations: data?.content,
  //       totalElements: data?.totalElements,
  //       // demosLoading: isLoading,
  //       // demosError: error,
  //       // demosValidating: isValidating,
  //       // demosEmpty: !isLoading && !data?.content?.length,
  //     }),
  //     [data, error, isLoading, isValidating],
  //   );
  //   return memoizedValue;
  // }