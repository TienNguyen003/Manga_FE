import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';

import { communityService } from '~/services/communityService';
import { getRecommendationPosts } from '~/services/recommendationService';
import { useUser } from '~/providers/UserContext';
import paths from '~/routes/paths';
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
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    communityService
      .getPostComments(id)
      .then((res) => {
        if (!mounted) return;
        setPost(res?.result?.post || null);
        setComments(res?.result?.comments || []);
      })
      .catch(() => {
        if (mounted) setError('Không thể tải chi tiết bài viết.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    getRecommendationPosts({ userId: userId || undefined, limit: 5 })
      .then((res) => {
        if (!mounted) return;
        setRecommendations(res?.result || []);
      })
      .catch(() => {
        if (mounted) setError('Không thể tải bài viết gợi ý.');
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

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
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className={cx('postDetailPage')}>
      <div className={cx('container')}>
        <button className={cx('backBtn')} onClick={() => navigate(-1)}>
          ← TRỞ LẠI
        </button>

        {loading && <div className={cx('statusMsg')}>Đang tải nội dung bài viết...</div>}
        {error && <div className={cx('statusMsg', 'error')}>{error}</div>}

        {!loading && post && (
          <div className={cx('contentWrapper')}>
            {/* CỘT CHÍNH - NỘI DUNG VÀ BÌNH LUẬN */}
            <div className={cx('mainColumn')}>
              <article className={cx('postCard')}>
                <header className={cx('cardHeader')}>
                  <img className={cx('avatarLarge')} src={post.author?.urlImage} alt="avatar" />
                  <div className={cx('postMeta')}>
                    <span className={cx('authorName')}>{post.author?.username}</span>
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
                <div className={cx('commentInputWrapper')}>
                  <img className={cx('myAvatar')} src={userAvatar || post.author?.urlImage} alt="my_avatar" />
                  <textarea ref={commentRef} placeholder="Bạn đang nghĩ gì về bài viết này?" className={cx('commentTextarea')} />
                  <button className={cx('submitBtn')} onClick={handleSubmitComment}>
                    Gửi
                  </button>
                </div>

                <div className={cx('timeline')}>
                  {comments.map((c, idx) => (
                    <div key={c.id} className={cx('timelineItem')}>
                      <div className={cx('timelineDotWrap')}>
                        <img className={cx('timelineAvatar')} src={c.author?.urlImage} alt="avatar" />
                        {idx !== comments.length - 1 && <span className={cx('timelineLine')}></span>}
                      </div>
                      <div className={cx('timelineContent')}>
                        <div className={cx('timelineInfo')}>
                          <span className={cx('commentAuthor')}>{c.author?.username}</span>
                          <span className={cx('commentDate')}>{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
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
                      <strong>{post.author?.username}</strong>
                      <p>Đã đăng {post.author?.postsCount || 10} bài viết</p>
                    </div>
                  </div>
                  <button className={cx('followBtn')}>Theo dõi</button>
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
