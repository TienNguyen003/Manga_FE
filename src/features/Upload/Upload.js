import React, { useState } from 'react';
import { comicService } from '~/services/comicService';
import classNames from 'classnames/bind';
import styles from './Upload.module.scss';

const cx = classNames.bind(styles);

export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState(null);
  const [genre, setGenre] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const genres = ['', 'Hành động', 'Phiêu lưu', 'Hài hước', 'Tình cảm', 'Kinh dị', 'Trinh thám', 'Giả tưởng', 'Học đường', 'Đời thường'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!title || !genre) {
      setError('Vui lòng nhập đầy đủ tên truyện và thể loại.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('genre', genre);
      if (cover) formData.append('cover', cover);
      await comicService.uploadComic(formData);
      setSuccess(true);
    } catch (err) {
      setError('Đăng truyện thất bại.');
    }
  };

  return (
    <main className={cx('uploadPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <h1>Đăng truyện mới</h1>
          <p>Chia sẻ tác phẩm của bạn với cộng đồng. (Demo UI, cần nối backend sau)</p>
        </section>
        <form className={cx('form')} onSubmit={handleSubmit}>
          <div className={cx('formGroup')}>
            <label>
              Tên truyện <span style={{ color: 'red' }}>*</span>
            </label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên truyện" />
          </div>
          <div className={cx('formGroup')}>
            <label>Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Giới thiệu ngắn về truyện" rows={3} />
          </div>
          <div className={cx('formGroup')}>
            <label>
              Thể loại <span style={{ color: 'red' }}>*</span>
            </label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)}>
              {genres.map((g, idx) => (
                <option value={g} key={idx}>
                  {g || 'Chọn thể loại'}
                </option>
              ))}
            </select>
          </div>
          <div className={cx('formGroup')}>
            <label>Bìa truyện</label>
            <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} />
            {cover && <span>{cover.name}</span>}
          </div>
          {error && <div className={cx('error')}>{error}</div>}
          {success && <div className={cx('success')}>Đăng truyện thành công! (Demo)</div>}
          <button type="submit" className={cx('submitBtn')}>
            Đăng truyện
          </button>
        </form>
      </div>
    </main>
  );
}
