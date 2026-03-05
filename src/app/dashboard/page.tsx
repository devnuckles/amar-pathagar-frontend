"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { booksAPI } from "@/lib/api";
import { handoverAPI } from "@/lib/handoverApi";
import ConfirmModal from "@/components/confirm.modal";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { success, error } = useToastStore();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    booksReading: 0,
  });
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myCurrentBooks, setMyCurrentBooks] = useState<any[]>([]);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [handoverThreads, setHandoverThreads] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmColor?: "red" | "green" | "blue" | "orange";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, _hasHydrated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadMyRequests();
      loadMyCurrentBooks();
      loadReadingHistory();
      loadHandoverThreads();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      const response = await booksAPI.getAll();
      const books = response.data.data || [];
      setStats({
        totalBooks: books.length,
        availableBooks: books.filter((b: any) => b.status === "available")
          .length,
        booksReading: books.filter((b: any) => b.status === "reading").length,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadMyRequests = async () => {
    try {
      const response = await booksAPI.getMyRequests();
      const requestsData = response.data.data || response.data || [];
      setMyRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error("Failed to load requests:", error);
      setMyRequests([]);
    }
  };

  const loadMyCurrentBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      const books = response.data.data || [];
      // Filter books where current user is the holder
      const myBooks = books.filter(
        (b: any) => b.current_holder_id === user?.id,
      );
      setMyCurrentBooks(myBooks);
    } catch (error) {
      console.error("Failed to load current books:", error);
      setMyCurrentBooks([]);
    }
  };

  const loadReadingHistory = async () => {
    try {
      const response = await booksAPI.getMyReadingHistory();
      const historyData = response.data.data || response.data || [];
      setReadingHistory(
        Array.isArray(historyData) ? historyData.slice(0, 5) : [],
      );
    } catch (error) {
      console.error("Failed to load reading history:", error);
      setReadingHistory([]);
    }
  };

  const loadHandoverThreads = async () => {
    try {
      const response = await handoverAPI.getUserHandoverThreads();
      const threadsData = response.data.data || response.data || [];
      // Filter to only show active threads
      const activeThreads = Array.isArray(threadsData)
        ? threadsData.filter((t: any) => t.status === "active")
        : [];
      setHandoverThreads(activeThreads);
    } catch (error) {
      console.error("Failed to load handover threads:", error);
      setHandoverThreads([]);
    }
  };

  const handleCancelRequest = async (bookId: string, bookTitle: string) => {
    try {
      await booksAPI.cancelRequest(bookId);
      success(`Request for "${bookTitle}" cancelled successfully!`);
      loadMyRequests();
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to cancel request");
    }
  };

  const handleReturnBook = (bookId: string, bookTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Return Book",
      message: `Return "${bookTitle}"? This will make it available for others.`,
      confirmText: "Return Book",
      confirmColor: "green",
      onConfirm: async () => {
        try {
          await booksAPI.returnBook(bookId);
          success(`"${bookTitle}" returned successfully!`);
          loadMyCurrentBooks();
          loadStats();
          loadReadingHistory();
        } catch (err: any) {
          error(err.response?.data?.error || "Failed to return book");
        }
      },
    });
  };

  if (!_hasHydrated || !isAuthenticated || !user) {
    return null;
  }

  const getScoreStatus = (score: number) => {
    if (score >= 100)
      return { label: "Excellent Standing", color: "text-green-700" };
    if (score >= 50) return { label: "Good Standing", color: "text-blue-700" };
    if (score >= 20)
      return { label: "Fair Standing", color: "text-yellow-700" };
    return { label: "Low Priority", color: "text-red-700" };
  };

  const scoreStatus = getScoreStatus(user.success_score);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="space-y-6 md:space-y-8">
        {/* Compact Header with Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Welcome Card */}
          <div className="lg:col-span-2 border-4 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <div className="text-5xl">👤</div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-1">
                  {user.full_name || user.username}
                </h1>
                <p className="text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                  Member Since{" "}
                  {new Date(user.created_at || Date.now()).getFullYear()}
                </p>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📖</span>
                    <div>
                      <p className="text-lg font-bold">{user.books_received}</p>
                      <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Read</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤝</span>
                    <div>
                      <p className="text-lg font-bold">{user.books_shared}</p>
                      <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Shared</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <div>
                      <p className="text-lg font-bold">
                        {user.total_upvotes || 0}
                      </p>
                      <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Upvotes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Score Card */}
          <div className="border-4 bg-gradient-to-br from-old-ink to-gray-800 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <div className="absolute top-0 right-0 text-9xl opacity-10">⭐</div>
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-widest opacity-75 mb-2">
                Success Score
              </p>
              <p className="text-6xl font-bold mb-2">{user.success_score}</p>
              <div
                className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 ${
                  user.success_score >= 100
                    ? "border-green-400 text-green-400"
                    : user.success_score >= 50
                      ? "border-blue-400 text-blue-400"
                      : user.success_score >= 20
                        ? "border-yellow-400 text-yellow-400"
                        : "border-red-400 text-red-400"
                }`}
              >
                {scoreStatus.label}
              </div>
            </div>
          </div>
        </div>

        {/* Library Statistics - More Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="border-4 style={{ backgroundImage: 'linear-gradient(to bottom right, var(--card), var(--muted))' }} p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all" style={{ borderColor: 'var(--border)' }}>
            <div className="absolute -bottom-4 -right-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">
              📚
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📚</span>
                <span className="vintage-badge text-xs">Total</span>
              </div>
              <p className="text-5xl font-bold mb-2">{stats.totalBooks}</p>
              <p className="text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                Books in Collection
              </p>
            </div>
          </div>

          <div className="border-4 border-green-600 bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-[4px_4px_0px_0px_rgba(22,163,74,0.3)] relative overflow-hidden group hover:shadow-[6px_6px_0px_0px_rgba(22,163,74,0.4)] transition-all">
            <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">
              ✓
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">✓</span>
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold uppercase">
                  Available
                </span>
              </div>
              <p className="text-5xl font-bold mb-2 text-green-700">
                {stats.availableBooks}
              </p>
              <p className="text-sm uppercase tracking-wider text-green-800">
                Ready to Borrow
              </p>
            </div>
          </div>

          <div className="border-4 border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.3)] relative overflow-hidden group hover:shadow-[6px_6px_0px_0px_rgba(37,99,235,0.4)] transition-all">
            <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 group-hover:opacity-20 transition-opacity">
              📖
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">📖</span>
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold uppercase">
                  Active
                </span>
              </div>
              <p className="text-5xl font-bold mb-2 text-blue-700">
                {stats.booksReading}
              </p>
              <p className="text-sm uppercase tracking-wider text-blue-800">
                In Circulation
              </p>
            </div>
          </div>
        </div>

        {/* My Book Requests - Compact and Classic */}
        {myRequests.length > 0 && (
          <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="bg-gradient-to-r from-old-ink to-gray-800 p-3 border-b-4 flex items-center justify-between" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">📬</span>
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">
                  My Book Requests
                </h2>
              </div>
              <span className="px-2 py-1 text-xs font-bold" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
                {myRequests.length}
              </span>
            </div>
            <div className="p-4">
              {/* Table Header - Desktop Only */}
              <div className="hidden md:grid md:grid-cols-12 gap-3 pb-2 mb-3 border-b-2 text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
                <div className="col-span-5">Book</div>
                <div className="col-span-3">Author</div>
                <div className="col-span-2">Requested</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Book Requests List */}
              <div className="space-y-2">
                {myRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border-2 hover: transition-all bg-gradient-to-r from-white to-gray-50 items-center" style={{ borderColor: 'var(--border)' }}
                  >
                    {/* Book Title */}
                    <div className="md:col-span-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📕</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold uppercase text-sm truncate">
                            {request.book?.title || "Unknown Book"}
                          </h3>
                          <span className="vintage-badge text-xs mt-1 inline-block">
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Author - Desktop */}
                    <div className="md:col-span-3 hidden md:block">
                      <p className="text-sm truncate" style={{ color: 'var(--muted-foreground)' }}>
                        {request.book?.author || "Unknown Author"}
                      </p>
                    </div>

                    {/* Date - Desktop */}
                    <div className="md:col-span-2 hidden md:block">
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {new Date(request.requested_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex gap-2 justify-end">
                      <button
                        className="px-3 py-1 border-2 hover: hover: font-bold uppercase text-xs tracking-wider transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                        onClick={() => router.push(`/books/${request.book_id}`)}
                        title="View book details"
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 border-2 border-red-600 text-red-600 font-bold uppercase text-xs
                                 hover:bg-red-600 hover:text-white transition-all tracking-wider"
                        onClick={() =>
                          handleCancelRequest(
                            request.book_id,
                            request.book?.title || "this book",
                          )
                        }
                        title="Cancel request"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Mobile Info */}
                    <div className="md:hidden text-xs flex items-center gap-3" style={{ color: 'var(--muted-foreground)' }}>
                      <span>{request.book?.author || "Unknown Author"}</span>
                      <span>•</span>
                      <span>
                        {new Date(request.requested_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Currently Reading Books */}
        {myCurrentBooks.length > 0 && (
          <div className="border-4 border-blue-600 shadow-[6px_6px_0px_0px_rgba(37,99,235,0.3)]" style={{ backgroundColor: 'var(--card)' }}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 border-b-4 border-blue-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">
                  Currently Reading
                </h2>
              </div>
              <span className="px-2 py-1 text-blue-600 text-xs font-bold" style={{ backgroundColor: 'var(--card)' }}>
                {myCurrentBooks.length}
              </span>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {myCurrentBooks.map((book: any) => (
                  <div
                    key={book.id}
                    className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white p-4 hover:border-blue-600 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">📖</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold uppercase text-lg mb-1 truncate">
                          {book.title}
                        </h3>
                        <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                          {book.author}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold uppercase text-xs tracking-wider transition-all" style={{ backgroundColor: 'var(--card)' }}
                            onClick={() => router.push(`/books/${book.id}`)}
                          >
                            View Details
                          </button>
                          <button
                            className="px-4 py-2 border-2 border-green-600 bg-green-600 text-white hover:bg-green-700 
                                     font-bold uppercase text-xs tracking-wider transition-all"
                            onClick={() =>
                              handleReturnBook(book.id, book.title)
                            }
                          >
                            ✓ Return Book
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Handover Threads */}
        {handoverThreads.length > 0 && (
          <div className="border-4 border-orange-600 shadow-[6px_6px_0px_0px_rgba(234,88,12,0.3)]" style={{ backgroundColor: 'var(--card)' }}>
            <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-3 border-b-4 border-orange-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔄</span>
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">
                  Active Handovers
                </h2>
              </div>
              <span className="px-2 py-1 text-orange-600 text-xs font-bold" style={{ backgroundColor: 'var(--card)' }}>
                {handoverThreads.length}
              </span>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {handoverThreads.map((thread: any) => (
                  <div
                    key={thread.id}
                    className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-white p-4 hover:border-orange-600 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold uppercase text-sm mb-2 truncate">
                          {thread.book?.title || "Unknown Book"}
                        </h3>
                        <div className="space-y-1 text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                          <div className="flex items-center gap-2">
                            <span>From:</span>
                            <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                              {thread.current_holder?.full_name ||
                                thread.current_holder?.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>To:</span>
                            <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                              {thread.next_reader?.full_name ||
                                thread.next_reader?.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Status:</span>
                            <span
                              className={`px-2 py-0.5 text-xs font-bold uppercase ${
                                thread.delivery_status === "delivered"
                                  ? "bg-green-600 text-white"
                                  : thread.delivery_status === "in_transit"
                                    ? "bg-orange-600 text-white"
                                    : "bg-gray-600 text-white"
                              }`}
                            >
                              {thread.delivery_status?.replace("_", " ") ||
                                "Not Started"}
                            </span>
                          </div>
                        </div>
                        <button
                          className="px-4 py-2 border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white font-bold uppercase text-xs tracking-wider transition-all" style={{ backgroundColor: 'var(--card)' }}
                          onClick={() => router.push(`/handover/${thread.id}`)}
                        >
                          Open Thread →
                        </button>
                      </div>
                      <span className="text-3xl">💬</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reading History */}
        {readingHistory.length > 0 && (
          <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="bg-gradient-to-r from-old-ink to-gray-800 p-3 border-b-4 flex items-center justify-between" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">
                  Recent Reading History
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {readingHistory.map((history: any) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-3 border-2 hover: transition-all bg-gradient-to-r from-white to-gray-50" style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">✓</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold uppercase text-sm truncate">
                          {history.book?.title || "Unknown Book"}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {history.end_date
                            ? `Completed ${new Date(history.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                            : `Started ${new Date(history.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                        </p>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1 border-2 hover: hover: font-bold uppercase text-xs tracking-wider transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                      onClick={() => router.push(`/books/${history.book_id}`)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigation - More Visual */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="bg-gradient-to-r from-old-ink to-gray-800 p-4 border-b-4" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-center flex items-center justify-center gap-3">
              <span className="text-2xl">🧭</span>
              Quick Navigation
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <NavCard
                icon="📚"
                title="Browse Books"
                description="Explore collection"
                onClick={() => router.push("/books")}
              />
              <NavCard
                icon="📖"
                title="My Library"
                description="Bookmarks & reads"
                onClick={() => router.push("/my-library")}
              />
              <NavCard
                icon="📜"
                title="History"
                description="Reading journey"
                onClick={() => router.push("/reading-history")}
              />
              <NavCard
                icon="⭐"
                title="Reviews"
                description="Rate & review"
                onClick={() => router.push("/reviews")}
              />
              <NavCard
                icon="🏆"
                title="Leaderboard"
                description="Top contributors"
                onClick={() => router.push("/leaderboard")}
              />
              <NavCard
                icon="🎁"
                title="Donate"
                description="Support us"
                onClick={() => router.push("/donations")}
              />
              <NavCard
                icon="🔄"
                title="Handovers"
                description="Book exchanges"
                onClick={() => router.push("/handover")}
              />
              <NavCard
                icon="✏️"
                title="Edit Profile"
                description="Update info"
                onClick={() => router.push("/profile/edit")}
              />
              <NavCard
                icon="👤"
                title="My Profile"
                description="View public profile"
                onClick={() => router.push(`/users/${user?.id}`)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
      />
    </div>
  );
}

function NavCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-5 border-4 hover: hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all style={{ backgroundImage: 'linear-gradient(to bottom right, var(--card), var(--muted))' }} group" style={{ borderColor: 'var(--border)' }}
    >
      <div className="text-center">
        <div className="text-5xl mb-3 group-hover:scale-125 transition-transform">
          {icon}
        </div>
        <p className="font-bold uppercase tracking-wider text-sm mb-1">
          {title}
        </p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
      </div>
    </button>
  );
}
