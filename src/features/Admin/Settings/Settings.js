import { SaveRounded, LanguageRounded, SecurityRounded, NotificationsRounded, ConstructionRounded } from '@mui/icons-material';
import { Box, Button, Divider, FormControlLabel, Paper, Switch, TextField, Typography, Grid } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Settings.module.scss';

const cx = classNames.bind(styles);

export default function AdminSettings() {
  return (
    <div className={cx('pageContainer')}>
      {/* --- HEADER --- */}
      <header className={cx('header')}>
        <Box>
          <Typography className={cx('title')}>Cài Đặt Hệ Thống</Typography>
          <Typography className={cx('subtitle')}>Quản lý cấu hình website và thiết lập bảo mật cấp cao.</Typography>
        </Box>
      </header>

      <Paper className={cx('settingsTile')} elevation={0}>
        {/* --- SECTION 1: GENERAL --- */}
        <section className={cx('section')}>
          <div className={cx('sectionHeader')}>
            <LanguageRounded className={cx('icon')} />
            <Typography className={cx('sectionTitle')}>Cấu hình chung</Typography>
          </div>
          
          <Grid container spacing={3} sx={{ display: 'flex', flexWrap: 'wrap !important' }} className={cx('formGroup')}>
            <Grid item size={6}>
              <TextField 
                fullWidth 
                label="Tên Website" 
                defaultValue="Duy Manga Dashboard" 
                variant="outlined"
                className={cx('customInput')}
              />
            </Grid>
            <Grid item size={6}>
              <TextField 
                fullWidth 
                label="Email hệ thống" 
                defaultValue="admin@duy.system" 
                variant="outlined" 
                className={cx('customInput')}
              />
            </Grid>
            <Grid item size={12}>
              <TextField 
                fullWidth 
                multiline 
                rows={2} 
                label="Mô tả website (SEO Meta)" 
                defaultValue="Hệ thống quản lý kho truyện và khóa học chuyên nghiệp." 
                variant="outlined" 
                className={cx('customInput')}
              />
            </Grid>
          </Grid>
        </section>

        <Divider className={cx('divider')} />

        {/* --- SECTION 2: FEATURES & SECURITY --- */}
        <section className={cx('section')}>
          <div className={cx('sectionHeader')}>
            <SecurityRounded className={cx('icon')} />
            <Typography className={cx('sectionTitle')}>Tính năng & Bảo mật</Typography>
          </div>

          <div className={cx('switchGrid')}>
            {[
              { label: 'Cho phép đăng ký thành viên', desc: 'Người dùng mới có thể tạo tài khoản.', defaultChecked: true },
              { label: 'Chế độ bảo trì (Maintenance)', desc: 'Tạm khóa toàn bộ truy cập từ phía người dùng.', defaultChecked: false },
              { label: 'Xác thực 2 lớp (2FA)', desc: 'Bắt buộc Admin phải xác thực qua App/Email.', defaultChecked: true },
              { label: 'Tự động sao lưu dữ liệu', desc: 'Backup database hàng ngày vào lúc 02:00 AM.', defaultChecked: true }
            ].map((item, idx) => (
              <Box key={idx} className={cx('switchItem')}>
                <div className={cx('switchInfo')}>
                  <Typography className={cx('switchLabel')}>{item.label}</Typography>
                  <Typography className={cx('switchDesc')}>{item.desc}</Typography>
                </div>
                <Switch 
                  defaultChecked={item.defaultChecked} 
                  className={cx('customSwitch')} 
                />
              </Box>
            ))}
          </div>
        </section>

        {/* --- ACTIONS --- */}
        <footer className={cx('actions')}>
          <Typography className={cx('lastUpdate')}>Cập nhật lần cuối: 10 phút trước</Typography>
          <Button variant="contained" startIcon={<SaveRounded />} className={cx('saveBtn')}>
            Lưu tất cả thay đổi
          </Button>
        </footer>
      </Paper>
    </div>
  );
}