import { Box, Pagination, TablePagination } from '@mui/material';
import classNames from 'classnames/bind';

import styles from './DataTablePagination.module.scss';

const cx = classNames.bind(styles);

export default function DataTablePagination({ page, setPage, rowsPerPageLabel = 'Số dòng:' }) {
  const currentPage = page?.currentPage ?? 0;
  const totalItemsPerPage = page?.totalItemsPerPage ?? 10;

  return (
    <Box className={cx('paginationContainer')} display="flex" justifyContent="space-between" alignItems="center">
      <TablePagination
        component="div"
        count={page?.totalItems ?? 0}
        page={currentPage}
        rowsPerPage={totalItemsPerPage}
        onPageChange={(e, newPage) => setPage((prev) => ({ ...prev, currentPage: newPage }))}
        onRowsPerPageChange={(e) => {
          const newLimit = parseInt(e.target.value, 10);
          setPage((prev) => ({
            ...prev,
            totalItemsPerPage: newLimit,
            currentPage: 0,
          }));
        }}
        labelRowsPerPage={rowsPerPageLabel}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`}
        className={cx('tablePagination')}
        slotProps={{
          actions: {
            previousButton: { style: { display: 'none' } },
            nextButton: { style: { display: 'none' } },
          },
        }}
      />

      <Pagination
        count={page?.totalPages ?? 0}
        page={currentPage + 1}
        onChange={(e, value) => {
          setPage((prev) => ({
            ...prev,
            currentPage: value - 1,
          }));
        }}
        color="primary"
        showFirstButton
        showLastButton
        className={cx('numberedPagination')}
        size="medium"
      />
    </Box>
  );
}
