import React from 'react';
import classNames from 'classnames/bind';
import styles from './AsyncState.module.scss';

const cx = classNames.bind(styles);

export function LoadingSpinner({ text = 'Đang tải...' }) {
  return (
    <div className={cx('center')}>
      <div className={cx('spinner')} />
      {text && <p className={cx('text')}>{text}</p>}
    </div>
  );
}

export function EmptyState({ text = 'Không có dữ liệu.', icon = '📭' }) {
  return (
    <div className={cx('center')}>
      <span className={cx('icon')}>{icon}</span>
      <p className={cx('text')}>{text}</p>
    </div>
  );
}

export function ErrorState({ text = 'Có lỗi xảy ra. Vui lòng thử lại sau.', onRetry }) {
  return (
    <div className={cx('center')}>
      <span className={cx('icon')}>⚠️</span>
      <p className={cx('text')}>{text}</p>
      {onRetry && (
        <button className={cx('retryBtn')} onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
