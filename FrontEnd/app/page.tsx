'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Users, Trophy, Code2, Sparkles, Calendar, Award, Rocket } from 'lucide-react';

export default function LandingPage() {
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
          <Link href="/login">
            <Button className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all hover:scale-105">
              Login / Register
            </Button>
          </Link>
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
                <Link href="/login" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg h-auto group shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Register Your Team
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <button className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 border border-border/50 rounded-lg text-white hover:bg-accent/5 hover:border-accent/30 transition-all backdrop-blur-sm text-base sm:text-lg">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative h-64 sm:h-80 lg:h-[500px] mt-4 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/30 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl animate-pulse"></div>
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center h-full shadow-2xl shadow-accent/10">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl sm:blur-2xl animate-pulse"></div>
                  <Image 
                    src="/iutcs-logo.png" 
                    alt="IUTCS" 
                    width={200} 
                    height={200}
                    className="relative w-28 sm:w-40 lg:w-48 h-auto drop-shadow-2xl"
                  />
                </div>
                
                {/* Floating badges */}
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 px-2 sm:px-4 py-1 sm:py-2 bg-accent/20 border border-accent/30 rounded-full text-accent text-xs sm:text-sm font-semibold backdrop-blur-sm">
                  <Rocket className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" /> Live Now
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
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
              { label: 'Total Teams', value: '50+', icon: Users },
              { label: 'Participants', value: '200+', icon: Code2 },
              { label: 'Prize Pool', value: 'Exciting', icon: Trophy },
              { label: 'Categories', value: '3+', icon: Award }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="group bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-accent/10 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent" />
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-1 sm:mb-2">{stat.value}</p>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">{stat.label}</p>
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
              Ready to Compete?
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Register your team now and join the IUTCS Code Sprint 2026. Show the world what you can build.
          </p>
          <Link href="/login">
            <Button className="bg-accent hover:bg-accent/90 text-white px-6 sm:px-10 py-5 sm:py-7 text-base sm:text-lg h-auto group shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Start Registering
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-card/50 backdrop-blur-xl border-t border-border/50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
              <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
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
                <span className="font-bold text-white text-base sm:text-lg">IUTCS</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                IUT Computer Society - Fostering innovation and excellence in technology
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                <li><a href="#" className="hover:text-accent transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 -ml-5 sm:-ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all hidden sm:block" />About Us</a></li>
                <li><a href="#" className="hover:text-accent transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 -ml-5 sm:-ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all hidden sm:block" />Rules & Regulations</a></li>
                <li><a href="#" className="hover:text-accent transition-colors inline-flex items-center gap-2 group"><ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 -ml-5 sm:-ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all hidden sm:block" />FAQ</a></li>
              </ul>
            </div>
            <div className="text-center sm:text-left sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
              <ul className="space-y-2 sm:space-y-3 text-muted-foreground text-sm sm:text-base">
                <li className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full"></span>
                  Email: info@iutcs.org
                </li>
                <li className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full"></span>
                  Phone: +880 1XXX-XXXXXX
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 sm:pt-8 text-center text-muted-foreground text-xs sm:text-base">
            <p>&copy; 2026 IUT Computer Society. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
