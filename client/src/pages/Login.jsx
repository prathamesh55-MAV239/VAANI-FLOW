import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mic, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setLocalError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleFillDemo = async (autoSubmit = false) => {
    setEmail('judge@vaaniflow.ai');
    setPassword('password123');
    setLocalError(null);
    if (autoSubmit) {
      setIsSubmitting(true);
      const res = await login('judge@vaaniflow.ai', 'password123');
      setIsSubmitting(false);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setLocalError(res.message || 'Login failed. Please check credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-vf-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-vf-accent selection:text-white">
      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-vf-text text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-vf-accent" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-vf-text">
            VAANIFLOW
          </span>
        </Link>

        <h2 className="text-3xl font-display font-extrabold tracking-tight text-vf-text">
          Welcome back.
        </h2>
        <p className="mt-2 text-sm text-vf-muted">
          Continue your multilingual voice conversations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-vf-border rounded-3xl sm:px-10">
          {/* Quick Demo Fill Banner for Judges */}
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 flex items-center justify-between text-xs gap-2">
            <div>
              <span className="font-semibold text-amber-900 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-vf-accent" />
                Hackathon Judge Demo
              </span>
              <span className="text-amber-800/80 text-[11px]">
                judge@vaaniflow.ai / password123
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleFillDemo(false)}
                className="px-2.5 py-1.5 rounded-lg border border-amber-600/30 text-amber-900 font-semibold text-xs hover:bg-amber-100/50 transition-colors"
              >
                Fill
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFillDemo(true)}
                className="px-3 py-1.5 rounded-lg bg-vf-accent text-white font-semibold text-xs hover:bg-vf-accent-hover transition-colors shadow-sm disabled:opacity-50"
              >
                Sign In Demo
              </button>
            </div>
          </div>

          {localError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 font-medium">
              {localError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-mono uppercase tracking-wider font-semibold text-vf-text mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-vf-border text-sm text-vf-text placeholder:text-vf-muted focus:outline-none focus:border-vf-accent focus:ring-1 focus:ring-vf-accent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-mono uppercase tracking-wider font-semibold text-vf-text"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-vf-border text-sm text-vf-text placeholder:text-vf-muted focus:outline-none focus:border-vf-accent focus:ring-1 focus:ring-vf-accent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-vf-text text-white font-semibold text-sm hover:bg-vf-accent transition-all shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-vf-border text-center text-xs text-vf-muted">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-vf-accent hover:underline"
            >
              Start here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
