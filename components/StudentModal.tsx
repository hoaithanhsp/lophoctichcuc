import React, { useState, useEffect } from 'react';
import { Student, RewardItem, DEFAULT_REWARDS, LEVELS } from '../types';
import { formatDate } from '../utils';
import { X, History, Gift, TrendingUp, AlertCircle, Trash2, Pencil, Check } from 'lucide-react';

interface StudentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (studentId: string, reward: RewardItem) => void;
  onDelete: (studentId: string) => void;
  onUpdate: (studentId: string, newName: string) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ student, isOpen, onClose, onRedeem, onDelete, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'rewards' | 'stats'>('history');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student.name);

  // Reset state when student changes
  useEffect(() => {
    setEditName(student.name);
    setIsEditing(false);
  }, [student]);

  if (!isOpen) return null;

  const totalAdded = student.pointHistory.filter(h => h.change > 0).reduce((acc, curr) => acc + curr.change, 0);
  const totalDeducted = student.pointHistory.filter(h => h.change < 0).reduce((acc, curr) => acc + Math.abs(curr.change), 0);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdate(student.id, editName.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh ${student.name}? Hành động này không thể hoàn tác.`)) {
      onDelete(student.id);
      onClose(); // Close modal immediately as student doesn't exist anymore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 flex-shrink-0">
               {student.avatar ? <img src={student.avatar} className="w-full h-full rounded-full object-cover" /> : student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="font-display font-bold text-xl text-gray-800 border-b-2 border-blue-500 outline-none bg-transparent w-full"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button onClick={handleSaveName} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-2xl font-bold text-gray-800 font-display truncate">{student.name}</h2>
                  <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-500 transition-all rounded-lg hover:bg-blue-50">
                    <Pencil size={16} />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-sm flex items-center gap-1">
                   {LEVELS[student.level].icon} {LEVELS[student.level].name}
                </span>
                <span className="font-semibold text-apple-green text-lg">{student.totalPoints} điểm</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
             {!isEditing && (
               <button onClick={handleDelete} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-400" title="Xóa học sinh">
                 <Trash2 size={20} />
               </button>
             )}
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
               <X size={24} />
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-2 border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'history' ? 'text-apple-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Lịch sử điểm
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'rewards' ? 'text-apple-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Đổi quà
            {activeTab === 'rewards' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'stats' ? 'text-apple-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Thống kê
            {activeTab === 'stats' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue rounded-t-full" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-[300px]">
          
          {activeTab === 'history' && (
            <div className="space-y-3">
              {student.pointHistory.length === 0 ? (
                 <div className="text-center py-10 text-gray-400">Chưa có lịch sử điểm</div>
              ) : (
                [...student.pointHistory].reverse().map(log => (
                  <div key={log.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full ${log.change > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium text-gray-800">{log.reason || (log.change > 0 ? 'Thưởng điểm' : 'Trừ điểm')}</p>
                        <p className="text-xs text-gray-400">{formatDate(log.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`font-bold text-lg ${log.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                         {log.change > 0 ? '+' : ''}{log.change}
                       </span>
                       <p className="text-xs text-gray-400">Sau: {log.pointsAfter}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEFAULT_REWARDS.map(reward => {
                const canRedeem = student.totalPoints >= reward.cost;
                return (
                  <div key={reward.id} className={`bg-white p-4 rounded-xl border transition-all ${canRedeem ? 'border-gray-200 hover:border-blue-300 hover:shadow-md' : 'border-gray-100 opacity-60 grayscale'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-4xl">{reward.icon}</span>
                      <span className="font-bold text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-600">{reward.cost} điểm</span>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">{reward.name}</h4>
                    <p className="text-xs text-gray-500 mb-4 h-8">{reward.description}</p>
                    <button
                      onClick={() => {
                        if (confirm(`Đổi "${reward.name}" với giá ${reward.cost} điểm cho ${student.name}?`)) {
                          onRedeem(student.id, reward);
                        }
                      }}
                      disabled={!canRedeem}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                        canRedeem 
                          ? 'bg-apple-blue text-white hover:bg-blue-600 shadow-sm' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem ? 'Đổi quà' : 'Không đủ điểm'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2">
                    <TrendingUp size={20} />
                  </div>
                  <span className="text-gray-500 text-sm">Tổng điểm cộng</span>
                  <span className="text-2xl font-bold text-gray-800">{totalAdded}</span>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
                    <AlertCircle size={20} />
                  </div>
                  <span className="text-gray-500 text-sm">Tổng điểm trừ</span>
                  <span className="text-2xl font-bold text-gray-800">{totalDeducted}</span>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center col-span-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
                    <Gift size={20} />
                  </div>
                  <span className="text-gray-500 text-sm">Quà đã đổi</span>
                  <span className="text-2xl font-bold text-gray-800">{student.rewardsRedeemed.length}</span>
                  <div className="mt-2 text-xs text-gray-400">
                     {student.rewardsRedeemed.slice(0, 3).map(r => r.rewardName).join(', ')} 
                     {student.rewardsRedeemed.length > 3 && '...'}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};