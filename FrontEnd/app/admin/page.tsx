'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogOut, Search, Eye, Check, X, Filter, ChevronDown, Users, FileText, CheckCircle, Shield, Sparkles, AlertTriangle, Loader2, Download, DollarSign, Settings } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

type Tab = 'teams' | 'submissions' | 'verification' | 'settings';
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
  payment_status: string;
  competition_type: string;
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
  deployment_link?: string;
  demonstration_video_link?: string;
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
  competitionType: string;
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
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isTogglingRegistration, setIsTogglingRegistration] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(true);
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [isTogglingSubmission, setIsTogglingSubmission] = useState(false);
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);
  
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
  
  // Selected submission for viewing details
  const [selectedSubmission, setSelectedSubmission] = useState<typeof teamsWithSubmissions[0] | null>(null);

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
      
      // Fetch registration settings
      const fetchRegistrationSettings = async () => {
        const { data } = await supabase
          .from('registration_settings')
          .select('is_registration_open')
          .single();
        if (data) setIsRegistrationOpen(data.is_registration_open);
      };
      fetchRegistrationSettings();

      // Fetch submission settings
      const fetchSubmissionSettings = async () => {
        const { data } = await supabase
          .from('submission_settings')
          .select('is_submission_open, deadline')
          .single();
        if (data) {
          setIsSubmissionOpen(data.is_submission_open);
          if (data.deadline) {
            // Format to local datetime-local input value
            const d = new Date(data.deadline);
            const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setSubmissionDeadline(local);
          }
        }
      };
      fetchSubmissionSettings();
    }
  }, [profile, authLoading, supabase]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const toggleRegistration = async () => {
    setIsTogglingRegistration(true);
    const newValue = !isRegistrationOpen;
    const { error } = await supabase
      .from('registration_settings')
      .update({ is_registration_open: newValue, updated_at: new Date().toISOString(), updated_by: user?.id })
      .not('id', 'is', null); // update all rows (there's only one)
    if (!error) {
      setIsRegistrationOpen(newValue);
    }
    setIsTogglingRegistration(false);
  };

  const toggleSubmission = async () => {
    setIsTogglingSubmission(true);
    const newValue = !isSubmissionOpen;
    const { error } = await supabase
      .from('submission_settings')
      .update({ is_submission_open: newValue, updated_at: new Date().toISOString(), updated_by: user?.id })
      .not('id', 'is', null);
    if (!error) {
      setIsSubmissionOpen(newValue);
    }
    setIsTogglingSubmission(false);
  };

  const saveDeadline = async () => {
    if (!submissionDeadline) return;
    setIsSavingDeadline(true);
    const { error } = await supabase
      .from('submission_settings')
      .update({ deadline: new Date(submissionDeadline).toISOString(), updated_at: new Date().toISOString(), updated_by: user?.id })
      .not('id', 'is', null);
    setIsSavingDeadline(false);
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
    competitionType: team.competition_type || 'ai_api',
    status: (team.payment_status || 'pending') as VerificationStatus,
    submittedAt: new Date(team.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  // Only show payment verified teams
  const verifiedTeams = teams.filter(team => team.payment_status === 'approved');
  
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
    pendingSubmissions: verifiedTeams.length - submissions.length,
    pendingVerifications: teams.filter(t => t.payment_status !== 'approved').length,
    totalVerified: verifiedTeams.length,
    totalRevenue: verifiedTeams.length * 300,
  };

  // Competition type breakdown ("both" adds +1 to each category)
  const competitionStats = (() => {
    let aiApi = 0;
    let devops = 0;
    let both = 0;
    verifiedTeams.forEach(team => {
      const ct = team.competition_type || 'ai_api';
      if (ct === 'both') {
        both++;
        aiApi++;
        devops++;
      } else if (ct === 'devops') {
        devops++;
      } else {
        aiApi++;
      }
    });
    return { aiApi, devops, both, total: verifiedTeams.length };
  })();

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
          payment_status: confirmDialog.action === 'approve' ? 'approved' : 'rejected',
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
            ? { ...team, payment_status: confirmDialog.action === 'approve' ? 'approved' : 'rejected' }
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
    
    ${item.submission.deployment_link ? `<p class="label">Deployment Link:</p>
    <p class="link"><a href="${item.submission.deployment_link}">${item.submission.deployment_link}</a></p>` : ''}
    
    ${item.submission.demonstration_video_link ? `<p class="label">Demonstration Video:</p>
    <p class="link"><a href="${item.submission.demonstration_video_link}">${item.submission.demonstration_video_link}</a></p>` : ''}
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
    
    const headers = ['Team Name', 'Requirement Analysis', 'Stack Report', 'Dependencies & Docs', 'GitHub Link', 'Deployment Link', 'Demonstration Video', 'Submitted At'];
    const rows = submittedTeams.map(item => [
      item.teamName,
      item.submission!.requirement_analysis_link,
      item.submission!.stack_report_link,
      item.submission!.dependencies_docs_link,
      item.submission!.github_link,
      item.submission!.deployment_link || '',
      item.submission!.demonstration_video_link || '',
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

  // Download all teams information as CSV
  const downloadAllTeams = () => {
    if (verifiedTeams.length === 0) {
      alert('No teams to download');
      return;
    }
    
    const headers = ['Team Name', 'Leader Name', 'Leader Email', 'Leader Phone', 'Leader Student ID', 'Department', 'Nationality', 'Competition Type', 'Transaction ID', 'Members Count', 'Member Names', 'Registered At'];
    const rows = verifiedTeams.map(team => [
      team.name,
      team.leader_name,
      team.leader_email,
      team.leader_phone,
      team.leader_student_id,
      team.department,
      team.nationality,
      team.competition_type === 'both' ? 'Both' : team.competition_type === 'devops' ? 'DevOps' : 'AI & API',
      team.transaction_id,
      (team.members?.length || 0) + 1,
      team.members?.map(m => m.name).join('; ') || '',
      new Date(team.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-teams-${new Date().toISOString().split('T')[0]}.csv`;
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
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full border border-accent/30">Admin</span>
            </div>
          </Link>
          
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
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Manage teams, submissions, and verify financial information</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Verified Teams Card */}
          <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-border/50 p-4 sm:p-6 shadow-xl relative overflow-hidden group hover:border-accent/50 hover:shadow-accent/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-12 -right-12 w-24 sm:w-32 h-24 sm:h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-accent/30 shadow-lg shadow-accent/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Users className="w-5 h-5 sm:w-7 sm:h-7 text-accent" />
                </div>
                <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-accent/10 rounded-full border border-accent/20">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-[8px] sm:text-[10px] text-accent font-medium">LIVE</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">Verified Teams</p>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.totalVerified}</p>
                <p className="text-[10px] sm:text-xs text-accent/80 mt-1 sm:mt-2 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Payment confirmed</span>
                  <span className="sm:hidden">Confirmed</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Pending Submissions Card */}
          <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-border/50 p-4 sm:p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/50 hover:shadow-amber-500/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-12 -right-12 w-24 sm:w-32 h-24 sm:h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500" />
                </div>
                {stats.pendingSubmissions > 0 && (
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] sm:text-[10px] text-amber-400 font-medium">PENDING</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">Pending Submissions</p>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.pendingSubmissions}</p>
                <p className="text-[10px] sm:text-xs text-amber-400/80 mt-1 sm:mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Awaiting from teams</span>
                  <span className="sm:hidden">Awaiting</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Pending Verification Card */}
          <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-border/50 p-4 sm:p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-12 -right-12 w-24 sm:w-32 h-24 sm:h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />
                </div>
                {stats.pendingVerifications > 0 && (
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] sm:text-[10px] text-blue-400 font-medium">ACTION</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">Pending Verification</p>
                
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.pendingVerifications}</p>
                <p className="text-[10px] sm:text-xs text-blue-400/80 mt-1 sm:mt-2 flex items-center gap-1">
              
                  <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Needs review
                </p>
              </div>
            </div>
          </Card>

          {/* Total Revenue Card */}
          <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-border/50 p-4 sm:p-6 shadow-xl relative overflow-hidden group hover:border-green-500/50 hover:shadow-green-500/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-12 -right-12 w-24 sm:w-32 h-24 sm:h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors duration-300"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-xl sm:text-2xl font-bold text-green-500">৳</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/10 rounded-full border border-green-500/20">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] sm:text-[10px] text-green-400 font-medium">EARNED</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="text-xl sm:text-3xl font-bold text-white tracking-tight">৳{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-green-400/80 mt-1 sm:mt-2">
                  {stats.totalVerified} × ৳300
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Competition Breakdown */}
        <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border border-border/50 p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Pie Chart */}
            <div className="relative flex-shrink-0">
              <svg width="180" height="180" viewBox="0 0 180 180" className="sm:w-[220px] sm:h-[220px]">
                {(() => {
                  const total = competitionStats.aiApi + competitionStats.devops;
                  if (total === 0) {
                    return <circle cx="90" cy="90" r="70" fill="none" stroke="currentColor" strokeWidth="28" className="text-border/30" />;
                  }
                  const aiPct = competitionStats.aiApi / total;
                  const devopsPct = competitionStats.devops / total;
                  const r = 70;
                  const c = 2 * Math.PI * r;
                  const aiLen = aiPct * c;
                  const devopsLen = devopsPct * c;
                  return (
                    <>
                      {/* DevOps segment */}
                      <circle cx="90" cy="90" r={r} fill="none" stroke="#06b6d4" strokeWidth="28" strokeDasharray={`${devopsLen} ${c - devopsLen}`} strokeDashoffset={c * 0.25} className="transition-all duration-700" style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.3))' }} />
                      {/* AI & API segment */}
                      <circle cx="90" cy="90" r={r} fill="none" stroke="#3b82f6" strokeWidth="28" strokeDasharray={`${aiLen} ${c - aiLen}`} strokeDashoffset={c * 0.25 - devopsLen} className="transition-all duration-700" style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.3))' }} />
                      {/* Center text */}
                      <text x="90" y="82" textAnchor="middle" className="fill-white text-2xl sm:text-3xl font-bold" style={{ fontSize: '28px', fontWeight: 700 }}>{competitionStats.total}</text>
                      <text x="90" y="104" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: '11px' }}>Total Teams</text>
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Legend + Stats */}
            <div className="flex-1 w-full space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                Competition Breakdown
              </h3>
              
              {/* AI & API */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div>
                    <span className="text-xs sm:text-sm text-muted-foreground">AI & API</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white">{competitionStats.aiApi}</span>
                </div>
                <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700" style={{ width: `${competitionStats.total > 0 ? (competitionStats.aiApi / (competitionStats.aiApi + competitionStats.devops)) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* DevOps */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/30"></div>
                    <span className="text-xs sm:text-sm text-muted-foreground">DevOps</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white">{competitionStats.devops}</span>
                </div>
                <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${competitionStats.total > 0 ? (competitionStats.devops / (competitionStats.aiApi + competitionStats.devops)) * 100 : 0}%` }}></div>
                </div>
              </div>

              {/* Both */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/30"></div>
                    <span className="text-xs sm:text-sm text-muted-foreground">Both (counted in each)</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white">{competitionStats.both}</span>
                </div>
                <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-700" style={{ width: `${competitionStats.total > 0 ? (competitionStats.both / competitionStats.total) * 100 : 0}%` }}></div>
                </div>
              </div>

              <p className="text-[10px] sm:text-xs text-muted-foreground/60 pt-1 border-t border-border/30">
                Teams that selected &quot;Both&quot; are counted once in each category
              </p>
            </div>
          </div>
        </Card>

        {/* Download All Teams Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Button 
            onClick={downloadAllSubmissions}
            variant="outline"
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 bg-transparent gap-2 text-xs sm:text-sm"
            disabled={submissions.length === 0}
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Download All Submissions (CSV)</span>
            <span className="sm:hidden">Submissions CSV</span>
          </Button>
          <Button 
            onClick={downloadAllTeams}
            variant="outline"
            className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 bg-transparent gap-2 text-xs sm:text-sm"
            disabled={verifiedTeams.length === 0}
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Download All Teams (CSV)</span>
            <span className="sm:hidden">Teams CSV</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/50 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {(['teams', 'submissions', 'verification', 'settings'] as const).map(tab => (
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
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-start sm:items-center gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-xs sm:text-sm text-accent">
                  Only payment verified teams are shown here. Teams pending verification can be found in the Verification tab.
                </p>
              </div>
              
              <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-background/50 border-b border-border/50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Team Name</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Leader</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Competition</th>
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
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
                            team.competition_type === 'both' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                            team.competition_type === 'devops' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' :
                            'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          }`}>
                            {team.competition_type === 'both' ? 'Both' : team.competition_type === 'devops' ? 'DevOps' : 'AI & API'}
                          </span>
                        </td>
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
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setSelectedTeam(null)}>
              <Card className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-xl z-10">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
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
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Team Name */}
                  <div className="text-center pb-3 sm:pb-4 border-b border-border/30">
                    <h3 className="text-xl sm:text-2xl font-bold text-white break-words">{selectedTeam.name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-green-500/10 text-green-300 border border-green-500/30 rounded-full text-xs font-semibold">
                        Payment Verified
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                        selectedTeam.competition_type === 'both' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                        selectedTeam.competition_type === 'devops' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' :
                        'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}>
                        {selectedTeam.competition_type === 'both' ? 'Both Competitions' : selectedTeam.competition_type === 'devops' ? 'DevOps' : 'AI & API'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Leader Info */}
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-xs sm:text-sm font-semibold text-accent uppercase tracking-wider">Team Leader</h4>
                    <div className="bg-background/50 rounded-lg p-3 sm:p-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground text-xs sm:text-sm">Name:</span>
                        <span className="text-white font-medium text-sm sm:text-base">{selectedTeam.leader_name}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground text-xs sm:text-sm">Email:</span>
                        <span className="text-white font-medium text-xs sm:text-sm break-all">{selectedTeam.leader_email}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground text-xs sm:text-sm">Phone:</span>
                        <span className="text-white font-medium text-sm">{selectedTeam.leader_phone}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground text-xs sm:text-sm">Student ID:</span>
                        <span className="text-white font-medium text-sm">{selectedTeam.leader_student_id}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground text-xs sm:text-sm">Department:</span>
                        <span className="text-white font-medium text-sm">{selectedTeam.department}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground text-xs sm:text-sm">Nationality:</span>
                        <span className="text-white font-medium text-sm">{selectedTeam.nationality}</span>
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
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead className="bg-background/50 border-b border-border/50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Team Name</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Submitted</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Status</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredSubmissions.map(item => (
                        <tr key={item.teamId} className="hover:bg-accent/5 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-white font-medium text-sm">{item.teamName}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground text-xs sm:text-sm">
                            {item.submittedAt || '-'}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
                              item.hasSubmission 
                                ? 'bg-green-500/10 text-green-300 border-green-500/30' 
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}>
                              {item.hasSubmission ? 'Submitted' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                            {item.hasSubmission && item.submission ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 bg-transparent transition-all gap-1 text-xs sm:text-sm"
                                onClick={() => setSelectedSubmission(item)}
                              >
                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs sm:text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredSubmissions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-muted-foreground text-sm">
                            No submissions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
          )}

          {/* Submission Details Modal */}
          {selectedSubmission && selectedSubmission.submission && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={() => setSelectedSubmission(null)}>
              <Card className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-xl z-10">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    Submission Details
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedSubmission(null)}
                    className="text-muted-foreground hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Team Name */}
                  <div className="text-center pb-3 sm:pb-4 border-b border-border/30">
                    <h3 className="text-xl sm:text-2xl font-bold text-white break-words">{selectedSubmission.teamName}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">Submitted on {selectedSubmission.submittedAt}</p>
                  </div>
                  
                  {/* Submission Links */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-xs sm:text-sm font-semibold text-accent uppercase tracking-wider">Submission Files</h4>
                    
                    {/* Requirement Analysis */}
                    <div className="bg-background/50 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm">Requirement Analysis</p>
                          <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 truncate">{selectedSubmission.submission.requirement_analysis_link}</p>
                        </div>
                        <a 
                          href={selectedSubmission.submission.requirement_analysis_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <Button size="sm" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 gap-2 text-xs sm:text-sm w-full sm:w-auto">
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Open
                          </Button>
                        </a>
                      </div>
                    </div>
                    
                    {/* Stack Report */}
                    <div className="bg-background/50 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm">Stack Report</p>
                          <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 truncate">{selectedSubmission.submission.stack_report_link}</p>
                        </div>
                        <a 
                          href={selectedSubmission.submission.stack_report_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-2 text-xs sm:text-sm w-full sm:w-auto">
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Open
                          </Button>
                        </a>
                      </div>
                    </div>
                    
                    {/* Dependencies & Docs */}
                    <div className="bg-background/50 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm">Dependencies & Documentation</p>
                          <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 truncate">{selectedSubmission.submission.dependencies_docs_link}</p>
                        </div>
                        <a 
                          href={selectedSubmission.submission.dependencies_docs_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 gap-2 text-xs sm:text-sm w-full sm:w-auto">
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Open
                          </Button>
                        </a>
                      </div>
                    </div>
                    
                    {/* GitHub Repository */}
                    <div className="bg-background/50 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm">GitHub Repository</p>
                          <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 truncate">{selectedSubmission.submission.github_link}</p>
                        </div>
                        <a 
                          href={selectedSubmission.submission.github_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 gap-2 text-xs sm:text-sm w-full sm:w-auto">
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Open
                          </Button>
                        </a>
                      </div>
                    </div>
                    
                    {/* Deployment Link (Optional) */}
                    {selectedSubmission.submission.deployment_link && (
                      <div className="bg-background/50 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm">Deployment Link</p>
                            <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 truncate">{selectedSubmission.submission.deployment_link}</p>
                          </div>
                          <a 
                            href={selectedSubmission.submission.deployment_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 gap-2 text-xs sm:text-sm w-full sm:w-auto">
                              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              Open
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Demonstration Video (Optional) */}
                    {selectedSubmission.submission.demonstration_video_link && (
                      <div className="bg-background/50 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm">Demonstration Video</p>
                            <p className="text-muted-foreground text-[10px] sm:text-xs mt-1 truncate">{selectedSubmission.submission.demonstration_video_link}</p>
                          </div>
                          <a 
                            href={selectedSubmission.submission.demonstration_video_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                          >
                            <Button size="sm" variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 gap-2 text-xs sm:text-sm w-full sm:w-auto">
                              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              Open
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead className="bg-background/50 border-b border-border/50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Team Name</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Transaction ID</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Competition</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Registered</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white">Status</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredVerification.map(item => (
                      <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white font-medium text-sm">{item.teamName}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-muted-foreground text-xs sm:text-sm font-mono">{item.transactionId}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border ${
                            item.competitionType === 'both' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                            item.competitionType === 'devops' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' :
                            'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          }`}>
                            {item.competitionType === 'both' ? 'Both' : item.competitionType === 'devops' ? 'DevOps' : 'AI & API'}
                          </span>
                        </td>
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
                          {item.status !== 'approved' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 bg-transparent transition-all p-1.5 sm:p-2"
                              onClick={() => openConfirmDialog('approve', item.teamId, item.teamName)}
                            >
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                          {item.status !== 'rejected' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent transition-all p-1.5 sm:p-2"
                              onClick={() => openConfirmDialog('reject', item.teamId, item.teamName)}
                            >
                              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-5 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <Settings className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Registration Control</h2>
                    <p className="text-xs text-muted-foreground">Manage team registration access</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/30">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">Registration Status</p>
                    <p className="text-xs text-muted-foreground">
                      {isRegistrationOpen
                        ? 'New teams can register. Toggle off to close registration.'
                        : 'Registration is closed. Already registered teams can still access their dashboard.'}
                    </p>
                  </div>
                  <button
                    onClick={toggleRegistration}
                    disabled={isTogglingRegistration}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 ${
                      isRegistrationOpen ? 'bg-green-500' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                        isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isRegistrationOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${isRegistrationOpen ? 'text-green-400' : 'text-red-400'}`}>
                    {isRegistrationOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </Card>

              <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-5 sm:p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
                    <FileText className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Submission Control</h2>
                    <p className="text-xs text-muted-foreground">Manage project submissions</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/30">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">Submission Status</p>
                      <p className="text-xs text-muted-foreground">
                        {isSubmissionOpen
                          ? 'Teams can submit projects. Toggle off to close submissions.'
                          : 'Submissions are closed. Teams cannot submit new projects.'}
                      </p>
                    </div>
                    <button
                      onClick={toggleSubmission}
                      disabled={isTogglingSubmission}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 ${
                        isSubmissionOpen ? 'bg-green-500' : 'bg-muted-foreground/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                          isSubmissionOpen ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 bg-background/50 rounded-xl border border-border/30 space-y-3">
                    <p className="text-sm font-medium text-white">Submission Deadline</p>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        value={submissionDeadline}
                        onChange={(e) => setSubmissionDeadline(e.target.value)}
                        className="flex-1 h-10 rounded-lg bg-background/60 border border-border/60 text-white text-sm px-3 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                      />
                      <Button
                        onClick={saveDeadline}
                        disabled={isSavingDeadline || !submissionDeadline}
                        className="bg-amber-500 hover:bg-amber-500/90 text-white h-10 px-4 text-sm disabled:opacity-50"
                      >
                        {isSavingDeadline ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isSubmissionOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${isSubmissionOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {isSubmissionOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeConfirmDialog}
          />
          
          {/* Dialog */}
          <Card className="relative bg-card border border-border/50 p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-4 shadow-2xl">
            <div className="space-y-4 sm:space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                  confirmDialog.action === 'approve' 
                    ? 'bg-green-500/10 border-2 border-green-500/30' 
                    : 'bg-red-500/10 border-2 border-red-500/30'
                }`}>
                  {confirmDialog.action === 'approve' ? (
                    <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                  )}
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  {confirmDialog.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  Are you sure you want to {confirmDialog.action === 'approve' ? 'approve' : 'reject'} the payment for team <span className="text-white font-medium break-words">"{confirmDialog.teamName}"</span>?
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
