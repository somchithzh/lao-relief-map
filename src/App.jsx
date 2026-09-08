import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Plus, Phone, X, MapPin, CheckCircle, RefreshCw, Crosshair, Loader2, Share2, MessageCircle, Copy, Send, Camera } from 'lucide-react';
import { supabase } from './supabase';
import './App.css';

const PROVINCES = {
  all: { name: '📍 ທົ່ວປະເທດ (18 ແຂວງ)', lat: 18.5, lng: 103.5, zoom: 7 },
  vientiane_cap: { name: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 17.9757, lng: 102.6331, zoom: 11 },
  vientiane_prov: { name: 'ແຂວງ ວຽງຈັນ', lat: 18.9242, lng: 102.4491, zoom: 9 },
  luangprabang: { name: 'ຫຼວງພະບາງ', lat: 19.8893, lng: 102.1350, zoom: 10 },
  khammouane: { name: 'ຄຳມ່ວນ (ທ່າແຂກ)', lat: 17.4042, lng: 104.8306, zoom: 9 },
  savannakhet: { name: 'ສະຫວັນນະເຂດ', lat: 16.5413, lng: 104.7570, zoom: 9 },
  champasak: { name: 'ຈຳປາສັກ (ປາກເຊ)', lat: 15.1213, lng: 105.7818, zoom: 9 },
  xayabury: { name: 'ໄຊຍະບູລີ', lat: 19.2553, lng: 101.7547, zoom: 9 },
  bolikhamxay: { name: 'ບໍລິຄຳໄຊ (ປາກຊັນ)', lat: 18.3778, lng: 103.6586, zoom: 9 },
  xiengkhouang: { name: 'ຊຽງຂວາງ (ໂພນສະຫວັນ)', lat: 19.4526, lng: 103.2208, zoom: 9 },
  houaphanh: { name: 'ຫົວພັນ (ຊຳເໜືອ)', lat: 20.4208, lng: 104.0439, zoom: 9 },
  oudomxay: { name: 'ອຸດົມໄຊ (ເມືອງໄຊ)', lat: 20.6908, lng: 101.9840, zoom: 9 },
  luangnamtha: { name: 'ຫຼວງນ້ຳທາ', lat: 20.9578, lng: 101.4019, zoom: 9 },
  bokeo: { name: 'ບໍ່ແກ້ວ (ຫ້ວຍຊາຍ)', lat: 20.2764, lng: 100.4136, zoom: 9 },
  phongsaly: { name: 'ຜົ້ງສາລີ', lat: 21.6833, lng: 102.1000, zoom: 9 },
  salavan: { name: 'ສາລະວັນ', lat: 15.7167, lng: 106.4167, zoom: 9 },
  sekong: { name: 'ເຊກອງ', lat: 15.3444, lng: 106.7208, zoom: 9 },
  attapeu: { name: 'ອັດຕະປື', lat: 14.8107, lng: 106.8327, zoom: 9 },
  xaysomboun: { name: 'ໄຊສົມບູນ', lat: 18.9167, lng: 103.1167, zoom: 9 },
};

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
    iconSize: L.point(34, 34),
    iconAnchor: L.point(17, 17),
    popupAnchor: L.point(0, -17),
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

function MapController({ targetCenter, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, targetZoom, { duration: 1.2 });
    }
  }, [targetCenter, targetZoom, map]);
  return null;
}

function formatCountdown(resolvedAt, currentTime) {
  if (!resolvedAt) return 'ກຳລັງປະມວນຜົນ...';
  const resolvedTime = new Date(resolvedAt).getTime();
  const diffSeconds = Math.max(0, 3600 - Math.floor((currentTime - resolvedTime) / 1000));
  const mins = Math.floor(diffSeconds / 60);
  const secs = diffSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs} ນາທີ`;
}

export default function App() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [mapTarget, setMapTarget] = useState({
    center: [18.5, 103.5],
    zoom: 7
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [shareReport, setShareReport] = useState(null);

  const [isLocating, setIsLocating] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'sos',
    description: '',
    locationName: '',
    phone: '',
    lat: 17.9757,
    lng: 102.6331
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleProvinceChange = (e) => {
    const key = e.target.value;
    setSelectedProvince(key);
    const prov = PROVINCES[key];
    if (prov) {
      setMapTarget({
        center: [prov.lat, prov.lng],
        zoom: prov.zoom
      });
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('ອຸປະກອນຂອງທ່ານບໍ່ຮອງຮັບລະບົບ GPS');
      return;
    }

    setIsLocating(true);
    setGpsMessage('ກຳລັງດຶງພິກັດ GPS...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude
        }));
        setIsLocating(false);
        setGpsMessage(`✅ ໄດ້ຮັບພິກັດ GPS ແລ້ວ (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      },
      (err) => {
        setIsLocating(false);
        setGpsMessage('');
        console.error(err);
        alert('ບໍ່ສາມາດດຶງ GPS ໄດ້: ກະລຸນາກົດ "ອະນຸຍາດ (Allow)" ໃຫ້ເວັບໄຊເຂົ້າເຖິງຕຳແໜ່ງ Location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    setIsPickingLocation(false);
    setIsModalOpen(true);
    setGpsMessage(`📍 ເລືອກເທິງແຜນທີ່: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      let uploadedImageUrl = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage
          .from('report-images')
          .upload(fileName, selectedImage);

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage
            .from('report-images')
            .getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        } else {
          console.error('Upload error:', uploadErr);
        }
      }

      const { error } = await supabase.from('reports').insert([
        {
          type: formData.type,
          title: formData.title,
          description: formData.description,
          location_name: formData.locationName,
          phone: formData.phone,
          lat: formData.lat,
          lng: formData.lng,
          image_url: uploadedImageUrl,
          status: 'pending'
        }
      ]);

      if (!error) {
        setIsModalOpen(false);
        setGpsMessage('');
        setSelectedImage(null);
        setImagePreview(null);
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
    const { error } = await supabase
      .from('reports')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      fetchReports();
    }
  };

  const handleRenewReport = async (id) => {
    await supabase
      .from('reports')
      .update({ created_at: new Date().toISOString() })
      .eq('id', id);
    fetchReports();
    alert('ຕໍ່ອາຍຸການແຈ້ງເຕືອນສຳເລັດແລ້ວ!');
  };

  const shareToWhatsApp = () => {
    if (!shareReport) return;
    const text = `🚨 [Lao Relief Map - ແຈ້ງເຫດດ່ວນ]
📌 ຫົວຂໍ້: ${shareReport.title}
📍 ສະຖານທີ່: ${shareReport.location_name}
📝 ລາຍລະອຽດ: ${shareReport.description || 'ບໍ່ມີ'}
📞 ເບີຕິດຕໍ່: ${shareReport.phone}
🗺️ ເບິ່ງພິກັດເທິງແຜນທີ່: https://somchithzh.github.io/lao-relief-map/`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = 'https://somchithzh.github.io/lao-relief-map/';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareCopyText = () => {
    if (!shareReport) return;
    const text = `🚨 [Lao Relief Map] ${shareReport.title} ທີ່ ${shareReport.location_name} (ໂທ: ${shareReport.phone})
https://somchithzh.github.io/lao-relief-map/`;

    navigator.clipboard.writeText(text);
    alert('ຄັດລອກຂໍ້ຄວາມ ແລະ ລິ້ງແຜນທີ່ແລ້ວ! ສາມາດນຳໄປ Paste ໃນ Messenger ຫຼື ແຊັດໄດ້ເລີຍ.');
  };

  const shareNativeDevice = async () => {
    if (!shareReport) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lao Relief Map',
          text: `🚨 [ແຈ້ງເຫດ] ${shareReport.title} ທີ່ ${shareReport.location_name} (ໂທ: ${shareReport.phone})`,
          url: 'https://somchithzh.github.io/lao-relief-map/',
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      shareCopyText();
    }
  };

  const activeReports = reports.filter((r) => {
    const createdAt = new Date(r.created_at).getTime();
    const hoursSinceCreated = (currentTime - createdAt) / (1000 * 60 * 60);

    if (r.status === 'resolved') {
      if (!r.resolved_at) return true;
      const secondsSinceResolved = (currentTime - new Date(r.resolved_at).getTime()) / 1000;
      return secondsSinceResolved < 3600;
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

      {/* ແຖບເລືອກ 18 ແຂວງ ແລະ ປຸ່ມ Filter */}
      <div className="filter-bar">
        <select 
          className="province-select" 
          value={selectedProvince} 
          onChange={handleProvinceChange}
        >
          {Object.entries(PROVINCES).map(([key, prov]) => (
            <option key={key} value={key}>
              {prov.name}
            </option>
          ))}
        </select>

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
          center={mapTarget.center} 
          zoom={mapTarget.zoom} 
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController 
            targetCenter={mapTarget.center} 
            targetZoom={mapTarget.zoom} 
          />

          <LocationPicker 
            isPicking={isPickingLocation} 
            onLocationSelect={handleLocationSelect} 
          />

          {filteredReports.map((report) => {
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

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                      {report.phone && (
                        <a href={`tel:${report.phone}`} className="popup-phone">
                          <Phone size={14} /> ໂທ: {report.phone}
                        </a>
                      )}

                      <button 
                        className="btn-popup-share"
                        onClick={() => setShareReport(report)}
                      >
                        <Share2 size={14} /> ແຊຣ໌
                      </button>
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
        </MapContainer>
      </div>

      {/* Modal Share Options */}
      {shareReport && (
        <div className="modal-overlay" onClick={() => setShareReport(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '17px', margin: 0 }}>ແບ່ງປັນເຫດການ</h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShareReport(null)} />
            </div>

            <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
              📍 <strong>{shareReport.title}</strong> ({shareReport.location_name})
            </p>

            <button className="share-option-btn share-wa" onClick={shareToWhatsApp}>
              <MessageCircle size={18} /> ແຊຣ໌ເຂົ້າ WhatsApp
            </button>

            <button className="share-option-btn share-fb" onClick={shareToFacebook}>
              <Send size={18} /> ແຊຣ໌ເທິງ Facebook / Messenger
            </button>

            <button className="share-option-btn share-copy" onClick={shareCopyText}>
              <Copy size={18} /> ຄັດລອກຂໍ້ຄວາມ ແລະ ລິ້ງ (Copy)
            </button>

            {navigator.share && (
              <button className="share-option-btn share-native" onClick={shareNativeDevice}>
                <Share2 size={18} /> ເປີດແອັບອື່ນໆໃນມືຖື...
              </button>
            )}
          </div>
        </div>
      )}

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

              {/* ກ່ອງອັບໂຫຼດຮູບ: ຈັດເຄິ່ງກາງ ຊື່ກົງ */}
              <div className="form-group">
                <label>ຮູບພາບສະພາບຕົວຈິງ (ຖ້າມີ)</label>
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" />
                    <button type="button" className="btn-remove-img" onClick={handleRemoveImage}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="upload-box">
                    <div className="upload-icon-circle">
                      <Camera size={22} color="#334155" />
                    </div>
                    <span style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: '700' }}>
                      ກົດຖ່າຍຮູບ ຫຼື ເລືອກຮູບຈາກມືຖື
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      ຮອງຮັບໄຟລ໌ຮູບພາບ JPG, PNG
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                )}
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  ພິກັດຈຸດເກີດເຫດ
                </label>

                {gpsMessage && (
                  <div className="gps-success-text">
                    {gpsMessage}
                  </div>
                )}

                <button 
                  type="button" 
                  className="btn-gps"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      ກຳລັງຊອກຫາຕຳແໜ່ງ GPS...
                    </>
                  ) : (
                    <>
                      <Crosshair size={16} />
                      📍 ດຶງຕຳແໜ່ງປັດຈຸບັນຂອງຂ້ອຍ (GPS)
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  className="btn-pick-map"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsPickingLocation(true);
                  }}
                >
                  <MapPin size={15} />
                  🗺️ ຫຼື ຈິ້ມເລືອກຈຸດເທິງແຜນທີ່ດ້ວຍຕົນເອງ
                </button>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  ຍົກເລີກ
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'ກຳລັງອັບໂຫຼດ ແລະ ສົ່ງ...' : 'ສົ່ງລາຍງານ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
