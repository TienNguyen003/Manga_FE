import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './AuthorHub.module.scss';
import paths from '~/routes/paths';
import { getMangasByCategory } from '~/services/mangaService';
import { teamService } from '~/services/teamService';

const cx = classNames.bind(styles);

export default function AuthorHub() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';
  const [spotlight, setSpotlight] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [errorTeams, setErrorTeams] = useState('');

  useEffect(() => {
    let mounted = true;
    // Lấy danh sách nhóm tác giả
    setLoadingTeams(true);
    setErrorTeams('');
    teamService
      .getTeamList()
      .then((res) => {
        if (!mounted) return;
        setTeams(res?.data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setErrorTeams('Không thể tải danh sách nhóm tác giả.');
        setTeams([]);
      })
      .finally(() => {
        if (mounted) setLoadingTeams(false);
      });

    // Lấy spotlight truyện như cũ
    getMangasByCategory({ path: 'manhwa', page: 1 })
      .then((res) => {
        if (!mounted) return;
        setSpotlight((res?.result || []).slice(0, 6));
      })
      .catch(() => {
        if (!mounted) return;
        setSpotlight([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className={cx('authorPage')}>
      <div className={cx('container-fluid')}>
        <section className={cx('hero')}>
          <p className={cx('kicker')}>Trang mới</p>
          <h1>Trung tâm tác giả và nhóm dịch</h1>
          <p>Không gian dành cho đội ngũ sáng tác, dịch truyện và quản lý dự án nội dung. Có thể nối backend quản trị nhóm sau.</p>
        </section>

        <section className={cx('teamGrid')}>
          {loadingTeams && <div>Đang tải nhóm tác giả...</div>}
          {errorTeams && <div className={cx('error')}>{errorTeams}</div>}
          {!loadingTeams && !errorTeams && teams.length === 0 && <div>Chưa có nhóm tác giả nào.</div>}
          {!loadingTeams &&
            !errorTeams &&
            teams.map((team) => (
              <article key={team.id} className={cx('teamCard')}>
                <h3>{team.name}</h3>
                <div className={cx('meta')}>
                  <span>{team.members?.length || 0} thành viên</span>
                  <span>{team.description}</span>
                </div>
                <button type="button">Xem hồ sơ nhóm</button>
              </article>
            ))}
        </section>

        <section className={cx('spotlight')}>
          <div className={cx('head')}>
            <h2>Tác phẩm nổi bật gần đây</h2>
            <Link to={paths.rankings}>Mở bảng xếp hạng</Link>
          </div>
          <div className={cx('works')}>
            {spotlight.map((manga) => (
              <Link key={manga.slug} to={`${paths.mangaDetail}?slug=${manga.slug}`} className={cx('workItem')}>
                <img src={manga.thumb_url ? `${IMG_BASE_URL}${manga.thumb_url}` : ''} alt={manga.name} />
                <span>{manga.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
