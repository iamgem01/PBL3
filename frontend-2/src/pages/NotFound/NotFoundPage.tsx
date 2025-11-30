import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-9xl font-bold text-indigo-100 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-24 h-24 text-indigo-300" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500">
            Don't worry, let's get you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Home size={20} />
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Maybe you're looking for:
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
            >
              Homepage
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/ai"
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
            >
              Aeternus AI
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
            >
              Login
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please contact our support team.
        </div>
      </div>
    </div>
  );
}
