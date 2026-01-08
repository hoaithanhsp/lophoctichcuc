import { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportExcelModalProps {
  onClose: () => void;
  onImport: (students: { name: string; orderNumber: number; className?: string }[]) => Promise<void>;
}

export default function ImportExcelModal({ onClose, onImport }: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ name: string; orderNumber: number; className?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const data = await selectedFile.arrayBuffer();
      // Use type: 'array' for robust ArrayBuffer handling
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData.length === 0) {
        throw new Error("File Excel trống hoặc không có dữ liệu.");
      }

      const findKey = (row: any, keywords: string[]) => {
        const keys = Object.keys(row);
        return keys.find(k => 
          keywords.some(keyword => k.toLowerCase().includes(keyword))
        );
      };

      const nameKeywords = ['tên', 'họ và tên', 'họ tên', 'name', 'student', 'học sinh'];
      const orderKeywords = ['stt', 'số thứ tự', 'no', 'order', 'id'];
      const classKeywords = ['lớp', 'class', 'grade', 'phòng'];

      const firstRow = jsonData[0];
      const nameKey = findKey(firstRow, nameKeywords);
      const orderKey = findKey(firstRow, orderKeywords);
      const classKey = findKey(firstRow, classKeywords);

      if (!nameKey) {
        throw new Error("Không tìm thấy cột Tên học sinh. Vui lòng đảm bảo file có cột 'Tên', 'Họ và tên' hoặc 'Name'.");
      }

      const students = jsonData.map((row: any, index) => {
        const rawName = row[nameKey];
        const rawOrder = orderKey ? row[orderKey] : undefined;
        const rawClass = classKey ? row[classKey] : undefined;

        if (!rawName || String(rawName).trim() === '') return null;

        return { 
          name: String(rawName).trim(), 
          orderNumber: rawOrder ? parseInt(String(rawOrder).replace(/\D/g, '')) || (index + 1) : (index + 1),
          className: rawClass ? String(rawClass).trim() : undefined
        };
      }).filter((s): s is { name: string; orderNumber: number; className?: string } => s !== null);

      if (students.length === 0) {
        throw new Error("Không tìm thấy dữ liệu học sinh hợp lệ.");
      }

      setPreview(students);
    } catch (err: any) {
      console.error('Error parsing Excel:', err);
      setError(err.message || 'Lỗi đọc file Excel! Vui lòng kiểm tra lại định dạng file.');
      setFile(null);
      setPreview([]);
    } finally {
      setLoading(false);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setLoading(true);
    try {
      await onImport(preview);
      onClose();
    } catch (err) {
      console.error('Error importing students:', err);
      setError('Có lỗi xảy ra khi lưu dữ liệu. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Danh Sách Excel</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="import-instructions">
            <p><strong>Hướng dẫn:</strong></p>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', listStyleType: 'disc' }}>
              <li>Bắt buộc: Cột chứa tên (VD: "Họ và tên", "Tên").</li>
              <li>Tùy chọn: Cột "Lớp" (hệ thống sẽ tự tạo lớp nếu chưa có).</li>
              <li>Tùy chọn: Cột "STT".</li>
            </ul>
          </div>

          <div className="file-upload-area">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              id="fileInput"
              style={{ display: 'none' }}
              disabled={loading}
            />
            <label htmlFor="fileInput" className="file-upload-button">
              <Upload size={24} />
              {file ? (
                <span className="text-primary-green font-semibold">{file.name}</span>
              ) : (
                'Chọn file Excel từ máy tính'
              )}
            </label>
          </div>

          {error && (
            <div className="error-message flex items-center gap-2 mb-4">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {preview.length > 0 && (
            <div className="preview-section">
              <div className="flex justify-between items-center mb-3">
                <h3 className="m-0 flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-green-600"/> 
                  Xem trước ({preview.length} học sinh)
                </h3>
              </div>
              
              <div className="preview-list">
                {preview.slice(0, 50).map((student, index) => (
                  <div key={index} className="preview-item">
                    <span className="preview-number">{student.orderNumber}</span>
                    <span className="preview-name">{student.name}</span>
                    {student.className && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium ml-2">
                        {student.className}
                      </span>
                    )}
                  </div>
                ))}
                {preview.length > 50 && (
                  <div className="preview-more">
                    ... và {preview.length - 50} học sinh khác
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button onClick={onClose} className="btn-secondary" disabled={loading}>
                  Hủy
                </button>
                <button onClick={handleImport} className="btn-primary" disabled={loading}>
                  {loading ? 'Đang xử lý...' : `Lưu ${preview.length} học sinh`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}