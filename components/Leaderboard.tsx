import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Student, LEVELS } from '../types';
import { Download, Medal } from 'lucide-react';

interface LeaderboardProps {
  students: Student[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ students }) => {
  const [filter, setFilter] = useState<'all' | 'month' | 'week'>('all');

  // For this demo, we'll just sort by total points as the "all time" filter is primary. 
  // Implementing week/month requires checking pointHistory dates against current week/month.
  // For simplicity in this UI demo, we will sort the students list by current total points.
  
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10);
  }, [students, filter]);

  const handleExport = () => {
    const data = sortedStudents.map((s, index) => ({
      'Hạng': index + 1,
      'Tên học sinh': s.name,
      'Cấp độ': LEVELS[s.level].name,
      'Điểm số': s.totalPoints,
      'Quà đã đổi': s.rewardsRedeemed.length
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Top 10");
    XLSX.writeFile(wb, "Bang_Xep_Hang_ClassPoint.xlsx");
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <span className="text-2xl">🥇</span>;
    if (index === 1) return <span className="text-2xl">🥈</span>;
    if (index === 2) return <span className="text-2xl">🥉</span>;
    return <span className="font-bold text-gray-400 w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-display text-gray-800 flex items-center gap-2">
           <Medal className="text-yellow-500" /> Bảng Xếp Hạng
        </h2>
        <div className="flex gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setFilter('week')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${filter === 'week' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Tuần</button>
                <button onClick={() => setFilter('month')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${filter === 'month' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Tháng</button>
                <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Tất cả</button>
            </div>
            <button onClick={handleExport} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Download size={20} />
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="pb-3 text-sm font-semibold text-gray-400 pl-4 w-16">Hạng</th>
              <th className="pb-3 text-sm font-semibold text-gray-400">Học sinh</th>
              <th className="pb-3 text-sm font-semibold text-gray-400">Level</th>
              <th className="pb-3 text-sm font-semibold text-gray-400 text-right pr-4">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student, index) => (
              <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                <td className="py-3 pl-4">
                  {getRankIcon(index)}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {student.avatar ? <img src={student.avatar} className="w-full h-full rounded-full" /> : student.name.charAt(0)}
                     </div>
                     <span className="font-semibold text-gray-700">{student.name}</span>
                  </div>
                </td>
                <td className="py-3">
                   <span className="text-xl">{LEVELS[student.level].icon}</span>
                </td>
                <td className="py-3 text-right pr-4">
                  <span className="font-bold text-apple-green">{student.totalPoints}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};