import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Plus, Phone, X, MapPin, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from './supabase';
import './App.css';

const createCustomIcon = (report, isUrgent) => {
  let colorClass = 'pin-' + report.type;
  if (report.status === 'resolved') {
    colorClass = 'pin-resolved';
  } else if (isUrgent) {
    colorClass += ' pin-urgent';
  }

  let iconSymbol = '🚨';
  if (report.status === 'resolved') {
    iconSymbol = '✅';
  } else if (report.type === 'warning') {
    iconSymbol = '⚠️';
  } else if (report.type === 'shelter') {
    iconSymbol = '🏠';
  } else if (report.type === 'donation') {
    iconSymbol = '📦';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="custom-pin ${colorClass}">${iconSymbol}</div>`,
    iconSize: [34, 34],
    iconAnchor:,
    popupAnchor: [0, -17],
  });
};

function LocationPicker({ isPicking, onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (isPicking) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function App() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'sos',
    description: '',
    locationName: '',
    phone: '',
    lat: 17.9757,
    lng: 102.6331
  });

  const fetchReports = async () => {
    try {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel('realtime-reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    setIsPickingLocation(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reports').insert([
        {
          type: formData.type,
          title: formData.title,
          description: formData.description,
          location_name: formData.locationName,
          phone: formData.phone,
          lat: formData.lat,
          lng: formData.lng,
          status: 'pending'
        }
      ]);

      if (!error) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          type: 'sos',
          description: '',
          locationName: '',
          phone: '',
          lat: 17.9757,
          lng: 102.6331
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkResolved = async (id) => {
    if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຈຸດນີ້ໄດ້ຮັບການຊ່ວຍເຫຼືອ ຫຼື ແກ້ໄຂແລ້ວ?')) return;
    await supabase
      .from('reports')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', id);
    fetchReports();
  };

  const handleRenewReport = async (id) => {
    await supabase
      .from('reports')
      .update({ created_at: new Date().toISOString() })
      .eq('id', id);
    fetchReports();
    alert('ຕໍ່ອາຍຸການແຈ້ງເຕືອນສຳເລັດແລ້ວ!');
  };

  const activeReports = reports.filter((r) => {
    const now = new Date();
    const createdAt = new Date(r.created_at);
    const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);

    if (r.status === 'resolved') {
      if (!r.resolved_at) return true;
      const hoursSinceResolved = (now - new Date(r.resolved_at)) / (1000 * 60 * 60);
      return hoursSinceResolved <= 24;
    } else {
      return hoursSinceCreated <= 72;
    }
  });

  const filteredReports = filter === 'all' 
    ? activeReports 
    : activeReports.filter((r) => r.type === filter);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <ShieldAlert color="#dc2626" size={26} />
          <div>
            <h1>Lao Relief Map (ແຜນທີ່ຊ່ວຍເຫຼືອໄພພິບັດ)</h1>
            <span>ລະບົບລາຍງານ ແລະ ຊ່ວຍເຫຼືອສຸກເສີນ Real-time</span>
          </div>
        </div>
        <button className="btn-report" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          ລາຍງານເຫດດ່ວນ
        </button>
      </header>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ທັງໝົດ ({activeReports.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'sos' ? 'active' : ''}`}
          onClick={() => setFilter('sos')}
        >
          🚨 ຂໍຄວາມຊ່ວຍເຫຼືອ
        </button>
        <button 
          className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
          onClick={() => setFilter('warning')}
        >
          ⚠️ ແຈ້ງເຕືອນ/ທາງຂາດ
        </button>
        <button 
          className={`filter-btn ${filter === 'shelter' ? 'active' : ''}`}
          onClick={() => setFilter('shelter')}
        >
          🏠 ສູນພັກເຊົາ
        </button>
        <button 
          className={`filter-btn ${filter === 'donation' ? 'active' : ''}`}
          onClick={() => setFilter('donation')}
        >
          📦 ຈຸດບໍລິຈາກ
        </button>
      </div>

      <div className="map-wrapper">
        {isPickingLocation && (
          <div style={{
            position: 'absolute',
            top: 15,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: '#1f2937',
            color: 'white',
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={16} color="#ef4444" />
            ກົດຈິ້ມໃສ່ຈຸດເກີດເຫດເທິງແຜນທີ່...
          </div>
        )}

        <MapContainer 
          center={[18.5, 103.5]} 
          zoom={7} 
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationPicker 
            isPicking={isPickingLocation} 
            onLocationSelect={handleLocationSelect} 
          />

          {filteredReports.map((report) => {
            const now = new Date();
            const createdAt = new Date(report.created_at);
            const hoursPassed = (now - createdAt) / (1000 * 60 * 60);
            const isUrgent = report.status !== 'resolved' && report.type === 'sos' && hoursPassed >= 24;

            return (
              <Marker 
                key={report.id} 
                position={[report.lat, report.lng]} 
                icon={createCustomIcon(report, isUrgent)}
              >
                <Popup>
                  <div className="popup-content">
                    {report.status === 'resolved' ? (
                      <div className="resolved-banner">
                        ✅ ໄດ້ຮັບການຊ່ວຍເຫຼືອ/ແກ້ໄຂແລ້ວ (ຈະເຊື່ອງໃນ 24 ຊົ່ວໂມງ)
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

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {report.phone && (
                        <a href={`tel:${report.phone}`} className="popup-phone">
                          <Phone size={14} /> ໂທ: {report.phone}
                        </a>
                      )}

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
                          <RefreshCw size={14} /> ຍັງຕ້ອງການຊ່ວຍເຫຼືອ
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2>ລາຍງານເຫດການ / ຂໍຄວາມຊ່ວຍເຫຼືອ</h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ປະເພດເຫດການ</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="sos">🚨 ຂໍຄວາມຊ່ວຍເຫຼືອດ່ວນ (SOS)</option>
                  <option value="warning">⚠️ ແຈ້ງເຕືອນລະດັບນ້ຳ / ຖະໜົນຕັດຂາດ</option>
                  <option value="shelter">🏠 ສູນພັກເຊົາຊົ່ວຄາວ</option>
                  <option value="donation">📦 ຈຸດຮັບບໍລິຈາກ / ແຈກເຄື່ອງ</option>
                </select>
              </div>

              <div className="form-group">
                <label>ຫົວຂໍ້</label>
                <input 
                  type="text" 
                  placeholder="ຕົວຢ່າງ: ນ້ຳຖ້ວມສູງ ຕ້ອງການເຮືອດ່ວນ" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label>ສະຖານທີ່ (ບ້ານ, ເມືອງ, ແຂວງ)</label>
                <input 
                  type="text" 
                  placeholder="ຕົວຢ່າງ: ບ້ານທ່າແຂກໃຕ້, ແຂວງຄຳມ່ວນ" 
                  value={formData.locationName} 
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  required 
                />
              </div>

              <div className="form-group">
                <label>ລາຍລະອຽດເພີ່ມເຕີມ</label>
                <textarea 
                  rows={3} 
                  placeholder="ລະບຸຈຳນວນຄົນ, ສະພາບຕົວຈິງ ຫຼື ສິ່ງທີ່ຕ້ອງການ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>ເບີໂທຕິດຕໍ່ສຸກເສີນ (WhatsApp/ໂທ)</label>
                <input 
                  type="text" 
                  placeholder="020 xxxx xxxx" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required 
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <button 
                  type="button" 
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px dashed #dc2626',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsPickingLocation(true);
                  }}
                >
                  📍 ເລືອກພິກັດເທິງແຜນທີ່ ({formData.lat.toFixed(3)}, {formData.lng.toFixed(3)})
                </button>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  ຍົກເລີກ
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'ກຳລັງສົ່ງ...' : 'ສົ່ງລາຍງານ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
