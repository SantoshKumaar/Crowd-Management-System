import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import backgound from "../../../assets/img/background.png"
import backgoundLogin from "../../../assets/img/Background login 1.png"


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const result = await login({ email, password });

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="flex-1 flex items-center justify-between gap-[500px] p-6 md:p-12 lg:p-16 relative before:content-[''] before:absolute before:inset-0 before:bg-black/30 before:backdrop-blur-sm">
        <img
          src= {backgound}
          alt=""
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />

        <div className="relative z-10 text-white max-w-xl ml-auto mr-20 hidden lg:block">
          <pre className="text-4xl md:text-5xl font-bold leading-tight drop-shadow-lg font-['IBM_Plex_Sans']">
            Welcome to the
            <br />
            Crowd Management System
          </pre>
        </div>

        <div className="w-full max-w-[450px] -ml-20 bg-white flex flex-col z-10 rounded-2xl overflow-hidden shadow-2xl lg:mr-auto">
          <div className="w-full">
            <img
              className="w-full h-auto object-cover"
              src= {backgoundLogin}
              alt="Login header"
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 md:p-10 flex flex-col gap-6 flex-1"
          >
            {/* Title for mobile */}
            <h2 className="text-2xl font-bold text-gray-800 text-center lg:hidden">
              Welcome Back
            </h2>

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm text-center border border-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-800"
              >
                Log In <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or login ID"
                disabled={loading}
                className="px-4 py-3 border border-gray-300 rounded-md text-sm transition-colors w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-800"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="px-4 py-3 pr-12 border border-gray-300 rounded-md text-sm transition-colors w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  className="absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 flex items-center text-gray-600 hover:text-teal-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="py-3.5 px-6 bg-teal-500 text-white rounded-md text-base font-semibold cursor-pointer transition-colors mt-2 hover:bg-teal-600 active:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
