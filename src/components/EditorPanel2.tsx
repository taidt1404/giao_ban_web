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
        <h3 className="section-title">1. Chỉ số chung ngoại trú</h3>
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

        {/* Phần 2: Nhóm PK Nội */}
        <h3 className="section-title" style={{ marginTop: '20px' }}>
          2. Nhóm PK Nội (Cộng dồn tự động)
        </h3>
        <div className="clinic-input-list">
          {data.internalClinics.map((clinic, index) => {
            const rate = calculateRate(clinic.admitted, clinic.total);
            return (
              <div className="clinic-row-card" key={clinic.id}>
                <span className="clinic-name font-bold">{clinic.name}</span>
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Phần 3: Các chuyên khoa khác */}
        <h3 className="section-title" style={{ marginTop: '20px' }}>
          3. Các chuyên khoa khác
        </h3>
        <div className="clinic-input-list">
          {data.specialtyClinics.map((clinic, index) => {
            const rate = calculateRate(clinic.admitted, clinic.total);
            return (
              <div className="clinic-row-card" key={clinic.id}>
                <span className="clinic-name font-bold">{clinic.name}</span>
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
