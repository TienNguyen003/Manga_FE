import { AddRounded, DeleteOutlineRounded, DynamicFeedRounded, EditRounded, LinkRounded, TagRounded } from '@mui/icons-material';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { errorMessage, unwrapList } from '~/lib/httpRequest';
import { communityService } from '~/services/communityService';
import styles from './Topics.module.scss';
import { TopicRounded, DescriptionRounded } from '@mui/icons-material';
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
      /*
       * ⚠️ `/admin/topics` has NO controller server-side. `/community/topics` is
       * the public list and returns the same entity shape, so the table renders
       * real data. Topic CRUD stays unavailable until the backend ships it.
       */
      const { data } = await communityService.getTopics();
      setTopics(unwrapList({ data }));
    } catch (error) {
      setTopics([]);
      toast.error(errorMessage(error, 'Lỗi khi tải danh sách topic.'));
    }
  };

  const handleCreateTopic = async () => {
    toast.warning('Tạo topic chưa được hỗ trợ — backend chưa có endpoint quản trị topic.');
  };

  const handleEditTopic = async () => {
    toast.warning('Sửa topic chưa được hỗ trợ — backend chưa có endpoint quản trị topic.');
  };

  const handleDeleteTopic = async () => {
    toast.warning('Xoá topic chưa được hỗ trợ — backend chưa có endpoint quản trị topic.');
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
