import classNames from 'classnames/bind';

import { useReaderStats } from '~/providers/ReaderStatsProvider';
import styles from './LevelProgress.module.scss';

const cx = classNames.bind(styles);

/**
 * LevelProgress — READER XP / LEVEL (P1)
 *
 * Deliberately calm: no timers, no decay, no loss aversion. It only answers
 * "how far along am I" and "what do I do next", which is enough to make daily
 * reading feel cumulative.
 */
export default function LevelProgress({ showTitle = true, size = 'md' }) {
  const { xp, streak } = useReaderStats();

  return (
    <section className={cx('card', size)}>
      <div className={styles.head}>
        <div className={styles.levelBadge}>
          <span className={styles.levelNum}>{xp.level}</span>
          {showTitle && <span className={styles.levelTitle}>{xp.levelTitle}</span>}
        </div>
        <div className={styles.xpBlock}>
          <div className={styles.xpText}>
            <strong>{xp.totalXp.toLocaleString('vi-VN')}</strong> / {xp.needed.toLocaleString('vi-VN')} XP
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${Math.max(2, xp.percent)}%` }} />
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <span className={styles.stat}>
          <strong>{xp.totalXp.toLocaleString('vi-VN')}</strong> XP tích lũy
        </span>
        <span className={styles.stat}>
          🔥 <strong>{streak.current}</strong> ngày liên tiếp
        </span>
      </div>
    </section>
  );
}
