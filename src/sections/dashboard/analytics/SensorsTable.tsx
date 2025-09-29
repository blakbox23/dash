import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { Station } from 'api/maps-api';

interface SensorTables1Props {
  stations: Station[];
}

const SensorTables1: React.FC<SensorTables1Props> = ({ stations }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><Typography variant="subtitle2">ID</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Sensor ID</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Name</Typography></TableCell>
            <TableCell align="right"><Typography variant="subtitle2">AQI</Typography></TableCell>
            <TableCell align="right"><Typography variant="subtitle2">PM2.5 (µg/m³)</Typography></TableCell>
            <TableCell align="right"><Typography variant="subtitle2">PM10 (µg/m³)</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Type</Typography></TableCell>
            <TableCell align="right"><Typography variant="subtitle2">Latitude</Typography></TableCell>
            <TableCell align="right"><Typography variant="subtitle2">Longitude</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stations.map((station) => (
            <TableRow key={station.id}>
              <TableCell>{station.id}</TableCell>
              <TableCell>{station.sensorId}</TableCell>
              <TableCell>{station.name}</TableCell>
              <TableCell align="right">{station.aqi.toFixed(1)}</TableCell>
              <TableCell align="right">{station.pm25.toFixed(2)}</TableCell>
              <TableCell align="right">{station.pm10.toFixed(2)}</TableCell>
              <TableCell>{station.sensorType}</TableCell>
              <TableCell align="right">{station.lat.toFixed(5)}</TableCell>
              <TableCell align="right">{station.lng.toFixed(5)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SensorTables1;
