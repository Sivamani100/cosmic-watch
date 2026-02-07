import { useState } from 'react';
import { AuthIllustration } from '@/components/AuthIllustration';
import { CosmicLogo } from '@/components/ui/CosmicLogo'; // New Import
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Google } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      const message = error.message || 'Failed to login';
      if (message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithProvider('google');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-8 relative">
        <div className="stars opacity-50" />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 group w-fit">
            <CosmicLogo className="h-10 w-10 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-gradient">Cosmic Watch Hub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue your space watch mission
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-hero-gradient hover:shadow-glow-purple h-12 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative py-4">
              <div className="absolute left-0 right-0 top-1/2 border-t" />
              <div className="relative text-center">
                <span className="bg-background px-3 text-sm text-muted-foreground">or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full flex items-center justify-center gap-3" onClick={handleGoogleSignIn}>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.6 12.227c0-.725-.065-1.453-.196-2.14H12v4.053h5.392c-.233 1.26-.935 2.327-2 3.044v2.534h3.228c1.887-1.737 2.996-4.3 2.996-7.491z" fill="#4285F4"/>
                <path d="M12 22c2.7 0 4.967-.9 6.622-2.45l-3.228-2.534c-.906.608-2.064.97-3.394.97-2.608 0-4.816-1.76-5.604-4.127H2.972v2.594C4.615 19.904 8.006 22 12 22z" fill="#34A853"/>
                <path d="M6.396 13.859A6.993 6.993 0 0 1 6 12c0-.667.109-1.312.31-1.859V7.547H2.972A9.999 9.999 0 0 0 2 12c0 1.64.373 3.197 1.04 4.553l3.356-2.694z" fill="#FBBC05"/>
                <path d="M12 6.5c1.47 0 2.79.5 3.832 1.48l2.872-2.872C16.956 3.548 14.69 2.6 12 2.6 8.006 2.6 4.615 4.696 2.972 7.86l3.334 2.59C7.184 8.26 9.392 6.5 12 6.5z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right: Illustration */}
      <div className="hidden lg:block bg-muted/10 relative overflow-hidden p-8">
        <AuthIllustration />
      </div>
    </div>
  );
}
