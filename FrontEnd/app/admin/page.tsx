'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogOut, Search, Eye, Check, X, Filter, ChevronDown, Users, FileText, CheckCircle, Shield, Sparkles, AlertTriangle, Loader2, Download } from 'lucide-react';
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
  members: Array<{ name: string; studentId: string; phone?: string; nationality?: string; email?: string }>;
  submission_status: string;
  created_at: string;
}

interface Submission {
  id: string;
  team_id: string;
  requirement_analysis_link: string;
  stack_report_link: string;
  dependencies_docs_link: string;
  github_link: string;
  status: string;
  submitted_at: string;
  // Joined from teams
  team_name?: string;
}

interface VerificationData {
  id: string;
  teamId: string;
  teamName: string;
  transactionId: string;
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
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | null;
    teamId: string | null;
    teamName: string | null;
  }>({ isOpen: false, action: null, teamId: null, teamName: null });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Selected team for viewing details
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

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

    const fetchSubmissions = async () => {
      if (profile?.role === 'admin') {
        const { data, error } = await supabase
          .from('submissions')
          .select('*, teams(name)')
          .order('submitted_at', { ascending: false });

        console.log('Fetched submissions:', { data, error });

        if (data && !error) {
          const formattedSubmissions = data.map((sub: any) => ({
            ...sub,
            team_name: sub.teams?.name || 'Unknown Team'
          }));
          setSubmissions(formattedSubmissions);
        } else if (error) {
          console.error('Error fetching submissions:', error);
        }
      }
    };

    if (!authLoading && profile?.role === 'admin') {
      fetchTeams();
      fetchSubmissions();
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

  // Create submission data from teams (showing all teams with their submission status)
  const teamsWithSubmissions = teams.map(team => {
    const submission = submissions.find(s => s.team_id === team.id);
    return {
      teamId: team.id,
      teamName: team.name,
      hasSubmission: !!submission,
      submission: submission || null,
      submittedAt: submission ? new Date(submission.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
    };
  });

  const verification: VerificationData[] = teams.map(team => ({
    id: team.id,
    teamId: team.id,
    teamName: team.name,
    transactionId: team.transaction_id,
    status: team.payment_verified ? 'approved' : 'pending' as VerificationStatus,
    submittedAt: new Date(team.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  // Only show payment verified teams
  const verifiedTeams = teams.filter(team => team.payment_verified);
  
  const filteredTeams = verifiedTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.leader_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSubmissions = teamsWithSubmissions.filter(item => {
    const matchesSearch = item.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && !item.hasSubmission) ||
      (filterStatus === 'submitted' && item.hasSubmission);
    return matchesSearch && matchesStatus;
  });

  const filteredVerification = verification.filter(item => {
    const matchesSearch = item.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalTeams: verifiedTeams.length,
    totalSubmissions: submissions.length,
    pendingVerifications: teams.filter(t => !t.payment_verified).length,
  };

  // Handle opening confirmation dialog
  const openConfirmDialog = (action: 'approve' | 'reject', teamId: string, teamName: string) => {
    setConfirmDialog({ isOpen: true, action, teamId, teamName });
  };

  // Handle closing confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, action: null, teamId: null, teamName: null });
  };

  // Handle payment verification
  const handlePaymentVerification = async () => {
    if (!confirmDialog.teamId || !confirmDialog.action) return;
    
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({ 
          payment_verified: confirmDialog.action === 'approve',
          updated_at: new Date().toISOString()
        })
        .eq('id', confirmDialog.teamId);

      if (error) {
        console.error('Error updating payment status:', error);
        alert('Failed to update payment status. Please try again.');
      } else {
        // Update local state
        setTeams(prev => prev.map(team => 
          team.id === confirmDialog.teamId 
            ? { ...team, payment_verified: confirmDialog.action === 'approve' }
            : team
        ));
        closeConfirmDialog();
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download single team submission as PDF
  const downloadTeamSubmission = (item: typeof teamsWithSubmissions[0]) => {
    if (!item.submission) return;
    
    const content = `
<!DOCTYPE html>
<html>
<head>
  <title>Submission - ${item.teamName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
    .info { margin: 20px 0; }
    .label { font-weight: bold; color: #666; margin-top: 15px; }
    .link { color: #6366f1; word-break: break-all; }
    .date { color: #888; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Team Submission: ${item.teamName}</h1>
  <div class="info">
    <p class="label">Requirement Analysis:</p>
    <p class="link"><a href="${item.submission.requirement_analysis_link}">${item.submission.requirement_analysis_link}</a></p>
    
    <p class="label">Stack Report:</p>
    <p class="link"><a href="${item.submission.stack_report_link}">${item.submission.stack_report_link}</a></p>
    
    <p class="label">Dependencies & Documentation:</p>
    <p class="link"><a href="${item.submission.dependencies_docs_link}">${item.submission.dependencies_docs_link}</a></p>
    
    <p class="label">GitHub Repository:</p>
    <p class="link"><a href="${item.submission.github_link}">${item.submission.github_link}</a></p>
  </div>
  <p class="date">Submitted: ${item.submittedAt}</p>
</body>
</html>`;
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission-${item.teamName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download all submissions as CSV
  const downloadAllSubmissions = () => {
    const submittedTeams = teamsWithSubmissions.filter(t => t.hasSubmission && t.submission);
    if (submittedTeams.length === 0) {
      alert('No submissions to download');
      return;
    }
    
    const headers = ['Team Name', 'Requirement Analysis', 'Stack Report', 'Dependencies & Docs', 'GitHub Link', 'Submitted At'];
    const rows = submittedTeams.map(item => [
      item.teamName,
      item.submission!.requirement_analysis_link,
      item.submission!.stack_report_link,
      item.submission!.dependencies_docs_link,
      item.submission!.github_link,
      item.submittedAt || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <span className="font-bold text-white">IUTCS</span>
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-accent font-medium">Admin Panel</span>
          </div>
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground">Manage teams, submissions, and verify financial information</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-lg relative overflow-hidden group hover:border-accent/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Teams</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalTeams}</p>
              </div>
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Submissions</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalSubmissions}</p>
              </div>
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-amber-500" />
              </div>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Payment Verification</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.pendingVerifications}</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-blue-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/50">
          <div className="flex gap-1">
            {(['teams', 'submissions', 'verification'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setFilterStatus('all');
                }}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
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
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by team name or leader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
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
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <p className="text-sm text-accent">
                  Only payment verified teams are shown here. Teams pending verification can be found in the Verification tab.
                </p>
              </div>
              
              <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background/50 border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Team Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Leader</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Members</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredTeams.map(team => (
                      <tr key={team.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{team.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{team.leader_name}</td>
                        <td className="px-6 py-4 text-white">{(team.members?.length || 0) + 1}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            team.submission_status === 'pending' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                            team.submission_status === 'submitted' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                            'bg-green-500/10 text-green-300 border-green-500/30'
                          }`}>
                            {(team.submission_status || 'pending').charAt(0).toUpperCase() + (team.submission_status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 gap-1 bg-transparent transition-all"
                            onClick={() => setSelectedTeam(team)}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredTeams.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          No verified teams found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            </div>
          )}

          {/* Team Details Modal */}
          {selectedTeam && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTeam(null)}>
              <Card className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    Team Details
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTeam(null)}
                    className="text-muted-foreground hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Team Name */}
                  <div className="text-center pb-4 border-b border-border/30">
                    <h3 className="text-2xl font-bold text-white">{selectedTeam.name}</h3>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-500/10 text-green-300 border border-green-500/30 rounded-full text-xs font-semibold">
                      Payment Verified
                    </span>
                  </div>
                  
                  {/* Leader Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">Team Leader</h4>
                    <div className="bg-background/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-white font-medium">{selectedTeam.leader_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-white font-medium">{selectedTeam.leader_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="text-white font-medium">{selectedTeam.leader_phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Student ID:</span>
                        <span className="text-white font-medium">{selectedTeam.leader_student_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department:</span>
                        <span className="text-white font-medium">{selectedTeam.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nationality:</span>
                        <span className="text-white font-medium">{selectedTeam.nationality}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  {selectedTeam.members && selectedTeam.members.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">Team Members ({selectedTeam.members.length})</h4>
                      <div className="space-y-3">
                        {selectedTeam.members.map((member, index) => (
                          <div key={index} className="bg-background/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-center border-b border-border/30 pb-2 mb-2">
                              <p className="text-white font-medium">{member.name}</p>
                              <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">Member {index + 1}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Student ID:</span>
                                <span className="text-white">{member.studentId}</span>
                              </div>
                              {member.phone && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Phone:</span>
                                  <span className="text-white">{member.phone}</span>
                                </div>
                              )}
                              {member.email && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Email:</span>
                                  <span className="text-white">{member.email}</span>
                                </div>
                              )}
                              {member.nationality && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Nationality:</span>
                                  <span className="text-white">{member.nationality}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-accent uppercase tracking-wider">Payment Information</h4>
                    <div className="bg-background/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="text-white font-medium font-mono">{selectedTeam.transaction_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-green-400 font-medium">Verified</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Registration Date */}
                  <div className="text-center pt-4 border-t border-border/30">
                    <p className="text-muted-foreground text-sm">
                      Registered on {new Date(selectedTeam.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {/* Download All Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={downloadAllSubmissions}
                  className="bg-accent hover:bg-accent/90 text-white gap-2"
                  disabled={submissions.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Download All Submissions (CSV)
                </Button>
              </div>
              
              <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-background/50 border-b border-border/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Team Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Submitted</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-white">Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredSubmissions.map(item => (
                        <tr key={item.teamId} className="hover:bg-accent/5 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{item.teamName}</td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">
                            {item.submittedAt || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                              item.hasSubmission 
                                ? 'bg-green-500/10 text-green-300 border-green-500/30' 
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}>
                              {item.hasSubmission ? 'Submitted' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.hasSubmission && item.submission ? (
                              <div className="flex justify-center">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 bg-transparent transition-all gap-2"
                                  onClick={() => downloadTeamSubmission(item)}
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground text-sm">-</div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredSubmissions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                            No submissions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background/50 border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Team Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Transaction ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Registered</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredVerification.map(item => (
                      <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{item.teamName}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm font-mono">{item.transactionId}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">{item.submittedAt}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            item.status === 'pending' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                            item.status === 'approved' ? 'bg-green-500/10 text-green-300 border-green-500/30' :
                            'bg-red-500/10 text-red-300 border-red-500/30'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          {item.status === 'pending' ? (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 bg-transparent transition-all"
                                onClick={() => openConfirmDialog('approve', item.teamId, item.teamName)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent transition-all"
                                onClick={() => openConfirmDialog('reject', item.teamId, item.teamName)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {item.status === 'approved' ? 'Verified' : 'Rejected'}
                            </span>
                          )}
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

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeConfirmDialog}
          />
          
          {/* Dialog */}
          <Card className="relative bg-card border border-border/50 p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  confirmDialog.action === 'approve' 
                    ? 'bg-green-500/10 border-2 border-green-500/30' 
                    : 'bg-red-500/10 border-2 border-red-500/30'
                }`}>
                  {confirmDialog.action === 'approve' ? (
                    <Check className="w-8 h-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  )}
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  {confirmDialog.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                </h3>
                <p className="text-muted-foreground">
                  Are you sure you want to {confirmDialog.action === 'approve' ? 'approve' : 'reject'} the payment for team <span className="text-white font-medium">"{confirmDialog.teamName}"</span>?
                </p>
                {confirmDialog.action === 'reject' && (
                  <p className="text-red-400 text-sm">
                    This will mark the payment as rejected.
                  </p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-border/50 text-white hover:bg-accent/10 bg-transparent"
                  onClick={closeConfirmDialog}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${
                    confirmDialog.action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  onClick={handlePaymentVerification}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {confirmDialog.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
}
