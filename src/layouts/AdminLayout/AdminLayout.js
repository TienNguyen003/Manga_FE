import { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider } from '@mui/material';
import { DashboardRounded, PeopleRounded, WorkspacePremiumRounded, SettingsRounded, BarChartRounded, LogoutRounded, AdminPanelSettingsRounded, AutoStoriesRounded, GroupWorkRounded, CategoryRounded, CampaignRounded } from '@mui/icons-material';
import classNames from 'classnames/bind';
import styles from './Admin.module.scss';
import paths from '~/routes/paths';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const menuItems = [
  { text: 'Tổng quan', icon: <DashboardRounded />, path: paths.adminDashboard },
  { text: 'Người dùng', icon: <PeopleRounded />, path: paths.userManagement },
  { text: 'Quản lý Huy hiệu', icon: <WorkspacePremiumRounded />, path: paths.badgeManagement },
  { text: 'Quản lý quảng cáo', icon: <CampaignRounded />, path: paths.adManagement },
  { text: 'Quản lý truyện', icon: <AutoStoriesRounded />, path: paths.mangaManagement },
  { text: 'Quản lý nhóm dịch', icon: <GroupWorkRounded />, path: paths.teamManagement },
  { text: 'Quản lý chủ đề', icon: <CategoryRounded />, path: paths.topicManagement },
  { text: 'Thống kê hệ thống', icon: <BarChartRounded />, path: paths.systemStats },
  { text: 'Cài đặt', icon: <SettingsRounded />, path: paths.adminSettings },
];

export default function AdminLayout({ children }) {
  const [activeTab, setActiveTab] = useState('Tổng quan');

  return (
    <Box className={cx('adminWrapper')}>
      {/* SIDEBAR */}
      <aside className={cx('sidebar')}>
        <div className={cx('sidebarHeader')}>
          <AdminPanelSettingsRounded className={cx('logoIcon')} />
          <Typography variant="h6" className={cx('logoText')}>
            Quản lý
          </Typography>
        </div>

        <div className={cx('adminProfile')}>
          <Avatar sx={{ width: 45, height: 45, bgcolor: '#ea982b' }}>A</Avatar>
          <div className={cx('adminInfo')}>
            <Typography className={cx('name')}>Duy Nguyễn</Typography>
            <Typography className={cx('role')}>Super Admin</Typography>
          </div>
        </div>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />

        <nav className={cx('menu')}>
          <List>
            {menuItems.map((item) => (
              <Link to={item.path} key={item.text} style={{ textDecoration: 'none' }}>
                <ListItem key={item.text} disablePadding>
                  <ListItemButton className={cx('menuItem', { active: activeTab === item.text })} onClick={() => setActiveTab(item.text)}>
                    <ListItemIcon className={cx('menuIcon')}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '1.4rem', fontWeight: 600 }} />
                  </ListItemButton>
                </ListItem>
              </Link>
            ))}
          </List>
        </nav>

        <div className={cx('sidebarFooter')}>
          <ListItemButton className={cx('logoutBtn')}>
            <ListItemIcon>
              <LogoutRounded sx={{ color: '#ff4d4d' }} />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất" primaryTypographyProps={{ fontSize: '1.4rem', fontWeight: 600 }} />
          </ListItemButton>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={cx('mainContent')}>
        <header className={cx('topBar')}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {activeTab}
          </Typography>
        </header>
        <section className={cx('pageBody')}>{children}</section>
      </main>
    </Box>
  );
}
