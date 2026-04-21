import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
  PersonRounded,
  ShieldMoonRounded,
  AlternateEmailRounded,
  LockOutlined,
  BadgeRounded,
  HomeRounded,
  LinkRounded,
  ImageRounded,
  NoteAltRounded,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Button,
  Typography,
  InputAdornment,
} from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { adminService } from '~/services/adminService';
import { userService } from '~/services/userService';
import styles from './Users.module.scss';

const cx = classNames.bind(styles);

export default function UserManagement() {
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    bgComment: '',
    password: '',
    urlImage: '',
    address: '',
    link: {},
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers({});
      setUsers(response?.result || response?.data || response || []);
    } catch {
      toast.error('Lỗi tải dữ liệu.');
    }
  };

  const handleAddUser = async () => {
    try {
      await userService.createUser(newUser);
      toast.success('Đã thêm thành viên!');
      setOpenModal(false);
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi tạo thành viên.');
    }
  };

  return (
    <div className={cx('pageContainer')}>
      {/* HEADER */}
      <Box className={cx('header')}>
        <Box>
          <Typography variant="h4" className={cx('pageTitle')}>
            Thành viên
          </Typography>
          <Typography variant="body1" className={cx('pageSubtitle')}>
            Quản lý hệ thống người dùng và phân quyền.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setOpenModal(true)} className={cx('primaryBtn')}>
          Thêm thành viên
        </Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} className={cx('tableCard')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người dùng</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, idx) => (
              <TableRow key={user.id || idx} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('userInfo')}>
                    <Avatar src={user.urlImage} className={cx('avatar')} />
                    <Box>
                      <Typography className={cx('name')}>{user.name || user.username || 'Chưa đặt tên'}</Typography>
                      <Typography className={cx('email')}>{user.email || '@' + user.username}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={user.role === 'Admin' ? <ShieldMoonRounded /> : <PersonRounded />}
                    label={user.role || 'Member'}
                    className={cx('roleBadge', user.role?.toLowerCase())}
                  />
                </TableCell>
                <TableCell>
                  <Box className={cx('statusWrapper')}>
                    <span className={cx('statusDot', { active: !user.isBanned })} />
                    Hoạt động
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Sửa">
                      <IconButton className={cx('actionBtn', 'edit')}>
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton className={cx('actionBtn', 'delete')}>
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ className: cx('premiumModal') }}>
        <Box className={cx('modalHeader')}>
          <Typography variant="h6" className={cx('modalTitle')}>
            Hồ sơ người dùng mới
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Điền đầy đủ thông tin bên dưới để cấp quyền truy cập.
          </Typography>
        </Box>

        <DialogContent className={cx('modalBody')}>
          <Box className={cx('formGrid')}>
            {/* Cột trái: Tài khoản */}
            <Stack spacing={2.5} className={cx('formColumn')}>
              <Typography className={cx('sectionLabel')}>Xác thực</Typography>
              <TextField
                className={cx('premiumInput')}
                placeholder="Tên đăng nhập"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
              <TextField
                className={cx('premiumInput')}
                placeholder="Email"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <TextField
                className={cx('premiumInput')}
                placeholder="Mật khẩu"
                type="password"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <TextField
                className={cx('premiumInput')}
                placeholder="Liên kết (JSON): { 'facebook': 'fb.com/username', 'discord': 'twitter.com/username' }"
                multiline
                rows={3}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <LinkRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  try {
                    setNewUser({ ...newUser, link: JSON.parse(e.target.value) });
                  } catch {}
                }}
              />
            </Stack>

            {/* Cột phải: Cá nhân */}
            <Stack spacing={2.5} className={cx('formColumn')}>
              <Typography className={cx('sectionLabel')}>Thông tin định danh</Typography>
              <TextField
                className={cx('premiumInput')}
                placeholder="Họ và tên"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <TextField
                className={cx('premiumInput')}
                placeholder="Địa chỉ"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              />
              <TextField
                className={cx('premiumInput')}
                placeholder="URL Ảnh đại diện"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewUser({ ...newUser, urlImage: e.target.value })}
              />
              <TextField
                className={cx('premiumInput')}
                placeholder="Ghi chú nội bộ"
                multiline
                rows={3}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <NoteAltRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewUser({ ...newUser, bgComment: e.target.value })}
              />
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setOpenModal(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button onClick={handleAddUser} variant="contained" className={cx('primaryBtn')}>
            Xác nhận tạo
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
