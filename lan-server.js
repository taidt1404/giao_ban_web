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
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 50 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Dữ liệu tải lên quá lớn (>50MB)'));
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : null);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache',
  });
  res.end(JSON.stringify(data));
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
          const content = fs.readFileSync(filePath, 'utf-8');
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
