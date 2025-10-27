import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import {
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Box,
  TextField,
  InputLabel
} from '@mui/material';
import { CheckOutlined } from '@ant-design/icons';
import { getAnalyticsTimeSeries, Station } from 'api/maps-api';
import { EmptyTable } from 'components/third-party/react-table';

type PollutantType = 'aqi' | 'pm25' | 'pm10';

interface PollutantOption {
  value: PollutantType;
  label: string;
  unit: string;
}

interface TrendsChartProps {
  stations: Station[];
  pollutant: PollutantType;
  pollutantLabel: string;
  pollutantUnit: string;
}

const POLLUTANT_COLOR_MAP: Record<PollutantType, string> = {
  aqi: '#3b82f6',
  pm25: '#10b981',
  pm10: '#f59e0b'
};

// WHO and NEMA threshold presets
const THRESHOLD_PRESETS: Record<'WHO' | 'NEMA', Record<PollutantType, number | string>> = {
  WHO: { aqi: '', pm25: 15, pm10: 45 },
  NEMA: { aqi: 100, pm25: 35, pm10: 70 }
};

const pollutantOptions: PollutantOption[] = [
  { value: 'aqi', label: 'AQI', unit: '' },
  { value: 'pm25', label: 'PM 2.5', unit: 'μg/m³' },
  { value: 'pm10', label: 'PM 10', unit: 'μg/m³' }
];

export default function AnalyticsTimeSeries({ stations, pollutant }: TrendsChartProps) {
  const [sensorId1, setSensorId1] = useState<string | undefined>(undefined);
  const [sensorId2, setSensorId2] = useState<string | undefined>(undefined);

  const [start, setStart] = useState(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 16));

  const [station1, setStation1] = useState<Station | null>(stations[0] || null);
  const [station2, setStation2] = useState<Station | null>(null);

  const [selectedPollutant, setSelectedPollutant] = useState<PollutantType>(pollutant);

  // Threshold state
  const [thresholdPreset, setThresholdPreset] = useState<'WHO' | 'NEMA' | 'Custom'>('WHO');
  const [thresholds, setThresholds] = useState<Record<PollutantType, number | string>>({
    ...THRESHOLD_PRESETS['WHO']
  });

  const [data1, setData1] = useState<any[]>([]);
  const [data2, setData2] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!start || !end) return;

      try {
        const id1 = sensorId1 ?? station1?.sensorId ?? '';
        const id2 = sensorId2 ?? station2?.sensorId ?? '';

        const [res1, res2] = await Promise.all([
          id1 ? getAnalyticsTimeSeries(id1, start, end) : Promise.resolve([]),
          id2 ? getAnalyticsTimeSeries(id2, start, end) : Promise.resolve([])
        ]);

        setData1(Array.isArray(res1) ? res1 : []);
        setData2(Array.isArray(res2) ? res2 : []);
      } catch (err) {
        console.error(err);
        setData1([]);
        setData2([]);
      }
    };
    fetchData();
  }, [sensorId1, sensorId2, station1, station2, start, end, selectedPollutant]);

  useEffect(() => {
    if (stations.length > 0 && !station1) {
      setStation1(stations[0]);
      setSensorId1(stations[0].sensorId);
    }
  }, [stations]);

  // Update thresholds when preset changes
  useEffect(() => {
    if (thresholdPreset !== 'Custom') {
      setThresholds(THRESHOLD_PRESETS[thresholdPreset]);
    }
  }, [thresholdPreset]);

  const currentPollutantOption = pollutantOptions.find((p) => p.value === selectedPollutant)!;
  const thresholdValue = thresholds[selectedPollutant];

  // Extract labels and data
  const labels = data1.map((item) =>
    new Date(item.timeStamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  const series = [
    {
      name: station1 ? station1.name : 'Station 1',
      data: data1.map((item) =>
        selectedPollutant === 'aqi'
          ? item.aqi
          : selectedPollutant === 'pm25'
          ? parseFloat(item.pm25.toFixed(2))
          : parseFloat(item.pm10.toFixed(2))
      )
    },
    ...(station2
      ? [
          {
            name: station2.name,
            data: data2.map((item) =>
              selectedPollutant === 'aqi'
                ? item.aqi
                : selectedPollutant === 'pm25'
                ? parseFloat(item.pm25.toFixed(2))
                : parseFloat(item.pm10.toFixed(2))
            )
          }
        ]
      : []),
    ...(selectedPollutant !== 'aqi'
      ? [
          {
            name: `WHO (${thresholdValue}μg/m³)`,
            data: Array(data1.length).fill(thresholdValue)
          }
        ]
      : [])
  ];

  const options: ApexCharts.ApexOptions = {
    chart: { type: 'line', height: 400, toolbar: { show: false } },
    stroke: { curve: 'smooth', width: [3, 3, 2], dashArray: [0, 0, 5] },
    colors: ['#3b82f6', '#ef4444', '#888'],
    xaxis: { categories: labels, title: { text: 'Time' } },
    yaxis: {
      title: {
        text: `${currentPollutantOption.label}${currentPollutantOption.unit ? ` (${currentPollutantOption.unit})` : ''}`
      },
      min: 0
    },
    legend: { position: 'top', horizontalAlign: 'right' }
  };

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          {/* Date Range */}
          <TextField label="Start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="End" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} InputLabelProps={{ shrink: true }} />

          {/* Pollutant Selector */}
          <FormControl sx={{ minWidth: 140 }}>
            <Select value={selectedPollutant} onChange={(e) => setSelectedPollutant(e.target.value as PollutantType)}>
              {pollutantOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                  {selectedPollutant === opt.value && <CheckOutlined />}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Station 1 Selector */}
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Station 1</InputLabel>
            <Select
              value={station1?.id ?? ''}
              label="Station 1"
              onChange={(e) => {
                const selected = stations.find((s) => s.id === e.target.value) || null;
                setStation1(selected);
                setSensorId1(selected?.sensorId);
              }}
            >
              {stations.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Station 2 Selector */}
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Compare With</InputLabel>
            <Select
              value={station2?.id ?? ''}
              label="Compare With"
              onChange={(e) => {
                const selected = stations.find((s) => s.id === e.target.value) || null;
                setStation2(selected);
                setSensorId2(selected?.sensorId);
              }}
              displayEmpty
            >
              <MenuItem value="">
              </MenuItem>
              {stations.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Threshold Preset Selector */}
          {/* <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Preset</InputLabel>
            <Select
              value={thresholdPreset}
              label="Preset"
              onChange={(e) => setThresholdPreset(e.target.value as 'WHO' | 'NEMA' | 'Custom')}
            >
              <MenuItem value="WHO">WHO</MenuItem>
              <MenuItem value="NEMA">NEMA</MenuItem>
              <MenuItem value="Custom">Custom</MenuItem>
            </Select>
          </FormControl> */}

          {/* Custom Threshold */}
          {/* {thresholdPreset === 'Custom' && (
            <TextField
              label="Threshold"
              type="number"
              value={thresholdValue}
              onChange={(e) =>
                setThresholds((prev) => ({
                  ...prev,
                  [selectedPollutant]: parseFloat(e.target.value) || 0
                }))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ width: 120 }}
            />
          )} */}
        </Box>

        {/* Chart */}
        {data1.length > 0 ? (
          <ReactApexChart options={options} series={series} type="line" height={400} />
        ) : (
          <EmptyTable msg="No data for the selected station(s) and period" />
        )}
      </CardContent>
    </Card>
  );
}
