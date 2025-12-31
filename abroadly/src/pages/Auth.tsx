// Contributors:
// Gordon Song - Setup (1 hr)
// Tae Kim - Enhancements (1 hr)

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";

const Auth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { login, refreshUser, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // If there's a token in the URL (from magic link callback), verify it with backend
    const token = searchParams.get("token");
    if (token) {
      console.log("Magic link token detected:", token);
      setLoading(true);
      // Call the backend callback endpoint to set the cookie using the API client
      authApi
        .verifyMagicToken(token)
        .then((data: any) => {
          console.log("Backend callback success:", data);
          // After cookie is set, refresh user state
          return refreshUser();
        })
        .then(async () => {
          console.log("User refreshed, checking profile completion");
          setLoading(false);
          // Check if profile is completed, redirect to onboarding if not
          const currentUser = await authApi.getCurrentUser();
          if (!currentUser.profile_completed) {
            navigate("/onboarding");
          } else {
            navigate("/");
          }
        })
        .catch((err: any) => {
          console.error("Magic link authentication error:", err);
          setLoading(false);
          const errorMessage =
            err.response?.data?.detail ||
            err.message ||
            "Failed to sign in. Please try again.";
          setError(errorMessage);
        });
    }
  }, [searchParams, refreshUser, navigate]);

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await login(email);

      // In development, the API returns the magic link
      if (response.magic_link) {
        setMessage(
          `Check your email for the magic link! (Dev mode: ${response.magic_link})`
        );

        // In production, you wouldn't show this. In dev, we can auto-redirect
        // Uncomment below to auto-redirect in dev:
        // window.location.href = response.magic_link;
      } else {
        setMessage("Check your email for the magic link to sign in!");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to send magic link. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Abroadly
            </h2>
            <p className="text-gray-600">Sign in with your preferred email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                placeholder="example123@gmail.com"
                disabled={loading}
              />
              <p className="mt-2 text-xs text-gray-500">
                We'll send you a magic link to sign in - no password needed!
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Magic Link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            New to study abroad?{" "}
            <a
              href="/"
              className="text-gray-900 hover:text-gray-600 font-medium underline"
            >
              Learn more about Abroadly
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
