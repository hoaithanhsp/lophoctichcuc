import React, { useState, useEffect } from 'react';
import { X, Trash2, Save } from 'lucide-react';

interface ClassSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  onUpdateClassName: (name: string) => void;
  onDeleteClass: () => void;
}

export const ClassSettingsModal: React.FC<ClassSettingsModalProps> = ({
  isOpen,
  onClose,
  className,
  onUpdateClassName,
  onDeleteClass
}) => {
  const [name, setName] = useState(className);

  useEffect(() => {
    setName(className);
  }, [className, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdateClassName(name);
    onClose();
  };

  const handleDelete = () => {
    if (confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa lớp học này?\n\nTất cả dữ liệu học sinh, điểm số và lịch sử sẽ bị xóa vĩnh viễn và không thể khôi phục.")) {
      onDeleteClass();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 font-display">Cài đặt Lớp học</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Tên lớp</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-800"
              placeholder="Nhập tên lớp..."
              autoFocus
            />
          </div>

          <div className="pt-2">
             <button 
                onClick={handleSave}
                disabled={!name.trim()}
                className="w-full bg-apple-blue text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors shadow-sm mb-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Save size={18} /> Lưu thay đổi
             </button>
             
             <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-bold text-red-500 uppercase mb-2 tracking-wider">Vùng nguy hiểm</h3>
                <button 
                    onClick={handleDelete}
                    className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} /> Xóa lớp học & Dữ liệu
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};