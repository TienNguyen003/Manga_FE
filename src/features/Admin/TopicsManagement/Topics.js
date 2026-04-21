import { AddRounded, DeleteOutlineRounded, DynamicFeedRounded, EditRounded, LinkRounded, TagRounded } from '@mui/icons-material';
import { Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './Topics.module.scss';
import { TopicRounded, DescriptionRounded, ToggleOnRounded, SettingsBackupRestoreRounded } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, DialogActions, Stack, TextField, InputAdornment, Switch } from '@mui/material';

const cx = classNames.bind(styles);

export default function TopicManagement() {
  const [topics, setTopics] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    name: '',
    description: '',
    status: 1, // 1: Active, 0: Inactive
  });

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await adminService.getTopics();
        const data = response?.result || response?.data || response || [];
        setTopics(Array.isArray(data) ? data : data.items || data.topics || []);
      } catch {
        setTopics([]);
      }
    };

    loadTopics();
  }, []);

  return (
    <div className={cx('pageContainer')}>
      {/* --- HEADER --- */}
      <header className={cx('header')}>
        <Box>
          <Typography className={cx('title')}>Quản lý Topic</Typography>
          <Typography className={cx('subtitle')}>Phân loại nội dung và tối ưu cấu trúc đường dẫn (SEO).</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} className={cx('primaryBtn')} onClick={() => setOpenModal(true)}>
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
                    <LinkRounded className={cx('linkIcon')} />
                    <span>/{topic.slug || topic.code || '-'}</span>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography className={cx('countText')}>
                    <b>{topic.postCount ?? topic.postsCount ?? 0}</b> bài viết
                  </Typography>
                </TableCell>

                <TableCell>
                  <div className={cx('statusTag', (topic.status || 'active').toLowerCase())}>
                    <span className={cx('dot')} />
                    {(topic.status || 'Active') === 'Active' ? 'Hiển thị' : 'Đang ẩn'}
                  </div>
                </TableCell>

                <TableCell align="right">
                  <div className={cx('actionGroup')}>
                    <Button startIcon={<DynamicFeedRounded />} variant="contained" className={cx('viewBtn')}>
                      Xem Posts
                    </Button>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" className={cx('actionBtn', 'edit')}>
                        <EditRounded />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" className={cx('actionBtn', 'delete')}>
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

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ className: cx('premiumModal') }}>
        <Box className={cx('modalHeader')}>
          <Typography variant="h5" className={cx('modalTitle')}>
            Cấu hình Chủ đề / Topic
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
                <Switch checked={newTopic.status === 1} onChange={(e) => setNewTopic({ ...newTopic, status: e.target.checked ? 1 : 0 })} color="primary" />
              </Box>
            </Stack>

            {/* CỘT 2: MÔ TẢ CHI TIẾT */}
            <Stack spacing={3}>
              <Typography className={cx('sectionLabel')}>Thông tin bổ sung</Typography>

              <TextField
                className={cx('premiumInput')}
                placeholder="Mô tả chi tiết về chủ đề này..."
                fullWidth
                multiline
                rows={5} // Tăng rows để cân bằng chiều cao với cột 1
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignItems: 'flex-start', mt: 1.5 }}>
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
          <Button variant="contained" className={cx('primaryBtn')}>
            Lưu Topic
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
