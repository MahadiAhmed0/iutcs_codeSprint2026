'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Send, Settings, Users, FileText, CheckCircle, Clock, Sparkles, ArrowRight, Copy } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';

export default function TeamDashboard() {
  const teamData = {
    teamId: 'TEAM-ABC123DEF',
    teamName: 'Code Warriors',
    leaderName: 'John Doe',
    email: 'john@gmail.com',
    memberCount: 3,
    submissionStatus: 'pending', // pending, submitted, approved, rejected
    submissionDate: null
  };

  const copyTeamId = () => {
    navigator.clipboard.writeText(teamData.teamId);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-border/50 sticky top-0 z-40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
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
            <span className="font-bold text-white hidden sm:inline">IUTCS</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-accent/10 rounded-lg transition-colors group">
              <Settings className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </button>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-border/50 text-white hover:bg-accent/10 hover:border-accent/30 gap-2 bg-transparent transition-all">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-accent font-medium">Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
              Welcome, {teamData.leaderName}!
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">Manage your team and submit your project</p>
        </div>

        {/* Team Info Card */}
        <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 shadow-xl shadow-accent/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Team ID</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-accent font-mono">{teamData.teamId}</p>
                <button 
                  onClick={copyTeamId}
                  className="p-1.5 hover:bg-accent/10 rounded-lg transition-colors"
                  title="Copy Team ID"
                >
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-accent" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Save this for reference</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Team Name</p>
              <p className="text-xl font-bold text-white">{teamData.teamName}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Team Members</p>
              <p className="text-xl font-bold text-white">{teamData.memberCount}</p>
              <Link href="#members" className="text-accent text-xs hover:underline inline-flex items-center gap-1 group">
                View Members
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-white font-semibold capitalize">{teamData.submissionStatus}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-1 space-y-4">
            {/* Submission Status */}
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 space-y-4 shadow-lg">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                Submission Status
              </h2>
              
              <div className="space-y-4">
                {teamData.submissionStatus === 'pending' ? (
                  <>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <p className="text-sm text-amber-200 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        No submission yet
                      </p>
                    </div>
                    <Link href="/submission" className="w-full block">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-white gap-2 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all h-12">
                        <Send className="w-4 h-4" />
                        Submit Project
                      </Button>
                    </Link>
                  </>
                ) : teamData.submissionStatus === 'submitted' ? (
                  <>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-2">
                      <p className="text-sm text-blue-200 font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Submitted
                      </p>
                      <p className="text-xs text-blue-200/70">{teamData.submissionDate}</p>
                    </div>
                    <Button variant="outline" className="w-full border-border/50 text-white hover:bg-accent/10 hover:border-accent/30 bg-transparent transition-all">
                      View Submission
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <p className="text-sm text-green-200 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Important Links */}
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 space-y-3 shadow-lg">
              <h3 className="font-semibold text-white mb-3">Quick Links</h3>
              {['Rules & Guidelines', 'FAQ', 'Contact Support'].map((item) => (
                <button 
                  key={item}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-accent/10 text-white text-sm transition-all flex items-center justify-between group border border-transparent hover:border-accent/20"
                >
                  {item}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </Card>
          </div>

          {/* Right Column - Team Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Leader Info */}
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 space-y-4 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none"></div>
              <h2 className="relative text-lg font-semibold text-white">Team Leader</h2>
              <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-white font-medium text-lg">{teamData.leaderName}</p>
                  <p className="text-muted-foreground text-sm">{teamData.email}</p>
                  <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">
                    Team Leader
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full flex items-center justify-center border border-accent/50 shadow-lg">
                    <span className="text-accent font-bold text-xl">{teamData.leaderName.charAt(0)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Team Members */}
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 space-y-4 shadow-lg" id="members">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <Users className="w-4 h-4 text-accent" />
                  </div>
                  Team Members ({teamData.memberCount})
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'John Doe', id: 'IUT-2024-001', role: 'Team Leader' },
                  { name: 'Jane Smith', id: 'IUT-2024-002', role: 'Member' },
                  { name: 'Mike Johnson', id: 'IUT-2024-003', role: 'Member' }
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-background/50 border border-border/30 rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full flex items-center justify-center border border-accent/30">
                          <span className="text-accent font-bold">{member.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-muted-foreground text-xs font-mono">{member.id}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      member.role === 'Team Leader' 
                        ? 'bg-accent/20 text-accent border border-accent/30' 
                        : 'bg-background/50 text-muted-foreground border border-border/50'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Timeline */}
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 space-y-4 shadow-lg">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                Timeline
              </h2>

              <div className="space-y-4">
                {[
                  { date: 'Jan 15, 2026', event: 'Competition Opens', status: 'completed' },
                  { date: 'Feb 28, 2026', event: 'Submission Deadline', status: 'active' },
                  { date: 'Mar 15, 2026', event: 'Final Review', status: 'pending' },
                  { date: 'Mar 30, 2026', event: 'Results Announcement', status: 'pending' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        item.status === 'completed' ? 'bg-green-500 border-green-500' : 
                        item.status === 'active' ? 'bg-accent border-accent animate-pulse' : 'bg-transparent border-muted-foreground/30'
                      }`}></div>
                      {idx < 3 && <div className={`w-0.5 h-12 mt-2 ${
                        item.status === 'completed' ? 'bg-green-500/50' : 'bg-border/50'
                      }`}></div>}
                    </div>
                    <div className={`pb-4 ${item.status === 'active' ? 'bg-accent/5 -ml-2 pl-4 pr-4 py-2 rounded-xl border border-accent/20' : ''}`}>
                      <p className={`font-medium ${item.status === 'active' ? 'text-accent' : 'text-white'}`}>{item.event}</p>
                      <p className="text-muted-foreground text-sm">{item.date}</p>
                      {item.status === 'active' && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">Current</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
