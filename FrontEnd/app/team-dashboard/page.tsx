'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Send, Settings, Users, FileText, CheckCircle, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

interface TeamData {
  id: string;
  name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  department: string;
  transaction_id: string;
  payment_verified: boolean;
  members: Array<{ name: string; studentId: string }>;
  submission_status: string;
  submission_date: string | null;
  created_at: string;
}

export default function TeamDashboard() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!authLoading && user && profile?.team_id) {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', profile.team_id)
          .single();

        if (data && !error) {
          setTeamData(data);
        }
        setIsLoading(false);
      } else if (!authLoading && !user) {
        router.push('/login');
      } else if (!authLoading && user && !profile?.is_registered) {
        router.push('/team-registration');
      }
    };

    fetchTeamData();
  }, [user, profile, authLoading, router, supabase]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Get display data
  const displayData = teamData || {
    name: profile?.full_name || 'Your Team',
    leader_name: user?.user_metadata?.full_name || 'Team Leader',
    leader_email: user?.email || '',
    members: [],
    payment_verified: false,
    submission_status: 'pending',
    submission_date: null,
  };

  const memberCount = (teamData?.members?.length || 0) + 1; // +1 for leader

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
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              size="sm" 
              className="border-border/50 text-white hover:bg-accent/10 hover:border-accent/30 gap-2 bg-transparent transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
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
              Welcome, {displayData.leader_name}!
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">Manage your team and submit your project</p>
        </div>

        {/* Team Info Card */}
        <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 shadow-xl shadow-accent/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Team Name</p>
              <p className="text-xl font-bold text-white">{displayData.name}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Team Members</p>
              <p className="text-xl font-bold text-white">{memberCount}</p>
              <Link href="#members" className="text-accent text-xs hover:underline inline-flex items-center gap-1 group">
                View Members
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-white font-semibold capitalize">{displayData.submission_status}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-1 space-y-4">
            {/* Payment Verification Status */}
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 space-y-4 shadow-lg">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                  <CheckCircle className="w-4 h-4 text-accent" />
                </div>
                Payment Status
              </h2>
              
              {displayData.payment_verified ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-sm text-green-200 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Payment Verified
                  </p>
                  <p className="text-xs text-green-200/70 mt-1">Your registration is confirmed</p>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="text-sm text-amber-200 font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Payment Unverified
                  </p>
                  <p className="text-xs text-amber-200/70 mt-1">Waiting for admin verification</p>
                </div>
              )}
              
              {teamData?.transaction_id && (
                <div className="text-xs text-muted-foreground">
                  <span className="text-white/70">Transaction ID:</span> {teamData.transaction_id}
                </div>
              )}
            </Card>

            {/* Submission Status */}
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 space-y-4 shadow-lg">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                Submission Status
              </h2>
              
              <div className="space-y-4">
                {displayData.submission_status === 'pending' ? (
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
                ) : displayData.submission_status === 'submitted' ? (
                  <>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-2">
                      <p className="text-sm text-blue-200 font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Submitted
                      </p>
                      <p className="text-xs text-blue-200/70">{displayData.submission_date}</p>
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

            {/* Problem Statement */}
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 space-y-4 shadow-lg">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                Problem Statement
              </h3>
              
              {new Date() >= new Date('2026-02-14') ? (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-sm text-green-200 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Problem Statement Released!
                    </p>
                  </div>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white gap-2 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all h-12">
                    <FileText className="w-4 h-4" />
                    View Problem Statement
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-accent/5 border border-accent/30 rounded-xl p-4 text-center">
                    <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="text-sm text-white font-semibold">Coming Soon!</p>
                    <p className="text-xs text-muted-foreground mt-1">Problem statement will be released on</p>
                    <p className="text-accent font-bold mt-2">February 14, 2026</p>
                  </div>
                </div>
              )}
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
                  <p className="text-white font-medium text-lg">{displayData.leader_name}</p>
                  <p className="text-muted-foreground text-sm">{displayData.leader_email}</p>
                  <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20">
                    Team Leader
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full flex items-center justify-center border border-accent/50 shadow-lg">
                    <span className="text-accent font-bold text-xl">{displayData.leader_name?.charAt(0) || 'T'}</span>
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
                  Team Members ({memberCount})
                </h2>
              </div>

              <div className="space-y-3">
                {/* Leader */}
                <div className="flex items-center justify-between p-4 bg-background/50 border border-border/30 rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full flex items-center justify-center border border-accent/30">
                        <span className="text-accent font-bold">{displayData.leader_name?.charAt(0) || 'T'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium">{displayData.leader_name}</p>
                      <p className="text-muted-foreground text-xs">{displayData.leader_email}</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-accent/20 text-accent border border-accent/30">
                    Team Leader
                  </span>
                </div>

                {/* Members */}
                {teamData?.members && teamData.members.length > 0 ? (
                  teamData.members.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-background/50 border border-border/30 rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-accent/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full flex items-center justify-center border border-accent/30">
                            <span className="text-accent font-bold">{member.name?.charAt(0) || 'M'}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-muted-foreground text-xs font-mono">{member.studentId || 'No Student ID'}</p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-background/50 text-muted-foreground border border-border/50">
                        Member
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No additional team members</p>
                    <p className="text-xs">You are participating solo</p>
                  </div>
                )}
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
