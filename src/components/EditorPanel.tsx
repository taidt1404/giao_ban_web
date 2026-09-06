import type { ReportData } from '../data/defaultReport';

type Props = {
  report: ReportData;
  onChange: (next: ReportData) => void;
};

function updateArray(
  values: string[],
  index: number,
  value: string,
  setValues: (next: string[]) => void,
) {
  const next = [...values];
  next[index] = value;
  setValues(next);
}

function ListEditor({
  label,
  values,
  setValues,
}: {
  label: string;
  values: string[];
  setValues: (next: string[]) => void;
}) {
  return (
    <div className="field-group">
      <div className="field-label-row">
        <label>{label}</label>
        <button
          type="button"
          className="mini-button"
          onClick={() => setValues([...values, ''])}
        >
          + Thêm
        </button>
      </div>
      <div className="stack">
        {values.map((value, index) => (
          <div className="inline-input" key={`${label}-${index}`}>
            <input
              value={value}
              placeholder={`${label} ${index + 1}`}
              onChange={(event) =>
                updateArray(values, index, event.target.value, setValues)
              }
            />
            <button
              type="button"
              className="icon-button"
              aria-label={`Xóa ${label} ${index + 1}`}
              onClick={() => setValues(values.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EditorPanel({ report, onChange }: Props) {
  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">NỘI DUNG SLIDE 1</span>
          <h2>Thông tin trực</h2>
        </div>
        <span className="badge">Bản nháp</span>
      </div>

      <div className="form-grid">
        <div className="field-group full">
          <label htmlFor="reportDate">Ngày giao ban</label>
          <input
            id="reportDate"
            type="date"
            value={report.reportDate}
            onChange={(event) => onChange({ ...report, reportDate: event.target.value })}
          />
        </div>

        <ListEditor
          label="Bác sĩ"
          values={report.doctors}
          setValues={(doctors) => onChange({ ...report, doctors })}
        />

        <ListEditor
          label="Điều dưỡng"
          values={report.nurses}
          setValues={(nurses) => onChange({ ...report, nurses })}
        />

        <div className="field-group">
          <label htmlFor="pharmacy">Dược</label>
          <input
            id="pharmacy"
            value={report.pharmacy}
            onChange={(event) => onChange({ ...report, pharmacy: event.target.value })}
          />
        </div>

        <div className="field-group">
          <label htmlFor="xray">XQuang</label>
          <input
            id="xray"
            value={report.xray}
            onChange={(event) => onChange({ ...report, xray: event.target.value })}
          />
        </div>

        <ListEditor
          label="Xét nghiệm"
          values={report.laboratory}
          setValues={(laboratory) => onChange({ ...report, laboratory })}
        />

        <div className="field-group">
          <label htmlFor="administration">Hành chính</label>
          <input
            id="administration"
            value={report.administration}
            onChange={(event) =>
              onChange({ ...report, administration: event.target.value })
            }
          />
        </div>
      </div>
    </section>
  );
}
