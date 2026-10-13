import classNames from 'classnames/bind';

import { useReaderStats } from '~/providers/ReaderStatsProvider';
import styles from './DailyChallengesCard.module.scss';

const cx = classNames.bind(styles);

/**
 * DailyChallengesCard — DAILY CHALLENGES (P1)
 *
 * Three tasks, deterministically rotated per calendar day, each worth XP.
 * Claiming is explicit (never auto-awarded) so the reward feels earned and the
 * XP ledger stays auditable.
 */
export default function DailyChallengesCard({ onClaim }) {
  const { challenges, claimChallengeReward } = useReaderStats();
  const { list, completedCount, totalCount, claimableXp } = challenges;

  const handle = (challenge) => {
    claimChallengeReward(challenge);
    onClaim?.(challenge);
  };

  return (
    <section className={cx('card')}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>⚡ Thử thách hôm nay</h3>
          <p className={styles.sub}>
            Hoàn thành {completedCount}/{totalCount} · làm mới mỗi ngày
          </p>
        </div>
        {claimableXp > 0 && <span className={styles.claimable}>+{claimableXp} XP chờ nhận</span>}
      </div>

      <ul className={styles.list}>
        {list.map((challenge) => (
          <li key={challenge.id} className={cx('item', { done: challenge.completed })}>
            <span className={styles.icon}>{challenge.icon}</span>
            <div className={styles.body}>
              <div className={styles.labelRow}>
                <span className={styles.label}>{challenge.label}</span>
                <span className={styles.count}>{challenge.progressLabel}</span>
              </div>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${Math.max(2, challenge.percent)}%` }} />
              </div>
            </div>
            {challenge.completed &&
              (challenge.rewardClaimed ? (
                <span className={styles.claimed}>✓ Đã nhận</span>
              ) : (
                <button type="button" className={styles.claim} onClick={() => handle(challenge)}>
                  +{challenge.xp} XP
                </button>
              ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
