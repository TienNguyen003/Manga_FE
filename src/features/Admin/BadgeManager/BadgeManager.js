import { AddRounded, BadgeRounded, DeleteOutlineRounded, DescriptionRounded, EditRounded, Filter1Rounded, ImageRounded, QrCodeRounded, RuleRounded } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
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
import DataTablePagination from '~/components/common/DataTablePagination';
import { adminService } from '~/services/adminService';
import styles from './Badges.module.scss';
import ConfirmDeleteModal from '~/components/common/ConfirmDeleteModal';

const cx = classNames.bind(styles);

export default function BadgeManager() {
  const badgeConditionTypes = [
    { value: 'MANGA_FOLLOW_COUNT', label: 'Số người theo dõi truyện' },
    { value: 'MANGA_RATING_COUNT', label: 'Số đánh giá truyện' },
    { value: 'MANGA_COMMENT_COUNT', label: 'Số bình luận truyện' },
    { value: 'READING_HISTORY_COUNT', label: 'Số lần đọc truyện' },
    { value: 'FOLLOWER_COUNT', label: 'Số người theo dõi' },
    { value: 'FOLLOWING_COUNT', label: 'Số người đang theo dõi' },
  ];

  const [badges, setBadges] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    totalItemsPerPage: 10,
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newBadge, setNewBadge] = useState({
    code: '',
    name: '',
    description: '',
    iconUrl: '',
    isActive: 1,
    conditionType: 'ORDINAL',
    conditionValue: 0,
    autoGrant: 1,
  });

  useEffect(() => {
    loadBadges();
  }, [page.currentPage, page.totalItemsPerPage]);

  const loadBadges = async () => {
    try {
      const response = await adminService.getBadges({ page: page.currentPage + 1, size: page.totalItemsPerPage });
      const data = response?.result || [];
      const newPage = response?.page || {};
      setPage((prev) => ({ ...prev, totalItems: newPage?.totalItems || 0, totalPages: newPage?.totalPages || 0 }));
      setBadges(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách huy hiệu.');
    }
  };

  const handleCreateBadge = async () => {
    if (!newBadge.code?.trim() || !newBadge.name?.trim()) {
      toast.error('Mã và tên huy hiệu không được để trống!');
      return;
    }
    try {
      if (editing) {
        await adminService.updateBadge(newBadge.id, newBadge);
        toast.success('Cập nhật huy hiệu thành công!');
      } else {
        await adminService.createBadge(newBadge);
        toast.success('Tạo huy hiệu thành công!');
      }
      setEditing(false);
      setOpenModal(false);
      loadBadges();
    } catch (error) {
      toast.error(error.response?.data?.message || `Lỗi khi ${editing ? 'cập nhật' : 'tạo'} huy hiệu.`);
    }
  };

  const handleEditBadge = async (badgeId) => {
    setEditing(true);
    setOpenModal(true);
    try {
      const response = await adminService.getBadge(badgeId);
      const badgeData = response?.result || {};
      setNewBadge(badgeData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải thông tin huy hiệu.');
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    try {
      await adminService.deleteBadge(badgeId);
      toast.success('Xóa huy hiệu thành công!');
      loadBadges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa huy hiệu.');
    }
  };

  return (
    <div className={cx('pageContainer')}>
      {/* Header */}
      <header className={cx('pageHeader')}>
        <Box>
          <Typography variant="h4" className={cx('pageTitle')}>
            Kho Huy Hiệu
          </Typography>
          <Typography className={cx('pageSubtitle')}>Quản lý hệ thống danh hiệu và phần thưởng thành viên.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          className={cx('primaryBtn')}
          onClick={() => {
            setOpenModal(true);
            setNewBadge({});
            setEditing(false);
          }}
        >
          Tạo huy hiệu mới
        </Button>
      </header>

      {/* Table Section */}
      <TableContainer component={Paper} className={cx('tableCard')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Huy hiệu</TableCell>
              <TableCell>Tên - Mô tả</TableCell>
              <TableCell>Mã ID</TableCell>
              <TableCell>Sở hữu</TableCell>
              <TableCell>Điều kiện</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {badges.map((badge, index) => (
              <TableRow key={badge.id} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('badgeInfoCell')}>
                    <Avatar src={badge.iconUrl || 'https://cdn-icons-png.flaticon.com/512/6198/6198527.png'} className={cx('badgeAvatar')} variant="rounded" />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box className={cx('badgeInfoCell')}>
                    <Box>
                      <Typography className={cx('badgeName')}>{badge.name || badge.title || `Badge ${index + 1}`}</Typography>
                      <Typography className={cx('badgeDesc')}>{badge.description || 'Không có mô tả'}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell className={cx('textMono')}>{badge.code || `#${badge.id}`}</TableCell>
                <TableCell>
                  <Typography className={cx('countText')}>
                    <b>{Number(badge.count || badge.ownedCount || 0).toLocaleString()}</b> người
                  </Typography>
                </TableCell>
                <TableCell>
                  <span className={cx('conditionBadge')}>
                    {badge.conditionType || 'N/A'} : {badge.conditionValue || 0}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton className={cx('actionBtn', 'edit')} onClick={() => handleEditBadge(badge.id)}>
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        className={cx('actionBtn', 'delete')}
                        onClick={() => {
                          setNewBadge(badge);
                          setIsDeleteOpen(true);
                        }}
                      >
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

      {/* Modal Thêm Huy Hiệu (Premium UI) */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ className: cx('premiumModal') }}>
        <Box className={cx('modalHeader')}>
          <Typography variant="h6" className={cx('modalTitle')}>
            {editing ? 'Chỉnh sửa huy hiệu' : 'Tạo huy hiệu mới'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Thiết lập thông số và điều kiện trao tặng cho huy hiệu.
          </Typography>
        </Box>

        <DialogContent className={cx('modalBody')}>
          <Box className={cx('formGrid')}>
            {/* CỘT TRÁI: THÔNG TIN HIỂN THỊ */}
            <Stack spacing={2.5} className={cx('formColumn')}>
              <Typography className={cx('sectionLabel')}>Thông tin hiển thị</Typography>

              <TextField
                className={cx('premiumInput')}
                placeholder="Mã huy hiệu (VD: VIP_01) *"
                value={newBadge.code}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewBadge({ ...newBadge, code: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Tên huy hiệu *"
                value={newBadge.name}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="URL Ảnh Icon"
                value={newBadge.iconUrl}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewBadge({ ...newBadge, iconUrl: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Mô tả chi tiết"
                value={newBadge.description}
                multiline
                rows={3}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescriptionRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
              />
            </Stack>

            {/* CỘT PHẢI: CẤU HÌNH HỆ THỐNG */}
            <Stack spacing={2.5} className={cx('formColumn')}>
              <Typography className={cx('sectionLabel')}>Điều kiện & Hệ thống</Typography>

              <TextField
                select
                className={cx('premiumInput')}
                value={newBadge.conditionType}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RuleRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewBadge({ ...newBadge, conditionType: e.target.value })}
              >
                {badgeConditionTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="number"
                className={cx('premiumInput')}
                placeholder="Giá trị điều kiện (VD: 100)"
                value={newBadge.conditionValue}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Filter1Rounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewBadge({ ...newBadge, conditionValue: Number(e.target.value) })}
              />

              <Box className={cx('switchCard')}>
                <Box>
                  <Typography className={cx('switchTitle')}>Tự động cấp phát</Typography>
                  <Typography className={cx('switchDesc')}>Hệ thống tự động trao khi đủ điều kiện</Typography>
                </Box>
                <Switch
                  value={newBadge.autoGrant}
                  checked={newBadge.autoGrant === 1}
                  color="primary"
                  onChange={(e) => setNewBadge({ ...newBadge, autoGrant: e.target.checked ? 1 : 0 })}
                />
              </Box>

              <Box className={cx('switchCard')}>
                <Box>
                  <Typography className={cx('switchTitle')}>Trạng thái hoạt động</Typography>
                  <Typography className={cx('switchDesc')}>Cho phép hiển thị trên hệ thống</Typography>
                </Box>
                <Switch
                  value={newBadge.isActive}
                  checked={newBadge.isActive === 1}
                  color="success"
                  onChange={(e) => setNewBadge({ ...newBadge, isActive: e.target.checked ? 1 : 0 })}
                />
              </Box>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setOpenModal(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button onClick={handleCreateBadge} variant="contained" className={cx('primaryBtn')}>
            {editing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          handleDeleteBadge(newBadge.id);
          setIsDeleteOpen(false);
        }}
        title="Xóa huy hiệu"
        content={`Bạn đang chuẩn bị xóa huy hiệu <strong>${newBadge.name}</strong>. Tiếp tục?`}
      />
    </div>
  );
}
