import { AddRounded, DeleteOutlineRounded, DynamicFeedRounded, EditRounded, LinkRounded, TagRounded } from '@mui/icons-material';
import { Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './Topics.module.scss';
import { TopicRounded, DescriptionRounded, ToggleOnRounded, SettingsBackupRestoreRounded } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, DialogActions, Stack, TextField, InputAdornment, Switch } from '@mui/material';
import { toast } from 'react-toastify';
import DataTablePagination from '~/components/common/DataTablePagination';
import ConfirmDeleteModal from '~/components/common/ConfirmDeleteModal';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

export default function TopicManagement() {
  const [topics, setTopics] = useState([]);
  const [editing, setEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    totalItemsPerPage: 10,
  });
  const [newTopic, setNewTopic] = useState({
    name: '',
    description: '',
    status: 1,
  });

  useEffect(() => {
    loadTopics();
  }, [page.currentPage, page.totalItemsPerPage]);

  const loadTopics = async () => {
    try {
      const response = await adminService.getTopics({
        page: page.currentPage + 1,
        size: page.totalItemsPerPage,
      });
      const data = response?.result || [];
      const newPage = response?.page || {};
      setPage((prev) => ({ ...prev, totalItems: newPage?.totalItems || 0, totalPages: newPage?.totalPages || 0 }));
      setTopics(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách topic.');
    }
  };

  const handleCreateTopic = async () => {
    try {
      if (editing) {
        await adminService.updateTopic(newTopic.id, newTopic);
        toast.success('Cập nhật topic thành công!');
      } else {
        await adminService.createTopic(newTopic);
        toast.success('Tạo topic mới thành công!');
      }
      setOpenModal(false);
      setEditing(false);
      loadTopics();
    } catch (error) {
      toast.error(error.response?.data?.message || `Lỗi khi ${editing ? 'cập nhật' : 'tạo'} topic.`);
    }
  };
  const handleEditTopic = async (topicId) => {
    setEditing(true);
    setOpenModal(true);
    try {
      const response = await adminService.getTopic(topicId);
      const topicData = response?.result || {};
      setNewTopic(topicData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tải thông tin topic.');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await adminService.deleteTopic(topicId);
      toast.success('Xóa topic thành công!');
      loadTopics();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa topic.');
    }
  };

  return (
    <div className={cx('pageContainer')}>
      {/* --- HEADER --- */}
      <header className={cx('header')}>
        <Box>
          <Typography className={cx('title')}>Quản lý Topic</Typography>
          <Typography className={cx('subtitle')}>Phân loại nội dung và tối ưu cấu trúc đường dẫn (SEO).</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          className={cx('primaryBtn')}
          onClick={() => {
            setNewTopic({});
            setOpenModal(true);
            setEditing(false);
          }}
        >
          Thêm Topic mới
        </Button>
      </header>

      {/* --- TABLE AREA --- */}
      <TableContainer component={Paper} className={cx('tableWrapper')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên thể loại</TableCell>
              <TableCell>Đường dẫn (Slug)</TableCell>
              <TableCell>Thống kê</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topics.map((topic, index) => (
              <TableRow key={topic.id} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('topicNameCell')}>
                    <div className={cx('tagIcon')}>
                      <TagRounded />
                    </div>
                    <Typography className={cx('nameText')}>{topic.name || topic.title || `Topic ${index + 1}`}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box className={cx('slugCell')}>
                    <Link to={paths.communityTopic.replace(':id', topic.id || '-')} style={{ display: 'flex', alignItems: 'center' }}>
                      <LinkRounded className={cx('linkIcon')} />
                      <span>{paths.communityTopic.replace(':id', topic.id || '-')}</span>
                    </Link>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography className={cx('countText')}>
                    <b>{topic.postCount ?? topic.postsCount ?? 0}</b> bài viết
                  </Typography>
                </TableCell>

                <TableCell>
                  <div className={cx('statusTag', topic.status ? 'active' : '')}>
                    <span className={cx('dot')} />
                    {topic.status ? 'Hiển thị' : 'Đang ẩn'}
                  </div>
                </TableCell>

                <TableCell align="right">
                  <div className={cx('actionGroup')}>
                    <Link to={paths.postManagement.replace(':id', topic.id)}>
                      <Tooltip title="Xem Posts">
                        <IconButton size="small" className={cx('viewBtn')}>
                          <DynamicFeedRounded />
                        </IconButton>
                      </Tooltip>
                    </Link>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" className={cx('actionBtn', 'edit')} onClick={() => handleEditTopic(topic.id)}>
                        <EditRounded />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        className={cx('actionBtn', 'delete')}
                        onClick={() => {
                          setNewTopic(topic);
                          setIsDeleteOpen(true);
                        }}
                      >
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
      <DataTablePagination page={page} setPage={setPage} />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ className: cx('premiumModal') }}>
        <Box className={cx('modalHeader')}>
          <Typography variant="h5" className={cx('modalTitle')}>
            {editing ? 'Chỉnh sửa Topic' : 'Thêm Topic mới'}
          </Typography>
        </Box>

        <DialogContent className={cx('modalBody')}>
          <Box className={cx('formGrid')}>
            {/* CỘT 1: THÔNG TIN CHÍNH */}
            <Stack spacing={3}>
              <Typography className={cx('sectionLabel')}>Định danh chủ đề</Typography>

              <TextField
                className={cx('premiumInput')}
                placeholder="Tên chủ đề (Ví dụ: Action, Romance...)"
                value={newTopic.name}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TopicRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
              />

              <Box className={cx('switchCard')}>
                <Box>
                  <Typography className={cx('switchTitle')}>Trạng thái hiển thị</Typography>
                  <Typography className={cx('switchDesc')}>Cho phép người dùng tìm kiếm theo topic này</Typography>
                </Box>
                <Switch value={newTopic.status} checked={newTopic.status === 1} onChange={(e) => setNewTopic({ ...newTopic, status: e.target.checked ? 1 : 0 })} color="primary" />
              </Box>
            </Stack>

            {/* CỘT 2: MÔ TẢ CHI TIẾT */}
            <Stack spacing={3}>
              <Typography className={cx('sectionLabel')}>Thông tin bổ sung</Typography>

              <TextField
                className={cx('premiumInput')}
                placeholder="Mô tả chi tiết về chủ đề này..."
                value={newTopic.description}
                fullWidth
                multiline
                rows={3} // Tăng rows để cân bằng chiều cao với cột 1
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescriptionRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
              />
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setOpenModal(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button variant="contained" className={cx('primaryBtn')} onClick={handleCreateTopic}>
            {editing ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          handleDeleteTopic(newTopic.id);
          setIsDeleteOpen(false);
        }}
        title="Xóa chủ đề"
        content={`Bạn đang chuẩn bị xóa chủ đề <strong>${newTopic.name}</strong>. Tiếp tục?`}
      />
    </div>
  );
}
