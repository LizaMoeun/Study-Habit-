import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BookOpen, ArrowLeft, Check, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'subscription' | 'leaderboard' | 'invitation' | 'admin-registration';

interface InvitationPageProps {
  onLogin: (isAdmin?: boolean) => void;
  onNavigate: (page: Page) => void;
}

// Mock invitation data
const MOCK_INVITATIONS: Record<string, { name: string; email: string; status: string }> = {
  'STUDY2025': { name: 'John Doe', email: 'john@example.com', status: 'pending' },
  'LEARN123': { name: 'Jane Smith', email: 'jane@example.com', status: 'pending' },
  'MATH456': { name: 'Mike Johnson', email: 'mike@example.com', status: 'accepted' },
};

export function InvitationPage({ onLogin, onNavigate }: InvitationPageProps) {
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [invitationCode, setInvitationCode] = useState('');
  const [verifiedInvitation, setVerifiedInvitation] = useState<typeof MOCK_INVITATIONS[string] | null>(null);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    const upperCode = invitationCode.toUpperCase().trim();
    const invitation = MOCK_INVITATIONS[upperCode];
    
    if (!invitation) {
      toast.error('❌ Invalid Code', {
        description: (
          <span className="text-[#6B21A8]">
            Please check your invitation code and try again.
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      return;
    }
    
    if (invitation.status === 'accepted') {
      toast.error('⚠️ Code Already Used', {
        description: (
          <span className="text-[#6B21A8]">
            This invitation has already been activated.
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      return;
    }
    
    setVerifiedInvitation(invitation);
    setStep('password');
    
    toast.success('✅ Invitation Valid!', {
      description: (
        <span className="text-[#6B21A8]">
          Welcome {invitation.name}! Set up your password to continue.
        </span>
      ),
      style: { borderColor: '#C4B5FD', color: '#6B21A8' },
    });
  };

  const handleActivateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('❌ Password Too Short', {
        description: (
          <span className="text-[#6B21A8]">
            Password must be at least 8 characters.
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('❌ Passwords Don\'t Match', {
        description: (
          <span className="text-[#6B21A8]">
            Please make sure both passwords match.
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      return;
    }
    
    toast.success('🎉 Account Activated!', {
      description: (
        <span className="text-[#6B21A8]">
          Welcome to StudyHabit, {verifiedInvitation?.name}! You're ready to start tracking your study sessions.
        </span>
      ),
      duration: 4000,
      style: { borderColor: '#C4B5FD', color: '#6B21A8' },
    });
    
    setTimeout(() => {
      onLogin(false);
    }, 1000);
  };

  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back Home</span>
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-6 transition-all">
              <Mail className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-slate-900 mb-2">Student Invitation 📧</h2>
          <p className="text-slate-600">
            {step === 'code' ? 'Enter your invitation code to get started' : 'Almost there! Set up your password'}
          </p>
        </div>

        <Card className="border-2 border-blue-200 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm">
          {/* Step 1: Enter Code */}
          {step === 'code' && (
            <>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-slate-900">Welcome! 🎉</CardTitle>
                <CardDescription className="text-slate-600">
                  Your admin has invited you to join StudyHabit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="invitation-code" className="text-slate-700">Invitation Code</Label>
                    <Input
                      id="invitation-code"
                      type="text"
                      placeholder="e.g., STUDY2025"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                      required
                      className="border-2 border-blue-200 focus:border-blue-500 rounded-xl h-14 text-center text-lg tracking-wider uppercase"
                      maxLength={20}
                    />
                  </div>

                  <Alert className="border-2 border-blue-200 bg-blue-50">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-slate-700">
                      Check your email for your unique invitation code. If you haven't received one, contact your administrator.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full h-12 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    Verify Code ✨
                  </Button>

                  <div className="mt-6 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                    <p className="text-sm text-slate-600 mb-2">Demo Codes (for testing):</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <code className="text-blue-600 font-mono">STUDY2025</code>
                        <span className="text-slate-500">→ John Doe</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <code className="text-blue-600 font-mono">LEARN123</code>
                        <span className="text-slate-500">→ Jane Smith</span>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {/* Step 2: Set Password */}
          {step === 'password' && verifiedInvitation && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-slate-900">Almost There! 🎊</CardTitle>
                <CardDescription className="text-slate-600">
                  Set up your password to activate your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 border-2 border-green-200 bg-green-50">
                  <Check className="w-4 h-4 text-green-600" />
                  <AlertDescription>
                    <p className="text-slate-700">
                      <strong>Name:</strong> {verifiedInvitation.name}
                    </p>
                    <p className="text-slate-700">
                      <strong>Email:</strong> {verifiedInvitation.email}
                    </p>
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleActivateAccount} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">Create Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-2 border-blue-200 focus:border-blue-500 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-700">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-2 border-blue-200 focus:border-blue-500 rounded-xl h-12"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-2">
                    <p className="text-sm text-slate-700 mb-2">Password Requirements:</p>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordValid ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span className={passwordValid ? 'text-green-600' : 'text-slate-600'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {passwordsMatch ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                      <span className={passwordsMatch ? 'text-green-600' : 'text-slate-600'}>
                        Passwords match
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep('code');
                        setPassword('');
                        setConfirmPassword('');
                        setVerifiedInvitation(null);
                      }}
                      className="border-2 border-slate-300 rounded-xl h-12"
                    >
                      ← Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={!passwordValid || !passwordsMatch}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full h-12 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                    >
                      Activate Account 🚀
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          )}
        </Card>

        {/* Already have account link */}
        <div className="text-center mt-6">
          <p className="text-slate-600">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Login here →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}