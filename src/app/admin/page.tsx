"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { booksAPI } from "@/lib/api";
import { adminAPI } from "@/lib/adminApi";
import StatCard from "@/components/admin/stat.card";
import TabButton from "@/components/admin/tab.button";
import OverviewTab from "@/components/admin/overview.tab";
import RequestsTab from "@/components/admin/requests.tab";
import UsersTab from "@/components/admin/users.tab";
import BooksTab from "@/components/admin/books.tab";
import ConfirmModal from "@/components/confirm.modal";

type TabType = "overview" | "requests" | "users" | "books";

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const { success, error } = useToastStore();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    category: "",
    physical_code: "",
    max_reading_days: 14,
  });
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
    } else if (_hasHydrated && isAuthenticated && user?.role !== "admin") {
      router.push("/dashboard");
    } else if (_hasHydrated && isAuthenticated && user?.role === "admin") {
      loadData();
    }
  }, [isAuthenticated, user, _hasHydrated, router]);

  const loadData = async () => {
    try {
      const [statsRes, requestsRes, usersRes, booksRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingRequests(),
        adminAPI.getAllUsers(),
        adminAPI.getAllBooks(),
      ]);
      setStats(statsRes.data.data || statsRes.data);

      const requestsData = requestsRes.data.data || requestsRes.data;
      setPendingRequests(Array.isArray(requestsData) ? requestsData : []);

      const usersData = usersRes.data.data || usersRes.data;
      setUsers(Array.isArray(usersData) ? usersData : []);

      const booksData = booksRes.data.data || booksRes.data;
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (err: any) {
      console.error("Failed to load admin data:", err);
      error("Failed to load admin data");
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await booksAPI.create(bookForm);
      setBookForm({
        title: "",
        author: "",
        isbn: "",
        description: "",
        category: "",
        physical_code: "",
        max_reading_days: 14,
      });
      setShowAddBook(false);
      success("Book added successfully!");
      loadData();
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to add book");
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    try {
      await adminAPI.approveRequest(requestId, dueDate.toISOString());
      success("Request approved successfully!");
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await adminAPI.rejectRequest(requestId, reason);
      success("Request rejected");
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to reject request");
    }
  };

  const handleAdjustScore = async (userId: string, username: string) => {
    const amountStr = prompt(
      `Adjust success score for ${username}:\nEnter amount (positive or negative):`,
    );
    if (!amountStr) return;
    const amount = parseInt(amountStr);
    if (isNaN(amount)) {
      error("Invalid amount");
      return;
    }
    const reason = prompt("Enter reason for adjustment:");
    if (!reason) return;
    try {
      await adminAPI.adjustSuccessScore(userId, amount, reason);
      success("Success score adjusted");
      loadData();
    } catch (err: any) {
      error(err.response?.data?.error || "Failed to adjust score");
    }
  };

  const handleUpdateRole = async (
    userId: string,
    username: string,
    currentRole: string,
  ) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    setConfirmModal({
      isOpen: true,
      title: "Update User Role",
      message: `Change ${username}'s role to ${newRole}?`,
      confirmText: "Update Role",
      confirmColor: "blue",
      onConfirm: async () => {
        try {
          await adminAPI.updateUserRole(userId, newRole);
          success("User role updated");
          loadData();
        } catch (err: any) {
          error(err.response?.data?.error || "Failed to update role");
        }
      },
    });
  };

  if (!_hasHydrated || !isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-4 bg-gradient-to-r from-old-ink to-gray-800 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-5xl">⚙️</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">
                Admin Panel
              </h1>
              <p className="opacity-75 text-sm uppercase tracking-wider" style={{ color: 'var(--primary-foreground)' }}>
                System Management & Control
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon="👥"
              label="Total Users"
              value={stats.total_users || 0}
              color="blue"
            />
            <StatCard
              icon="📚"
              label="Total Books"
              value={stats.total_books || 0}
              color="green"
            />
            <StatCard
              icon="📬"
              label="Pending Requests"
              value={stats.pending_requests || 0}
              color="orange"
            />
            <StatCard
              icon="📖"
              label="In Circulation"
              value={stats.books_in_circulation || 0}
              color="purple"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex border-b-4 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              label="Overview"
            />
            <TabButton
              active={activeTab === "requests"}
              onClick={() => setActiveTab("requests")}
              label={`Requests (${pendingRequests.length})`}
            />
            <TabButton
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
              label="Users"
            />
            <TabButton
              active={activeTab === "books"}
              onClick={() => setActiveTab("books")}
              label="Books"
            />
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <OverviewTab stats={stats} onNavigate={setActiveTab} />
            )}

            {activeTab === "requests" && (
              <RequestsTab
                requests={pendingRequests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
              />
            )}

            {activeTab === "users" && (
              <UsersTab
                users={users}
                onAdjustScore={handleAdjustScore}
                onUpdateRole={handleUpdateRole}
              />
            )}

            {activeTab === "books" && (
              <BooksTab
                books={books}
                showAddBook={showAddBook}
                setShowAddBook={setShowAddBook}
                bookForm={bookForm}
                setBookForm={setBookForm}
                onAddBook={handleAddBook}
              />
            )}
          </div>
        </div>
      </div>

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
