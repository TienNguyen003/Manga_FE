import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { Box, Typography, Container, Stack, Skeleton, Avatar, AvatarGroup, Button } from '@mui/material';
import { AutoAwesomeRounded, GroupsRounded, ArrowForwardRounded, StarsRounded, LeaderboardRounded } from '@mui/icons-material';
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
        {/* Hero Section với phong cách Blur và Gradient */}
        <section className={cx('hero')}>
          <div className={cx('heroContent')}>
            <span className={cx('kicker')}>
              <AutoAwesomeRounded fontSize="small" /> Creative Hub
            </span>
            <Typography variant="h1">Nơi Hội Tụ Sức Mạnh Sáng Tạo</Typography>
            <Typography variant="body1" className={cx('desc')}>
              Kết nối những đội ngũ dịch thuật, tác giả và biên tập viên hàng đầu. Cùng nhau xây dựng cộng đồng truyện tranh bền vững.
            </Typography>
          </div>
          <div className={cx('heroArt')} />
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
              ? [1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" className={cx('skeletonCard')} />)
              : teams.map((team) => (
                  <article key={team.id} className={cx('teamCard')}>
                    <div className={cx('cardTop')}>
                      <Avatar className={cx('teamAvatar')}>{team.name.charAt(0)}</Avatar>
                      <div className={cx('teamInfo')}>
                        <h3>{team.name}</h3>
                        <div className={cx('teamStats')}>
                          <span>
                            <b>{team.members?.length || 0}</b> Members
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link to={paths.teamProfile.replace(':id', team.id)} className={cx('profileBtn')}>
                      <span>Hồ sơ nhóm</span>
                      <ArrowForwardRounded />
                    </Link>
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
            {spotlight.map((manga) => (
              <Link key={manga.slug} to={`${paths.mangaDetail}?slug=${manga.slug}`} className={cx('workItem')}>
                <div className={cx('imageWrapper')}>
                  <img src={manga.thumb_url ? `${IMG_BASE_URL}${manga.thumb_url}` : ''} alt={manga.name} />
                  <div className={cx('imageOverlay')} />
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
