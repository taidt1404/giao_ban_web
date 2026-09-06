import {
  type InpatientReportData,
  type InpatientDepartment,
  calculateCurrentPatients,
  calculateBedDifference,
} from '../data/inpatientReport';

type Props = {
  data: InpatientReportData;
  onChange: (next: InpatientReportData) => void;
};

export default function EditorPanel4({ data, onChange }: Props) {
  function handleDeptChange(
    index: number,
    field: keyof Omit<InpatientDepartment, 'id' | 'name'>,
    value: string,
  ) {
    const list = [...data.departments];
    const num = parseInt(value, 10) || 0;
    list[index] = {
      ...list[index],
      [field]: num,
    };
    onChange({
      ...data,
      departments: list,
    });
  }

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">NỘI DUNG SLIDE 4</span>
          <h2>Người bệnh nội trú</h2>
        </div>
        <span className="badge">Tự động tính toán</span>
      </div>

      <div className="inpatient-dept-list">
        {data.departments.map((dept, index) => {
          const cur = calculateCurrentPatients(dept);
          const diff = calculateBedDifference(dept.actualBeds, cur);

          return (
            <div className="dept-edit-card" key={dept.id}>
              <div className="dept-card-header">
                <span className="dept-title font-bold">Khoa {dept.name}</span>
                <div className="dept-status-badges">
                  <span className="badge-blue">Hiện có: {cur}</span>
                  <span className={diff.startsWith('-') ? 'badge-red' : 'badge-green'}>
                    {diff.startsWith('-') ? `Thiếu ${diff.slice(1)}` : `Thừa ${diff}`}
                  </span>
                </div>
              </div>

              <div className="dept-fields-grid">
                <div className="mini-field">
                  <label>Cũ</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.oldPatients}
                    onChange={(e) => handleDeptChange(index, 'oldPatients', e.target.value)}
                  />
                </div>
                <div className="mini-field">
                  <label>Vào</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.admitted}
                    onChange={(e) => handleDeptChange(index, 'admitted', e.target.value)}
                  />
                </div>
                <div className="mini-field">
                  <label>Ra</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.discharged}
                    onChange={(e) => handleDeptChange(index, 'discharged', e.target.value)}
                  />
                </div>
                <div className="mini-field">
                  <label>Chuyển</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.transferred}
                    onChange={(e) => handleDeptChange(index, 'transferred', e.target.value)}
                  />
                </div>
                <div className="mini-field">
                  <label>Tử vong</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.deceased}
                    onChange={(e) => handleDeptChange(index, 'deceased', e.target.value)}
                  />
                </div>
                <div className="mini-field highlight-field">
                  <label>Giường kê</label>
                  <input
                    type="number"
                    min="0"
                    value={dept.actualBeds}
                    onChange={(e) => handleDeptChange(index, 'actualBeds', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
