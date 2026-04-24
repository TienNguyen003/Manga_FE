import { ArrowForwardRounded, AutoAwesomeRounded, GroupsRounded, LeaderboardRounded, MenuBookRounded, StarsRounded } from '@mui/icons-material';
import { Avatar, Container, Skeleton, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';
import { getMangasByCategory } from '~/services/mangaService';
import { teamService } from '~/services/teamService';
import styles from './AuthorHub.module.scss';

const cx = classNames.bind(styles);

const PREMIUM_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)',
];

export default function AuthorHub() {
  const IMG_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || '';
  const [spotlight, setSpotlight] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingTeams(true);

    teamService
      .getTeamList()
      .then((res) => {
        if (mounted) setTeams(res?.result || []);
      })
      .catch(() => {
        if (mounted) setTeams([]);
      })
      .finally(() => {
        if (mounted) setLoadingTeams(false);
      });

    getMangasByCategory({ path: 'manhwa', page: 1 })
      .then((res) => {
        if (mounted) setSpotlight((res?.result || []).slice(0, 6));
      })
      .catch(() => {
        if (mounted) setSpotlight([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className={cx('authorPage', 'container-fluid')}>
      <Container maxWidth="xl">
        {/* Hero Section */}
        <section className={cx('hero')}>
          <div className={cx('heroContent')}>
            <span className={cx('kicker')}>
              <AutoAwesomeRounded fontSize="small" /> Creative Hub
            </span>
            <Typography variant="h1">Nơi Hội Tụ <br />Sức Mạnh Sáng Tạo</Typography>
            <Typography variant="body1" className={cx('desc')}>
              Kết nối những đội ngũ dịch thuật, tác giả và biên tập viên hàng đầu. Cùng nhau xây dựng cộng đồng truyện tranh bền vững.
            </Typography>
            <div className={cx('ctaGroup')}>
              <button className={cx('ctaBtn', 'ctaPrimary')}>
                Tham gia ngay
              </button>
              <Link to={paths.rankings} className={cx('ctaBtn', 'ctaOutline')}>
                Khám phá
              </Link>
            </div>
          </div>
        </section>

        {/* Section Nhóm Tác Giả */}
        <section className={cx('section')}>
          <div className={cx('sectionHead')}>
            <div className={cx('titleGroup')}>
              <GroupsRounded className={cx('icon')} />
              <Typography variant="h2">Cộng đồng Editor & Dịch giả</Typography>
            </div>
          </div>

          <div className={cx('teamGrid')}>
            {loadingTeams
              ? [1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rectangular" className={cx('skeletonCard')} />)
              : teams.map((team, index) => (
                  <article key={team.id} className={cx('teamCard')}>
                    {/* Cover Photo Dynamic Gradient */}
                    <div className={cx('cardCover')} style={{ background: PREMIUM_GRADIENTS[index % PREMIUM_GRADIENTS.length] }} />
                    
                    <div className={cx('cardBody')}>
                      <Avatar className={cx('teamAvatar')} src={team.avatar} alt={team.name} />
                      
                      <h3 className={cx('teamName')}>{team.name}</h3>
                      <span className={cx('teamTag')}>Scanlation Team</span>

                      <div className={cx('teamStats')}>
                        <div className={cx('statItem')}>
                          <GroupsRounded /> 
                          <span><b>{team.members?.length || 0}</b> Thành viên</span>
                        </div>
                        {/* Bạn có thể thêm dữ liệu dự án ở đây nếu API có */}
                        <div className={cx('statItem')}>
                          <MenuBookRounded /> 
                          <span><b>{team.projects?.length || 0}</b> Tác phẩm</span> 
                        </div>
                      </div>

                      <Link to={paths.teamProfile.replace(':id', team.id)} className={cx('profileBtn')}>
                        <span>Hồ sơ nhóm</span>
                        <ArrowForwardRounded />
                      </Link>
                    </div>
                  </article>
                ))}
          </div>
        </section>

        {/* Section Tác Phẩm Nổi Bật */}
        <section className={cx('section', 'spotlightSection')}>
          <div className={cx('sectionHead')}>
            <div className={cx('titleGroup')}>
              <StarsRounded className={cx('icon')} />
              <Typography variant="h2">Dự án Spotlight</Typography>
            </div>
            <Link to={paths.rankings} className={cx('viewMore')}>
              Bảng xếp hạng <LeaderboardRounded fontSize="small" />
            </Link>
          </div>

          <div className={cx('worksGrid')}>
            {spotlight.map((manga, idx) => (
              <Link key={manga.slug} to={`${paths.mangaDetail}?slug=${manga.slug}`} className={cx('workItem')}>
                <div className={cx('imageWrapper')}>
                  <img src={manga.thumb_url ? `${IMG_BASE_URL}${manga.thumb_url}` : ''} alt={manga.name} />
                  <div className={cx('imageOverlay')} />
                  {/* Badge góc trái */}
                  {idx === 0 && <span className={cx('spotlightBadge')}>HOT</span>}
                  {idx === 1 && <span className={cx('spotlightBadge')}>NEW</span>}
                </div>
                <div className={cx('workInfo')}>
                  <span className={cx('mangaName')}>{manga.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}