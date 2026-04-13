import { DeleteOutlineRounded, EditRounded, FilterListRounded, SearchRounded, VisibilityRounded, AddRounded } from '@mui/icons-material';
import { Box, Button, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Posts.module.scss';

const cx = classNames.bind(styles);

export default function PostManagement() {
  const posts = [
    { id: 1, title: 'Top 10 Manga hành động đáng đọc 2026', author: 'Admin Duy', topic: 'Hành động', views: '12.5k', date: '10/04/2026' },
    { id: 2, title: 'Review chi tiết bộ truyện Berserk', author: 'Editor A', topic: 'Kinh dị', views: '8.2k', date: '08/04/2026' },
    { id: 3, title: 'Lịch phát hành One Piece tháng 5', author: 'Mod Zen', topic: 'Tin tức', views: '15.0k', date: '12/04/2026' },
  ];

  return (
    <div className={cx('postWrapper')}>
      <Box className={cx('header')}>
        <Box>
          <Typography className={cx('mainTitle')}>Quản lý Bài viết</Typography>
          <Typography className={cx('subTitle')}>Theo dõi, chỉnh sửa và điều phối nội dung cộng đồng.</Typography>
        </Box>
        
        <Button variant="contained" startIcon={<AddRounded />} className={cx('createBtn')}>
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
              <TableCell className={cx('headCell')}>Chủ đề</TableCell>
              <TableCell className={cx('headCell')}>Thống kê</TableCell>
              <TableCell className={cx('headCell')}>Ngày xuất bản</TableCell>
              <TableCell className={cx('headCell')} align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id} className={cx('tableRow')}>
                <TableCell className={cx('titleCell')}>
                  <Typography className={cx('postTitle')}>{post.title}</Typography>
                </TableCell>
                <TableCell>
                  <Typography className={cx('authorName')}>{post.author}</Typography>
                </TableCell>
                <TableCell>
                  <span className={cx('topicTag', post.topic.toLowerCase())}>{post.topic}</span>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography className={cx('viewCount')}>{post.views}</Typography>
                    <Typography variant="caption" color="textSecondary">Lượt xem</Typography>
                  </Box>
                </TableCell>
                <TableCell className={cx('dateCell')}>{post.date}</TableCell>
                <TableCell align="right">
                  <div className={cx('actionGroup')}>
                    <Tooltip title="Xem trước">
                      <IconButton className={cx('viewBtn')} size="small">
                        <VisibilityRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton className={cx('editBtn')} size="small">
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa bài">
                      <IconButton className={cx('deleteBtn')} size="small">
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
    </div>
  );
}