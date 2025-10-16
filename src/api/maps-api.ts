import axios from 'axios';
import useAuth from 'hooks/useAuth';
// import { useEffect, useMemo } from 'react';
// import useSWR, { mutate } from 'swr';
// import { fetcher } from 'utils/axios';

const token = localStorage.getItem("serviceToken");

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


export const updateUserReportStations = async (id: string, reportStations: string[]) => {

  console.log(`user at api ${id}`)
  if (!id) {
    console.error("User not found in context");
    throw new Error("User not found");
  }

  try {
    const response = await api.patch(`/users/${id}`, {
      reportStations,
    });

    return response.data;
  } catch (error: any) {
    console.error("Failed to update user report stations:", error);
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
  const response = await api.get('/stations');
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
    const response = await api.get(`/stations/${sensorId}/readings/?from=${from}&to=${to}`);
    const rawReadings: Reading[] = response.data.data;


    if (!Array.isArray(rawReadings) || rawReadings.length === 0) {
      return { sensorId, from, to, distribution: [] };
    }

    // 2️⃣ Initialize counts per category
    const counts: Record<string, number> = {
      Good: 0,
      Moderate: 0,
      "Unhealthy for Sensitive Groups": 0,
      Unhealthy: 0,
      "Very Unhealthy": 0,
      Hazardous: 0,
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
      value: parseFloat(((count / total) * 100).toFixed(2)),
    }));

    // 5️⃣ Return extended result
    return { sensorId, from, to, distribution };
  } catch (error) {
    console.error("Error fetching AQI distribution:", error);
    throw error;
  }
};
export const getAnalyticsTimeSeries = async (
  sensorId: string,
  start: string,
  end: string,
) => {
  console.log(sensorId);

  const response = await api.get(`/stations/${sensorId}/readings/?from=${start}&to=${end}`);
  console.log('historicalDAta for timeseries')
  console.log(response.data.data)
  return response.data.data;
};
export const getOneStation = async (id: string) => {
  const response = await api.get(`/stations/${id}`);
  return response.data;
};
export const getHistoricalData = async (sensorId: number, from: string, to: string) => {
  const response = await api.get(`/stations/${sensorId}/readings/?from=${from}&to={to}`);
  return response.data;
};
export const getStationsCron = async () => {
  const response = await api.get(`/sync/stations`);
  console.log('get stations cron api function called')
  return response.data;
};

export const getFeedback = async () => {
  const response = await api.get(`/feedback`);
  return response.data.data;
};

export const getAlerts = async () => {
  const response = await api.get(`/alerts`);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get(`/users`);
  return response.data.data;
};

export const updateUserStatus = async (userId: number, status: string) => {
  console.log(userId, status)
  try {
    const response = await api.patch(`/users/${userId}`, { status });
    return response.data.data; // assuming your API returns { data: { ...updatedUser } }
  } catch (error: any) {
    console.error('Failed to update user status:', error);
    throw error;
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
