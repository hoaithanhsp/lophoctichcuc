import React from 'react';
import { Student, LEVELS } from '../types';
import { calculateProgress, getNextLevel } from '../utils';
import { Plus, Minus, MoreHorizontal } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onQuickAction: (id: string, amount: number) => void;
  onClick: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onQuickAction, onClick }) => {
  const levelConfig = LEVELS[student.level];
  const nextLevelKey = getNextLevel(student.level);
  const nextLevelConfig = nextLevelKey ? LEVELS[nextLevelKey] : null;
  const progress = calculateProgress(student.totalPoints, student.level);

  // Helper to generate initials avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div 
      className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative group cursor-pointer"
      onClick={() => onClick(student)}
    >
      {/* Header: Level & Name */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-50" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-apple-blue font-bold text-xl border-2 border-white shadow-inner">
                {getInitials(student.name)}
              </div>
            )}
            <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-xl border border-gray-50 z-10 ${levelConfig.color}`}>
              {levelConfig.icon}
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-800 text-lg leading-tight group-hover:text-apple-blue transition-colors">
              {student.name}
            </h3>
            <p className={`font-semibold text-2xl mt-1 ${student.totalPoints < 0 ? 'text-red-500' : 'text-apple-green'}`}>
              {student.totalPoints} <span className="text-xs text-gray-400 font-normal">điểm</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
          <span>{levelConfig.name}</span>
          {nextLevelConfig && (
            <span>Còn {progress.pointsNeeded} → {nextLevelConfig.name}</span>
          )}
          {!nextLevelConfig && <span className="text-amber-500">Max Level!</span>}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="h-full bg-apple-green rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* Quick Actions (Stop propagation to prevent opening modal) */}
      <div className="grid grid-cols-2 gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1 justify-between bg-green-50 rounded-xl p-1.5 border border-green-100">
           <button onClick={() => onQuickAction(student.id, 1)} className="flex-1 h-8 rounded-lg hover:bg-white hover:shadow-sm text-green-600 font-bold text-xs transition-all flex items-center justify-center">+1</button>
           <button onClick={() => onQuickAction(student.id, 2)} className="flex-1 h-8 rounded-lg hover:bg-white hover:shadow-sm text-green-600 font-bold text-xs transition-all flex items-center justify-center">+2</button>
           <button onClick={() => onQuickAction(student.id, 5)} className="flex-1 h-8 rounded-lg hover:bg-white hover:shadow-sm text-green-600 font-bold text-xs transition-all flex items-center justify-center">+5</button>
        </div>
        <div className="flex gap-1 justify-between bg-red-50 rounded-xl p-1.5 border border-red-100">
           <button onClick={() => onQuickAction(student.id, -1)} className="flex-1 h-8 rounded-lg hover:bg-white hover:shadow-sm text-red-500 font-bold text-xs transition-all flex items-center justify-center">-1</button>
           <button onClick={() => onQuickAction(student.id, -2)} className="flex-1 h-8 rounded-lg hover:bg-white hover:shadow-sm text-red-500 font-bold text-xs transition-all flex items-center justify-center">-2</button>
           <button onClick={() => onQuickAction(student.id, -5)} className="flex-1 h-8 rounded-lg hover:bg-white hover:shadow-sm text-red-500 font-bold text-xs transition-all flex items-center justify-center">-5</button>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
        <MoreHorizontal size={20} />
      </div>
    </div>
  );
};