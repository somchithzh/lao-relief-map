import React from 'react';
import { Phone, Navigation, Share2, CheckCircle, RefreshCw, MapPin, AlertCircle, Clock } from 'lucide-react';

export default function ReportListView({
  reports,
  currentTime,
  setShareReport,
  handleMarkResolved,
  handleRenewReport,
  formatCountdown,
  onShowOnMap
}) {
  if (reports.length === 0) {
    return (
      <div className="report-list-empty">
        <AlertCircle size={40} color="#94a3b8" />
        <h3>ບໍ່ພົບລາຍການເຫດການ</h3>
        <p>ລອງປ່ຽນຕົວກັ່ນຕອງ ຫຼື ຄົ້ນຫາພື້ນທີ່ອື່ນ</p>
      </div>
    );
  }

  return (
    <div className="report-list-container">
      <div className="report-list-header-info">
        <span>ພົບທັງໝົດ <strong>{reports.length}</strong> ເຫດການ</span>
        <span style={{ fontSize: '11.5px', color: '#64748b' }}>ລຽງຕາມເວລາລ່າສຸດ</span>
      </div>

      <div className="report-cards-grid">
        {reports.map((report) => {
          const createdAt = new Date(report.created_at).getTime();
          const hoursPassed = (currentTime - createdAt) / (1000 * 60 * 60);
          const isUrgent = report.status !== 'resolved' && report.type === 'sos' && hoursPassed >= 24;

          return (
            <div key={report.id} className={`report-feed-card ${isUrgent ? 'card-urgent' : ''}`}>
              {report.image_url && (
                <div className="feed-card-image-wrap">
                  <img
                    src={report.image_url}
                    alt={report.title}
                    className="feed-card-img"
                    onClick={() => window.open(report.image_url, '_blank')}
                    title="ຄລິກເພື່ອເບິ່ງຮູບໃຫຍ່"
                  />
                </div>
              )}

              <div className="feed-card-body">
                {report.status === 'resolved' ? (
                  <div className="resolved-countdown-banner" style={{ fontSize: '11.5px', padding: '5px 8px', marginBottom: '8px' }}>
                    ⏱️ ✅ ຊ່ວຍເຫຼືອແລ້ວ • ໝຸດຈະຫາຍໄປໃນ: {formatCountdown(report.resolved_at, currentTime)}
                  </div>
                ) : isUrgent ? (
                  <div className="urgent-banner" style={{ fontSize: '11.5px', padding: '5px 8px', marginBottom: '8px' }}>
                    ⚠️ ດ່ວນພິເສດ: ລໍຖ້າມາແລ້ວເກີນ 24 ຊົ່ວໂມງ!
                  </div>
                ) : null}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={`popup-badge pin-${report.status === 'resolved' ? 'resolved' : report.type}`} style={{ margin: 0 }}>
                    {report.status === 'resolved' ? '✅ ແກ້ໄຂແລ້ວ' : (
                      <>
                        {report.type === 'sos' && '🚨 ຂໍຄວາມຊ່ວຍເຫຼືອ'}
                        {report.type === 'warning' && '⚠️ ແຈ້ງເຕືອນ'}
                        {report.type === 'shelter' && '🏠 ສູນພັກເຊົາ'}
                        {report.type === 'donation' && '📦 ຈຸດບໍລິຈາກ'}
                      </>
                    )}
                  </span>

                  <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} /> {Math.floor(hoursPassed)} ຊົ່ວໂມງຜ່ານມາ
                  </span>
                </div>

                <h3 className="feed-card-title">{report.title}</h3>
                {report.description && (
                  <p className="feed-card-desc">{report.description}</p>
                )}

                <div className="feed-card-location">
                  <MapPin size={13} color="#2563eb" style={{ flexShrink: 0 }} />
                  <span>{report.location_name}</span>
                </div>

                <div className="feed-card-actions">
                  {report.phone && (
                    <a href={`tel:${report.phone}`} className="feed-btn feed-btn-call">
                      <Phone size={13} /> ໂທ: {report.phone}
                    </a>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="feed-btn feed-btn-nav"
                  >
                    <Navigation size={13} /> ນຳທາງ
                  </a>

                  <button
                    className="feed-btn feed-btn-map"
                    onClick={() => onShowOnMap(report)}
                  >
                    <MapPin size={13} /> ເທິງແຜນທີ່
                  </button>

                  <button
                    className="feed-btn feed-btn-share"
                    onClick={() => setShareReport(report)}
                  >
                    <Share2 size={13} /> ແຊຣ໌
                  </button>
                </div>

                {report.status !== 'resolved' && (
                  <button
                    className="btn-action-resolve"
                    onClick={() => handleMarkResolved(report.id)}
                    style={{ marginTop: '8px' }}
                  >
                    <CheckCircle size={14} /> ຊ່ວຍເຫຼືອແລ້ວ
                  </button>
                )}

                {report.status !== 'resolved' && hoursPassed >= 48 && (
                  <button
                    className="btn-action-renew"
                    onClick={() => handleRenewReport(report.id)}
                    style={{ marginTop: '6px' }}
                  >
                    <RefreshCw size={14} /> ຍັງຕ້ອງການຊ່ວຍ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
