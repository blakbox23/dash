import { FC, ReactElement } from 'react';

// material-ui
import { Box, TableCell } from '@mui/material';

// third-party
import { useDrag, useDrop } from 'react-dnd';
import { Column, ColumnOrderState, Header, Table } from '@tanstack/react-table';
import { SensorTableDataProps } from 'sections/data-tables/SensorsTable';

// types
// import { SensorTableDataProps } from 'types/table';

const reorderColumn = (draggedColumnId: string, targetColumnId: string, columnOrder: string[]): ColumnOrderState => {
  columnOrder.splice(columnOrder.indexOf(targetColumnId), 0, columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string);
  return [...columnOrder];
};

// ==============================|| DRAGGABLE COLUMN ||============================== //

const DraggableColumnHeader: FC<{ header: Header<SensorTableDataProps, unknown>; table: Table<SensorTableDataProps>; children: ReactElement }> = ({
  header,
  table,
  children
}) => {
  // const { getState, setColumnOrder } = table;
  // const { columnOrder } = getState();
  const { column } = header;


  return (
    <TableCell  colSpan={header.colSpan} {...header.column.columnDef.meta}>
      <Box component="span">
        <Box sx={{ color: 'text.primary'}}>
          {children}
        </Box>
      </Box>
    </TableCell>
  );
};

export default DraggableColumnHeader;
