import {
  AddModeratorRounded,
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
  Switch,
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
import { errorMessage, unwrapList, unwrapPage } from '~/lib/httpRequest';
import { useUser } from '~/providers/UserContext';
import { adminService } from '~/services/adminService';
import { userService, isUserBanned } from '~/services/userService';
import { roleService } from '~/services/roleService';
import styles from './Users.module.scss';

const cx = classNames.bind(styles);

const ROLES = [
  {
    key: 'Admin',
    icon: <AdminPanelSettingsRounded />,
    color: '#ef4444',
  },
  {
    key: 'Moderator',
    icon: <ManageAccountsRounded />,
    color: '#3b82f6',
  },
  {
    key: 'Member',
    icon: <PersonOutlineRounded />,
    color: '#10b981',
  },
];

export default function UserManagement() {
  // The signed-in admin — Rule 9 uses this to disable self-targeting controls.
  const { userId: currentUserId } = useUser();

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
  const [roles, setRoles] = useState([]);
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

  useEffect(() => {
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      // Rule 2: `/admin/users` is 1-BASED (`pageNumber` starts at 1) and returns
      // a page object — not a bare array.
      const { data } = await adminService.getUsers({
        pageNumber: page.currentPage + 1,
        limit: page.totalItemsPerPage,
      });

      const { content, totalElements, totalPages } = unwrapPage({ data });
      setUsers(content);
      setPage((prev) => ({
        ...prev,
        totalItems: totalElements,
        totalPages,
      }));
    } catch {
      setUsers([]);
      toast.error(errorMessage(null, 'Lỗi tải dữ liệu.'));
    }
  };

  const loadRoles = async () => {
    try {
      const { data } = await roleService.getAllRole();
      const mergedRoles = unwrapList({ data }).map((role) => {
        const matched = ROLES.find((r) => r.key === role.name);

        return {
          ...role,
          icon: matched?.icon || null,
          color: matched?.color || '#9ca3af',
          key: role.name,
        };
      });

      setRoles(mergedRoles);
    } catch (error) {
      toast.error(errorMessage(error, 'Lỗi tải danh sách vai trò.'));
    }
  };

  const handleAddUser = async () => {
    try {
      if (editing) {
        await userService.updateUser({ id: newUser.id, ...newUser });
        toast.success('Đã cập nhật thành viên!');
      } else {
        await userService.createUser(newUser);
        toast.success('Đã thêm thành viên!');
      }
      setOpenModal(false);
      setEditing(false);
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Lỗi tạo thành viên.'));
    }
  };

  const handleDeleteUser = async (userId) => {
    // Rule 9: the backend refuses `DELETE /admin/users/{id}` on your own
    // account with `403 FORBIDDEN_RESOURCE`. The button is disabled for self,
    // so reaching here means a genuine mistake — guard anyway.
    if (adminService.isSelf(userId, currentUserId)) {
      toast.warning('Bạn không thể tự xoá tài khoản của chính mình.');
      return;
    }
    try {
      await adminService.deleteUser(userId);
      toast.success('Đã xóa thành viên!');
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Lỗi xóa thành viên.'));
    }
  };

  const handleEditUser = async (userId) => {
    try {
      setOpenModal(true);
      setEditing(true);
      const { data } = await userService.getUserById({ userId });
      setNewUser({ ...(data?.result ?? {}) });
    } catch (error) {
      toast.error(errorMessage(error, 'Lỗi tải thông tin thành viên.'));
    }
  };

  const handleBanUser = async (userId) => {
    if (adminService.isSelf(userId, currentUserId)) {
      toast.warning('Bạn không thể tự khoá tài khoản của chính mình.');
      return;
    }
    try {
      await adminService.banUser(userId);
      toast.success('Thành viên đã bị khóa!');
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Lỗi khóa thành viên.'));
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminService.unbanUser(userId);
      toast.success('Thành viên đã được mở khóa!');
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Lỗi mở khóa thành viên.'));
    }
  };

  const handleAssignRole = async (userId, roleName) => {
    // Rule 9: revoking your OWN ADMIN role is also refused with 403.
    if (adminService.isSelf(userId, currentUserId)) {
      toast.warning('Bạn không thể tự thay đổi vai trò của chính mình.');
      return;
    }
    try {
      await adminService.updateUserRole(userId, roleName);
      toast.success('Đã gán quyền mới!');
      setIsAssignOpen(false);
      loadUsers();
    } catch (error) {
      toast.error(errorMessage(error, 'Lỗi gán quyền.'));
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
          <Typography variant="body" className={cx('pageSubtitle')}>
            Quản lý hệ thống người dùng và phân quyền.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => {
            setOpenModal(true);
            setNewUser({});
            setEditing(false);
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
                    icon={user.role?.name === 'Admin' ? <ShieldMoonRounded /> : user.role?.name === 'Moderator' ? <AddModeratorRounded /> : <PersonRounded />}
                    label={user.role?.name || 'Member'}
                    className={cx('roleBadge', user.role?.name)}
                  />
                </TableCell>
                <TableCell>
                  <Box className={cx('statusWrapper')}>
                    {/*
                      ⚠️ `users.status` is a NUMBER: 0 = active, 1 = banned.
                      `user.status ? ...` renders "Hoạt động" for the number 0
                      because 0 is falsy — so every account looked active.
                    */}
                    {isUserBanned(user) ? (
                      <>
                        <span className={cx('statusDot')} />
                        Bị khóa
                      </>
                    ) : (
                      <>
                        <span className={cx('statusDot', { active: true })} />
                        Hoạt động
                      </>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {/*
                      Rule 9: an admin may not target their OWN account.
                      `PUT|DELETE /admin/users/{id}` and revoking one's own ADMIN
                      role all answer `403 FORBIDDEN_RESOURCE`, so those controls
                      are disabled here instead of offering a button that can
                      only fail.
                    */}
                    {(() => {
                      const isSelfRow = adminService.isSelf(user.id, currentUserId);
                      const banned = isUserBanned(user);

                      return (
                        <>
                          <Tooltip title={isSelfRow ? 'Không thể sửa chính mình' : 'Sửa'}>
                            <span>
                              <IconButton
                                className={cx('actionBtn', 'edit')}
                                disabled={isSelfRow}
                                onClick={() => handleEditUser(user.id)}
                              >
                                <EditRounded fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title={isSelfRow ? 'Không thể tự xoá tài khoản' : 'Xóa'}>
                            <span>
                              <IconButton
                                className={cx('actionBtn', 'delete')}
                                disabled={isSelfRow}
                                onClick={() => {
                                  setNewUser(user);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <DeleteOutlineRounded fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          {banned ? (
                            <Tooltip title="Mở khoá">
                              <IconButton className={cx('actionBtn', 'unban')} onClick={() => handleUnbanUser(user.id)}>
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title={isSelfRow ? 'Không thể tự khoá tài khoản' : 'Khoá'}>
                              <span>
                                <IconButton
                                  className={cx('actionBtn', 'ban')}
                                  disabled={isSelfRow}
                                  onClick={() => handleBanUser(user.id)}
                                >
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          <Tooltip title={isSelfRow ? 'Không thể tự đổi vai trò' : 'Phân quyền'}>
                            <span>
                              <IconButton
                                className={cx('actionBtn', 'role')}
                                disabled={isSelfRow}
                                onClick={() => {
                                  setNewUser(user);
                                  setSelectedRole(user.role?.name || '');
                                  setIsAssignOpen(true);
                                }}
                              >
                                <AdminPanelSettingsIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      );
                    })()}
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

              <Box className={cx('switchCard')}>
                <Box>
                  <Typography className={cx('switchTitle')}>Trạng thái hoạt động</Typography>
                  <Typography className={cx('switchDesc')}>Trạng thái hoạt động của tài khoản</Typography>
                </Box>
                <Switch value={newUser.status} checked={newUser.status === 1} onChange={(e) => setNewUser({ ...newUser, status: e.target.checked ? 1 : 0 })} color="primary" />
              </Box>
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
            <Box sx={{ flex: 1 }}>
              <Typography className={cx('userName')}>{newUser?.name}</Typography>
              <Typography className={cx('userEmail')}>{newUser?.email}</Typography>
            </Box>
            <Chip label={newUser?.role?.name || 'Member'} size="small" color="primary" />
          </Box>

          <Typography className={cx('sectionLabel')}>Chọn vai trò mới</Typography>

          <Stack spacing={2} className={cx('roleList')}>
            {roles.map((role) => (
              <Box
                key={role.key}
                className={cx('roleCard', { active: selectedRole === role.key }, { available: role.key === newUser.role?.name })}
                onClick={() => setSelectedRole(role.key)}
              >
                <Box className={cx('roleIcon')} sx={{ color: role.color, backgroundColor: `${role.color}15` }}>
                  {role.icon}
                </Box>
                <Box className={cx('roleInfo')}>
                  <Typography className={cx('roleTitle')}>{role.name}</Typography>
                  <Typography className={cx('roleDesc')}>{role.des}</Typography>
                </Box>
                {selectedRole === role.key && <CheckCircleRounded className={cx('checkIcon')} />}
              </Box>
            ))}
          </Stack>

          <Typography className={cx('warningText')}>
            <AdminPanelSettingsRounded sx={{ mr: 1 }} />
            Lưu ý: Thay đổi vai trò có thể ảnh hưởng đến quyền truy cập và khả năng quản lý của người dùng. Quyền có nền màu xám là quyền hiện có của thành viên.
          </Typography>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setIsAssignOpen(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button variant="contained" className={cx('primaryBtn')} onClick={() => handleAssignRole(newUser.id, selectedRole)}>
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
