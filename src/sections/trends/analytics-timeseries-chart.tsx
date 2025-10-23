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
  pm25: '#3b82f6',
  pm10: '#3b82f6'
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
  const [sensorId, setSensorId] = useState<string | undefined>(undefined);
  const [start, setStart] = useState(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 16));

  const [trendsStation, setTrendsStation] = useState<Station | null>(stations[0] || null);
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantType>(pollutant);

  // Threshold state
  const [thresholdPreset, setThresholdPreset] = useState<'WHO' | 'NEMA' | 'Custom'>('WHO');
  const [thresholds, setThresholds] = useState<Record<PollutantType, number | string>>({
    ...THRESHOLD_PRESETS['WHO']
  });

  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!start || !end) return;
      try {
        const stationId = sensorId ?? trendsStation?.id ?? '';
        const historyData = await getAnalyticsTimeSeries(stationId, start, end);
        setHistoricalData(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        console.error(err);
        setHistoricalData([]);
      }
    };
    fetchData();
  }, [sensorId, trendsStation, start, end, selectedPollutant]);

  useEffect(() => {
    if (stations.length > 0 && !trendsStation) {
      setTrendsStation(stations[0]);
      setSensorId(stations[0].sensorId);
    }
  }, [stations]);

  // Update thresholds when preset changes
  useEffect(() => {
    if (thresholdPreset !== 'Custom') {
      setThresholds(THRESHOLD_PRESETS[thresholdPreset]);
    }
  }, [thresholdPreset]);

  const isAQI = selectedPollutant === 'aqi';

  const currentPollutantOption = pollutantOptions.find((p) => p.value === selectedPollutant)!;
  const thresholdValue = thresholds[selectedPollutant];

  const labels = historicalData.map((item) =>
    new Date(item.timeStamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  const pollutantSeries = historicalData.map((item) => {
    if (selectedPollutant === 'aqi') return item.aqi;
    if (selectedPollutant === 'pm25') return parseFloat(item.pm25.toFixed(2));
    return parseFloat(item.pm10.toFixed(2));
  });

  const series = [
    {
      name: `${currentPollutantOption.label}${currentPollutantOption.unit ? ` (${currentPollutantOption.unit})` : ''}`,
      data: pollutantSeries
    },
    {
      name: `WHO (${thresholdValue})`,
      data: Array(pollutantSeries.length).fill(thresholdValue)
    }
  ];

  const options: ApexCharts.ApexOptions = {
    chart: { type: 'line', height: 400, toolbar: { show: false } },
    stroke: { curve: 'smooth', width: [3, 2], dashArray: [0, 5] },
    colors: [POLLUTANT_COLOR_MAP[selectedPollutant], '#888'],
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
          {/* Start / End Date */}
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

          {/* Station Selector */}
          <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={trendsStation?.id ?? ''}
              onChange={(e) => {
                const selected = stations.find((s) => s.id === e.target.value) || null;
                setTrendsStation(selected);
                setSensorId(selected?.sensorId);
              }}
              displayEmpty
            >
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

          {/* Custom Threshold Input */}
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
        {historicalData.length > 0 ?
          <ReactApexChart options={options} series={series} type="line" height={400} />
        :
        <EmptyTable msg = 'No data for this sensor in the seleced period'/>

        }
        
      </CardContent>
    </Card>
  );
}
  