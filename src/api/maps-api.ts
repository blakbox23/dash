import axios from "axios";
import { useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "utils/axios";

const api = axios.create({
baseURL: "http://40.81.230.185/api/v1",
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
  }

  
export const getStations = async () => {
    const response = await api.get("/stations");
    return response.data;
  };


  export function useGetStations(page: number = 0, size: number = 10) {
    const fetchWithParams = (key: string) => fetcher([key, { params: { page, size } }]);
  
    const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.stations, fetchWithParams, {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });
  
    useEffect(() => {
      mutate(endpoints.key + endpoints.stations);
    }, [page, size]);
  
    const memoizedValue = useMemo(
      () => ({
        stations: data?.content,
        totalElements: data?.totalElements,
        // demosLoading: isLoading,
        // demosError: error,
        // demosValidating: isValidating,
        // demosEmpty: !isLoading && !data?.content?.length,
      }),
      [data, error, isLoading, isValidating],
    );
    return memoizedValue;
  }