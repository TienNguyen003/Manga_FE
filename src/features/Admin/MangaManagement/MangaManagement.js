import { 
  AddRounded, DeleteOutlineRounded, EditRounded, LibraryBooksRounded, 
  SearchRounded, VisibilityRounded, StarRounded, AutoStoriesRounded 
} from '@mui/icons-material';
import { 
  Avatar, Box, Button, Chip, IconButton, InputAdornment, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TextField, Typography, Tooltip 
} from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Manga.module.scss';

const cx = classNames.bind(styles);

export default function MangaManagement() {
  const mangaList = [
    { id: 1, title: 'Berserk', author: 'Kentaro Miura', chapters: 364, status: 'Ongoing', rating: 4.9, views: '1.2M', thumb: 'https://i.pinimg.com/564x/01/f9/0a/01f90a8f8d6896173df52f9c8f85f16c.jpg' },
    { id: 2, title: 'Vagabond', author: 'Takehiko Inoue', chapters: 327, status: 'Hiatus', rating: 4.8, views: '850k', thumb: 'https://i.pinimg.com/564x/93/6d/4e/936d4e287498c0d12e694553250e390c.jpg' },
    { id: 3, title: 'One Piece', author: 'Eiichiro Oda', chapters: 1100, status: 'Ongoing', rating: 4.9, views: '5.6M', thumb: 'https://i.pinimg.com/564x/93/e3/3e/93e33e14479532585292a832f0524458.jpg' },
  ];

  return (
    <div className={cx('mangaWrapper')}>
      {/* --- HEADER --- */}
      <header className={cx('header')}>
        <div className={cx('titleSection')}>
          <Typography className={cx('title')}>Quản lý Kho truyện</Typography>
          <div className={cx('statsBadge')}>Tổng {mangaList.length} tác phẩm</div>
        </div>
        
        <div className={cx('actions')}>
          <div className={cx('searchGroup')}>
            <SearchRounded className={cx('searchIcon')} />
            <input type="text" placeholder="Tìm tên truyện, tác giả..." className={cx('customInput')} />
          </div>
          <Button variant="contained" startIcon={<AddRounded />} className={cx('addBtn')}>
            Thêm truyện
          </Button>
        </div>
      </header>

      {/* --- TABLE --- */}
      <TableContainer component={Paper} className={cx('tableWrapper')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>TÁC PHẨM</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>NỘI DUNG</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>TRẠNG THÁI</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>ĐÁNH GIÁ</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">THAO TÁC</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mangaList.map((manga) => (
              <TableRow key={manga.id} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('mangaInfo')}>
                    <img src={manga.thumb} alt={manga.title} className={cx('mangaThumb')} />
                    <Box>
                      <Typography className={cx('mangaTitle')}>{manga.title}</Typography>
                      <Typography className={cx('mangaAuthor')}>{manga.author}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box className={cx('contentCell')}>
                    <div className={cx('dataItem')}>
                      <AutoStoriesRounded /> <span><b>{manga.chapters}</b> chương</span>
                    </div>
                    <div className={cx('dataItem')}>
                      <VisibilityRounded /> <span>{manga.views} lượt đọc</span>
                    </div>
                  </Box>
                </TableCell>

                <TableCell>
                  <div className={cx('statusTag', manga.status.toLowerCase())}>
                    <span className={cx('dot')} />
                    {manga.status}
                  </div>
                </TableCell>

                <TableCell>
                  <div className={cx('ratingBox')}>
                    <StarRounded />
                    <span>{manga.rating}</span>
                  </div>
                </TableCell>

                <TableCell align="right">
                  <div className={cx('actionGroup')}>
                    <Tooltip title="Quản lý chương"><IconButton size="small" className={cx('btn')}><LibraryBooksRounded /></IconButton></Tooltip>
                    <Tooltip title="Sửa"><IconButton size="small" className={cx('btn')}><EditRounded /></IconButton></Tooltip>
                    <Tooltip title="Xóa"><IconButton size="small" className={cx('btn', 'delete')}><DeleteOutlineRounded /></IconButton></Tooltip>
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