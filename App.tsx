import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { Student, LevelType, PointHistory, RewardItem, LEVELS, RewardRedemption } from './types';
import { determineLevel, generateUUID } from './utils';
import { StudentCard } from './components/StudentCard';
import { StudentModal } from './components/StudentModal';
import { Leaderboard } from './components/Leaderboard';
import { ClassSettingsModal } from './components/ClassSettingsModal';
import { AddStudentModal } from './components/AddStudentModal';
import { Settings, Plus, Upload, Download, Search, LayoutGrid, Users } from 'lucide-react';

const STORAGE_KEY = 'classpoint_manager_data';
const CLASS_NAME_KEY = 'classpoint_manager_classname';

const MOCK_DATA: Student[] = [];

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reasonModal, setReasonModal] = useState<{ isOpen: boolean, studentId: string | null, points: number }>({ isOpen: false, studentId: null, points: 0 });
  const [reasonInput, setReasonInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'leaderboard'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [className, setClassName] = useState('Lớp học của tôi');
  const [isClassSettingsOpen, setIsClassSettingsOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const savedStudents = localStorage.getItem(STORAGE_KEY);
    const savedClassName = localStorage.getItem(CLASS_NAME_KEY);
    
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents));
      } catch (e) {
        console.error("Failed to parse storage", e);
        setStudents(MOCK_DATA);
      }
    } else {
      setStudents(MOCK_DATA);
    }

    if (savedClassName) {
      setClassName(savedClassName);
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(CLASS_NAME_KEY, className);
  }, [className]);

  // Core Logic: Add Points
  const handleAddPoints = (studentId: string, amount: number, reason: string = '') => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;

      const newPoints = s.totalPoints + amount;
      const newLevel = determineLevel(newPoints);
      
      // Level Up Check
      if (newLevel !== s.level && amount > 0) {
         const levelOrder = ['seed', 'sprout', 'sapling', 'tree'];
         if (levelOrder.indexOf(newLevel) > levelOrder.indexOf(s.level)) {
             confetti({
                 particleCount: 150,
                 spread: 70,
                 origin: { y: 0.6 },
                 colors: ['#4CAF50', '#FFD700', '#FF3B30']
             });
         }
      }

      const log: PointHistory = {
        id: generateUUID(),
        date: new Date().toISOString(),
        change: amount,
        reason: reason || (amount > 0 ? 'Thưởng điểm nhanh' : 'Trừ điểm nhanh'),
        pointsAfter: newPoints
      };

      return {
        ...s,
        totalPoints: newPoints,
        level: newLevel,
        pointHistory: [...s.pointHistory, log]
      };
    }));
  };

  // Quick Action Handler
  const onQuickAction = (id: string, amount: number) => {
    if (amount < 0) {
      setReasonModal({ isOpen: true, studentId: id, points: amount });
      setReasonInput('');
    } else {
      handleAddPoints(id, amount, 'Thưởng nhanh');
    }
  };

  const submitReason = () => {
    if (reasonModal.studentId) {
      handleAddPoints(reasonModal.studentId, reasonModal.points, reasonInput || 'Trừ điểm');
      setReasonModal({ isOpen: false, studentId: null, points: 0 });
    }
  };

  const handleRedeemReward = (studentId: string, reward: RewardItem) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      if (s.totalPoints < reward.cost) return s;

      const newPoints = s.totalPoints - reward.cost;
      const newLevel = determineLevel(newPoints);

      const log: PointHistory = {
        id: generateUUID(),
        date: new Date().toISOString(),
        change: -reward.cost,
        reason: `Đổi quà: ${reward.name}`,
        pointsAfter: newPoints
      };

      const redemption: RewardRedemption = {
        id: generateUUID(),
        date: new Date().toISOString(),
        rewardName: reward.name,
        pointsSpent: reward.cost
      };

      return {
        ...s,
        totalPoints: newPoints,
        level: newLevel,
        pointHistory: [...s.pointHistory, log],
        rewardsRedeemed: [...s.rewardsRedeemed, redemption]
      };
    }));
    
    // Update the selected student in the modal as well to reflect changes immediately
    setSelectedStudent(prev => prev ? {...prev, totalPoints: prev.totalPoints - reward.cost} : null);
  };

  // Student Management
  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
  };

  const handleUpdateStudent = (studentId: string, newName: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(prev => prev ? { ...prev, name: newName } : null);
    }
  };

  const handleAddStudent = (name: string, orderNumber?: number) => {
    setStudents(prev => {
        // Simple logic to set orderNumber if not provided: last order + 1
        const maxOrder = prev.length > 0 ? Math.max(...prev.map(s => s.orderNumber || 0)) : 0;
        const newOrder = orderNumber !== undefined ? orderNumber : maxOrder + 1;

        return [...prev, {
            id: generateUUID(),
            name: name.trim(),
            orderNumber: newOrder,
            avatar: null,
            totalPoints: 0,
            level: 'seed',
            pointHistory: [],
            rewardsRedeemed: []
        }]
    });
  };

  // Class Management
  const handleDeleteClass = () => {
    setStudents([]);
    setClassName("Lớp học mới");
    setSelectedStudent(null);
  };

  // Excel Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const newStudents: Student[] = data.map((row: any, index: number) => {
        // Try to find name column
        const name = row['Tên'] || row['Họ và tên'] || row['Name'] || row['Student Name'] || row['Họ tên'];
        // Try to find STT column, otherwise use index + 1
        const stt = row['STT'] || row['Số thứ tự'] || row['No'] || row['Stt'] || (index + 1);

        if (!name) return null;

        return {
          id: generateUUID(),
          name: String(name).trim(),
          orderNumber: parseInt(stt) || (index + 1),
          avatar: null,
          totalPoints: 0,
          level: 'seed' as LevelType,
          pointHistory: [],
          rewardsRedeemed: []
        } as Student;
      }).filter((s): s is Student => s !== null && s.name !== 'Unknown' && s.name !== '');

      if (newStudents.length > 0) {
          if (confirm(`Tìm thấy ${newStudents.length} học sinh. Bạn có muốn thêm vào danh sách?`)) {
            setStudents(prev => [...prev, ...newStudents]);
          }
      } else {
          alert('Không tìm thấy cột "Tên" hoặc "Họ và tên" trong file Excel. Vui lòng kiểm tra lại.');
      }
    };
    reader.readAsBinaryString(file);
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  // Excel Export
  const handleExportData = () => {
    const data = students.map((s, index) => {
        // Calculate totals
        const totalPlus = s.pointHistory.filter(h => h.change > 0).reduce((sum, h) => sum + h.change, 0);
        const totalMinus = s.pointHistory.filter(h => h.change < 0).reduce((sum, h) => sum + Math.abs(h.change), 0);

        return {
            'STT': s.orderNumber || index + 1,
            'Tên học sinh': s.name,
            'Cấp độ': LEVELS[s.level].name,
            'Điểm hiện tại': s.totalPoints,
            'Tổng điểm cộng': totalPlus,
            'Tổng điểm trừ': totalMinus,
            'Số quà đã đổi': s.rewardsRedeemed.length
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh Sach Lop");
    
    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Danh_Sach_${className.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
  };

  const filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.totalPoints - a.totalPoints); // Default sort by points

  return (
    <div className="min-h-screen font-sans text-slate-800 pb-28">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-apple-green rounded-lg p-1.5 text-white shadow-sm">
               <LayoutGrid size={24} />
             </div>
             <div>
               <h1 className="font-display font-bold text-xl leading-none tracking-tight">ClassPoint</h1>
               <span className="text-xs text-gray-500 font-medium">{className}</span>
             </div>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Tìm kiếm học sinh..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-gray-50"
             />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'leaderboard' : 'grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'leaderboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
              title={viewMode === 'grid' ? "Xem bảng xếp hạng" : "Xem lưới"}
            >
              {viewMode === 'grid' ? <Users size={20} /> : <LayoutGrid size={20} />}
            </button>
            <button 
              onClick={() => setIsClassSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              title="Cài đặt lớp"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {viewMode === 'leaderboard' ? (
          <Leaderboard students={students} />
        ) : (
          students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <Users size={48} />
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có học sinh nào</h3>
               <p className="text-gray-500 max-w-sm mb-8">Hãy bắt đầu bằng cách thêm học sinh hoặc nhập danh sách từ file Excel.</p>
               <div className="flex gap-3 justify-center">
                   <button onClick={() => setIsAddStudentModalOpen(true)} className="px-6 py-3 bg-apple-blue text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all transform hover:-translate-y-1">
                      Thêm học sinh đầu tiên
                   </button>
                   <label className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2">
                      <Upload size={18} /> Import Excel
                      <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="hidden" />
                   </label>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStudents.map(student => (
                <StudentCard 
                  key={student.id} 
                  student={student} 
                  onQuickAction={onQuickAction}
                  onClick={setSelectedStudent}
                />
              ))}
              
              {/* Add Student Card */}
              <button 
                onClick={() => setIsAddStudentModalOpen(true)}
                className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-200 rounded-3xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus size={32} />
                </div>
                <span className="font-semibold text-gray-400 group-hover:text-blue-500">Thêm học sinh</span>
              </button>
            </div>
          )
        )}

      </main>

      {/* Floating Action Bar (Footer) */}
      {students.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl px-2 py-2 flex items-center gap-1 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
           <button onClick={() => setIsAddStudentModalOpen(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl font-medium text-sm transition-colors text-gray-700">
              <Plus size={18} /> <span className="hidden sm:inline">Thêm HS</span>
           </button>
           <div className="w-px h-6 bg-gray-200 mx-1"></div>
           <label className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl font-medium text-sm transition-colors cursor-pointer text-gray-700" title="Yêu cầu cột 'Tên' và tùy chọn 'STT'">
              <Upload size={18} /> <span className="hidden sm:inline">Import Excel</span>
              <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="hidden" />
           </label>
           <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl font-medium text-sm transition-colors text-gray-700">
              <Download size={18} /> <span className="hidden sm:inline">Export Data</span>
           </button>
        </div>
      )}

      {/* Modals */}
      {selectedStudent && (
        <StudentModal 
          student={selectedStudent} 
          isOpen={!!selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          onRedeem={handleRedeemReward}
          onDelete={handleDeleteStudent}
          onUpdate={handleUpdateStudent}
        />
      )}

      <ClassSettingsModal
        isOpen={isClassSettingsOpen}
        onClose={() => setIsClassSettingsOpen(false)}
        className={className}
        onUpdateClassName={setClassName}
        onDeleteClass={handleDeleteClass}
      />

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onAdd={handleAddStudent}
      />

      {/* Reason Modal */}
      {reasonModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setReasonModal({ ...reasonModal, isOpen: false })} />
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Nhập lý do trừ điểm</h3>
              <input 
                autoFocus
                type="text" 
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="VD: Không làm bài tập, Nói chuyện riêng..."
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && submitReason()}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setReasonModal({ ...reasonModal, isOpen: false })} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
                <button 
                  onClick={submitReason}
                  disabled={!reasonInput.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  Xác nhận (-{Math.abs(reasonModal.points)})
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

export default App;