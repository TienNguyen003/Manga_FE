import React from 'react';
import classNames from 'classnames/bind';

import styles from './footer.module.scss';

const cx = classNames.bind(styles);

export default function Footer() {
  return (
    <footer>
      <div className={cx('container-fluid')}>
        <div className={cx('footer-main')}>
          <div className={cx('footer-info')}>
            <div className={cx('footer-about')}>
              <div className={cx('logo')}>
                <a href="./index.html">
                  <img src="https://uiparadox.co.uk/templates/animewave/assets/media/logo.png" alt="" />
                </a>
              </div>
              <p className={cx('light-gray', 'h-20', 'light', 'mb-32')}>
                Stay connected with us and lets know <br /> more stories about new movies and <br /> More Explorer Us for get it
              </p>

              <ul className={cx('unstyled', 'social-icons')}>
                <li>
                  <a href="index.html">
                    <i className="fa-brands fa-instagram"></i>
                  </a>
                </li>
                <li>
                  <a href="index.html">
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                </li>
                <li>
                  <a href="index.html">
                    <i className="fa-brands fa-twitter"></i>
                  </a>
                </li>
              </ul>
            </div>

            {/* Top Links */}
            <div className={cx('list')}>
              <h5 className={cx('h-24', 'bold', 'color-white', 'mb-24')}>Top Links</h5>
              <ul className={cx('link', 'unstyled')}>
                <li>
                  <a href="index.html">Home</a>
                </li>
                <li>
                  <a href="anime-listing.html">Animes</a>
                </li>
                <li>
                  <a href="./blog.html">Blog</a>
                </li>
                <li>
                  <a href="./blog-with-sidebar.html">Blog With Sidebar</a>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div className={cx('list')}>
              <h5 className={cx('h-24', 'bold', 'color-white', 'mb-24')}>Information</h5>
              <ul className={cx('link', 'unstyled')}>
                <li>
                  <a href="./sign-up.html">Sign up</a>
                </li>
                <li>
                  <a href="./login.html">Login</a>
                </li>
                <li>About Us</li>
              </ul>
            </div>

            {/* Services */}
            <div className={cx('list')}>
              <h5 className={cx('h-24', 'bold', 'color-white', 'mb-24')}>Services</h5>
              <ul className={cx('link', 'unstyled')}>
                <li>
                  <a href="./movie-detail.html">Movies</a>
                </li>
                <li>
                  <a href="#">Newsletter</a>
                </li>
                <li>
                  <a href="./blog.html">Blog</a>
                </li>
                <li>
                  <a href="./blog-with-sidebar.html">Blog With Sidebar</a>
                </li>
              </ul>
            </div>

            {/* Security */}
            <div className={cx('list')}>
              <h5 className={cx('h-24', 'bold', 'color-white', 'mb-24')}>Security</h5>
              <ul className={cx('link', 'unstyled')}>
                <li>
                  <a href="#">Terms and Condition</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Contact us</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className={cx('color-white', 'text-center', 'copyright')}>All rights reserved by TienNguyen ©2025.</p>
      </div>
    </footer>
  );
}
