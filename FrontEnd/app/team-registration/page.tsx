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
import { ArrowLeft, Plus, Trash2, CheckCircle, Users, User, Sparkles, Rocket, Wallet, AlertCircle, LogOut, Globe, Code2, Server, Info } from 'lucide-react';
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
  phone: string;
  nationality: string;
}

// Validation functions
const validateStudentId = (studentId: string): { valid: boolean; error?: string; department?: string } => {
  // Format: YYXXDPS## where YY=22/23/24, XX=00, D=1-5 (dept), P=program, S=section, ##=01-99
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
  const section = cleanId.substring(6, 7);
  const rollNum = cleanId.substring(7, 9);
  
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
  const sectionInt = parseInt(section, 10);
  
  if (dept === '3') { // EEE
    if (programInt < 1 || programInt > 3) {
      return { valid: false, error: 'Digit 6 (program) must be 1-3 for EEE department' };
    }
  } else if (dept === '4' || dept === '1') { // CSE or MPE
    if (programInt < 1 || programInt > 2) {
      return { valid: false, error: `Digit 6 (program) must be 1-2 for ${dept === '4' ? 'CSE' : 'MPE'} department` };
    }
    // Section validation for CSE/MPE: P=2 -> S=1, P=1 -> S=1 or 2
    if (programInt === 2) {
      if (sectionInt !== 1) {
        return { valid: false, error: `Digit 7 (section) must be 1 when program is 2 for ${dept === '4' ? 'CSE' : 'MPE'}` };
      }
    } else if (programInt === 1) {
      if (sectionInt < 1 || sectionInt > 2) {
        return { valid: false, error: `Digit 7 (section) must be 1-2 when program is 1 for ${dept === '4' ? 'CSE' : 'MPE'}` };
      }
    }
  } else { // BTM (2) or TVE (5)
    if (programInt !== 1) {
      return { valid: false, error: `Digit 6 (program) must be 1 for ${dept === '2' ? 'BTM' : 'TVE'} department` };
    }
  }
  
  // Validate roll number (01-99)
  const rollNumInt = parseInt(rollNum, 10);
  if (rollNumInt < 1 || rollNumInt > 99) {
    return { valid: false, error: 'Last 2 digits (roll) must be 01-99' };
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

// Normalize phone number for comparison (remove +88 prefix and spaces)
const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  let clean = phone.replace(/[\s\-()]/g, '');
  if (clean.startsWith('+880')) clean = '0' + clean.substring(4);
  else if (clean.startsWith('880')) clean = '0' + clean.substring(3);
  return clean;
};

// Normalize student ID for comparison
const normalizeStudentId = (studentId: string): string => {
  if (!studentId) return '';
  return studentId.replace(/[\s-]/g, '').toLowerCase();
};

// Check for duplicate values in arrays
const findDuplicates = (values: string[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  
  for (const value of values) {
    if (value && seen.has(value)) {
      duplicates.add(value);
    }
    if (value) seen.add(value);
  }
  
  return Array.from(duplicates);
};

export default function TeamRegistrationPage() {
  const { user, profile, isLoading: authLoading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<'competition' | 'form' | 'success'>('competition');
  const [competitionType, setCompetitionType] = useState<'ai_api' | 'devops' | 'both' | null>(null);
  const [devopsOnly, setDevopsOnly] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);
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
    const checkRegistrationStatus = async () => {
      if (!authLoading && user) {
        console.log('Auth loaded, checking redirect...', { user: !!user, isRegistered: profile?.is_registered });
        
        // Check if profile says registered
        if (profile?.is_registered) {
          console.log('Already registered (profile), redirecting to dashboard...');
          router.push('/team-dashboard');
          return;
        }
        
        // Also check if there's a team for this user (in case profile wasn't updated)
        const { data: existingTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('leader_id', user.id)
          .single();
        
        if (existingTeam) {
          console.log('Found existing team, redirecting to dashboard...');
          // Update profile and redirect
          await supabase
            .from('profiles')
            .update({ is_registered: true, team_id: existingTeam.id })
            .eq('id', user.id);
          await refreshProfile();
          router.push('/team-dashboard');
          return;
        }
        
        // User is logged in but not registered - fill form
        if (user.email) {
          console.log('User logged in, filling form...');
          setFormData(prev => ({
            ...prev,
            leaderEmail: user.email || '',
            leaderName: user.user_metadata?.full_name || '',
          }));
        }

        // Check if registration is open
        const { data: regSettings } = await supabase
          .from('registration_settings')
          .select('is_registration_open')
          .single();
        
        setRegistrationOpen(regSettings?.is_registration_open ?? true);
      } else if (!authLoading && !user) {
        console.log('No user, redirecting to login...');
        router.push('/login');
      }
    };
    
    checkRegistrationStatus();
  }, [user, profile, authLoading, router, supabase, refreshProfile]);

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

  const handleMemberChange = (id: string, field: 'name' | 'studentId' | 'phone' | 'nationality', value: string) => {
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

  // Validate member phone on blur
  const handleMemberPhoneBlur = (id: string, phone: string) => {
    if (phone) {
      const result = validateBangladeshiPhone(phone);
      if (!result.valid) {
        setFieldErrors(prev => ({ ...prev, [`member_${id}_phone`]: result.error || '' }));
      }
    }
  };

  const addMember = () => {
    setTeamMembers(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', studentId: '', phone: '', nationality: 'Bangladesh' }
    ]);
  };

  const removeMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    // Clear any related errors
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`member_${id}`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
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
    
    // Validate member fields
    const activeMembers = teamMembers.filter(m => m.name.trim());
    for (const member of activeMembers) {
      // Student ID is required for members
      if (!member.studentId || !member.studentId.trim()) {
        errors[`member_${member.id}_studentId`] = 'Student ID is required';
      } else {
        const memberStudentIdResult = validateStudentId(member.studentId);
        if (!memberStudentIdResult.valid) {
          errors[`member_${member.id}_studentId`] = memberStudentIdResult.error || 'Invalid student ID';
        }
      }
      // Phone is required for members
      if (!member.phone || !member.phone.trim()) {
        errors[`member_${member.id}_phone`] = 'Phone number is required';
      } else {
        const memberPhoneResult = validateBangladeshiPhone(member.phone);
        if (!memberPhoneResult.valid) {
          errors[`member_${member.id}_phone`] = memberPhoneResult.error || 'Invalid phone number';
        }
      }
      // Nationality is required
      if (!member.nationality || !member.nationality.trim()) {
        errors[`member_${member.id}_nationality`] = 'Nationality is required';
      }
    }
    
    // Check for duplicate student IDs
    const allStudentIds = [
      normalizeStudentId(formData.studentId),
      ...activeMembers.map(m => normalizeStudentId(m.studentId))
    ].filter(id => id);
    
    const duplicateStudentIds = findDuplicates(allStudentIds);
    if (duplicateStudentIds.length > 0) {
      // Find which fields have duplicates
      const leaderNormalized = normalizeStudentId(formData.studentId);
      if (duplicateStudentIds.includes(leaderNormalized)) {
        errors.studentId = 'This Student ID is already used by another team member';
      }
      for (const member of activeMembers) {
        const memberNormalized = normalizeStudentId(member.studentId);
        if (duplicateStudentIds.includes(memberNormalized)) {
          // Check if it matches leader or another member
          if (memberNormalized === leaderNormalized) {
            errors[`member_${member.id}_studentId`] = 'This Student ID is same as team leader';
          } else {
            // Check against other members
            const otherMembers = activeMembers.filter(m => m.id !== member.id);
            for (const other of otherMembers) {
              if (normalizeStudentId(other.studentId) === memberNormalized) {
                errors[`member_${member.id}_studentId`] = 'Duplicate Student ID with another team member';
                break;
              }
            }
          }
        }
      }
    }
    
    // Check for duplicate phone numbers
    const allPhones = [
      normalizePhone(formData.phone),
      ...activeMembers.map(m => normalizePhone(m.phone))
    ].filter(p => p);
    
    const duplicatePhones = findDuplicates(allPhones);
    if (duplicatePhones.length > 0) {
      const leaderNormalized = normalizePhone(formData.phone);
      if (duplicatePhones.includes(leaderNormalized)) {
        errors.phone = 'This phone number is already used by another team member';
      }
      for (const member of activeMembers) {
        const memberNormalized = normalizePhone(member.phone);
        if (duplicatePhones.includes(memberNormalized)) {
          if (memberNormalized === leaderNormalized) {
            errors[`member_${member.id}_phone`] = 'This phone number is same as team leader';
          } else {
            const otherMembers = activeMembers.filter(m => m.id !== member.id);
            for (const other of otherMembers) {
              if (normalizePhone(other.phone) === memberNormalized) {
                errors[`member_${member.id}_phone`] = 'Duplicate phone number with another team member';
                break;
              }
            }
          }
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
          payment_status: 'pending',
          competition_type: competitionType || 'ai_api',
          members: teamMembers.filter(m => m.name.trim() !== '').map(m => ({
            name: m.name.trim(),
            studentId: m.studentId.trim(),
            phone: m.phone.trim(),
            nationality: m.nationality
          })),
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

      // Refresh profile data - wait for it to complete
      console.log('Refreshing profile...');
      try {
        await refreshProfile();
        console.log('Profile refreshed successfully');
      } catch (refreshErr) {
        console.warn('Profile refresh failed, retrying...', refreshErr);
        // Retry once
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          await refreshProfile();
          console.log('Profile refreshed on retry');
        } catch (retryErr) {
          console.warn('Profile refresh retry failed (non-critical):', retryErr);
        }
      }
      
      console.log('Registration complete!');
      setStep('success');
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Registration error (stringified):', JSON.stringify(err, null, 2));
      
      // Better error message extraction
      let errorMessage = 'Failed to register team. Please try again.';
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (err?.code) {
        errorMessage = `Error code: ${err.code}`;
      } else if (err?.details) {
        errorMessage = err.details;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.error_description) {
        errorMessage = err.error_description;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading || registrationOpen === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Registration closed
  if (registrationOpen === false) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-48 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>
        <div className="relative w-full max-w-md mx-auto px-4">
          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-8 text-center space-y-6 shadow-2xl shadow-red-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-accent/5 rounded-lg pointer-events-none"></div>
            <div className="relative flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-full flex items-center justify-center border-2 border-red-500/50 shadow-lg shadow-red-500/20">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>
            </div>
            <div className="relative space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">Registration Closed</h1>
              <p className="text-muted-foreground text-sm">Registration is currently closed. Stay tuned for updates!</p>
            </div>
            <div className="relative space-y-3 pt-2">
              <Button 
                onClick={async () => { await signOut(); router.push('/login'); }}
                className="w-full bg-accent hover:bg-accent/90 text-white h-11 shadow-lg shadow-accent/25"
              >
                Login / Register
              </Button>
              <Link href="/" className="w-full block">
                <Button variant="outline" className="w-full border-border/50 text-white hover:bg-accent/5 hover:border-accent/30 h-11 bg-transparent">
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </div>
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
              {competitionType === 'both' && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-300"><Info className="w-3 h-3 inline mr-1" />DevOps registration will open soon. You&apos;ll be notified when it starts.</p>
                </div>
              )}
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

      {/* DevOps Only Message */}
      {devopsOnly && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDevopsOnly(false)}>
          <Card className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl max-w-md w-full p-6 sm:p-8 text-center space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-full flex items-center justify-center border-2 border-amber-500/50">
                  <Server className="w-10 h-10 text-amber-500" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">Coming Soon!</h2>
              <p className="text-muted-foreground text-sm">Registration for the DevOps competition hasn&apos;t started yet. Stay tuned for updates!</p>
            </div>
            <Button onClick={() => { setDevopsOnly(false); setCompetitionType(null); }} className="w-full bg-accent hover:bg-accent/90 text-white h-11">
              Go Back
            </Button>
          </Card>
        </div>
      )}

      {/* Competition Selection Step */}
      {step === 'competition' && !devopsOnly && (
        <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
          <div className="w-full max-w-2xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-6 group text-sm">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </Link>

            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-6 sm:p-8 space-y-6 shadow-2xl shadow-accent/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>

              <div className="relative text-center space-y-3">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/30 rounded-xl blur-lg animate-pulse"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center border border-accent/40 shadow-lg shadow-accent/20">
                      <Sparkles className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">Choose Your Competition</h1>
                <p className="text-muted-foreground text-sm">Select which competition(s) you want to participate in</p>
              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI & API Card */}
                <button
                  type="button"
                  onClick={() => setCompetitionType(prev => {
                    if (prev === 'ai_api') return null;
                    if (prev === 'both') return 'devops';
                    if (prev === 'devops') return 'both';
                    return 'ai_api';
                  })}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 group ${
                    competitionType === 'ai_api' || competitionType === 'both'
                      ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                      : 'border-border/50 bg-background/30 hover:border-accent/30 hover:bg-accent/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                      competitionType === 'ai_api' || competitionType === 'both'
                        ? 'bg-accent/20 border-accent/50' : 'bg-background/50 border-border/50 group-hover:border-accent/30'
                    }`}>
                      <Code2 className={`w-5 h-5 ${competitionType === 'ai_api' || competitionType === 'both' ? 'text-accent' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI & API</h3>
                      <p className="text-xs text-muted-foreground">Open for registration</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Build innovative solutions using AI models and APIs</p>
                  {(competitionType === 'ai_api' || competitionType === 'both') && (
                    <div className="absolute top-3 right-3"><CheckCircle className="w-5 h-5 text-accent" /></div>
                  )}
                  <div className="mt-3">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-semibold rounded-full border border-green-500/30">OPEN</span>
                  </div>
                </button>

                {/* DevOps Card */}
                <button
                  type="button"
                  onClick={() => setCompetitionType(prev => {
                    if (prev === 'devops') return null;
                    if (prev === 'both') return 'ai_api';
                    if (prev === 'ai_api') return 'both';
                    return 'devops';
                  })}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 group ${
                    competitionType === 'devops' || competitionType === 'both'
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                      : 'border-border/50 bg-background/30 hover:border-purple-500/30 hover:bg-purple-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                      competitionType === 'devops' || competitionType === 'both'
                        ? 'bg-purple-500/20 border-purple-500/50' : 'bg-background/50 border-border/50 group-hover:border-purple-500/30'
                    }`}>
                      <Server className={`w-5 h-5 ${competitionType === 'devops' || competitionType === 'both' ? 'text-purple-400' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">DevOps</h3>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Infrastructure, CI/CD, and cloud deployment challenges</p>
                  {(competitionType === 'devops' || competitionType === 'both') && (
                    <div className="absolute top-3 right-3"><CheckCircle className="w-5 h-5 text-purple-400" /></div>
                  )}
                  <div className="mt-3">
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-semibold rounded-full border border-amber-500/30">COMING SOON</span>
                  </div>
                </button>
              </div>

              {competitionType === 'both' && (
                <div className="relative flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-300">You&apos;ll register and pay for AI & API now. DevOps registration will open separately — you&apos;ll be notified when it starts.</p>
                </div>
              )}

              <div className="relative pt-2">
                <Button
                  onClick={() => {
                    if (competitionType === 'devops') {
                      setDevopsOnly(true);
                    } else if (competitionType === 'ai_api' || competitionType === 'both') {
                      setStep('form');
                    }
                  }}
                  disabled={!competitionType}
                  className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-base font-semibold disabled:opacity-50 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {step === 'form' && (
      <div className="relative py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep('competition')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-6 sm:mb-8 group text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 p-5 sm:p-8 space-y-6 sm:space-y-8 shadow-2xl shadow-accent/5 relative overflow-hidden">
            {/* Card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>
            
            {/* Header */}
            <div className="relative text-center space-y-3 sm:space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 rounded-xl blur-lg animate-pulse"></div>
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center border border-accent/40 shadow-lg shadow-accent/20">
                    <Users className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-white to-accent bg-clip-text text-transparent">Register Your Team</h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Only team leaders can register a team</p>
              </div>
              
              {/* Team type badges */}
              <div className="flex justify-center gap-2 sm:gap-3 pt-2">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 bg-background/30 rounded-lg border border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Logged in as</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-none">{formData.leaderEmail}</p>
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
                    className="h-11 bg-background/60 border-2 border-border/60 text-white placeholder:text-muted-foreground/60 focus:border-accent focus:bg-background/80 focus:ring-2 focus:ring-accent/20 transition-all rounded-lg shadow-sm"
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
                    className="h-11 bg-background/60 border-2 border-border/60 text-white placeholder:text-muted-foreground/60 focus:border-accent focus:bg-background/80 focus:ring-2 focus:ring-accent/20 transition-all rounded-lg shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email (Auto-filled)</label>
                  <Input
                    type="email"
                    name="leaderEmail"
                    value={formData.leaderEmail}
                    disabled
                    className="h-11 bg-background/20 border-2 border-border/30 text-white/50 cursor-not-allowed rounded-lg"
                  />
                  <p className="text-[11px] text-muted-foreground/70 mt-1.5 italic">From your Google account</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className={`h-11 bg-background/60 border-2 text-white placeholder:text-muted-foreground/60 focus:border-accent focus:bg-background/80 focus:ring-2 focus:ring-accent/20 transition-all rounded-lg shadow-sm ${fieldErrors.studentId ? 'border-red-500 bg-red-500/5' : 'border-border/60'}`}
                    />
                    {fieldErrors.studentId && (
                      <p className="text-xs text-red-400 mt-1.5 font-medium">{fieldErrors.studentId}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/70 mt-1.5 italic">Format: YY00DPS## (e.g., 240042101)</p>
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
                      <SelectTrigger className={`h-11 w-full bg-background/60 border-2 border-border/60 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-lg ${formData.studentId.length >= 5 ? 'opacity-70 cursor-not-allowed' : ''}`}>
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
                      <p className="text-xs text-red-400 mt-1.5 font-medium">{fieldErrors.department}</p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/70 mt-1.5 italic">
                        {formData.studentId.length >= 5 ? 'Locked based on Student ID' : 'Auto-selected from Student ID'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className={`h-11 bg-background/60 border-2 text-white placeholder:text-muted-foreground/60 focus:border-accent focus:bg-background/80 focus:ring-2 focus:ring-accent/20 transition-all rounded-lg shadow-sm ${fieldErrors.phone ? 'border-red-500 bg-red-500/5' : 'border-border/60'}`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-400 mt-1.5 font-medium">{fieldErrors.phone}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/70 mt-1.5 italic">11 digits or +880 format</p>
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
                      <SelectTrigger className="h-11 w-full bg-background/60 border-2 border-border/60 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-lg">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {OIC_COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground/70 mt-1.5 italic">OIC member countries only</p>
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
                      <div key={member.id} className="p-5 bg-background/30 rounded-xl border border-border/30 space-y-4">
                        {/* Header with member number and remove button */}
                        <div className="flex items-center justify-between pb-2 border-b border-border/20">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-accent/10 rounded-full flex items-center justify-center border border-accent/30">
                              <span className="text-xs font-medium text-accent">{idx + 1}</span>
                            </div>
                            <span className="text-sm font-medium text-white">Team Member</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Name and Student ID row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">
                              Full Name *
                            </label>
                            <Input
                              type="text"
                              placeholder="Enter full name"
                              value={member.name}
                              onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                              className="h-11 bg-background/60 border-2 border-border/60 text-white placeholder:text-muted-foreground/60 focus:border-accent focus:bg-background/80 focus:ring-2 focus:ring-accent/20 transition-all rounded-lg shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">
                              Student ID *
                            </label>
                            <Input
                              type="text"
                              placeholder="e.g., 240042101"
                              value={member.studentId}
                              onChange={(e) => handleMemberChange(member.id, 'studentId', e.target.value)}
                              onBlur={() => handleMemberStudentIdBlur(member.id, member.studentId)}
                              className={`h-11 bg-background/60 border-2 text-white placeholder:text-muted-foreground/60 focus:border-accent focus:bg-background/80 focus:ring-2 focus:ring-accent/20 transition-all rounded-lg shadow-sm ${fieldErrors[`member_${member.id}_studentId`] ? 'border-red-500 bg-red-500/5' : 'border-border/60'}`}
                            />
                            {fieldErrors[`member_${member.id}_studentId`] ? (
                              <p className="text-xs text-red-400 font-medium">{fieldErrors[`member_${member.id}_studentId`]}</p>
                            ) : (
                              <p className="text-[11px] text-muted-foreground/70 italic">Format: YY00DPS##</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Phone and Nationality row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">
                              Phone (Bangladesh) *
                            </label>
                            <Input
                              type="tel"
                              placeholder="01XXXXXXXXX"
                              value={member.phone}
                              onChange={(e) => handleMemberChange(member.id, 'phone', e.target.value)}
                              onBlur={() => handleMemberPhoneBlur(member.id, member.phone)}
                              className={`h-11 bg-background/60 border-2 text-white placeholder:text-muted-foreground/60 focus:border-accent focus:bg-background/80 focus:ring-2 focus:ring-accent/20 transition-all rounded-lg shadow-sm ${fieldErrors[`member_${member.id}_phone`] ? 'border-red-500 bg-red-500/5' : 'border-border/60'}`}
                            />
                            {fieldErrors[`member_${member.id}_phone`] ? (
                              <p className="text-xs text-red-400 font-medium">{fieldErrors[`member_${member.id}_phone`]}</p>
                            ) : (
                              <p className="text-[11px] text-muted-foreground/70 italic">11 digits or +880 format</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-white">
                              Nationality *
                            </label>
                            <Select
                              value={member.nationality}
                              onValueChange={(value) => handleMemberChange(member.id, 'nationality', value)}
                            >
                              <SelectTrigger className="h-11 w-full bg-background/60 border-2 border-border/60 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-lg">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {OIC_COUNTRIES.map((country) => (
                                  <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
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
                    <span className="text-sm text-muted-foreground">Registration Fee{competitionType === 'both' ? ' (AI & API only)' : ''}</span>
                    <span className="text-lg font-bold text-white">৳310</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Send <span className="text-pink-400 font-semibold">310 BDT</span> to the following bKash number:</p>
                    <p className="text-xl font-bold text-pink-400">01791751468</p>
                    <p className="text-xs">**Use your <span className="text-pink-400 font-semibold">TEAM NAME_AI&API</span> as reference : "iutcs_AI&API"</p>
                    {competitionType === 'both' && (
                      <p className="text-xs text-amber-400 mt-2">⚠ This payment is for AI & API competition only. DevOps payment will be collected separately when registration opens.</p>
                    )}
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
                    className="h-11 bg-background/60 border-2 border-pink-500/40 text-white placeholder:text-muted-foreground/60 focus:border-pink-500 focus:bg-background/80 focus:ring-2 focus:ring-pink-500/20 transition-all rounded-lg shadow-sm"
                  />
                  <p className="text-[11px] text-muted-foreground/70 mt-1.5 italic">
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
                      
                      Register Team
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Terms */}
            <p className="relative text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
              By registering, you agree to our terms and acknowledge that only team leaders can submit projects.
            </p>
          </Card>
        </div>
      </div>
      )}

      <ScrollToTop />
    </div>
  );
}
