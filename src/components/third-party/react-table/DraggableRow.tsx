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
import { TableDataProps } from 'sections/data-tables/CurrentReadingsTabletable';

// types

// ==============================|| DRAGGABLE ROW ||============================== //

const DraggableRow: FC<{
  row: Row<TableDataProps>;
  // reorderRow: (draggedRowIndex: number, targetRowIndex: number) => void;
  children: ReactElement;
}> = ({ row, children }) => {
  // const [{ isOverCurrent }, dropRef] = useDrop({
  //   accept: 'row',
  //   drop: (draggedRow: Row<TableDataProps>) => reorderRow(draggedRow.index, row.index),
  //   collect: (monitor) => ({ isOver: monitor.isOver(), isOverCurrent: monitor.isOver({ shallow: true }) })
  // });

  // const [{ isDragging }, dragRef, previewRef] = useDrag({
  //   collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  //   item: () => row,
  //   type: 'row'
  // });
  return (
    <TableRow
      // ref={previewRef} //previewRef could go here
      // sx={{ bgcolor:'inherit' }}
    >
      <TableCell>
        <IconButton
          size="small"
          sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
          color="secondary"
          disabled={row.getIsGrouped()}
        >
          {/* <DragOutlined /> */}
          {row.index + 1}
        </IconButton>
      </TableCell>
      {children}
    </TableRow>
  );
};

export default DraggableRow;
