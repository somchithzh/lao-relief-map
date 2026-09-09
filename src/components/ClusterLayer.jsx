import React, { useState } from 'react';
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Navigation, Share2, CheckCircle, RefreshCw } from 'lucide-react';

const createClusterIcon = (cluster) => {
  let bgClass = 'cluster-normal';
  let badgeIcon = '📍';

  if (cluster.hasUrgent) {
    bgClass = 'cluster-urgent';
    badgeIcon = '⚠️';
  } else if (cluster.hasSos) {
    bgClass = 'cluster-sos';
    badgeIcon = '🚨';
  }

  const size = cluster.count > 20 ? 44 : cluster.count > 5 ? 38 : 32;

  return L.divIcon({
    className: 'custom-cluster-wrapper',
    html: `
      <div class="custom-cluster-pin ${bgClass}" style="width: ${size}px; height: ${size}px;">
        <span class="cluster-badge">${badgeIcon}</span>
        <span class="cluster-count">${cluster.count}</span>
      </div>
    `,
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  });
};

function clusterReports(reports, map, enabled, radius = 50) {
  if (!enabled || !map) {
    return reports.map(r => ({ ...r, isCluster: false, reports: [r] }));
  }

  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < reports.length; i++) {
    if (visited.has(reports[i].id)) continue;

    const p1 = map.latLngToLayerPoint([reports[i].lat, reports[i].lng]);
    const clusterMembers = [reports[i]];
    visited.add(reports[i].id);

    let sumLat = reports[i].lat;
    let sumLng = reports[i].lng;

    for (let j = i + 1; j < reports.length; j++) {
      if (visited.has(reports[j].id)) continue;
      const p2 = map.latLngToLayerPoint([reports[j].lat, reports[j].lng]);
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      if (dist <= radius) {
        clusterMembers.push(reports[j]);
        visited.add(reports[j].id);
        sumLat += reports[j].lat;
        sumLng += reports[j].lng;
      }
    }

    if (clusterMembers.length > 1) {
      clusters.push({
        id: `cluster-${clusterMembers.map(m => m.id).join('-')}`,
        isCluster: true,
        lat: sumLat / clusterMembers.length,
        lng: sumLng / clusterMembers.length,
        count: clusterMembers.length,
        reports: clusterMembers,
        hasSos: clusterMembers.some(m => m.type === 'sos' && m.status !== 'resolved'),
        hasUrgent: clusterMembers.some(m => m.type === 'sos' && m.status !== 'resolved' && (Date.now() - new Date(m.created_at).getTime()) >= 24 * 3600 * 1000)
      });
    } else {
      clusters.push({
        ...reports[i],
        isCluster: false,
        reports: [reports[i]]
      });
    }
  }

  return clusters;
}

export default function ClusterLayer({
  reports,
  enableCluster,
  createCustomIcon,
  currentTime,
  setShareReport,
  handleMarkResolved,
  handleRenewReport,
  formatCountdown
}) {
  const map = useMap();
  const [, setVersion] = useState(0);

  useMapEvents({
    moveend() {
      setVersion(v => v + 1);
    },
    zoomend() {
      setVersion(v => v + 1);
    }
  });

  const clusters = clusterReports(reports, map, enableCluster);

  return (
    <>
      {clusters.map((item) => {
        if (item.isCluster) {
          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={createClusterIcon(item)}
              eventHandlers={{
                click: () => {
                  if (map.getZoom() < 16) {
                    map.flyTo([item.lat, item.lng], Math.min(18, map.getZoom() + 3), { duration: 0.8 });
                  }
                }
              }}
            >
              {map.getZoom() >= 16 && (
                <Popup>
                  <div className="popup-content">
                    <h4 style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                      📍 ພົບ {item.count} ເຫດການໃນຈຸດນີ້:
                    </h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {item.reports.map((r) => (
                        <div key={r.id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span className={`popup-badge pin-${r.status === 'resolved' ? 'resolved' : r.type}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {r.type === 'sos' ? '🚨 SOS' : r.type === 'warning' ? '⚠️ ເຕືອນ' : r.type === 'shelter' ? '🏠 ພັກເຊົາ' : '📦 ບໍລິຈາກ'}
                          </span>
                          <strong style={{ fontSize: '12px', display: 'block', margin: '2px 0' }}>{r.title}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{r.location_name} {r.phone ? `• ໂທ: ${r.phone}` : ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        }

        const report = item;
        const createdAt = new Date(report.created_at).getTime();
        const hoursPassed = (currentTime - createdAt) / (1000 * 60 * 60);
        const isUrgent = report.status !== 'resolved' && report.type === 'sos' && hoursPassed >= 24;

        return (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            icon={createCustomIcon(report, isUrgent)}
          >
            <Popup>
              <div className="popup-content">
                {report.image_url && (
                  <img
                    src={report.image_url}
                    alt="ພາບສະພາບຕົວຈິງ"
                    className="popup-image"
                    onClick={() => window.open(report.image_url, '_blank')}
                    title="ຄລິກເພື່ອເບິ່ງຮູບໃຫຍ່"
                  />
                )}

                {report.status === 'resolved' ? (
                  <div className="resolved-countdown-banner">
                    ⏱️ ✅ ຊ່ວຍເຫຼືອແລ້ວ • ໝຸດຈະຫາຍໄປໃນ: {formatCountdown(report.resolved_at, currentTime)}
                  </div>
                ) : isUrgent ? (
                  <div className="urgent-banner">
                    ⚠️ ດ່ວນພິເສດ: ລໍຖ້າມາແລ້ວເກີນ 24 ຊົ່ວໂມງ!
                  </div>
                ) : null}

                <span className={`popup-badge pin-${report.status === 'resolved' ? 'resolved' : report.type}`}>
                  {report.status === 'resolved' ? '✅ ແກ້ໄຂແລ້ວ' : (
                    <>
                      {report.type === 'sos' && '🚨 ຂໍຄວາມຊ່ວຍເຫຼືອ'}
                      {report.type === 'warning' && '⚠️ ແຈ້ງເຕືອນ'}
                      {report.type === 'shelter' && '🏠 ສູນພັກເຊົາ'}
                      {report.type === 'donation' && '📦 ຈຸດບໍລິຈາກ'}
                    </>
                  )}
                </span>

                <h3>{report.title}</h3>
                <p>{report.description}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  📍 {report.location_name} • 🕒 {Math.floor(hoursPassed)} ຊົ່ວໂມງຜ່ານມາ
                </p>

                <div style={{ marginTop: '10px' }}>
                  {report.phone && (
                    <a href={`tel:${report.phone}`} className="popup-phone" style={{ width: '100%', marginBottom: '6px' }}>
                      <Phone size={14} /> ໂທ: {report.phone}
                    </a>
                  )}

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-popup-nav"
                    >
                      <Navigation size={14} /> ນຳທາງ
                    </a>

                    <button
                      className="btn-popup-share"
                      onClick={() => setShareReport(report)}
                    >
                      <Share2 size={14} /> ແຊຣ໌
                    </button>
                  </div>
                </div>

                {report.status !== 'resolved' && (
                  <button
                    className="btn-action-resolve"
                    onClick={() => handleMarkResolved(report.id)}
                  >
                    <CheckCircle size={14} /> ຊ່ວຍເຫຼືອແລ້ວ
                  </button>
                )}

                {report.status !== 'resolved' && hoursPassed >= 48 && (
                  <button
                    className="btn-action-renew"
                    onClick={() => handleRenewReport(report.id)}
                  >
                    <RefreshCw size={14} /> ຍັງຕ້ອງການຊ່ວຍ
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
