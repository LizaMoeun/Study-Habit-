import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { BookOpen, TrendingUp, Trophy, Target, Clock, BarChart3, Heart, Star, Sparkles } from 'lucide-react';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'subscription' | 'leaderboard' | 'invitation' | 'admin-registration';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-blue-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-slate-900">StudyHabit ✨</span>
              </div>
            </div>

            <Button 
              onClick={() => onNavigate('login')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-full px-6 shadow-lg"
            >
              Log in 🚀
            </Button>
          </div>
        </div>
      </nav>

      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20 bounce-gentle">✨</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20 bounce-gentle" style={{ animationDelay: '0.5s' }}>🌟</div>
        <div className="absolute bottom-40 left-20 text-5xl opacity-20 bounce-gentle" style={{ animationDelay: '1s' }}>💫</div>
        <div className="absolute bottom-20 right-40 text-6xl opacity-20 bounce-gentle" style={{ animationDelay: '1.5s' }}>⭐</div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-5 py-2 bg-blue-100 text-blue-600 rounded-full shadow-md border border-blue-200">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Transform Your Study Journey! 
                </span>
              </div>
              
              <h1 className="text-slate-900">
                Track 📚 Improve 💪 <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 bg-clip-text text-transparent">Achieve! 🎯</span>
              </h1>
              
              <p className="text-slate-600 text-lg">
                Hey there, superstar student! 👋 Ready to level up your study game? 
                Join thousands of awesome learners who are crushing their goals with StudyHabit! 
                Let's make learning fun together! 🎉
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => onNavigate('admin-registration')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Create Organization 🏫
                </Button>
                <Button 
                  onClick={() => onNavigate('invitation')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Have Invitation? 📧
                </Button>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => onNavigate('login')}
                  className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-500 px-8 py-6 rounded-full shadow-lg"
                >
                  Login 🚀
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-slate-900">10,000+ 😊</div>
                  <div className="text-slate-500">Happy Students</div>
                </div>
                <div className="w-px h-12 bg-blue-300" />
                <div className="text-center">
                  <div className="text-slate-900">50M+ ⏰</div>
                  <div className="text-slate-500">Study Hours</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-400/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-sky-400/30 rounded-full blur-3xl"></div>
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1729824186959-ba83cbd1978d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnRzJTIwc3R1ZHlpbmd8ZW58MXx8fHwxNzYwNTA4MTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Happy students studying"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              
              {/* Floating Stats Card */}
              <Card className="absolute -bottom-6 -left-6 bg-white shadow-2xl border-4 border-blue-100 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-slate-900">+25% This Week! 🎉</div>
                      <div className="text-slate-500">You're on fire!</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-5 py-2 bg-blue-100 text-blue-600 rounded-full mb-4 shadow-md border border-blue-200">
              <span className="inline-flex items-center gap-2">
                <Star className="w-4 h-4" />
                Super Cool Features
              </span>
            </div>
            <h2 className="text-slate-900 mb-4">Everything You Need to Shine! ✨</h2>
            <p className="text-slate-600 text-lg">
              We've packed all the awesome tools to help you succeed! 🚀
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-white to-blue-50 transform hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg transform hover:rotate-12 transition-transform">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 mb-3">Track Every Moment ⏱️</h3>
                <p className="text-slate-600">
                  Log all your awesome study sessions! Keep track of what you're learning and watch yourself grow! 🌱
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 hover:border-blue-500 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-white to-blue-100 transform hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-sky-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg transform hover:rotate-12 transition-transform">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 mb-3">Beautiful Graphs 📊</h3>
                <p className="text-slate-600">
                  See your progress come to life with colorful charts! It's like magic but it's all YOU! 🎨
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-200 hover:border-sky-400 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-white to-sky-50 transform hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg transform hover:rotate-12 transition-transform">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 mb-3">Epic Leaderboard 🏆</h3>
                <p className="text-slate-600">
                  Compete with friends and celebrate wins together! Friendly competition makes learning FUN! 🎉
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-white to-blue-50 transform hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-sky-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg transform hover:rotate-12 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 mb-3">Set Cool Goals 🎯</h3>
                <p className="text-slate-600">
                  Dream big and set goals! We'll cheer you on every step of the way! You got this! 💪
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 hover:border-blue-500 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-white to-blue-100 transform hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg transform hover:rotate-12 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 mb-3">Stay Motivated 💖</h3>
                <p className="text-slate-600">
                  Build streaks, earn badges, and feel amazing about your progress! Celebrate every win! 🌟
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-sky-200 hover:border-sky-400 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-white to-sky-50 transform hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg transform hover:rotate-12 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-slate-900 mb-3">Smart Insights ✨</h3>
                <p className="text-slate-600">
                  Discover when you study best and what subjects need more love! Get smarter about studying! 🧠
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 border-0 overflow-hidden rounded-3xl shadow-2xl">
            <CardContent className="p-12 relative">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              </div>
              
              <div className="absolute top-8 right-8 text-6xl opacity-30 bounce-gentle">🎓</div>
              <div className="absolute bottom-8 left-8 text-5xl opacity-30 bounce-gentle" style={{ animationDelay: '0.5s' }}>📚</div>
              
              <div className="relative text-center">
                <h2 className="text-white mb-4">Ready to Become a Study Superstar? 🌟</h2>
                <p className="text-white/90 text-lg mb-8">
                  Join 10,000+ students who are already crushing their goals! Your journey starts here! 🚀✨
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => onNavigate('admin-registration')}
                    className="bg-white text-purple-600 hover:bg-purple-50 border-2 border-white px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    Create Organization 🏫
                  </Button>
                  <Button 
                    onClick={() => onNavigate('invitation')}
                    className="bg-white text-blue-600 hover:bg-blue-50 border-2 border-white px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    Have Invitation? 📧
                  </Button>
                </div>
                <p className="text-white/90 text-sm mt-4">
                  Students join FREE with an invitation code! 🎁
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gradient-to-r from-slate-800 to-blue-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span>StudyHabit ✨</span>
            </div>
            
            <p className="text-blue-200">© 2025 StudyHabit. Made with 💖 for students everywhere!</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
