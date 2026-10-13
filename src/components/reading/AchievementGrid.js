import classNames from 'classnames/bind';
import { useState } from 'react';

import { useReaderStats } from '~/providers/ReaderStatsProvider';
import styles from './AchievementGrid.module.scss';

const cx = classNames.bind(styles);

/**
 * AchievementGrid — ACHIEVEMENTS (P1)
 *
 * Locked badges show real progress ("72 / 100 chương") because state is
 * derived from live metrics, never a stale stored number. That is what turns a
 * badge from decoration into a goal.
 */
export default function AchievementGrid({ limit = 8, showAllLink = false }) {
  const { achievements } = useReaderStats();
  const [expanded, setExpanded] = useState(false);

  const { list, unlockedCount, totalCount, nextUp } = achievements;
  const featured = expanded ? list : list.slice(0, limit);
  const lockedSorted = [...list].sort((a, b) => Number(a.unlocked) - Number(b.unlocked) || b.percent - a.percent);

  return (
    <section className={cx('card')}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>🏆 Thành tựu</h3>
          <p className={styles.sub}>
            Đã mở {unlockedCount}/{totalCount} huy hiệu
          </p>
        </div>
        <div className={styles.counter}>
          <span className={styles.counterNum}>{unlockedCount}</span>
          <span className={styles.counterTotal}>/{totalCount}</span>
        </div>
      </div>

      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${(unlockedCount / Math.max(1, totalCount)) * 100}%` }} />
      </div>

      {!expanded && nextUp.length > 0 && (
        <ul className={styles.nextUp}>
          {nextUp.map((item) => (
            <li key={item.id}>
              <span className={styles.nextIcon}>{item.icon}</span>
              <span className={styles.nextName}>{item.name}</span>
              <span className={styles.nextProgress}>{item.progressLabel}</span>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.grid}>
        {featured.map((item) => (
          <div
            key={item.id}
            className={cx('badge', { unlocked: item.unlocked })}
            title={`${item.description} — ${item.progressLabel}`}
          >
            <span className={styles.badgeIcon}>{item.unlocked ? item.icon : '🔒'}</span>
            <span className={styles.badgeName}>{item.name}</span>
            {item.unlocked ? (
              <span className={styles.badgeState}>Đã mở</span>
            ) : (
              <span className={styles.badgeProgress}>{item.progressLabel}</span>
            )}
            {!item.unlocked && (
              <span className={styles.miniTrack}>
                <span className={styles.miniFill} style={{ width: `${item.percent}%` }} />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.toggle} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Thu gọn' : `Xem tất cả ${totalCount} huy hiệu`}
        </button>
        {showAllLink && !expanded && lockedSorted.length > 0 && (
          <span className={styles.hint}>Gần nhất: {lockedSorted[0].name}</span>
        )}
      </div>
    </section>
  );
}
