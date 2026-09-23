import { Plus, Trash2 } from 'lucide-react';
import {
  type OutpatientReportData,
  type ClinicItem,
  calculateRate,
} from '../data/outpatientReport';

type Props = {
  data: OutpatientReportData;
  onChange: (next: OutpatientReportData) => void;
};

export default function EditorPanel2({ data, onChange }: Props) {
  function handleGeneralChange(field: keyof OutpatientReportData['general'], value: string) {
    if (field === 'totalAndAdmitted') {
      onChange({
        ...data,
        general: {
          ...data.general,
          totalAndAdmitted: value,
        },
      });
    } else {
      const num = parseInt(value, 10) || 0;
      onChange({
        ...data,
        general: {
          ...data.general,
          [field]: num,
        },
      });
    }
  }

  function handleAddCustomStat() {
    const current = data.general.customStats || [];
    const newStat = {
      id: `stat-${Date.now()}`,
      name: 'Chỉ số mới',
      value: 0,
    };
    onChange({
      ...data,
      general: {
        ...data.general,
        customStats: [...current, newStat],
      },
    });
  }

  function handleCustomStatNameChange(index: number, name: string) {
    const current = [...(data.general.customStats || [])];
    current[index] = { ...current[index], name };
    onChange({
      ...data,
      general: {
        ...data.general,
        customStats: current,
      },
    });
  }

  function handleCustomStatValueChange(index: number, valStr: string) {
    const current = [...(data.general.customStats || [])];
    const num = parseInt(valStr, 10) || 0;
    current[index] = { ...current[index], value: num };
    onChange({
      ...data,
      general: {
        ...data.general,
        customStats: current,
      },
    });
  }

  function handleDeleteCustomStat(index: number) {
    const current = (data.general.customStats || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      general: {
        ...data.general,
        customStats: current,
      },
    });
  }

  function handleAddInternalClinic() {
    const newClinic: ClinicItem = {
      id: `pk-${Date.now()}`,
      name: 'PK mới',
      total: 0,
      admitted: 0,
      isCustom: true,
    };
    onChange({
      ...data,
      internalClinics: [...data.internalClinics, newClinic],
    });
  }

  function handleAddSpecialtyClinic() {
    const newClinic: ClinicItem = {
      id: `sp-${Date.now()}`,
      name: 'Khoa mới',
      total: 0,
      admitted: 0,
      isCustom: true,
    };
    onChange({
      ...data,
      specialtyClinics: [...data.specialtyClinics, newClinic],
    });
  }

  function handleClinicNameChange(
    category: 'internalClinics' | 'specialtyClinics',
    index: number,
    name: string,
  ) {
    const list = [...data[category]];
    list[index] = {
      ...list[index],
      name,
    };
    onChange({
      ...data,
      [category]: list,
    });
  }

  function handleClinicChange(
    category: 'internalClinics' | 'specialtyClinics',
    index: number,
    field: 'total' | 'admitted',
    value: string,
  ) {
    const list = [...data[category]];
    const num = parseInt(value, 10) || 0;
    list[index] = {
      ...list[index],
      [field]: num,
    };
    onChange({
      ...data,
      [category]: list,
    });
  }

  function handleDeleteClinic(
    category: 'internalClinics' | 'specialtyClinics',
    index: number,
  ) {
    const list = data[category].filter((_, i) => i !== index);
    onChange({
      ...data,
      [category]: list,
    });
  }

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">NỘI DUNG SLIDE 2</span>
          <h2>Người bệnh ngoại trú</h2>
        </div>
        <span className="badge">Tự động tính %</span>
      </div>

      <div className="accordion-group">
        {/* Phần 1: Chỉ số chung */}
        <div className="section-header-flex">
          <h3 className="section-title">1. Chỉ số chung ngoại trú</h3>
          <button
            type="button"
            className="mini-button primary-mini-btn"
            onClick={handleAddCustomStat}
          >
            <Plus size={13} /> Thêm chỉ số
          </button>
        </div>

        <div className="form-grid">
          <div className="field-group full">
            <label>Tổng số / Vào viện</label>
            <input
              type="text"
              value={data.general.totalAndAdmitted}
              placeholder="VD: 203/19"
              onChange={(e) => handleGeneralChange('totalAndAdmitted', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Bảo hiểm y tế</label>
            <input
              type="number"
              min="0"
              value={data.general.insurance}
              onChange={(e) => handleGeneralChange('insurance', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Dịch vụ</label>
            <input
              type="number"
              min="0"
              value={data.general.service}
              onChange={(e) => handleGeneralChange('service', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Khám yêu cầu</label>
            <input
              type="number"
              min="0"
              value={data.general.onDemand}
              onChange={(e) => handleGeneralChange('onDemand', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Đái tháo đường</label>
            <input
              type="number"
              min="0"
              value={data.general.diabetes}
              onChange={(e) => handleGeneralChange('diabetes', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Tăng huyết áp</label>
            <input
              type="number"
              min="0"
              value={data.general.hypertension}
              onChange={(e) => handleGeneralChange('hypertension', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>COPD</label>
            <input
              type="number"
              min="0"
              value={data.general.copd}
              onChange={(e) => handleGeneralChange('copd', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Viêm Gan B, C</label>
            <input
              type="number"
              min="0"
              value={data.general.hepatitisB ?? 0}
              onChange={(e) => handleGeneralChange('hepatitisB', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Điều trị YHCT - PHCN</label>
            <input
              type="number"
              min="0"
              value={data.general.traditionalRehab}
              onChange={(e) => handleGeneralChange('traditionalRehab', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Chuyển viện</label>
            <input
              type="number"
              min="0"
              value={data.general.transferred}
              onChange={(e) => handleGeneralChange('transferred', e.target.value)}
            />
          </div>
        </div>

        {/* Danh sách chỉ số tự thêm */}
        {data.general.customStats && data.general.customStats.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
              Chỉ số bổ sung tự thêm:
            </span>
            {data.general.customStats.map((stat, idx) => (
              <div className="custom-stat-card" key={stat.id}>
                <input
                  type="text"
                  className="custom-stat-name-input"
                  value={stat.name}
                  placeholder="Tên chỉ số"
                  onChange={(e) => handleCustomStatNameChange(idx, e.target.value)}
                />
                <div className="input-with-label">
                  <span>Số lượng:</span>
                  <input
                    type="number"
                    min="0"
                    className="custom-stat-val-input"
                    value={stat.value}
                    onChange={(e) => handleCustomStatValueChange(idx, e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="icon-button"
                  style={{ width: '26px', height: '26px', flexShrink: 0 }}
                  title="Xóa chỉ số này"
                  onClick={() => handleDeleteCustomStat(idx)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Phần 2: Nhóm PK Nội */}
        <div className="section-header-flex" style={{ marginTop: '22px' }}>
          <h3 className="section-title">2. Nhóm PK Nội (Cộng dồn tự động)</h3>
          <button
            type="button"
            className="mini-button primary-mini-btn"
            onClick={handleAddInternalClinic}
          >
            <Plus size={13} /> Thêm PK
          </button>
        </div>
        <div className="clinic-input-list">
          {data.internalClinics.map((clinic, index) => {
            const rate = calculateRate(clinic.admitted, clinic.total);
            return (
              <div className="clinic-row-card" key={clinic.id}>
                {clinic.isCustom ? (
                  <input
                    type="text"
                    className="clinic-name-input"
                    value={clinic.name}
                    placeholder="Tên PK"
                    onChange={(e) =>
                      handleClinicNameChange('internalClinics', index, e.target.value)
                    }
                  />
                ) : (
                  <span className="clinic-name font-bold">{clinic.name}</span>
                )}
                <div className="clinic-inputs">
                  <div className="input-with-label">
                    <span>Tổng:</span>
                    <input
                      type="number"
                      min="0"
                      value={clinic.total}
                      onChange={(e) =>
                        handleClinicChange('internalClinics', index, 'total', e.target.value)
                      }
                    />
                  </div>
                  <div className="input-with-label">
                    <span>Vào viện:</span>
                    <input
                      type="number"
                      min="0"
                      value={clinic.admitted}
                      onChange={(e) =>
                        handleClinicChange('internalClinics', index, 'admitted', e.target.value)
                      }
                    />
                  </div>
                  <span className="rate-badge">{rate}%</span>
                  {clinic.isCustom && (
                    <button
                      type="button"
                      className="icon-button"
                      style={{ width: '24px', height: '24px', flexShrink: 0 }}
                      title="Xóa phòng khám này"
                      onClick={() => handleDeleteClinic('internalClinics', index)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Phần 3: Các chuyên khoa khác */}
        <div className="section-header-flex" style={{ marginTop: '22px' }}>
          <h3 className="section-title">3. Các chuyên khoa khác</h3>
          <button
            type="button"
            className="mini-button primary-mini-btn"
            onClick={handleAddSpecialtyClinic}
          >
            <Plus size={13} /> Thêm chuyên khoa
          </button>
        </div>
        <div className="clinic-input-list">
          {data.specialtyClinics.map((clinic, index) => {
            const rate = calculateRate(clinic.admitted, clinic.total);
            return (
              <div className="clinic-row-card" key={clinic.id}>
                {clinic.isCustom ? (
                  <input
                    type="text"
                    className="clinic-name-input"
                    value={clinic.name}
                    placeholder="Tên khoa"
                    onChange={(e) =>
                      handleClinicNameChange('specialtyClinics', index, e.target.value)
                    }
                  />
                ) : (
                  <span className="clinic-name font-bold">{clinic.name}</span>
                )}
                <div className="clinic-inputs">
                  <div className="input-with-label">
                    <span>Tổng:</span>
                    <input
                      type="number"
                      min="0"
                      value={clinic.total}
                      onChange={(e) =>
                        handleClinicChange('specialtyClinics', index, 'total', e.target.value)
                      }
                    />
                  </div>
                  <div className="input-with-label">
                    <span>Vào viện:</span>
                    <input
                      type="number"
                      min="0"
                      value={clinic.admitted}
                      onChange={(e) =>
                        handleClinicChange('specialtyClinics', index, 'admitted', e.target.value)
                      }
                    />
                  </div>
                  <span className="rate-badge">{rate}%</span>
                  {clinic.isCustom && (
                    <button
                      type="button"
                      className="icon-button"
                      style={{ width: '24px', height: '24px', flexShrink: 0 }}
                      title="Xóa khoa này"
                      onClick={() => handleDeleteClinic('specialtyClinics', index)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
