import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { BookOpen, Plus, LogOut, TrendingUp, Clock, Target, Flame, Award, Star, Sparkles, Heart, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { getCurrentUser } from '../lib/api/auth';
import { createStudySession, getUserStudySessions, getWeeklyChartData, getUserStudyStats } from '../lib/api/study-sessions';
import type { StudySession as StudySessionType } from '../lib/api/study-sessions';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'subscription' | 'leaderboard';

interface UserDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const motivationalMessages = [
  "You're doing amazing! 🌟",
  "Keep up the awesome work! 💪",
  "You're on fire today! 🔥",
  "What a superstar! ⭐",
  "You're crushing it! 🎉"
];

export function UserDashboard({ onNavigate, onLogout }: UserDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<StudySessionType[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ date: string; hours: number }[]>([]);
  const [subjectData, setSubjectData] = useState<{ subject: string; hours: number; emoji: string; color: string }[]>([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    streak: 0,
    goalProgress: 0,
    leaderboardPosition: 0
  });
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [newSession, setNewSession] = useState({
    subject: '',
    duration: '',
    notes: '',
  });

  // Load user data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        onNavigate('login');
        return;
      }
      setCurrentUser({ fullName: user.fullName, email: user.email });

      // Get study sessions
      const userSessions = await getUserStudySessions(user.id);
      setSessions(userSessions);

      // Get weekly chart data
      const chartData = await getWeeklyChartData(user.id);
      setWeeklyData(chartData);

      // Get stats
      const userStats = await getUserStudyStats(user.id);
      
      // Calculate subject breakdown
      const subjectHours: { [key: string]: number } = {};
      userSessions.forEach(s => {
        subjectHours[s.subject] = (subjectHours[s.subject] || 0) + Number(s.duration_hours);
      });
      
      const subjectEmojis: { [key: string]: string } = {
        'Mathematics': '🔢',
        'Physics': '⚛️',
        'Chemistry': '🧪',
        'English': '📖',
        'Biology': '🧬',
        'History': '📜'
      };

      const subjectColors = [
        'from-blue-500 to-blue-600',
        'from-blue-600 to-sky-500',
        'from-sky-500 to-blue-500',
        'from-blue-400 to-sky-400',
        'from-blue-500 to-sky-500',
        'from-sky-400 to-blue-600'
      ];

      const subjects = Object.entries(subjectHours)
        .map(([subject, hours], index) => ({
          subject,
          hours,
          emoji: subjectEmojis[subject] || '📚',
          color: subjectColors[index % subjectColors.length]
        }))
        .sort((a, b) => b.hours - a.hours);

      setSubjectData(subjects);

      // Calculate streak (simplified - count consecutive days with sessions)
      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasSession = userSessions.some(s => s.session_date.startsWith(dateStr));
        if (hasSession) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Calculate goal progress (e.g., 40 hours per month)
      const goalHours = 40;
      const progress = Math.min(100, Math.round((userStats.monthlyHours / goalHours) * 100));

      setStats({
        totalHours: userStats.weeklyHours,
        streak,
        goalProgress: progress,
        leaderboardPosition: 0 // Will be updated from leaderboard API
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data', {
        description: (
          <span className="text-[#6B21A8]">
            Please try refreshing the page
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await getCurrentUser();
      if (!user) {
        onNavigate('login');
        return;
      }

      await createStudySession({
        userId: user.id,
        subject: newSession.subject,
        durationHours: parseFloat(newSession.duration),
        notes: newSession.notes || undefined,
      });

      setNewSession({ subject: '', duration: '', notes: '' });
      setIsDialogOpen(false);
      
      // Show success toast
      toast.success(`Amazing! 🎉 You logged ${newSession.duration} hours of ${newSession.subject}! Keep crushing it! 💪`, {
        description: (
          <span className="text-[#6B21A8]">
            Your study streak is on fire! 🔥
          </span>
        ),
        duration: 4000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error adding session:', error);
      toast.error('Failed to add session', {
        description: (
          <span className="text-[#6B21A8]">
            Please try again
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
    }
  };

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  const maxSubjectHours = Math.max(...subjectData.map(s => s.hours), 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your study data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b-2 border-blue-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-slate-900">StudyHabit ✨</span>
                <div className="text-xs text-blue-600">{randomMessage}</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-blue-600 flex items-center gap-1"
              >
                Dashboard 📊
              </button>
              <button 
                onClick={() => onNavigate('leaderboard')}
                className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Leaderboard 🏆
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className="text-slate-900 flex items-center gap-2">
                  {currentUser?.fullName || 'Student'} <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-slate-500">Super Student! 🎓</div>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onLogout}
                className="border-2 border-blue-300 rounded-full hover:bg-blue-50"
              >
                <LogOut className="w-4 h-4 text-blue-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 text-8xl opacity-20">🎓</div>
          <div className="absolute bottom-0 left-0 text-6xl opacity-20">✨</div>
          <div className="relative">
            <h2 className="text-white mb-2">Hey {currentUser?.fullName?.split(' ')[0] || 'there'}! Ready to crush it today? 💪</h2>
            <p className="text-white/90">You're on a {stats.streak}-day streak! Keep the momentum going! 🔥</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-slate-900 mt-2">{stats.totalHours.toFixed(1)} hrs 📚</div>
              <p className="text-slate-500">This Week's Study Time</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 rounded-2xl bg-gradient-to-br from-white to-blue-100 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg bounce-gentle">
                  <Flame className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-slate-900 mt-2">{stats.streak} days 🔥</div>
              <p className="text-slate-500">Current Streak - Amazing!</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-sky-200 rounded-2xl bg-gradient-to-br from-white to-sky-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-slate-900 mt-2">{stats.goalProgress}% 🎯</div>
              <p className="text-slate-500">Goal Progress - So Close!</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-slate-900 mt-2">🏆</div>
              <p className="text-slate-500">Keep Studying!</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Progress Chart */}
            <Card className="border-2 border-blue-200 rounded-3xl bg-white shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      Your Week in Review 📊
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                    </CardTitle>
                    <CardDescription className="text-slate-600">Look at that progress! You're doing great! 🌟</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                      <XAxis dataKey="date" stroke="#3b82f6" />
                      <YAxis stroke="#3b82f6" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '2px solid #dbeafe',
                          borderRadius: '16px',
                          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)'
                        }}
                      />
                      <Bar dataKey="hours" fill="url(#blueGradient)" radius={[12, 12, 0, 0]} />
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="50%" stopColor="#60A5FA" />
                          <stop offset="100%" stopColor="#93C5FD" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <p className="mb-2">No study data yet</p>
                      <p className="text-sm">Start logging sessions to see your progress! 🚀</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject Distribution */}
            <Card className="border-2 border-blue-300 rounded-3xl bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  Subject Breakdown 📚
                  <Heart className="w-5 h-5 text-pink-500" />
                </CardTitle>
                <CardDescription className="text-slate-600">See where you're spending your time! 🎨</CardDescription>
              </CardHeader>
              <CardContent>
                {subjectData.length > 0 ? (
                  <div className="space-y-4">
                    {subjectData.map((item) => (
                      <div key={item.subject} className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-slate-900 flex items-center gap-2">
                            <span className="text-2xl">{item.emoji}</span>
                            {item.subject}
                          </span>
                          <span className="text-slate-600">{item.hours.toFixed(1)} hrs</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-3 shadow-inner">
                          <div 
                            className={`h-3 rounded-full bg-gradient-to-r ${item.color} transition-all shadow-md`}
                            style={{ width: `${(item.hours / maxSubjectHours) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p className="mb-2">No subjects tracked yet</p>
                    <p className="text-sm">Add your first study session to get started! 📖</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add Session Card */}
            <Card className="border-2 border-blue-200 rounded-3xl bg-gradient-to-br from-blue-50 via-blue-100 to-sky-50 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl transform hover:scale-110 hover:rotate-6 transition-all">
                    <Plus className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-slate-900 mb-2 flex items-center justify-center gap-2">
                    Add a Study Session 📝
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </h3>
                  <p className="text-slate-600 mb-4">Log what you just learned! Every session counts! 🌟</p>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                        Let's Log It! 🚀
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-2 border-blue-200">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900">
                          Add Study Session 
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                          Tell us about your awesome study session! 🎉
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddSession} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="text-slate-700">What did you study? 📚</Label>
                          <Select 
                            value={newSession.subject} 
                            onValueChange={(value: string) => setNewSession({ ...newSession, subject: value })}
                          >
                            <SelectTrigger className="rounded-xl border-2 border-blue-200">
                              <SelectValue placeholder="Pick a subject!" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mathematics">🔢 Mathematics</SelectItem>
                              <SelectItem value="Physics">⚛️ Physics</SelectItem>
                              <SelectItem value="Chemistry">🧪 Chemistry</SelectItem>
                              <SelectItem value="English">📖 English</SelectItem>
                              <SelectItem value="Biology">🧬 Biology</SelectItem>
                              <SelectItem value="History">📜 History</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="duration" className="text-slate-700">How long? ⏱️ (hours)</Label>
                          <Input
                            id="duration"
                            type="number"
                            step="0.5"
                            placeholder="2.5"
                            value={newSession.duration}
                            onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                            required
                            className="rounded-xl border-2 border-blue-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-slate-700">Quick notes? 💭 (optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="What did you learn today?"
                            value={newSession.notes}
                            onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                            rows={3}
                            className="rounded-xl border-2 border-blue-200"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg"
                        >
                          Save Session! 🎊
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="border-2 border-blue-300 rounded-3xl bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  Recent Sessions 📖
                  <Star className="w-5 h-5 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl hover:shadow-md transition-shadow border border-blue-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-900">{session.subject}</span>
                            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-full">
                              {session.duration_hours}h ⏱️
                            </Badge>
                          </div>
                          <p className="text-slate-600 text-xs truncate">{session.notes || 'No notes'}</p>
                          <p className="text-slate-400 text-xs mt-1">📅 {new Date(session.session_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="mb-2">No sessions yet</p>
                    <p className="text-sm">Log your first study session! 🎯</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Motivation Card */}
            <Card className="border-2 border-blue-300 rounded-3xl bg-gradient-to-br from-blue-100 to-sky-100 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-3 bounce-gentle">🌟</div>
                <h3 className="text-slate-900 mb-2">You're Awesome!</h3>
                <p className="text-slate-600">Keep going! Every minute you study gets you closer to your dreams! 💫</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}