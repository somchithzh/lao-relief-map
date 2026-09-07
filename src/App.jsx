import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Plus, Phone, X, MapPin, Loader2 } from 'lucide-react';
import { supabase } from './supabase';
import './App.css';

const createCustomIcon = (type) => {
  const colorClass = 
    type === 'sos' ? 'pin-sos' :
    type === 'warning' ? 'pin-warning' :
    type === 'shelter' ? 'pin-shelter' : 'pin-donation';

  const iconSymbol = 
    type === 'sos' ? '🚨' :
    type === 'warning' ? '⚠️' :
    type === 'shelter' ? '🏠' : '📦';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="custom-pin ${colorClass}">${iconSymbol}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
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

  // 1. ດຶງຂໍ້ມູນຈາກ Supabase
  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      if (data) {
        const formatted = data.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          locationName: item.location_name,
          phone: item.phone,
          lat: item.lat,
          lng: item.lng,
          time: new Date(item.created_at).toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' })
        }));
        setReports(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. ຕິດຕັ້ງລະບົບ Real-time
  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel('realtime-reports')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        (payload) => {
          const item = payload.new;
          const newReport = {
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            locationName: item.location_name,
            phone: item.phone,
            lat: item.lat,
            lng: item.lng,
            time: 'ຫາກໍ່ລາຍງານ'
          };
          setReports((prev) => [newReport, ...prev]);
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

  // 3. ສົ່ງລາຍງານໃໝ່ຂຶ້ນ Supabase
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
          lng: formData.lng
        }
      ]);

      if (error) {
        alert('ເກີດຂໍ້ຜິດພາດ: ' + error.message);
      } else {
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

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter((r) => r.type === filter);

  return (
    <div className="app-container">
      {/* Header */}
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

      {/* Filter Bar */}
      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ທັງໝົດ ({reports.length})
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

      {/* Map Area */}
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

          {filteredReports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.lat, report.lng]} 
              icon={createCustomIcon(report.type)}
            >
              <Popup>
                <div className="popup-content">
                  <span className={`popup-badge pin-${report.type}`}>
                    {report.type === 'sos' && '🚨 ຂໍຄວາມຊ່ວຍເຫຼືອ'}
                    {report.type === 'warning' && '⚠️ ແຈ້ງເຕືອນ'}
                    {report.type === 'shelter' && '🏠 ສູນພັກເຊົາ'}
                    {report.type === 'donation' && '📦 ຈຸດບໍລິຈາກ'}
                  </span>
                  <h3>{report.title}</h3>
                  <p>{report.description}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    📍 {report.locationName} • 🕒 {report.time}
                  </p>
                  {report.phone && (
                    <a href={`tel:${report.phone}`} className="popup-phone">
                      <Phone size={14} /> ໂທ: {report.phone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Modal Report Form */}
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
