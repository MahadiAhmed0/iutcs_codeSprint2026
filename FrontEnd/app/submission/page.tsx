'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, Upload, Send, FileCode, Github, FolderArchive, Sparkles, AlertCircle } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';

export default function SubmissionPage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    requirements: '',
    stackReport: '',
    gitHubLink: '',
    dependencies: '',
    googleDriveLink: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock submission
    setTimeout(() => {
      setStep('success');
      setIsLoading(false);
    }, 1500);
  };

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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">Submission Successful!</h1>
                <p className="text-muted-foreground">Your project has been submitted for review</p>
              </div>

              <div className="relative bg-background/50 border border-green-500/30 rounded-xl p-4 space-y-2 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground">Submission ID:</p>
                <p className="text-lg font-bold text-green-400 font-mono tracking-wider">SUB-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>

              <div className="relative bg-accent/5 border border-accent/30 rounded-xl p-5 text-left space-y-3">
                <p className="text-sm text-white font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  What's Next?
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-3 items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Our team will review your submission
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    You'll receive updates via email
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Results will be announced on Mar 30, 2026
                  </li>
                </ul>
              </div>

              <div className="relative space-y-3 pt-4">
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
      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-accent" />
              <span className="text-accent font-medium">Submission</span>
            </div>
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">
                Project Submission
              </span>
            </h1>
            <p className="text-muted-foreground">Only team leaders can submit projects. All fields are required.</p>
          </div>

          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 space-y-8 shadow-2xl shadow-accent/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>
            
            <form onSubmit={handleSubmit} className="relative space-y-8">
              {/* Requirement Analysis */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <FileCode className="w-4 h-4 text-accent" />
                  </div>
                  <label className="block text-sm font-semibold text-white">
                    Requirement Analysis *
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Describe the problem you're solving and your approach</p>
                <textarea
                  name="requirements"
                  placeholder="Explain your project requirements and analysis..."
                  value={formData.requirements}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl text-white placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Stack Report */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <FileCode className="w-4 h-4 text-accent" />
                  </div>
                  <label className="block text-sm font-semibold text-white">
                    Stack Report & Justification *
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Explain your technology choices and why they were selected</p>
                <textarea
                  name="stackReport"
                  placeholder="Describe your tech stack and justify your choices..."
                  value={formData.stackReport}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl text-white placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none transition-colors resize-none"
                />
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
                <Input
                  type="url"
                  name="gitHubLink"
                  placeholder="https://github.com/yourname/project"
                  value={formData.gitHubLink}
                  onChange={handleInputChange}
                  required
                  className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                />
              </div>

              {/* Dependencies */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <FileCode className="w-4 h-4 text-accent" />
                  </div>
                  <label className="block text-sm font-semibold text-white">
                    Dependency List & Documentation *
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">List all dependencies and provide setup instructions</p>
                <textarea
                  name="dependencies"
                  placeholder="- Node.js v18+
- React 18
- Express.js
- MongoDB

Installation Instructions:
1. Clone the repository
2. Run npm install
3. Configure .env file
4. Run npm start"
                  value={formData.dependencies}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-xl text-white placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none transition-colors resize-none font-mono text-sm"
                />
              </div>

              {/* Google Drive Link */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <FolderArchive className="w-4 h-4 text-accent" />
                  </div>
                  <label className="block text-sm font-semibold text-white">
                    Google Drive ZIP Link *
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Upload a ZIP file of your project to Google Drive and share the link</p>
                <Input
                  type="url"
                  name="googleDriveLink"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.googleDriveLink}
                  onChange={handleInputChange}
                  required
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
                  <li>Ensure all links are working and publicly accessible</li>
                  <li>Your project should be well-documented</li>
                  <li>Submissions cannot be edited after submission</li>
                  <li>Check the deadline: <span className="text-amber-400 font-medium">Feb 28, 2026</span></li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Link href="/team-dashboard" className="flex-1">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full border-border/50 text-white hover:bg-accent/5 hover:border-accent/30 h-12 bg-transparent transition-all"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.requirements || !formData.stackReport || !formData.gitHubLink || !formData.dependencies || !formData.googleDriveLink}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white h-12 font-semibold disabled:opacity-50 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Project
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="relative text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
              By submitting, you confirm that all information is accurate and your project is your own work
            </div>
          </Card>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
