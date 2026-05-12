import React, { useState, useRef } from 'react';
import { Paperclip, Smile, Send, ImageIcon, X, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
  onSendImage: (files: File[]) => void; // Đổi từ File thành File[]
  disabled?: boolean;
  isSending?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSend, 
  onSendImage, 
  disabled = false,
  isSending = false 
}) => {
  const [text, setText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý chọn nhiều file ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Validate files
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} không phải là ảnh`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} vượt quá 5MB`);
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;
    
    // Tạo preview cho tất cả ảnh
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setSelectedImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...previews]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Xóa một ảnh đã chọn
  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (disabled || isSending) return;
    
    // Ưu tiên gửi ảnh nếu có
    if (selectedImages.length > 0) {
      onSendImage(selectedImages); // Gửi cả mảng files
      // Clear previews sau khi gửi
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      setSelectedImages([]);
      setImagePreviews([]);
    } 
    // Gửi text nếu có
    else if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled && !isSending && selectedImages.length === 0) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t bg-white">
      {/* Input file ẩn - cho phép chọn nhiều file */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple  // THÊM DÒNG NÀY - cho phép chọn nhiều ảnh
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isSending}
      />

      {/* Preview nhiều ảnh */}
      {imagePreviews.length > 0 && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg">
          <div className="flex gap-2 flex-wrap">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative inline-block">
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                  disabled={isSending}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {selectedImages.length} ảnh đã chọn
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-1">
        {/* Nút đính kèm ảnh */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
          className={`p-2 transition ${
            disabled || isSending ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-red-600'
          }`}
          title="Chọn ảnh (có thể chọn nhiều)"
        >
          <ImageIcon size={20} />
        </button>

        {/* Ô nhập liệu */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending || selectedImages.length > 0}
          placeholder={selectedImages.length > 0 ? `Đã chọn ${selectedImages.length} ảnh, nhấn gửi để upload` : isSending ? "Đang gửi..." : disabled ? "Cuộc hội thoại đã kết thúc..." : "Nhập tin nhắn..."}
          className="flex-1 bg-transparent py-2 px-2 outline-none text-sm text-slate-700 disabled:cursor-not-allowed"
        />

        {/* Nút gửi */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && selectedImages.length === 0) || disabled || isSending}
          className={`p-2 rounded-full transition-all ${
            (text.trim() || selectedImages.length > 0) && !disabled && !isSending
              ? 'text-red-600 hover:bg-red-50' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          {isSending ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Send size={22} fill={(text.trim() || selectedImages.length > 0) && !disabled && !isSending ? "currentColor" : "none"} />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;