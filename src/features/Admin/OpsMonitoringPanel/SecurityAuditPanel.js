import { BlockRounded, BugReportRounded, DoneAllRounded, PolicyRounded, RadarRounded, TerminalRounded } from '@mui/icons-material';
import { Alert, Box, Button, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './SecurityAudit.module.scss';
import { toast } from 'react-toastify';
import DataTablePagination from '~/components/common/DataTablePagination';

const cx = classNames.bind(styles);

export default function SecurityAuditPanel() {
  const [logs, setLogs] = useState([]);
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState({
    totalItems: 0,
    totalItemsPerPage: 10,
    currentPage: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadLogs();
  }, [page.currentPage, page.totalItemsPerPage]);

  const loadLogs = async () => {
    try {
      const response = await adminService.getSecurityAuditLogs({
        page: page.currentPage + 1,
        size: page.totalItemsPerPage,
      });
      const data = response?.result || [];
      const newPage = response?.page || {};
      setPage((prev) => ({ ...prev, totalItems: newPage.totalItems, totalPages: newPage.totalPages }));
      setLogs(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải logs bảo mật.');
    }
  };

  const markDone = async (id) => {
    try {
      await adminService.createSecurityAuditLog({ eventId: id, status: 'acknowledged' });
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setNotice(`Sự kiện ${id} đã được xác nhận và đưa vào kho lưu trữ.`);
      setTimeout(() => setNotice(''), 3000);
    } catch {
      setNotice('Không thể xác nhận log bảo mật.');
    }
  };

  return (
    <div className={cx('auditWrapper')}>
      <Box className={cx('header')}>
        <Box>
          <Typography className={cx('mainTitle')}>Giám sát An ninh (Audit Logs)</Typography>
          <Typography className={cx('subTitle')}>Theo dõi các cuộc tấn công tiềm ẩn, hành vi khai thác API và dấu hiệu Bot.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<TerminalRounded />} className={cx('secondaryBtn')}>
            Báo cáo chi tiết
          </Button>
          <Button variant="contained" color="error" startIcon={<BlockRounded />} className={cx('primaryBtn')}>
            Blacklist IP
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="info" variant="filled" className={cx('alert')} icon={<DoneAllRounded />}>
          {notice}
        </Alert>
      )}

      <Paper className={cx('mainPaper')} elevation={0}>
        <Box className={cx('paperHeader')}>
          <RadarRounded className={cx('radarIcon')} />
          <Typography fontWeight={800}>Nhật ký sự kiện thời gian thực</Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={cx('headCell')}>ID & IP</TableCell>
                <TableCell className={cx('headCell')}>Loại sự kiện</TableCell>
                <TableCell className={cx('headCell')}>Endpoint / Nguồn</TableCell>
                <TableCell className={cx('headCell')}>Mức độ</TableCell>
                <TableCell align="right" className={cx('headCell')}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id} className={cx('tableRow')}>
                  <TableCell>
                    <Typography className={cx('logId')}>{l.id}</Typography>
                    <Typography variant="caption" className={cx('logIp')}>
                      {l.ip || l.ipAddress || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box className={cx('eventBox')}>
                      <BugReportRounded fontSize="small" />
                      <Typography fontWeight={700}>{l.event || l.action || '-'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <code className={cx('sourceCode')}>{l.source || l.endpoint || '-'}</code>
                  </TableCell>
                  <TableCell>
                    <Chip label={l.level || 'warning'} className={cx('levelChip', l.level || 'warning')} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Chặn IP này">
                        <IconButton color="error" className={cx('actionBtn')}>
                          <BlockRounded />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Đánh dấu đã xử lý">
                        <IconButton color="success" onClick={() => markDone(l.id)} className={cx('actionBtn')}>
                          <DoneAllRounded />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <DataTablePagination page={page} setPage={setPage} />
      </Paper>

      <Box mt={3} p={2} className={cx('footerInfo')}>
        <PolicyRounded fontSize="small" />
        <Typography variant="caption">
          Hệ thống đang sử dụng bộ lọc tự động <b>WAF v2.1</b>. Các log trên 30 ngày sẽ được tự động lưu trữ.
        </Typography>
      </Box>
    </div>
  );
}
