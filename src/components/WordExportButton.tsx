import React, { useState, useRef, useEffect } from 'react';
import { FileDown, Loader2, ChevronDown, FileText, Layers, Check } from 'lucide-react';

interface WordExportButtonProps {
  onExport: (continuous: boolean) => Promise<void>;
  isExporting: boolean;
  totalSlideCount?: number;
  className?: string;
}

export const WordExportButton: React.FC<WordExportButtonProps> = ({
  onExport,
  isExporting,
  totalSlideCount = 8,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMainClick = () => {
    // Mặc định là in nối tiếp tiết kiệm giấy
    onExport(true);
  };

  const handleSelectOption = (continuous: boolean) => {
    setIsOpen(false);
    onExport(continuous);
  };

  return (
    <div className={`word-export-group ${className}`} ref={containerRef}>
      <button
        type="button"
        className="secondary-button word-btn word-main-btn"
        onClick={handleMainClick}
        disabled={isExporting}
        title="Tải toàn bộ báo cáo Word (In nối tiếp - Tiết kiệm giấy)"
      >
        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        <span>Xuất Word</span>
      </button>

      <button
        type="button"
        className={`secondary-button word-btn word-caret-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isExporting}
        title="Chọn kiểu định dạng trang xuất Word"
        aria-expanded={isOpen}
      >
        <ChevronDown size={14} className={`caret-icon ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="word-export-menu" role="menu">
          <div className="word-menu-header">Tuỳ chọn trang in Word</div>
          <button
            type="button"
            className="word-menu-item active"
            onClick={() => handleSelectOption(true)}
            role="menuitem"
          >
            <div className="word-item-icon">
              <FileText size={16} className="text-success" />
            </div>
            <div className="word-item-content">
              <div className="word-item-title">
                <span>In nối tiếp (Tiết kiệm giấy)</span>
                <span className="recommended-badge">Khuyên dùng</span>
              </div>
              <div className="word-item-desc">
                Các mục nối liền, chỉ sang trang khi đầy A4 (~2-3 trang)
              </div>
            </div>
            <Check size={16} className="word-item-check" />
          </button>

          <button
            type="button"
            className="word-menu-item"
            onClick={() => handleSelectOption(false)}
            role="menuitem"
          >
            <div className="word-item-icon">
              <Layers size={16} />
            </div>
            <div className="word-item-content">
              <div className="word-item-title">Mỗi slide 1 trang riêng</div>
              <div className="word-item-desc">
                Ngắt trang sau mỗi slide ({totalSlideCount} trang riêng biệt)
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default WordExportButton;
