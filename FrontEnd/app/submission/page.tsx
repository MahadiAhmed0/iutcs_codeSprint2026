'use client';

import React, { useEffect, useState } from "react"
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, Send, FileText, Github, FolderArchive, Sparkles, AlertCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';

interface SubmissionData {
  id?: string;
  requirement_analysis_link: string;
  stack_report_link: string;
  dependencies_docs_link: string;
  github_link: string;
  deployment_link?: string;
  demonstration_video_link?: string;
}

interface SubmissionSettings {
  is_submission_open: boolean;
  deadline: string | null;
}

export default function SubmissionPage() {
  const [step, setStep] = useState<'loading' | 'closed' | 'not_verified' | 'form' | 'success'>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [existingSubmission, setExistingSubmission] = useState<SubmissionData | null>(null);
  const [submissionSettings, setSubmissionSettings] = useState<SubmissionSettings | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [formData, setFormData] = useState<SubmissionData>({
    requirement_analysis_link: '',
    stack_report_link: '',
    dependencies_docs_link: '',
    github_link: '',
    deployment_link: '',
    demonstration_video_link: ''
  });

  // Validate Google Drive link
  const isValidGoogleDriveLink = (url: string) => {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  };

  // Validate GitHub link
  const isValidGitHubLink = (url: string) => {
    return url.includes('github.com');
  };

  // Fetch existing submission and settings
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setIsFetching(true);

        // Fetch submission settings
        const { data: settings, error: settingsError } = await supabase
          .from('submission_settings')
          .select('*')
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('Error fetching settings:', settingsError);
        }

        if (settings) {
          setSubmissionSettings(settings);
          if (!settings.is_submission_open) {
            setStep('closed');
            setIsFetching(false);
            return;
          }
        }

        // Fetch user's team
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('id, payment_status')
          .eq('leader_id', user.id)
          .single();

        if (teamError || !team) {
          setError('You must be a team leader to make submissions. Please register a team first.');
          setStep('form');
          setIsFetching(false);
          return;
        }

        // Check payment verification
        if (team.payment_status !== 'approved') {
          setStep('not_verified');
          setIsFetching(false);
          return;
        }

        setTeamId(team.id);

        // Fetch existing submission
        const { data: submission, error: submissionError } = await supabase
          .from('submissions')
          .select('*')
          .eq('team_id', team.id)
          .single();

        if (submission && !submissionError) {
          setExistingSubmission(submission);
          setFormData({
            requirement_analysis_link: submission.requirement_analysis_link || '',
            stack_report_link: submission.stack_report_link || '',
            dependencies_docs_link: submission.dependencies_docs_link || '',
            github_link: submission.github_link || '',
            deployment_link: submission.deployment_link || '',
            demonstration_video_link: submission.demonstration_video_link || ''
          });
        }

        setStep('form');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load submission data. Please try again.');
        setStep('form');
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [user, router, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate links
    if (!isValidGoogleDriveLink(formData.requirement_analysis_link)) {
      setError('Requirement Analysis link must be a valid Google Drive link');
      return;
    }
    if (!isValidGoogleDriveLink(formData.stack_report_link)) {
      setError('Stack Report link must be a valid Google Drive link');
      return;
    }
    if (!isValidGoogleDriveLink(formData.dependencies_docs_link)) {
      setError('Dependencies & Docs link must be a valid Google Drive link');
      return;
    }
    if (!isValidGitHubLink(formData.github_link)) {
      setError('GitHub link must be a valid GitHub repository URL');
      return;
    }

    if (!teamId) {
      setError('No team found. Please register a team first.');
      return;
    }

    setIsLoading(true);

    try {
      if (existingSubmission?.id) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from('submissions')
          .update({
            requirement_analysis_link: formData.requirement_analysis_link,
            stack_report_link: formData.stack_report_link,
            dependencies_docs_link: formData.dependencies_docs_link,
            github_link: formData.github_link,
            deployment_link: formData.deployment_link || null,
            demonstration_video_link: formData.demonstration_video_link || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubmission.id);

        if (updateError) throw updateError;
      } else {
        // Create new submission
        const { error: insertError } = await supabase
          .from('submissions')
          .insert({
            team_id: teamId,
            requirement_analysis_link: formData.requirement_analysis_link,
            stack_report_link: formData.stack_report_link,
            dependencies_docs_link: formData.dependencies_docs_link,
            github_link: formData.github_link,
            deployment_link: formData.deployment_link || null,
            demonstration_video_link: formData.demonstration_video_link || null
          });

        if (insertError) throw insertError;

        // Update team submission status
        await supabase
          .from('teams')
          .update({ 
            submission_status: 'submitted',
            submission_date: new Date().toISOString()
          })
          .eq('id', teamId);
      }

      setStep('success');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (step === 'loading' || isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading submission data...</p>
        </div>
      </div>
    );
  }

  // Submission closed state
  if (step === 'closed') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
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
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="relative w-full max-w-md">
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 text-center space-y-6 shadow-2xl shadow-red-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-accent/5 rounded-lg pointer-events-none"></div>
              
              <div className="relative flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-full flex items-center justify-center border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  </div>
                </div>
              </div>
              
              <div className="relative space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">Submissions Closed</h1>
                <p className="text-muted-foreground">The submission deadline has passed or submissions have been closed by the organizers.</p>
              </div>

              <div className="relative space-y-3 pt-4">
                <Link href="/team-dashboard" className="w-full block">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white h-12 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Payment not verified state
  if (step === 'not_verified') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
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
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="relative w-full max-w-md">
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 text-center space-y-6 shadow-2xl shadow-amber-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-accent/5 rounded-lg pointer-events-none"></div>
              
              <div className="relative flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-full flex items-center justify-center border-2 border-amber-500/50 shadow-lg shadow-amber-500/20">
                    <AlertCircle className="w-12 h-12 text-amber-500" />
                  </div>
                </div>
              </div>
              
              <div className="relative space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">Payment Not Verified</h1>
                <p className="text-muted-foreground">Your team&apos;s payment has not been verified yet. You can only submit after your payment is approved by the organizers.</p>
              </div>

              <div className="relative space-y-3 pt-4">
                <Link href="/team-dashboard" className="w-full block">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white h-12 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
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
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="relative w-full max-w-md">
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 text-center space-y-6 shadow-2xl shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-accent/5 rounded-lg pointer-events-none"></div>
              
              <div className="relative flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full flex items-center justify-center border-2 border-green-500/50 shadow-lg shadow-green-500/20">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div className="relative space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                  {existingSubmission ? 'Submission Updated!' : 'Submission Successful!'}
                </h1>
                <p className="text-muted-foreground">
                  {existingSubmission 
                    ? 'Your project submission has been updated successfully' 
                    : 'Your project has been submitted for review'}
                </p>
              </div>

              <div className="relative bg-accent/5 border border-accent/30 rounded-xl p-5 text-left space-y-3">
                <p className="text-sm text-white font-semibold flex items-center gap-2">
                  
                  What's Next?
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-3 items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Our team will review your submission
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    You can update your submission until the deadline
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Results will be announced on Mar 30, 2026
                  </li>
                </ul>
              </div>

              <div className="relative space-y-3 pt-4">
                <Button 
                  onClick={() => {
                    setExistingSubmission({ ...formData, id: existingSubmission?.id || 'new' });
                    setStep('form');
                  }}
                  variant="outline"
                  className="w-full border-accent/50 text-accent hover:bg-accent/10 hover:border-accent h-12 bg-transparent transition-all gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Update Submission
                </Button>
                <Link href="/team-dashboard" className="w-full block">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white h-12 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/" className="w-full block">
                  <Button variant="outline" className="w-full border-border/50 text-white hover:bg-accent/5 hover:border-accent/30 h-12 bg-transparent transition-all">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
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
          
          <Link href="/team-dashboard">
            <Button variant="outline" size="sm" className="border-border/50 text-white hover:bg-accent/10 hover:border-accent/30 gap-2 bg-transparent transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              <span className="text-accent font-medium text-sm sm:text-base">Submission</span>
              {existingSubmission && (
                <span className="ml-0 sm:ml-2 px-2 py-0.5 text-[10px] sm:text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                  Previously Submitted
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
                {existingSubmission ? 'Update Submission' : 'Project Submission'}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {existingSubmission 
                ? 'Update your submission links below. You can update until the deadline is reached.'
                : 'Only team leaders can submit projects. All links must be publicly accessible.'}
            </p>
          </div>

          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-5 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl shadow-accent/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>
            
            {error && (
              <div className="relative bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative space-y-8">
              {/* Requirement Analysis - Google Drive Link */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <label className="block text-sm font-semibold text-white">
                    Requirement Analysis *
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload your requirement analysis document to Google Drive and share the <span className="text-accent">public link</span>
                </p>
                <Input
                  type="url"
                  name="requirement_analysis_link"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.requirement_analysis_link}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Make sure the link is set to "Anyone with the link can view"
                </p>
              </div>

              {/* Stack Report - Google Drive Link */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <FolderArchive className="w-4 h-4 text-accent" />
                  </div>
                  <label className="block text-sm font-semibold text-white">
                    Stack Report & Justification *
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload your tech stack report to Google Drive and share the <span className="text-accent">public link</span>
                </p>
                <Input
                  type="url"
                  name="stack_report_link"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.stack_report_link}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Make sure the link is set to "Anyone with the link can view"
                </p>
              </div>

              {/* Dependencies & Documentation - Google Drive Link */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <label className="block text-sm font-semibold text-white">
                    Dependencies & Documentation *
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload your dependencies list and documentation to Google Drive and share the <span className="text-accent">public link</span>
                </p>
                <Input
                  type="url"
                  name="dependencies_docs_link"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.dependencies_docs_link}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Make sure the link is set to "Anyone with the link can view"
                </p>
              </div>

              {/* GitHub Link */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <Github className="w-4 h-4 text-accent" />
                  </div>
                  <label className="block text-sm font-semibold text-white">
                    GitHub Repository Link *
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Provide your <span className="text-accent">public GitHub repository</span> link
                </p>
                <Input
                  type="url"
                  name="github_link"
                  placeholder="https://github.com/yourname/project"
                  value={formData.github_link}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Repository must be set to public
                </p>
              </div>

              {/* Deployment Link (Optional) */}
                            {/* Demonstration Video Link (Optional) */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                                  <ExternalLink className="w-4 h-4 text-accent" />
                                </div>
                                <label className="block text-sm font-semibold text-white">
                                  Demonstration Video Link <span className="text-xs text-muted-foreground">(optional)</span>
                                </label>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                Upload your demo video to YouTube, Google Drive, or any online video platform and provide the public link.
                              </p>
                              <Input
                                type="url"
                                name="demonstration_video_link"
                                placeholder="https://youtu.be/your-demo-video"
                                value={formData.demonstration_video_link}
                                onChange={handleInputChange}
                                className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                              />
                            </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <ExternalLink className="w-4 h-4 text-accent" />
                  </div>
                  <label className="block text-sm font-semibold text-white">
                    Deployment Link <span className="text-xs text-muted-foreground">(optional)</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  If your project is deployed, provide the public deployment URL (e.g., Vercel, Netlify, etc.)
                </p>
                <Input
                  type="url"
                  name="deployment_link"
                  placeholder="https://your-app.vercel.app"
                  value={formData.deployment_link}
                  onChange={handleInputChange}
                  className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                />
              </div>

              {/* Info Box */}
              <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-5 space-y-3">
                <p className="text-sm text-white font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Important Notes
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
                  <li>All Google Drive links must be <span className="text-amber-400">publicly accessible</span></li>
                  <li>GitHub repository must be <span className="text-amber-400">public</span></li>
                  <li>You can <span className="text-green-400">update your submission</span> until the deadline</li>
                  <li>Deadline: <span className="text-amber-400 font-medium">Feb 28, 2026</span></li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Link href="/team-dashboard" className="flex-1 order-2 sm:order-1">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full border-border/50 text-white hover:bg-accent/5 hover:border-accent/30 h-11 sm:h-12 bg-transparent transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.requirement_analysis_link || !formData.stack_report_link || !formData.dependencies_docs_link || !formData.github_link}
                  className="flex-1 order-1 sm:order-2 bg-accent hover:bg-accent/90 text-white h-11 sm:h-12 font-semibold disabled:opacity-50 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {existingSubmission ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {existingSubmission ? 'Update Submission' : 'Submit Project'}
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="relative text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
              By submitting, you confirm that all links are publicly accessible and the work is your own
            </div>
          </Card>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
