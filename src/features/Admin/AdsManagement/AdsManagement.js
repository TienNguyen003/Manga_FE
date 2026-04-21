import {
  AddRounded,
  AdsClickRounded,
  VisibilityRounded,
  TrendingUpRounded,
  EditRounded,
  DeleteOutlineRounded,
  TitleRounded,
  ImageRounded,
  LinkRounded,
  CalendarMonthRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  InputAdornment,
  Switch,
} from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { adminService } from '~/services/adminService';
import styles from './Ads.module.scss';

const cx = classNames.bind(styles);

export default function AdsManagement() {
  const [ads, setAds] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  // State theo đúng cấu trúc dữ liệu yêu cầu
  const [newAd, setNewAd] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    isActive: 1,
    startAt: '',
    endAt: '',
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const response = await adminService.getAds('');
      const data = response?.result || response?.data || response || [];
      setAds(Array.isArray(data) ? data : data.items || data.ads || []);
    } catch {
      setAds([]);
    }
  };

  return (
    <div className={cx('pageContainer')}>
      {/* --- HEADER --- */}
      <header className={cx('pageHeader')}>
        <Box>
          <Typography variant="h4" className={cx('pageTitle')}>
            Quản lý Quảng cáo
          </Typography>
          <Typography className={cx('pageSubtitle')}>Theo dõi hiệu suất và tối ưu hóa doanh thu chiến dịch.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} className={cx('primaryBtn')} onClick={() => setOpenModal(true)}>
          Chiến dịch mới
        </Button>
      </header>

      {/* --- STATS GRID (Bento Style) --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { lbl: 'Lượt Click', val: ads.reduce((sum, ad) => sum + Number(ad.clicks || 0), 0).toLocaleString(), icon: <AdsClickRounded />, color: '#3b82f6' },
          { lbl: 'Hiển thị', val: ads.reduce((sum, ad) => sum + Number(ad.views || 0), 0).toLocaleString(), icon: <VisibilityRounded />, color: '#10b981' },
          { lbl: 'CTR Trung bình', val: '2.4%', icon: <TrendingUpRounded />, color: '#ea982b' },
        ].map((s, i) => (
          <Grid item size={{ xs: 12, sm: 4 }} key={i}>
            <Paper sx={{ p: 3, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #f1f5f9' }} elevation={0}>
              <div style={{ color: s.color, backgroundColor: `${s.color}15`, padding: '12px', borderRadius: '12px', display: 'flex' }}>{s.icon}</div>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.5rem' }}>{s.val}</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '1.2rem' }}>{s.lbl}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* --- TABLE AREA --- */}
      <TableContainer component={Paper} className={cx('tableCard')} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Chiến dịch</TableCell>
              <TableCell>Hiệu suất</TableCell>
              <TableCell>CTR</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map((ad, index) => (
              <TableRow key={ad.id} className={cx('tableRow')}>
                <TableCell>
                  <Box className={cx('badgeInfoCell')}>
                    <img src={ad.imageUrl || 'https://via.placeholder.com/150'} alt={ad.title} className={cx('badgeAvatar')} />
                    <Box>
                      <Typography className={cx('badgeName')}>{ad.title || `Ad ${index + 1}`}</Typography>
                      <Typography className={cx('badgeDesc')}>{ad.targetUrl}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: '1.4rem' }}>
                    <b>{ad.clicks || 0}</b> clks / <b>{ad.views || 0}</b> views
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 700, color: '#ea982b', fontSize: '1.4rem' }}>{ad.ctr || '0%'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={ad.isActive ? 'Active' : 'Inactive'}
                    sx={{ fontWeight: 600, bgcolor: ad.isActive ? '#ecfdf5' : '#fef2f2', color: ad.isActive ? '#10b981' : '#ef4444' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Sửa">
                      <IconButton size="small" className={cx('actionBtn', 'edit')}>
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" className={cx('actionBtn', 'delete')}>
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

      {/* --- MODAL (Đồng nhất cấu hình 2 cột) --- */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ className: cx('premiumModal') }}>
        <Box className={cx('modalHeader')}>
          <Typography variant="h5" className={cx('modalTitle')}>
            Tạo chiến dịch mới
          </Typography>
        </Box>

        <DialogContent className={cx('modalBody')}>
          <Box className={cx('formGrid')}>
            {/* CỘT 1: NỘI DUNG */}
            <Stack spacing={3}>
              <Typography className={cx('sectionLabel')}>Thông tin quảng cáo</Typography>

              <TextField
                className={cx('premiumInput')}
                placeholder="Tiêu đề chiến dịch *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Link hình ảnh (URL) *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
              />

              <TextField
                className={cx('premiumInput')}
                placeholder="Link đích (Target URL) *"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => setNewAd({ ...newAd, targetUrl: e.target.value })}
              />
            </Stack>

            {/* CỘT 2: CẤU HÌNH THỜI GIAN */}
            <Stack spacing={3}>
              <Typography className={cx('sectionLabel')}>Cài đặt hiển thị</Typography>

              <TextField
                label="Ngày bắt đầu"
                type="datetime-local"
                fullWidth
                className={cx('premiumInput')}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setNewAd({ ...newAd, startAt: e.target.value })}
              />

              <TextField
                label="Ngày kết thúc"
                type="datetime-local"
                fullWidth
                className={cx('premiumInput')}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setNewAd({ ...newAd, endAt: e.target.value })}
              />

              <Box className={cx('switchCard')}>
                <Box>
                  <Typography className={cx('switchTitle')}>Trạng thái kích hoạt</Typography>
                  <Typography className={cx('switchDesc')}>Cho phép quảng cáo hiển thị ngay</Typography>
                </Box>
                <Switch checked={newAd.isActive === 1} onChange={(e) => setNewAd({ ...newAd, isActive: e.target.checked ? 1 : 0 })} color="primary" />
              </Box>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions className={cx('modalFooter')}>
          <Button onClick={() => setOpenModal(false)} className={cx('textBtn')}>
            Hủy bỏ
          </Button>
          <Button variant="contained" className={cx('primaryBtn')}>
            Lưu chiến dịch
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
