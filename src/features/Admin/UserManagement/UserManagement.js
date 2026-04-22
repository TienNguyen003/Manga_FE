import {
  AddRounded,
  AlternateEmailRounded,
  BadgeRounded,
  DeleteOutlineRounded,
  EditRounded,
  HomeRounded,
  ImageRounded,
  LinkRounded,
  LockOutlined,
  PersonRounded,
  ShieldMoonRounded,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
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
  Typography,
} from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import DataTablePagination from '~/components/common/DataTablePagination';
import { adminService } from '~/services/adminService';
import { userService } from '~/services/userService';
import styles from './Users.module.scss';

const cx = classNames.bind(styles);

export default function UserManagement() {
  const [page, setPage] = useState({
    totalItems: 0,
    totalItemsPerPage: 10,
    currentPage: 0,
    totalPages: 0,
  });
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(false);
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
  }, [page.currentPage, page.totalItemsPerPage]);

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers({ page: page.currentPage + 1, size: page.totalItemsPerPage });
      const newPage = response?.page || {};
      setUsers(response?.result);
      setPage((prev) => ({
        ...prev,
        totalItems: newPage.totalItems,
        totalPages: newPage.totalPages,
      }));
    } catch {
      toast.error('Lỗi tải dữ liệu.');
    }
  };

  const handleAddUser = async () => {
    try {
      if (editing) {
        await userService.updateUser(newUser.id, newUser);
        toast.success('Đã cập nhật thành viên!');
      } else {
        await userService.createUser(newUser);
        toast.success('Đã thêm thành viên!');
      }
      setOpenModal(false);
      setEditing(false);
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi tạo thành viên.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành viên này?')) return;
    try {
      await userService.deleteUser(userId);
      toast.success('Đã xóa thành viên!');
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi xóa thành viên.');
    }
  };

  const handleEditUser = async (userId) => {
    try {
      setOpenModal(true);
      setEditing(true);
      const res = await userService.getUserById(userId);
      const userData = res?.result || {};
      setNewUser({ ...userData });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi tải thông tin thành viên.');
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
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => {
            setOpenModal(true);
            setNewUser({});
          }}
          className={cx('primaryBtn')}
        >
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
                    icon={user.role?.name === 'Admin' ? <ShieldMoonRounded /> : <PersonRounded />}
                    label={user.role?.name || 'Member'}
                    className={cx('roleBadge', user.role?.name)}
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
                      <IconButton className={cx('actionBtn', 'edit')} onClick={() => handleEditUser(user.id)}>
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton className={cx('actionBtn', 'delete')} onClick={() => handleDeleteUser(user.id)}>
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
      <DataTablePagination page={page} setPage={setPage} />

      {/* MODAL */}
      <Dialog
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(false);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: cx('premiumModal') }}
      >
        <Box className={cx('modalHeader')}>
          <Typography variant="h6" className={cx('modalTitle')}>
            {editing ? 'Chỉnh sửa Hồ sơ người dùng' : 'Tạo Hồ sơ người dùng mới'}
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
                value={newUser.username}
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
                value={newUser.email}
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
              {!editing && (
                <TextField
                  value={newUser.password}
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
              )}
              <TextField
                value={JSON.stringify(newUser.link)}
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
                value={newUser.name}
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
                value={newUser.address}
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
                value={newUser.urlImage}
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
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setOpenModal(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button onClick={handleAddUser} variant="contained" className={cx('primaryBtn')}>
            {editing ? 'Xác nhận cập nhật' : 'Xác nhận tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
