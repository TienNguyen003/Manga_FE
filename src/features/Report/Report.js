import React, { useState } from 'react';
import { reportService } from '~/services/reportService';
import classNames from 'classnames/bind';
import styles from './Report.module.scss';

const cx = classNames.bind(styles);

export default function Report() {
  const [type, setType] = useState('');
  const [content, setContent] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const types = ['', 'Báo lỗi truyện', 'Báo cáo vi phạm', 'Báo lỗi hình ảnh', 'Khác'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!type || !content) {
      setError('Vui lòng chọn loại báo cáo và nhập nội dung.');
      return;
    }
    try {
      const res = await reportService.sendReport({ type, content });
      if (res?.data?.success) {
        setSuccess(true);
      } else {
        setError('Gửi báo cáo thất bại.');
      }
    } catch (err) {
      setError('Gửi báo cáo thất bại.');
    }
  };

  return (
    <main className={cx('reportPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Báo cáo sự cố/truyện</h1>
          <p>Gửi phản hồi về lỗi, vi phạm hoặc vấn đề khác. (Demo UI, cần nối backend sau)</p>
        </section>
        <form className={cx('form')} onSubmit={handleSubmit}>
          <div className={cx('formGroup')}>
            <label>
              Loại báo cáo <span style={{ color: 'red' }}>*</span>
            </label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {types.map((t, idx) => (
                <option value={t} key={idx}>
                  {t || 'Chọn loại báo cáo'}
                </option>
              ))}
            </select>
          </div>
          <div className={cx('formGroup')}>
            <label>
              Nội dung <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Mô tả chi tiết vấn đề..." rows={4} />
          </div>
          {error && <div className={cx('error')}>{error}</div>}
          {success && <div className={cx('success')}>Gửi báo cáo thành công! (Demo)</div>}
          <button type="submit" className={cx('submitBtn')}>
            Gửi báo cáo
          </button>
        </form>
      </div>
    </main>
  );
}
