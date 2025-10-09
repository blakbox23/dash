import { Fragment, MouseEvent, useEffect, useMemo, useState } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Stack,
  Divider,
  Tooltip,
  useMediaQuery,
  Chip
} from '@mui/material';

// third-party

import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  useReactTable,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  HeaderGroup,
  SortingState,
  GroupingState,
  Row,
  Table as TableProps,
  FilterFn,
  SortingFn,
  sortingFns
} from '@tanstack/react-table';

import { compareItems, rankItem, RankingInfo } from '@tanstack/match-sorter-utils';

// project import
// import makeData from 'data/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

import {
  CSVExport,
  DebouncedInput,
  EmptyTable,
  Filter,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  TablePagination,
  RowEditable,
  DraggableRow,
  DraggableColumnHeader,
  SelectColumnVisibility
} from 'components/third-party/react-table';

import { getImageUrl, ImagePath } from 'utils/getImageUrl';

// types
// import { LabelKeyObject } from 'react-csv/lib/core';
import IconButton from 'components/@extended/IconButton';
import {
  CloseOutlined,
  DownOutlined,
  EditTwoTone,
  GroupOutlined,
  RightOutlined,
  SendOutlined,
  StopOutlined,
  UngroupOutlined
} from '@ant-design/icons';

import { getStations } from 'api/maps-api';

export type TableDataProps = {
  aqi: unknown;
  id: number;
  sensorId: string;
  status: string;
  time: string[];
};

type LabelKeyObject = {
  label: string;
  key: string;
};

export const fuzzyFilter: FilterFn<TableDataProps> = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

export const fuzzySort: SortingFn<TableDataProps> = (rowA, rowB, columnId) => {
  let dir = 0;

  // only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(rowA.columnFiltersMeta[columnId]! as RankingInfo, rowB.columnFiltersMeta[columnId]! as RankingInfo);
  }

  // provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

// ==============================|| REACT TABLE - EDIT ACTION ||============================== //

const EditAction = ({ row, table }: { row: Row<TableDataProps>; table: TableProps<TableDataProps> }) => {
  const meta = table?.options?.meta;
  const setSelectedRow = (e: MouseEvent<HTMLButtonElement> | undefined) => {
    meta?.setSelectedRow((old: TableDataProps[]) => ({
      ...old,
      [row.id]: !old[row.id as any]
    }));

    // @ts-ignore
    meta?.revertData(row.index, e?.currentTarget.name === 'cancel');
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {meta?.selectedRow[row.id] && (
        <Tooltip title="Cancel">
          <IconButton color="error" name="cancel" onClick={setSelectedRow}>
            <CloseOutlined />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={meta?.selectedRow[row.id] ? 'Save' : 'Edit'}>
        <IconButton color={meta?.selectedRow[row.id] ? 'success' : 'primary'} onClick={setSelectedRow}>
          {meta?.selectedRow[row.id] ? <SendOutlined /> : <EditTwoTone />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

interface ReactTableProps {
  defaultColumns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
  setData: any;
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ defaultColumns, data, setData }: ReactTableProps) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);

  const [originalData, setOriginalData] = useState(() => [...data]);
  const [selectedRow, setSelectedRow] = useState({});

  const [columns] = useState(() => [...defaultColumns]);

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    columns.map((column) => column.id as string) // must start out with populated columnOrder so we can splice
  );

  // const reorderRow = (draggedRowIndex: number, targetRowIndex: number) => {
  //   data.splice(targetRowIndex, 0, data.splice(draggedRowIndex, 1)[0] as TableDataProps);
  //   setData([...data]);
  // };

  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      cell: RowEditable
    },
    state: {
      rowSelection,
      columnFilters,
      globalFilter,
      sorting,
      grouping,
      columnOrder,
      columnVisibility
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    getRowId: (row) => row.id.toString(), // good to have guaranteed unique row ids/keys for rendering
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
    meta: {
      selectedRow,
      setSelectedRow,
      revertData: (rowIndex: number, revert: unknown) => {
        if (revert) {
          setData((old: TableDataProps[]) => old.map((row, index) => (index === rowIndex ? originalData[rowIndex] : row)));
        } else {
          setOriginalData((old) => old.map((row, index) => (index === rowIndex ? data[rowIndex] : row)));
        }
      },
      updateData: (rowIndex, columnId, value) => {
        setData((old: TableDataProps[]) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value
              };
            }
            return row;
          })
        );
      }
    }
  });

  useEffect(() => setColumnVisibility({ id: false, role: false, contact: false, country: false, progress: false }), []);

  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  let headers: LabelKeyObject[] = [];
  table.getVisibleLeafColumns().map(
    (columns) =>
      // @ts-ignore
      columns.columnDef.accessorKey &&
      headers.push({
        label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
        // @ts-ignore
        key: columns.columnDef.accessorKey
      })
  );

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        sx={{ padding: 2, ...(matchDownSM && { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: '100%' } }) }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value: any) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <SelectColumnVisibility
            {...{
              getVisibleLeafColumns: table.getVisibleLeafColumns,
              getIsAllColumnsVisible: table.getIsAllColumnsVisible,
              getToggleAllColumnsVisibilityHandler: table.getToggleAllColumnsVisibilityHandler,
              getAllColumns: table.getAllColumns
            }}
          />
          <CSVExport
            {...{
              data:
                table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                  ? data
                  : table.getSelectedRowModel().flatRows.map((row) => row.original),
              headers,
              filename: 'umbrella.csv'
            }}
          />
        </Stack>
      </Stack>

      <ScrollX>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                <TableRow key={headerGroup.id}>
                  <TableCell />
                  {headerGroup.headers.map((header) => {
                    if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                      Object.assign(header.column.columnDef.meta, {
                        className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                      });
                    }

                    return (
                      // <DraggableColumnHeader key={header.id} header={header} table={table}>
                         <TableCell  colSpan={header.colSpan} {...header.column.columnDef.meta}>

                        <>
                          {header.isPlaceholder ? null : (
                            <Stack direction="row" spacing={1} alignItems="center">
                              {header.column.getCanGroup() && (
                                <IconButton
                                  color={header.column.getIsGrouped() ? 'error' : 'primary'}
                                  onClick={header.column.getToggleGroupingHandler()}
                                  size="small"
                                  sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
                                >
                                  {header.column.getIsGrouped() ? <UngroupOutlined /> : <GroupOutlined />}
                                </IconButton>
                              )}
                              <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                              {header.column.getCanSort() && <HeaderSort column={header.column} sort />}
                            </Stack>
                          )}
                        </>
                        </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                <TableRow key={headerGroup.id}>
                  <TableCell />
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} {...header.column.columnDef.meta}>
                      {header.column.getCanFilter() && <Filter column={header.column} table={table} />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    {/* <DraggableRow row={row}> */}
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
                    <>
                      {row.getVisibleCells().map((cell) => {
                        let bgcolor = 'background.paper';
                        if (cell.getIsGrouped()) bgcolor = 'primary.lighter';
                        if (cell.getIsAggregated()) bgcolor = 'warning.lighter';
                        if (cell.getIsPlaceholder()) bgcolor = 'error.lighter';

                        if (cell.column.columnDef.meta !== undefined && cell.column.getCanSort()) {
                          Object.assign(cell.column.columnDef.meta, {
                            style: { backgroundColor: bgcolor }
                          });
                        }

                        return (
                          <TableCell
                            key={cell.id}
                            {...cell.column.columnDef.meta}
                            sx={{ bgcolor }}
                            {...(cell.getIsGrouped() &&
                              cell.column.columnDef.meta === undefined && {
                                style: { backgroundColor: bgcolor }
                              })}
                          >
                            {cell.getIsGrouped() ? (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <IconButton
                                  color="secondary"
                                  onClick={row.getToggleExpandedHandler()}
                                  size="small"
                                  sx={{ p: 0, width: 24, height: 24 }}
                                >
                                  {row.getIsExpanded() ? <DownOutlined /> : <RightOutlined />}
                                </IconButton>
                                <Box>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Box> <Box>({row.subRows.length})</Box>
                              </Stack>
                            ) : cell.getIsAggregated() ? (
                              flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                            ) : cell.getIsPlaceholder() ? null : (
                              flexRender(cell.column.columnDef.cell, cell.getContext())
                            )}
                          </TableCell>
                        );
                      })}
                    </>
                    {/* </DraggableRow> */}
                    </TableRow>
                    {row.getIsExpanded() && !row.getIsGrouped() && (
                      <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}>
                        <TableCell colSpan={row.getVisibleCells().length + 2}>
                          <div> {row.original.id} </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length}>
                    <EmptyTable msg="No Data" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  <TableCell />
                  {footerGroup.headers.map((footer) => (
                    <TableCell key={footer.id} {...footer.column.columnDef.meta}>
                      {footer.isPlaceholder ? null : flexRender(footer.column.columnDef.header, footer.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          </Table>
        </TableContainer>
        <Divider />
        <Box sx={{ p: 2 }}>
          <TablePagination
            {...{
              setPageSize: table.setPageSize,
              setPageIndex: table.setPageIndex,
              getState: table.getState,
              getPageCount: table.getPageCount
            }}
          />
        </Box>
      </ScrollX>
    </MainCard>
  );
}

// ==============================|| CURRENT READINGS TABLE ||============================== //

const CurrentReadingTable = () => {
  const theme = useTheme();

  const [data, setData] = useState<TableDataProps[]>(() => []);

    useEffect(() => {
      const fetchStations = async () => {
        try {
          const stationsData = await getStations();
          setData(stationsData);
        } catch (err: any) {
          console.log(err.message || 'Failed to load stations');
        }
      };
  
      // Initial fetch
      fetchStations();
    }, []);

    function getPollutantLevel(value: number) {
      if (value <= 50) return 'Good';
      if (value <= 100) return 'Moderate';
      if (value <= 150) return 'Unhealthy for Sensitive Groups';
      if (value <= 200) return 'Unhealthy';
      if (value <= 300) return 'Very Unhealthy';
      return 'Hazardous';
    }

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        id: 'id',
        title: 'Id',
        header: '#',
        accessorKey: 'id',
        dataType: 'text',
        enableColumnFilter: false,
        enableGrouping: false,
        meta: {
          className: 'cell-center'
        }
      },
      {
        id: 'name',
        header: 'Name',
        footer: 'Name',
        accessorKey: 'name',
        dataType: 'text',
        enableGrouping: false,
        enableColumnFilter: false,
      },
      // {
      //   id: 'sensorId',
      //   header: 'Sensor ID',
      //   footer: 'Sensor ID',
      //   accessorKey: 'sensorId',
      //   dataType: 'text',
      //   enableColumnFilter: false,
      //   enableGrouping: false,
      //   meta: {
      //     className: 'cell-center'
      //   }
      // },
      {
        id: 'aqi',
        header: 'AQI',
        footer: 'AQI',
        accessorKey: 'aqi',
        dataType: 'text',
        meta: {
          className: 'cell-center'
        }
      },
      // {
      //   id: 'role',
      //   header: 'Role',
      //   footer: 'Role',
      //   accessorKey: 'role',
      //   dataType: 'text',
      //   enableGrouping: false,
      //   filterFn: fuzzyFilter,
      //   sortingFn: fuzzySort
      // },
      {
        id: 'pm25',
        header: 'PM 2.5',
        footer: 'PM 2.5',
        accessorKey: 'pm25',
        dataType: 'text',
        meta: {
          className: 'cell-center'
        }        
      },
      {
        id: 'pm10',
        header: 'PM 10',
        footer: 'PM 10',
        accessorKey: 'pm10',
        dataType: 'text',
        meta: {
          className: 'cell-center'
        }
      },
      {
        id: 'pollutionLevel',
        header: 'Pollution Level',
        accessorFn: (row) => row.aqi,
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const value = getValue() as number;
          const level = getPollutantLevel(value);
      
          return (
            <Chip
              label={level}
              color={
                level === 'Good'
                  ? 'success'
                  : level === 'Moderate'
                  ? 'info'
                  : level === 'Unhealthy for Sensitive Groups'
                  ? 'warning'
                  : level === 'Unhealthy'
                  ? 'error'
                  : 'default'
              }
              size="small"
              sx={{ borderRadius: '16px' }}
            />
          );
        }
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const status = getValue() as string;
          let color: 'default' | 'success' | 'error' | 'warning' | 'info' = 'default';
          if (status === 'ONLINE') color = 'success';
          if (status === 'OFFLINE') color = 'error';
      
          return (
            <Chip 
              label={status.toLocaleLowerCase()} 
              color={color} 
              size="small" 
              variant="outlined" 
              sx={{ borderRadius: '16px' }} 
            />
          );
        }
      },

      {
        id: 'time',
        header: 'Time',
        footer: 'Time',
        enableColumnFilter: false,
        accessorKey: 'time',
        dataType: 'text',
        meta: {
          className: 'cell-right'
        },
        cell: ({ getValue }) => {
          const raw = getValue() as string;
          const date = new Date(raw);
      
          // Format date + time, e.g. "Oct 08, 2025, 05:00 AM"
          return date.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }
      }
      // {
      //   id: 'edit',
      //   header: 'Actions',
      //   cell: EditAction,
      //   enableGrouping: false,
      //   meta: {
      //     className: 'cell-center'
      //   }
      // }
    ],
    // eslint-disable-next-line
    []
  );

  return (
    <>
      <ReactTable {...{ data, defaultColumns: columns, setData }} />
    </>
  );
};

export default CurrentReadingTable;
