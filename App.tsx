import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, provider, db } from "./firebase";

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Lock, LayoutDashboard, Activity, Stethoscope, Ambulance, 
  LogOut, Send, Phone, MessageSquare, MapPin, FileText,
  AlertCircle, CheckCircle, ChevronRight, Languages, CreditCard,
  UserCircle, Calendar, Pill, Clock, Check, X, Map, Navigation,
  Menu, Bell, Shield, HeartPulse, Thermometer, Hospital as HospitalIcon
} from 'lucide-react';
import { ViewState, Role, User as UserType, ChatMessage, Consultation, Ride, Hospital, MedicineOrder } from './types';
import { analyzeSymptoms } from './services/aiService';

// --- SHARED MOCK DATA ---
const MOCK_HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'Apollo Hospitals', location: 'Jubilee Hills' },
  { id: 'h2', name: 'Yashoda Hospitals', location: 'Secunderabad' },
  { id: 'h3', name: 'KIMS', location: 'Begumpet' },
];

const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'c1',
    patientId: '123',
    patientName: 'John Doe',
    doctorName: 'Dr. Sarah Smith',
    hospitalId: 'h1',
    hospitalName: 'Apollo Hospitals',
    date: '2023-10-12',
    symptoms: 'Mild fever and cough',
    type: 'Video',
    status: 'Completed',
    amount: 499
  }
];

// --- UTILS ---
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const StatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-slate-100 text-slate-600';
  if (['Completed', 'Delivered', 'Picked Up', 'Confirmed'].includes(status)) color = 'bg-green-100 text-green-700 border border-green-200';
  if (['Pending', 'Requested', 'Placed'].includes(status)) color = 'bg-amber-100 text-amber-700 border border-amber-200';
  if (['En Route', 'Preparing', 'Ready'].includes(status)) color = 'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse';
  if (['Cancelled', 'Severe'].includes(status)) color = 'bg-red-100 text-red-700 border border-red-200';

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${color}`}>
      {status}
    </span>
  );
};

// --- AUTH SCREEN ---
const AuthScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = () => {
  if (!email.trim() || !password.trim()) {
    alert("Please enter email and password");
    return;
  }

  onLogin(); // only call parent login if valid
};
const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "activeUsers", user.uid);
    const userSnap = await getDoc(userRef);

    // If already logged in somewhere else
    if (userSnap.exists() && userSnap.data().isActive) {
      alert("This account is already logged in on another device.");
      await signOut(auth);
      return;
    }

    // Mark user as active
    await setDoc(userRef, {
      email: user.email,
      isActive: true
    });

    onLogin(); // move to dashboard

  } catch (error) {
    console.error("Google Login Error:", error);
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/50 z-10">
        {/* Left Side - Branding */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-red-600 to-red-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] opacity-10 bg-cover bg-center"></div>
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-6">
               <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                 <Activity className="w-8 h-8" />
               </div>
               <h1 className="text-3xl font-bold tracking-tight">MedX</h1>
             </div>
             <h2 className="text-4xl font-bold leading-tight mb-4">Healthcare <br/> Reimagined.</h2>
             <p className="text-red-100 text-lg">AI-powered diagnostics, instant emergency response, and seamless care.</p>
           </div>
           <div className="relative z-10 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-white opacity-100"></div>
              <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
           </div>
        </div>
        
        
        {/* Right Side - Form */}
<div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
  <h3 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back</h3>
  <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>
  
  <div className="space-y-5">
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Email Address
      </label>
      <input 
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-red-500 focus:bg-white transition-all outline-none text-slate-700"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Password
      </label>
      <div className="relative">
        <input 
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-10 focus:ring-2 focus:ring-red-500 focus:bg-white transition-all outline-none text-slate-700"
        />
        <button type="button" className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
          <Lock className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Sign In Button */}
    <button 
      onClick={handleLogin}

      className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-[0.98]"
    >
      Sign In
    </button>

    {/* Divider */}
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-slate-200"></div>
      <span className="text-slate-400 text-sm">OR</span>
      <div className="flex-1 h-px bg-slate-200"></div>
    </div>

    {/* Google Button */}
    <button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full border border-slate-200 bg-white text-slate-700 font-semibold py-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
>
  Continue with Google
</button>


    <p className="text-center text-slate-400 text-sm mt-4">
      Protected by MedX Secure Health Cloud
    </p>
  </div>
</div>

      </div>
    </div>
  );
};


// --- ROLE SELECTION ---
const RoleSelection = ({ onSelectRole }: { onSelectRole: (role: Role) => void }) => {
  const [showCodeModal, setShowCodeModal] = useState<Role | null>(null);
  const [accessCode, setAccessCode] = useState('123456');

  const handleRoleClick = (role: Role) => {
    if (role === 'user') {
      onSelectRole('user');
    } else {
      setShowCodeModal(role);
    }
  };

  const handleCodeSubmit = () => {
    if (accessCode === '123456') {
      if (showCodeModal) onSelectRole(showCodeModal);
    } else {
      alert("Invalid Access Code (Try 123456)");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Select Portal</h1>
           <p className="text-slate-500 text-lg">Choose your role to access the specific dashboard.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RoleCard 
            title="Patient" 
            icon={<UserCircle className="w-14 h-14" />} 
            desc="AI Diagnosis, Bookings & Emergency"
            onClick={() => handleRoleClick('user')}
            theme="blue"
          />
          <RoleCard 
            title="Hospital" 
            icon={<Stethoscope className="w-14 h-14" />} 
            desc="OPD Management & Triage"
            onClick={() => handleRoleClick('hospital')}
            theme="teal"
          />
          <RoleCard 
            title="Emergency Driver" 
            icon={<Ambulance className="w-14 h-14" />} 
            desc="Dispatch & Navigation"
            onClick={() => handleRoleClick('driver')}
            theme="red"
          />
          <RoleCard 
            title="Pharmacy" 
            icon={<Pill className="w-14 h-14" />} 
            desc="Inventory & Orders"
            onClick={() => handleRoleClick('pharmacy')}
            theme="indigo"
          />
        </div>
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <Shield className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 capitalize">{showCodeModal} Login</h3>
               <p className="text-slate-500 text-sm mt-1">Enter your 6-digit authorized access code.</p>
            </div>
            
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 font-mono text-2xl text-center tracking-[0.5em] focus:ring-2 focus:ring-slate-800 outline-none text-slate-800"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              maxLength={6}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowCodeModal(null)} 
                className="py-3 px-4 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCodeSubmit} 
                className="py-3 px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg"
              >
                Verify Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RoleCard = ({ title, icon, desc, onClick, theme }: any) => {
  const themeColors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300 hover:shadow-blue-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300 hover:shadow-teal-100",
    red: "bg-red-50 text-red-600 border-red-100 hover:border-red-300 hover:shadow-red-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100",
  };

  return (
    <button 
      onClick={onClick} 
      className={`group relative p-8 rounded-3xl border-2 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${themeColors[theme]} h-full flex flex-col items-center text-center`}
    >
      <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      
      <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold flex items-center gap-1">
         Enter Portal <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
};

// --- DASHBOARD LAYOUTS ---

// 1. HOSPITAL DASHBOARD
const HospitalDashboard = ({ consultations, rides, onUpdateConsultation, onLogout }: any) => {
  const [activeTab, setActiveTab] = useState('appointments');
  const pendingConsultations = consultations.filter((c: Consultation) => c.status === 'Pending');
  const incomingEmergencies = rides.filter((r: Ride) => r.status !== 'Completed');

  return (
    <div className="flex h-screen bg-slate-50 font-inter">
      {/* Sidebar */}
      <aside className="w-72 bg-teal-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-teal-800 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg"><Stethoscope className="w-6 h-6"/></div>
          <span className="text-xl font-bold tracking-tight">MedX Hospital</span>
        </div>
        
        <div className="p-4 space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('appointments')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'appointments' ? 'bg-white text-teal-900 shadow-lg font-semibold' : 'text-teal-100 hover:bg-teal-800'}`}
          >
            <Calendar className="w-5 h-5" /> Appointments
            {pendingConsultations.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{pendingConsultations.length}</span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('emergency')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'emergency' ? 'bg-white text-teal-900 shadow-lg font-semibold' : 'text-teal-100 hover:bg-teal-800'}`}
          >
            <AlertCircle className="w-5 h-5" /> Emergency Feed
             {incomingEmergencies.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">{incomingEmergencies.length}</span>}
          </button>
        </div>

        <div className="p-4 border-t border-teal-800">
           <button onClick={onLogout} className="flex items-center gap-3 text-teal-200 hover:text-white transition px-4 py-2">
              <LogOut className="w-5 h-5" /> Sign Out
           </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {activeTab === 'appointments' ? 'Outpatient Department' : 'Emergency Response Unit'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <span className="text-sm font-medium text-slate-600">System Operational</span>
             <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold border border-teal-200">H</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {activeTab === 'appointments' && (
            <div className="max-w-5xl mx-auto">
               <div className="flex justify-between items-end mb-6">
                 <div>
                   <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
                   <p className="text-slate-500 mt-1">Manage patient consultations and triage.</p>
                 </div>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border rounded-lg text-sm font-medium text-slate-600 shadow-sm">Today</span>
                    <span className="px-3 py-1 bg-white border rounded-lg text-sm font-medium text-slate-600 shadow-sm">Filter</span>
                 </div>
               </div>

               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 {pendingConsultations.length === 0 ? (
                   <div className="p-12 text-center text-slate-400">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>All caught up! No pending appointments.</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-slate-100">
                     {pendingConsultations.map((c: Consultation) => (
                       <div key={c.id} className="p-6 hover:bg-slate-50 transition-colors flex items-start justify-between group">
                          <div className="flex gap-4">
                             <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-lg">
                                {c.patientName.charAt(0)}
                             </div>
                             <div>
                                <h3 className="font-bold text-slate-900 text-lg">{c.patientName}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                   <Thermometer className="w-4 h-4 text-red-400" />
                                   <span className="font-medium text-slate-700">{c.symptoms}</span>
                                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                   <span>{c.type} Consultation</span>
                                </div>
                                <div className="mt-3 flex gap-2">
                                   <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{c.date}</span>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => onUpdateConsultation(c.id, 'Cancelled')} className="px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">Decline</button>
                             <button onClick={() => onUpdateConsultation(c.id, 'Confirmed')} className="px-5 py-2 bg-teal-600 text-white rounded-lg font-bold shadow-md shadow-teal-200 hover:bg-teal-700 transition-transform active:scale-95">Accept Patient</button>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          )}
          
          {activeTab === 'emergency' && (
             <div className="max-w-4xl mx-auto">
               <h1 className="text-3xl font-bold text-red-600 mb-6 flex items-center gap-3">
                 <div className="relative flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500"></span>
                  </div>
                 Live Emergency Feed
               </h1>
               
               <div className="grid gap-6">
                 {incomingEmergencies.map((r: Ride) => (
                   <div key={r.id} className="bg-white border-l-4 border-red-500 rounded-r-xl shadow-lg p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Ambulance className="w-32 h-32 text-red-600" />
                      </div>
                      
                      <div className="flex items-start gap-6 relative z-10">
                         <div className="bg-red-50 p-4 rounded-2xl text-red-600">
                            <HeartPulse className="w-8 h-8 animate-pulse" />
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h3 className="text-2xl font-bold text-slate-900">Inbound {r.vehicleType}</h3>
                                  <p className="text-lg text-slate-600 font-medium">Patient: {r.patientName}</p>
                               </div>
                               <div className="text-right">
                                  <div className="text-3xl font-bold text-red-600">{r.etaMinutes} <span className="text-sm text-slate-500 font-normal">mins</span></div>
                                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ETA</div>
                               </div>
                            </div>
                            
                            <div className="mt-6 flex items-center gap-6">
                               <div className="flex items-center gap-2">
                                  <MapPin className="w-5 h-5 text-slate-400" />
                                  <span className="text-slate-700">{r.pickupLocation}</span>
                               </div>
                               <ChevronRight className="w-5 h-5 text-slate-300" />
                               <div className="flex items-center gap-2">
                                  <HospitalIcon className="w-5 h-5 text-teal-500" />
                                  <span className="font-bold text-slate-900">Apollo ER</span>
                               </div>
                            </div>

                            <div className="mt-6">
                               <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                                  <div className="bg-red-500 h-2 rounded-full" style={{width: '70%'}}></div>
                               </div>
                               <div className="flex justify-between text-xs text-slate-400 font-medium">
                                  <span>Dispatched</span>
                                  <span>En Route</span>
                                  <span>Arrival</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
                 {incomingEmergencies.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                       <Shield className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                       <h3 className="text-xl font-medium text-slate-500">No Active Emergencies</h3>
                       <p className="text-slate-400">System monitoring active.</p>
                    </div>
                 )}
               </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

// 2. DRIVER DASHBOARD
const DriverDashboard = ({ rides, onUpdateRide, driverName, onLogout }: any) => {
  const [isOnline, setIsOnline] = useState(true);
  const availableRides = rides.filter((r: Ride) => r.status === 'Requested');
  const myActiveRide = rides.find((r: Ride) => r.driverName === driverName && r.status !== 'Completed');

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-inter relative overflow-hidden">
      {/* Map Background Simulation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
          {/* Simulated Roads */}
          <svg className="absolute w-full h-full stroke-slate-600 stroke-2 fill-none" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 100 Q 250 200 400 150 T 800 300" />
             <path d="M100 0 Q 150 300 300 400" />
             <circle cx="400" cy="150" r="4" className="fill-blue-500 animate-ping" />
          </svg>
      </div>

      <header className="bg-slate-800/80 backdrop-blur-md p-4 shadow-lg z-20 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg"><Ambulance className="text-white w-6 h-6"/></div>
          <div>
             <h2 className="font-bold text-lg leading-tight">Driver Portal</h2>
             <p className="text-xs text-slate-400">{driverName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-full border border-slate-700">
             <span className={`text-xs font-bold px-3 ${isOnline ? 'text-green-400' : 'text-slate-500'}`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
             <button 
                onClick={() => setIsOnline(!isOnline)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`}
             >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isOnline ? 'left-7' : 'left-1'}`}></div>
             </button>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-white bg-slate-700 rounded-full"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto relative z-10 flex flex-col items-center">
        <div className="w-full max-w-md space-y-4 mt-4">
          {!isOnline && (
            <div className="bg-slate-800 border border-slate-700 text-slate-300 p-6 rounded-2xl text-center shadow-xl backdrop-blur-sm">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Navigation className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-medium">You are currently offline.</p>
              <p className="text-sm text-slate-500 mt-2">Go online to receive emergency dispatch requests.</p>
            </div>
          )}

          {isOnline && myActiveRide && (
             <div className="bg-slate-800 border border-slate-600 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 pb-12 relative">
                   <div className="flex justify-between items-start relative z-10">
                      <div>
                         <span className="text-xs font-bold bg-blue-800/50 text-blue-100 px-2 py-1 rounded border border-blue-500/30">CURRENT JOB</span>
                         <h3 className="text-3xl font-bold mt-2">{myActiveRide.status}</h3>
                      </div>
                      <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                         <Navigation className="w-6 h-6 text-white" />
                      </div>
                   </div>
                   {/* Wave decoration */}
                   <div className="absolute bottom-0 left-0 right-0">
                      <svg viewBox="0 0 1440 320" className="w-full h-16 fill-slate-800">
                         <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                      </svg>
                   </div>
                </div>

                <div className="px-6 pb-6 -mt-4">
                   <div className="bg-slate-700/50 rounded-2xl p-4 mb-6 border border-slate-600 space-y-6">
                      <div className="flex gap-4">
                         <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                            <div className="w-0.5 h-12 bg-slate-600 my-1"></div>
                            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
                         </div>
                         <div className="flex-1 space-y-6">
                            <div>
                               <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Pickup</p>
                               <p className="text-lg font-medium">{myActiveRide.pickupLocation}</p>
                            </div>
                            <div>
                               <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Dropoff</p>
                               <p className="text-lg font-medium">{myActiveRide.dropLocation}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Action Slider Button Area */}
                   {myActiveRide.status === 'En Route' && (
                     <button 
                        onClick={() => onUpdateRide(myActiveRide.id, 'Picked Up')} 
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                     >
                       Confirm Patient Pickup
                     </button>
                   )}
                   {myActiveRide.status === 'Picked Up' && (
                     <button 
                        onClick={() => onUpdateRide(myActiveRide.id, 'Completed')} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                     >
                       Complete Ride
                     </button>
                   )}
                </div>
             </div>
          )}

          {isOnline && !myActiveRide && (
             <div className="space-y-4">
               <div className="flex justify-between items-center px-2">
                 <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Radar Feed</h3>
                 <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{availableRides.length}</span>
               </div>
               
               {availableRides.length > 0 ? availableRides.map((ride: Ride) => (
                 <div key={ride.id} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                       <Ambulance className="w-24 h-24 text-white" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                       <div className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1 rounded uppercase tracking-wide flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          {ride.vehicleType}
                       </div>
                       <span className="text-slate-400 text-xs font-mono">2.4km • 4m</span>
                    </div>
                    
                    <div className="mb-6 relative z-10">
                       <div className="font-bold text-xl mb-1 text-white">{ride.patientName}</div>
                       <div className="text-slate-400 text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500"/> 
                          {ride.pickupLocation}
                       </div>
                    </div>
                    
                    <button 
                       onClick={() => onUpdateRide(ride.id, 'En Route', driverName)} 
                       className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200 transition active:scale-[0.98] relative z-10"
                    >
                      Accept Request
                    </button>
                 </div>
               )) : (
                  <div className="text-center py-20">
                     <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 m-2 bg-blue-500/20 rounded-full animate-ping delay-75"></div>
                        <div className="relative bg-slate-800 w-full h-full rounded-full flex items-center justify-center border border-slate-700">
                           <Navigation className="w-8 h-8 text-blue-500" />
                        </div>
                     </div>
                     <h3 className="text-lg font-medium text-white">Scanning Area...</h3>
                     <p className="text-slate-500 text-sm">Waiting for dispatch from HQ.</p>
                  </div>
               )}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

// 3. PHARMACY DASHBOARD
const PharmacyDashboard = ({ orders, onUpdateOrder, onLogout }: any) => {
  const activeOrders = orders.filter((o: MedicineOrder) => o.status !== 'Delivered');

  return (
     <div className="flex h-screen bg-slate-50 font-inter text-slate-800">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
             <div className="bg-indigo-100 p-2 rounded-lg"><Pill className="w-6 h-6" /></div>
             MedX Pharma
          </h2>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <button className="w-full text-left p-3 rounded-xl flex items-center gap-3 bg-indigo-50 text-indigo-700 font-semibold shadow-sm">
            <FileText className="w-5 h-5" /> Active Orders
            {activeOrders.length > 0 && <span className="ml-auto bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{activeOrders.length}</span>}
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
           <button onClick={onLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition px-2">
              <LogOut className="w-5 h-5" /> Logout
           </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
         <header className="flex justify-between items-center mb-8">
            <div>
               <h2 className="text-3xl font-bold text-slate-900">Order Management</h2>
               <p className="text-slate-500 mt-1">Process prescriptions and dispatch deliveries.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">
               {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
            </div>
         </header>
         
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {activeOrders.map((order: MedicineOrder) => (
               <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                           {order.patientName.charAt(0)}
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900">{order.patientName}</h3>
                           <p className="text-xs text-slate-500 font-mono">ID: #{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                     </div>
                     <StatusBadge status={order.status} />
                  </div>
                  
                  <div className="p-6">
                     <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Prescription Items</h4>
                        <ul className="space-y-2">
                           {order.items.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                 <Check className="w-4 h-4 text-green-500" /> {item}
                              </li>
                           ))}
                        </ul>
                     </div>
                     
                     <div className="flex justify-between items-center">
                        <div>
                           <span className="text-xs text-slate-400 block font-bold uppercase">Total</span>
                           <span className="text-xl font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                        </div>
                        
                        <div className="flex gap-2">
                           {order.status === 'Placed' && (
                              <button 
                                 onClick={() => onUpdateOrder(order.id, 'Preparing')} 
                                 className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                              >
                                 Accept & Prepare
                              </button>
                           )}
                           {order.status === 'Preparing' && (
                              <button 
                                 onClick={() => onUpdateOrder(order.id, 'Ready')} 
                                 className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 active:scale-95 transition-all"
                              >
                                 Mark Ready
                              </button>
                           )}
                           {order.status === 'Ready' && (
                              <button 
                                 onClick={() => onUpdateOrder(order.id, 'Delivered')} 
                                 className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
                              >
                                 <Check className="w-4 h-4" /> Complete Order
                              </button>
                           )}
                        </div>
                     </div>
                  </div>
                  {/* Progress Bar visual */}
                  <div className="h-1 w-full bg-slate-100">
                     <div className={`h-full transition-all duration-500 ${
                        order.status === 'Placed' ? 'w-[10%] bg-indigo-500' :
                        order.status === 'Preparing' ? 'w-[50%] bg-amber-500' :
                        order.status === 'Ready' ? 'w-[80%] bg-blue-500' : 'w-full bg-green-500'
                     }`}></div>
                  </div>
               </div>
            ))}
            {activeOrders.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl">
                  <div className="bg-slate-50 p-4 rounded-full mb-4">
                     <Pill className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">No Pending Orders</h3>
                  <p className="text-slate-500">New orders will appear here automatically.</p>
               </div>
            )}
         </div>
      </main>
     </div>
  )
}

// 4. USER DASHBOARD (UPDATED)
const UserDashboard = ({ user, onLogout, appState, appActions }: any) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'consultations' | 'rides' | 'pharmacy'>('ai');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: `Hello ${user.name}, I'm your MedX Health Assistant.\nHow are you feeling today?`, timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // Interaction Modes
  const [bookingMode, setBookingMode] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const newMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputMessage, timestamp: new Date() };
    setChatMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoadingAI(true);

    try {
      const analysis = await analyzeSymptoms(newMessage.text);
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `${analysis.advice}\n\nSuggested Action: ${analysis.suggestedAction}`,
        timestamp: new Date(),
        severity: analysis.severity,
        actionRequired: analysis.severity !== 'normal'
      }]);
    } catch (e) {
       console.error(e);
       setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting to the network. Please try again.",
        timestamp: new Date(),
        severity: 'normal'
      }]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleActionClick = (severity: 'moderate' | 'severe') => {
    if (severity === 'severe') {
      setEmergencyMode(true);
      setActiveTab('rides'); 
    } else {
      setBookingMode(true);
    }
  };

  const myConsultations = appState.consultations.filter((c: Consultation) => c.patientId === user.id);
  const myRides = appState.rides.filter((r: Ride) => r.patientId === user.id);
  const myOrders = appState.orders.filter((o: MedicineOrder) => o.patientId === user.id);

  return (
    <div className="flex h-screen bg-slate-50 font-inter">
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-20">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
          <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-200">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="ml-3 text-xl font-bold text-slate-800 hidden lg:block tracking-tight">MedX</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          <SidebarItem icon={<Stethoscope />} label="Health Assistant" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <SidebarItem icon={<FileText />} label="Consultations" active={activeTab === 'consultations'} onClick={() => setActiveTab('consultations')} />
          <SidebarItem icon={<Ambulance />} label="Emergency" active={activeTab === 'rides'} onClick={() => setActiveTab('rides')} alert={emergencyMode} />
          <SidebarItem icon={<Pill />} label="Pharmacy" active={activeTab === 'pharmacy'} onClick={() => setActiveTab('pharmacy')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-3 text-slate-500 hover:bg-slate-50 hover:text-red-600 rounded-xl transition-all group">
             <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
             <span className="hidden lg:block font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
        {/* Mobile Header */}
        <header className="h-16 md:hidden bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30">
           <div className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg"><Activity className="text-white w-5 h-5" /></div>
              <span className="font-bold text-lg">MedX</span>
           </div>
           <button onClick={onLogout}><LogOut className="text-slate-500 w-5 h-5"/></button>
        </header>

        <div className="flex-1 overflow-hidden relative">
           {/* Background Decorations */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

          {activeTab === 'ai' && (
            <div className="h-full flex flex-col relative z-10 max-w-5xl mx-auto w-full md:p-6">
              {!bookingMode && !emergencyMode ? (
                <div className="flex-1 flex flex-col bg-white md:rounded-3xl shadow-xl overflow-hidden border border-slate-200/60">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
                           <Activity className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-800">MedX AI Assistant</h3>
                           <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              <span className="text-xs text-slate-500 font-medium">Online</span>
                           </div>
                        </div>
                     </div>
                     <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition"><Menu className="w-5 h-5"/></button>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl shadow-sm ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-br from-red-600 to-red-500 text-white rounded-tr-sm' 
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
                        }`}>
                          <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                          {msg.actionRequired && msg.severity && (
                            <div className="mt-4 pt-4 border-t border-slate-100/20">
                              {msg.severity === 'severe' ? (
                                <button 
                                  onClick={() => handleActionClick('severe')} 
                                  className="w-full bg-white/10 hover:bg-white/20 text-red-600 bg-red-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-red-100"
                                >
                                  <div className="bg-red-100 p-1 rounded-full"><AlertCircle className="w-4 h-4" /></div> 
                                  Request Emergency Dispatch
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleActionClick('moderate')} 
                                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-blue-100"
                                >
                                  <Calendar className="w-5 h-5" /> Book Consultation
                                </button>
                              )}
                            </div>
                          )}
                          <div className={`text-[10px] mt-2 text-right opacity-60 ${msg.sender === 'user' ? 'text-red-100' : 'text-slate-400'}`}>
                             {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoadingAI && (
                       <div className="flex justify-start">
                          <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-2 items-center">
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                             <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                          </div>
                       </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex gap-2 relative">
                      <input 
                        type="text" 
                        value={inputMessage} 
                        onChange={(e) => setInputMessage(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                        placeholder="Describe your symptoms..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-full pl-6 pr-12 py-4 focus:ring-2 focus:ring-red-500 focus:bg-white transition-all outline-none shadow-inner" 
                      />
                      <button 
                        onClick={handleSendMessage} 
                        disabled={isLoadingAI || !inputMessage.trim()} 
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-all shadow-md flex items-center justify-center"
                      >
                        <Send className="w-5 h-5 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : bookingMode ? (
                <ConsultationBooking user={user} onConfirm={(details: any) => { appActions.addConsultation(details); setBookingMode(false); setActiveTab('consultations'); }} onBack={() => setBookingMode(false)} />
              ) : (
                <EmergencyBooking user={user} onConfirm={(details: any) => { appActions.addRide(details); setEmergencyMode(false); }} onBack={() => setEmergencyMode(false)} />
              )}
            </div>
          )}

          {activeTab === 'consultations' && (
             <div className="p-6 md:p-8 h-full overflow-y-auto max-w-5xl mx-auto w-full z-10 relative">
                <div className="flex justify-between items-center mb-8">
                   <div>
                      <h2 className="text-3xl font-bold text-slate-800">Your Consultations</h2>
                      <p className="text-slate-500 mt-1">History and upcoming appointments</p>
                   </div>
                   <button 
                      onClick={() => {setBookingMode(true); setActiveTab('ai')}} 
                      className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center gap-2"
                   >
                      <span className="text-xl leading-none">+</span> New
                   </button>
                </div>
                <div className="space-y-4">
                   {myConsultations.map((c: Consultation) => (
                      <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between group">
                         <div className="flex items-center gap-5 mb-4 md:mb-0">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                               <UserCircle className="w-8 h-8" />
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-800 text-lg">{c.doctorName}</h4>
                               <p className="text-slate-500 font-medium">{c.hospitalName}</p>
                               <div className="flex gap-2 mt-2">
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{c.type}</span>
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{c.date}</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <StatusBadge status={c.status} />
                            <p className="text-sm font-bold text-slate-700 mt-2">{formatCurrency(c.amount)}</p>
                         </div>
                      </div>
                   ))}
                   {myConsultations.length === 0 && (
                      <div className="text-center py-20 bg-white/50 border border-dashed border-slate-300 rounded-2xl">
                         <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                         <p className="text-slate-500">No consultations found.</p>
                      </div>
                   )}
                </div>
             </div>
          )}
          
          {activeTab === 'rides' && (
             <div className="p-6 md:p-8 h-full overflow-y-auto max-w-5xl mx-auto w-full z-10 relative">
                <div className="flex justify-between items-center mb-8">
                   <div>
                      <h2 className="text-3xl font-bold text-slate-800">Emergency Rides</h2>
                      <p className="text-slate-500 mt-1">Ambulance and transport requests</p>
                   </div>
                   <button 
                      onClick={() => {setEmergencyMode(true); setActiveTab('ai')}} 
                      className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center gap-2 animate-pulse"
                   >
                      <Ambulance className="w-5 h-5"/> Request Now
                   </button>
                </div>
                <div className="space-y-4">
                   {myRides.map((r: Ride) => (
                      <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                               <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                                  <Ambulance className="w-7 h-7" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-800 text-lg">{r.vehicleType} Request</h4>
                                  <p className="text-xs text-slate-400 font-mono mt-1">{new Date(r.requestTime).toLocaleString()}</p>
                               </div>
                            </div>
                            <StatusBadge status={r.status} />
                         </div>
                         
                         <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                            {/* Connector Line */}
                            <div className="absolute left-[29px] top-8 bottom-8 w-0.5 border-l-2 border-dashed border-slate-300 z-0"></div>
                            
                            <div className="flex items-start gap-3 relative z-10">
                               <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-green-500 shadow-sm">
                                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                               </div>
                               <div>
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Pickup</p>
                                  <p className="text-sm font-semibold text-slate-700">{r.pickupLocation}</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-3 relative z-10">
                               <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-red-500 shadow-sm">
                                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                               </div>
                               <div>
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Dropoff</p>
                                  <p className="text-sm font-semibold text-slate-700">{r.dropLocation}</p>
                               </div>
                            </div>
                         </div>
                         
                         {r.driverName && (
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                               <p className="text-sm text-slate-500">Driver Assigned</p>
                               <p className="font-bold text-slate-800">{r.driverName}</p>
                            </div>
                         )}
                      </div>
                   ))}
                   {myRides.length === 0 && (
                      <div className="text-center py-20 bg-white/50 border border-dashed border-slate-300 rounded-2xl">
                         <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                         <p className="text-slate-500">No ride history.</p>
                      </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'pharmacy' && (
            <div className="h-full z-10 relative max-w-5xl mx-auto w-full">
               <PharmacyUserView orders={myOrders} onOrder={(items: string[]) => appActions.addOrder({patientId: user.id, patientName: user.name, items, totalAmount: 1250})} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon, label, active, onClick, alert }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-200' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    } ${alert ? 'animate-pulse ring-2 ring-red-500 ring-offset-2' : ''}`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
       {icon}
    </div>
    <span className={`font-medium hidden lg:block ${active ? 'text-white' : ''}`}>{label}</span>
    {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-l-full hidden lg:block"></div>}
  </button>
);

const ConsultationBooking = ({ user, onConfirm, onBack }: any) => {
  const [hospitalId, setHospitalId] = useState('h1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'Audio'|'Video'|'In-Person'>('Video');
  const [symptoms, setSymptoms] = useState('');

  const handleBook = () => {
    onConfirm({
      patientId: user.id,
      patientName: user.name,
      doctorName: 'Assigned Specialist',
      hospitalId,
      hospitalName: MOCK_HOSPITALS.find(h => h.id === hospitalId)?.name || 'Hospital',
      date,
      symptoms: symptoms || 'General Checkup',
      type,
      status: 'Pending',
      amount: type === 'Audio' ? 299 : type === 'Video' ? 499 : 899
    });
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 flex flex-col bg-white md:rounded-3xl shadow-xl">
      <div className="flex items-center gap-4 mb-8">
         <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronRight className="w-6 h-6 rotate-180 text-slate-500" /></button>
         <h2 className="text-2xl font-bold text-slate-800">Book Appointment</h2>
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-8">
         {/* Step 1: Hospital */}
         <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Select Hospital</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {MOCK_HOSPITALS.map(h => (
                  <button 
                     key={h.id} 
                     onClick={() => setHospitalId(h.id)}
                     className={`p-4 rounded-xl border-2 text-left transition-all ${hospitalId === h.id ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                  >
                     <div className="font-bold text-slate-800">{h.name}</div>
                     <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {h.location}</div>
                  </button>
               ))}
            </div>
         </div>

         {/* Step 2: Details */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Symptoms</label>
               <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={symptoms} 
                  onChange={e => setSymptoms(e.target.value)} 
                  placeholder="e.g. Headache, Fever" 
               />
            </div>
            <div className="space-y-2">
               <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Preferred Date</label>
               <input 
                  type="date" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
               />
            </div>
         </div>

         {/* Step 3: Type */}
         <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Consultation Type</label>
            <div className="grid grid-cols-3 gap-4">
               {[
                  { id: 'Audio', price: 299, icon: <Phone className="w-5 h-5"/> }, 
                  { id: 'Video', price: 499, icon: <Activity className="w-5 h-5"/> }, 
                  { id: 'In-Person', price: 899, icon: <User className="w-5 h-5"/> }
               ].map((t) => (
                  <button 
                     key={t.id} 
                     onClick={() => setType(t.id as any)} 
                     className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                        type === t.id 
                           ? 'border-blue-600 bg-blue-600 text-white shadow-lg' 
                           : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                     }`}
                  >
                     {t.icon}
                     <span className="font-bold text-sm">{t.id}</span>
                     <span className={`text-xs ${type === t.id ? 'text-blue-100' : 'text-slate-400'}`}>₹{t.price}</span>
                  </button>
               ))}
            </div>
         </div>

         <button 
            onClick={handleBook} 
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-xl active:scale-[0.99] mt-8"
         >
            Pay & Confirm Booking
         </button>
      </div>
    </div>
  );
};

const EmergencyBooking = ({ user, onConfirm, onBack }: any) => {
  const [vehicle, setVehicle] = useState<'Bike'|'Car'|'Ambulance'>('Ambulance');
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 flex flex-col bg-red-50/30 md:rounded-3xl shadow-xl relative overflow-hidden">
       {/* Pulse Effect Background */}
       <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-red-500/5 rounded-full animate-pulse pointer-events-none"></div>

       <div className="relative z-10 max-w-2xl mx-auto w-full h-full flex flex-col">
         <button onClick={onBack} className="self-start flex items-center text-slate-500 mb-8 hover:text-slate-800 transition">
            <ChevronRight className="w-5 h-5 rotate-180" /> Cancel
         </button>

         <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="text-center">
               <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <AlertCircle className="w-10 h-10 text-red-600" />
               </div>
               <h2 className="text-3xl font-bold text-slate-900">Emergency Dispatch</h2>
               <p className="text-slate-500 mt-2">Immediate response unit will be sent to your location.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100">
               <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Select Response Vehicle</label>
               <div className="grid grid-cols-3 gap-4">
                  {[
                     { id: 'Bike', time: '3m' }, 
                     { id: 'Car', time: '8m' }, 
                     { id: 'Ambulance', time: '12m' }
                  ].map(v => (
                     <button 
                        key={v.id} 
                        onClick={() => setVehicle(v.id as any)} 
                        className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                           vehicle === v.id 
                              ? 'border-red-600 bg-red-600 text-white shadow-lg scale-105' 
                              : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-white'
                        }`}
                     >
                        <span className="font-bold text-lg">{v.id}</span>
                        <span className={`text-xs ${vehicle === v.id ? 'text-red-100' : 'text-slate-400'}`}>{v.time} away</span>
                     </button>
                  ))}
               </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
               <div className="bg-blue-50 p-3 rounded-full text-blue-600"><MapPin className="w-6 h-6"/></div>
               <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Detected Location</p>
                  <p className="font-semibold text-slate-800">12.9716° N, 77.5946° E</p>
               </div>
            </div>

            <button 
               onClick={() => onConfirm({
                  patientId: user.id,
                  patientName: user.name,
                  vehicleType: vehicle,
                  pickupLocation: 'Current Location',
                  dropLocation: 'Nearest Hospital (Apollo)',
                  status: 'Requested',
                  requestTime: new Date(),
                  etaMinutes: vehicle === 'Bike' ? 3 : vehicle === 'Car' ? 8 : 12
               })} 
               className="w-full bg-red-600 text-white font-bold py-5 rounded-2xl hover:bg-red-700 text-xl shadow-xl shadow-red-300 animate-pulse transition-transform active:scale-95 flex items-center justify-center gap-3"
            >
               <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
               CONFIRM REQUEST
            </button>
         </div>
       </div>
    </div>
  )
}

const PharmacyUserView = ({ orders, onOrder }: any) => {
  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Pharmacy & Supplies</h2>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Prescription Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Pill className="w-32 h-32" />
           </div>
           
           <h3 className="text-2xl font-bold mb-2 relative z-10">Quick Prescription Order</h3>
           <p className="text-indigo-100 mb-8 max-w-sm relative z-10">Instantly order medicines prescribed in your last consultation with Dr. Sarah Smith.</p>
           
           <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-8 border border-white/20 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                 <FileText className="w-5 h-5 text-indigo-200" />
                 <span className="font-semibold">Prescription #8839</span>
              </div>
              <ul className="pl-8 list-disc text-sm text-indigo-100 space-y-1">
                 <li>Paracetamol 500mg (1 Strip)</li>
                 <li>Cough Syrup 100ml</li>
                 <li>Vitamin C Supplements</li>
              </ul>
           </div>

           <div className="flex items-center justify-between relative z-10">
              <div>
                 <p className="text-xs text-indigo-200 uppercase font-bold">Total Bill</p>
                 <p className="text-3xl font-bold">₹1,250</p>
              </div>
              <button 
                 onClick={() => onOrder(['Paracetamol 500mg', 'Cough Syrup', 'Vitamin C'])} 
                 className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg active:scale-95"
              >
                 Order Now
              </button>
           </div>
        </div>

        {/* History */}
        <div className="space-y-6">
           <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm">Recent Orders</h3>
           {orders.length > 0 ? orders.map((o: MedicineOrder) => (
             <div key={o.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Pill className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="font-bold text-slate-800">{o.items.length} Items</p>
                      <p className="text-xs text-slate-500">{new Date(o.date).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="text-right">
                   <StatusBadge status={o.status} />
                   <p className="text-sm font-bold text-slate-700 mt-1">{formatCurrency(o.totalAmount)}</p>
                </div>
             </div>
           )) : (
              <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                 <Pill className="w-8 h-8 mb-2 opacity-50" />
                 <p>No past orders found</p>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
const CodeVerification = ({ onVerify }: { onVerify: () => void }) => {
  const [inputCode, setInputCode] = useState("");

  const handleVerify = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    const userRef = doc(db, "accessCodes", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().code === inputCode) {
      onVerify();
    } else {
      alert("Invalid access code");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          Enter Permanent Access Code
        </h2>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        <button
          onClick={handleVerify}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Verify
        </button>
      </div>
    </div>
  );
};


// --- MAIN APP (STATE CONTAINER) ---

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.AUTH);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // SHARED STATE - "THE MOCK BACKEND"
  const [consultations, setConsultations] = useState<Consultation[]>(INITIAL_CONSULTATIONS);
  const [rides, setRides] = useState<Ride[]>([]);
  const [orders, setOrders] = useState<MedicineOrder[]>([]);

  // AUTH HANDLERS
  const handleLogin = () => setView(ViewState.ROLE_SELECTION);
  
  

const handleRoleSelect = async (role: Role) => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return;

  // Patient should NOT require code
  if (role === "user") {
    const realUser: UserType = { 
       id: firebaseUser.uid,
       name: firebaseUser.displayName || "User",
       email: firebaseUser.email || "",
       role 
    };

    setCurrentUser(realUser);
    setView(ViewState.DASHBOARD);
    return;
  }

  // For hospital, pharmacy, driver
  const userRef = doc(db, "accessCodes", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // First time → generate permanent code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    await setDoc(userRef, {
      email: firebaseUser.email,
      role,
      code: generatedCode,
      verified: false
    });

    alert(`Your permanent access code is: ${generatedCode}`);
    alert("In production this will be sent to your email.");
  }

  setView(ViewState.CODE_VERIFICATION);
};




  const handleLogout = async () => {
  const user = auth.currentUser;

  if (user) {
    await setDoc(doc(db, "activeUsers", user.uid), {
      email: user.email,
      isActive: false
    });
  }

  await signOut(auth);

  setCurrentUser(null);
  setView(ViewState.AUTH);
};


  // GLOBAL ACTIONS
  const addConsultation = (details: any) => setConsultations(prev => [...prev, { ...details, id: Date.now().toString() }]);
  const updateConsultation = (id: string, status: any) => setConsultations(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  
  const addRide = (details: any) => setRides(prev => [...prev, { ...details, id: Date.now().toString() }]);
  const updateRide = (id: string, status: any, driverName?: string) => setRides(prev => prev.map(r => r.id === id ? { ...r, status, driverName: driverName || r.driverName } : r));

  const addOrder = (details: any) => setOrders(prev => [...prev, { ...details, id: Date.now().toString(), status: 'Placed', date: new Date() }]);
  const updateOrder = (id: string, status: any) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  const handleCodeVerified = async () => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return;

  const userRef = doc(db, "accessCodes", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const role = userSnap.data().role;

  const realUser: UserType = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || "User",
    email: firebaseUser.email || "",
    role
  };

  setCurrentUser(realUser);
  setView(ViewState.DASHBOARD);
};

  // RENDER ROUTER
if (view === ViewState.AUTH)
  return <AuthScreen onLogin={handleLogin} />;

if (view === ViewState.ROLE_SELECTION)
  return <RoleSelection onSelectRole={handleRoleSelect} />;

// 🔴 ADD THIS BLOCK HERE
if (view === ViewState.CODE_VERIFICATION)
  return <CodeVerification onVerify={handleCodeVerified} />;

if (view === ViewState.DASHBOARD && currentUser) {
  if (currentUser.role === 'user')
    return <UserDashboard user={currentUser} onLogout={handleLogout} appState={{consultations, rides, orders}} appActions={{addConsultation, addRide, addOrder}} />;

  if (currentUser.role === 'hospital')
    return <HospitalDashboard consultations={consultations} rides={rides} onUpdateConsultation={updateConsultation} onLogout={handleLogout} />;

  if (currentUser.role === 'driver')
    return <DriverDashboard rides={rides} onUpdateRide={updateRide} driverName={currentUser.name} onLogout={handleLogout} />;

  if (currentUser.role === 'pharmacy')
    return <PharmacyDashboard orders={orders} onUpdateOrder={updateOrder} onLogout={handleLogout} />;
}

return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center animate-pulse">
    Loading MedX OS...
  </div>
);
}
