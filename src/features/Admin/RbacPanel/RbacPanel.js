import { AddModeratorRounded, CloudSyncRounded, KeyRounded, ManageAccountsRounded, SecurityRounded, SupervisedUserCircleRounded, VerifiedUserRounded } from '@mui/icons-material';
import { Alert, Box, Button, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useState } from 'react';
import styles from './Rbac.module.scss';

const cx = classNames.bind(styles);

const roleSeed = [
  { role: 'Quản trị viên', level: 'Admin', permissions: ['Xóa bài viết', 'Cấm người dùng', 'Quản lý vai trò', 'Truy cập Logs'] },
  { role: 'Điều phối viên', level: 'Mod', permissions: ['Xóa bài viết', 'Ẩn đánh giá', 'Duyệt chương'] },
  { role: 'Người dùng', level: 'User', permissions: ['Tạo bài viết', 'Bình luận'] },
];

export default function RbacPanel() {
  const [roles, setRoles] = useState(roleSeed);
  const [notice, setNotice] = useState('');

  const grantBan = (role) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.role !== role) return r;
        if (r.permissions.includes('Cấm người dùng')) return r;
        return { ...r, permissions: [...r.permissions, 'Cấm người dùng'] };
      }),
    );
    setNotice(`Cấp quyền 'Cấm người dùng' thành công cho nhóm ${role}.`);
    setTimeout(() => setNotice(''), 3000);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Admin':
        return 'error';
      case 'Mod':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className={cx('rbacWrapper')}>
      <Box className={cx('header')}>
        <Box>
          <Typography className={cx('mainTitle')}>Phân quyền hệ thống (RBAC)</Typography>
          <Typography className={cx('subTitle')}>Định nghĩa vai trò và giới hạn phạm vi tác động vào API hệ thống.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<CloudSyncRounded />} className={cx('secondaryBtn')}>
            Đồng bộ API
          </Button>
          <Button variant="contained" startIcon={<AddModeratorRounded />} className={cx('primaryBtn')}>
            Tạo vai trò mới
          </Button>
        </Stack>
      </Box>

      {notice && (
        <Alert severity="success" variant="filled" className={cx('alert')} icon={<KeyRounded />}>
          {notice}
        </Alert>
      )}

      <Paper className={cx('mainPaper')} elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={cx('headCell')}>Nhóm vai trò</TableCell>
                <TableCell className={cx('headCell')}>Mức độ truy cập</TableCell>
                <TableCell className={cx('headCell')}>Danh sách quyền hạn</TableCell>
                <TableCell align="right" className={cx('headCell')}>
                  Quản trị quyền
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.role} className={cx('tableRow')}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <div className={cx('roleIcon', r.level)}>{r.level === 'Admin' ? <SecurityRounded /> : <SupervisedUserCircleRounded />}</div>
                      <Typography fontWeight={850} fontSize="1.4rem" color="#0f172a">
                        {r.role}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={r.level} color={getLevelColor(r.level)} size="small" variant="outlined" className={cx('levelChip')} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>
                    <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                      {r.permissions.map((p) => (
                        <Chip key={p} size="small" label={p} className={cx('permChip')} />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Cấp quyền 'Cấm User'">
                        <IconButton color="warning" onClick={() => grantBan(r.role)} disabled={r.permissions.includes('Cấm người dùng')} className={cx('actionIcon')}>
                          <VerifiedUserRounded />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa chi tiết">
                        <IconButton className={cx('actionIcon')}>
                          <ManageAccountsRounded />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}
