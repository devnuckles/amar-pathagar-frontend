"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { ToastContainer } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toasts, removeToast, error: showError, success } = useToastStore();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { data } = response.data;
      const { user, access_token } = data;
      setAuth(user, access_token);
      success("Login successful! Welcome back.");
      router.push("/dashboard");
    } catch (err: any) {
      showError(
        err.response?.data?.error ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--foreground)' }}>
              Amar Pathagar
            </h1>
            <p className="uppercase text-sm tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
              Community Library
            </p>
          </Link>
        </div>

        {/* Login Form */}
        <div className="classic-card">
          <h2 className="classic-heading text-2xl">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--foreground)' }}>
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="classic-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--foreground)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="classic-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full classic-button disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold underline"
                style={{ color: 'var(--foreground)' }}
              >
                Register here
              </Link>
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              <Link
                href="/"
                className="font-bold uppercase tracking-wider hover:underline inline-flex items-center gap-1 justify-center"
                style={{ color: 'var(--foreground)' }}
              >
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div 
          className="mt-6 p-4 border-2"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)'
          }}
        >
          <p className="text-xs uppercase tracking-wider text-center" style={{ color: 'var(--muted-foreground)' }}>
            A Trust-Based Reading Network
          </p>
        </div>
      </div>
    </div>
  );
}
