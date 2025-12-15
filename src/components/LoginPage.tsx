import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BookOpen, ArrowLeft, Shield, Mail } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { login, getCurrentUser } from '../lib/api/auth';
import { DemoCredentials } from './DemoCredentials';
import { isUsingLocalStorage } from '../lib/supabase';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'subscription' | 'leaderboard' | 'invitation';

interface LoginPageProps {
  onLogin: (isAdmin?: boolean) => void;
  onNavigate: (page: Page) => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any, isAdmin: boolean = false) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      toast.error('Please fill in all fields! 📝', {
        description: (
          <span className="text-[#6B21A8]">
            Both email and password are required
          </span>
        ),
        duration: 3000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      return;
    }

    setLoading(true);
    
    try {
      // Attempt login
      await login({ email, password });
      
      // Get user profile to check role
      const user = await getCurrentUser();
      
      if (!user) {
        throw new Error('Failed to get user profile');
      }

      // Show success toast with role indication
      if (user.role === 'admin') {
        toast.success('🔐 Admin Login Successful!', {
          description: (
            <span className="text-[#6B21A8]">
              Welcome back! You have full control over user management and analytics. 👨‍💼
            </span>
          ),
          duration: 4000,
          style: { borderColor: '#C4B5FD', color: '#6B21A8' },
        });
        onLogin(true);
      } else {
        toast.success('💙 Login Successful!', {
          description: (
            <span className="text-[#6B21A8]">
              Welcome back! Ready to track your study sessions and climb the leaderboard? 💪
            </span>
          ),
          duration: 4000,
          style: { borderColor: '#C4B5FD', color: '#6B21A8' },
        });
        onLogin(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login Failed! 😞', {
        description: (
          <span className="text-[#6B21A8]">
            {error.message || 'Invalid email or password. Please try again.'}
          </span>
        ),
        duration: 4000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (e: any, isAdmin: boolean) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      // Use default demo credentials
      await login({ 
        email: isAdmin ? 'admin@studyhabit.com' : 'student@studyhabit.com', 
        password: isAdmin ? 'admin123' : 'student123' 
      });
      
      // Show success toast
      if (isAdmin) {
        toast.success('🔐 Admin Demo Login!', {
          description: (
            <span className="text-[#6B21A8]">
              Welcome! Explore the admin dashboard and analytics. 👨‍💼
            </span>
          ),
          duration: 4000,
          style: { borderColor: '#C4B5FD', color: '#6B21A8' },
        });
      } else {
        toast.success('💙 Student Demo Login!', {
          description: (
            <span className="text-[#6B21A8]">
              Welcome! Check out study tracking and leaderboards! 💪
            </span>
          ),
          duration: 4000,
          style: { borderColor: '#C4B5FD', color: '#6B21A8' },
        });
      }
      
      onLogin(isAdmin);
    } catch (error: any) {
      console.error('Demo login error:', error);
      toast.error('Demo Login Failed! 😞', {
        description: (
          <span className="text-[#6B21A8]">
            {isAdmin 
              ? 'Default admin account not found. Try logging in with admin@studyhabit.com / admin123' 
              : 'Default student account not found.'}
          </span>
        ),
        duration: 4000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      {/* Floating cute elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-5xl opacity-30 bounce-gentle">⭐</div>
        <div className="absolute top-40 right-32 text-4xl opacity-30 bounce-gentle" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute bottom-40 left-40 text-5xl opacity-30 bounce-gentle" style={{ animationDelay: '1s' }}>💫</div>
        <div className="absolute bottom-32 right-20 text-4xl opacity-30 bounce-gentle" style={{ animationDelay: '1.5s' }}>🌟</div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back Home</span>
      </button>

      {/* Demo Credentials Panel - only show in localStorage mode */}
      {isUsingLocalStorage() && <DemoCredentials />}

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-6 transition-all">
              <BookOpen className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-slate-900 mb-2">Admin & Student Login 🔐</h2>
          <p className="text-slate-600">Access your StudyHabit account</p>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-blue-200 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-slate-900">Welcome Back! 👋</CardTitle>
            <CardDescription className="text-slate-600">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e: any) => handleSubmit(e, false)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address 📧</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                  className="border-2 border-blue-200 focus:border-blue-500 rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password 🔒</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  required
                  className="border-2 border-blue-200 focus:border-blue-500 rounded-xl h-12"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" className="border-blue-500" />
                  <label htmlFor="remember" className="text-slate-600 cursor-pointer">
                    Remember me 💭
                  </label>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full h-12 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                {loading ? 'Logging in...' : 'Login 🚀'}
              </Button>

              {/* Demo Login Buttons */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-blue-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-slate-500">or try a demo 👇</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={(e: any) => handleDemoLogin(e, false)}
                  className="w-full border-2 border-blue-400 text-blue-600 hover:bg-blue-50 rounded-xl h-14 flex flex-col items-start py-2 px-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎓</span>
                    <span>Student Demo</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5">Access: Dashboard, Leaderboard, Study Sessions</span>
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={(e: any) => handleDemoLogin(e, true)}
                  className="w-full border-2 border-purple-400 text-purple-600 hover:bg-purple-50 rounded-xl h-14 flex flex-col items-start py-2 px-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👨‍💼</span>
                    <span>Admin Demo</span>
                  </div>
                  <span className="text-xs text-purple-500 mt-0.5">Access: Admin Dashboard, User Management, Analytics</span>
                </Button>
              </div>
            </form>

            {/* New User Info */}
            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-700">
                    <span className="font-medium">New student?</span> 📚
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    Contact your admin to receive an invitation link. Only invited users can create accounts.
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            <div className="mt-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-700">
                    <span className="font-medium">Administrator?</span> 👨‍💼
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    Use your admin credentials to access user management and invite new students.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}