'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Users, Trophy, Code2, Sparkles, Calendar, Award, Rocket, GraduationCap, Clock, ChevronUp, Star, Mail, MessageCircle, User, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [stats, setStats] = useState({ totalTeams: 0, totalParticipants: 0 });
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const circumference = 2 * Math.PI * 26;
  const supabase = createClient();
  const { user, profile } = useAuth();

  const isLoggedIn = !!user;
  const isAdmin = profile?.role === 'admin';
  const dashboardLink = isAdmin ? '/admin' : (profile?.is_registered ? '/team-dashboard' : '/team-registration');

  // Fetch actual stats from database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch verified teams count using count
        const { count: teamCount, error: countError } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('payment_verified', true);

        // Fetch verified teams with members for participant count
        const { data: teams, error } = await supabase
          .from('teams')
          .select('id, members')
          .eq('payment_verified', true);

        console.log('Fetched teams for stats:', { teamCount, teams, error, countError });

        const totalTeams = teamCount || teams?.length || 0;
        
        // Calculate total participants: leader (1) + members for each team
        let totalParticipants = 0;
        if (teams && !error) {
          totalParticipants = teams.reduce((acc, team) => {
            const membersArray = team.members as Array<any> | null;
            const membersCount = Array.isArray(membersArray) ? membersArray.length : 0;
            return acc + 1 + membersCount; // 1 leader + members
          }, 0);
        }
        
        console.log('Stats calculated:', { totalTeams, totalParticipants });
        setStats({ totalTeams, totalParticipants });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show/hide scroll button and update progress ring directly via ref (no state = no lag)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      
      // Update visibility via state (only when threshold crossed)
      const shouldShow = scrollTop > 400;
      setShowScrollTop(prev => prev !== shouldShow ? shouldShow : prev);
      
      // Update progress ring directly via ref (instant, no re-render)
      if (progressCircleRef.current) {
        progressCircleRef.current.style.strokeDashoffset = String(circumference * (1 - progress));
      }
    };

    // Initial call
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [circumference]);

  useEffect(() => {
    const targetDate = new Date('2026-02-28T23:59:59').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-24 md:-right-48 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-accent/15 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-24 md:-left-48 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/15 rounded-full blur-[100px] md:blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[1000px] h-[500px] md:h-[1000px] bg-accent/5 rounded-full blur-[80px] md:blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] md:bg-[size:64px_64px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Image 
                src="/iutcs-logo.png" 
                alt="IUTCS Logo" 
                width={40} 
                height={40}
                className="relative h-10 w-auto"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/rulebook">
              <Button variant="outline" className="border-border/50 text-white hover:bg-accent/10 hover:border-accent/30 transition-all hover:scale-105">
                Rulebook
              </Button>
            </Link>
            {isLoggedIn ? (
              <Link href={dashboardLink}>
                <Button className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all hover:scale-105 gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all hover:scale-105">
                  Login / Register
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 justify-center lg:justify-start">
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 border border-accent/30 rounded-full text-accent text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-sm">
                    Organized by IUTCS
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
                    Code Sprint
                  </span>
                  <br />
                  <span className="text-accent">2026</span>
                </h1>
                <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Showcase your skills, collaborate with your team, and compete for excellence in the annual IUTCS competition. Build, innovate, and win.
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                {[
                  { icon: Code2, label: 'Code' },
                  { icon: Users, label: 'Collaborate' },
                  { icon: Trophy, label: 'Compete' },
                ].map((item) => (
                  <div 
                    key={item.label}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-background/50 rounded-full border border-border/50 text-xs sm:text-sm text-muted-foreground backdrop-blur-sm"
                  >
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href={isLoggedIn ? dashboardLink : '/login'} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg h-auto group shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {isLoggedIn ? 'Go to Dashboard' : 'Register Your Team'}
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/rulebook" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg h-auto border-border/50 text-white hover:bg-accent/5 hover:border-accent/30 transition-all backdrop-blur-sm">
                    Rulebook
                  </Button>
                </Link>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="relative flex flex-col items-center justify-center h-64 sm:h-80 lg:h-[500px] mt-4 lg:mt-0">
              {/* Animated glow - positioned to the side */}
              <div className="absolute top-1/4 -left-20 sm:-left-10 lg:left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-accent/25 rounded-full blur-[80px] sm:blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-1/4 -right-20 sm:-right-10 lg:right-0 w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] bg-primary/20 rounded-full blur-[60px] sm:blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Timer content */}
              <div className="relative text-center">
                <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
                  <div className="p-2 sm:p-3 bg-accent/10 rounded-full border border-accent/30">
                    <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-accent" />
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-2 sm:mb-3">Submission Deadline</p>
                
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  {[
                    { value: timeLeft.days, label: 'Days' },
                    { value: timeLeft.hours, label: 'Hours' },
                    { value: timeLeft.minutes, label: 'Mins' },
                    { value: timeLeft.seconds, label: 'Secs' }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="relative">
                        <span className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white drop-shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]">
                          {String(item.value).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 uppercase tracking-wider">{item.label}</p>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm sm:text-base text-muted-foreground">
                  Feb 28, 2026 • 11:59 PM
                </p>
                
                {/* Live badge */}
                <div className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs sm:text-sm text-accent font-medium">Registration Open</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 border border-accent/30 rounded-full text-accent text-xs sm:text-sm font-semibold inline-flex items-center gap-2">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Why Join Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
                Why Join Code Sprint?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Compete, collaborate, and showcase your technical expertise
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: GraduationCap,
                title: 'Who Can Participate',
                description: '1st year, 2nd year & 3rd year students can join and showcase their talents',
                gradient: 'from-green-500/20 to-emerald-500/20'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Work with your teammates, combine skills, and tackle challenges together',
                gradient: 'from-blue-500/20 to-cyan-500/20'
              },
              {
                icon: Zap,
                title: 'Innovation Focused',
                description: 'Showcase creative solutions and cutting-edge technology implementations',
                gradient: 'from-accent/20 to-yellow-500/20'
              },
              {
                icon: Trophy,
                title: 'Competitive Prizes',
                description: 'Win recognition, prizes, and industry exposure for your outstanding work',
                gradient: 'from-purple-500/20 to-pink-500/20'
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-accent/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300 border border-accent/20">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-accent" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { label: 'Total Teams', value: stats.totalTeams || '0', icon: Users },
              { label: 'Participants', value: stats.totalParticipants || '0', icon: Code2 },
              { label: 'Prize Pool', value: 'Exciting', icon: Trophy },
              { label: '1st Year Prize', value: 'Guaranteed', icon: Star, highlight: true }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className={`group bg-card/80 backdrop-blur-xl border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 hover:shadow-lg ${
                  stat.highlight 
                    ? 'border-amber-500/50 hover:border-amber-500 hover:shadow-amber-500/20 bg-gradient-to-br from-amber-500/10 to-card/80' 
                    : 'border-border/50 hover:border-accent/50 hover:shadow-accent/10'
                }`}
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-all ${
                  stat.highlight 
                    ? 'bg-amber-500/20 group-hover:bg-amber-500/30' 
                    : 'bg-accent/10 group-hover:bg-accent/20'
                }`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.highlight ? 'text-amber-500' : 'text-accent'}`} />
                </div>
                <p className={`text-xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent mb-1 sm:mb-2 ${
                  stat.highlight 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                    : 'bg-gradient-to-r from-accent to-primary'
                }`}>{stat.value}</p>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">{stat.label}</p>
                {stat.highlight && (
                  <p className="text-[10px] sm:text-xs text-amber-400/80 mt-2">For best 1st year team outside top 3</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-16 space-y-3 sm:space-y-4">
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/10 border border-accent/30 rounded-full text-accent text-xs sm:text-sm font-semibold inline-flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Timeline
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
                Important Dates
              </span>
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-6">
            {[
              { date: 'Jan 15, 2026', event: 'Registration Opens', status: 'completed' },
              { date: 'Feb 28, 2026', event: 'Submission Deadline', status: 'active' },
              { date: 'Mar 15, 2026', event: 'Final Review', status: 'upcoming' },
              { date: 'Mar 30, 2026', event: 'Results Announcement', status: 'upcoming' }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-3 sm:gap-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all ${
                  item.status === 'active' 
                    ? 'bg-accent/10 border-accent/50 shadow-lg shadow-accent/10' 
                    : 'bg-card/80 border-border/50 backdrop-blur-xl'
                }`}
              >
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 ${
                  item.status === 'completed' ? 'bg-green-500' : 
                  item.status === 'active' ? 'bg-accent animate-pulse' : 'bg-muted-foreground/30'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-lg font-semibold text-white truncate">{item.event}</p>
                  <p className="text-xs sm:text-base text-muted-foreground">{item.date}</p>
                </div>
                {item.status === 'active' && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-accent/20 text-accent text-xs sm:text-sm rounded-full font-medium flex-shrink-0">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/10 to-transparent pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-5 sm:space-y-8">
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
              {isLoggedIn ? 'Welcome Back!' : 'Ready to Compete?'}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {isLoggedIn
              ? 'Head to your dashboard to manage your team and submissions.'
              : 'Register your team now and join the IUTCS Code Sprint 2026. Show the world what you can build.'}
          </p>
          <Link href={isLoggedIn ? dashboardLink : '/login'}>
            <Button className="bg-accent hover:bg-accent/90 text-white px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg h-auto group shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
              {isLoggedIn ? 'Go to Dashboard' : 'Start Registering'}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-card/50 backdrop-blur-xl border-t border-border/50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12 items-center">
            <div className="space-y-4 sm:space-y-5 text-center md:text-left">
              <div className="flex items-center gap-2 sm:gap-3 justify-center md:justify-start">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 rounded-lg blur-md"></div>
                  <Image 
                    src="/iutcs-logo.png" 
                    alt="IUTCS" 
                    width={32} 
                    height={32}
                    className="relative h-7 sm:h-8 w-auto"
                  />
                </div>
                <span className="font-bold text-white text-base sm:text-lg">IUTCS Code Sprint 2026</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto md:mx-0">
                IUT Computer Society — Fostering innovation and excellence in technology.
              </p>
            </div>

            <div className="relative bg-background/40 border border-border/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-4 backdrop-blur-sm">
              <h4 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2 justify-center md:justify-start">
                <span className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                  <User className="w-4 h-4 text-accent" />
                </span>
                Contact
              </h4>
              <div className="space-y-3">
                <div className="text-center md:text-left">
                  <p className="text-white font-medium text-sm sm:text-base">Abdullah Al Musaddiq</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Assistant Technical Director, IUT Computer Society</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <span 
                    className="flex items-center gap-2 justify-center md:justify-start px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs sm:text-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="select-all cursor-text">01791751468</span>
                    <span className="text-[10px] text-green-400/60">(text only)</span>
                  </span>
                  <span 
                    className="flex items-center gap-2 justify-center md:justify-start px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs sm:text-sm select-all cursor-text"
                  >
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    musaddiq@iut-dhaka.edu
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 sm:pt-8 text-center text-muted-foreground text-xs sm:text-base">
            <p>&copy; 2026 IUT Computer Society. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button with Progress Ring */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-accent hover:text-white transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-110 active:scale-95 group ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        {/* SVG Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 56 56"
        >
          {/* Background circle */}
          <circle
            cx="28"
            cy="28"
            r="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent/20"
          />
          {/* Progress circle */}
          <circle
            ref={progressCircleRef}
            cx="28"
            cy="28"
            r="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="text-accent"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference,
            }}
          />
        </svg>
        {/* Inner hover background */}
        <div className="absolute inset-2 rounded-full bg-transparent group-hover:bg-accent transition-colors duration-300" />
        {/* Icon */}
        <ChevronUp className="relative w-5 h-5 sm:w-6 sm:h-6 group-hover:text-white transition-colors duration-300" />
      </button>
    </div>
  );
}
