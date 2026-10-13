import {
  AddModeratorRounded,
  CloudSyncRounded,
  DeleteOutlineRounded,
  EditRounded,
  NotesRounded,
  SupervisedUserCircleRounded,
  TitleRounded,
  VpnKeyRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
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
import { errorMessage } from '~/lib/httpRequest';
import { adminService } from '~/services/adminService';
import { roleService } from '~/services/roleService';
import styles from './Rbac.module.scss';

const cx = classNames.bind(styles);

export default function RbacPanel() {
  const [roles, setRoles] = useState([]);
  const [page, setPage] = useState({ currentPage: 0, totalItemsPerPage: 10, totalItems: 0, totalPages: 0 });
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [permissionData, setPermissionData] = useState({ name: '', des: '' });

  useEffect(() => {
    getMatrix();
  }, [page.currentPage, page.totalItemsPerPage]);

  const getMatrix = async () => {
    try {
      // The matrix is a single document, not a paged list.
      const { data } = await adminService.getRbacMatrix();
      const result = data?.result;
      setRoles(Array.isArray(result) ? result : result?.roles ?? []);
    } catch (error) {
      setRoles([]);
      toast.error(errorMessage(error, 'Không thể tải ma trận RBAC.'));
    }
  };

  const handleCreateRole = async () => {
    if (!permissionData?.name?.trim()) {
      toast.error('Tên vai trò không được để trống.');
      return;
    }
    try {
      if (editing) {
        await roleService.updateRole(permissionData.name, permissionData);
        toast.success('Vai trò đã được cập nhật thành công.');
      } else {
        await roleService.createRole(permissionData);
        toast.success('Vai trò đã được tạo thành công.');
      }
      setOpenModal(false);
      setPermissionData({ name: '', description: '' });
      getMatrix();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo vai trò.');
    }
  };

  const handleEditRole = async (name) => {
    try {
      const response = await roleService.getRole({ name });
      const data = response?.result;
      setPermissionData(data);
      setEditing(true);
      setOpenModal(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể tải thông tin vai trò.');
    }
  };

  const handleDeleteRole = async (name) => {
    try {
      await roleService.deleteRole(name);
      toast.success('Vai trò đã được xóa thành công.');
      getMatrix();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa vai trò.');
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
          <Button
            variant="contained"
            startIcon={<AddModeratorRounded />}
            className={cx('primaryBtn')}
            onClick={() => {
              setOpenModal(true);
              setPermissionData({});
              setEditing(false);
            }}
          >
            Tạo vai trò mới
          </Button>
        </Stack>
      </Box>

      <Paper className={cx('mainPaper')} elevation={0}>
        <TableContainer component={Paper} className={cx('tableCard')} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={cx('headCell')}>Tên vai trò</TableCell>
                <TableCell className={cx('headCell')}>Mô tả</TableCell>
                <TableCell align="right" className={cx('headCell')}>
                  Quản trị quyền
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.name} className={cx('tableRow')}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <div className={cx('roleIcon', r.level)}>
                        <SupervisedUserCircleRounded />
                      </div>
                      <Typography fontWeight={850} fontSize="1.4rem" color="#0f172a">
                        {r.name || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>{r.des}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Chỉnh sửa" onClick={() => handleEditRole(r.name)}>
                        <IconButton className={cx('actionBtn', 'edit')}>
                          <EditRounded />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          className={cx('actionBtn', 'delete')}
                          onClick={() => {
                            setIsDeleteOpen(true);
                            setPermissionData(r);
                          }}
                        >
                          <DeleteOutlineRounded />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <DataTablePagination page={page} setPage={setPage} rowsPerPageLabel="Số quyền:" />
      </Paper>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ className: cx('premiumModal') }}>
        <Box className={cx('modalHeader')}>
          <Typography variant="h5" className={cx('modalTitle')}>
            {editing ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}
          </Typography>
        </Box>

        <DialogContent className={cx('modalBody')}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography className={cx('sectionLabel')}>
              <VpnKeyRounded fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Thông tin vai trò
            </Typography>

            {/* Trường Tên Vai Trò */}
            <TextField
              className={cx('premiumInput')}
              placeholder="Tên vai trò * (VD: user.create, admin.manage)"
              value={permissionData.name}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setPermissionData({ ...permissionData, name: e.target.value })}
            />

            {/* Trường Mô Tả */}
            <TextField
              className={cx('premiumInput')}
              placeholder="Mô tả chi tiết vai trò này..."
              value={permissionData.des}
              fullWidth
              multiline
              rows={3} // Tạo textArea rộng rãi
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <NotesRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setPermissionData({ ...permissionData, des: e.target.value })}
            />
          </Stack>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setOpenModal(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button variant="contained" className={cx('primaryBtn')} onClick={() => handleCreateRole()}>
            {editing ? 'Cập nhật vai trò' : 'Lưu vai trò'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          handleDeleteRole(permissionData.name);
          setIsDeleteOpen(false);
        }}
        title="Xóa vai trò"
        content={`Bạn đang chuẩn bị xóa vai trò <strong>${permissionData.name}</strong>. Tiếp tục?`}
      />
    </div>
  );
}
