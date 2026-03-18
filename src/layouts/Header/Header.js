import React, { useRef, useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import { Link, useNavigate } from 'react-router-dom';
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
    const input = document.querySelector(`.${cx('input_search')}`);
    if (!input.value) return;
    const path = `${paths.category}?search=${input.value}`;
    navigate(path);
  };

  return (
    <header className={cx('header')}>
      <div className={cx('container-fluid')}>
        <div className={cx('header-navbar')}>
          <div className={cx('row', 'align-items-center')} style={{ padding: '0 12px' }}>
            <div className={cx('pc-3')}>
              <div className={cx('header-search')}>
                <form onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search Comics"
                    className={cx('input_search')}
                    autoComplete="off"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button onClick={(e) => handleSearch(e)} style={{ cursor: 'pointer' }}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </form>
              </div>
            </div>

            <div className={cx('pc-9 pc-pl-1')}>
              <nav className={cx('navigation', 'd-flex', 'align-items-center', 'justify-content-between')}>
                {/* Menu */}
                <div className={cx('menu-button-right')}>
                  <div className={cx('main-menu__nav')}>
                    <ul className={cx('main-menu__list')}>
                      <li className={cx('current')}>
                        <Link to={paths.home} className={cx('active')}>
                          Trang chủ
                        </Link>
                      </li>
                      <li className={cx('dropdown')}>
                        <Link to="#">Thể loại</Link>
                        <ul>
                          {categories.length > 0 ? (
                            categories.slice(0, 10).map((category) => (
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
                      <li className={cx('dropdown')}>
                        <a>Cộng đồng sáng tác</a>
                      </li>
                      {/* <li className={cx('dropdown')}>
                        <a>Pages</a>
                        <ul>
                          <li>
                            <a href="live-action.html">Live Action</a>
                          </li>
                          <li>
                            <a href="trending.html">Trending</a>
                          </li>
                          <li>
                            <a href="login.html">Login</a>
                          </li>
                          <li>
                            <a href="404.html">404</a>
                          </li>
                          <li>
                            <a href="coming-soon.html">Coming Soon</a>
                          </li>
                        </ul>
                      </li> */}
                    </ul>
                  </div>
                </div>

                {/* Logo */}
                <a href="index.html" className={cx('d-flex', 'align-items-center')}>
                  <img src="https://uiparadox.co.uk/templates/animewave/assets/media/logo.png" alt="logo" className={cx('header-logo')} />
                </a>

                {/* User + Notification */}
                <div className={cx('main-menu__right')}>
                  <div className={cx('search-heart-icon', 'd-flex', 'align-items-center', 'gap-24')}>
                    {/* Bell */}
                    <Link to={paths.notifications} className={cx('notification-bell')} style={{ position: 'relative' }}>
                      <i className="fa-regular fa-bell"></i>
                      {unreadCount > 0 && <span className={cx('notif-badge')}>1+</span>}
                    </Link>

                    {userId ? (
                      <>
                        {/* Profile */}
                        <div className={cx('profile')} onClick={handleToggleMenu}>
                          <div className={cx('d-flex', 'align-items-center', 'gap-8')}>
                            <div className={cx('avatar-circle')}>{(username || 'U').charAt(0).toUpperCase()}</div>
                            <div>
                              <p className={cx('white')}>{username || 'Người dùng'}</p>
                              {/* <p className={cx('subtitle')}>ID: {userId}</p> */}
                            </div>
                          </div>
                          <i className="fa-solid fa-chevron-down"></i>
                        </div>

                        {/* Dropdown Menu */}
                        <div className={cx('menu')} ref={menuRef}>
                          <ul>
                            <li>
                              <Link to={paths.library} className={cx('subtitle')}>
                                <i className="fa-solid fa-book-bookmark"></i>&nbsp;Thư viện
                              </Link>
                            </li>
                            <li>
                              <Link to={paths.dashboard} className={cx('subtitle')}>
                                <i className="fa-solid fa-chart-pie"></i>&nbsp;Tổng quan
                              </Link>
                            </li>
                            <li>
                              <Link to={paths.notifications} className={cx('subtitle')}>
                                <i className="fa-regular fa-bell"></i>&nbsp;Thông báo
                                {unreadCount > 0 && <span className={cx('menu-badge')}>{unreadCount}</span>}
                              </Link>
                            </li>
                            <li>
                              <button className={cx('subtitle', 'logout-btn')} onClick={logout}>
                                <i className="fa-solid fa-right-from-bracket"></i>&nbsp;Đăng xuất
                              </button>
                            </li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <a href={process.env.REACT_APP_LOGIN_URL || '#'} className={cx('login-btn')}>
                        <i className="fa-solid fa-right-to-bracket"></i>&nbsp;Đăng nhập
                      </a>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
