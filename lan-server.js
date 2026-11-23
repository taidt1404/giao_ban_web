import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'server-data');
const BUNDLES_DIR = path.join(DATA_DIR, 'bundles');
const DATES_FILE = path.join(DATA_DIR, 'dates-index.json');

// Khởi tạo thư mục lưu trữ dữ liệu tập trung
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BUNDLES_DIR)) fs.mkdirSync(BUNDLES_DIR, { recursive: true });

function getSavedDates() {
  try {
    if (!fs.existsSync(DATES_FILE)) return [];
    const content = fs.readFileSync(DATES_FILE, 'utf-8');
    const list = JSON.parse(content);
    return Array.isArray(list) ? list.sort().reverse() : [];
  } catch {
    return [];
  }
}

function saveSavedDates(dates) {
  try {
    const uniqueSorted = Array.from(new Set(dates)).sort().reverse();
    fs.writeFileSync(DATES_FILE, JSON.stringify(uniqueSorted, null, 2), 'utf-8');
  } catch (err) {
    console.error('Lỗi lưu dates-index.json:', err);
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;
    req.on('data', (chunk) => {
      chunks.push(chunk);
      totalLength += chunk.length;
      if (totalLength > 50 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Dữ liệu tải lên quá lớn (>50MB)'));
      }
    });
    req.on('end', () => {
      try {
        const fullBuffer = Buffer.concat(chunks);
        const data = fullBuffer.toString('utf-8');
        resolve(data ? JSON.parse(data) : null);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const VIETNAMESE_REPAIR_PATTERNS = [
  [/Mệt\s+m\ufffd+i/gi, 'Mệt mỏi'],
  [/mệt\s+m\ufffd+i/gi, 'mệt mỏi'],
  [/m\ufffd+i\s+mệt/gi, 'mỏi mệt'],
  [/Tim\s+nh\ufffd+p\s+đều/gi, 'Tim nhịp đều'],
  [/nh\ufffd+p\s+đều/gi, 'nhịp đều'],
  [/nh\ufffd+p\s+nhanh/gi, 'nhịp nhanh'],
  [/nh\ufffd+p\s+thở/gi, 'nhịp thở'],
  [/c\ufffd+\s+sở/gi, 'cơ sở'],
  [/nhập\s+vi\ufffd+n/gi, 'nhập viện'],
  [/\ufffd+i\ufffd+u\s+trị/gi, 'điều trị'],
  [/đi\ufffd+u\s+trị/gi, 'điều trị'],
  [/tu\ufffd+i/gi, 'tuổi'],
  [/\ufffd+a\s+ch\ufffd+:/gi, 'Địa chỉ:'],
  [/Địa\s+ch\ufffd+:/gi, 'Địa chỉ:'],
  [/\ufffd+a\s+chỉ:/gi, 'Địa chỉ:'],
  [/PK\s+c\ufffd+p\s+cứu/gi, 'PK Cấp cứu'],
  [/c\ufffd+p\s+cứu/gi, 'cấp cứu'],
  [/C\ufffd+n\s+nặng/gi, 'Cân nặng'],
  [/c\ufffd+n\s+nặng/gi, 'cân nặng'],
  [/kh\ufffd+ng/gi, 'không'],
  [/b\ufffd+nh\s+nhân/gi, 'bệnh nhân'],
  [/B\ufffd+nh\s+nhân/gi, 'Bệnh nhân'],
  [/người\s+b\ufffd+nh/gi, 'người bệnh'],
  [/Người\s+b\ufffd+nh/gi, 'Người bệnh'],
  [/b\ufffd+nh\s+sử/gi, 'bệnh sử'],
  [/b\ufffd+nh\s+lý/gi, 'bệnh lý'],
  [/b\ufffd+nh/gi, 'bệnh'],
  [/B\ufffd+nh/gi, 'Bệnh'],
  [/b\ufffd+ng/gi, 'bụng'],
  [/B\ufffd+ng/gi, 'Bụng'],
  [/M\ufffd+u/g, 'Máu'],
  [/m\ufffd+u/g, 'máu'],
  [/lư\ufffd+ng/gi, 'lượng'],
  [/l\ufffd+ợng/gi, 'lượng'],
  [/thư\ufffd+ng/gi, 'thường'],
  [/Thư\ufffd+ng/gi, 'Thường'],
  [/đ\ufffd+u/gi, 'đầu'],
  [/Đ\ufffd+u/gi, 'Đầu'],
  [/t\ufffd+nh/gi, 'tỉnh'],
  [/T\ufffd+nh/gi, 'Tỉnh'],
  [/l\ufffd+n\/phút/gi, 'lần/phút'],
  [/l\ufffd+n/gi, 'lần'],
  [/ph\ufffd+t/gi, 'phút'],
  [/ph\ufffd+n/gi, 'phân'],
  [/ch\ufffd+a/gi, 'chưa'],
  [/Ch\ufffd+a/gi, 'Chưa'],
  [/s\ufffd+ng/gi, 'sàng'],
  [/hi\ufffd+n/gi, 'hiện'],
  [/Hi\ufffd+n/gi, 'Hiện'],
  [/xu\ufffd+t/gi, 'xuất'],
  [/Xu\ufffd+t/gi, 'Xuất'],
  [/m\ufffd+ch/gi, 'mạch'],
  [/M\ufffd+ch/gi, 'Mạch'],
  [/\ufffd+ịnh\s+lượng/gi, 'Định lượng'],
  [/Đ\ufffd+nh\s+lượng/gi, 'Định lượng'],
  [/chỉ\s+\ufffd+ịnh/gi, 'chỉ định'],
  [/Chỉ\s+\ufffd+ịnh/gi, 'Chỉ định'],
  [/chỉ\s+đ\ufffd+nh/gi, 'chỉ định'],
  [/Chỉ\s+đ\ufffd+nh/gi, 'Chỉ định'],
  [/r\ufffd+/gi, 'rõ'],
  [/ph\ufffd+i/gi, 'phổi'],
  [/Ph\ufffd+i/gi, 'Phổi'],
  [/c\ufffd+c/gi, 'các'],
  [/C\ufffd+c/gi, 'Các'],
  [/\ufffd+au/gi, 'đau'],
  [/Đau/gi, 'Đau'],
  [/\ufffd+ộ\s*C/gi, 'độ C'],
  [/đ\ufffd+\s*C/gi, 'độ C'],
  [/\ufffd+ược/gi, 'được'],
  [/đ\ufffd+ợc/gi, 'được'],
  [/d\ufffd+t/gi, 'dặt'],
  [/niêm\s+m\ufffd+c/gi, 'niêm mạc'],
  [/Niêm\s+m\ufffd+c/gi, 'Niêm mạc'],
  [/c\ufffd+ng\s+tức/gi, 'căng tức'],
  [/c\ufffd+\s+chân/gi, 'cẳng chân'],
  [/m\ufffd+ng\s+não/gi, 'màng não'],
  [/m\ufffd+m/gi, 'mềm'],
  [/d\ufffd+ch/gi, 'dịch'],
  [/kh\ufffd+m/gi, 'khám'],
  [/Kh\ufffd+m/gi, 'Khám'],
  [/ch\ufffd+m/gi, 'chẩm'],
  [/ti\ufffd+ng/gi, 'tiếng'],
  [/Ti\ufffd+ng/gi, 'Tiếng'],
  [/ngư\ufffd+i/gi, 'người'],
  [/Ngư\ufffd+i/gi, 'Người'],
  [/xư\ufffd+ng/gi, 'xương'],
  [/Xư\ufffd+ng/gi, 'Xương'],
  [/v\ufffd+t\s+thương/gi, 'vết thương'],
  [/V\ufffd+t\s+thương/gi, 'Vết thương'],
  [/x\ufffd+\s+trí/gi, 'xử trí'],
  [/X\ufffd+\s+trí/gi, 'Xử trí'],
  [/ng\ufffd+c/gi, 'ngực'],
  [/Ng\ufffd+c/gi, 'Ngực'],
  [/đi\ufffd+m/gi, 'điểm'],
  [/Đi\ufffd+m/gi, 'Điểm'],
  [/ch\ufffd+ng/gi, 'chướng'],
  [/s\ufffd+t/gi, 'sốt'],
  [/S\ufffd+t/gi, 'Sốt'],
  [/nhi\ufffd+u/gi, 'nhiều'],
  [/Nhi\ufffd+u/gi, 'Nhiều'],
  [/tuy\ufffd+n\s+giáp/gi, 'tuyến giáp'],
  [/n\ufffd+n/gi, 'nắn'],
  [/ngw\ufffd+i|ngo\ufffd+i/gi, 'ngoài'],
  [/Ngo\ufffd+i/gi, 'Ngoài'],
  [/đ\ufffd+c\s+biệt/gi, 'đặc biệt'],
  [/đặc\s+bi\ufffd+t/gi, 'đặc biệt'],
  [/h\ufffd+nh\s+ảnh/gi, 'hình ảnh'],
  [/hình\s+\ufffd+nh/gi, 'hình ảnh'],
  [/Hi\ufffd+p\s+Hòa/gi, 'Hiệp Hòa'],
  [/chuy\ufffd+n\s+viện/gi, 'chuyển viện'],
  [/Chuy\ufffd+n\s+viện/gi, 'Chuyển viện'],
  [/chuy\ufffd+n/gi, 'chuyển'],
  [/Chuy\ufffd+n/gi, 'Chuyển'],
  [/vi\ufffd+n/gi, 'viện'],
  [/Vi\ufffd+n/gi, 'Viện'],
  [/ngo\ufffd+i\s+trú/gi, 'ngoại trú'],
  [/n\ufffd+i\s+trú/gi, 'nội trú'],
  [/ngo\ufffd+i\s+giờ/gi, 'ngoài giờ'],
  [/ti\ufffd+n\s+sử/gi, 'tiền sử'],
  [/Ti\ufffd+n\s+sử/gi, 'Tiền sử'],
  [/ti\ufffd+n\s+lượng/gi, 'tiên lượng'],
  [/Ti\ufffd+n\s+lượng/gi, 'Tiên lượng'],
  [/hư\ufffd+ng\s+điều\s+trị/gi, 'hướng điều trị'],
  [/Hư\ufffd+ng\s+điều\s+trị/gi, 'Hướng điều trị'],
  [/qu\ufffd+n\s+cơn/gi, 'quặn cơn'],
  [/bu\ufffd+n\s+nôn/gi, 'buồn nôn'],
  [/Bu\ufffd+n\s+nôn/gi, 'Buồn nôn'],
  [/ch\ufffd+ng\s+mặt/gi, 'chóng mặt'],
  [/h\ufffd+ng\s+nhạt/gi, 'hồng nhạt'],
  [/tr\ufffd+o\s+ngược/gi, 'trào ngược'],
  [/d\ufffd+\s+dày/gi, 'dạ dày'],
  [/c\ufffd+n\s+lâm\s+sàng/gi, 'cận lâm sàng'],
  [/C\ufffd+n\s+lâm\s+sàng/gi, 'Cận lâm sàng'],
  [/đ\ufffd+n\s+thuốc/gi, 'đơn thuốc'],
  [/Đ\ufffd+n\s+thuốc/gi, 'Đơn thuốc'],
  [/v\ufffd+t\s+tư/gi, 'vật tư'],
  [/V\ufffd+t\s+tư/gi, 'Vật tư'],
  [/ch\ufffd+m\s+sóc/gi, 'chăm sóc'],
  [/Ch\ufffd+m\s+sóc/gi, 'Chăm sóc'],
  [/theo\s+d\ufffd+i/gi, 'theo dõi'],
  [/Theo\s+d\ufffd+i/gi, 'Theo dõi'],
  [/truy\ufffd+n/gi, 'truyền'],
  [/Truy\ufffd+n/gi, 'Truyền'],
  [/ti\ufffd+m/gi, 'tiêm'],
  [/Ti\ufffd+m/gi, 'Tiêm'],
  [/v\ufffd+ng\s+hạ\s+vị/gi, 'vùng hạ vị'],
  [/v\ufffd+ng\s+bụng/gi, 'vùng bụng'],
  [/v\ufffd+ng/gi, 'vùng'],
  [/V\ufffd+ng/gi, 'Vùng'],
  [/dư\ufffd+i\s+rốn/gi, 'dưới rốn'],
  [/dư\ufffd+i/gi, 'dưới'],
  [/r\ufffd+n/gi, 'rốn'],
  [/kh\ufffd+\s+thở/gi, 'khó thở'],
  [/kh\ufffd+/gi, 'khó'],
  [/th\ufffd+/gi, 'thở'],
  [/đ\ufffd+\s+xử\s+trí/gi, 'đã xử trí'],
  [/ch\ufffd+a\s+xử\s+trí/gi, 'chưa xử trí'],
  [/c\ufffd+m\s+ứng/gi, 'cảm ứng'],
  [/th\ufffd+nh\s+bụng/gi, 'thành bụng'],
  [/ti\ufffd+u\s+tiện/gi, 'tiểu tiện'],
  [/đ\ufffd+i\s+tiện/gi, 'đại tiện'],
  [/kh\ufffd+ng\s+liệt/gi, 'không liệt'],
  [/gi\ufffd+m/gi, 'giảm'],
];

function repairVietnameseText(str) {
  if (typeof str !== 'string' || !str.includes('\ufffd')) return str;
  let res = str;
  for (const [pattern, repl] of VIETNAMESE_REPAIR_PATTERNS) {
    res = res.replace(pattern, repl);
  }
  return res;
}

function sendJson(res, statusCode, data) {
  const jsonStr = JSON.stringify(data);
  const jsonBuf = Buffer.from(jsonStr, 'utf-8');
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': jsonBuf.length,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache',
  });
  res.end(jsonBuf);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const server = http.createServer(async (req, res) => {
  const method = req.method ? req.method.toUpperCase() : 'GET';
  const cleanUrl = (req.url || '/').split('?')[0];

  // Hỗ trợ CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // ============================================================
  // BACKEND API CHO MÁY CHỦ LƯU TRỮ CHUNG
  // ============================================================
  if (cleanUrl.startsWith('/api/')) {
    try {
      // 1. Kiểm tra trạng thái máy chủ
      if (cleanUrl === '/api/status' && method === 'GET') {
        return sendJson(res, 200, { ok: true, mode: 'server-storage' });
      }

      // 2. Lấy danh sách các ngày đã có dữ liệu trên máy chủ
      if (cleanUrl === '/api/dates' && method === 'GET') {
        const dates = getSavedDates();
        return sendJson(res, 200, { dates, total: dates.length });
      }

      // 3. Lấy dữ liệu của 1 ngày cụ thể: GET /api/bundle/YYYY-MM-DD
      if (cleanUrl.startsWith('/api/bundle/') && method === 'GET') {
        const dateStr = cleanUrl.replace('/api/bundle/', '');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return sendJson(res, 400, { error: 'Định dạng ngày không hợp lệ (cần YYYY-MM-DD)' });
        }
        const filePath = path.join(BUNDLES_DIR, `${dateStr}.json`);
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf-8');
          if (content.includes('\ufffd')) {
            content = repairVietnameseText(content);
            try {
              fs.writeFileSync(filePath, content, 'utf-8');
            } catch {}
          }
          const bundle = JSON.parse(content);
          return sendJson(res, 200, { bundle, isExisting: true });
        } else {
          return sendJson(res, 200, { bundle: null, isExisting: false });
        }
      }

      // 4. Lưu dữ liệu của 1 ngày: POST /api/bundle
      if (cleanUrl === '/api/bundle' && method === 'POST') {
        const payload = await readJsonBody(req);
        const bundle = payload?.bundle;
        if (!bundle || !bundle.date || !/^\d{4}-\d{2}-\d{2}$/.test(bundle.date)) {
          return sendJson(res, 400, { error: 'Bundle không hợp lệ hoặc thiếu ngày' });
        }

        const dateStr = bundle.date;
        const filePath = path.join(BUNDLES_DIR, `${dateStr}.json`);
        const updatedBundle = {
          ...bundle,
          updatedAt: new Date().toISOString(),
        };

        fs.writeFileSync(filePath, JSON.stringify(updatedBundle, null, 2), 'utf-8');

        // Cập nhật index ngày
        const dates = getSavedDates();
        if (!dates.includes(dateStr)) {
          dates.push(dateStr);
          saveSavedDates(dates);
        }

        console.log(`[LƯU MÁY CHỦ] Đã lưu dữ liệu ngày ${dateStr} thành công từ IP: ${req.socket.remoteAddress}`);
        return sendJson(res, 200, { success: true, date: dateStr });
      }

      // 5. Xóa dữ liệu của 1 ngày: DELETE /api/bundle/YYYY-MM-DD
      if (cleanUrl.startsWith('/api/bundle/') && method === 'DELETE') {
        const dateStr = cleanUrl.replace('/api/bundle/', '');
        const filePath = path.join(BUNDLES_DIR, `${dateStr}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        const dates = getSavedDates().filter((d) => d !== dateStr);
        saveSavedDates(dates);
        return sendJson(res, 200, { success: true, deletedDate: dateStr });
      }

      // 6. Đồng bộ toàn bộ dữ liệu từ LocalStorage máy client lên Server: POST /api/sync-legacy
      if (cleanUrl === '/api/sync-legacy' && method === 'POST') {
        const payload = await readJsonBody(req);
        const allData = payload?.allData || {};
        const clientDates = payload?.dates || Object.keys(allData);

        let syncedCount = 0;
        const currentDates = getSavedDates();

        for (const d of clientDates) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(d) && allData[d]) {
            const filePath = path.join(BUNDLES_DIR, `${d}.json`);
            // Nếu trên server chưa có, hoặc dữ liệu client có updatedAt mới hơn -> lưu vào server
            let shouldSave = false;
            if (!fs.existsSync(filePath)) {
              shouldSave = true;
            } else {
              try {
                const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if (
                  new Date(allData[d].updatedAt || 0) >
                  new Date(existing.updatedAt || 0)
                ) {
                  shouldSave = true;
                }
              } catch {
                shouldSave = true;
              }
            }

            if (shouldSave) {
              fs.writeFileSync(filePath, JSON.stringify(allData[d], null, 2), 'utf-8');
              if (!currentDates.includes(d)) {
                currentDates.push(d);
              }
              syncedCount++;
            }
          }
        }

        saveSavedDates(currentDates);
        console.log(`[ĐỒNG BỘ] Đã đồng bộ ${syncedCount} ngày từ trình duyệt lên máy chủ!`);
        return sendJson(res, 200, { success: true, syncedCount, totalDates: currentDates.length });
      }

      // 7. Xuất toàn bộ dữ liệu backup từ server: GET /api/export-all
      if (cleanUrl === '/api/export-all' && method === 'GET') {
        const dates = getSavedDates();
        const allData = {};
        for (const d of dates) {
          const filePath = path.join(BUNDLES_DIR, `${d}.json`);
          if (fs.existsSync(filePath)) {
            try {
              allData[d] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            } catch {}
          }
        }
        return sendJson(res, 200, {
          exportVersion: '1.0',
          exportedAt: new Date().toISOString(),
          allData,
          dates,
        });
      }

      return sendJson(res, 404, { error: 'API endpoint không tồn tại' });
    } catch (err) {
      console.error('Lỗi xử lý API:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi máy chủ' });
    }
  }

  // ============================================================
  // PHỤC VỤ FILE TĨNH (HTML, CSS, JS) CHO TRÌNH DUYỆT
  // ============================================================
  let filePath = path.join(DIST_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);

  // Chuẩn hóa đường dẫn tránh Path Traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    // Nếu file không tồn tại hoặc là thư mục, fallback về index.html cho React SPA
    if (err || stats.isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
        return;
      }

      const headers = {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      };
      if (ext === '.html') {
        headers['Cache-Control'] = 'no-cache';
      } else {
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
      }

      res.writeHead(200, headers);
      res.end(content);
    });
  });
});

function autoRepairAllBundles() {
  try {
    if (!fs.existsSync(BUNDLES_DIR)) return;
    const files = fs.readdirSync(BUNDLES_DIR).filter((f) => f.endsWith('.json'));
    let repairedFilesCount = 0;
    for (const f of files) {
      const p = path.join(BUNDLES_DIR, f);
      const raw = fs.readFileSync(p, 'utf-8');
      if (raw.includes('\ufffd')) {
        const fixed = repairVietnameseText(raw);
        if (fixed !== raw) {
          fs.writeFileSync(p, fixed, 'utf-8');
          repairedFilesCount++;
        }
      }
    }
    if (repairedFilesCount > 0) {
      console.log(`[TỰ ĐỘNG PHỤC HỒI] Đã tự động sửa lỗi font tiếng Việt cho ${repairedFilesCount} ngày báo cáo.`);
    }
  } catch (err) {
    console.error('Lỗi khi tự động phục hồi font:', err);
  }
}

autoRepairAllBundles();

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n===============================================================');
  console.log('   HỆ THỐNG BÁO CÁO GIAO BAN BỆNH VIỆN - MÁY CHỦ LƯU TRỮ CHUNG  ');
  console.log('===============================================================');
  console.log(`- Xem tại máy chủ:         http://localhost:${PORT}`);
  console.log(`- Các khoa phòng truy cập:   http://192.168.110.110:${PORT}`);
  console.log(`- Thư mục lưu dữ liệu chung: ${DATA_DIR}`);
  console.log('===============================================================');
  console.log(' [!] Toàn bộ dữ liệu của các khoa phòng sẽ được lưu chung tại đây.\n');
});
