import React, { useRef, useEffect, useCallback, useState } from 'react';
import classNames from 'classnames/bind';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import paths from '~/routes/paths';
import { useUser } from '~/providers/UserContext';
import { getUnreadCount } from '~/services/notificationService';
import { getCategories } from '~/services/mangaService';
import { connectStomp, subscribe as wsSubscribe, disconnectStomp, WS_TOPICS } from '~/lib/realtime';
import styles from './header.module.scss';

const cx = classNames.bind(styles);

export default function Header() {
  const menuRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, username, unreadCount, setUnreadCount, logout } = useUser();
  const [categories, setCategories] = useState([]);

  const refreshUnreadCount = useCallback(() => {
    if (!userId) return;
    getUnreadCount(userId)
      .then((res) => setUnreadCount(res?.result ?? 0))
      .catch(() => {});
  }, [userId, setUnreadCount]);

  useEffect(() => {
    getCategories()
      .then((res) => {
        const list = Array.isArray(res?.result) ? res.result : [];
        setCategories(list);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // Lấy số thông báo chưa đọc khi đăng nhập
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Realtime notification badge
  useEffect(() => {
    if (!userId) return;
    const client = connectStomp({
      onConnect: () => {
        wsSubscribe(WS_TOPICS.notifications(userId), () => {
          refreshUnreadCount();
        });
        wsSubscribe(WS_TOPICS.login, () => {
          refreshUnreadCount();
        });
        wsSubscribe(WS_TOPICS.updateStatus, () => {
          refreshUnreadCount();
        });
      },
    });
    return () => {
      if (client) disconnectStomp();
    };
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
    { to: paths.library, label: 'Thư viện' },
  ];

  const isCurrentPath = (targetPath) => {
    if (targetPath === paths.home) return location.pathname === paths.home;
    return location.pathname.startsWith(targetPath);
  };

  const shortName = (username || 'Khách').trim();
  const avatarText = shortName.charAt(0).toUpperCase();

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownEnter = () => setDropdownOpen(true);
  const handleDropdownLeave = () => setDropdownOpen(false);

  return (
    <header className={cx('header')}>
      <div className={cx('topLine')}>
        <span></span>
        <Link to={paths.releaseCalendar}>Lịch ra chương tuần này</Link>
      </div>

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
          <Link to={paths.notifications} className={cx('alertBtn')}>
            <i className="fa-regular fa-bell"></i>
            {unreadCount > 0 && <span className={cx('notif-badge')}>{Math.min(unreadCount, 99)}</span>}
          </Link>

          {userId ? (
            <>
              <button type="button" className={cx('profile')} onClick={handleToggleMenu}>
                <span className={cx('avatar-circle')}>{avatarText}</span>
                <span className={cx('name')}>{shortName}</span>
                <i className="fa-solid fa-chevron-down"></i>
              </button>

              <div className={cx('menu')} ref={menuRef}>
                <ul>
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
        </ul>
      </nav>
    </header>
  );
}
