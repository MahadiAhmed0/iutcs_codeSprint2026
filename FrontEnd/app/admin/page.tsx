'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LogOut, Search, Eye, Check, X, Filter, ChevronDown, Users, FileText, CheckCircle, Shield, Sparkles } from 'lucide-react';

type Tab = 'teams' | 'submissions' | 'verification';
type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface Team {
  id: string;
  name: string;
  leader: string;
  members: number;
  status: 'registered' | 'submitted' | 'approved';
  email: string;
  phone: string;
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
  const [activeTab, setActiveTab] = useState<Tab>('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');

  // Mock Data
  const teams: Team[] = [
    { id: '1', name: 'Code Warriors', leader: 'John Doe', members: 3, status: 'submitted', email: 'john@gmail.com', phone: '+1234567890' },
    { id: '2', name: 'Tech Titans', leader: 'Sarah Smith', members: 4, status: 'registered', email: 'sarah@gmail.com', phone: '+1234567891' },
    { id: '3', name: 'Innovation Hub', leader: 'Mike Johnson', members: 3, status: 'approved', email: 'mike@gmail.com', phone: '+1234567892' },
    { id: '4', name: 'Debug Legends', leader: 'Emily Davis', members: 3, status: 'submitted', email: 'emily@gmail.com', phone: '+1234567893' },
    { id: '5', name: 'Pixel Masters', leader: 'Alex Chen', members: 2, status: 'registered', email: 'alex@gmail.com', phone: '+1234567894' },
  ];

  const submissions: Submission[] = [
    { id: '1', teamId: 'TEAM-ABC', teamName: 'Code Warriors', gitHubLink: 'github.com/code-warriors/project', submittedAt: 'Feb 15, 2026', status: 'pending' },
    { id: '2', teamId: 'TEAM-DEF', teamName: 'Tech Titans', gitHubLink: 'github.com/tech-titans/solution', submittedAt: 'Feb 10, 2026', status: 'pending' },
    { id: '3', teamId: 'TEAM-GHI', teamName: 'Innovation Hub', gitHubLink: 'github.com/innovation/app', submittedAt: 'Feb 20, 2026', status: 'approved' },
    { id: '4', teamId: 'TEAM-JKL', teamName: 'Debug Legends', gitHubLink: 'github.com/debug/tool', submittedAt: 'Feb 18, 2026', status: 'pending' },
  ];

  const verification: VerificationData[] = [
    { id: '1', teamId: 'TEAM-ABC', teamName: 'Code Warriors', status: 'pending', submittedAt: 'Feb 15, 2026' },
    { id: '2', teamId: 'TEAM-GHI', teamName: 'Innovation Hub', status: 'approved', submittedAt: 'Feb 20, 2026' },
    { id: '3', teamId: 'TEAM-JKL', teamName: 'Debug Legends', status: 'pending', submittedAt: 'Feb 18, 2026' },
    { id: '4', teamId: 'TEAM-MNO', teamName: 'Pixel Masters', status: 'rejected', submittedAt: 'Feb 22, 2026' },
  ];

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.leader.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || team.status === filterStatus;
    return matchesSearch && matchesStatus;
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
              <span className="font-bold text-white">IUTCS</span>
              <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full border border-accent/30">Admin</span>
            </div>
          </div>
          
          <Link href="/">
            <Button variant="outline" size="sm" className="border-border/50 text-white hover:bg-accent/10 hover:border-accent/30 gap-2 bg-transparent transition-all">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </Link>
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
                <p className="text-muted-foreground text-sm">Pending Verification</p>
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
                        <td className="px-6 py-4 text-muted-foreground">{team.leader}</td>
                        <td className="px-6 py-4 text-white">{team.members}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            team.status === 'registered' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                            team.status === 'submitted' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                            'bg-green-500/10 text-green-300 border-green-500/30'
                          }`}>
                            {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 gap-1 bg-transparent transition-all">
                            <Eye className="w-4 h-4" />
                            View
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
                <table className="w-full">
                  <thead className="bg-background/50 border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Team Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">GitHub Link</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Submitted</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredSubmissions.map(submission => (
                      <tr key={submission.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{submission.teamName}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm truncate max-w-[200px]">{submission.gitHubLink}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">{submission.submittedAt}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            submission.status === 'pending' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                            submission.status === 'approved' ? 'bg-green-500/10 text-green-300 border-green-500/30' :
                            'bg-red-500/10 text-red-300 border-red-500/30'
                          }`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 gap-1 bg-transparent transition-all">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 gap-1 bg-transparent transition-all">
                            <X className="w-4 h-4" />
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
                <table className="w-full">
                  <thead className="bg-background/50 border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Team Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Submitted</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredVerification.map(item => (
                      <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{item.teamName}</td>
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
                          <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 bg-transparent transition-all">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent transition-all">
                            <X className="w-4 h-4" />
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
    </div>
  );
}
