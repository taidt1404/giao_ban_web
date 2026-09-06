import { Trash2, Plus, CopyPlus } from 'lucide-react';
import type { FreeTextSlideData } from '../data/freeTextReport';

type Props = {
  data: FreeTextSlideData;
  slideNumber: number;
  totalSlides: number;
  canDeleteSlide: boolean;
  onChange: (next: FreeTextSlideData) => void;
  onAddNewSlide: () => void;
  onDeleteSlide: () => void;
};

export default function EditorPanelFreeText({
  data,
  slideNumber,
  canDeleteSlide,
  onChange,
  onAddNewSlide,
  onDeleteSlide,
}: Props) {
  function handleTitleChange(title: string) {
    onChange({
      ...data,
      title,
    });
  }

  function handleItemChange(index: number, content: string) {
    const list = [...data.items];
    list[index] = {
      ...list[index],
      content,
    };
    onChange({
      ...data,
      items: list,
    });
  }

  function handleAddItem() {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      content: '',
    };
    onChange({
      ...data,
      items: [...data.items, newItem],
    });
  }

  function handleDeleteItem(index: number) {
    const list = data.items.filter((_, i) => i !== index);
    onChange({
      ...data,
      items: list,
    });
  }

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">SLIDE {slideNumber} — VĂN BẢN TỰ DO</span>
          <h2>Soạn thảo nội dung</h2>
        </div>
        {canDeleteSlide && (
          <button
            type="button"
            className="secondary-button delete-slide-btn"
            onClick={onDeleteSlide}
            title="Xóa slide này"
          >
            <Trash2 size={14} />
            Xóa slide
          </button>
        )}
      </div>

      <div className="form-grid">
        {/* Tiêu đề slide */}
        <div className="field-group full">
          <label>Tiêu đề slide</label>
          <input
            type="text"
            value={data.title}
            placeholder="VD: IV. BỆNH NHÂN CHUYỂN VIỆN NGOẠI TRÚ"
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        {/* Danh sách các mục */}
        <div className="field-group full" style={{ marginTop: '8px' }}>
          <div className="field-label-row">
            <label style={{ fontSize: '13px', color: '#102a57' }}>
              Danh sách ca bệnh / nội dung ({data.items.length} mục)
            </label>
            <button
              type="button"
              className="mini-button primary-mini-btn"
              onClick={handleAddItem}
            >
              <Plus size={13} /> Thêm mục {data.items.length + 1}
            </button>
          </div>

          <div className="freetext-items-stack">
            {data.items.map((item, index) => (
              <div className="freetext-item-card" key={item.id}>
                <div className="freetext-item-header">
                  <span className="font-bold">Mục {index + 1},</span>
                  <button
                    type="button"
                    className="icon-button"
                    title={`Xóa mục ${index + 1}`}
                    onClick={() => handleDeleteItem(index)}
                  >
                    ×
                  </button>
                </div>
                <textarea
                  className="freetext-textarea"
                  rows={4}
                  value={item.content}
                  placeholder={`Dòng 1: HỌ TÊN TUỔI, Địa chỉ...\nDòng 2: CĐ: Chẩn đoán...\nDòng 3: Nơi chuyển viện / Ghi chú...`}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            className="secondary-button add-item-btn-wide"
            onClick={handleAddItem}
          >
            <Plus size={15} /> Thêm mục {data.items.length + 1}...
          </button>
        </div>

        {/* Nút tạo thêm slide mới */}
        <div className="field-group full" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
          <button
            type="button"
            className="primary-button create-new-slide-btn"
            onClick={onAddNewSlide}
            title="Tạo thêm 1 slide văn bản tự do mới (Slide 6, 7...)"
          >
            <CopyPlus size={16} />
            + Tạo thêm 1 slide mới theo mẫu này
          </button>
        </div>
      </div>
    </section>
  );
}
