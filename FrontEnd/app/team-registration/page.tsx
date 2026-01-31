'use client';

import React from "react"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, CheckCircle, Users, User, Sparkles, Rocket, Wallet, AlertCircle, LogOut, Globe } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

// OIC Countries List
const OIC_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Azerbaijan", "Bahrain", "Bangladesh",
  "Benin", "Brunei", "Burkina Faso", "Cameroon", "Chad", "Comoros",
  "Djibouti", "Egypt", "Gabon", "Gambia", "Guinea", "Guinea-Bissau",
  "Guyana", "Indonesia", "Iran", "Iraq", "Ivory Coast", "Jordan",
  "Kazakhstan", "Kuwait", "Kyrgyzstan", "Lebanon", "Libya", "Malaysia",
  "Maldives", "Mali", "Mauritania", "Morocco", "Mozambique", "Niger",
  "Nigeria", "Oman", "Pakistan", "Palestine", "Qatar", "Saudi Arabia",
  "Senegal", "Sierra Leone", "Somalia", "Sudan", "Suriname", "Syria",
  "Tajikistan", "Togo", "Tunisia", "Turkey", "Turkmenistan", "Uganda",
  "United Arab Emirates", "Uzbekistan", "Yemen"
];

// Department mapping based on student ID digit
const DEPARTMENT_MAP: { [key: string]: string } = {
  '1': 'MPE',
  '2': 'BTM',
  '3': 'EEE',
  '4': 'CSE',
  '5': 'TVE',
};

interface TeamMember {
  id: string;
  name: string;
  studentId: string;
}

// Validation functions
const validateStudentId = (studentId: string): { valid: boolean; error?: string; department?: string } => {
  // Format: YYXXDP### where YY=22/23/24, XX=00, D=1-5 (dept), P=program, ###=001-999
  // Total: 9 digits like 240042101
  
  if (!studentId) return { valid: false, error: 'Student ID is required' };
  
  // Remove any spaces or dashes
  const cleanId = studentId.replace(/[\s-]/g, '');
  
  if (!/^\d{9}$/.test(cleanId)) {
    return { valid: false, error: 'Student ID must be exactly 9 digits' };
  }
  
  const year = cleanId.substring(0, 2);
  const fixed = cleanId.substring(2, 4);
  const dept = cleanId.substring(4, 5);
  const program = cleanId.substring(5, 6);
  const rollNum = cleanId.substring(6, 9);
  
  // Validate year (22, 23, 24)
  if (!['22', '23', '24'].includes(year)) {
    return { valid: false, error: 'First 2 digits must be 22, 23, or 24' };
  }
  
  // Validate fixed digits (00)
  if (fixed !== '00') {
    return { valid: false, error: 'Digits 3-4 must be 00' };
  }
  
  // Validate department digit (1-5)
  if (!['1', '2', '3', '4', '5'].includes(dept)) {
    return { valid: false, error: 'Digit 5 must be 1-5 (1:MPE, 2:BTM, 3:EEE, 4:CSE, 5:TVE)' };
  }
  
  // Validate program digit based on department
  // EEE (3): 1-3, CSE (4): 1-2, MPE (1): 1-2, BTM (2): 1, TVE (5): 1
  const programInt = parseInt(program, 10);
  if (dept === '3') { // EEE
    if (programInt < 1 || programInt > 3) {
      return { valid: false, error: 'Digit 6 must be 1-3 for EEE department' };
    }
  } else if (dept === '4' || dept === '1') { // CSE or MPE
    if (programInt < 1 || programInt > 2) {
      return { valid: false, error: `Digit 6 must be 1-2 for ${dept === '4' ? 'CSE' : 'MPE'} department` };
    }
  } else { // BTM (2) or TVE (5)
    if (programInt !== 1) {
      return { valid: false, error: `Digit 6 must be 1 for ${dept === '2' ? 'BTM' : 'TVE'} department` };
    }
  }
  
  // Validate roll number (001-999)
  const rollNumInt = parseInt(rollNum, 10);
  if (rollNumInt < 1 || rollNumInt > 999) {
    return { valid: false, error: 'Last 3 digits must be 001-999' };
  }
  
  return { valid: true, department: DEPARTMENT_MAP[dept] };
};

const validateBangladeshiPhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Check for +880 format (14 digits total: +880 followed by 10 digits starting with 1)
  if (cleanPhone.startsWith('+880')) {
    const number = cleanPhone.substring(4);
    if (!/^1[3-9]\d{8}$/.test(number)) {
      return { valid: false, error: 'Invalid format. Use +880 1XXXXXXXXX' };
    }
    return { valid: true };
  }
  
  // Check for 880 format (13 digits: 880 followed by 10 digits starting with 1)
  if (cleanPhone.startsWith('880')) {
    const number = cleanPhone.substring(3);
    if (!/^1[3-9]\d{8}$/.test(number)) {
      return { valid: false, error: 'Invalid format. Use 880 1XXXXXXXXX' };
    }
    return { valid: true };
  }
  
  // Check for 01X format (11 digits starting with 01)
  if (cleanPhone.startsWith('01')) {
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return { valid: false, error: 'Invalid format. Use 01XXXXXXXXX (11 digits)' };
    }
    return { valid: true };
  }
  
  return { valid: false, error: 'Must be a valid Bangladeshi number (01XXXXXXXXX or +8801XXXXXXXXX)' };
};

export default function TeamRegistrationPage() {
  const { user, profile, isLoading: authLoading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderEmail: '',
    phone: '',
    studentId: '',
    department: '',
    nationality: 'Bangladesh',
    transactionId: '',
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Debug logging
  useEffect(() => {
    console.log('Auth state:', { authLoading, user: user?.email, profile, isRegistered: profile?.is_registered });
  }, [authLoading, user, profile]);

  // Redirect if already registered or not logged in
  useEffect(() => {
    if (!authLoading) {
      console.log('Auth loaded, checking redirect...', { user: !!user, isRegistered: profile?.is_registered });
      if (!user) {
        console.log('No user, redirecting to login...');
        router.push('/login');
      } else if (profile?.is_registered) {
        console.log('Already registered, redirecting to dashboard...');
        router.push('/team-dashboard');
      } else if (user.email) {
        console.log('User logged in, filling form...');
        setFormData(prev => ({
          ...prev,
          leaderEmail: user.email || '',
          leaderName: user.user_metadata?.full_name || '',
        }));
      }
    }
  }, [user, profile, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Auto-select department based on student ID (always update on change)
    if (name === 'studentId' && value.length >= 5) {
      const cleanId = value.replace(/[\s-]/g, '');
      const deptDigit = cleanId.charAt(4);
      if (DEPARTMENT_MAP[deptDigit]) {
        setFormData(prev => ({ ...prev, [name]: value, department: DEPARTMENT_MAP[deptDigit] }));
      }
    }
  };

  // Validate student ID on blur
  const handleStudentIdBlur = () => {
    if (formData.studentId) {
      const result = validateStudentId(formData.studentId);
      if (!result.valid) {
        setFieldErrors(prev => ({ ...prev, studentId: result.error || '' }));
      } else if (result.department && !formData.department) {
        setFormData(prev => ({ ...prev, department: result.department || '' }));
      }
    }
  };

  // Validate phone on blur
  const handlePhoneBlur = () => {
    if (formData.phone) {
      const result = validateBangladeshiPhone(formData.phone);
      if (!result.valid) {
        setFieldErrors(prev => ({ ...prev, phone: result.error || '' }));
      }
    }
  };

  const handleMemberChange = (id: string, field: 'name' | 'studentId', value: string) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
    
    // Clear member error
    setFieldErrors(prev => ({ ...prev, [`member_${id}_${field}`]: '' }));
  };

  // Validate member student ID on blur
  const handleMemberStudentIdBlur = (id: string, studentId: string) => {
    if (studentId) {
      const result = validateStudentId(studentId);
      if (!result.valid) {
        setFieldErrors(prev => ({ ...prev, [`member_${id}_studentId`]: result.error || '' }));
      }
    }
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    console.log('Starting registration...', { user, formData });

    if (!user) {
      setError('You must be logged in to register a team.');
      setIsLoading(false);
      return;
    }

    // Validate all fields before submission
    const errors: { [key: string]: string } = {};
    
    // Validate leader student ID
    const studentIdResult = validateStudentId(formData.studentId);
    if (!studentIdResult.valid) {
      errors.studentId = studentIdResult.error || 'Invalid student ID';
    }
    
    // Validate phone
    const phoneResult = validateBangladeshiPhone(formData.phone);
    if (!phoneResult.valid) {
      errors.phone = phoneResult.error || 'Invalid phone number';
    }
    
    // Validate member student IDs
    for (const member of teamMembers) {
      if (member.name.trim() && member.studentId) {
        const memberResult = validateStudentId(member.studentId);
        if (!memberResult.valid) {
          errors[`member_${member.id}_studentId`] = memberResult.error || 'Invalid student ID';
        }
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the validation errors before submitting.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Creating team...');
      // Create team in database
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: formData.teamName,
          leader_id: user.id,
          leader_name: formData.leaderName,
          leader_email: formData.leaderEmail,
          leader_phone: formData.phone,
          leader_student_id: formData.studentId,
          department: formData.department,
          nationality: formData.nationality,
          transaction_id: formData.transactionId,
          payment_verified: false,
          members: teamMembers.filter(m => m.name.trim() !== ''),
        })
        .select()
        .single();

      console.log('Team creation result:', { team, teamError });

      if (teamError) {
        throw teamError;
      }

      console.log('Updating profile...');
      // Update user profile to mark as registered
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_registered: true,
          team_id: team.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      console.log('Profile update result:', { profileError });

      if (profileError) {
        throw profileError;
      }

      // Refresh profile data
      await refreshProfile();
      
      console.log('Registration complete!');
      setStep('success');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || err.code || 'Failed to register team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
              {/* Logged in as indicator */}
              <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Logged in as</p>
                    <p className="text-xs text-muted-foreground">{formData.leaderEmail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

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
                    <label className="block text-sm font-medium text-white mb-2">Student ID *</label>
                    <Input
                      type="text"
                      name="studentId"
                      placeholder="e.g., 240042101"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      onBlur={handleStudentIdBlur}
                      required
                      className={`bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors ${fieldErrors.studentId ? 'border-red-500/50' : ''}`}
                    />
                    {fieldErrors.studentId && (
                      <p className="text-xs text-red-400 mt-1">{fieldErrors.studentId}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Format: YY00DPS## (e.g., 240042101)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Department *</label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => {
                        // Check if student ID has a valid department digit
                        const cleanId = formData.studentId.replace(/[\s-]/g, '');
                        if (cleanId.length >= 5) {
                          const deptDigit = cleanId.charAt(4);
                          const expectedDept = DEPARTMENT_MAP[deptDigit];
                          if (expectedDept && value !== expectedDept) {
                            setFieldErrors(prev => ({ ...prev, department: `Department must match Student ID (${expectedDept})` }));
                            return;
                          }
                        }
                        setFieldErrors(prev => ({ ...prev, department: '' }));
                        setFormData(prev => ({ ...prev, department: value }));
                      }}
                      required
                      disabled={formData.studentId.length >= 5 && !!DEPARTMENT_MAP[formData.studentId.replace(/[\s-]/g, '').charAt(4)]}
                    >
                      <SelectTrigger className={`w-full bg-background/50 border-border/50 text-white focus:border-accent/50 ${formData.studentId.length >= 5 ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <SelectValue placeholder="Auto-detected from ID" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">CSE</SelectItem>
                        <SelectItem value="EEE">EEE</SelectItem>
                        <SelectItem value="MPE">MPE</SelectItem>
                        <SelectItem value="BTM">BTM</SelectItem>
                        <SelectItem value="TVE">TVE</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.department ? (
                      <p className="text-xs text-red-400 mt-1">{fieldErrors.department}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.studentId.length >= 5 ? 'Locked based on Student ID' : 'Auto-selected from Student ID'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Phone (Bangladesh) *</label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handlePhoneBlur}
                      required
                      className={`bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors ${fieldErrors.phone ? 'border-red-500/50' : ''}`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">11 digits or +880 format</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-accent" />
                      Nationality *
                    </label>
                    <Select
                      value={formData.nationality}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                      required
                    >
                      <SelectTrigger className="w-full bg-background/50 border-border/50 text-white focus:border-accent/50">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {OIC_COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">OIC member countries only</p>
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
                      <div key={member.id} className="p-4 bg-background/30 rounded-xl border border-border/30 space-y-3">
                        <div className="flex gap-3 items-end">
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
                              placeholder="e.g., 240042101"
                              value={member.studentId}
                              onChange={(e) => handleMemberChange(member.id, 'studentId', e.target.value)}
                              onBlur={() => handleMemberStudentIdBlur(member.id, member.studentId)}
                              className={`bg-background/50 border-border/50 text-white placeholder:text-muted-foreground focus:border-accent/50 transition-colors ${fieldErrors[`member_${member.id}_studentId`] ? 'border-red-500/50' : ''}`}
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
                        {fieldErrors[`member_${member.id}_studentId`] && (
                          <p className="text-xs text-red-400">{fieldErrors[`member_${member.id}_studentId`]}</p>
                        )}
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
                  disabled={isLoading || !formData.teamName || !formData.leaderName || !formData.studentId || !formData.phone || !formData.department || !formData.nationality || !formData.transactionId}
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
