import classNames from 'classnames/bind';

import { WEEKDAY_LABELS, fromDayKey, toDayKey } from '~/lib/date';
import { useReaderStats } from '~/providers/ReaderStatsProvider';
import styles from './StreakCalendar.module.scss';

const cx = classNames.bind(styles);

/**
 * StreakCalendar — READING STREAK (P1)
 *
 * Provenance is explicit: when `GET /mangas/reading-analytics/streak` answers,
 * the calendar renders the server's data and says so. Otherwise it falls back
 * to locally-derived reading days so the widget is never a dead card. The user
 * is never shown a streak number we cannot justify.
 */
export default function StreakCalendar({ days = 7, compact = false }) {
  const { streak, calendar, local } = useReaderStats();
  const todayKey = toDayKey();

  // Prefer the REAL API calendar; fall back to local reading history.
  const cells = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const key = toDayKey(date);
    const apiDay = (calendar || []).find((c) => toDayKey(c.date || c.day) === key);
    const count = apiDay ? Number(apiDay.count ?? apiDay.readCount ?? 0) : (local.activeDays?.[key]?.chapters ?? 0);
    return {
      key,
      date,
      label: WEEKDAY_LABELS[date.getDay()],
      count,
      isToday: key === todayKey,
      isFuture: date.getTime() > new Date().setHours(23, 59, 59, 999),
    };
  });

  const activeDays = cells.filter((c) => c.count > 0).length;
  const day = fromDayKey(todayKey);

  return (
    <section className={cx('card', { compact })}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>
            🔥 {streak.current > 0 ? `${streak.current} ngày liên tiếp` : 'Bắt đầu chuỗi đọc'}
          </h3>
          <p className={styles.sub}>
            {streak.current > 0
              ? `Bạn đã đọc ${streak.current} ngày liên tiếp. Kỷ lục: ${streak.best} ngày.`
              : 'Đọc một chương hôm nay để khởi đầu chuỗi đọc của bạn.'}
          </p>
        </div>
        <span
          className={styles.source}
          title={
            streak.source === 'api'
              ? 'Dữ liệu chuỗi đọc lấy từ máy chủ'
              : 'Máy chủ chưa có dữ liệu — đang tính từ lịch sử đọc trên thiết bị này'
          }
        >
          {streak.source === 'api' ? 'Đồng bộ' : 'Trên thiết bị'}
        </span>
      </div>

      <div className={styles.grid}>
        {cells.map((cell) => (
          <div
            key={cell.key}
            className={cx('cell', {
              done: cell.count > 0,
              today: cell.isToday,
              future: cell.isFuture,
            })}
            title={`${cell.key} · ${cell.count} chương`}
          >
            <span className={styles.day}>{cell.label}</span>
            <span className={styles.mark}>{cell.count > 0 ? '✓' : '·'}</span>
            <span className={styles.date}>{day && cell.date.getDate()}</span>
          </div>
        ))}
      </div>

      {!compact && (
        <p className={styles.footer}>
          {activeDays > 0 ? (
            <>
              Bạn đã đọc <strong>{activeDays}/{days}</strong> ngày gần nhất.
            </>
          ) : (
            'Chưa có hoạt động đọc nào trong tuần qua.'
          )}
        </p>
      )}
    </section>
  );
}
