import { useState } from 'react';
import { AuthIllustration } from '@/components/AuthIllustration';
import { CosmicLogo } from '@/components/ui/CosmicLogo'; // New Import
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character (#, @, !, $, etc.)'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const getPasswordStrength = (password: string) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  return strength;
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser, isAuthenticated, signInWithProvider } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const strength = getPasswordStrength(password);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password, data.username);
      toast.success('Account created! Please check your email to verify your account.');
      navigate('/login');
    } catch (error) {
      const message = error.message || 'Failed to create account';
      if (message.includes('already registered')) {
        toast.error('This email is already registered');
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
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Join the mission to monitor near-Earth objects
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="astronaut42"
                  className="pl-10"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

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

              {/* Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strength}%` }}
                      className={`h-full ${strength <= 25 ? 'bg-red-500' :
                        strength <= 50 ? 'bg-orange-500' :
                          strength <= 75 ? 'bg-yellow-500' :
                            'bg-green-500'
                        }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider font-bold">
                    <span className={password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}>
                      • 8+ Characters
                    </span>
                    <span className={/[0-9]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                      • One Number
                    </span>
                    <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                      • Special Char (#@!)
                    </span>
                    <span className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
                      • Uppercase
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
                  Creating account...
                </>
              ) : (
                'Create Account'
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
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
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
