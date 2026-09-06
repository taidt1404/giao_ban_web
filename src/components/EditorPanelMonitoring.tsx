import { Plus, Trash2 } from 'lucide-react';
import type { MonitoringReportData, DepartmentMonitoring } from '../data/monitoringReport';

type Props = {
  data: MonitoringReportData;
  slideNumber: number;
  onChange: (next: MonitoringReportData) => void;
};

export default function EditorPanelMonitoring({ data, slideNumber, onChange }: Props) {
  function handleTitleChange(title: string) {
    onChange({
      ...data,
      title,
    });
  }

  function handleDeptChange(index: number, field: keyof DepartmentMonitoring, value: string) {
    const list = [...data.departments];
    if (field === 'count') {
      const num = parseInt(value, 10) || 0;
      list[index] = {
        ...list[index],
        count: num,
      };
    } else {
      list[index] = {
        ...list[index],
        [field]: value,
      };
    }
    onChange({
      ...data,
      departments: list,
    });
  }

  function handleAddDept() {
    const newDept: DepartmentMonitoring = {
      id: `dept-${Date.now()}`,
      name: 'KHOA MỚI',
      count: 0,
    };
    onChange({
      ...data,
      departments: [...data.departments, newDept],
    });
  }

  function handleDeleteDept(index: number) {
    if (data.departments.length <= 1) {
      alert('Cần có ít nhất 1 khoa trong danh sách!');
      return;
    }
    const list = data.departments.filter((_, i) => i !== index);
    onChange({
      ...data,
      departments: list,
    });
  }

  const totalPatients = data.departments.reduce((sum, d) => sum + (Number(d.count) || 0), 0);

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">SLIDE {slideNumber} — THEO DÕI</span>
          <h2>Bệnh nhân theo dõi</h2>
        </div>
        <span className="badge">Tổng: {totalPatients} BN</span>
      </div>

      <div className="form-grid">
        {/* Tiêu đề slide */}
        <div className="field-group full">
          <label>Tiêu đề slide</label>
          <input
            type="text"
            value={data.title}
            placeholder="VD: VIII. BỆNH NHÂN THEO DÕI"
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        {/* Danh sách khoa & số lượng */}
        <div className="field-group full" style={{ marginTop: '8px' }}>
          <div className="field-label-row">
            <label style={{ fontSize: '13px', color: '#102a57' }}>
              Danh sách khoa & số BN theo dõi
            </label>
            <button
              type="button"
              className="mini-button primary-mini-btn"
              onClick={handleAddDept}
            >
              <Plus size={13} /> Thêm khoa
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            {data.departments.map((dept, index) => (
              <div
                key={dept.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 10px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Tên khoa:</span>
                  <input
                    type="text"
                    value={dept.name}
                    style={{
                      width: '100%',
                      height: '30px',
                      fontWeight: 700,
                      padding: '0 8px',
                      boxSizing: 'border-box',
                    }}
                    onChange={(e) => handleDeptChange(index, 'name', e.target.value)}
                  />
                </div>
                <div style={{ width: '85px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Số BN:</span>
                  <input
                    type="number"
                    min="0"
                    value={dept.count}
                    style={{
                      width: '100%',
                      height: '30px',
                      textAlign: 'center',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                    onChange={(e) => handleDeptChange(index, 'count', e.target.value)}
                  />
                </div>
                {data.departments.length > 1 && (
                  <button
                    type="button"
                    className="icon-button"
                    title="Xóa khoa này"
                    style={{ marginTop: '14px' }}
                    onClick={() => handleDeleteDept(index)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="secondary-button"
            style={{ width: '100%', marginTop: '10px', borderStyle: 'dashed' }}
            onClick={handleAddDept}
          >
            <Plus size={14} /> + Thêm khoa khác...
          </button>
        </div>
      </div>
    </section>
  );
}
