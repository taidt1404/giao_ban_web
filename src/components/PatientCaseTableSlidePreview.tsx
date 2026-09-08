import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check } from 'lucide-react';
import type {
  PatientCaseTableSlideData,
  PatientCaseTableRow,
} from '../data/patientCaseTableReport';

type Props = {
  data: PatientCaseTableSlideData;
  onChange?: (next: PatientCaseTableSlideData) => void;
};

export default function PatientCaseTableSlidePreview({ data, onChange }: Props) {
  const isEditable = Boolean(onChange);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    field: keyof PatientCaseTableRow;
  } | null>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(data.title || '');

  // Cập nhật giá trị khi đang gõ
  function handleCellChange(rowId: string, field: keyof PatientCaseTableRow, value: string) {
    if (!onChange) return;
    const updatedRows = data.rows.map((row) => {
      if (row.id === rowId) {
        return { ...row, [field]: value };
      }
      return row;
    });
    onChange({
      ...data,
      rows: updatedRows,
    });
  }

  // Thêm hàng bệnh nhân trực tiếp trên bảng
  function handleAddRow() {
    if (!onChange) return;
    const nextIndex = data.rows.length + 1;
    const newRow: PatientCaseTableRow = {
      id: `row-${Date.now()}`,
      stt: String(nextIndex),
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
    // Tự động focus vào hàng mới tạo
    setEditingCell({ rowId: newRow.id, field: 'patientInfo' });
  }

  // Xóa hàng bệnh nhân trực tiếp trên bảng
  function handleDeleteRow(rowId: string) {
    if (!onChange) return;
    if (data.rows.length <= 1) {
      alert('Cần có ít nhất 1 hàng bệnh nhân trong bảng!');
      return;
    }
    const filtered = data.rows.filter((r) => r.id !== rowId);
    const reindexed = filtered.map((r, i) => ({
      ...r,
      stt: r.stt && /^\d+$/.test(r.stt) ? String(i + 1) : r.stt,
    }));
    onChange({
      ...data,
      rows: reindexed,
    });
    if (editingCell?.rowId === rowId) {
      setEditingCell(null);
    }
  }

  function handleSaveTitle() {
    setIsEditingTitle(false);
    if (onChange && tempTitle !== data.title) {
      onChange({ ...data, title: tempTitle });
    }
  }

  return (
    <div className="slide-wrap">
      <div className="slide slide-case-table">
        {/* TIÊU ĐỀ SLIDE - CÓ THỂ BẤM VÀO SỬA TRỰC TIẾP */}
        <div className="case-table-header">
          {isEditable && isEditingTitle ? (
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
              <input
                type="text"
                value={tempTitle}
                autoFocus
                className="case-table-title-input"
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTempTitle(data.title || '');
                    setIsEditingTitle(false);
                  }
                }}
              />
              <button
                type="button"
                className="mini-button primary-mini-btn"
                onClick={handleSaveTitle}
              >
                <Check size={14} /> Xong
              </button>
            </div>
          ) : (
            <h1
              className="case-table-title"
              style={isEditable ? { cursor: 'pointer' } : {}}
              title={isEditable ? 'Nhấp chuột để đổi tiêu đề' : undefined}
              onClick={() => {
                if (isEditable) {
                  setTempTitle(data.title || '');
                  setIsEditingTitle(true);
                }
              }}
            >
              {data.title}
              {isEditable && (
                <Edit3
                  size={14}
                  className="title-edit-hint-icon"
                  style={{ marginLeft: '6px', opacity: 0.5, verticalAlign: 'middle' }}
                />
              )}
            </h1>
          )}
        </div>

        {/* BẢNG DỮ LIỆU BỆNH NHÂN */}
        <div className="case-table-container">
          <table className="case-data-table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>STT</th>
                <th style={{ width: '16%' }}>Họ và tên/tuổi/địa chỉ/giờ</th>
                <th style={{ width: '30%' }}>Lý do khám / chẩn đoán sơ bộ</th>
                <th style={{ width: '21%' }}>Cận lâm sàng</th>
                <th style={{ width: '13%' }}>Chẩn đoán</th>
                <th style={{ width: '14%' }}>Xử trí</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, index) => {
                const sttValue = row.stt || String(index + 1);
                const isEditingStt =
                  editingCell?.rowId === row.id && editingCell?.field === 'stt';
                const isEditingInfo =
                  editingCell?.rowId === row.id && editingCell?.field === 'patientInfo';
                const isEditingReason =
                  editingCell?.rowId === row.id && editingCell?.field === 'reasonAndExam';
                const isEditingCls =
                  editingCell?.rowId === row.id && editingCell?.field === 'subclinical';
                const isEditingDiag =
                  editingCell?.rowId === row.id && editingCell?.field === 'diagnosis';
                const isEditingTreat =
                  editingCell?.rowId === row.id && editingCell?.field === 'treatment';

                // Tách dòng đầu cho họ tên
                const patientLines = (row.patientInfo || '').split('\n');
                const firstLine = patientLines[0] || '';
                const restLines = patientLines.slice(1).join('\n');

                return (
                  <tr key={row.id} className="case-table-row">
                    {/* CỘT 1: STT */}
                    <td
                      className={`cell-center font-bold ${isEditable ? 'editable-cell' : ''} ${
                        isEditingStt ? 'is-editing' : ''
                      }`}
                      style={{ position: 'relative' }}
                      onClick={() => isEditable && setEditingCell({ rowId: row.id, field: 'stt' })}
                    >
                      {isEditable && isEditingStt ? (
                        <input
                          type="text"
                          autoFocus
                          className="case-cell-input-stt"
                          value={row.stt || ''}
                          onChange={(e) => handleCellChange(row.id, 'stt', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') setEditingCell(null);
                          }}
                        />
                      ) : (
                        <span>{sttValue}</span>
                      )}

                      {/* Nút xóa nhanh hàng khi hover */}
                      {isEditable && data.rows.length > 1 && !isEditingStt && (
                        <button
                          type="button"
                          className="row-delete-hover-btn"
                          title="Xóa bệnh nhân này"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Xóa bệnh nhân #${sttValue}?`)) {
                              handleDeleteRow(row.id);
                            }
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>

                    {/* CỘT 2: HỌ TÊN / TUỔI / ĐỊA CHỈ */}
                    <td
                      className={`cell-patient-info ${isEditable ? 'editable-cell' : ''} ${
                        isEditingInfo ? 'is-editing' : ''
                      }`}
                      onClick={() =>
                        isEditable && setEditingCell({ rowId: row.id, field: 'patientInfo' })
                      }
                    >
                      {isEditable && isEditingInfo ? (
                        <AutoResizeCellTextarea
                          value={row.patientInfo || ''}
                          placeholder="HỌ TÊN TUỔI&#10;Địa chỉ&#10;Giờ khám"
                          onChange={(val) => handleCellChange(row.id, 'patientInfo', val)}
                          onFinish={() => setEditingCell(null)}
                        />
                      ) : (
                        <>
                          <div className="font-bold patient-name-line">
                            {firstLine || <span className="empty-cell-hint">Chưa có tên BN</span>}
                          </div>
                          {restLines && <div className="patient-sub-line">{restLines}</div>}
                        </>
                      )}
                    </td>

                    {/* CỘT 3: LÝ DO KHÁM / CHẨN ĐOÁN SƠ BỘ */}
                    <td
                      className={`cell-pre-line ${isEditable ? 'editable-cell' : ''} ${
                        isEditingReason ? 'is-editing' : ''
                      }`}
                      onClick={() =>
                        isEditable && setEditingCell({ rowId: row.id, field: 'reasonAndExam' })
                      }
                    >
                      {isEditable && isEditingReason ? (
                        <AutoResizeCellTextarea
                          value={row.reasonAndExam || ''}
                          placeholder="Lý do khám, tiền sử, khám lâm sàng..."
                          onChange={(val) => handleCellChange(row.id, 'reasonAndExam', val)}
                          onFinish={() => setEditingCell(null)}
                        />
                      ) : (
                        row.reasonAndExam || (
                          <span className="empty-cell-hint">Nhấp để nhập lý do khám...</span>
                        )
                      )}
                    </td>

                    {/* CỘT 4: CẬN LÂM SÀNG */}
                    <td
                      className={`cell-pre-line ${isEditable ? 'editable-cell' : ''} ${
                        isEditingCls ? 'is-editing' : ''
                      }`}
                      onClick={() =>
                        isEditable && setEditingCell({ rowId: row.id, field: 'subclinical' })
                      }
                    >
                      {isEditable && isEditingCls ? (
                        <AutoResizeCellTextarea
                          value={row.subclinical || ''}
                          placeholder="Kết quả X-Quang, CT, MRI, XN..."
                          onChange={(val) => handleCellChange(row.id, 'subclinical', val)}
                          onFinish={() => setEditingCell(null)}
                        />
                      ) : (
                        row.subclinical || (
                          <span className="empty-cell-hint">Nhấp để nhập cận lâm sàng...</span>
                        )
                      )}
                    </td>

                    {/* CỘT 5: CHẨN ĐOÁN */}
                    <td
                      className={`cell-pre-line ${isEditable ? 'editable-cell' : ''} ${
                        isEditingDiag ? 'is-editing' : ''
                      }`}
                      onClick={() =>
                        isEditable && setEditingCell({ rowId: row.id, field: 'diagnosis' })
                      }
                    >
                      {isEditable && isEditingDiag ? (
                        <AutoResizeCellTextarea
                          value={row.diagnosis || ''}
                          placeholder="Chẩn đoán xác định / theo dõi..."
                          onChange={(val) => handleCellChange(row.id, 'diagnosis', val)}
                          onFinish={() => setEditingCell(null)}
                        />
                      ) : (
                        row.diagnosis || (
                          <span className="empty-cell-hint">Nhấp để nhập chẩn đoán...</span>
                        )
                      )}
                    </td>

                    {/* CỘT 6: XỬ TRÍ */}
                    <td
                      className={`cell-pre-line ${isEditable ? 'editable-cell' : ''} ${
                        isEditingTreat ? 'is-editing' : ''
                      }`}
                      onClick={() =>
                        isEditable && setEditingCell({ rowId: row.id, field: 'treatment' })
                      }
                    >
                      {isEditable && isEditingTreat ? (
                        <AutoResizeCellTextarea
                          value={row.treatment || ''}
                          placeholder="Hướng xử trí, kê đơn, nhập viện..."
                          onChange={(val) => handleCellChange(row.id, 'treatment', val)}
                          onFinish={() => setEditingCell(null)}
                        />
                      ) : (
                        row.treatment || (
                          <span className="empty-cell-hint">Nhấp để nhập xử trí...</span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* THANH CÔNG CỤ NHANH TRỰC TIẾP DƯỚI BẢNG */}
          {isEditable && (
            <div className="case-table-inline-actions">
              <button
                type="button"
                className="case-table-add-row-btn"
                onClick={handleAddRow}
                title="Thêm hàng bệnh nhân mới vào bảng"
              >
                <Plus size={15} />
                <span>Thêm bệnh nhân mới</span>
              </button>

              <div className="case-table-inline-hint">
                💡 <strong>Chỉnh sửa trực tiếp:</strong> Nhấp chuột vào bất kỳ ô nào trên bảng để gõ
                sửa rộng rãi. Bấm ra ngoài để tự động lưu.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Textarea tự động co giãn chiều cao theo nội dung khi sửa trực tiếp trên ô
 */
function AutoResizeCellTextarea({
  value,
  placeholder,
  onChange,
  onFinish,
}: {
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  onFinish: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.max(ref.current.scrollHeight, 60)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      autoFocus
      className="case-cell-editor"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onFinish}
      onKeyDown={(e) => {
        e.stopPropagation(); // Không trigger phím chuyển slide
        if (e.key === 'Escape') {
          onFinish();
        }
      }}
    />
  );
}
