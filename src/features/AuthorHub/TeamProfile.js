import { ArrowBackRounded, GroupsRounded, MenuBookRounded, StarRounded, EditRounded, TranslateRounded, PersonRounded } from '@mui/icons-material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import paths from '~/routes/paths';
import { teamService } from '~/services/teamService';
import styles from './TeamProfile.module.scss';

const cx = classNames.bind(styles);

// Logic chuẩn hóa Role từ API
const getRoleClass = (role) => {
  if (!role) return 'member';
  const r = role.toLowerCase();
  if (r.includes('leader') || r.includes('admin') || r.includes('owner')) return 'leader';
  if (r.includes('edit') || r.includes('clean') || r.includes('typeset')) return 'editor';
  if (r.includes('trans') || r.includes('dịch')) return 'translator';
  return 'member';
};

// Icon cho Role
const RoleIcon = ({ role }) => {
  const cls = getRoleClass(role);
  if (cls === 'leader') return <StarRounded sx={{ fontSize: '1.4rem' }} />;
  if (cls === 'editor') return <EditRounded sx={{ fontSize: '1.4rem' }} />;
  if (cls === 'translator') return <TranslateRounded sx={{ fontSize: '1.4rem' }} />;
  return <PersonRounded sx={{ fontSize: '1.4rem' }} />;
};

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
      {/* Cover Photo */}
      <div
        className={cx('cover')}
        style={{
          backgroundImage: team.banner ? `url(${team.banner})` : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        }}
      />

      <div className={cx('container')}>
        {/* HEADER MỚI: Gộp Info + Social vào cùng 1 hàng ngang */}
        <header className={cx('header')}>
          <div className={cx('avatarWrapper')}>
            <div className={cx('avatar')}>{team.avatar ? <img src={team.avatar} alt={team.name} /> : team.name.charAt(0).toUpperCase()}</div>
          </div>

          <div className={cx('info')}>
            <Link to={paths.authorHub} className={cx('backLink')}>
              <ArrowBackRounded fontSize="small" /> Quay lại cộng đồng
            </Link>
            <h1>{team.name}</h1>
            <p className={cx('description')}>{team.description || 'Chưa có mô tả về nhóm.'}</p>
          </div>

          {/* Cột phải của Header: Stats + Social */}
          <div className={cx('actions')}>
            <div className={cx('statBadge')}>
              <GroupsRounded /> <span>{team.members?.length || 0} Thành viên</span>
            </div>
            <div className={cx('statBadge')}>
              <MenuBookRounded /> <span>{team.projects?.length || 0} Tác phẩm</span>
            </div>

            <div className={cx('socialLinks')}>
              {team.socialLinks?.discord && (
                <a href={team.socialLinks.discord} target="_blank" rel="noopener noreferrer" className={cx('socialIcon', 'discord')}>
                  <i className="fa-brands fa-discord"></i>
                </a>
              )}
              {team.socialLinks?.facebook && (
                <a href={team.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={cx('socialIcon', 'facebook')}>
                  <i className="fa-brands fa-facebook"></i>
                </a>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT: Đổi sang 1 cột rộng rãi */}
        <section className={cx('content')}>
          {/* Section Thành viên (Chia làm 2 cột trong này) */}
          <div className={cx('sectionBlock')}>
            <div className={cx('sectionHeader')}>
              <h2>
                <GroupsRounded sx={{ color: '#ea982b' }} /> Đội ngũ nhân sự
              </h2>
              <span className={cx('countBadge')}>{team.members?.length || 0} người</span>
            </div>
            <div className={cx('memberList')}>
              {team.members?.length > 0 ? (
                team.members.map((m) => (
                  <Link key={m.id} to={paths.publicProfile.replace(':id', m.id)} className={cx('memberItem')}>
                    <div className={cx('userAva')}>{m.avatar ? <img src={m.avatar} alt={m.name} /> : m.name.charAt(0).toUpperCase()}</div>
                    <div className={cx('userInfo')}>
                      <span className={cx('userName')}>{m.name}</span>
                    </div>
                    <div className={cx('roleTag', getRoleClass(m.role))}>
                      <RoleIcon role={m.role} /> {m.role || 'Thành viên'}
                    </div>
                  </Link>
                ))
              ) : (
                <p className={cx('emptyText')}>Nhóm chưa có thành viên nào.</p>
              )}
            </div>
          </div>

          {/* Section Tác phẩm (Lưới to ra) */}
          <div className={cx('sectionBlock')}>
            <div className={cx('sectionHeader')}>
              <h2>
                <MenuBookRounded sx={{ color: '#ea982b' }} /> Tác phẩm đang thực hiện
              </h2>
              <span className={cx('countBadge')}>{team.projects?.length || 0} dự án</span>
            </div>
            <div className={cx('projectList')}>
              {team.projects?.length > 0 ? (
                team.projects.map((proj) => (
                  <Link key={proj.slug} to={`${paths.mangaDetail}?slug=${proj.slug}`} className={cx('projectCard')}>
                    <div className={cx('projThumb')}>
                      <img src={proj.cover ? `${IMG_BASE_URL}${proj.cover}` : ''} alt={proj.name} />
                      {proj.status && <span className={cx('projStatus')}>{proj.status}</span>}
                    </div>
                    <div className={cx('projDetails')}>
                      <h3 className={cx('projTitle')}>{proj.title}</h3>
                      <span className={cx('projGenre')}>{proj.genre || 'Truyện tranh'}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className={cx('emptyText')}>Nhóm chưa có tác phẩm nào công khai.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
