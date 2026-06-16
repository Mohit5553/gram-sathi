import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import Button from '../../components/ui/Button';
import BookingTimeline from '../../components/bookings/BookingTimeline';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RatingStarsInput = ({ value, onChange, label }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, idx) => {
          const starVal = idx + 1;
          const isActive = hovered ? starVal <= hovered : starVal <= value;
          return (
            <button
              type="button"
              key={idx}
              onClick={() => onChange(starVal)}
              onMouseEnter={() => setHovered(starVal)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none transition-all hover:scale-110 active:scale-95"
            >
              <Star 
                className={`w-6 h-6 cursor-pointer transition-colors ${
                  isActive ? 'fill-amber-400 text-amber-400' : 'text-slate-200 hover:text-slate-300'
                }`} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

const UserBookings = ({ hideTitle = false }) => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [providerRating, setProviderRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleOpenReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setRating(5);
    setProviderRating(5);
    setServiceRating(5);
    setReviewText('');
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewText.trim().length < 10) {
      toast.error('Review text must be at least 10 characters long.');
      return;
    }
    try {
      setReviewSubmitting(true);
      await api.post(`/booking/${selectedBookingForReview._id}/review`, {
        rating,
        providerRating,
        serviceRating,
        reviewText: reviewText.trim()
      });
      toast.success('Review submitted successfully!');
      setIsReviewModalOpen(false);
      fetchBookings(pagination.current);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      // Fixed API endpoint to singular '/booking' matching backend routes
      const response = await api.get(`/booking?page=${page}&limit=10`);
      setBookings(response.data.data || []);
      setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    
    const handleBookingUpdate = () => {
      fetchBookings(pagination.current); 
    };

    socket.on('bookingStatusUpdated', handleBookingUpdate);
    return () => {
      socket.off('bookingStatusUpdated', handleBookingUpdate);
    };
  }, [socket, pagination.current]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      // Fixed API endpoint to singular '/booking'
      await api.put(`/booking/${id}/status`, { status: 'cancelled' });
      toast.success('Booking request cancelled successfully');
      fetchBookings(pagination.current);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Client side splits
  const activeBookings = bookings.filter(b => ['pending', 'accepted', 'in_progress'].includes(b.status));
  const historyBookings = bookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status));
  const currentList = activeTab === 'active' ? activeBookings : historyBookings;

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-sky-600"></div>
      </div>
    );
  }

  return (
    <div className={hideTitle ? "" : "p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto"}>
      {!hideTitle && (
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-heading">My Bookings</h1>
          <p className="text-slate-500 mt-2 text-sm">View details of machinery, tools, and labor jobs you booked.</p>
        </header>
      )}

      {/* Booking Tab controls */}
      <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200 w-full max-w-sm">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Active Bookings ({activeBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Past History ({historyBookings.length})
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-600">
          {error}
        </div>
      )}
      
      {currentList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 shadow-sm">
          <CalendarDays className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p>No {activeTab} bookings found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentList.map(booking => (
              <article key={booking._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative">
                <div>
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-lg font-bold text-slate-900 capitalize font-heading">
                      {booking.serviceType} Booking
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Reserved Date</span>
                      <span className="text-slate-800 font-semibold">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Service Address</span>
                      <span className="text-slate-800 font-semibold text-right max-w-[200px] truncate" title={booking.address}>{booking.address}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Total Amount</span>
                      <span className="text-emerald-600 font-black">₹{booking.totalAmount}</span>
                    </div>
                    {booking.durationHours && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">Estimated Duration</span>
                        <span className="text-slate-800 font-semibold">{booking.durationHours} hours</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm border-t border-slate-100 pt-2 mt-2">
                      <span className="text-slate-400 font-medium">Payment Mode</span>
                      <span className="text-slate-800 font-bold">{booking.paymentMethod || 'Cash'}</span>
                    </div>

                    {(booking.status === 'accepted' || booking.status === 'in_progress' || booking.status === 'completed') && booking.providerContact && (
                      <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mt-4">
                        <h4 className="text-sm font-bold text-sky-900 mb-2">Provider Contact Details</h4>
                        <p className="text-xs text-sky-800 flex justify-between">
                          <span>Name:</span> <strong>{booking.providerName}</strong>
                        </p>
                        <p className="text-xs text-sky-800 flex justify-between mt-1">
                          <span>Phone:</span> <strong>{booking.providerContact}</strong>
                        </p>
                        {booking.status !== 'completed' && (
                          <p className="text-[11px] text-sky-600 mt-2 bg-white p-2 rounded border border-sky-100 leading-normal">
                            Pay <strong>₹{booking.totalAmount}</strong> to the provider via <strong>{booking.paymentMethod || 'Cash'}</strong>.
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Booking Timeline */}
                    {booking.timeline && booking.timeline.length > 0 && (
                      <BookingTimeline booking={booking} timeline={booking.timeline} />
                    )}

                    {booking.status === 'completed' && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        {booking.review ? (
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-1 text-amber-500 mb-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3.5 h-3.5 ${i < booking.review.rating ? 'fill-current text-amber-400' : 'text-slate-200'}`} 
                                />
                              ))}
                              <span className="text-xs font-bold text-slate-500 ml-1">Overall</span>
                            </div>
                            <p className="text-xs text-slate-600 italic leading-relaxed">
                              "{booking.review.reviewText}"
                            </p>
                            <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              <span>Provider Rating: {booking.review.providerRating}/5</span>
                              <span>Service Rating: {booking.review.serviceRating}/5</span>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="edit"
                            size="sm"
                            className="w-full text-white"
                            onClick={() => handleOpenReviewModal(booking)}
                          >
                            Rate & Review
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {(booking.status === 'pending' || booking.status === 'accepted') && (
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <Button 
                      variant="delete"
                      size="sm"
                      className="w-full text-white"
                      onClick={() => handleCancel(booking._id)}
                    >
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm mt-8">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Showing page <span className="font-bold text-slate-700">{pagination.current}</span> of <span className="font-bold text-slate-700">{pagination.pages}</span> ({pagination.total} total)
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fetchBookings(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      className="relative inline-flex items-center rounded-l-md rounded-r-none border-r-0 h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fetchBookings(pagination.current + 1)}
                      disabled={pagination.current === pagination.pages}
                      className="relative inline-flex items-center rounded-r-md rounded-l-none h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review & Rating Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedBookingForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg font-heading">Rate & Review Service</h3>
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors text-xl font-bold focus:outline-none"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="p-6 space-y-5">
                <div className="space-y-4">
                  <RatingStarsInput 
                    label="Overall Service Star Rating" 
                    value={rating} 
                    onChange={setRating} 
                  />
                  <RatingStarsInput 
                    label="Provider Rating (Conduct & Professionalism)" 
                    value={providerRating} 
                    onChange={setProviderRating} 
                  />
                  <RatingStarsInput 
                    label="Equipment / Service Rating (Quality & Quality of Work)" 
                    value={serviceRating} 
                    onChange={setServiceRating} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Written Review</label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about your experience (minimum 10 characters)..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none leading-normal"
                    required
                  />
                  <span className="text-[10px] text-slate-400 font-semibold self-end">
                    {reviewText.length}/500 chars (Min: 10)
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={() => setIsReviewModalOpen(false)}
                    disabled={reviewSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="approve"
                    isLoading={reviewSubmitting}
                  >
                    Submit Review
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserBookings;
