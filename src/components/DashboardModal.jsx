import React from 'react';
import { X, BarChart3, Download, ShieldAlert, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

const LAO_PROVINCES = [
  'ນະຄອນຫຼວງວຽງຈັນ', 'ວຽງຈັນ', 'ຫຼວງພະບາງ', 'ຄຳມ່ວນ', 'ສະຫວັນນະເຂດ',
  'ຈຳປາສັກ', 'ບໍລິຄຳໄຊ', 'ໄຊຍະບູລີ', 'ຜົ້ງສາລີ', 'ຫົວພັນ',
  'ຊຽງຂວາງ', 'ອຸດົມໄຊ', 'ບໍ່ແກ້ວ', 'ຫຼວງນ້ຳທາ', 'ສາລະວັນ',
  'ເຊກອງ', 'ອັດຕະປື', 'ໄຊສົມບູນ'
];

export default function DashboardModal({ isOpen, onClose, reports, activeReports, currentTime }) {
  if (!isOpen) return null;

  const total = activeReports.length;
  const sosCount = activeReports.filter(r => r.type === 'sos' && r.status !== 'resolved').length;
  const roadCount = activeReports.filter(r => r.type === 'road' && r.status !== 'resolved').length;
  const urgentCount = activeReports.filter(r => {
    const createdAt = new Date(r.created_at).getTime();
    const hoursPassed = (currentTime - createdAt) / (1000 * 60 * 60);
    return r.type === 'sos' && r.status !== 'resolved' && hoursPassed >= 24;
  }).length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const resolutionRate = total + resolvedCount > 0 
    ? Math.round((resolvedCount / (total + resolvedCount)) * 100) 
    : 0;

  // ແຍກຕາມແຂວງ
  const provinceStats = {};
  activeReports.forEach(r => {
    const loc = r.location_name || '';
    let matched = 'ອື່ນໆ';
    for (const p of LAO_PROVINCES) {
      if (loc.includes(p)) {
        matched = p;
        break;
      }
    }
    provinceStats[matched] = (provinceStats[matched] || 0) + 1;
  });

  const provinceList = Object.keys(provinceStats).map(name => ({
    name,
    count: provinceStats[name]
  }));
  provinceList.sort((a, b) => b.count - a.count);
  const topProvinces = provinceList.slice(0, 6);
  const maxCount = Math.max(...topProvinces.map(p => p.count), 1);
  const hasProvinces = topProvinces.length > 0;

  // ຟັງຊັນສ້າງຮູບ Infographic
  const handleDownloadInfographic = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ພື້ນຫຼັງ
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // ກອບ
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1020, 1290);

    // Header Badge
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(80, 70, 920, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️ Lao Relief Map (ແຜນທີ່ຊ່ວຍເຫຼືອໄພພິບັດ)', 540, 140);

    // ຫົວຂໍ້
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('ລາຍງານສະຫຼຸບສະຖານະການໄພພິບັດລ່າສຸດ', 540, 240);

    const nowStr = new Date().toLocaleString('lo-LA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px sans-serif';
    ctx.fillText(`ອັບເດດເມື່ອ: ${nowStr} • somchithzh.github.io/lao-relief-map`, 540, 285);

    // 4 ກາດສະຖິຕິ
    const drawBox = (x, y, w, h, title, val, sub, bgColor, borderColor) => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, x + 25, y + 55);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText(val.toString(), x + 25, y + 135);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '22px sans-serif';
      ctx.fillText(sub, x + 25, y + 180);
    };

    drawBox(80, 330, 440, 210, '🚨 ຂໍຄວາມຊ່ວຍເຫຼືອ', sosCount, 'ກຳລັງລໍຖ້າການຊ່ວຍເຫຼືອ', '#7f1d1d', '#ef4444');
    drawBox(560, 330, 440, 210, '🚧 ສະພາບເສັ້ນທາງ', roadCount, 'ທາງຕັດຂາດ / ນ້ຳຖ້ວມທາງ', '#7c2d12', '#f97316');
    drawBox(80, 570, 440, 210, '⚠️ ດ່ວນ (ເກີນ 24h)', urgentCount, 'ຍັງບໍ່ມີຄົນໄປຊ່ວຍ', '#831843', '#f43f5e');
    drawBox(560, 570, 440, 210, '✅ ຊ່ວຍເຫຼືອແລ້ວ', resolvedCount, `ສຳເລັດແລ້ວ ${resolutionRate}%`, '#064e3b', '#10b981');

    // ສ່ວນແຂວງ
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(80, 810, 920, 320);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 810, 920, 320);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📍 ແຂວງທີ່ຖືກກະທົບຫຼາຍທີ່ສຸດ:', 110, 860);

    let py = 915;
    topProvinces.forEach((item, idx) => {
      const col = idx < 3 ? 0 : 1;
      const px = col === 0 ? 110 : 560;
      const rowY = py + (idx % 3) * 55;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`${idx + 1}. ${item.name}:`, px, rowY);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`${item.count} ຈຸດ`, px + 300, rowY);
    });

    // Footer
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(80, 1160, 920, 120);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(80, 1160, 920, 120);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📞 ເບີສຸກເສີນ: ດັບເພີງ 1190 • ກູ້ໄພ 1623 • ແພດ 1195', 540, 1215);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText('ຕິດຕາມສະຖານະການ: somchithzh.github.io/lao-relief-map', 540, 1255);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `lao-relief-summary-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content dashboard-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="dashboard-icon-wrap">
              <BarChart3 size={22} color="#ffffff" />
            </div>
            <div>
              <h2 className="dashboard-title">ສະຫຼຸບສະຖານະການ & ສະຖິຕິ</h2>
              <span className="dashboard-subtitle">
                ຂໍ້ມູນ Real-time ຈາກ Lao Relief Map
              </span>
            </div>
          </div>
          <button className="btn-dashboard-close" onClick={onClose} title="ປິດ">
            <X size={18} />
          </button>
        </div>

        {/* ປຸ່ມດາວໂຫຼດ Infographic */}
        <div className="dashboard-action-banner">
          <div>
            <div style={{ fontWeight: '800', fontSize: '13.5px', color: '#0f172a' }}>
              📸 ສົ່ງອອກຮູບສະຫຼຸບ (Infographic)
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              ດາວໂຫຼດຮູບສະຫຼຸບພາບລວມ ໄປໂພສລົງ Facebook / WhatsApp
            </div>
          </div>
          <button className="btn-export-image" onClick={handleDownloadInfographic}>
            <Download size={15} />
            <span>ບັນທຶກເປັນຮູບ</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="dashboard-body">
          <div className="dashboard-grid-cards">
            <div className="dash-card dash-card-sos">
              <div className="dash-card-icon-title">
                <ShieldAlert size={18} color="#ef4444" />
                <span>ຂໍຄວາມຊ່ວຍເຫຼືອ</span>
              </div>
              <div className="dash-card-number" style={{ color: '#dc2626' }}>{sosCount}</div>
              <div className="dash-card-sub">ກຳລັງລໍຖ້າການຊ່ວຍເຫຼືອ</div>
            </div>

            <div className="dash-card dash-card-road">
              <div className="dash-card-icon-title">
                <span style={{ fontSize: '15px' }}>🚧</span>
                <span>ສະພາບເສັ້ນທາງ</span>
              </div>
              <div className="dash-card-number" style={{ color: '#ea580c' }}>{roadCount}</div>
              <div className="dash-card-sub">ທາງຕັດຂາດ / ນ້ຳຖ້ວມ</div>
            </div>

            <div className="dash-card dash-card-urgent">
              <div className="dash-card-icon-title">
                <AlertTriangle size={18} color="#f43f5e" />
                <span>ດ່ວນ (ເກີນ 24 ຊມ)</span>
              </div>
              <div className="dash-card-number" style={{ color: '#f43f5e' }}>{urgentCount}</div>
              <div className="dash-card-sub">ຍັງບໍ່ມີຄົນໄປຊ່ວຍ</div>
            </div>

            <div className="dash-card dash-card-resolved">
              <div className="dash-card-icon-title">
                <CheckCircle size={18} color="#10b981" />
                <span>ຊ່ວຍເຫຼືອແລ້ວ</span>
              </div>
              <div className="dash-card-number" style={{ color: '#059669' }}>{resolvedCount}</div>
              <div className="dash-card-sub">ສຳເລັດ {resolutionRate}%</div>
            </div>
          </div>

          {/* ແຂວງທີ່ຖືກກະທົບຫຼາຍສຸດ */}
          <div className="dash-province-section">
            <h3 className="dash-section-title">
              <MapPin size={16} color="#0284c7" /> ແຂວງທີ່ມີເຫດການຫຼາຍທີ່ສຸດ
            </h3>
            {hasProvinces ? (
              <div className="dash-province-list">
                {topProvinces.map((item, idx) => {
                  const percent = Math.min(100, Math.round((item.count / maxCount) * 100));
                  return (
                    <div key={item.name} className="dash-province-item">
                      <div className="prov-info">
                        <span className="prov-rank">{idx + 1}</span>
                        <span className="prov-name">{item.name}</span>
                      </div>
                      <div className="prov-bar-wrap">
                        <div className="prov-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="prov-count">{item.count} ຈຸດ</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '12px', padding: '10px 0' }}>
                ຍັງບໍ່ມີຂໍ້ມູນເຫດການໃນແຕ່ລະແຂວງ
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          <span>ແບ່ງປັນຂໍ້ມູນນີ້ເພື່ອຊ່ວຍເຫຼືອຜູ້ປະສົບໄພ • Lao Relief Map</span>
        </div>
      </div>
    </div>
  );
}
