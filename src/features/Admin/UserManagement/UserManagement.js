import {
  AddRounded,
  AdminPanelSettingsRounded,
  AlternateEmailRounded,
  BadgeRounded,
  CheckCircleRounded,
  DeleteOutlineRounded,
  EditRounded,
  HomeRounded,
  ImageRounded,
  LinkRounded,
  LockOutlined,
  ManageAccountsRounded,
  PersonOutlineRounded,
  PersonRounded,
  SecurityRounded,
  ShieldMoonRounded,
} from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

import ConfirmDeleteModal from '~/components/common/ConfirmDeleteModal';
import DataTablePagination from '~/components/common/DataTablePagination';
import { adminService } from '~/services/adminService';
import { userService } from '~/services/userService';
import styles from './Users.module.scss';

const cx = classNames.bind(styles);

const ROLES = [
  {
    key: 'ADMIN',
    title: 'Administrator',
    desc: 'Toàn quyền quản trị hệ thống, quản lý người dùng và cấu hình.',
    icon: <AdminPanelSettingsRounded />,
    color: '#ef4444',
  },
  {
    key: 'MODERATOR',
    title: 'Moderator',
    desc: 'Quản lý nội dung, duyệt truyện, xử lý báo cáo từ người dùng.',
    icon: <ManageAccountsRounded />,
    color: '#3b82f6',
  },
  {
    key: 'MEMBER',
    title: 'Member',
    desc: 'Người dùng cơ bản, có thể đọc và bình luận.',
    icon: <PersonOutlineRounded />,
    color: '#10b981',
  },
];

export default function UserManagement() {
  const [page, setPage] = useState({
    totalItems: 0,
    totalItemsPerPage: 10,
    currentPage: 0,
    totalPages: 0,
  });
  const [selectedRole, setSelectedRole] = useState('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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

  const handleBanUser = async (userId) => {
    try {
      await adminService.banUser(userId);
      toast.success('Thành viên đã bị khóa!');
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi khóa thành viên.');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminService.unbanUser(userId);
      toast.success('Thành viên đã được mở khóa!');
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi mở khóa thành viên.');
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
                      <IconButton
                        className={cx('actionBtn', 'delete')}
                        onClick={() => {
                          setNewUser(user);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {user.status ? (
                      <Tooltip title="Ban">
                        <IconButton className={cx('actionBtn', 'ban')} onClick={() => handleBanUser(user.id)}>
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Unban">
                        <IconButton className={cx('actionBtn', 'unban')} onClick={() => handleUnbanUser(user.id)}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Gán quyền">
                      <IconButton
                        className={cx('actionBtn', 'assign')}
                        onClick={() => {
                          setIsAssignOpen(true);
                          setNewUser(user);
                        }}
                      >
                        <AdminPanelSettingsIcon fontSize="small" />
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

      {/* MODAL ADD CREATE*/}
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

      {/* MODAL ASSIGN ROLE */}
      <Dialog open={isAssignOpen} onClose={() => setIsAssignOpen(false)} maxWidth="sm" fullWidth PaperProps={{ className: cx('roleModal') }}>
        <Box className={cx('modalHeader')}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box className={cx('headerIcon')}>
              <SecurityRounded />
            </Box>
            <Box>
              <Typography variant="h6" className={cx('title')}>
                Phân quyền người dùng
              </Typography>
              <Typography variant="body2" className={cx('subtitle')}>
                Thay đổi vai trò và cấp bậc truy cập
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent className={cx('modalBody')}>
          {/* User Preview */}
          <Box className={cx('userPreview')}>
            <Avatar src={newUser?.urlImage} className={cx('userAvatar')} />
            <Box sx={{flex: 1}}>
              <Typography className={cx('userName')}>{newUser?.name}</Typography>
              <Typography className={cx('userEmail')}>{newUser?.email}</Typography>
            </Box>
            <Chip label={newUser?.role?.name || 'Member'} size="small" color="primary" />
          </Box>

          <Typography className={cx('sectionLabel')}>Chọn vai trò mới</Typography>

          <Stack spacing={2} className={cx('roleList')}>
            {ROLES.map((role) => (
              <Box key={role.key} className={cx('roleCard', { active: selectedRole === role.key })} onClick={() => setSelectedRole(role.key)}>
                <Box className={cx('roleIcon')} sx={{ color: role.color, backgroundColor: `${role.color}15` }}>
                  {role.icon}
                </Box>
                <Box className={cx('roleInfo')}>
                  <Typography className={cx('roleTitle')}>{role.title}</Typography>
                  <Typography className={cx('roleDesc')}>{role.desc}</Typography>
                </Box>
                {selectedRole === role.key && <CheckCircleRounded className={cx('checkIcon')} />}
              </Box>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setIsAssignOpen(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button variant="contained" className={cx('primaryBtn')}>
            Xác nhận gán quyền
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DELETE */}
      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          handleDeleteUser(newUser.id);
          setIsDeleteOpen(false);
        }}
        title="Xóa người dùng"
        content={`Bạn đang chuẩn bị xóa người dùng <strong>${newUser.name}</strong>. Tiếp tục?`}
      />
    </div>
  );
}
