import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { Link, useNavigate } from 'react-router-dom';
import paths from '~/routes/paths';

import styles from './header.module.scss';

const cx = classNames.bind(styles);

export default function Header() {
  const menuRef = useRef();
  const navigate = useNavigate();

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
                        <Link to={paths.category}>Thể loại</Link>
                        <ul>
                          <li>
                            <a href="shows.html">Kinh dị</a>
                          </li>
                          <li>
                            <a href="show-detail.html">Tình cảm</a>
                          </li>
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
                  <div className={cx('search-heart-icon', 'd-flex', 'd-none', 'align-items-center', 'gap-24')}>
                    {/* Bell */}
                    <a href="#" className={cx('notification-bell')}>
                      {/* SVG bell icon */}
                      <i className="fa-regular fa-bell"></i>
                    </a>

                    {/* Profile */}
                    <div className={cx('profile')} onClick={handleToggleMenu}>
                      <div className={cx('d-flex', 'align-items-center', 'gap-8')}>
                        <img src="https://uiparadox.co.uk/templates/animewave/assets/media/user/user-1.png" alt="User" />
                        <div>
                          <p className={cx('white')}>Johns Smith</p>
                          <p className={cx('subtitle')}>@7814johns</p>
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-down"></i>
                    </div>

                    {/* Profile Dropdown Menu */}
                    <div className={cx('menu')} ref={menuRef}>
                      <ul>
                        <li>
                          <a href="#" className={cx('subtitle')}>
                            <i className="fa-regular fa-user"></i>&nbsp;Profile
                          </a>
                        </li>
                        <li>
                          <a href="#" className={cx('subtitle')}>
                            <i className="fa-solid fa-inbox"></i>&nbsp;Inbox
                          </a>
                        </li>
                        <li>
                          <a href="#" className={cx('subtitle')}>
                            <i className="fa-solid fa-gear"></i>&nbsp;Settings
                          </a>
                        </li>
                        <li>
                          <a href="#" className={cx('subtitle')}>
                            <i className="fa-solid fa-circle-question"></i>&nbsp;Help
                          </a>
                        </li>
                        <li>
                          <a href="#" className={cx('subtitle')}>
                            <i className="fa-solid fa-right-from-bracket"></i>&nbsp;Sign Out
                          </a>
                        </li>
                      </ul>
                    </div>
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
