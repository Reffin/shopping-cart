import { useState, useEffect } from "react";
import { getReviews, createReview, deleteReview } from "../api";
import { useAuth } from "../context/AuthContext";

function StarRating({ rating, onRate, interactive = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-2xl transition-all ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <span className={star <= (hovered || rating) ? "text-yellow-400" : "text-gray-300"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Reviews({ productId }) {
  const { token, user, isLoggedIn } = useAuth();
  const [data, setData] = useState({ reviews: [], avgRating: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const result = await getReviews(productId);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError("Please select a rating");
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createReview(productId, { rating, comment }, token);
      setRating(0);
      setComment("");
      setSuccess("Review submitted successfully!");
      await loadReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await deleteReview(reviewId, token);
      await loadReviews();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white rounded-2xl shadow-sm p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-gray-800">
            Customer Reviews
          </h2>
          {data.total > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(data.avgRating)} />
              <span className="font-bold text-gray-800">{data.avgRating}</span>
              <span className="text-gray-500 text-sm">({data.total} reviews)</span>
            </div>
          )}
        </div>

        {/* Write Review Form */}
        {isLoggedIn ? (
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Write a Review</h3>
            {error && <p className="text-red-500 text-sm mb-2">⚠️ {error}</p>}
            {success && <p className="text-green-500 text-sm mb-2">✅ {success}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Your Rating</p>
                <StarRating rating={rating} onRate={setRating} interactive={true} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Your Review</p>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  required
                  placeholder="Share your experience with this product..."
                  rows={3}
                  maxLength={500}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
                />
                <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-xl transition-all text-sm"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <p className="text-gray-500 text-sm">Please <span className="text-orange-500 font-semibold">login</span> to write a review.</p>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-4 rounded w-1/4 mb-2" />
                <div className="bg-gray-200 h-4 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : data.reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">⭐</p>
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.reviews.map(review => (
              <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{review.user?.name || "Anonymous"}</p>
                    <StarRating rating={review.rating} />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    {user && review.user?._id === user.id && (
                      <button onClick={() => handleDelete(review._id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}