import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Avatar, Typography, Box, Grid, Button, CircularProgress, Tooltip, Chip, IconButton } from '@mui/material';
import {
  VerifiedRounded,
  PersonAddRounded,
  MapsUgcRounded,
  AutoGraphRounded,
  WorkspacePremiumRounded,
  AutoStoriesRounded,
  StarRounded,
  HistoryRounded,
  ChatBubbleOutlineRounded,
  ShareRounded,
  FavoriteBorderRounded,
  MoreHorizRounded,
  InsightsRounded,
  LocationOnRounded,
  CakeRounded,
  LinkRounded,
  AutoAwesomeRounded,
} from '@mui/icons-material';
import { userService } from '~/services/userService';
import styles from './PublicProfile.module.scss';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const cx = classNames.bind(styles);

export default function PublicProfile() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      const data = await userService.getUserProfile(id);
      setUserData(data.result);
    } catch (error) {
      toast.error('Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <main className={cx('profileWrapper')}>
      <div className={cx('container')}>
        {/* --- SECTION 1: IDENTITY CARD --- */}
        <section className={cx('heroGrid')}>
          <div className={cx('mainCard')}>
            <div className={cx('userBrief')}>
              <div className={cx('avatarSection')}>
                <div className={cx('avatarWrapper')}>
                  <Avatar className={cx('mainAvatar')} src={userData?.urlImage} />
                  {userData?.profile?.avatarFrameUrl && <img src={userData.profile.avatarFrameUrl} alt="Frame" className={cx('avatarFrame')} />}
                </div>
              </div>
              <div className={cx('textInfo')}>
                <div className={cx('nameBadge')}>
                  <Chip label="Level 42" className={cx('lvlChip')} size="small" />
                  <Typography variant="h2">{userData?.name}</Typography>
                  <VerifiedRounded className={cx('vIcon')} />
                </div>

                <div className={cx('statsRow')}>
                  <div className={cx('miniStat')}>
                    <div className={cx('iconWrapper')}>
                      <AutoGraphRounded />
                    </div>
                    <div>
                      <Typography className={cx('val')}>12.4k</Typography>
                      <Typography className={cx('lbl')}>Uy tín</Typography>
                    </div>
                  </div>
                  <div className={cx('miniStat')}>
                    <div className={cx('iconWrapper')}>
                      <PersonAddRounded />
                    </div>
                    <div>
                      <Typography className={cx('val')}>156</Typography>
                      <Typography className={cx('lbl')}>Đang theo dõi</Typography>
                    </div>
                  </div>
                  <div className={cx('miniStat')}>
                    <div className={cx('iconWrapper')}>
                      <PersonAddRounded />
                    </div>
                    <div>
                      <Typography className={cx('val')}>999</Typography>
                      <Typography className={cx('lbl')}>Người theo dõi</Typography>
                    </div>
                  </div>
                </div>

                <Typography className={cx('bio')}>{userData?.profile?.bio || 'Không có mô tả.'}</Typography>
              </div>
            </div>
            <div className={cx('headerActions')}>
              <Button className={cx('btnFollow')} variant="contained" startIcon={<PersonAddRounded />}>
                Theo dõi
              </Button>
              <Button className={cx('btnMessage')} variant="outlined" startIcon={<MapsUgcRounded />}>
                Nhắn tin
              </Button>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: BENTO CONTENT --- */}
        <Grid container spacing={3}>
          {/* Cột trái: About & Badges */}
          <Grid item xs={12} md={4} sx={{ maxWidth: '40%' }}>
            {/* Mục Thông tin cá nhân cơ bản */}
            <div className={cx('whiteTile')}>
              <Typography className={cx('tileTitle')}>
                <AutoAwesomeRounded /> Thông tin cá nhân
              </Typography>
              <div className={cx('personalInfo')}>
                <div className={cx('infoRow')}>
                  <LocationOnRounded />
                  <span>
                    Đến từ: <b>Hà Nội, Việt Nam</b>
                  </span>
                </div>
                <div className={cx('infoRow')}>
                  <CakeRounded />
                  <span>
                    Tham gia: <b>Tháng 3, 2024</b>
                  </span>
                </div>
                <div className={cx('infoRow')}>
                  <LinkRounded />
                  <a href="#" className={cx('link')}>
                    facebook.com/duynguyen
                  </a>
                </div>
              </div>

              <div className={cx('divider')} />

              <Typography className={cx('tileTitle')}>
                <WorkspacePremiumRounded /> Huy hiệu danh dự
              </Typography>
              <div className={cx('badgeShelf')}>
                {userData?.badges.map((badge, index) => (
                  <Tooltip
                    key={index}
                    arrow
                    placement="top"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor: '#000',
                          borderRadius: 2,
                          p: 1.5,
                          textAlign: 'center',
                          userSelect: 'none',
                        },
                      },
                    }}
                    title={
                      <div style={{ maxWidth: 150 }}>
                        <img
                          src={badge.iconUrl}
                          alt={badge.name}
                          style={{
                            maxWidth: 150,
                            marginBottom: 8,
                            pointerEvents: 'none',
                          }}
                        />
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.2rem' }}>{badge.name}</div>
                      </div>
                    }
                  >
                    <img src={badge.iconUrl} alt={badge.name} className={cx('badgeItem')} style={{ cursor: 'pointer' }} />
                  </Tooltip>
                ))}
              </div>

              <div className={cx('divider')} />

              <Typography className={cx('tileTitle')}>
                <AutoGraphRounded /> Thống kê hành trình
              </Typography>
              <div className={cx('miniStats')}>
                <p>
                  Số chương đã đọc: <b>14,205</b>
                </p>
                <p>
                  Bộ truyện tâm đắc: <b>82</b>
                </p>
              </div>
            </div>

            {/* Hoạt động gần đây */}
            <div className={cx('whiteTile')}>
              <Typography className={cx('tileTitle')}>
                <HistoryRounded /> Hoạt động gần đây
              </Typography>
              <div className={cx('activityList')}>
                <div className={cx('activityItem')}>
                  <div className={cx('dot')} />
                  <Typography>
                    Vừa thêm <b>Berserk</b> vào tủ sách
                  </Typography>
                  <span className={cx('time')}>2h</span>
                </div>
                <div className={cx('activityItem')}>
                  <div className={cx('dot')} />
                  <Typography>
                    Đã đánh giá 5 sao cho <b>Vagabond</b>
                  </Typography>
                  <span className={cx('time')}>5h</span>
                </div>
              </div>
            </div>
          </Grid>

          {/* Cột phải: Library & Posts */}
          <Grid item xs={12} md={7} sx={{ flex: 1 }}>
            {/* Thư viện công khai */}
            <div className={cx('whiteTile')}>
              <div className={cx('tileHeader')}>
                <Typography className={cx('tileTitle')}>
                  <AutoStoriesRounded /> Thư viện công khai
                </Typography>
                <Button sx={{ fontSize: '1.2rem', marginBottom: '8px' }}>Xem tất cả</Button>
              </div>

              <div className={cx('collectionList')}>
                {[
                  { title: 'Siêu phẩm Dark Fantasy', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?fm=jpg&q=100', likes: '1.2k', items: 45 },
                  { title: 'Manga Isekai chọn lọc', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?fm=jpg&q=100', likes: '850', items: 12 },
                ].map((item, idx) => (
                  <div key={idx} className={cx('collectionCard')}>
                    <img src={item.image} className={cx('collThumb')} />
                    <div className={cx('collDetail')}>
                      <Typography className={cx('collName')}>{item.title}</Typography>
                      <div className={cx('collMeta')}>
                        <span>
                          <StarRounded /> {item.likes}
                        </span>
                        <span className={cx('dotSeparator')}>•</span>
                        <span>{item.items} đầu truyện</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bài viết Feed */}
            <div className={cx('whiteTile', 'feedSection')}>
              <div className={cx('tileHeader')}>
                <Typography className={cx('tileTitle')}>
                  <InsightsRounded /> Bài viết mới nhất
                </Typography>
              </div>

              <div className={cx('postList')}>
                {[
                  {
                    id: 1,
                    tag: 'Review',
                    time: '12 giờ trước',
                    content: 'Vừa cày xong bộ "Berserk" bản Deluxe. Thực sự là một kiệt tác về nghệ thuật và tâm lý nhân vật.',
                    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?fm=jpg&q=100',
                    stats: { likes: 124, comments: 18 },
                  },
                  {
                    id: 2,
                    tag: 'Thảo luận',
                    time: '1 ngày trước',
                    content: 'Dự đoán về chap mới của One Piece tuần này: Liệu Joyboy có thực sự xuất hiện?',
                    image: null,
                    stats: { likes: 89, comments: 42 },
                  },
                ].map((post) => (
                  <div key={post.id} className={cx('postCard')}>
                    <div className={cx('postHead')}>
                      <Chip label={post.tag} className={cx('postTag')} size="small" />
                      <span className={cx('postTime')}>{post.time}</span>
                      <IconButton size="small">
                        <MoreHorizRounded />
                      </IconButton>
                    </div>
                    <Typography className={cx('postContent')}>{post.content}</Typography>
                    {post.image && (
                      <div className={cx('postImage')}>
                        <img src={post.image} alt="Post content" />
                      </div>
                    )}
                    <div className={cx('postActions')}>
                      <div className={cx('leftActions')}>
                        <Button startIcon={<FavoriteBorderRounded />}>{post.stats.likes}</Button>
                        <Button startIcon={<ChatBubbleOutlineRounded />}>{post.stats.comments}</Button>
                      </div>
                      <IconButton>
                        <ShareRounded />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
              <Button fullWidth className={cx('btnLoadMore')} sx={{ fontSize: '1.2rem' }}>
                Khám phá thêm bài viết
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>
    </main>
  );
}
