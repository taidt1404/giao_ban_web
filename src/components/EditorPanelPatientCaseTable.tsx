import { Plus, Trash2, PlusCircle } from 'lucide-react';
import type {
  PatientCaseTableSlideData,
  PatientCaseTableRow,
} from '../data/patientCaseTableReport';

type Props = {
  data: PatientCaseTableSlideData;
  slideNumber: number;
  totalSlides: number;
  canDeleteSlide: boolean;
  onChange: (next: PatientCaseTableSlideData) => void;
  onAddNewSlide: () => void;
  onDeleteSlide: () => void;
};

export default function EditorPanelPatientCaseTable({
  data,
  slideNumber,
  totalSlides,
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

  function handleRowChange(
    rowIndex: number,
    field: keyof PatientCaseTableRow,
    value: string,
  ) {
    const updatedRows = [...data.rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [field]: value,
    };
    onChange({
      ...data,
      rows: updatedRows,
    });
  }

  function handleAddRow() {
    const newRowIndex = data.rows.length + 1;
    const newRow: PatientCaseTableRow = {
      id: `row-${Date.now()}`,
      stt: String(newRowIndex),
      patientInfo: 'HỌ VÀ TÊN ... TUỔI\nĐịa chỉ: ...\n...H...',
      reasonAndExam: 'LDK: ...\n- Khám: ...',
      subclinical: 'CLS: ...',
      diagnosis: 'CĐ: ...',
      treatment: 'Xử trí: ...',
    };
    onChange({
      ...data,
      rows: [...data.rows, newRow],
    });
  }

  function handleDeleteRow(rowIndex: number) {
    if (data.rows.length <= 1) {
      alert('Cần có ít nhất 1 hàng bệnh nhân trong bảng!');
      return;
    }
    const updatedRows = data.rows.filter((_, i) => i !== rowIndex);
    // Cập nhật lại STT nếu người dùng dùng STT tự động
    const reindexedRows = updatedRows.map((r, i) => ({
      ...r,
      stt: r.stt && /^\d+$/.test(r.stt) ? String(i + 1) : r.stt,
    }));
    onChange({
      ...data,
      rows: reindexedRows,
    });
  }

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">
            SLIDE {slideNumber} / {totalSlides} — CA BỆNH DẠNG BẢNG
          </span>
          <h2>Bệnh nhân khám / Xử trí</h2>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="badge">{data.rows.length} BN</span>
          {canDeleteSlide && (
            <button
              type="button"
              className="icon-button delete-slide-btn"
              title="Xóa slide bảng này"
              onClick={onDeleteSlide}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="form-grid">
        {/* Tiêu đề slide */}
        <div className="field-group full">
          <label>Tiêu đề slide</label>
          <input
            type="text"
            value={data.title}
            placeholder="VD: IX. BỆNH NHÂN NGOẠI TRÚ / KHÁM BỆNH ĐẶC BIỆT"
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        {/* Nút thêm slide loại này */}
        <div className="field-group full">
          <button
            type="button"
            className="secondary-button"
            style={{
              width: '100%',
              borderColor: '#0284c7',
              color: '#0284c7',
              background: '#f0f9ff',
            }}
            onClick={onAddNewSlide}
          >
            <PlusCircle size={15} /> + Thêm 1 slide ca bệnh (bảng 6 cột) mới
          </button>
        </div>

        {/* Danh sách từng bệnh nhân trong bảng */}
        <div className="field-group full" style={{ marginTop: '8px' }}>
          <div className="field-label-row">
            <label style={{ fontSize: '13px', color: '#102a57' }}>
              Danh sách bệnh nhân ({data.rows.length} hàng)
            </label>
            <button
              type="button"
              className="mini-button primary-mini-btn"
              onClick={handleAddRow}
            >
              <Plus size={13} /> Thêm bệnh nhân
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginTop: '8px',
            }}
          >
            {data.rows.map((row, index) => (
              <div
                key={row.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '6px',
                  }}
                >
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                    Bệnh nhân #{row.stt || index + 1}
                  </strong>
                  {data.rows.length > 1 && (
                    <button
                      type="button"
                      className="icon-button"
                      title="Xóa bệnh nhân này"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Cột 1: STT & Cột 2: Họ và tên/tuổi/địa chỉ/giờ */}
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>STT:</label>
                    <input
                      type="text"
                      value={row.stt || String(index + 1)}
                      style={{ textAlign: 'center', fontWeight: 600, padding: '4px' }}
                      onChange={(e) => handleRowChange(index, 'stt', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>
                      Họ tên / tuổi / địa chỉ / giờ (dòng 1 in đậm):
                    </label>
                    <textarea
                      rows={3}
                      value={row.patientInfo}
                      placeholder="VD: TRẦN VĂN THỎA 56 tuổi&#10;Thôn Lương Phong, Xã Hiệp Hoà&#10;16H50"
                      onChange={(e) => handleRowChange(index, 'patientInfo', e.target.value)}
                    />
                  </div>
                </div>

                {/* Cột 3: Lý do khám / chẩn đoán sơ bộ */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '10px', color: '#64748b' }}>
                    Lý do khám / chẩn đoán sơ bộ / diễn biến:
                  </label>
                  <textarea
                    rows={4}
                    value={row.reasonAndExam}
                    placeholder="LDK, triệu chứng, khám thực thể..."
                    onChange={(e) => handleRowChange(index, 'reasonAndExam', e.target.value)}
                  />
                </div>

                {/* Cột 4: Cận lâm sàng */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '10px', color: '#64748b' }}>
                    Cận lâm sàng (kết quả chụp, xét nghiệm...):
                  </label>
                  <textarea
                    rows={3}
                    value={row.subclinical}
                    placeholder="MRI, X-quang, xét nghiệm máu..."
                    onChange={(e) => handleRowChange(index, 'subclinical', e.target.value)}
                  />
                </div>

                {/* Cột 5 & 6: Chẩn đoán & Xử trí */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>Chẩn đoán:</label>
                    <textarea
                      rows={3}
                      value={row.diagnosis}
                      placeholder="Chẩn đoán xác định / theo dõi..."
                      onChange={(e) => handleRowChange(index, 'diagnosis', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>Xử trí:</label>
                    <textarea
                      rows={3}
                      value={row.treatment}
                      placeholder="Tư vấn nhập viện, kê đơn..."
                      onChange={(e) => handleRowChange(index, 'treatment', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="secondary-button"
            style={{ width: '100%', marginTop: '12px', borderStyle: 'dashed' }}
            onClick={handleAddRow}
          >
            <Plus size={14} /> + Thêm bệnh nhân tiếp theo...
          </button>
        </div>
      </div>
    </section>
  );
}
