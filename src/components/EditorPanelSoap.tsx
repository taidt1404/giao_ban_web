import { Trash2, Plus, CopyPlus } from 'lucide-react';
import type { SoapSlideData, SoapTimelineRow } from '../data/soapReport';

type Props = {
  data: SoapSlideData;
  slideNumber: number;
  canDeleteSlide: boolean;
  onChange: (next: SoapSlideData) => void;
  onAddNewSlide: () => void;
  onDeleteSlide: () => void;
};

export default function EditorPanelSoap({
  data,
  slideNumber,
  canDeleteSlide,
  onChange,
  onAddNewSlide,
  onDeleteSlide,
}: Props) {
  function handleHeaderChange(patientHeader: string) {
    onChange({
      ...data,
      patientHeader,
    });
  }

  function handleRowFieldChange(
    rowIndex: number,
    field: keyof Omit<SoapTimelineRow, 'id'>,
    value: string,
  ) {
    const rows = [...data.rows];
    rows[rowIndex] = {
      ...rows[rowIndex],
      [field]: value,
    };
    onChange({
      ...data,
      rows,
    });
  }

  function handleAddRow() {
    const newRow: SoapTimelineRow = {
      id: `row-${Date.now()}`,
      timeText: '22/08/2026\n22:00',
      progression: '',
      orders: '',
    };
    onChange({
      ...data,
      rows: [...data.rows, newRow],
    });
  }

  function handleDeleteRow(rowIndex: number) {
    if (data.rows.length <= 1) {
      alert('Slide ca bệnh cần ít nhất 1 mốc thời gian diễn biến!');
      return;
    }
    const rows = data.rows.filter((_, i) => i !== rowIndex);
    onChange({
      ...data,
      rows,
    });
  }

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">SLIDE {slideNumber} — BÁO CÁO CA BỆNH</span>
          <h2>Diễn biến & Chỉ định (SOAP)</h2>
        </div>
        {canDeleteSlide && (
          <button
            type="button"
            className="secondary-button delete-slide-btn"
            onClick={onDeleteSlide}
            title="Xóa slide ca bệnh này"
          >
            <Trash2 size={14} />
            Xóa slide
          </button>
        )}
      </div>

      <div className="form-grid">
        {/* Tiêu đề ca bệnh */}
        <div className="field-group full">
          <label>Tiêu đề ca bệnh (Họ tên, tuổi, khoa...)</label>
          <input
            type="text"
            value={data.patientHeader}
            placeholder="VD: 1, ĐỖ THỊ SONG    66 tuổi"
            onChange={(e) => handleHeaderChange(e.target.value)}
          />
        </div>

        {/* Các dòng diễn biến thời gian */}
        {data.rows.map((row, rIndex) => (
          <div
            className="field-group full"
            key={row.id}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span className="font-bold" style={{ fontSize: '12px', color: '#1e3a8a' }}>
                Mốc diễn biến #{rIndex + 1}
              </span>
              {data.rows.length > 1 && (
                <button
                  type="button"
                  className="icon-button"
                  title="Xóa mốc này"
                  onClick={() => handleDeleteRow(rIndex)}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Thời gian (Ngày, giờ)
              </label>
              <textarea
                rows={2}
                value={row.timeText}
                placeholder="VD: 22/08/2026&#10;20:20"
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
                onChange={(e) => handleRowFieldChange(rIndex, 'timeText', e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Diễn biến bệnh (Cấu trúc SOAP: Tiền sử, bệnh sử, khám, chỉ số...)
              </label>
              <textarea
                rows={8}
                value={row.progression}
                placeholder="Nhập diễn biến bệnh, triệu chứng, mạch, HA, SpO2, chẩn đoán, hướng điều trị..."
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  boxSizing: 'border-box',
                }}
                onChange={(e) => handleRowFieldChange(rIndex, 'progression', e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Chỉ định (Cận lâm sàng, Đơn thuốc, Chế độ ăn & Chăm sóc)
              </label>
              <textarea
                rows={8}
                value={row.orders}
                placeholder="Nhập chỉ định CLS, thuốc tiêm/truyền, chế độ ăn, theo dõi..."
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  boxSizing: 'border-box',
                }}
                onChange={(e) => handleRowFieldChange(rIndex, 'orders', e.target.value)}
              />
            </div>
          </div>
        ))}

        <div className="field-group full">
          <button
            type="button"
            className="secondary-button"
            style={{ width: '100%', marginTop: '6px', borderStyle: 'dashed' }}
            onClick={handleAddRow}
          >
            <Plus size={14} /> + Thêm mốc thời gian diễn biến tiếp theo
          </button>
        </div>

        {/* Nút tạo thêm slide ca bệnh mới */}
        <div
          className="field-group full"
          style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}
        >
          <button
            type="button"
            className="primary-button create-new-slide-btn"
            onClick={onAddNewSlide}
            title="Tạo thêm 1 slide ca bệnh SOAP mới"
          >
            <CopyPlus size={16} />
            + Tạo thêm 1 slide ca bệnh mới
          </button>
        </div>
      </div>
    </section>
  );
}
