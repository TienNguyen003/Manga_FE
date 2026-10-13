import { BlockRounded, BugReportRounded, DoneAllRounded, PolicyRounded, RadarRounded, TerminalRounded } from '@mui/icons-material';
import { Alert, Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { errorMessage, unwrapPage } from '~/lib/httpRequest';
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
      // `page` is 0-BASED (Rule 2).
      const { data } = await adminService.getSecurityAuditLogs({
        page: page.currentPage,
        limit: page.totalItemsPerPage,
      });

      const { content, totalElements, totalPages } = unwrapPage({ data });
      setLogs(content);
      setPage((prev) => ({ ...prev, totalItems: totalElements, totalPages }));
    } catch (error) {
      toast.error(errorMessage(error, 'Không thể tải logs bảo mật.'));
    }
  };

  /**
   * Acknowledge a log entry.
   *
   * ⚠️ The backend exposes no "create audit log" write endpoint, so the previous
   * `adminService.createSecurityAuditLog` call threw a TypeError. Acknowledging is
   * recorded in local state until that endpoint exists.
   */
  const markDone = async (id) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    setNotice(`Sự kiện ${id} đã được xác nhận (tạm thời, chưa lưu về máy chủ).`);
    setTimeout(() => setNotice(''), 3000);
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
                <TableCell className={cx('headCell')}>Chi tiết</TableCell>
                <TableCell className={cx('headCell')}>Thực hiện bởi</TableCell>
                <TableCell className={cx('headCell')}>Đối tượng</TableCell>
                <TableCell className={cx('headCell')}>Thời gian</TableCell>
                <TableCell align="right" className={cx('headCell')}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id} className={cx('tableRow')}>
                  {/* ID + IP */}
                  <TableCell>
                    <Typography className={cx('logId')}>#{l.id}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {l.ip || l.ipAddress || '-'}
                    </Typography>
                  </TableCell>

                  {/* Event */}
                  <TableCell>
                    <Box className={cx('eventBox')}>
                      <BugReportRounded fontSize="small" />
                      <Typography fontSize={'1.2rem'} fontWeight={600}>{l.event || l.action || '-'}</Typography>
                    </Box>
                  </TableCell>

                  {/* Details (plain text instead of code) */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {l.details || '-'}
                    </Typography>
                  </TableCell>

                  {/* Actor */}
                  <TableCell>
                    <Typography variant="body2">{l.performedByUserId || '-'}</Typography>
                  </TableCell>

                  {/* Target */}
                  <TableCell>
                    <Typography variant="body2">{l.affectedUserId || '-'}</Typography>
                  </TableCell>

                  {/* Time */}
                  <TableCell>
                    <Typography variant="body2">{l.createdAt ? new Date(l.createdAt).toLocaleString('vi-VN') : '-'}</Typography>
                  </TableCell>

                  {/* Actions */}
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
