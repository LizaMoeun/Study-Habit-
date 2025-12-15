import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BookOpen, ArrowLeft, Shield, Building2, CreditCard, Users, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'subscription' | 'leaderboard' | 'invitation' | 'admin-registration';

interface AdminRegistrationPageProps {
  onNavigate: (page: Page) => void;
  onAdminCreated: () => void;
}

export function AdminRegistrationPage({ onNavigate, onAdminCreated }: AdminRegistrationPageProps) {
  const [step, setStep] = useState<'org' | 'admin' | 'payment'>('org');
  
  // Organization details
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [orgSize, setOrgSize] = useState('');
  
  // Admin details
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Payment details
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orgName || !orgType || !orgSize) {
      toast.error('Please fill in all organization details! 📝', {
        description: (
          <span className="text-[#6B21A8]">
            All fields are required
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      return;
    }
    
    setStep('admin');
    toast.success('✅ Organization Info Saved!', {
      description: (
        <span className="text-[#6B21A8]">
          Now set up your admin account
        </span>
      ),
      style: { borderColor: '#C4B5FD', color: '#6B21A8' },
    });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminName || !adminEmail || !adminPassword || !confirmPassword) {
      toast.error('Please fill in all admin details! 📝', {
        description: (
          <span className="text-[#6B21A8]">
            All fields are required
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      return;
    }
    
    if (adminPassword.length < 8) {
      toast.error('Password must be at least 8 characters! 🔒', {
        description: (
          <span className="text-[#6B21A8]">
            Use a strong password for security
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      return;
    }
    
    if (adminPassword !== confirmPassword) {
      toast.error('Passwords do not match! 🔄', {
        description: (
          <span className="text-[#6B21A8]">
            Please make sure both passwords are the same
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      });
      return;
    }
    
    setStep('payment');
    toast.success('✅ Admin Account Ready!', {
      description: (
        <span className="text-[#6B21A8]">
          Choose your subscription plan
        </span>
      ),
      style: { borderColor: '#C4B5FD', color: '#6B21A8' },
    });
  };

  const handlePaymentSubmit = (plan: 'monthly' | 'yearly') => {
    toast.success('🎉 Organization Created!', {
      description: (
        <span className="text-[#6B21A8]">
          {orgName} is ready! You can now invite students.
        </span>
      ),
      duration: 4000,
      style: { borderColor: '#C4B5FD', color: '#6B21A8' },
    });
    
    setTimeout(() => {
      onAdminCreated();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => onNavigate('landing')}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back Home</span>
      </button>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-6 transition-all">
              <Shield className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-slate-900 mb-2">Create Your Organization 🏫</h2>
          <p className="text-slate-600">Set up your admin account and start inviting students</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'org' ? 'text-purple-600' : step === 'admin' || step === 'payment' ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'org' ? 'bg-purple-500 text-white' : step === 'admin' || step === 'payment' ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                {step === 'admin' || step === 'payment' ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className="hidden sm:inline">Organization</span>
            </div>
            <div className={`h-px w-16 ${step === 'admin' || step === 'payment' ? 'bg-green-500' : 'bg-slate-300'}`} />
            <div className={`flex items-center gap-2 ${step === 'admin' ? 'text-purple-600' : step === 'payment' ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'admin' ? 'bg-purple-500 text-white' : step === 'payment' ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                {step === 'payment' ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <span className="hidden sm:inline">Admin</span>
            </div>
            <div className={`h-px w-16 ${step === 'payment' ? 'bg-green-500' : 'bg-slate-300'}`} />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-purple-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-purple-500 text-white' : 'bg-slate-200'}`}>
                3
              </div>
              <span className="hidden sm:inline">Payment</span>
            </div>
          </div>
        </div>

        <Card className="border-2 border-purple-200 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm">
          {/* Step 1: Organization Info */}
          {step === 'org' && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-slate-900">Organization Details 🏫</CardTitle>
                <CardDescription className="text-slate-600">
                  Tell us about your school or institution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOrgSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name" className="text-slate-700">Organization Name *</Label>
                    <Input
                      id="org-name"
                      type="text"
                      placeholder="e.g., Lincoln High School"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      required
                      className="border-2 border-purple-200 focus:border-purple-500 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-type" className="text-slate-700">Organization Type *</Label>
                    <select
                      id="org-type"
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      required
                      className="w-full border-2 border-purple-200 focus:border-purple-500 rounded-xl h-12 px-3 bg-white"
                    >
                      <option value="">Select type...</option>
                      <option value="high-school">High School</option>
                      <option value="university">University</option>
                      <option value="college">College</option>
                      <option value="tutoring">Tutoring Center</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-size" className="text-slate-700">Expected Number of Students *</Label>
                    <select
                      id="org-size"
                      value={orgSize}
                      onChange={(e) => setOrgSize(e.target.value)}
                      required
                      className="w-full border-2 border-purple-200 focus:border-purple-500 rounded-xl h-12 px-3 bg-white"
                    >
                      <option value="">Select size...</option>
                      <option value="1-50">1-50 students</option>
                      <option value="51-100">51-100 students</option>
                      <option value="101-500">101-500 students</option>
                      <option value="501-1000">501-1000 students</option>
                      <option value="1000+">1000+ students</option>
                    </select>
                  </div>

                  <Alert className="border-2 border-purple-200 bg-purple-50">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <AlertDescription className="text-slate-700">
                      <strong>Admin Account:</strong> You'll be the primary administrator with full control over student invitations and billing.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full h-12 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    Continue to Admin Setup →
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* Step 2: Admin Account */}
          {step === 'admin' && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-slate-900">Admin Account Setup 👨‍💼</CardTitle>
                <CardDescription className="text-slate-600">
                  Create your administrator credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 border-2 border-blue-200 bg-blue-50">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <AlertDescription>
                    <p className="text-slate-700">
                      <strong>Organization:</strong> {orgName}
                    </p>
                    <p className="text-slate-600 text-sm mt-1">
                      Type: {orgType} • Size: {orgSize} students
                    </p>
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name" className="text-slate-700">Your Full Name *</Label>
                    <Input
                      id="admin-name"
                      type="text"
                      placeholder="e.g., Dr. Sarah Johnson"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                      className="border-2 border-purple-200 focus:border-purple-500 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-slate-700">Admin Email Address *</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@yourschool.edu"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="border-2 border-purple-200 focus:border-purple-500 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-slate-700">Create Password *</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="border-2 border-purple-200 focus:border-purple-500 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-700">Confirm Password *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-2 border-purple-200 focus:border-purple-500 rounded-xl h-12"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setStep('org')}
                      className="border-2 border-slate-300 rounded-xl h-12"
                    >
                      ← Back
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full h-12 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      Continue to Payment →
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {/* Step 3: Payment Plan */}
          {step === 'payment' && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-slate-900">Choose Your Plan 💳</CardTitle>
                <CardDescription className="text-slate-600">
                  Select a subscription plan for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 border-2 border-green-200 bg-green-50">
                  <Check className="w-4 h-4 text-green-600" />
                  <AlertDescription>
                    <p className="text-slate-700">
                      <strong>Admin:</strong> {adminName}
                    </p>
                    <p className="text-slate-700">
                      <strong>Organization:</strong> {orgName}
                    </p>
                    <p className="text-slate-600 text-sm mt-1">
                      All students you invite will be covered under this plan
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {/* Monthly Plan */}
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`w-full p-6 rounded-2xl border-2 transition-all ${
                      selectedPlan === 'monthly'
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-purple-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-slate-900">Monthly Plan</h3>
                          {selectedPlan === 'monthly' && (
                            <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                              Selected
                            </div>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mb-3">
                          Pay month-to-month, cancel anytime
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-slate-900">$49</span>
                          <span className="text-slate-600">/month</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                          Unlimited students • All features
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </button>

                  {/* Yearly Plan */}
                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`w-full p-6 rounded-2xl border-2 transition-all relative ${
                      selectedPlan === 'yearly'
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-purple-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full shadow-lg">
                      Save 20%! 🎉
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-slate-900">Yearly Plan</h3>
                          {selectedPlan === 'yearly' && (
                            <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                              Selected
                            </div>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mb-3">
                          Best value • 2 months free
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-slate-900">$470</span>
                          <span className="text-slate-600">/year</span>
                          <span className="text-slate-500 text-sm line-through ml-2">$588</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                          Unlimited students • All features • Priority support
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <h4 className="text-slate-900 mb-2">✨ What's Included:</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Unlimited student invitations
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Full admin dashboard & analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Study tracking & leaderboard
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Progress reports & insights
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Email support
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep('admin')}
                    className="border-2 border-slate-300 rounded-xl h-12"
                  >
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => handlePaymentSubmit(selectedPlan)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full h-12 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    Complete Setup & Start Free Trial 🚀
                  </Button>
                </div>

                <p className="text-center text-slate-500 text-xs mt-4">
                  🎁 Start with a 14-day free trial • No credit card required
                </p>
              </CardContent>
            </>
          )}
        </Card>

        {/* Already have account link */}
        <div className="text-center mt-6">
          <p className="text-slate-600">
            Already have an admin account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Login here →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}