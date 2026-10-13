import classNames from 'classnames/bind';

import { useReaderSettings } from '~/hooks/useReaderSettings';
import { useMembership } from '~/hooks/useMembership';
import styles from './ReaderSettingsPanel.module.scss';

const cx = classNames.bind(styles);

const Toggle = ({ label, hint, value, locked, onChange }) => (
  <label className={cx('toggle', { locked })} title={locked ? 'Tính năng dành cho thành viên Premium' : hint}>
    <span className={styles.toggleText}>
      <span className={styles.toggleLabel}>{label}</span>
      {hint && <span className={styles.toggleHint}>{hint}</span>}
    </span>
    <input type="checkbox" checked={Boolean(value)} disabled={locked} onChange={(e) => onChange(e.target.checked)} />
    {locked && <span className={styles.lockTag}>Premium</span>}
  </label>
);

/**
 * ReaderSettingsPanel — READER PERSONALISATION (P0)
 *
 * Every control writes straight through to `readerSettingsService`
 * (localStorage) and the reader re-renders immediately, so the panel is a live
 * preview rather than a settings form you submit.
 *
 * "Advanced" controls are visibly locked for free users instead of hidden —
 * the value of Premium is shown, not asserted.
 */
export default function ReaderSettingsPanel({ isOpen, onClose }) {
  const { settings, setSettings, resetSettings, options } = useReaderSettings();
  const { isPremium } = useMembership();

  if (!isOpen) return null;

  return (
    <aside className={styles.panel} role="dialog" aria-label="Cài đặt trình đọc">
      <header className={styles.head}>
        <h3 className={styles.title}>⚙️ Cài đặt đọc</h3>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng">
          ✕
        </button>
      </header>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Chế độ đọc</span>
        <div className={styles.chipRow}>
          {options.modes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              className={cx('chip', { active: settings.mode === mode.value })}
              onClick={() => setSettings({ mode: mode.value })}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Nền trang</span>
        <div className={styles.chipRow}>
          {options.backgrounds.map((bg) => (
            <button
              key={bg.value}
              type="button"
              className={cx('chip', 'swatch', { active: settings.background === bg.value })}
              onClick={() => setSettings({ background: bg.value })}
              style={{ background: bg.color }}
            >
              <span className={styles.swatchLabel}>{bg.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Độ rộng trang</span>
        <div className={styles.chipRow}>
          {options.widths.map((w) => (
            <button
              key={w.value}
              type="button"
              className={cx('chip', { active: settings.pageWidth === w.value })}
              onClick={() => setSettings({ pageWidth: w.value })}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Thu phóng · {Math.round(settings.zoom * 100)}%</span>
        <div className={styles.chipRow}>
          {options.zooms.map((z) => (
            <button
              key={z}
              type="button"
              className={cx('chip', { active: settings.zoom === z })}
              onClick={() => setSettings({ zoom: z })}
            >
              {Math.round(z * 100)}%
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Hiển thị</span>
        <Toggle
          label="Hiện thanh tiến trình"
          hint="Thanh % ở đầu trang đọc"
          value={settings.showProgress}
          onChange={(v) => setSettings({ showProgress: v })}
        />
        <Toggle
          label="Hiện tên chương"
          hint="Tiêu đề chương ở đầu trang"
          value={settings.showChapterTitle}
          onChange={(v) => setSettings({ showChapterTitle: v })}
        />
        <Toggle
          label="Hỏi tiếp tục khi quay lại"
          hint="Hiện hộp thoại tiếp tục đọc"
          value={settings.resumePrompt}
          onChange={(v) => setSettings({ resumePrompt: v })}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Nâng cao {isPremium ? '· Premium' : ''}</span>
        <Toggle
          label="Tự chuyển chương khi đọc xong"
          hint="Sang chương mới ngay khi lướt tới trang cuối"
          value={settings.autoNextChapter}
          locked={!isPremium}
          onChange={(v) => setSettings({ autoNextChapter: v })}
        />
        <Toggle
          label="Giữ màn hình sáng"
          hint="Không tự tắt màn hình khi đọc"
          value={settings.keepScreenAwake}
          locked={!isPremium}
          onChange={(v) => setSettings({ keepScreenAwake: v })}
        />
      </div>

      <button type="button" className={styles.reset} onClick={resetSettings}>
        Khôi phục mặc định
      </button>
    </aside>
  );
}
