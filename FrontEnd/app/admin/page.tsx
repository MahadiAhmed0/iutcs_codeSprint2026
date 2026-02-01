'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogOut, Search, Eye, Check, X, Filter, ChevronDown, Users, FileText, CheckCircle, Shield, Sparkles } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

type Tab = 'teams' | 'submissions' | 'verification';
type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface Team {
  id: string;
  name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  leader_student_id: string;
  department: string;
  nationality: string;
  transaction_id: string;
  payment_verified: boolean;
  members: Array<{ name: string; studentId: string }>;
  submission_status: string;
  created_at: string;
}

interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  gitHubLink: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface VerificationData {
  id: string;
  teamId: string;
  teamName: string;
  status: VerificationStatus;
  submittedAt: string;
}

export default function AdminPanel() {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState<Tab>('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin access - wait for auth to load, then check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (profile && profile.role !== 'admin') {
        // Only redirect if we have a profile and it's not admin
        router.push('/team-dashboard');
      } else if (!profile) {
        // No profile yet - might be a new user, wait a bit then redirect
        const timer = setTimeout(() => {
          router.push('/login');
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // User is admin, stop loading
        setIsLoading(false);
      }
    }
  }, [user, profile, authLoading, router]);

  // Fetch teams data
  useEffect(() => {
    const fetchTeams = async () => {
      if (profile?.role === 'admin') {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('Fetched teams:', { data, error });

        if (data && !error) {
          setTeams(data);
        } else if (error) {
          console.error('Error fetching teams:', error);
        }
      }
    };

    if (!authLoading && profile?.role === 'admin') {
      fetchTeams();
    }
  }, [profile, authLoading, supabase]);

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

  // Not admin check
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Access Denied</p>
          <p className="text-muted-foreground">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // Mock submissions data (would be fetched from Supabase in production)
  const submissions: Submission[] = [
    { id: '1', teamId: 'TEAM-ABC', teamName: 'Code Warriors', gitHubLink: 'github.com/code-warriors/project', submittedAt: 'Feb 15, 2026', status: 'pending' },
  ];

  const verification: VerificationData[] = teams.map(team => ({
    id: team.id,
    teamId: team.id,
    teamName: team.name,
    status: 'pending' as VerificationStatus,
    submittedAt: new Date(team.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.leader_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredVerification = verification.filter(item => {
    const matchesSearch = item.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalTeams: teams.length,
    totalSubmissions: submissions.filter(s => s.status === 'pending').length,
    pendingVerifications: verification.filter(v => v.status === 'pending').length,
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
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full border border-accent/30">Admin</span>
            </div>
          </div>
          
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
      </nav>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-2 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            <span className="text-accent font-medium text-sm sm:text-base">Admin Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage teams, submissions, and verify financial information</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-4 sm:p-6 shadow-lg relative overflow-hidden group hover:border-accent/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs sm:text-sm">Total Teams</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{stats.totalTeams}</p>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 sm:w-7 sm:h-7 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-4 sm:p-6 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs sm:text-sm">Pending Submissions</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{stats.totalSubmissions}</p>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-4 sm:p-6 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all sm:col-span-2 md:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs sm:text-sm">Pending Verification</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{stats.pendingVerifications}</p>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/50 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {(['teams', 'submissions', 'verification'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setFilterStatus('all');
                }}
                className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-transparent text-muted-foreground hover:text-white hover:bg-accent/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by team name or leader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-11 bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors text-sm sm:text-base"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-background/50 border border-border/50 rounded-lg text-white text-sm cursor-pointer hover:border-accent/50 transition-colors focus:outline-none focus:border-accent/50"
              >
                <option value="all">All Status</option>
                {activeTab === 'teams' && (
                  <>
                    <option value="registered">Registered</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                  </>
                )}
                {activeTab === 'submissions' && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
                {activeTab === 'verification' && (
                  <>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-background/50 border-b border-border/50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Team Name</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Leader</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Members</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Status</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredTeams.map(team => (
                      <tr key={team.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white font-medium text-sm">{team.name}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground text-sm">{team.leader_name}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white text-sm">{(team.members?.length || 0) + 1}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
                            team.submission_status === 'pending' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                            team.submission_status === 'submitted' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                            'bg-green-500/10 text-green-300 border-green-500/30'
                          }`}>
                            {(team.submission_status || 'pending').charAt(0).toUpperCase() + (team.submission_status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <Button size="sm" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 gap-1 bg-transparent transition-all text-xs sm:text-sm">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-background/50 border-b border-border/50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Team Name</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">GitHub Link</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Submitted</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Status</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredSubmissions.map(submission => (
                      <tr key={submission.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white font-medium text-sm">{submission.teamName}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">{submission.gitHubLink}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground text-xs sm:text-sm">{submission.submittedAt}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
                            submission.status === 'pending' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                            submission.status === 'approved' ? 'bg-green-500/10 text-green-300 border-green-500/30' :
                            'bg-red-500/10 text-red-300 border-red-500/30'
                          }`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right flex justify-end gap-1 sm:gap-2">
                          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 gap-1 bg-transparent transition-all p-1.5 sm:p-2">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 gap-1 bg-transparent transition-all p-1.5 sm:p-2">
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead className="bg-background/50 border-b border-border/50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Team Name</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Submitted</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Status</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredVerification.map(item => (
                      <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white font-medium text-sm">{item.teamName}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground text-xs sm:text-sm">{item.submittedAt}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
                            item.status === 'pending' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                            item.status === 'approved' ? 'bg-green-500/10 text-green-300 border-green-500/30' :
                            'bg-red-500/10 text-red-300 border-red-500/30'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right flex justify-end gap-1 sm:gap-2">
                          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 bg-transparent transition-all p-1.5 sm:p-2">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent transition-all p-1.5 sm:p-2">
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
