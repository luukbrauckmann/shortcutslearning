import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound } from 'lucide-react';

function SignUpComplete() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get the token and type from the URL
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const redirectTo = searchParams.get('redirect_to');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing signup token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing signup token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // First verify the token
      const { error: verifyError, data } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type === 'invite' ? 'invite' : 'signup',
      });

      if (verifyError) throw verifyError;

      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // After successful password update, sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.user?.email || '',
        password: password,
      });

      if (signInError) throw signInError;

      // Navigate to the redirect URL if provided, otherwise to admin
      navigate(redirectTo || '/admin');
    } catch (error) {
      console.error('Signup completion error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during signup completion');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center text-red-600">
            Invalid or missing signup token. Please check your email link.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center mb-8">
          <KeyRound className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Complete Your Registration
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Please set your password to complete the registration process.
        </p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
              placeholder="Repeat your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up your account...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpComplete;