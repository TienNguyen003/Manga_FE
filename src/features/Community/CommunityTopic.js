import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames/bind';
import { useParams, useNavigate } from 'react-router-dom';
import { Popper, Paper, Stack, IconButton, Fade, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ForumIcon from '@mui/icons-material/Forum';

import { communityService } from '~/services/communityService';
import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';

import styles from './CommunityTopic.module.scss';

const cx = classNames.bind(styles);

const REACTION_TYPES = [
  { label: 'LIKE', icon: '👍', color: '#2d7be5', text: 'Thích' },
  { label: 'LOVE', icon: '❤️', color: '#f33e58', text: 'Yêu thích' },
  { label: 'HAHA', icon: '😆', color: '#f7b125', text: 'Haha' },
  { label: 'WOW', icon: '😮', color: '#f7b125', text: 'Wow' },
  { label: 'SAD', icon: '😢', color: '#f7b125', text: 'Buồn' },
  { label: 'ANGRY', icon: '😡', color: '#e9710f', text: 'Phẫn nộ' },
];

export default function CommunityTopic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useUser();

  const [posts, setPosts] = useState([]);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(false);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    topicId: id,
  });
  const [submitting, setSubmitting] = useState(false);

  // Reaction State
  const [anchorEl, setAnchorEl] = useState(null);
  const [activePostId, setActivePostId] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    communityService
      .getPosts(id)
      .then((res) => {
        if (!mounted) return;
        setPosts(res?.result?.posts || []);
        setTopic(res?.result || null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, reloadFlag]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setPostData({ title: '', content: '' });
    setOpenModal(false);
  };

  const handleSubmitPost = async () => {
    if (!postData.title.trim() || !postData.content.trim()) return;
    setSubmitting(true);
    try {
      await communityService.createPost(userId, postData);
      handleCloseModal();
      setReloadFlag(!reloadFlag);
    } catch (error) {
      console.error('Lỗi tạo bài viết:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMouseEnter = (event, postId) => {
    clearTimeout(timeoutRef.current);
    setAnchorEl(event.currentTarget);
    setActivePostId(postId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setAnchorEl(null);
      setActivePostId(null);
    }, 200);
  };

  const handleReact = async (type, postId) => {
    try {
      const res = await communityService.reactPost({ type, postId }, userId);

      // Object reaction mới từ API
      const newReaction = res.result;

      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id !== postId) return p;
          let currentReactions = Array.isArray(p.reactions) ? [...p.reactions] : [];
          const existingIndex = currentReactions.findIndex((r) => r.userId === userId);

          if (existingIndex !== -1) {
            currentReactions[existingIndex] = newReaction;
          } else {
            currentReactions.push(newReaction);
          }

          return { ...p, reactions: currentReactions };
        }),
      );

      setAnchorEl(null);
    } catch (error) {
      console.error('Lỗi cập nhật Reaction UI:', error);
    }
  };

  const getUserReaction = (postReactions) => {
    const userReact = postReactions?.find((r) => r.userId === userId);
    return userReact ? REACTION_TYPES.find((t) => t.label === userReact.type) : null;
  };

  return (
    <main className={cx('topicPage')}>
      <div className={cx('container')}>
        <header className={cx('hero')}>
          <div className={cx('topNav')}>
            <button className={cx('backBtn')} onClick={() => navigate(-1)}>
              ← QUAY LẠI
            </button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal} className={cx('createBtn')}>
              Viết bài mới
            </Button>
          </div>
          <h1>Thảo luận chủ đề</h1>
          {topic && <p className={cx('topicSubtitle')}>{topic.name}</p>}
        </header>

        <section className={cx('postList')}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={10}>
              <CircularProgress color="inherit" />
            </Box>
          ) : posts.length > 0 ? (
            posts.map((post) => {
              const userReaction = getUserReaction(post.reactions);
              return (
                <article key={post.id} className={cx('postCard')}>
                  <div className={cx('postHeader')}>
                    <div className={cx('userInfo')}>
                      <img className={cx('avatar')} src={post.author?.urlImage || 'https://via.placeholder.com/40'} alt="avatar" />
                      <div className={cx('userMeta')}>
                        <span className={cx('userName')}>Tác giả: <span style={{color: '#ff4757'}}>{post.author?.name}</span></span>
                        <span className={cx('postTime')}>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <h3 className={cx('postTitle')}>{post.title}</h3>
                  </div>

                  <div className={cx('postContent')} onClick={() => navigate(`/cong-dong/post/${post.id}`)}>
                    {post.content}
                  </div>

                  <div className={cx('postActions')}>
                    <div className={cx('reactSection')} onMouseEnter={(e) => handleMouseEnter(e, post.id)} onMouseLeave={handleMouseLeave}>
                      <div className={cx('reactions')}>
                        <button
                          className={cx('reactBtn', 'mainBtn')}
                          style={{ color: userReaction ? userReaction.color : 'inherit' }}
                          onClick={() => !userReaction && handleReact('LIKE', post.id)}
                        >
                          <span>{userReaction ? userReaction.icon : '👍'}</span>
                          <span className={cx('btnText')}>{userReaction ? userReaction.text : 'Thích'}</span>
                        </button>
                        <div className={cx('statItem')}>
                          ❤️👍 <span>{post?.reactions?.length || 0}</span>
                        </div>
                        <div className={cx('statItem')}>
                          💬 <span>{post?.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                    <span className={cx('viewDetail')} onClick={() => navigate(`${paths.postDetail}`.replace(':id', post.id))}>
                      Xem chi tiết →
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className={cx('emptyState')}>
              <ForumIcon className={cx('emptyIcon')} />
              <h2>Chưa có bài viết nào</h2>
              <p>Hãy là người đầu tiên bắt đầu cuộc trò chuyện trong chủ đề này!</p>
              <Button variant="outlined" onClick={handleOpenModal} sx={{ mt: 2, borderRadius: '10px', fontSize: '1.3rem' }}>
                Bắt đầu thảo luận
              </Button>
            </div>
          )}
        </section>

        {/* Modal tạo bài mới */}
        <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.8rem' }}>Tạo bài viết mới</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                name="title"
                label="Tiêu đề bài viết"
                value={postData.title}
                onChange={handleChange}
                inputProps={{
                  style: { fontSize: '1.4rem', fontWeight: 600 },
                }}
                InputLabelProps={{
                  style: { fontSize: '1.4rem' },
                }}
              />

              <TextField
                fullWidth
                name="content"
                label="Nội dung chi tiết"
                multiline
                rows={6}
                value={postData.content}
                onChange={handleChange}
                inputProps={{
                  style: { fontSize: '1.4rem', lineHeight: '1.6' },
                }}
                InputLabelProps={{
                  style: { fontSize: '1.4rem' },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseModal} sx={{ fontSize: '1.4rem' }} color="inherit">
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSubmitPost} disabled={submitting || !postData.content.trim()} sx={{ borderRadius: '10px', px: 3, fontSize: '1.4rem' }}>
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Đăng bài'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reaction Popper */}
        <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="top-start" transition style={{ zIndex: 1300 }}>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={300}>
              <Paper
                elevation={0}
                onMouseEnter={() => clearTimeout(timeoutRef.current)}
                onMouseLeave={handleMouseLeave}
                sx={{
                  borderRadius: '24px',
                  padding: '6px 12px',
                  marginBottom: '10px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }}
              >
                <Stack direction="row" spacing={0.5}>
                  {REACTION_TYPES.map((type) => (
                    <IconButton
                      key={type.label}
                      onClick={() => handleReact(type.label, activePostId)}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.4) translateY(-5px)', background: 'transparent' },
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{type.icon}</span>
                    </IconButton>
                  ))}
                </Stack>
              </Paper>
            </Fade>
          )}
        </Popper>
      </div>
    </main>
  );
}
