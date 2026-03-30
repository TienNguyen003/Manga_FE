import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './TeamProfile.module.scss';
import { teamService } from '~/services/teamService';
import paths from '~/routes/paths';

const cx = classNames.bind(styles);

export default function TeamProfile() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    teamService
      .getTeamById(id)
      .then((res) => {
        const found = res?.result;
        setTeam(found || null);
      })
      .catch(() => setError('Không thể tải thông tin nhóm.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={cx('status')}>Đang tải thông tin nhóm...</div>;
  if (error || !team) return <div className={cx('status')}>{error || 'Không tìm thấy nhóm.'}</div>;

  return (
    <main className={cx('teamProfilePage')}>
      {/* Ảnh bìa nhóm */}
      <div className={cx('cover')} style={{ backgroundImage: `url(${team.banner})` }}></div>

      <div className={cx('container')}>
        <header className={cx('header')}>
          <img src={team.avatar} className={cx('avatar')} />
          <div className={cx('info')}>
            <Link to={paths.authorHub} className={cx('backLink')}>
              ← Quay lại
            </Link>
            <h1>{team.name}</h1>
            <p className={cx('description')}>{team.description || 'Nhóm dịch và sáng tác truyện tranh.'}</p>
            <div className={cx('stats')}>
              <span>
                <strong>{team.members?.length || 0}</strong> Thành viên
              </span>
              <span>
                <strong>{team.projects?.length}</strong> Tác phẩm
              </span>
            </div>
          </div>
        </header>

        <section className={cx('content')}>
          <div className={cx('mainCol')}>
            {/* Section Thành viên */}
            <div className={cx('sectionBlock')}>
              <h2>Thành viên cốt cán</h2>
              <div className={cx('memberGrid')}>
                {team.members?.map((m) => (
                  <div key={m.id} className={cx('memberCard')}>
                    <img src={m.avatar} alt={m.displayName || m.username} className={cx('userAva')} />
                    <div className={cx('userMeta')}>
                      <span className={cx('name')}>{m.displayName || m.username}</span>
                      <span className={cx('role')}>{m.role || 'Thành viên'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Tác phẩm - MỚI THÊM */}
            <div className={cx('sectionBlock')}>
              <div className={cx('sectionHead')}>
                <h2>Tác phẩm đang thực hiện ({team.projects?.length || 0})</h2>
              </div>
              {team.projects && team.projects.length > 0 ? (
                <div className={cx('projectGrid')}>
                  {team.projects.map((proj) => (
                    <Link key={proj.slug} to={`${paths.mangaDetail}?slug=${proj.slug}`} className={cx('projectCard')}>
                      <div className={cx('thumbWrap')}>
                        <img src={proj.cover ? `${IMG_BASE_URL}${proj.cover}` : ''} alt={proj.name} />
                        {proj.status && <span className={cx('statusTag')}>{proj.status}</span>}
                      </div>
                      <div className={cx('projInfo')}>
                        <h3 className={cx('projName')}>{proj.title}</h3>
                        <span className={cx('projMeta')}>{proj.genre || 'Manga'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className={cx('emptyText')}>Nhóm chưa có tác phẩm nào công khai.</p>
              )}
            </div>
          </div>

          <aside className={cx('sideCol')}>
            <h3>Liên kết</h3>
            <div className={cx('links')}>
              <button className={cx('socialBtn')}>
                <i className="fa-brands fa-facebook"></i>{' '}
                <a href={team.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  Fanpage
                </a>
              </button>
              <button className={cx('socialBtn')}>
                <i className="fa-brands fa-discord"></i>{' '}
                <a href={team.socialLinks.discord} target="_blank" rel="noopener noreferrer">
                  Discord
                </a>
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
