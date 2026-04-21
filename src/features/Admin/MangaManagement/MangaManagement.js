import {
  AddRounded,
  AutoStoriesRounded,
  CategoryRounded,
  DeleteOutlineRounded,
  DescriptionRounded,
  EditRounded,
  ImageRounded,
  LibraryBooksRounded,
  LinkRounded,
  MenuBookRounded,
  PersonRounded,
  SearchRounded,
  StarRounded,
  VisibilityRounded,
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './Manga.module.scss';
import MangaOpsPanel from './MangaOpsPanel';

const cx = classNames.bind(styles);

export default function MangaManagement() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';
  const [activeTab, setActiveTab] = useState('catalog');
  const [mangaList, setMangaList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newManga, setNewManga] = useState({
    title: '',
    slug: '',
    description: '',
    cover: '',
    genre: '',
    userId: '',
  });

  useEffect(() => {
    const loadComics = async () => {
      try {
        const response = await adminService.getComics();
        const data = response?.result || response?.data || response || [];
        setMangaList(Array.isArray(data) ? data : data.items || data.comics || []);
      } catch {
        setMangaList([]);
      }
    };

    loadComics();
  }, []);

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
          <Button variant="contained" startIcon={<AddRounded />} className={cx('primaryBtn')} onClick={() => setOpenModal(true)}>
            Thêm truyện
          </Button>
        </div>
      </header>

      <Paper elevation={0} sx={{ p: 1, mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, next) => setActiveTab(next)}>
          <Tab value="catalog" label="Kho truyện" />
          <Tab value="ops" label="Vận hành nội dung" />
        </Tabs>
      </Paper>

      {activeTab === 'ops' && <MangaOpsPanel />}

      {activeTab === 'catalog' && (
        <TableContainer component={Paper} className={cx('tableWrapper')} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tác phẩm</TableCell>
                <TableCell>Nội dung</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Đánh giá</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mangaList.map((manga, index) => (
                <TableRow key={manga.id} className={cx('tableRow')}>
                  <TableCell>
                    <Box className={cx('mangaInfo')}>
                      <img src={manga.cover && `${IMG_BASE_URL}/${manga.cover}`} alt={manga.title || manga.name || `Manga ${index + 1}`} className={cx('mangaThumb')} />
                      <Box>
                        <Typography className={cx('mangaTitle')}>{manga.title || manga.name || `Manga ${index + 1}`}</Typography>
                        <Typography className={cx('mangaAuthor')}>{manga.author || manga.authorName || '-'}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box className={cx('contentCell')}>
                      <div className={cx('dataItem')}>
                        <AutoStoriesRounded />{' '}
                        <span>
                          <b>{manga.chapters.length || 0}</b> chương
                        </span>
                      </div>
                      <div className={cx('dataItem')}>
                        <VisibilityRounded /> <span>{manga.views || 0} lượt đọc</span>
                      </div>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <div className={cx('statusTag', (manga.status || 'ongoing').toLowerCase())}>
                      <span className={cx('dot')} />
                      {manga.status || 'Ongoing'}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className={cx('ratingBox')}>
                      <StarRounded />
                      <span>{manga.rating || manga.avgRating || 0}</span>
                    </div>
                  </TableCell>

                  <TableCell align="right">
                    <div className={cx('actionGroup')}>
                      <Tooltip title="Quản lý chương">
                        <IconButton size="small" className={cx('btn')}>
                          <LibraryBooksRounded />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa">
                        <IconButton size="small" className={cx('btn')}>
                          <EditRounded />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" className={cx('btn', 'delete')}>
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
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ className: cx('premiumModal') }}>
        <Box className={cx('modalHeader')}>
          <Typography variant="h5" className={cx('modalTitle')}>
            Thêm Manga Mới
          </Typography>
        </Box>

        <DialogContent className={cx('modalBody')}>
          <Box className={cx('formGrid')}>
            {/* CỘT 1: THÔNG TIN CƠ BẢN */}
            <Stack spacing={3}>
              <Typography className={cx('sectionLabel')}>Thông tin cơ bản</Typography>

              <TextField
                className={cx('premiumInput')}
                placeholder="Tên truyện *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MenuBookRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewManga({ ...newManga, title: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Slug (Ví dụ: dao-hai-tac) *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewManga({ ...newManga, slug: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Link ảnh bìa (Cover URL) *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewManga({ ...newManga, cover: e.target.value })}
              />
            </Stack>

            {/* CỘT 2: PHÂN LOẠI & MÔ TẢ */}
            <Stack spacing={3}>
              <Typography className={cx('sectionLabel')}>Phân loại & Tác giả</Typography>

              <TextField
                className={cx('premiumInput')}
                placeholder="Thể loại (Genre) *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewManga({ ...newManga, genre: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="ID người đăng (UserId) *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewManga({ ...newManga, userId: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Mô tả chi tiết"
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
                onChange={(e) => setNewManga({ ...newManga, description: e.target.value })}
              />
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setOpenModal(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button variant="contained" className={cx('primaryBtn')}>
            Lưu Manga
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
