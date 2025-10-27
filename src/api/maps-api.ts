import axios from 'axios';
import useAuth from 'hooks/useAuth';
import { parseCookies } from 'nookies';
import axiosServices from 'utils/axios';
// import { useEffect, useMemo } from 'react';
// import useSWR, { mutate } from 'swr';
// import { fetcher } from 'utils/axios';

const token = localStorage.getItem('serviceToken');

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
});

export const endpoints = {
  key: '/api/v1',
  stations: '/stations'
};

export interface Station {
  status: string;
  id: string;
  sensorId: string;
  name: string;
  aqi: number;
  pm25: number;
  pm10: number;
  lat: number;
  lng: number;
  timeStamp?: string;
  sensorType: string;
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
  timeStamp: string | number | Date;
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

export type DistributionItem = {
  category: string;
  value: number;
};


export type User = {
  displayName?: string;
  reportStations?: string[];
  role?: string ;
  status?: string;
}


export const updateUserReportStations = async (id?: string, reportStations?: string[]) => {
  if (!id || !reportStations) return;
  if (!id) {
    console.error('User not found in context');
    throw new Error('User not found');
  }

  try {
    const response = await axiosServices.patch(`/users/${id}`, {
      reportStations
    });

    return response.data;
  } catch (error: any) {
    console.error('Failed to update user report stations:', error);
    throw error.response?.data || error;
  }
};



const classifyAqi = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};
export const getStations = async () => {
  const response = await axiosServices.get('/stations');
  const stations = response.data.data;

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
  sensorId: string,
  from: string,
  to: string
): Promise<{
  sensorId: string;
  from: string;
  to: string;
  distribution: DistributionItem[];
}> => {

  try {
    // 1️⃣ Fetch readings from backto
    const response = await axiosServices.get(`/stations/${sensorId}/readings?from=${from}&to=${to}`);
    const rawReadings: Reading[] = response.data.data;

    if (!Array.isArray(rawReadings) || rawReadings.length === 0) {
      return { sensorId, from, to, distribution: [] };
    }

    // 2️⃣ Initialize counts per category
    const counts: Record<string, number> = {
      Good: 0,
      Moderate: 0,
      'Unhealthy for Sensitive Groups': 0,
      Unhealthy: 0,
      'Very Unhealthy': 0,
      Hazardous: 0
    };

    // 3️⃣ Count occurrences by AQI category
    rawReadings.forEach((r) => {
      const category = classifyAqi(r.aqi);
      counts[category] += 1;
    });

    // 4️⃣ Convert counts to percentages
    const total = rawReadings.length;
    const distribution: DistributionItem[] = Object.entries(counts).map(([category, count]) => ({
      category,
      value: parseFloat(((count / total) * 100).toFixed(2))
    }));

    // 5️⃣ Return extended result
    return { sensorId, from, to, distribution };
  } catch (error) {
    console.error('Error fetching AQI distribution:', error);
    throw error;
  }
};
export const getAnalyticsTimeSeries = async (sensorId: string, start: string, end: string) => {
  const response = await axiosServices.get(`/stations/${sensorId}/readings?from=${start}&to=${end}&direction=asc&sort=timeStamp`);
  return response.data.data;
};
export const getOneStation = async (id: string) => {
  const response = await axiosServices.get(`/stations/${id}`);
  return response.data;
};

export const getStationsCron = async () => {
  const response = await axiosServices.get(`/sync/stations`);
  return response.data;
};

export const getFeedback = async () => {
  const response = await axiosServices.get(`/feedback`);
  return response.data.data;
};

// export const getAlerts = async (sensorId: string | undefined, start: string, end: string) => {
//   // const response = await axiosServices.get(`/alerts/log `);
//   if (!sensorId) return;

//   console.log('getAlerts function called');

//   const response = await axiosServices.get(`/stations/${sensorId}/readings?from=${start}&to=${end}&alertLevel=101`);

//   return response.data.data;
// };

export const getAlertsSummary = async (sensorId: string, start: string, end: string) => {
  try {
    const response = await axiosServices.get(`/stations/${sensorId}/readings?from=${start}&to=${end}&alertLevel=101`);
    const alerts = response.data.data;

    if (!Array.isArray(alerts)) {
      throw new Error('Invalid response format: expected an array');
    }

    // Define expected alert levels
    const levels = ['Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];

    // Count occurrences per alertLevel
    const breakdown = levels.map((level) => ({
      level,
      count: alerts.filter((a) => a.alertLevel === level).length
    }));

    // Compute total
    const total = alerts.length;
    return { total, breakdown };
  } catch (error: any) {
    console.error('Failed to fetch alerts summary:', error.message);
    return { total: 0, breakdown: [] };
  }
};

export const getUsers = async () => {
  const response = await axiosServices.get(`/users`);
  return response.data.data;
};

export const updateUserStatus = async (userId: number, status: string) => {
  try {
    const response = await axiosServices.patch(`/users/${userId}`, { status });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to update user status:', error);
    throw error;
  }
};

export const updateUser = async (id?: string, updatedUser?: User) => {
  if (!id || !updatedUser) return;
  try {
    const response = await axiosServices.patch(`/users/${id}`, {
      ...updatedUser
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to update user report stations:', error);
    throw error.response?.data || error;
  }
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

//user haina status
//nimefanya endpoints zote zianze na /api

//progress ya reports, > cron job ku tuma report kwa email
//  >  endpoint ya time?
//                     > format report ya kushow from the frontend
