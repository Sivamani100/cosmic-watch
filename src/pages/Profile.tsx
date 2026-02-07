import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Bell, Save, Loader2, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useWatchedCount } from '@/hooks/useWatchedAsteroids';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

function ProfileContent() {
  const { profile, user, updateProfile } = useAuth();
  const { data: watchedCount } = useWatchedCount();
  const [isLoading, setIsLoading] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(
    profile?.alert_preferences?.email_alerts ?? true
  );
  const [pushAlerts, setPushAlerts] = useState(
    profile?.alert_preferences?.push_alerts ?? false
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      avatar_url: profile?.avatar_url || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      await updateProfile({
        username: data.username,
        avatar_url: data.avatar_url || null,
        alert_preferences: {
          email_alerts: emailAlerts,
          push_alerts: pushAlerts,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="stars" />
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and notification preferences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-gradient rounded-lg p-8 border border-border/50"
        >
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <Avatar className="h-24 w-24 border-4 border-primary/30">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile?.username || 'User'}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Mission Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card-gradient p-4 rounded-lg border border-border/50 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-primary mb-1">
                {watchedCount || 0}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Active</span>
            </div>
            <div className="bg-card-gradient p-4 rounded-lg border border-border/50 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-secondary mb-1">
                Level 1
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Clearance</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-10"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="avatar_url"
                  placeholder="https://example.com/avatar.jpg"
                  className="pl-10"
                  {...register('avatar_url')}
                />
              </div>
              {errors.avatar_url && (
                <p className="text-sm text-destructive">{errors.avatar_url.message}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 opacity-60"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Notification Preferences */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_alerts">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email_alerts"
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push_alerts">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    id="push_alerts"
                    checked={pushAlerts}
                    onCheckedChange={setPushAlerts}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-hero-gradient hover:shadow-glow-purple"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
