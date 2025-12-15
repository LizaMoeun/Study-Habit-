import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookOpen, LogOut, Trophy, Medal, Award, TrendingUp, Flame, Crown, Star, Sparkles } from 'lucide-react';
import { getCurrentUser } from '../lib/api/auth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'subscription' | 'leaderboard';

interface LeaderboardPageProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface LeaderEntry {
  rank: number;
  name: string;
  hours: number;
  streak: number;
  initials: string;
  color: string;
  userId: string;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-7 h-7 text-yellow-500 wiggle" />;
  if (rank === 2) return <Medal className="w-7 h-7 text-slate-400" />;
  if (rank === 3) return <Award className="w-7 h-7 text-amber-700" />;
  return null;
}

const avatarColors = [
  'from-blue-500 to-blue-600',
  'from-blue-600 to-sky-500',
  'from-sky-500 to-blue-500',
  'from-blue-400 to-sky-400',
  'from-blue-500 to-sky-500',
  'from-sky-400 to-blue-600',
  'from-blue-600 to-blue-500',
  'from-sky-500 to-sky-600',
  'from-blue-400 to-blue-500',
  'from-sky-600 to-blue-600'
];

export function LeaderboardPage({ onNavigate, onLogout }: LeaderboardPageProps) {
  const [activeTab, setActiveTab] = useState('weekly');
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderEntry[]>([]);
  const [monthlyLeaders, setMonthlyLeaders] = useState<LeaderEntry[]>([]);
  const [allTimeLeaders, setAllTimeLeaders] = useState<LeaderEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('Student');
  const [loading, setLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState({
    totalStudents: 0,
    totalHours: 0,
    weeklyHours: 0
  });

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

      setCurrentUserId(user.id);
      setCurrentUserName(user.fullName);

      // Real Supabase data
      if (!user.organizationId) {
        toast.error('No organization found');
        return;
      }

      // Get all students in organization
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', user.organizationId)
        .eq('role', 'student');

      if (profilesError) throw profilesError;

      // Calculate date ranges
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);

      // Get leaderboard data for each timeframe
      const leaderboardData = await Promise.all(
        profiles.map(async (profile: any) => {
          const { data: allSessions, error } = await supabase
            .from('study_sessions')
            .select('duration_hours, session_date')
            .eq('user_id', profile.id);

          if (error) throw error;

          // Calculate total hours
          const totalHours = allSessions.reduce((sum: number, s: any) => sum + Number(s.duration_hours), 0);

          // Calculate weekly hours
          const weeklyHours = allSessions
            .filter((s: any) => new Date(s.session_date) >= weekAgo)
            .reduce((sum: number, s: any) => sum + Number(s.duration_hours), 0);

          // Calculate monthly hours
          const monthlyHours = allSessions
            .filter((s: any) => new Date(s.session_date) >= monthAgo)
            .reduce((sum: number, s: any) => sum + Number(s.duration_hours), 0);

          // Calculate streak
          let streak = 0;
          for (let i = 0; i < 365; i++) {
            const checkDate = new Date(now);
            checkDate.setDate(now.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            const hasSession = allSessions.some((s: any) => s.session_date.startsWith(dateStr));
            if (hasSession) {
              streak++;
            } else if (i > 0) {
              break;
            }
          }

          const nameParts = profile.full_name.split(' ');
          const initials = nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
            : profile.full_name.substring(0, 2);

          return {
            userId: profile.id,
            name: profile.full_name,
            initials: initials.toUpperCase(),
            totalHours,
            weeklyHours,
            monthlyHours,
            streak
          };
        })
      );

      // Create weekly leaderboard
      const weekly = leaderboardData
        .sort((a, b) => b.weeklyHours - a.weeklyHours)
        .slice(0, 10)
        .map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          hours: entry.weeklyHours,
          streak: entry.streak,
          initials: entry.initials,
          color: avatarColors[index % avatarColors.length],
          userId: entry.userId
        }));

      setWeeklyLeaders(weekly);

      // Create monthly leaderboard
      const monthly = leaderboardData
        .sort((a, b) => b.monthlyHours - a.monthlyHours)
        .slice(0, 10)
        .map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          hours: entry.monthlyHours,
          streak: entry.streak,
          initials: entry.initials,
          color: avatarColors[index % avatarColors.length],
          userId: entry.userId
        }));

      setMonthlyLeaders(monthly);

      // Create all-time leaderboard
      const allTime = leaderboardData
        .sort((a, b) => b.totalHours - a.totalHours)
        .slice(0, 10)
        .map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          hours: entry.totalHours,
          streak: entry.streak,
          initials: entry.initials,
          color: avatarColors[index % avatarColors.length],
          userId: entry.userId
        }));

      setAllTimeLeaders(allTime);

      // Calculate platform stats
      const totalStudents = profiles.length;
      const totalHours = leaderboardData.reduce((sum: number, entry: any) => sum + entry.totalHours, 0);
      const weeklyHours = leaderboardData.reduce((sum: number, entry: any) => sum + entry.weeklyHours, 0);

      setPlatformStats({
        totalStudents,
        totalHours,
        weeklyHours
      });

    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard', {
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

  const leaders = activeTab === 'weekly' ? weeklyLeaders : activeTab === 'monthly' ? monthlyLeaders : allTimeLeaders;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading leaderboard...</p>
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
              <span className="text-slate-900">StudyHabit ✨</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Dashboard 📊
              </button>
              <button 
                onClick={() => onNavigate('leaderboard')}
                className="text-blue-600 flex items-center gap-1"
              >
                Leaderboard 🏆
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className="text-slate-900 flex items-center gap-2">
                  {currentUserName} <Star className="w-4 h-4 text-yellow-500" />
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

      {/* Hero Banner */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 text-6xl opacity-20 bounce-gentle">🏆</div>
          <div className="absolute bottom-20 left-20 text-5xl opacity-20 bounce-gentle" style={{ animationDelay: '0.5s' }}>🌟</div>
          <div className="absolute top-1/2 right-1/3 text-4xl opacity-20 bounce-gentle" style={{ animationDelay: '1s' }}>👑</div>
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 shadow-lg">
            <Trophy className="w-5 h-5" />
            <span>Global Rankings</span>
          </div>
          <h1 className="text-white mb-4">The Hall of Fame! 🌟</h1>
          <p className="text-white/90 text-lg mb-8">
            Check out our incredible learners crushing their goals! Where do you rank? 🚀✨
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-white mb-1">{platformStats.totalStudents.toLocaleString()}+</div>
              <div className="text-white/80">Active Students</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-white mb-1">{Math.round(platformStats.totalHours).toLocaleString()}+</div>
              <div className="text-white/80">Total Hours</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-white mb-1">{Math.round(platformStats.weeklyHours).toLocaleString()}+</div>
              <div className="text-white/80">This Week</div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <Card className="border-2 border-blue-200 bg-white shadow-2xl rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-slate-900 flex items-center gap-2 mb-2">
                    Leaderboard 🏅
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </h2>
                  <p className="text-slate-600">See who's leading the pack this {activeTab}! 🎯</p>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-blue-50 p-1 rounded-2xl">
                  <TabsTrigger 
                    value="weekly"
                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
                  >
                    Weekly 📅
                  </TabsTrigger>
                  <TabsTrigger 
                    value="monthly"
                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
                  >
                    Monthly 📆
                  </TabsTrigger>
                  <TabsTrigger 
                    value="alltime"
                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
                  >
                    All Time 🌟
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="weekly">
                  {leaders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">No data yet</p>
                      <p className="text-sm">Start studying to appear on the leaderboard! 🚀</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaders.map((leader) => (
                        <Card
                          key={leader.rank}
                          className={`border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all rounded-2xl ${
                            leader.userId === currentUserId ? 'ring-4 ring-blue-400 bg-blue-50' : 'bg-white'
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12">
                                  {getRankIcon(leader.rank) || (
                                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-full px-3 py-1">
                                      #{leader.rank}
                                    </Badge>
                                  )}
                                </div>
                                <Avatar className={`w-14 h-14 bg-gradient-to-br ${leader.color} shadow-lg`}>
                                  <AvatarFallback className="text-white">
                                    {leader.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-slate-900 flex items-center gap-2">
                                    {leader.name}
                                    {leader.userId === currentUserId && <span className="text-blue-600">(You!)</span>}
                                  </div>
                                  <div className="text-slate-500 flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Flame className="w-4 h-4 text-orange-500" />
                                      {leader.streak} day streak
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-slate-900 flex items-center gap-2">
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                  {leader.hours.toFixed(1)} hrs
                                </div>
                                <div className="text-slate-500">Study Time</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="monthly">
                  {leaders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">No data yet</p>
                      <p className="text-sm">Start studying to appear on the leaderboard! 🚀</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaders.map((leader) => (
                        <Card
                          key={leader.rank}
                          className={`border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all rounded-2xl ${
                            leader.userId === currentUserId ? 'ring-4 ring-blue-400 bg-blue-50' : 'bg-white'
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12">
                                  {getRankIcon(leader.rank) || (
                                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-full px-3 py-1">
                                      #{leader.rank}
                                    </Badge>
                                  )}
                                </div>
                                <Avatar className={`w-14 h-14 bg-gradient-to-br ${leader.color} shadow-lg`}>
                                  <AvatarFallback className="text-white">
                                    {leader.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-slate-900 flex items-center gap-2">
                                    {leader.name}
                                    {leader.userId === currentUserId && <span className="text-blue-600">(You!)</span>}
                                  </div>
                                  <div className="text-slate-500 flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Flame className="w-4 h-4 text-orange-500" />
                                      {leader.streak} day streak
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-slate-900 flex items-center gap-2">
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                  {leader.hours.toFixed(1)} hrs
                                </div>
                                <div className="text-slate-500">Study Time</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="alltime">
                  {leaders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">No data yet</p>
                      <p className="text-sm">Start studying to appear on the leaderboard! 🚀</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaders.map((leader) => (
                        <Card
                          key={leader.rank}
                          className={`border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all rounded-2xl ${
                            leader.userId === currentUserId ? 'ring-4 ring-blue-400 bg-blue-50' : 'bg-white'
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12">
                                  {getRankIcon(leader.rank) || (
                                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-full px-3 py-1">
                                      #{leader.rank}
                                    </Badge>
                                  )}
                                </div>
                                <Avatar className={`w-14 h-14 bg-gradient-to-br ${leader.color} shadow-lg`}>
                                  <AvatarFallback className="text-white">
                                    {leader.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-slate-900 flex items-center gap-2">
                                    {leader.name}
                                    {leader.userId === currentUserId && <span className="text-blue-600">(You!)</span>}
                                  </div>
                                  <div className="text-slate-500 flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Flame className="w-4 h-4 text-orange-500" />
                                      {leader.streak} day streak
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-slate-900 flex items-center gap-2">
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                  {leader.hours.toFixed(1)} hrs
                                </div>
                                <div className="text-slate-500">Study Time</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Motivation Card */}
          <Card className="mt-8 border-2 border-blue-300 rounded-3xl bg-gradient-to-br from-blue-100 to-sky-100 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-7xl mb-4 bounce-gentle">🎯</div>
              <h3 className="text-slate-900 mb-3">Keep Climbing! 🚀</h3>
              <p className="text-slate-600 text-lg">
                Every hour you study gets you higher on the leaderboard! You're doing amazing! 💪✨
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}