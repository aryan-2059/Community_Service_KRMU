import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, Users, FileText, CheckCircle,
  GraduationCap, LogOut, Clapperboard, CalendarDays,
  ShieldCheck, School, UserCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { user, isTeacher, isStudent, isPrincipal, logout } = useAuth();

  const teacherLinks = [
    { name: 'Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Classrooms', to: '/teacher/classrooms', icon: Users },
    { name: 'Quiz Builder', to: '/teacher/quizzes/new', icon: FileText },
    { name: 'Revision Studio', to: '/teacher/revision', icon: Clapperboard },
    { name: 'Meetings', to: '/meetings', icon: CalendarDays },
  ];

  const studentLinks = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Classrooms', to: '/student/classrooms', icon: GraduationCap },
    { name: 'Question Tracker', to: '/student/tracker', icon: CheckCircle },
    { name: 'Revision Feed', to: '/student/revision', icon: Clapperboard },
    { name: 'Meetings', to: '/meetings', icon: CalendarDays },
  ];

  const principalLinks = [
    { name: 'Dashboard', to: '/principal/dashboard', icon: ShieldCheck },
    { name: 'Teachers', to: '/principal/teachers', icon: UserCheck },
    { name: 'Students', to: '/principal/students', icon: GraduationCap },
    { name: 'Classrooms', to: '/principal/classrooms', icon: School },
    { name: 'Meetings', to: '/meetings', icon: CalendarDays },
  ];

  const links = isPrincipal ? principalLinks : isTeacher ? teacherLinks : isStudent ? studentLinks : [];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const roleBadge = isPrincipal ? 'Principal Portal' : isTeacher ? 'Teacher Portal' : 'Student Portal';
  const roleColor = isPrincipal ? 'text-teal-400' : isTeacher ? 'text-indigo-400' : 'text-violet-400';

  return (
    <div className="w-64 bg-[#0f172a] text-white h-screen fixed left-0 top-0 flex flex-col z-20">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-[#4338ca] flex items-center justify-center">
          <BookOpen className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-wide">EduTrack</span>
      </div>

      {/* Role badge */}
      <div className="px-6 py-3">
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${roleColor}`}>
          {roleBadge}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-[#4338ca] text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <link.icon className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-[#4338ca] flex items-center justify-center text-xs font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
