import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { BookOpen, LogOut, Check, Sparkles, Zap, Crown, Heart, Star, Gift, Rocket } from 'lucide-react';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'subscription' | 'leaderboard' | 'invitation' | 'admin-registration';

interface SubscriptionPageProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const plans = [
  {
    id: 'free',
    name: 'Free Forever',
    price: '$0',
    period: 'always free!',
    description: 'Perfect for getting started! 🌱',
    icon: Heart,
    iconColor: 'text-white',
    iconBg: 'from-blue-400 to-blue-500',
    borderColor: 'border-blue-300',
    bgGradient: 'from-white to-blue-50',
    features: [
      'Track up to 10 study sessions',
      'Basic progress charts 📊',
      '7-day history access 📅',
      'Join the leaderboard 🏆',
      'Email support 📧',
    ],
    limitations: [
      'No advanced analytics',
      'No custom goals',
      'No data export',
    ],
    buttonText: 'Current Plan ✨',
    buttonClass: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50',
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '$9.99',
    period: 'per month',
    description: 'For serious learners! 💪',
    icon: Zap,
    iconColor: 'text-white',
    iconBg: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-400',
    bgGradient: 'from-white to-blue-100',
    features: [
      'Unlimited study sessions! 🚀',
      'Advanced analytics & insights 📈',
      'Unlimited history access ⏰',
      'Custom goals & reminders 🎯',
      'Export your data 💾',
      'Priority support 🌟',
      'Ad-free experience ✨',
      'Sync across all devices 📱',
    ],
    buttonText: 'Upgrade Now! 🎉',
    buttonClass: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime Pro',
    price: '$149',
    period: 'one-time!',
    description: 'Best value ever! 💎',
    icon: Crown,
    iconColor: 'text-white',
    iconBg: 'from-blue-600 to-sky-500',
    borderColor: 'border-sky-400',
    bgGradient: 'from-white to-sky-50',
    features: [
      'Everything in Monthly Pro ⭐',
      'Lifetime access forever! 🎊',
      'All future updates included 🔄',
      'Early access to new features 🚀',
      'Exclusive community access 👥',
      'Premium support 💙',
      'Pay once, own forever! 💰',
      'Never pay again! 🎁',
    ],
    buttonText: 'Get Lifetime! 👑',
    buttonClass: 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white',
    popular: false,
    badge: 'Best Value! 🎁',
  },
];

export function SubscriptionPage({ onNavigate, onLogout }: SubscriptionPageProps) {
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
                className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Leaderboard 🏆
              </button>
              <button 
                onClick={() => onNavigate('subscription')}
                className="text-blue-600 flex items-center gap-1"
              >
                Upgrade 💎
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className="text-slate-900 flex items-center gap-2">
                  Alex Johnson <Star className="w-4 h-4 text-yellow-500" />
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

      {/* Important Notice for Students */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-2 border-purple-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-slate-900 mb-1">📢 Important: New Payment Model!</h3>
              <p className="text-slate-700 text-sm mb-2">
                <strong>Students join for FREE! 🎉</strong> Your school/organization admin pays for the subscription, and you get access to all features at no cost. If you're a student, you don't need to pay anything - just use the invitation code from your admin!
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => onNavigate('invitation')}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                >
                  Have Invitation? 📧
                </Button>
                <Button
                  onClick={() => onNavigate('admin-registration')}
                  size="sm"
                  variant="outline"
                  className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 rounded-full"
                >
                  Are you an Admin? 🏫
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-100 via-blue-50 to-sky-100 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 text-7xl opacity-20 bounce-gentle">💎</div>
          <div className="absolute bottom-20 left-20 text-6xl opacity-20 bounce-gentle" style={{ animationDelay: '0.5s' }}>✨</div>
          <div className="absolute top-1/2 left-1/3 text-5xl opacity-20 bounce-gentle" style={{ animationDelay: '1s' }}>🚀</div>
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-sm text-blue-600 rounded-full mb-6 shadow-lg border border-blue-200">
            <Sparkles className="w-5 h-5" />
            <span>Choose Your Plan</span>
          </div>
          <h1 className="text-slate-900 mb-4">Unlock Your Full Potential! 🌟</h1>
          <p className="text-slate-600 text-lg mb-8">
            Choose the perfect plan for your learning journey! All plans come with our happiness guarantee! 💜
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6 -mt-20 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={`border-2 ${plan.borderColor} rounded-3xl bg-gradient-to-br ${plan.bgGradient} hover:shadow-2xl transition-all ${
                    plan.popular 
                      ? 'shadow-2xl scale-105 ring-4 ring-blue-300' 
                      : 'shadow-lg'
                  }`}
                >
                  <CardContent className="p-8 relative">
                    {plan.badge && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 shadow-lg rounded-full border-0 absolute -top-4 left-1/2 -translate-x-1/2">
                        {plan.badge}
                      </Badge>
                    )}
                    {plan.popular && (
                      <Badge className="bg-gradient-to-r from-blue-600 to-sky-500 text-white px-6 py-2 shadow-lg rounded-full border-0 absolute -top-4 left-1/2 -translate-x-1/2">
                        Most Popular! 🔥
                      </Badge>
                    )}

                    <div className={`w-20 h-20 bg-gradient-to-br ${plan.iconBg} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-110 hover:rotate-6 transition-all`}>
                      <Icon className={`w-10 h-10 ${plan.iconColor}`} />
                    </div>

                    <div className="text-center mb-6">
                      <h3 className="text-slate-900 mb-2">{plan.name}</h3>
                      <p className="text-slate-600 mb-4">{plan.description}</p>
                      <div className="mb-2">
                        <span className="text-slate-900">{plan.price}</span>
                      </div>
                      <div className="text-slate-500">{plan.period}</div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.limitations && plan.limitations.length > 0 && (
                      <div className="pt-4 border-t-2 border-blue-100 mb-6">
                        <div className="text-slate-500 mb-3">Not included:</div>
                        <div className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="text-slate-400 flex items-center gap-2">
                              <span className="w-2 h-2 bg-slate-300 rounded-full" />
                              {limitation}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      className={`w-full rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all ${plan.buttonClass}`}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-100 text-blue-600 rounded-full mb-4 shadow-md border border-blue-200">
              <Gift className="w-5 h-5" />
              <span>Why Upgrade?</span>
            </div>
            <h2 className="text-slate-900 mb-4">Supercharge Your Learning! ⚡</h2>
            <p className="text-slate-600 text-lg">Unlock amazing features to take your studying to the next level! 🚀</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200 rounded-3xl bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 mb-3">Unlimited Everything! 🎯</h3>
                <p className="text-slate-600">Track unlimited sessions, access all your history, and never hit a limit again!</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 rounded-3xl bg-gradient-to-br from-white to-blue-100 hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-sky-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 mb-3">Advanced Insights 📈</h3>
                <p className="text-slate-600">Get powerful analytics to understand your study patterns and optimize your learning!</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-200 rounded-3xl bg-gradient-to-br from-white to-sky-50 hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 mb-3">Priority Support 💙</h3>
                <p className="text-slate-600">Get help when you need it with our lightning-fast priority support team!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-slate-900 mb-4">Got Questions? We've Got Answers! 💬</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-slate-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  Can I change plans later?
                </h3>
                <p className="text-slate-600">Of course! Upgrade or downgrade anytime. We're flexible like that! 😊</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-slate-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  What payment methods do you accept?
                </h3>
                <p className="text-slate-600">We accept all major credit cards, PayPal, and more! Super easy! 💙</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-slate-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  Is there a money-back guarantee?
                </h3>
                <p className="text-slate-600">Absolutely! 30-day money-back guarantee. No questions asked! 🌟</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-slate-900 mb-2 flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  Does it work on mobile?
                </h3>
                <p className="text-slate-600">Yes! StudyHabit works perfectly on all your devices! 📱💻</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 border-0 overflow-hidden rounded-3xl shadow-2xl">
            <CardContent className="p-12 relative">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              </div>
              
              <div className="absolute top-8 right-8 text-6xl opacity-30 bounce-gentle">🚀</div>
              <div className="absolute bottom-8 left-8 text-5xl opacity-30 bounce-gentle" style={{ animationDelay: '0.5s' }}>💙</div>
              
              <div className="relative text-center">
                <h2 className="text-white mb-4">Ready to Level Up? 🎯</h2>
                <p className="text-white/90 text-lg mb-8">
                  Join thousands of students who are crushing their goals with StudyHabit Pro! 🌟
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => {/* Handle upgrade */}}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    Start Free Trial! 🎉
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onNavigate('dashboard')}
                    className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-full"
                  >
                    Maybe Later 💭
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
