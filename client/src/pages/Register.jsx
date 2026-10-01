import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await register(name, email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setLocalError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-vf-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-vf-accent selection:text-white">
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
          Start your first conversation.
        </h2>
        <p className="mt-2 text-sm text-vf-muted">
          Create an account to begin speaking with VaaniFlow.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-vf-border rounded-3xl sm:px-10">
          {localError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 font-medium">
              {localError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-mono uppercase tracking-wider font-semibold text-vf-text mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-vf-border text-sm text-vf-text placeholder:text-vf-muted focus:outline-none focus:border-vf-accent focus:ring-1 focus:ring-vf-accent transition-all"
              />
            </div>

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
              <label
                htmlFor="password"
                className="block text-xs font-mono uppercase tracking-wider font-semibold text-vf-text mb-1.5"
              >
                Password (min 6 characters)
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-vf-border text-sm text-vf-text placeholder:text-vf-muted focus:outline-none focus:border-vf-accent focus:ring-1 focus:ring-vf-accent transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-mono uppercase tracking-wider font-semibold text-vf-text mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-vf-border text-sm text-vf-text placeholder:text-vf-muted focus:outline-none focus:border-vf-accent focus:ring-1 focus:ring-vf-accent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-vf-text text-white font-semibold text-sm hover:bg-vf-accent transition-all shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-vf-border text-center text-xs text-vf-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-vf-accent hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
