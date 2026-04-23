import {
  DeleteOutlineRounded,
  EditRounded,
  FilterListRounded,
  SearchRounded,
  VisibilityRounded,
  AddRounded,
  ArrowBackRounded,
  TitleRounded,
  NotesRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Dialog,
  DialogContent,
  Stack,
  DialogActions,
} from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './Posts.module.scss';
import { useNavigate, useParams } from 'react-router-dom';
import DataTablePagination from '~/components/common/DataTablePagination';
import paths from '~/routes/paths';
import { toast } from 'react-toastify';
import { communityService } from '~/services/communityService';
import { useUser } from '~/providers/UserContext';
import ConfirmDeleteModal from '~/components/common/ConfirmDeleteModal';

const cx = classNames.bind(styles);

export default function PostManagement() {
  const navigate = useNavigate();
  const id = useParams();
  const { userId } = useUser();
  const [editing, setEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    totalItemsPerPage: 10,
  });
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    topicId: id.id,
  });

  useEffect(() => {
    loadPosts();
  }, [page.currentPage, page.totalItemsPerPage]);

  const loadPosts = async () => {
    try {
      const response = await adminService.getPosts({ topicId: id.id, page: page.currentPage + 1, size: page.totalItemsPerPage });
      const data = response?.result || [];
      const newPage = response?.page || {};
      setPosts(data);
      setPage((prev) => ({
        ...prev,
        totalPages: newPage.totalPages || 0,
        totalItems: newPage.totalItems || 0,
      }));
    } catch {
      setPosts([]);
    }
  };

  const handleSavePost = async () => {
    try {
      if (editing) {
        await communityService.updatePost(newPost.id, newPost);
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await communityService.createPost(userId, newPost);
        toast.success('Đăng bài viết thành công!');
      }
      setOpenModal(false);
      setEditing(false);
      loadPosts();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleEditPost = async (postId) => {
    try {
      const response = await communityService.getPostById(postId);
      setNewPost(response.result);
      setEditing(true);
      setOpenModal(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await communityService.deletePost(postId);
      toast.success('Xóa bài viết thành công!');
      loadPosts();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className={cx('postWrapper')}>
      <Box className={cx('header')}>
        <div className={cx('leftBar')}>
          <IconButton className={cx('backBtn')} onClick={() => navigate(-1)}>
            <ArrowBackRounded />
          </IconButton>
          <Box>
            <Typography className={cx('mainTitle')}>Quản lý Bài viết</Typography>
            <Typography className={cx('subTitle')}>Theo dõi, chỉnh sửa và điều phối nội dung cộng đồng.</Typography>
          </Box>
        </div>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          className={cx('primaryBtn')}
          onClick={() => {
            setNewPost({ topicId: id.id });
            setOpenModal(true);
          }}
        >
          Viết bài mới
        </Button>
      </Box>

      <Paper className={cx('filterCard')} elevation={0}>
        <div className={cx('controls')}>
          <TextField
            placeholder="Tìm theo tiêu đề hoặc tác giả..."
            size="small"
            className={cx('searchBar')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" startIcon={<FilterListRounded />} className={cx('filterBtn')}>
            Lọc nội dung
          </Button>
        </div>
      </Paper>

      <TableContainer component={Paper} className={cx('tableContainer')} elevation={0}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className={cx('headCell')}>Tiêu đề bài viết</TableCell>
              <TableCell className={cx('headCell')}>Tác giả</TableCell>
              <TableCell className={cx('headCell')}>Thống kê</TableCell>
              <TableCell className={cx('headCell')}>Ngày xuất bản</TableCell>
              <TableCell className={cx('headCell')} align="right">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post, index) => (
              <TableRow key={post.id} className={cx('tableRow')}>
                <TableCell className={cx('titleCell')}>
                  <Typography className={cx('postTitle')}>{post.title || `Post ${index + 1}`}</Typography>
                </TableCell>
                <TableCell>
                  <Typography className={cx('authorName')}>{post.author?.name || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography className={cx('viewCount')}>{post.reactions?.length || 0}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Lượt thích
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell className={cx('dateCell')}>{new Date(post.createdAt).toLocaleString('vi-VN') || '-'}</TableCell>
                <TableCell align="right">
                  <div className={cx('actionGroup')}>
                    <Tooltip title="Xem trước">
                      <IconButton className={cx('viewBtn')} size="small" onClick={() => navigate(paths.postDetail.replaceAll(':id', post.id))}>
                        <VisibilityRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton className={cx('editBtn')} size="small" onClick={() => handleEditPost(post.id)}>
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa bài">
                      <IconButton
                        className={cx('deleteBtn')}
                        size="small"
                        onClick={() => {
                          setIsDeleteOpen(true);
                          setNewPost(post);
                        }}
                      >
                        <DeleteOutlineRounded fontSize="small" />
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
            {editing ? 'Cập nhật bài viết' : 'Tạo bài viết mới'}
          </Typography>
        </Box>

        <DialogContent className={cx('modalBody')}>
          {/* Dùng 1 cột (Stack) để phần content có không gian rộng rãi */}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography className={cx('sectionLabel')}>Nội dung bài viết</Typography>

            {/* TRƯỜNG: TITLE */}
            <TextField
              className={cx('premiumInput')}
              placeholder="Tiêu đề bài viết *"
              value={newPost.title}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />

            {/* TRƯỜNG: CONTENT */}
            <TextField
              className={cx('premiumInput')}
              placeholder="Nhập nội dung bài viết ở đây..."
              value={newPost.content}
              fullWidth
              multiline
              rows={10} // Tăng số dòng để giống form soạn thảo bài viết hơn
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <NotesRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            />
          </Stack>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setOpenModal(false)} className={cx('textBtn')}>
            Hủy
          </Button>
          <Button variant="contained" className={cx('primaryBtn')} onClick={handleSavePost}>
            {editing ? 'Cập nhật' : 'Đăng bài'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          handleDeletePost(newPost.id);
          setIsDeleteOpen(false);
        }}
        title="Xác nhận xóa bài viết"
        content={`Bạn có chắc chắn muốn xóa bài viết <strong>${newPost.title}</strong>? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}
