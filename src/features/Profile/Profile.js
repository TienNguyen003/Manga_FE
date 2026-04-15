import {
  AccountCircleRounded,
  AutoGraphRounded,
  BadgeRounded,
  ColorLensRounded,
  EmailRounded,
  GroupAddRounded,
  ImageRounded,
  PhotoCameraRounded,
  PsychologyRounded,
  SaveRounded,
  SettingsSuggestRounded,
  StyleRounded,
  VisibilityRounded,
} from '@mui/icons-material';
import { Alert, Avatar, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import paths from '~/routes/paths';
import { userService } from '~/services/userService';
import styles from './Profile.module.scss';
import { toast } from 'react-toastify';
import { useUser } from '~/providers/UserContext';

const cx = classNames.bind(styles);

export default function Profile() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { userData } = useUser();

  // --- States mapping từ Database Entity ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Advanced Settings
  const [displayName, setDisplayName] = useState('');
  const [avatarFrameUrl, setAvatarFrameUrl] = useState('');
  const [bgComment, setBgComment] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [quickProfileBannerUrl, setQuickProfileBannerUrl] = useState('');
  const [quickProfileCardStyle, setQuickProfileCardStyle] = useState('');
  const [quickProfileAccentColor, setQuickProfileAccentColor] = useState('');

  // Visibility & Privacy (0/1)
  const [isProfilePublic, setIsProfilePublic] = useState(1);
  const [showFollowerCount, setShowFollowerCount] = useState(1);
  const [showFollowingCount, setShowFollowingCount] = useState(1);
  const [allowFollow, setAllowFollow] = useState(1);

  useEffect(() => {
    getMyProfile();
    getProfileSettings();
  }, []);

  const getMyProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile();
      const data = res?.result || {};
      setUsername(data.name || '');
      setEmail(data.email || '');
    } catch (err) {
      toast.error('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getProfileSettings = async () => {
    try {
      const res = await userService.getMySettings();
      const data = res?.result || {};
      setDisplayName(data.displayName || '');
      setBio(data.bio || '');
      setPreviewUrl(data.avatarUrl || '');
      setAvatarFrameUrl(data.avatarFrameUrl || '');
      setBgComment(data.bgComment || '');
      setBannerUrl(data.bannerUrl || '');
      setQuickProfileBannerUrl(data.quickProfileBannerUrl || '');
      setQuickProfileCardStyle(data.quickProfileCardStyle || '');
      setQuickProfileAccentColor(data.quickProfileAccentColor || '');
      setIsProfilePublic(data.isProfilePublic ?? 1);
      setShowFollowerCount(data.showFollowerCount ?? 1);
      setShowFollowingCount(data.showFollowingCount ?? 1);
      setAllowFollow(data.allowFollow ?? 1);
    } catch (err) {
      toast.error('Không thể tải cài đặt hồ sơ. Vui lòng thử lại sau.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: username,
        urlImage: previewUrl,
        avatarUrl: previewUrl,
        displayName,
        email,
        bio,
        avatarFrameUrl,
        bgComment,
        bannerUrl,
        quickProfileBannerUrl,
        quickProfileCardStyle,
        quickProfileAccentColor,
        isProfilePublic,
        showFollowerCount,
        showFollowingCount,
        allowFollow,
      };

      await userService.updateProfile(payload, userData?.id);
      await userService.updateSettings(payload, userData?.id);
      toast.success('Hồ sơ đã được cập nhật thành công!');
    } catch (err) {
      toast.error('Cập nhật thất bại. Thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className={cx('loading-wrapper')}>
        <CircularProgress sx={{ color: '#ea982b' }} size={60} />
        <Typography variant="h6" sx={{ color: '#fff', mt: 2 }}>
          Đang mở cổng không gian...
        </Typography>
      </div>
    );

  return (
    <main className={cx('profilePage')} style={{ backgroundImage: `url(${bannerUrl})` }}>
      <div className={cx('container')}>
        <form className={cx('profileLayout')} onSubmit={handleSubmit}>
          <aside className={cx('leftPanel')}>
            <div className={cx('stickyContent')}>
              <Typography variant="h1" className={cx('pageTitle')}>
                Cài đặt <br /> <span>hồ sơ</span>
              </Typography>

              <div className={cx('avatarBlock')}>
                <div className={cx('avatarOuter')}>
                  <Avatar src={previewUrl} className={cx('mainAvatar')}>
                    {!previewUrl && username.charAt(0).toUpperCase()}
                  </Avatar>
                  <label htmlFor="avatar-upload" className={cx('uploadTrigger')}>
                    <PhotoCameraRounded />
                    <input
                      id="avatar-upload"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAvatarFile(file);
                          setPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
                <Typography className={cx('avatarInfo')}>Mã nhận diện cộng đồng của bạn.</Typography>
              </div>
            </div>
          </aside>

          <section className={cx('rightPanel')}>
            <div className={cx('formCard')}>
              <div className={cx('tabHeader')}>
                <button type="button" className={cx('tabBtn', { active: tabValue === 0 })} onClick={() => setTabValue(0)}>
                  <AccountCircleRounded /> Cơ bản
                </button>
                <button type="button" className={cx('tabBtn', { active: tabValue === 1 })} onClick={() => setTabValue(1)}>
                  <SettingsSuggestRounded /> Nâng cao
                </button>
              </div>

              {tabValue === 0 ? (
                <Stack spacing={4} className={cx('tabContent')}>
                  <TextField
                    fullWidth
                    label="Tên người dùng"
                    variant="standard"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={cx('customInput')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Tên hiển thị"
                    variant="standard"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={cx('customInput')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Địa chỉ Email"
                    variant="standard"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cx('customInput')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Ảnh bìa trang cá nhân (URL)"
                    variant="standard"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className={cx('customInput')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ImageRounded />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              ) : (
                <Stack spacing={5} className={cx('tabContent')}>
                  {/* GROUP: PRIVACY */}
                  <div className={cx('settingsGroup')}>
                    <Typography className={cx('groupTitle')}>Quyền riêng tư & Tương tác</Typography>
                    <div className={cx('settingGrid')}>
                      <div className={cx('settingItem')}>
                        <Typography className={cx('settingLabel')}>
                          <VisibilityRounded /> Hồ sơ công khai
                        </Typography>
                        <select value={isProfilePublic} onChange={(e) => setIsProfilePublic(Number(e.target.value))} className={cx('customSelect')}>
                          <option value={1}>Công khai</option>
                          <option value={0}>Riêng tư</option>
                        </select>
                      </div>
                      <div className={cx('settingItem')}>
                        <Typography className={cx('settingLabel')}>
                          <GroupAddRounded /> Cho phép theo dõi
                        </Typography>
                        <select value={allowFollow} onChange={(e) => setAllowFollow(Number(e.target.value))} className={cx('customSelect')}>
                          <option value={1}>Bật</option>
                          <option value={0}>Tắt</option>
                        </select>
                      </div>
                      <div className={cx('settingItem')}>
                        <Typography className={cx('settingLabel')}>
                          <AutoGraphRounded /> Hiện Follower
                        </Typography>
                        <select value={showFollowerCount} onChange={(e) => setShowFollowerCount(Number(e.target.value))} className={cx('customSelect')}>
                          <option value={1}>Hiển thị</option>
                          <option value={0}>Ẩn</option>
                        </select>
                      </div>
                      <div className={cx('settingItem')}>
                        <Typography className={cx('settingLabel')}>
                          <AutoGraphRounded /> Hiện Following
                        </Typography>
                        <select value={showFollowingCount} onChange={(e) => setShowFollowingCount(Number(e.target.value))} className={cx('customSelect')}>
                          <option value={1}>Hiển thị</option>
                          <option value={0}>Ẩn</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* GROUP: QUICK PROFILE */}
                  <div className={cx('settingsGroup')}>
                    <Typography className={cx('groupTitle')}>Diện mạo Quick Profile</Typography>
                    <div className={cx('settingGrid')}>
                      <TextField
                        label="Màu chủ đạo"
                        variant="standard"
                        value={quickProfileAccentColor}
                        onChange={(e) => setQuickProfileAccentColor(e.target.value)}
                        className={cx('customInput')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ColorLensRounded />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Kiểu thẻ"
                        variant="standard"
                        value={quickProfileCardStyle}
                        onChange={(e) => setQuickProfileCardStyle(e.target.value)}
                        className={cx('customInput')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <StyleRounded />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                    <TextField
                      fullWidth
                      label="Link Banner Quick Profile (URL)"
                      variant="standard"
                      value={quickProfileBannerUrl}
                      onChange={(e) => setQuickProfileBannerUrl(e.target.value)}
                      className={cx('customInput')}
                      sx={{ mt: 2 }}
                    />
                  </div>

                  {/* GROUP: DECORATION */}
                  <div className={cx('settingsGroup')}>
                    <Typography className={cx('groupTitle')}>Trang trí & Tiểu sử</Typography>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Khung ảnh đại diện (URL)"
                        variant="standard"
                        value={avatarFrameUrl}
                        onChange={(e) => setAvatarFrameUrl(e.target.value)}
                        className={cx('customInput')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeRounded />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Nền bình luận (URL)"
                        variant="standard"
                        value={bgComment}
                        onChange={(e) => setBgComment(e.target.value)}
                        className={cx('customInput')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ImageRounded />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Giới thiệu (Bio)"
                        variant="standard"
                        multiline
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className={cx('customInput')}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PsychologyRounded />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Stack>
                  </div>
                </Stack>
              )}
            </div>

            <div className={cx('actionSection')}>
              <Button className={cx('submitBtn')} type="submit" disabled={submitting} startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveRounded />}>
                {submitting ? 'ĐANG ĐỒNG BỘ...' : 'CẬP NHẬT HỆ THỐNG'}
              </Button>
              <Link to={paths.library} className={cx('cancelLink')}>
                Hủy bỏ
              </Link>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
