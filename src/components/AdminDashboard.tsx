import { useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/api/auth';
import { createInvitation, getOrganizationInvitations, deleteInvitation, resendInvitation } from '../lib/api/invitations';
import type { Invitation } from '../lib/api/invitations';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { BookOpen, Users, Activity, Clock, TrendingUp, LogOut, UserPlus, Mail, Copy, Trash2, MoreVertical, Filter, Search, Check } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'subscription' | 'leaderboard' | 'invitation';

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  hours: number;
  streak: number;
  status: 'active' | 'inactive';
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreviewContent, setEmailPreviewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<{ fullName: string; organizationId: string } | null>(null);
  
  // Invitation form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Data state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [activityData, setActivityData] = useState<{ month: string; users: number; hours: number }[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalHours: 0,
    avgHours: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current admin user
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        onNavigate('login');
        return;
      }
      
      if (!user.organizationId) {
        toast.error('No organization found', {
          description: (
            <span className="text-[#6B21A8]">
              Please contact support
            </span>
          ),
          style: { borderColor: '#C4B5FD', color: '#6B21A8' },
        });
        return;
      }

      setCurrentAdmin({ fullName: user.fullName, organizationId: user.organizationId });

      // Get invitations
      const orgInvitations = await getOrganizationInvitations(user.organizationId);
      setInvitations(orgInvitations);

      // Get all students in organization with their study hours
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', user.organizationId)
        .eq('role', 'student');

      if (profilesError) throw profilesError;

      // Get study sessions for each student
      const usersWithStats = await Promise.all(
        profiles.map(async (profile: any) => {
          const { data: sessions, error } = await supabase
            .from('study_sessions')
            .select('duration_hours, session_date')
            .eq('user_id', profile.id);

          if (error) throw error;

          const totalHours = sessions.reduce((sum: number, s: any) => sum + Number(s.duration_hours), 0);
          
          // Calculate streak
          const today = new Date();
          let streak = 0;
          for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            const hasSession = sessions.some((s: any) => s.session_date.startsWith(dateStr));
            if (hasSession) {
              streak++;
            } else if (i > 0) {
              break;
            }
          }

          // Determine active status (studied in last 7 days)
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const isActive = sessions.some((s: any) => new Date(s.session_date) >= weekAgo);

          return {
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            hours: totalHours,
            streak,
            status: isActive ? 'active' as const : 'inactive' as const
          };
        })
      );

      setUsers(usersWithStats);

      // Calculate stats
      const totalUsers = usersWithStats.length;
      const activeUsers = usersWithStats.filter(u => u.status === 'active').length;
      const totalHours = usersWithStats.reduce((sum, u) => sum + u.hours, 0);
      const avgHours = totalUsers > 0 ? totalHours / totalUsers : 0;

      setStats({
        totalUsers,
        activeUsers,
        totalHours,
        avgHours
      });

      // Get monthly activity data (last 7 months)
      const monthlyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Get sessions for this month
        const { data: monthSessions, error } = await supabase
          .from('study_sessions')
          .select('duration_hours, user_id')
          .gte('session_date', monthStart.toISOString())
          .lte('session_date', monthEnd.toISOString());

        if (error) throw error;

        const monthHours = monthSessions.reduce((sum: number, s: any) => sum + Number(s.duration_hours), 0);
        const uniqueUsers = new Set(monthSessions.map((s: any) => s.user_id)).size;

        monthlyData.push({
          month: monthName,
          users: uniqueUsers,
          hours: monthHours
        });
      }

      setActivityData(monthlyData);

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentAdmin?.organizationId) {
        toast.error('No organization found');
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        onNavigate('login');
        return;
      }

      const invitation = await createInvitation({
        organizationId: currentAdmin.organizationId,
        studentName: inviteName,
        studentEmail: inviteEmail,
        createdBy: user.id
      });
      
      // Reset form
      setInviteName('');
      setInviteEmail('');
      setIsInviteDialogOpen(false);
      
      // Show success notification
      toast.success('📧 Invitation Sent!', {
        description: (
          <span className="text-[#6B21A8]">
            Invitation code {invitation.invitation_code} sent to {inviteEmail}
          </span>
        ),
        duration: 5000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation', {
        description: (
          <span className="text-[#6B21A8]">
            Please try again
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('📋 Code Copied!', {
        description: (
          <span className="text-[#6B21A8]">
            Invitation code "{code}" copied to clipboard
          </span>
        ),
        duration: 2000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
    } catch (err) {
      toast.info(`Code: ${code}`, {
        description: (
          <span className="text-[#6B21A8]">
            Click to select and copy manually
          </span>
        ),
        duration: 5000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
    }
  };

  const handleDeleteInvitation = async (id: string, email: string) => {
    try {
      await deleteInvitation(id);
      toast.success('🗑️ Invitation Deleted', {
        description: (
          <span className="text-[#6B21A8]">
            Invitation for {email} has been removed
          </span>
        ),
        duration: 3000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      loadData();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast.error('Failed to delete invitation');
    }
  };

  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      const updated = await resendInvitation(invitationId);
      toast.success('📧 Invitation Resent!', {
        description: (
          <span className="text-[#6B21A8]">
            Code {updated.invitation_code} has been resent to {email}
          </span>
        ),
        duration: 3000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      loadData();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
    }
  };

  const handleViewUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  const handlePreviewEmail = (code: string, email: string, name: string) => {
    const emailTemplate = `Subject: You're Invited to Join StudyHabit! 🎓

Hi ${name},

You've been invited to join StudyHabit - a productivity tracker designed for students!

Your invitation code is: ${code}

To get started:
1. Visit the invitation page
2. Enter your invitation code: ${code}
3. Set up your password
4. Start tracking your study sessions!

This is a completely FREE account for students. You'll have access to:
✅ Study session tracking
✅ Progress charts and analytics
✅ Leaderboard competition
✅ Streak tracking and goals

If you have any questions, feel free to reach out!

Happy studying! 💙
The StudyHabit Team`;

    setEmailPreviewContent(emailTemplate);
    setIsEmailPreviewOpen(true);
  };

  const handleCopyEmailTemplate = async () => {
    try {
      await navigator.clipboard.writeText(emailPreviewContent);
      toast.success('📋 Copied to Clipboard!', {
        description: (
          <span className="text-[#6B21A8]">
            Email template copied successfully
          </span>
        ),
        duration: 2000,
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
    } catch (err) {
      const textarea = document.getElementById('email-preview-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.select();
        toast.success('📧 Text Selected!', {
          description: (
            <span className="text-[#6B21A8]">
              Press Ctrl+C (Cmd+C on Mac) to copy
            </span>
          ),
          duration: 3000,
          style: { borderColor: '#C4B5FD', color: '#6B21A8' },
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b-2 border-blue-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-slate-900 block">StudyHabit ✨</span>
                <span className="text-slate-500 text-xs">Admin Panel 👨‍💼</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className="text-slate-900">{currentAdmin?.fullName || 'Admin User'}</div>
                <div className="text-slate-500">Administrator</div>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-200 bg-white rounded-2xl hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-slate-900 mt-2">{stats.totalUsers}</div>
              <p className="text-slate-500">Total Users</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300 bg-white rounded-2xl hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-slate-900 mt-2">{stats.activeUsers}</div>
              <p className="text-slate-500">Active Users</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-sky-200 bg-white rounded-2xl hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-slate-900 mt-2">{stats.totalHours.toFixed(0)} hrs</div>
              <p className="text-slate-500">Total Study Hours</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-white rounded-2xl hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-slate-900 mt-2">{stats.avgHours.toFixed(1)} hrs</div>
              <p className="text-slate-500">Avg Per User</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <Card className="border-2 border-blue-200 bg-white rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-900">User Growth 📈</CardTitle>
              <CardDescription className="text-slate-600">Active users over time</CardDescription>
            </CardHeader>
            <CardContent>
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                    <XAxis dataKey="month" stroke="#3b82f6" />
                    <YAxis stroke="#3b82f6" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '2px solid #dbeafe',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  <p>No data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Study Hours Trend */}
          <Card className="border-2 border-blue-300 bg-white rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-900">Study Hours Trend 📊</CardTitle>
              <CardDescription className="text-slate-600">Total platform study hours</CardDescription>
            </CardHeader>
            <CardContent>
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                    <XAxis dataKey="month" stroke="#3b82f6" />
                    <YAxis stroke="#3b82f6" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '2px solid #dbeafe',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(96, 165, 250, 0.15)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#60A5FA" 
                      strokeWidth={3}
                      dot={{ fill: '#60A5FA', r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  <p>No data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invitation Management */}
        <Card className="border-2 border-purple-200 bg-white rounded-3xl shadow-xl mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">Student Invitations 📧</CardTitle>
                <CardDescription className="text-slate-600">Send invites and manage pending invitations</CardDescription>
              </div>
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl border-2 border-purple-200">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900">Invite New Student 🎓</DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Send an invitation code to a new student
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSendInvitation} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700">Student Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., John Doe"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        required
                        className="border-2 border-purple-200 focus:border-purple-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                        className="border-2 border-purple-200 focus:border-purple-500 rounded-xl"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invitation
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(false)}
                        className="border-2 border-slate-300 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No invitations yet</p>
                <p className="text-slate-400 text-sm mt-1">Click "Invite Student" to send your first invitation</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-purple-200">
                      <TableHead className="text-slate-700">Name</TableHead>
                      <TableHead className="text-slate-700">Email</TableHead>
                      <TableHead className="text-slate-700">Invitation Code</TableHead>
                      <TableHead className="text-slate-700">Status</TableHead>
                      <TableHead className="text-slate-700">Created</TableHead>
                      <TableHead className="text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id} className="border-b border-purple-100 hover:bg-purple-50/50">
                        <TableCell className="text-slate-900">{invitation.student_name}</TableCell>
                        <TableCell className="text-slate-600">{invitation.student_email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-mono text-sm">
                              {invitation.invitation_code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(invitation.invitation_code)}
                              className="h-8 w-8 p-0 hover:bg-purple-100"
                            >
                              <Copy className="w-3 h-3 text-purple-600" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {invitation.status === 'pending' ? (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
                              ⏳ Pending
                            </Badge>
                          ) : invitation.status === 'accepted' ? (
                            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                              ✅ Accepted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
                              ❌ Expired
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600">{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4 text-slate-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 rounded-xl border-2 border-purple-200">
                              <DropdownMenuItem 
                                onClick={() => handlePreviewEmail(invitation.invitation_code, invitation.student_email, invitation.student_name)}
                                className="cursor-pointer rounded-lg"
                              >
                                <Mail className="w-4 h-4 mr-2 text-green-600" />
                                Preview Email Template
                              </DropdownMenuItem>
                              {invitation.status === 'pending' && (
                                <DropdownMenuItem 
                                  onClick={() => handleResendInvitation(invitation.id, invitation.student_email)}
                                  className="cursor-pointer rounded-lg"
                                >
                                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                  Resend Invitation
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleCopyCode(invitation.invitation_code)}
                                className="cursor-pointer rounded-lg"
                              >
                                <Copy className="w-4 h-4 mr-2 text-purple-600" />
                                Copy Code
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteInvitation(invitation.id, invitation.student_email)}
                                className="cursor-pointer rounded-lg text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Invitation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Management Table */}
        <Card className="border-2 border-blue-200 bg-white rounded-3xl shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">Manage Users 👥</CardTitle>
                <CardDescription className="text-slate-600">Overview of all registered users</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter {statusFilter !== 'all' && `(${statusFilter})`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl border-2 border-blue-200">
                  <DropdownMenuLabel className="text-slate-700">Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('all')}
                    className="cursor-pointer rounded-lg"
                  >
                    <Check className={`w-4 h-4 mr-2 ${statusFilter === 'all' ? 'opacity-100' : 'opacity-0'}`} />
                    All Users
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('active')}
                    className="cursor-pointer rounded-lg"
                  >
                    <Check className={`w-4 h-4 mr-2 ${statusFilter === 'active' ? 'opacity-100' : 'opacity-0'}`} />
                    Active Only
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter('inactive')}
                    className="cursor-pointer rounded-lg"
                  >
                    <Check className={`w-4 h-4 mr-2 ${statusFilter === 'inactive' ? 'opacity-100' : 'opacity-0'}`} />
                    Inactive Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-blue-200 rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No users found</p>
                <p className="text-slate-400 text-sm mt-1">Invite students to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-blue-200">
                      <TableHead className="text-slate-700">Name</TableHead>
                      <TableHead className="text-slate-700">Email</TableHead>
                      <TableHead className="text-slate-700">Study Hours</TableHead>
                      <TableHead className="text-slate-700">Streak</TableHead>
                      <TableHead className="text-slate-700">Status</TableHead>
                      <TableHead className="text-right text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-b border-blue-100 hover:bg-blue-50">
                        <TableCell className="text-slate-900">{user.name}</TableCell>
                        <TableCell className="text-slate-600">{user.email}</TableCell>
                        <TableCell className="text-slate-900">{user.hours.toFixed(1)} hrs</TableCell>
                        <TableCell>
                          <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white border-0 rounded-full">
                            🔥 {user.streak} days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={user.status === 'active' 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-full' 
                              : 'bg-slate-200 text-slate-700 border-0 rounded-full'
                            }
                          >
                            {user.status === 'active' ? '✅ Active' : '⭕ Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewUserDetails(user)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* User Detail Dialog */}
      {selectedUser && (
        <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
          <DialogContent className="sm:max-w-lg rounded-3xl border-2 border-blue-200">
            <DialogHeader>
              <DialogTitle className="text-slate-900">User Details 👤</DialogTitle>
              <DialogDescription className="text-slate-600">
                Detailed information about {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <div className="text-slate-900">{selectedUser.name}</div>
                    <div className="text-slate-600">{selectedUser.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Badge 
                    className={selectedUser.status === 'active' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-full' 
                      : 'bg-slate-200 text-slate-700 border-0 rounded-full'
                    }
                  >
                    {selectedUser.status === 'active' ? '✅ Active' : '⭕ Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-600">Study Hours</span>
                  </div>
                  <div className="text-slate-900">{selectedUser.hours.toFixed(1)} hrs</div>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    <span className="text-slate-600">Streak</span>
                  </div>
                  <div className="text-slate-900">🔥 {selectedUser.streak} days</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Email Preview Dialog */}
      <Dialog open={isEmailPreviewOpen} onOpenChange={setIsEmailPreviewOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl border-2 border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Email Template Preview 📧</DialogTitle>
            <DialogDescription className="text-slate-600">
              Copy this template to send to your student
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <textarea
              id="email-preview-textarea"
              value={emailPreviewContent}
              readOnly
              className="w-full h-96 p-4 bg-slate-50 border-2 border-purple-200 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button
              onClick={handleCopyEmailTemplate}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Email Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}