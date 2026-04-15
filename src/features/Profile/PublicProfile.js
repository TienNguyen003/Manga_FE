import {
  AutoAwesomeRounded,
  AutoGraphRounded,
  CakeRounded,
  ChatBubbleOutlineRounded,
  Check,
  FavoriteBorderRounded,
  HistoryRounded,
  InsightsRounded,
  LinkRounded,
  LocationOnRounded,
  MapsUgcRounded,
  MoreHorizRounded,
  PersonAddRounded,
  ShareRounded,
  VerifiedRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material';
import FacebookIcon from '@mui/icons-material/Facebook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Avatar, Button, Chip, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { communityService } from '~/services/communityService';
import { userService } from '~/services/userService';
import { userFollowService } from '~/services/userFollowService';
import styles from './PublicProfile.module.scss';
import { useUser } from '~/providers/UserContext';

const cx = classNames.bind(styles);

export default function PublicProfile() {
  const { id } = useParams();
  const { userId } = useUser();
  const [isFollow, setIsFollow] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  const fetchUserData = async () => {
    try {
      const data = await userService.getUserProfile(id);
      setUserData(data.result);
      return data.result || null;
    } catch (error) {
      toast.error('Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await communityService.getPostByAuthor(id);
      setUserPosts(response.result);
    } catch (error) {
      toast.error('Không thể tải bài viết của người dùng. Vui lòng thử lại sau.');
    }
  };

  const isFollowing = async (followerId, followingId) => {
    try {
      const isFollow = await userFollowService.isFollow({ followerId, followingId });
      setIsFollow(isFollow);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể kiểm tra trạng thái theo dõi. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    const run = async () => {
      const res = await fetchUserData();
      if (res?.id) await isFollowing(userId, res.id);
      fetchUserPosts();
    };
    run();
  }, []);

  const handleFollowUser = async () => {
    try {
      if (isFollow) {
        await userFollowService.unfollowUser({ followerId: userId, followingId: userData.id });
        toast.success('Đã bỏ theo dõi người dùng.');
      } else {
        await userFollowService.followUser({ followerId: userId, followingId: userData.id });
        toast.success('Đã theo dõi người dùng.');
      }
      setIsFollow(!isFollow);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể theo dõi người dùng. Vui lòng thử lại.');
    }
  };

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
                      <PersonAddRounded />
                    </div>
                    <div>
                      <Typography className={cx('val')}>{userData?.followCount?.followingCount}</Typography>
                      <Typography className={cx('lbl')}>Đang theo dõi</Typography>
                    </div>
                  </div>
                  <div className={cx('miniStat')}>
                    <div className={cx('iconWrapper')}>
                      <PersonAddRounded />
                    </div>
                    <div>
                      <Typography className={cx('val')}>{userData?.followCount?.followerCount}</Typography>
                      <Typography className={cx('lbl')}>Người theo dõi</Typography>
                    </div>
                  </div>
                </div>

                <Typography className={cx('bio')}>{userData?.profile?.bio || 'Không có mô tả.'}</Typography>
              </div>
            </div>
            <div className={cx('headerActions')}>
              <Button className={cx('btnFollow')} variant="contained" startIcon={isFollow ? <Check /> : <PersonAddRounded />} onClick={handleFollowUser}>
                {isFollow ? 'Đang theo dõi' : 'Theo dõi'}
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
          <Grid item size={{ xs: 12, md: 4 }}>
            {/* Mục Thông tin cá nhân cơ bản */}
            <div className={cx('whiteTile')}>
              <Typography className={cx('tileTitle')}>
                <AutoAwesomeRounded /> Thông tin cá nhân
              </Typography>
              <div className={cx('personalInfo')}>
                <div className={cx('infoRow')}>
                  <LocationOnRounded />
                  <span>
                    Đến từ: <b>{userData?.address}</b>
                  </span>
                </div>
                <div className={cx('infoRow')}>
                  <CakeRounded />
                  <span>
                    Tham gia: <b>{new Date(userData?.createdAt).toLocaleDateString('vi-VN')}</b>
                  </span>
                </div>
                <div className={cx('infoRow')} style={{ flexDirection: 'column', alignItems: 'start' }}>
                  {Object.entries(userData?.link || {}).map(([type, url], index) => {
                    const icons = {
                      facebook: <FacebookIcon />,
                      discord: <SportsEsportsIcon />,
                    };
                    return (
                      <div key={index} className={cx('infoRow')}>
                        {icons[type] || <LinkRounded />}
                        <a href={url} className={cx('link')} target="_blank" rel="noopener noreferrer">
                          {url.replace(/https?:\/\/(www\.)?/, '')}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={cx('divider')} />

              <Typography className={cx('tileTitle')}>
                <WorkspacePremiumRounded /> Huy hiệu danh dự
              </Typography>
              <div className={cx('badgeShelf')}>
                {userData?.badges?.length > 0 ? (
                  userData?.badges.map((badge, index) => (
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
                  ))
                ) : (
                  <Typography className={cx('noBadge')}>Người dùng chưa có huy hiệu nào.</Typography>
                )}
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
          <Grid item size={{ xs: 12, md: 8 }}>
            {/* Bài viết Feed */}
            <div className={cx('whiteTile', 'feedSection')}>
              <div className={cx('tileHeader')}>
                <Typography className={cx('tileTitle')}>
                  <InsightsRounded /> Bài viết mới nhất
                </Typography>
              </div>

              {userPosts.length > 0 ? (
                userPosts?.map((item) => {
                  const post = item.post;

                  return (
                    <>
                      <div key={post.id} className={cx('postCard')}>
                        <div className={cx('postHead')}>
                          <Chip label={post.title} className={cx('postTag')} size="small" />
                          <span className={cx('postTime')}>{new Date(post.createdAt).toLocaleString('vi-VN')}</span>

                          <IconButton size="small">
                            <MoreHorizRounded />
                          </IconButton>
                        </div>

                        <Typography className={cx('postContent')}>{post.content}</Typography>

                        {/* nếu sau này có image thì bật */}
                        {post.image && (
                          <div className={cx('postImage')}>
                            <img src={post.image} alt="Post content" />
                          </div>
                        )}

                        <div className={cx('postActions')}>
                          <div className={cx('leftActions')}>
                            <Button startIcon={<FavoriteBorderRounded />}>{post.reactions?.length || 0}</Button>

                            <Button startIcon={<ChatBubbleOutlineRounded />}>{post.comments?.length || 0}</Button>
                          </div>

                          <IconButton>
                            <ShareRounded />
                          </IconButton>
                        </div>
                      </div>
                      <Button fullWidth className={cx('btnLoadMore')} sx={{ fontSize: '1.2rem' }}>
                        Khám phá thêm bài viết
                      </Button>
                    </>
                  );
                })
              ) : (
                <Typography className={cx('noPosts')}>Người dùng chưa có bài viết nào.</Typography>
              )}
            </div>
          </Grid>
        </Grid>
      </div>
    </main>
  );
}
