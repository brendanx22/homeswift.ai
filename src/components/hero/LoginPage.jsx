import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ message: '', needsVerification: false });
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, resetPassword, signInWithGoogle } = useAuth();

  // Redirect if authenticated
  useEffect(() => {
    const redirectPath = searchParams.get('redirect') || '/';
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError({ message: errorParam });
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return;
    }

    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setError({ message: 'Please enter both email and password' });
      return;
    }

    setLoading(true);
    setError({ message: '', needsVerification: false });

    try {
      await login({ email, password });
      const redirectPath = searchParams.get('redirect') || '/main';
      navigate(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your credentials and try again.';

      if (err.response?.status === 401) errorMessage = 'Invalid email or password.';
      else if (err.response?.status === 429) errorMessage = 'Too many login attempts. Please try again later.';
      else if (err.needsVerification) {
        setError({ message: 'Please verify your email before logging in.', needsVerification: true });
        return;
      } else if (err.message) errorMessage = err.message;

      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      setError({ message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setError({ message: '' });

    try {
      await resetPassword(email);
      setIsPasswordResetSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError({ message: err.message || 'Failed to send password reset email.' });
    } finally {
      setLoading(false);
    }
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showResetForm) {
      await handlePasswordReset();
    } else {
      await handleLogin();
    }
  };

  // Google login placeholder
  const handleGoogleLogin = () => {
    setError({ message: 'Google Sign-In is temporarily disabled.', needsVerification: false });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url("/Hero Section Image.png")',
        backgroundSize: 'cover',
        backgroundColor: '#1a1a1a',
      }}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col space-y-1.5 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="w-8 h-8 p-0 absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl text-center">
              {showResetForm ? 'Reset Password' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-center">
              {showResetForm
                ? 'Enter your email to receive a password reset link'
                : 'Sign in to your account to continue'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isPasswordResetSent && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Password reset link sent to {email}. Check your email.
              </AlertDescription>
            </Alert>
          )}

          {error.message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {!showResetForm && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm"
                    onClick={() => {
                      setShowResetForm(true);
                      setError({ message: '' });
                    }}
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {showResetForm ? 'Sending...' : 'Signing in...'}
                </>
              ) : showResetForm ? (
                'Send Reset Link'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full">
            Continue with Google
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center">
          {showResetForm ? (
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => {
                setShowResetForm(false);
                setError({ message: '' });
              }}
            >
              Back to sign in
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => navigate('/signup')}
              >
                Sign up
              </Button>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
