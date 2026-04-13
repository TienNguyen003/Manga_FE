import {
  TrendingUpRounded,
  PeopleRounded,
  MenuBookRounded,
  WorkspacePremiumRounded,
  NotificationsNoneRounded,
  CalendarTodayRounded,
  NorthEastRounded,
  SearchRounded,
  MoreHorizRounded,
  BoltRounded,
  ArrowUpwardRounded,
} from '@mui/icons-material';
import { Box, Grid, Paper, Typography, Avatar, Button, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Dashboard.module.scss';

const cx = classNames.bind(styles);

export default function AdminDashboard() {
  return (
    <div className={cx('wrapper')}>
      {/* --- TOP NAVIGATION --- */}
      <nav className={cx('navbar')}>
        <div className={cx('left')}>
          <div className={cx('searchWrapper')}>
            <SearchRounded className={cx('searchIcon')} />
            <input type="text" placeholder="Tìm kiếm nhanh... (⌘K)" className={cx('searchInput')} />
          </div>
        </div>
        <div className={cx('right')}>
          <Tooltip title="Thông báo">
            <IconButton className={cx('notifIcon')}>
              <NotificationsNoneRounded />
            </IconButton>
          </Tooltip>
          <div className={cx('divider')} />
          <div className={cx('userProfile')}>
            <Avatar src="https://i.pravatar.cc/150?u=admin" className={cx('avatar')} />
            <Box>
              <Typography className={cx('userName')}>Duy Nguyễn</Typography>
              <Typography className={cx('userRole')}>Chủ sở hữu</Typography>
            </Box>
          </div>
        </div>
      </nav>

      {/* --- WELCOME HEADER --- */}
      <header className={cx('headerSection')}>
        <div className={cx('text')}>
          <Typography variant="h3" className={cx('title')}>
            Hệ thống tối nay thế nào? <span className={cx('orangeText')}>Duy.</span>
          </Typography>
          <div className={cx('statusTag')}>
            <div className={cx('pulseDot')} />
            <span>Mọi thứ đều ổn định</span>
          </div>
        </div>
        <Button variant="contained" className={cx('primaryBtn')}>
          Thêm nội dung mới
        </Button>
      </header>

      {/* --- BENTO GRID SYSTEM --- */}
      <div className={cx('mainGrid')}>
        {/* Card lớn: Tổng quan tăng trưởng */}
        <div className={cx('bentoBox', 'mainCard')}>
          <div className={cx('cardHeader')}>
            <Typography className={cx('boxTitle')}>Hiệu suất tổng quát</Typography>
            <div className={cx('period')}>Tháng này</div>
          </div>
          <div className={cx('statsGrid')}>
            {[
              { label: 'Người dùng', val: '12.8k', change: '+12.4%', icon: <PeopleRounded /> },
              { label: 'Lượt xem', val: '84.3k', change: '+8.2%', icon: <MenuBookRounded /> },
              { label: 'Doanh thu', val: '45.2M', change: '+2.1%', icon: <TrendingUpRounded /> },
            ].map((stat, i) => (
              <div key={i} className={cx('statItem')}>
                <div className={cx('statIcon')}>{stat.icon}</div>
                <Typography className={cx('statLabel')}>{stat.label}</Typography>
                <Typography className={cx('statValue')}>{stat.val}</Typography>
                <div className={cx('statChange')}>
                  <ArrowUpwardRounded /> {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Nhóm dịch: Danh sách rút gọn */}
        <div className={cx('bentoBox', 'sideCard')}>
          <Typography className={cx('boxTitle')}>Nhóm dịch tiêu biểu</Typography>
          <div className={cx('teamList')}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={cx('teamItem')}>
                <Avatar sx={{ bgcolor: '#ea982b20', color: '#ea982b', fontWeight: 700 }}>T{i}</Avatar>
                <div className={cx('tInfo')}>
                  <Typography className={cx('tName')}>Nhóm dịch số {i}</Typography>
                  <Typography className={cx('tDetail')}>24 chương mới</Typography>
                </div>
                <IconButton size="small">
                  <NorthEastRounded sx={{ fontSize: '1.6rem' }} />
                </IconButton>
              </div>
            ))}
          </div>
        </div>

        {/* Card Huy hiệu: Quảng bá thiết kế mới */}
        <div className={cx('bentoBox', 'badgeCard')}>
          <div className={cx('badgeContent')}>
            <WorkspacePremiumRounded className={cx('iconFloating')} />
            <Typography variant="h5" fontWeight={900}>
              Huy hiệu độc quyền
            </Typography>
            <Typography className={cx('desc')}>Bạn có 12 yêu cầu phê duyệt huy hiệu mới từ người dùng.</Typography>
            <Button className={cx('whiteBtn')}>Xử lý ngay</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
