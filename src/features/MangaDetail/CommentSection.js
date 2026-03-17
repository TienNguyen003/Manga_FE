import React, { useEffect, useState, useCallback, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './CommentSection.module.scss';
import { useUser } from '~/providers/UserContext';
import { getComments, getReplies, postComment, likeComment, unlikeComment, deleteComment } from '~/services/commentService';
import { connectStomp, subscribe, disconnectStomp } from '~/lib/realtime';
import { LoadingSpinner, EmptyState } from '~/components/common/AsyncState';

const cx = classNames.bind(styles);

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function CommentItem({ comment, userId, mangaPath, chapterName, onDelete }) {
  const [liked, setLiked] = useState(comment.likedByCurrentUser);
  const [likesCount, setLikesCount] = useState(comment.totalLikes || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async () => {
    if (!userId) return;
    // Optimistic
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      if (wasLiked) {
        await unlikeComment({ commentId: comment.id, userId });
      } else {
        await likeComment({ commentId: comment.id, userId });
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const toggleReplies = async () => {
    if (!repliesLoaded) {
      setRepliesLoading(true);
      try {
        const res = await getReplies({ parentCommentId: comment.id, currentUserId: userId || '' });
        setReplies(res?.result || []);
        setRepliesLoaded(true);
      } catch {
        /* ignore */
      } finally {
        setRepliesLoading(false);
      }
    }
    setShowReplies((v) => !v);
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || !userId || submitting) return;
    setSubmitting(true);
    try {
      const res = await postComment({
        userId,
        mangaPath,
        chapterName,
        content: replyText.trim(),
        parentCommentId: comment.id,
      });
      const newReply = res?.result || res;
      setReplies((prev) => [...prev, newReply]);
      setReplyText('');
      setShowReplyInput(false);
      if (!showReplies) setShowReplies(true);
    } catch {
      /* ignore, toast handled by http interceptor */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cx('comment')}>
      <div className={cx('commentAvatar')}>{(comment.userDisplayName || comment.username || '?').charAt(0).toUpperCase()}</div>
      <div className={cx('commentBody')}>
        <div className={cx('commentHeader')}>
          <span className={cx('commentUser')}>{comment.userDisplayName || comment.username}</span>
          <span className={cx('commentTime')}>{timeAgo(comment.createdAt)}</span>
          {userId === String(comment.userId) && (
            <button className={cx('deleteBtn')} onClick={() => onDelete(comment.id)} title="Xóa bình luận">
              <i className="fa-solid fa-trash-can"></i>
            </button>
          )}
        </div>
        <p className={cx('commentContent')}>{comment.content}</p>
        <div className={cx('commentActions')}>
          <button className={cx('actionBtn', { liked })} onClick={handleLike} disabled={!userId}>
            <i className={liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
            <span>{likesCount}</span>
          </button>
          {userId && (
            <button className={cx('actionBtn')} onClick={() => setShowReplyInput((v) => !v)}>
              <i className="fa-regular fa-comment"></i>
              <span>Trả lời</span>
            </button>
          )}
          {comment.totalReplies > 0 && (
            <button className={cx('actionBtn', 'replyToggle')} onClick={toggleReplies}>
              <i className="fa-solid fa-chevron-down"></i>
              <span>
                {showReplies ? 'Ẩn' : 'Xem'} {comment.totalReplies} trả lời
              </span>
            </button>
          )}
        </div>

        {showReplyInput && (
          <div className={cx('replyInput')}>
            <input
              type="text"
              placeholder="Viết trả lời..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePostReply()}
              className={cx('inputField')}
            />
            <button className={cx('submitBtn')} onClick={handlePostReply} disabled={!replyText.trim() || submitting}>
              {submitting ? '...' : 'Gửi'}
            </button>
          </div>
        )}

        {repliesLoading && <LoadingSpinner text="" />}
        {showReplies && replies.length > 0 && (
          <div className={cx('replies')}>
            {replies.map((r) => (
              <CommentItem key={r.id} comment={r} userId={userId} mangaPath={mangaPath} chapterName={chapterName} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ mangaPath, chapterName }) {
  const { userId, username } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const stompRef = useRef(null);

  const loadComments = useCallback(async () => {
    if (!mangaPath || !chapterName) return;
    setLoading(true);
    try {
      const res = await getComments({ mangaPath, chapterName, currentUserId: userId || '' });
      setComments(res?.result || []);
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false);
    }
  }, [mangaPath, chapterName, userId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // WebSocket realtime
  useEffect(() => {
    if (!mangaPath) return;
    const client = connectStomp({
      onConnect: () => {
        subscribe(`/topic/comments/${mangaPath}`, (newCmt) => {
          setComments((prev) => {
            const exists = prev.some((c) => c.id === newCmt.id);
            if (exists) return prev;
            return [newCmt, ...prev];
          });
        });
      },
    });
    stompRef.current = client;
    return () => {
      disconnectStomp();
    };
  }, [mangaPath]);

  const handlePost = async () => {
    if (!newComment.trim() || !userId || submitting) return;
    setSubmitting(true);
    try {
      const res = await postComment({
        userId,
        mangaPath,
        chapterName,
        content: newComment.trim(),
      });
      const added = res?.result || res;
      setComments((prev) => [added, ...prev]);
      setNewComment('');
    } catch {
      /* handled by interceptor */
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!userId) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await deleteComment({ commentId, userId });
    } catch {
      loadComments();
    }
  };

  return (
    <div className={cx('section')}>
      <h3 className={cx('sectionTitle')}>
        <i className="fa-regular fa-comments"></i> Bình luận chương này
        {comments.length > 0 && <span className={cx('count')}>{comments.length}</span>}
      </h3>

      {/* Ô nhập bình luận */}
      {userId ? (
        <div className={cx('inputRow')}>
          <div className={cx('inputAvatar')}>{(username || '?').charAt(0).toUpperCase()}</div>
          <div className={cx('inputWrap')}>
            <textarea
              className={cx('textarea')}
              placeholder="Nhận xét về chương này..."
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePost();
                }
              }}
            />
            <button className={cx('postBtn')} onClick={handlePost} disabled={!newComment.trim() || submitting}>
              {submitting ? 'Đang gửi...' : 'Đăng'}
            </button>
          </div>
        </div>
      ) : (
        <p className={cx('loginNotice')}>
          <i className="fa-solid fa-lock"></i> Đăng nhập để bình luận.
        </p>
      )}

      {/* Danh sách bình luận */}
      {loading ? (
        <LoadingSpinner text="Đang tải bình luận..." />
      ) : comments.length === 0 ? (
        <EmptyState icon="💬" text="Chưa có bình luận nào. Hãy là người đầu tiên!" />
      ) : (
        <div className={cx('list')}>
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} userId={userId} mangaPath={mangaPath} chapterName={chapterName} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
