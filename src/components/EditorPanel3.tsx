import {
  type AfterHoursReportData,
  type AfterHoursDetail,
  calculatePrescriptionsTotal,
  calculateTotalExams,
  getPrescriptionsTotal,
  getTotalExams,
} from '../data/afterHoursReport';

type Props = {
  data: AfterHoursReportData;
  onChange: (next: AfterHoursReportData) => void;
};

export default function EditorPanel3({ data, onChange }: Props) {
  const currentPrescriptions = getPrescriptionsTotal(data);
  const currentTotalExams = getTotalExams(data);

  function handleMainChange(
    field: 'admitted' | 'transferred' | 'totalExams' | 'prescriptions',
    value: string,
  ) {
    const num = parseInt(value, 10) || 0;
    onChange({
      ...data,
      [field]: num,
    });
  }

  function handleDetailChange(field: keyof AfterHoursDetail, value: string) {
    const num = parseInt(value, 10) || 0;
    onChange({
      ...data,
      details: {
        ...data.details,
        [field]: num,
      },
    });
  }

  function handleAutoCalculate() {
    const rx = calculatePrescriptionsTotal(data.details);
    const total = (Number(data.admitted) || 0) + (Number(data.transferred) || 0) + rx;
    onChange({
      ...data,
      totalExams: total,
      prescriptions: rx,
    });
  }

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">NỘI DUNG SLIDE 3</span>
          <h2>Khám ngoài giờ</h2>
        </div>
        <span className="badge">Nhập tay tự do</span>
      </div>

      <div className="accordion-group">
        {/* Phần 1: Số ca chung & Cấp cứu */}
        <h3 className="section-title">1. Chỉ số chung & Cấp cứu / chuyển viện</h3>
        <div className="form-grid">
          <div className="field-group">
            <label style={{ fontWeight: 700, color: '#15803d' }}>Tổng khám</label>
            <input
              type="number"
              min="0"
              value={data.totalExams ?? currentTotalExams}
              onChange={(e) => handleMainChange('totalExams', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label style={{ fontWeight: 700, color: '#16a34a' }}>Kê đơn, trong đó</label>
            <input
              type="number"
              min="0"
              value={data.prescriptions ?? currentPrescriptions}
              onChange={(e) => handleMainChange('prescriptions', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Vào viện</label>
            <input
              type="number"
              min="0"
              value={data.admitted}
              onChange={(e) => handleMainChange('admitted', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Chuyển viện</label>
            <input
              type="number"
              min="0"
              value={data.transferred}
              onChange={(e) => handleMainChange('transferred', e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '6px', marginBottom: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            style={{
              fontSize: '11px',
              padding: '4px 9px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#475569',
              fontWeight: 500,
            }}
            onClick={handleAutoCalculate}
            title="Tính lại Tổng khám và Kê đơn theo các mục chi tiết bên dưới"
          >
            🔄 Tự động tính lại từ chi tiết
          </button>
        </div>

        {/* Phần 2: Chi tiết kê đơn */}
        <h3 className="section-title" style={{ marginTop: '20px' }}>
          2. Chi tiết phân loại (Kê đơn)
        </h3>
        <div className="form-grid">
          <div className="field-group">
            <label>1. Tiêu hóa, tiết niệu</label>
            <input
              type="number"
              min="0"
              value={data.details.digestiveAndUrinary}
              onChange={(e) => handleDetailChange('digestiveAndUrinary', e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>2. Hô hấp, sốt</label>
            <input
              type="number"
              min="0"
              value={data.details.respiratoryAndFever}
              onChange={(e) => handleDetailChange('respiratoryAndFever', e.target.value)}
            />
          </div>
          <div className="field-group full">
            <label>3. Chấn thương</label>
            <input
              type="number"
              min="0"
              value={data.details.trauma}
              onChange={(e) => handleDetailChange('trauma', e.target.value)}
            />
          </div>

          {/* 4. Sản */}
          <div className="field-group full" style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <label style={{ color: '#1e3a8a' }}>4. Sản</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Khám:</span>
                <input
                  type="number"
                  min="0"
                  value={data.details.obstetricsExam}
                  onChange={(e) => handleDetailChange('obstetricsExam', e.target.value)}
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Vào viện:</span>
                <input
                  type="number"
                  min="0"
                  value={data.details.obstetricsAdmitted}
                  onChange={(e) => handleDetailChange('obstetricsAdmitted', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 5. Khám Nhi */}
          <div className="field-group full" style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <label style={{ color: '#1e3a8a' }}>5. Khám Nhi</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Khám:</span>
                <input
                  type="number"
                  min="0"
                  value={data.details.pediatricsExam}
                  onChange={(e) => handleDetailChange('pediatricsExam', e.target.value)}
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Vào viện:</span>
                <input
                  type="number"
                  min="0"
                  value={data.details.pediatricsAdmitted}
                  onChange={(e) => handleDetailChange('pediatricsAdmitted', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="field-group full">
            <label>6. Khám khác</label>
            <input
              type="number"
              min="0"
              value={data.details.otherExam}
              onChange={(e) => handleDetailChange('otherExam', e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
