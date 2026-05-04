import {
  AddModeratorRounded,
  DeleteOutlineRounded,
  LibraryBooksRounded,
  ModeEditOutlineRounded,
  SettingsSuggestRounded,
  TimelineRounded,
  TrendingUpRounded,
} from '@mui/icons-material';
import { Avatar, Box, Button, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import { useUser } from '~/providers/UserContext';
import { comicService } from '~/services/comicService';
import paths from '~/routes/paths';
import styles from './MyComics.module.scss';

const cx = classNames.bind(styles);

export default function MyComics() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';
  const { userId } = useUser();
  const [list, setList] = useState([]);

  const getMyComics = async () => {
    if (!userId) return;
    try {
      const response = await comicService.getMyComics({ userId });
      setList(response.result || []);
    } catch (error) {
      toast.error('Không thể tải danh sách tác phẩm của bạn');
    }
  };

  useEffect(() => {
    getMyComics();
  }, [userId]);

  // Xử lý hiển thị Status (thay dấu cách bằng gạch dưới cho CSS class)
  const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/\s+/g, '_');
  };

  return (
    <Box className={cx('pageWrapper')}>
      {/* Header Studio Dark Mode */}
      <header className={cx('header')}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack>
              <Typography className={cx('superTitle')}>Creator Studio</Typography>
              <Typography className={cx('mainTitle')}>Xưởng Sáng Tác</Typography>
            </Stack>
            <Link to={paths.upload}>
              <Button variant="contained" disableElevation className={cx('btnPrimary')} startIcon={<AddModeratorRounded />}>
                Đăng truyện mới
              </Button>
            </Link>
          </Stack>
        </Container>
      </header>

      <Container maxWidth="lg">
        {/* List Content */}
        <Box className={cx('listContainer')}>
          <div className={cx('listHeader')}>
            <span className={cx('col')}>Tác phẩm</span>
            <span className={cx('col')}>Trạng thái</span>
            <span className={cx('col')}>Hiệu suất</span>
            <span className={cx('col', 'center')}>Thao tác</span>
          </div>

          <Stack spacing={0}> {/* Đổi spacing thành 0 để tự quản lý border */}
            {list.length === 0 && (
              <Box className={cx('emptyState')}>
                <Typography className={cx('emptyTitle')}>Chưa có tác phẩm nào</Typography>
                <Typography className={cx('emptyText')}>Khi bạn tạo truyện mới, toàn bộ thông tin sẽ xuất hiện ở đây.</Typography>
                <Link to={paths.upload}>
                  <Button variant="outlined" className={cx('btnPrimary')} startIcon={<AddModeratorRounded />}>
                    Bắt đầu ngay
                  </Button>
                </Link>
              </Box>
            )}
            
            {list.map((item) => (
              <Box key={item.id} className={cx('comicRow')}>
                {/* Info Column */}
                <Box className={cx('col', 'mainCol')}>
                  <Avatar 
                    src={IMG_BASE_URL + item.cover} 
                    variant="rounded" 
                    className={cx('miniCover')} 
                  />
                  <Box>
                    <Typography className={cx('itemTitle')}>{item.title}</Typography>
                    <Typography className={cx('itemDesc')}>{item.description}</Typography>
                    <Typography className={cx('itemGenre')}>{item.genre}</Typography>
                  </Box>
                </Box>

                {/* Status Column */}
                <Box className={cx('col')}>
                  <div className={cx('badge', formatStatus(item.status))}>
                    <span className={cx('dot')} />
                    {item.status || 'Chưa rõ'}
                  </div>
                </Box>

                {/* Stats Column */}
                <Box className={cx('col')}>
                  <Stack direction="row" spacing={1}>
                    <Box className={cx('statBox')}>
                      <TrendingUpRounded sx={{ fontSize: '1.4rem' }} /> <span>{item.views || 0}</span>
                    </Box>
                    <Box className={cx('statBox')}>
                      <LibraryBooksRounded sx={{ fontSize: '1.4rem' }} /> <span>{item.chapters || 0}</span>
                    </Box>
                  </Stack>
                </Box>

                {/* Action Column */}
                <Box className={cx('col', 'actions')}>
                  <Tooltip title="Thống kê">
                    <IconButton className={cx('iconBtn')}>
                      <TimelineRounded />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <Link to={`${paths.upload}?comicId=${item.id}`} style={{ display: 'flex' }}>
                      <IconButton className={cx('iconBtn')}>
                        <ModeEditOutlineRounded />
                      </IconButton>
                    </Link>
                  </Tooltip>
                  <Tooltip title="Cài đặt">
                    <IconButton className={cx('iconBtn')}>
                      <SettingsSuggestRounded />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa truyện">
                    <IconButton className={cx('iconBtn', 'delete')}>
                      <DeleteOutlineRounded />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}