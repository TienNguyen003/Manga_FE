import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';

const cx = classNames.bind(styles);

const targetDate = new Date('2026-12-25T00:00:00');

export default function InnerBanner() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className={cx('inner-banner')}>
      <div className={cx('container-fluid')}>
        <div className={cx('left-content')}>
          <div className={cx('tags-wrapper')}>
            <div className={cx('tags-box')}>Drama</div>
            <div className={cx('tags-box')}>Thriller</div>
            <div className={cx('tags-box')}>Voilence</div>
          </div>

          <h2>
            GUARDIANS OF <br /> THE VOID
          </h2>
          <h3>Season 4</h3>
          <h6>Dark fantasy, Post Apocalyptic</h6>
          <div className={cx('coming-title')}>Coming Out in</div>

          <ul className={cx('countdown')}>
            <li>
              {timeLeft.days}
              <small>d</small>
            </li>
            <li>
              {timeLeft.hours.toString().padStart(2, '0')}
              <small>h</small>
            </li>
            <li>
              {timeLeft.minutes.toString().padStart(2, '0')}
              <small>m</small>
            </li>
            <li>
              {timeLeft.seconds.toString().padStart(2, '0')}
              <small>s</small>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
