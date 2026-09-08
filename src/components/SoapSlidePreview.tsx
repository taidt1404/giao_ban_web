import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check } from 'lucide-react';
import type { SoapSlideData, SoapTimelineRow } from '../data/soapReport';

type Props = {
  data: SoapSlideData;
  onChange?: (next: SoapSlideData) => void;
};

export default function SoapSlidePreview({ data, onChange }: Props) {
  const isEditable = Boolean(onChange);
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    field: keyof Omit<SoapTimelineRow, 'id'>;
  } | null>(null);

  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [tempHeader, setTempHeader] = useState(data.patientHeader || '');

  function handleHeaderSave() {
    setIsEditingHeader(false);
    if (onChange && tempHeader !== data.patientHeader) {
      onChange({ ...data, patientHeader: tempHeader });
    }
  }

  function handleCellChange(
    rowId: string,
    field: keyof Omit<SoapTimelineRow, 'id'>,
    value: string,
  ) {
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

  function handleAddRow() {
    if (!onChange) return;
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
    setEditingCell({ rowId: newRow.id, field: 'progression' });
  }

  function handleDeleteRow(rowId: string) {
    if (!onChange) return;
    if (data.rows.length <= 1) {
      alert('Slide ca bệnh cần ít nhất 1 mốc diễn biến!');
      return;
    }
    const filtered = data.rows.filter((r) => r.id !== rowId);
    onChange({
      ...data,
      rows: filtered,
    });
    if (editingCell?.rowId === rowId) {
      setEditingCell(null);
    }
  }

  return (
    <div className="slide-wrap">
      <div className="slide slide-soap" id="slide-soap">
        {/* TIÊU ĐỀ CA BỆNH - CÓ THỂ SỬA TRỰC TIẾP */}
        <div className="soap-slide-header">
          {isEditable && isEditingHeader ? (
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
              <input
                type="text"
                value={tempHeader}
                autoFocus
                className="soap-header-input"
                placeholder="VD: 1, ĐỖ THỊ SONG   66 tuổi"
                onChange={(e) => setTempHeader(e.target.value)}
                onBlur={handleHeaderSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleHeaderSave();
                  if (e.key === 'Escape') {
                    setTempHeader(data.patientHeader || '');
                    setIsEditingHeader(false);
                  }
                }}
              />
              <button
                type="button"
                className="mini-button primary-mini-btn"
                onClick={handleHeaderSave}
              >
                <Check size={14} /> Xong
              </button>
            </div>
          ) : (
            <div
              className="soap-patient-header font-bold"
              style={isEditable ? { cursor: 'pointer' } : {}}
              title={isEditable ? 'Nhấp chuột để đổi thông tin ca bệnh' : undefined}
              onClick={() => {
                if (isEditable) {
                  setTempHeader(data.patientHeader || '');
                  setIsEditingHeader(true);
                }
              }}
            >
              {data.patientHeader || (
                <span className="empty-cell-hint">1, TÊN BỆNH NHÂN   ... tuổi</span>
              )}
              {isEditable && (
                <Edit3
                  size={15}
                  className="title-edit-hint-icon"
                  style={{ marginLeft: '8px', opacity: 0.5, verticalAlign: 'middle' }}
                />
              )}
            </div>
          )}
        </div>

        {/* BẢNG DIỄN BIẾN & CHỈ ĐỊNH */}
        <div className="soap-table-wrap">
          <table className="soap-table">
            <thead>
              <tr>
                <th style={{ width: '13%' }}>
                  Thời gian
                  <br />
                  <span style={{ fontSize: '0.88em', fontWeight: 400 }}>(Ngày, giờ)</span>
                </th>
                <th style={{ width: '43.5%' }}>
                  Diễn biến bệnh
                  <br />
                  <span style={{ fontSize: '0.85em', fontWeight: 400 }}>
                    (Viết diễn biến theo cấu trúc như SOAP)
                  </span>
                </th>
                <th style={{ width: '43.5%' }}>Chỉ định</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => {
                const isEditingTime =
                  editingCell?.rowId === row.id && editingCell?.field === 'timeText';
                const isEditingProgression =
                  editingCell?.rowId === row.id && editingCell?.field === 'progression';
                const isEditingOrders =
                  editingCell?.rowId === row.id && editingCell?.field === 'orders';

                return (
                  <tr key={row.id} className="soap-table-row">
                    {/* CỘT 1: THỜI GIAN */}
                    <td
                      className={`cell-soap-time font-bold ${
                        isEditable ? 'editable-cell' : ''
                      } ${isEditingTime ? 'is-editing' : ''}`}
                      style={{ position: 'relative' }}
                      onClick={() =>
                        isEditable && setEditingCell({ rowId: row.id, field: 'timeText' })
                      }
                    >
                      {isEditable && isEditingTime ? (
                        <AutoResizeCellTextarea
                          value={row.timeText}
                          placeholder="22/08/2026&#10;20:20"
                          textAlign="center"
                          fontWeight="bold"
                          onChange={(val) => handleCellChange(row.id, 'timeText', val)}
                          onFinish={() => setEditingCell(null)}
                        />
                      ) : (
                        <div>
                          {row.timeText ? (
                            row.timeText.split('\n').map((line, idx) => (
                              <div key={idx}>{line}</div>
                            ))
                          ) : (
                            <span className="empty-cell-hint">Thời gian</span>
                          )}
                        </div>
                      )}

                      {/* Nút xóa nhanh mốc thời gian khi hover */}
                      {isEditable && data.rows.length > 1 && !isEditingTime && (
                        <button
                          type="button"
                          className="row-delete-hover-btn"
                          title="Xóa mốc diễn biến này"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Xóa mốc diễn biến này?')) {
                              handleDeleteRow(row.id);
                            }
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>

                    {/* CỘT 2: DIỄN BIẾN BỆNH (SOAP) */}
                    <td
                      className={`cell-soap-content ${
                        isEditable ? 'editable-cell' : ''
                      } ${isEditingProgression ? 'is-editing' : ''}`}
                      onClick={() =>
                        isEditable && setEditingCell({ rowId: row.id, field: 'progression' })
                      }
                    >
                      {isEditable && isEditingProgression ? (
                        <AutoResizeCellTextarea
                          value={row.progression}
                          placeholder="Nhập diễn biến bệnh, triệu chứng, chỉ số sinh tồn, chẩn đoán..."
                          onChange={(val) => handleCellChange(row.id, 'progression', val)}
                          onFinish={() => setEditingCell(null)}
                        />
                      ) : (
                        <div className="soap-text-block">
                          {row.progression || (
                            isEditable ? (
                              <span className="empty-cell-hint">
                                Nhấp chuột để nhập diễn biến SOAP...
                              </span>
                            ) : null
                          )}
                        </div>
                      )}
                    </td>

                    {/* CỘT 3: CHỈ ĐỊNH */}
                    <td
                      className={`cell-soap-content ${
                        isEditable ? 'editable-cell' : ''
                      } ${isEditingOrders ? 'is-editing' : ''}`}
                      onClick={() =>
                        isEditable && setEditingCell({ rowId: row.id, field: 'orders' })
                      }
                    >
                      {isEditable && isEditingOrders ? (
                        <AutoResizeCellTextarea
                          value={row.orders}
                          placeholder="Nhập chỉ định cận lâm sàng, thuốc điều trị, chăm sóc..."
                          onChange={(val) => handleCellChange(row.id, 'orders', val)}
                          onFinish={() => setEditingCell(null)}
                        />
                      ) : (
                        <div className="soap-text-block">
                          {row.orders || (
                            isEditable ? (
                              <span className="empty-cell-hint">
                                Nhấp chuột để nhập chỉ định...
                              </span>
                            ) : null
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CÁC THAO TÁC TRỰC TIẾP DƯỚI BẢNG */}
        {isEditable && (
          <div className="case-table-inline-actions" style={{ marginTop: '12px' }}>
            <button
              type="button"
              className="case-table-add-row-btn"
              onClick={handleAddRow}
              title="Thêm mốc diễn biến tiếp theo"
            >
              <Plus size={15} />
              <span>Thêm mốc diễn biến mới</span>
            </button>

            <div className="case-table-inline-hint">
              💡 <strong>Chỉnh sửa trực tiếp:</strong> Nhấp chuột vào bất kỳ ô nào trên bảng hoặc tiêu đề để gõ sửa rộng rãi. Bấm ra ngoài để tự động lưu.
            </div>
          </div>
        )}
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
  textAlign = 'left',
  fontWeight = 'normal',
}: {
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  onFinish: () => void;
  textAlign?: 'left' | 'center';
  fontWeight?: 'normal' | 'bold';
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
      style={{ textAlign, fontWeight }}
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
