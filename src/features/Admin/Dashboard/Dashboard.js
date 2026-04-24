import {
  ArrowUpwardRounded,
  BoltRounded,
  CalendarTodayRounded,
  MenuBookRounded,
  NorthEastRounded,
  NotificationsNoneRounded,
  PeopleRounded,
  SearchRounded,
  TrendingUpRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material';
import { Avatar, Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';
import { adminService } from '~/services/adminService';
import styles from './Dashboard.module.scss';

const cx = classNames.bind(styles);

export default function AdminDashboard() {
  const [totals, setTotals] = useState(null);
  const [searchResults, setSearchResults] = useState({ users: [], comics: [], posts: [] });
  const [keyword, setKeyword] = useState('');
  const [teams, setTeams] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { userData } = useUser();
  const searchRef = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadOverview();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [keyword]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadOverview = async () => {
    try {
      const response = await adminService.getDashboardOverview(keyword);
      const data = response?.result || {};
      setTotals(data.totals || {});
      setSearchResults(data.quickSearch || { users: [], comics: [], posts: [] });
      setTeams(data.teams || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra khi tải dữ liệu.');
    }
  };

  const kpis = [
    { label: 'Người dùng', val: totals?.users || '0', change: '+5%', icon: <PeopleRounded /> },
    { label: 'Truyện tranh', val: totals?.comics || '0', change: '+2', icon: <MenuBookRounded /> },
    { label: 'Nhóm dịch', val: totals?.teams || '0', change: 'Ổn định', icon: <WorkspacePremiumRounded /> },
    { label: 'Bài viết', val: totals?.posts || '0', change: 'Mới', icon: <CalendarTodayRounded /> },
    { label: 'Quảng cáo', val: totals?.activeAds || '0', change: 'Đang chạy', icon: <TrendingUpRounded /> },
    { label: 'Đang online', val: totals?.onlineSessions || '0', change: 'Hiện tại', icon: <BoltRounded /> },
  ];

  const hasResults = searchResults.users?.length > 0 || searchResults.comics?.length > 0 || searchResults.posts?.length > 0;

  return (
    <div className={cx('wrapper')}>
      <nav className={cx('navbar')}>
        <div className={cx('left')}>
          <div className={cx('searchContainer')} ref={searchRef}>
            <div className={cx('searchWrapper', { active: isSearchOpen })}>
              <SearchRounded className={cx('searchIcon')} />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh... (⌘K)"
                className={cx('searchInput')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
              />
            </div>
            {isSearchOpen && keyword && (
              <div className={cx('searchDropdown')}>
                {hasResults ? (
                  <>
                    {searchResults.users?.length > 0 && (
                      <div className={cx('resultGroup')}>
                        <Typography className={cx('groupTitle')}>Người dùng</Typography>
                        {searchResults.users.slice(0, 2).map((u) => (
                          <Link to={paths.publicProfile.replace(':id', u.id)} key={u.id}>
                            <div className={cx('resultItem')}>
                              <Typography>{u.name}</Typography>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.comics?.length > 0 && (
                      <div className={cx('resultGroup')}>
                        <Typography className={cx('groupTitle')}>Truyện tranh</Typography>
                        {searchResults.comics.slice(0, 3).map((c) => (
                          <Link to={`${paths.mangaDetail}?slug=${c.slug}`} key={c.id}>
                            <div className={cx('resultItem')}>
                              <Typography>{c.title}</Typography>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.posts?.length > 0 && (
                      <div className={cx('resultGroup')}>
                        <Typography className={cx('groupTitle')}>Bài viết</Typography>
                        {searchResults.posts.slice(0, 3).map((p) => (
                          <Link to={paths.postDetail.replace(':id', p.id)} key={p.id}>
                            <div className={cx('resultItem')}>
                              <Typography>{p.title}</Typography>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={cx('noResult')}>Không tìm thấy kết quả</div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className={cx('right')}>
          <Tooltip title="Thông báo">
            <IconButton>
              <NotificationsNoneRounded />
            </IconButton>
          </Tooltip>
          <div className={cx('divider')} />
          <div className={cx('userProfile')}>
            <Avatar src={userData?.urlImage} alt={userData?.name} className={cx('avatar')} />
            <Box>
              <Typography className={cx('userName')}>{userData?.name}</Typography>
              <Typography className={cx('userRole')}>{userData?.role?.name}</Typography>
            </Box>
          </div>
        </div>
      </nav>

      <header className={cx('headerSection')}>
        <div className={cx('text')}>
          <Typography variant="h3" className={cx('title')}>
            Hệ thống tối nay thế nào? <span className={cx('orangeText')}>{userData?.name}.</span>
          </Typography>
          <div className={cx('statusTag')}>
            <div className={cx('pulseDot')} />
            <span>Mọi thứ đều ổn định</span>
          </div>
        </div>
        {/* <Button variant="contained" className={cx('primaryBtn')}>
          Thêm nội dung mới
        </Button> */}
      </header>

      <div className={cx('mainGrid')}>
        <div className={cx('bentoBox', 'mainCard')}>
          <Typography className={cx('boxTitle')}>Hiệu suất tổng quát</Typography>
          <div className={cx('statsGrid')}>
            {kpis.map((s, i) => (
              <div key={i} className={cx('statItem')}>
                <div className={cx('statIcon')}>{s.icon}</div>
                <Typography className={cx('statLabel')}>{s.label}</Typography>
                <Typography className={cx('statValue')}>{s.val}</Typography>
                <div className={cx('statChange')}>
                  <ArrowUpwardRounded /> {s.change}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className={cx('bentoBox', 'sideCard')}>
            <Typography className={cx('boxTitle')}>Nhóm dịch tiêu biểu</Typography>
            <div className={cx('teamList')}>
              {teams.map((team, i) => (
                <div key={team.id || i} className={cx('teamItem')}>
                  <Avatar src={team.avatar} alt={team.name}></Avatar>
                  <div className={cx('tInfo')}>
                    <Typography className={cx('tName')}>{team.name || `Nhóm dịch số ${i + 1}`}</Typography>
                    <Typography className={cx('tDetail')}>{team.description || `${team.countMembers ?? 0} thành viên`}</Typography>
                  </div>
                  <Link to={paths.teamProfile.replace(':id', team.id)}>
                    <IconButton size="small">
                      <NorthEastRounded sx={{ fontSize: '1.6rem' }} />
                    </IconButton>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={cx('bentoBox', 'badgeCard')}>
          <div className={cx('badgeContent')}>
            <WorkspacePremiumRounded className={cx('iconFloating')} />
            <Typography variant="h5" fontWeight={900}>
              Huy hiệu độc quyền
            </Typography>
            <Typography className={cx('desc')}>Bạn có {totals?.pendingReports || 0} báo cáo đang chờ xử lý.</Typography>
            <Button className={cx('whiteBtn')}>Xử lý ngay</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
