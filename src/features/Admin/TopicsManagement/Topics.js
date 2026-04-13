import { AddRounded, DeleteOutlineRounded, DynamicFeedRounded, EditRounded, LinkRounded, TagRounded } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Topics.module.scss';

const cx = classNames.bind(styles);

export default function TopicManagement() {
  const topics = [
    { id: 1, name: 'Hành động', slug: 'action', postCount: 156, status: 'Active' },
    { id: 2, name: 'Tình cảm', slug: 'romance', postCount: 89, status: 'Active' },
    { id: 3, name: 'Kinh dị', slug: 'horror', postCount: 42, status: 'Hidden' },
  ];

  return (
    <div className={cx('pageContainer')}>
      {/* --- HEADER --- */}
      <header className={cx('header')}>
        <Box>
          <Typography className={cx('title')}>Quản lý Topic</Typography>
          <Typography className={cx('subtitle')}>Phân loại nội dung và tối ưu cấu trúc đường dẫn (SEO).</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} className={cx('addBtn')}>
          Thêm Topic mới
        </Button>
      </header>

      {/* --- TABLE AREA --- */}
      <TableContainer component={Paper} className={cx('tableWrapper')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>TÊN THỂ LOẠI</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>ĐƯỜNG DẪN (SLUG)</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>THỐNG KÊ</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>TRẠNG THÁI</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">
                HÀNH ĐỘNG
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('topicNameCell')}>
                    <div className={cx('tagIcon')}>
                      <TagRounded />
                    </div>
                    <Typography className={cx('nameText')}>{topic.name}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box className={cx('slugCell')}>
                    <LinkRounded className={cx('linkIcon')} />
                    <span>/{topic.slug}</span>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography className={cx('countText')}>
                    <b>{topic.postCount}</b> bài viết
                  </Typography>
                </TableCell>

                <TableCell>
                  <div className={cx('statusTag', topic.status.toLowerCase())}>
                    <span className={cx('dot')} />
                    {topic.status === 'Active' ? 'Hiển thị' : 'Đang ẩn'}
                  </div>
                </TableCell>

                <TableCell align="right">
                  <div className={cx('actionGroup')}>
                    <Button startIcon={<DynamicFeedRounded />} variant="contained" className={cx('viewBtn')}>
                      Xem Posts
                    </Button>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" className={cx('iconBtn')}>
                        <EditRounded />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" className={cx('iconBtn', 'delete')}>
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
    </div>
  );
}
