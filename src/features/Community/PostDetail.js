import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Tooltip } from '@mui/material';
import { toast } from 'react-toastify';
import { connectStomp, WS_TOPICS, subscribe as wsSubscribe } from '~/lib/realtime';
import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';
import { communityService } from '~/services/communityService';
import { getRecommendationPosts } from '~/services/recommendationService';
import { userFollowService } from '~/services/userFollowService';
import styles from './PostDetail.module.scss';

const cx = classNames.bind(styles);

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, userAvatar } = useUser();
  const commentRef = useRef();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollow, setIsFollow] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await communityService.getPostComments(id);
      setPost(res?.result?.post || null);
      setComments(res?.result?.comments || []);

      return res?.result?.post || null;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải bài viết. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const res = await getRecommendationPosts({ userId: userId || undefined, limit: 5 });
      setRecommendations(res?.result || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải bài viết gợi ý. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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
      const postData = await loadComments();

      if (!postData?.author?.id) return;

      await isFollowing(userId, postData.author.id);
    };

    run();
  }, [id, userId]);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  useEffect(() => {
    const client = connectStomp({
      onConnect: () => {
        wsSubscribe(WS_TOPICS.commentPost(id), (msg) => {
          if (msg.type === 'comment_post') {
            msg.postID === Number(id) && loadComments();
          }
        });
      },
    });

    return () => {
      client?.deactivate();
    };
  });

  const isLiked = post?.reactions?.some((r) => r.username === userId);

  const handleToggleLike = async () => {
    try {
      const res = await communityService.reactPost({ type: 'LIKE', postId: id }, userId);
      const newReaction = res.result;

      setPost((prev) => {
        if (!prev) return prev;
        let currentReactions = Array.isArray(prev.reactions) ? [...prev.reactions] : [];
        const existingIndex = currentReactions.findIndex((r) => String(r.userId) === String(userId));

        if (existingIndex !== -1) {
          currentReactions.splice(existingIndex, 1);
        } else {
          currentReactions.push(newReaction);
        }

        return { ...prev, reactions: currentReactions };
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái thích. Vui lòng thử lại.');
    }
  };

  const handleSubmitComment = async () => {
    const commentContent = commentRef.current.value.trim();
    if (!commentContent) return;

    try {
      const res = await communityService.commentPost(userId, { content: commentContent, postId: id });
      const newComment = res.result;
      setComments((prev) => [newComment, ...prev]);

      commentRef.current.value = '';
      toast.success('Bình luận đã được gửi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi bình luận. Vui lòng thử lại.');
    }
  };

  const handleFollowUser = async () => {
    try {
      if (isFollow) {
        await userFollowService.unfollowUser({ followerId: userId, followingId: post?.author?.id });
        toast.success('Đã bỏ theo dõi người dùng.');
      } else {
        await userFollowService.followUser({ followerId: userId, followingId: post?.author?.id });
        toast.success('Đã theo dõi người dùng.');
      }
      setIsFollow(!isFollow);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể theo dõi người dùng. Vui lòng thử lại.');
    }
  };

  return (
    <main className={cx('postDetailPage')}>
      <div className={cx('container')}>
        <button className={cx('backBtn')} onClick={() => navigate(-1)}>
          ← TRỞ LẠI
        </button>

        {loading && <div className={cx('statusMsg')}>Đang tải nội dung bài viết...</div>}

        {!loading && post && (
          <div className={cx('contentWrapper')}>
            {/* CỘT CHÍNH - NỘI DUNG VÀ BÌNH LUẬN */}
            <div className={cx('mainColumn')}>
              <article className={cx('postCard')}>
                <header className={cx('cardHeader')}>
                  <img className={cx('avatarLarge')} src={post.author?.urlImage} alt="avatar" />
                  <div className={cx('postMeta')}>
                    <span className={cx('authorName')}>{post.author?.name}</span>
                    <span className={cx('postDate')}>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </header>

                <div className={cx('postContent')}>{post.content}</div>

                <div className={cx('postActions')}>
                  <div className={cx('interactionGroup')}>
                    <button className={cx('actionBtn', { active: isLiked })} onClick={handleToggleLike}>
                      <span>{isLiked ? '❤️' : '👍'}</span>
                      <span className={cx('statCount')}>{post?.reactions?.length || 0}</span>
                    </button>
                    <button className={cx('actionBtn', 'commentBtn')}>
                      <span>💬</span>
                      <span className={cx('statCount')}>{comments.length} Bình luận</span>
                    </button>
                  </div>
                </div>
              </article>

              {/* KHU VỰC THẢO LUẬN */}
              <section className={cx('commentsSection')}>
                <h2 className={cx('commentsTitle')}>Thảo luận ({comments.length})</h2>

                {/* Ô NHẬP BÌNH LUẬN MỚI */}
                {userId ? (
                  <div className={cx('commentInputWrapper')}>
                    <img className={cx('myAvatar')} src={userAvatar} alt="my_avatar" />
                    <textarea ref={commentRef} placeholder="Bạn đang nghĩ gì về bài viết này?" className={cx('commentTextarea')} />
                    <button className={cx('submitBtn')} onClick={handleSubmitComment}>
                      Gửi
                    </button>
                  </div>
                ) : (
                  <div className={cx('notLogin')}>Vui lòng đăng nhập để bình luận</div>
                )}

                <div className={cx('timeline')}>
                  {comments.map((c, idx) => (
                    <div key={c.id} className={cx('timelineItem')}>
                      <div className={cx('timelineDotWrap')}>
                        <Link to={paths.publicProfile.replace(':id', c.author?.id)} className={cx('timelineAvatarLink')}>
                          <img className={cx('timelineAvatar')} src={c.author?.urlImage} alt={c.author?.name} />
                        </Link>
                        {idx !== comments.length - 1 && <span className={cx('timelineLine')}></span>}
                      </div>
                      <div className={cx('timelineContent')} style={{ backgroundImage: `url(${c.author?.bgComment})` }}>
                        <div className={cx('timelineInfo')}>
                          <div className={cx('authorSection')}>
                            <div className={cx('d-flex flex-column')}>
                              <span className={cx('commentAuthor')}>{c.author?.name}</span>
                              <span className={cx('commentDate')}>{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                            </div>

                            {c.badge && (
                              <div className={cx('commentBadges')}>
                                {c.badge.map((badge, index) => (
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
                                    <img src={badge.iconUrl} alt={badge.name} className={cx('badgeIcon')} style={{ cursor: 'pointer' }} />
                                  </Tooltip>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={cx('commentText')}>{c.content}</div>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && <div className={cx('noComments')}>Chưa có bình luận nào. Hãy chia sẻ ý kiến của bạn!</div>}
                </div>
              </section>
            </div>

            {/* CỘT PHỤ - THÔNG TIN TÁC GIẢ/DANH MỤC */}
            <aside className={cx('sideColumn')}>
              <div className={cx('stickyAside')}>
                <div className={cx('authorInfoCard')}>
                  <h3>Tác giả</h3>
                  <div className={cx('authorInfoBody')}>
                    <img className={cx('avatarInfo')} src={post.author?.urlImage} alt="avatar" />
                    <div className={cx('authorInfoDetails')}>
                      <strong>{post.author?.name}</strong>
                      <p>Đã đăng {post.author?.postsCount || 10} bài viết</p>
                    </div>
                  </div>
                  <button className={cx('followBtn')} onClick={handleFollowUser}>
                    {isFollow ? 'Đang theo dõi' : 'Theo dõi'}
                  </button>
                </div>

                {/* Gợi ý bài viết (Chưa có API, demo UI) */}
                <div className={cx('suggestedCard')}>
                  <h3>Gợi ý</h3>
                  <ul>
                    {recommendations.map((rec) => (
                      <li key={rec.id}>
                        <a href={paths.postDetail.replace(':id', rec.id)}>{rec.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
