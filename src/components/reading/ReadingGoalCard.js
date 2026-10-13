import classNames from 'classnames/bind';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { GOAL_TYPES } from '~/services/readingGoalService';
import { WEEKDAY_LABELS } from '~/lib/date';
import { useReadingGoal } from '~/hooks/useReadingGoal';
import paths from '~/routes/paths';
import styles from './ReadingGoalCard.module.scss';

const cx = classNames.bind(styles);

/**
 * ReadingGoalCard — DAILY READING GOAL (P1)
 *
 * Builds a daily habit: a visible target, a live count that only ever moves
 * forward, and a 7-day strip so missing a day is felt (but not punished).
 * Goal unit and presets are chosen by the reader and stored locally.
 */
export default function ReadingGoalCard({ compact = false, showPresets = true }) {
  const { goal, week, updateGoal } = useReadingGoal();
  const [editing, setEditing] = useState(false);
  const activeType = GOAL_TYPES.find((t) => t.value === goal.type) || GOAL_TYPES[0];

  return (
    <section className={cx('card', { compact })}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>🎯 Mục tiêu hôm nay</h3>
          <p className={styles.sub}>
            {goal.completed
              ? 'Đã hoàn thành! Hôm nay bạn đã đọc đủ nhé.'
              : `Còn ${goal.remaining} ${goal.unit} nữa để hoàn thành mục tiêu.`}
          </p>
        </div>
        {showPresets && (
          <button type="button" className={styles.editBtn} onClick={() => setEditing((v) => !v)}>
            {editing ? 'Xong' : 'Đổi'}
          </button>
        )}
      </div>

      <div className={styles.counts}>
        <span className={styles.current}>{goal.current}</span>
        <span className={styles.target}>
          / {goal.target} {goal.unit}
        </span>
        <span className={styles.percent}>{goal.percent}%</span>
      </div>

      <div className={styles.track} role="progressbar" aria-valuenow={goal.percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={cx('fill', { done: goal.completed })} style={{ width: `${Math.max(2, goal.percent)}%` }} />
      </div>

      <div className={styles.week}>
        {week.map((day) => {
          const date = new Date(day.dayKey);
          return (
            <div key={day.dayKey} className={cx('day', { met: day.met })} title={`${day.dayKey}: ${day.value}/${goal.target}`}>
              <span>{WEEKDAY_LABELS[date.getDay()]}</span>
              <strong>{day.value}</strong>
            </div>
          );
        })}
      </div>

      {editing && showPresets && (
        <div className={styles.editor}>
          <div className={styles.chipRow}>
            {GOAL_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={cx('chip', { active: type.value === goal.type })}
                onClick={() => updateGoal({ type: type.value, target: type.presets[1] })}
              >
                {type.label}
              </button>
            ))}
          </div>
          <div className={styles.chipRow}>
            {activeType.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                className={cx('chip', { active: preset === goal.target })}
                onClick={() => updateGoal({ target: preset })}
              >
                {preset} {activeType.unit}
              </button>
            ))}
          </div>
        </div>
      )}

      {!compact && (
        <Link to={paths.dashboard} className={styles.link}>
          Xem thống kê đầy đủ →
        </Link>
      )}
    </section>
  );
}
