import type { FreeTextSlideData } from '../data/freeTextReport';

type Props = {
  data: FreeTextSlideData;
};

export default function FreeTextSlidePreview({ data }: Props) {
  return (
    <div className="slide-wrap">
      <div className="slide slide-freetext">
        <div className="freetext-slide-header">
          <h1 className="freetext-slide-title">{data.title || 'TIÊU ĐỀ SLIDE'}</h1>
        </div>

        <div className="freetext-content-area">
          {data.items.length === 0 ? (
            <div className="freetext-empty-placeholder">
              Chưa có nội dung. Bấm &quot;+ Thêm mục&quot; ở bảng bên phải để bắt đầu nhập.
            </div>
          ) : (
            data.items.map((item, index) => {
              // Tách các dòng của nội dung
              const lines = item.content.split('\n');
              const firstLine = lines[0] || '';
              const restLines = lines.slice(1);

              return (
                <div className="freetext-record-item" key={item.id}>
                  <div className="freetext-line first-line">
                    <span className="freetext-index font-bold">{index + 1}, </span>
                    <span className="freetext-body font-bold">{firstLine}</span>
                  </div>
                  {restLines.map((line, lIndex) => (
                    <div className="freetext-line sub-line" key={lIndex}>
                      {line}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
