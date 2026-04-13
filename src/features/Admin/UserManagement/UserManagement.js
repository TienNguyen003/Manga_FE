import { DeleteOutlineRounded, EditRounded, ShieldMoonRounded, PersonRounded } from '@mui/icons-material';
import { Avatar, Box, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Users.module.scss';

const cx = classNames.bind(styles);

export default function UserManagement() {
  const users = [
    { id: 1, name: 'Duy Nguyễn', email: 'duy@example.com', role: 'Admin', status: 'Active', avatar: 'D' },
    { id: 2, name: 'Trần Văn A', email: 'vanna@example.com', role: 'Member', status: 'Banned', avatar: 'A' },
  ];

  return (
    <div className={cx('pageContainer')}>
      <Box className={cx('header')}>
        <Typography variant="h5" fontWeight={950} letterSpacing="-1px">
          Danh sách người dùng
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Quản lý quyền hạn và trạng thái hoạt động của thành viên.
        </Typography>
      </Box>

      <TableContainer component={Paper} className={cx('tableWrapper')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>NGƯỜI DÙNG</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>VAI TRÒ</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>TRẠNG THÁI</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">
                HÀNH ĐỘNG
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('userCell')}>
                    <Avatar className={cx('avatar')} sx={{ bgcolor: user.role === 'Admin' ? '#ea982b' : '#3b82f6' }}>
                      {user.avatar}
                    </Avatar>
                    <Box>
                      <Typography className={cx('userName')}>{user.name}</Typography>
                      <Typography className={cx('userEmail')}>{user.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip icon={user.role === 'Admin' ? <ShieldMoonRounded /> : <PersonRounded />} label={user.role} className={cx('roleChip', user.role.toLowerCase())} />
                </TableCell>
                <TableCell>
                  <div className={cx('statusIndicator', user.status.toLowerCase())}>
                    <span className={cx('dot')} />
                    {user.status}
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div className={cx('actionBtns')}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton className={cx('editBtn')} size="small">
                        <EditRounded />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa người dùng">
                      <IconButton className={cx('deleteBtn')} size="small">
                        <DeleteOutlineRounded />
                      </IconButton>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
