'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, CheckCircle, Users, User, Sparkles, Rocket, Wallet } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';

interface TeamMember {
  id: string;
  name: string;
  studentId: string;
}

export default function TeamRegistrationPage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [teamId] = useState(`TEAM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderEmail: 'user@gmail.com', // Would be auto-filled from Google auth
    phone: '',
    universityId: '',
    department: '',
    transactionId: '',
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (id: string, field: 'name' | 'studentId', value: string) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const addMember = () => {
    setTeamMembers(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', studentId: '' }
    ]);
  };

  const removeMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock submission
    setTimeout(() => {
      setStep('success');
      setIsLoading(false);
    }, 1000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="relative w-full max-w-md mx-auto px-4">
          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 text-center space-y-6 shadow-2xl shadow-green-500/10">
            {/* Card glow effect */}
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">Registration Complete!</h1>
              <p className="text-muted-foreground">Your team has been successfully registered</p>
            </div>

            <div className="relative space-y-3 pt-4">
              <Link href="/team-dashboard" className="w-full block">
                <Button className="w-full bg-accent hover:bg-accent/90 text-white h-12 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Go to Dashboard
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
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>

          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 space-y-8 shadow-2xl shadow-accent/5 relative overflow-hidden">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>
            
            {/* Header */}
            <div className="relative text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 rounded-xl blur-lg animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center border border-accent/40 shadow-lg shadow-accent/20">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">Register Your Team</h1>
                <p className="text-muted-foreground mt-2">Only team leaders can register a team</p>
              </div>
              
              {/* Team type badges */}
              <div className="flex justify-center gap-3 pt-2">
                {['Solo', 'Duo', 'Trio'].map((type) => (
                  <span 
                    key={type}
                    className="px-3 py-1 bg-background/50 rounded-full border border-border/50 text-xs text-muted-foreground"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative space-y-8">
              {/* Team Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <Rocket className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Team Information</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Team Name *</label>
                  <Input
                    type="text"
                    name="teamName"
                    placeholder="Enter your team name"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    required
                    className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>

              {/* Team Leader Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Team Leader Information</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name *</label>
                  <Input
                    type="text"
                    name="leaderName"
                    placeholder="Enter your full name"
                    value={formData.leaderName}
                    onChange={handleInputChange}
                    required
                    className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email (Auto-filled)</label>
                  <Input
                    type="email"
                    name="leaderEmail"
                    value={formData.leaderEmail}
                    disabled
                    className="bg-background/30 border-border/30 text-white/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">From your Google account</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Phone *</label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+880 1XXX-XXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Department *</label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                      required
                    >
                      <SelectTrigger className="w-full bg-background/50 border-border/50 text-white focus:border-accent/50">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">CSE</SelectItem>
                        <SelectItem value="EEE">EEE</SelectItem>
                        <SelectItem value="MPE">MPE</SelectItem>
                        <SelectItem value="BTM">BTM</SelectItem>
                        <SelectItem value="TVE">TVE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Team Members (Optional) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Team Members (Optional)</h2>
                      <p className="text-sm text-muted-foreground">You can participate solo, duo, or trio</p>
                    </div>
                  </div>
                  {teamMembers.length < 2 && (
                    <Button
                      type="button"
                      onClick={addMember}
                      variant="outline"
                      className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 gap-1 bg-transparent transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Member
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-8 bg-background/30 rounded-xl border border-dashed border-border/50">
                      <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No team members added.</p>
                      <p className="text-xs text-muted-foreground">Click "Add Member" to add teammates.</p>
                    </div>
                  ) : (
                    teamMembers.map((member, idx) => (
                      <div key={member.id} className="flex gap-3 items-end p-4 bg-background/30 rounded-xl border border-border/30">
                        <div className="flex-1 space-y-2">
                          <label className="block text-sm font-medium text-white">
                            Member {idx + 1} Name
                          </label>
                          <Input
                            type="text"
                            placeholder="Full name"
                            value={member.name}
                            onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                            className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="block text-sm font-medium text-white">
                            Student ID
                          </label>
                          <Input
                            type="text"
                            placeholder="IUT-XXXX-XXX"
                            value={member.studentId}
                            onChange={(e) => handleMemberChange(member.id, 'studentId', e.target.value)}
                            className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMember(member.id)}
                          className="p-2.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/30">
                    <Wallet className="w-4 h-4 text-pink-400" />
                  </div>
                  <h3 className="font-semibold">Payment Information</h3>
                  <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full border border-accent/30">Required</span>
                </div>
                
                <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Registration Fee</span>
                    <span className="text-lg font-bold text-white">৳300</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Send <span className="text-pink-400 font-semibold">300 BDT</span> to the following bKash number:</p>
                    <p className="text-xl font-bold text-pink-400">01XXXXXXXXX</p>
                    <p className="text-xs">(Personal/Merchant)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    bKash Transaction ID <span className="text-accent">*</span>
                  </label>
                  <Input
                    type="text"
                    name="transactionId"
                    placeholder="e.g., TRX1234567890"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    required
                    className="bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-pink-500/50 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the transaction ID you received after sending the payment via bKash
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.teamName || !formData.leaderName || !formData.phone || !formData.department || !formData.transactionId}
                  className="w-full bg-accent hover:bg-accent/90 text-white h-14 text-base font-semibold disabled:opacity-50 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Registering Team...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Register Team
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Terms */}
            <p className="relative text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
              By registering, you agree to our terms and acknowledge that only team leaders can submit projects
            </p>
          </Card>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
