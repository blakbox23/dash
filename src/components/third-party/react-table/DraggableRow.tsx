import { FC, ReactElement, useState } from 'react';

// material-ui
import { TableCell, TableRow } from '@mui/material';

// third-party
import { useDrag, useDrop } from 'react-dnd';
import { Row } from '@tanstack/react-table';

// project-import
import IconButton from 'components/@extended/IconButton';

// assets
import { DragOutlined } from '@ant-design/icons';
import { SensorTableDataProps } from 'sections/data-tables/SensorsTable';

// types

// ==============================|| DRAGGABLE ROW ||============================== //

const DraggableRow: FC<{
  row: Row<SensorTableDataProps>;
  // reorderRow: (draggedRowIndex: number, targetRowIndex: number) => void;
  children: ReactElement;
}> = ({ row, children }) => {

  return (
    <TableRow>
      <TableCell>
        <IconButton
          size="small"
          sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
          color="secondary"
          disabled={row.getIsGrouped()}
        >
          {row.index + 1}
        </IconButton>
      </TableCell>
      {children}
    </TableRow>
  );
};

export default DraggableRow;
