import classNames from 'classnames/bind';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { connectStomp, WS_TOPICS, subscribe as wsSubscribe } from '~/lib/realtime';
import { unwrapList } from '~/lib/httpRequest';
import { useMembership } from '~/hooks/useMembership';
import { useReaderStats } from '~/providers/ReaderStatsProvider';
import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';
import { getCategories } from '~/services/mangaService';
import { getUnreadCount } from '~/services/notificationService';
import styles from './header.module.scss';

const cx = classNames.bind(styles);

export default function Header() {
  const menuRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, unreadCount, setUnreadCount, logout, userData } = useUser();
  const { streak } = useReaderStats();
  const { isPremium, balance } = useMembership();
  const [categories, setCategories] = useState([]);

  const refreshUnreadCount = useCallback(() => {
    if (!userId) return;
    getUnreadCount(userId)
      .then(({ data }) => {
        return setUnreadCount(Number(data?.result ?? 0));
      })
      .catch(() => {});
  }, [userId, setUnreadCount]);

  useEffect(() => {
    getCategories()
      .then(({ data }) => {
        setCategories(unwrapList({ data }));
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // Lấy số thông báo chưa đọc khi đăng nhập
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Realtime notification badge.
  // Rule 6: subscribe AFTER sign-in and unsubscribe on unmount. Disconnecting the
  // whole shared socket here would also kill the reader's comment subscriptions.
  useEffect(() => {
    if (!userId) return undefined;

    connectStomp();
    const subscriptions = [
      wsSubscribe(WS_TOPICS.notifications(userId), refreshUnreadCount),
      wsSubscribe(WS_TOPICS.login, refreshUnreadCount),
      wsSubscribe(WS_TOPICS.updateStatus, refreshUnreadCount),
    ];

    return () => subscriptions.forEach((s) => s?.unsubscribe());
  }, [userId, refreshUnreadCount]);

  const handleToggleMenu = () => {
    menuRef.current.classList.toggle(`${cx('active')}`);
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest(`.${cx('profile')}`)) {
        menuRef.current.classList.remove(`${cx('active')}`);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
    };
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const input = document.querySelector(`.${cx('input_search')}`);
    const keyword = input?.value?.trim();
    if (!keyword) return;
    const path = `${paths.category}?search=${keyword}`;
    navigate(path);
  };

  const navItems = [
    { to: paths.home, label: 'Trang chủ' },
    { to: paths.discover, label: 'Khám phá' },
    { to: paths.rankings, label: 'Bảng xếp hạng' },
    { to: paths.community, label: 'Cộng đồng' },
    { to: paths.authorHub, label: 'Nhóm dịch' },
    { to: paths.library, label: 'Thư viện' },
  ];

  const isCurrentPath = (targetPath) => {
    if (targetPath === paths.home) return location.pathname === paths.home;
    return location.pathname.startsWith(targetPath);
  };

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownEnter = () => setDropdownOpen(true);
  const handleDropdownLeave = () => setDropdownOpen(false);

  return (
    <header className={cx('header')}>
      {location.pathname === paths.home && (
        <div className={cx('topLine')}>
          <span></span>
          <Link to={paths.releaseCalendar}>Lịch ra chương tuần này</Link>
        </div>
      )}

      <div className={cx('shell')}>
        <Link to={paths.home} className={cx('brand')}>
          <span className={cx('brandMark')}>WL</span>
          <div>
            <strong>WEB COMICS LAB</strong>
            <small>Read. Track. Build.</small>
          </div>
        </Link>

        <form className={cx('searchForm')} onSubmit={handleSearch}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" name="search" placeholder="Tìm manga, tác giả, thể loại..." className={cx('input_search')} autoComplete="off" />
          <button type="submit">Tìm</button>
        </form>

        <div className={cx('rightActions')}>
          <Link to={paths.notifications} className={cx('alertBtn')} title="Thông báo">
            <i className="fa-regular fa-bell"></i>
            {unreadCount > 0 && <span className={cx('notif-badge')}>{Math.min(unreadCount, 99)}</span>}
          </Link>

          {/* RETENTION SIGNALS: streak + coins + plan, always visible so the
              reason to come back tomorrow is on every page, not just Home. */}
          {userId && (
            <>
              <Link
                to={paths.dashboard}
                className={cx('streakChip', { muted: streak.current === 0 })}
                title={
                  streak.current > 0
                    ? `Bạn đã đọc ${streak.current} ngày liên tiếp (kỷ lục ${streak.best})`
                    : 'Đọc hôm nay để bắt đầu chuỗi đọc'
                }
              >
                🔥 <strong>{streak.current}</strong>
              </Link>
              <Link to={paths.membership} className={cx('coinChip')} title="Số dư Coin của bạn">
                🪙 <strong>{(balance || 0).toLocaleString('vi-VN')}</strong>
              </Link>
              {isPremium && (
                <span className={cx('premiumChip')} title="Bạn đang là thành viên Premium">
                  👑 PREMIUM
                </span>
              )}
            </>
          )}

          {userId ? (
            <>
              <button type="button" className={cx('profile')} onClick={handleToggleMenu}>
                <img className={cx('avatar-circle')} src={userData?.urlImage || 'https://via.placeholder.com/40'} alt="Avatar" />
                <span className={cx('name')}>{userData?.name || 'Khách'}</span>
                <i className="fa-solid fa-chevron-down"></i>
              </button>

              <div className={cx('menu')} ref={menuRef}>
                <ul>
                  <li>
                    <Link to={paths.profile}>
                      <i className="fa-solid fa-user"></i>
                      Hồ sơ của tôi
                    </Link>
                  </li>
                  <li>
                    <Link to={paths.dashboard}>
                      <i className="fa-solid fa-chart-pie"></i>
                      Tổng quan
                    </Link>
                  </li>
                  <li>
                    <Link to={paths.library}>
                      <i className="fa-solid fa-book-bookmark"></i>
                      Thư viện
                    </Link>
                  </li>
                  <li>
                    <Link to={paths.notifications}>
                      <i className="fa-regular fa-bell"></i>
                      Thông báo
                      {unreadCount > 0 && <span className={cx('menu-badge')}>{unreadCount}</span>}
                    </Link>
                  </li>
                  <li>
                    <Link to={paths.membership}>
                      <i className="fa-solid fa-crown"></i>
                      {isPremium ? 'Thành viên Premium' : 'Nâng cấp Premium'}
                    </Link>
                  </li>
                  <li>
                    <Link to={paths.whatToReadNext}>
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      Chọn truyện cho tôi
                    </Link>
                  </li>
                  <li>
                    <button className={cx('logout-btn')} onClick={logout}>
                      <i className="fa-solid fa-right-from-bracket"></i>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <a href={paths.login} className={cx('login-btn')}>
              Đăng nhập
            </a>
          )}
        </div>
      </div>

      <nav className={cx('navDock')}>
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={cx({ active: isCurrentPath(item.to) })}>
                {item.label}
              </Link>
            </li>
          ))}

          <li className={cx('dropdown')} onMouseEnter={handleDropdownEnter} onMouseLeave={handleDropdownLeave}>
            <Link to={paths.category} className={cx({ active: location.pathname === paths.category })}>
              Thể loại
            </Link>
            <ul className={cx({ open: isDropdownOpen })}>
              {categories.length > 0 ? (
                categories.slice(0, 12).map((category) => (
                  <li key={category.id || category.slug || category.name}>
                    <Link to={`${paths.category}?slug=${category.slug}`}>{category.name}</Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link to={paths.category}>Tất cả thể loại</Link>
                </li>
              )}
            </ul>
          </li>

          <li>
            <Link to={paths.advancedSearch} className={cx({ active: location.pathname === paths.advancedSearch })}>
              Tìm nâng cao
            </Link>
          </li>

          <li>
            <Link to={paths.whatToReadNext} className={cx({ active: location.pathname === paths.whatToReadNext })}>
              Chọn truyện cho tôi
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
