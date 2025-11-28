import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/formatDate";
import { Link } from "react-router-dom";

const Comments = ({ reportId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});
  const [showAllComments, setShowAllComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/reports/${reportId}/comments`);
      const data = response.data?.comments || [];
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert list → comment tree (only one level)
  const buildCommentTree = (list) => {
    const map = {};
    const roots = [];

    list.forEach((c) => (map[c._id] = { ...c, replies: [] }));

    list.forEach((c) => {
      const parent =
        typeof c.parentComment === "object"
          ? c.parentComment?._id
          : c.parentComment;

      if (parent && map[parent]) map[parent].replies.push(map[c._id]);
      else roots.push(map[c._id]);
    });

    return roots;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/reports/${reportId}/comments`, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/reports/${reportId}/comments`, {
        content: replyContent,
        parentComment: parentId,
      });
      setReplyContent("");
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  // Limits for non-authority users
  const myId = user?._id || user?.id;
  const myTopLevelCount = comments.filter(
    (c) => (c.author?._id === myId || c.author === myId) && !c.parentComment
  ).length;
  const myReplyCount = comments.filter(
    (c) => (c.author?._id === myId || c.author === myId) && !!c.parentComment
  ).length;
  const canPostTopLevel = !user || user.role === 'authority' || myTopLevelCount < 1;
  const canPostReply = !user || user.role === 'authority' || myReplyCount < 1;

  // Main comment UI
  const renderComment = (comment) => {
    const replies = comment.replies || [];
    const firstReply = replies[0];
    const restReplies = replies.slice(1);
    const isExpanded = expandedReplies[comment._id];

    return (
      <div key={comment._id} className="mt-4">
        {/* Main Comment */}
        <div className="bg-white rounded-lg p-3 shadow border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
              {comment.author?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div className="flex-1">
              {/* Name + Tag */}
              <p className="font-semibold text-sm flex items-center gap-2">
                {comment.author?.name}

                {comment.authorRoleTag === "authority" && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Authority
                  </span>
                )}
              </p>

              <p className="text-gray-600 text-sm mt-1">{comment.content}</p>

              <p className="text-xs text-gray-500 mt-1">
                {formatDate(comment.createdAt)}
              </p>

              {(user && canPostReply) && (
                <button
                  onClick={() => setReplyTo(comment._id)}
                  className="text-xs text-blue-600 mt-2"
                >
                  Reply
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Box */}
        {replyTo === comment._id && (
          <form
            onSubmit={(e) => handleReplySubmit(e, comment._id)}
            className="ml-10 mt-3 border-l-2 pl-3"
          >
            <textarea
              className="w-full border p-2 rounded text-sm"
              rows={2}
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              required
            />
            <div className="flex gap-2 mt-1">
              <button disabled={submitting} className="bg-blue-600 text-white px-3 py-1 text-xs rounded disabled:opacity-60 flex items-center justify-center">
                {submitting ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  'Post Reply'
                )}
              </button>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="bg-gray-200 px-3 py-1 text-xs rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* 1-Level Replies */}
        {firstReply && (
          <div className="ml-10 mt-3 pl-3 border-l-2">
            {renderReply(firstReply)}

            {/* View more replies */}
            {!isExpanded && restReplies.length > 0 && (
              <button
                onClick={() =>
                  setExpandedReplies((prev) => ({
                    ...prev,
                    [comment._id]: true,
                  }))
                }
                className="text-xs text-blue-600 mt-1"
              >
                View {restReplies.length} more repl
                {restReplies.length > 1 ? "ies" : "y"}
              </button>
            )}

            {/* Expanded replies */}
            {isExpanded &&
              restReplies.map((r) => (
                <div key={r._id} className="mt-2">
                  {renderReply(r)}
                </div>
              ))}

            {isExpanded && (
              <button
                onClick={() =>
                  setExpandedReplies((prev) => ({
                    ...prev,
                    [comment._id]: false,
                  }))
                }
                className="text-xs text-blue-600 mt-1"
              >
                Hide replies
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Single Reply UI
  const renderReply = (reply) => (
    <div className="bg-gray-50 p-2 rounded border text-sm">
      <p className="font-semibold text-xs flex items-center gap-2">
        {reply.author?.name}

        {reply.authorRoleTag === "authority" && (
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            Authority
          </span>
        )}
      </p>

      <p className="text-gray-600 text-sm">{reply.content}</p>

      <p className="text-xs text-gray-500 mt-1">
        {formatDate(reply.createdAt)}
      </p>
    </div>
  );

  if (loading) return <p className="text-center py-4">Loading comments...</p>;

  const commentTree = buildCommentTree(comments);

  return (
    <div>
      {/* Add Comment */}
      {user ? (
        canPostTopLevel ? (
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <textarea
              rows="3"
              className="w-full border rounded p-3 text-sm"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button disabled={submitting} className="mt-2 bg-blue-600 text-white px-4 py-2 text-sm rounded disabled:opacity-60 flex items-center justify-center">
              {submitting ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                'Post Comment'
              )}
            </button>
          </form>
        ) : (
          <div className="mb-4 text-xs text-gray-600 bg-gray-50 border rounded p-3">
            You can post only one comment per report.
          </div>
        )
      ) : (
        <p className="text-center text-sm mb-4">
          <Link to="/login" className="text-blue-600">
            Login
          </Link>{" "}
          to comment
        </p>
      )}

      {/* Show only 5 comments initially */}
      {(showAllComments ? commentTree : commentTree.slice(0, 5)).map((c) =>
        renderComment(c)
      )}

      {/* View More Comments */}
      {commentTree.length > 5 && (
        <button
          onClick={() => setShowAllComments((prev) => !prev)}
          className="text-xs text-blue-600 mt-3 font-medium"
        >
          {showAllComments
            ? "Show fewer comments"
            : `View more comments (${commentTree.length - 5})`}
        </button>
      )}
    </div>
  );
};

export default Comments;
