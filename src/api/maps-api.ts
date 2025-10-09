import axios from 'axios';
import { useEffect, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from 'utils/axios';

const api = axios.create({
  baseURL: '/api/v1/',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const endpoints = {
  key: '/api/v1/',
  stations: '/stations'
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

type Reading = {
  id: string;
  sensorId: string;
  aqi: number;
  pm25: number;
  pm10: number;
};

type DistributionItem = {
  category: string;
  value: number;
};

export const dummyStations: Station[] = [
  {
    id: '1',
    sensorId: 'airqo_g5380',
    name: 'Nairobi CBD',
    aqi: 85,
    pm25: 23.4,
    pm10: 42.1,
    lat: -1.28333,
    lng: 36.81667,
    sensorType: 'BAM-1020'
  },
  {
    id: '2',
    sensorId: 'airqo_g5381',
    name: 'Westlands',
    aqi: 112,
    pm25: 37.2,
    pm10: 54.8,
    lat: -1.26495,
    lng: 36.80336,
    sensorType: 'MOD-PM'
  },
  {
    id: '3',
    sensorId: 'airqo_g5382',
    name: 'Industrial Area',
    aqi: 156,
    pm25: 65.1,
    pm10: 88.6,
    lat: -1.31255,
    lng: 36.84518,
    sensorType: 'BAM-1020'
  },
  {
    id: '4',
    sensorId: 'airqo_g5383',
    name: 'Kibera',
    aqi: 98,
    pm25: 28.9,
    pm10: 47.3,
    lat: -1.31361,
    lng: 36.78222,
    sensorType: 'MOD-PM'
  },
  {
    id: '5',
    sensorId: 'airqo_g5384',
    name: 'Gigiri',
    aqi: 62,
    pm25: 15.7,
    pm10: 32.4,
    lat: -1.22952,
    lng: 36.81854,
    sensorType: 'BAM-1020'
  },
  {
    id: '6',
    sensorId: 'airqo_g5385',
    name: 'Eastleigh',
    aqi: 134,
    pm25: 48.6,
    pm10: 72.9,
    lat: -1.28326,
    lng: 36.84616,
    sensorType: 'MOD-PM'
  }
];

const classifyAqi = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const getStations = async () => {
  const response = await api.get('/stations');
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


export const getAqiDistribution = async (
  stationId: string,
  start: string,
  end: string
): Promise<{ stationId: string; start: string; end: string; distribution: DistributionItem[] }> => {
  // simulate API returning raw readings
  await new Promise((r) => setTimeout(r, 150));

  // helper to generate a random number in a range
  const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // generate randomized readings
  const rawReadings: Reading[] = Array.from({ length: 7 }, (_, i) => ({
    id: (i + 1).toString(),
    sensorId: stationId,
    aqi: rand(10, 400),   // AQI between 10 and 400
    pm25: rand(5, 250),   // PM2.5 between 5 and 250
    pm10: rand(10, 300),  // PM10 between 10 and 300
  }));

  // tally counts per category
  const counts: Record<string, number> = {
    Good: 0,
    Moderate: 0,
    'Unhealthy for Sensitive Groups': 0,
    Unhealthy: 0,
    'Very Unhealthy': 0,
    Hazardous: 0,
  };

  rawReadings.forEach((r) => {
    const category = classifyAqi(r.aqi);
    counts[category] += 1;
  });

  // convert to distribution format
  const distribution: DistributionItem[] = Object.entries(counts).map(
    ([category, count]) => ({
      category,
      value: count,
    })
  );

  console.log("getAqiDistribution called");

  return { stationId, start, end, distribution };
};


export const getOneStation = async (id: string) => {
  const response = await api.get(`/sensors/${id}`);
  return response.data;
};

export const getHistoricalData = async (sensorId = '1', period = 24) => {
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
