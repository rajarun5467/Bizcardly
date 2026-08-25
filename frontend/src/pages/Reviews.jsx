import { useState, useEffect } from 'react';
import { FaStar, FaTrashAlt, FaCommentDots, FaEnvelope, FaUser } from 'react-icons/fa';
import { API_BASE_URL } from '../api/config';
import toast from 'react-hot-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('bizcardly_token');
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const token = localStorage.getItem('bizcardly_token');
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter(r => r._id !== id));
        toast.success('Review deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete review');
      }
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <FaStar
            key={n}
            className="text-sm"
            style={{ color: n <= rating ? '#f59e0b' : '#d1d5db' }}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reviews & Feedback</h2>
          <p className="text-gray-600">Customer reviews and testimonials</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-shimmer">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-in-left">
        <h2 className="text-2xl font-black text-[#11142f]">Reviews & Feedback</h2>
        <p className="text-gray-600">Customer reviews and testimonials</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efeaff]">
              <FaCommentDots className="text-2xl text-[#7557f4]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Reviews</p>
              <h3 className="mt-1 text-2xl font-black text-[#11142f]">{reviews.length}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0df]">
              <FaStar className="text-2xl text-[#ff8b22]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Average Rating</p>
              <h3 className="mt-1 text-2xl font-black text-[#11142f]">{avgRating} / 5</h3>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f8ee]">
              <FaUser className="text-2xl text-[#20aa69]" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">5-Star Reviews</p>
              <h3 className="mt-1 text-2xl font-black text-[#11142f]">
                {reviews.filter(r => r.rating === 5).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm ring-1 ring-slate-200/80">
          <FaCommentDots className="mx-auto text-4xl text-slate-300 mb-4" />
          <p className="text-slate-500">No reviews yet. Reviews submitted on your business card will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(review => (
            <div
              key={review._id}
              className="group rounded-lg bg-white p-5 shadow-[0_12px_28px_rgba(40,51,92,0.08)] ring-1 ring-slate-200/80 transition hover:shadow-[0_18px_34px_rgba(82,91,170,0.16)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6657f1] to-[#5546dc] text-sm font-black text-white">
                    {review.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#11142f]">{review.name}</h4>
                    {review.email && (
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <FaEnvelope className="text-[10px]" /> {review.email}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  title="Delete review"
                >
                  <FaTrashAlt />
                </button>
              </div>

              <div className="mt-3">
                {renderStars(review.rating)}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.review}</p>

              <p className="mt-3 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
