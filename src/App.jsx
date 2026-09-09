import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Plus, MapPin, Smartphone, Layers, CloudRain, Waves, Search, ChevronDown, PhoneCall, Grid } from 'lucide-react';
import { supabase } from './supabase';
import LocationModal from './components/LocationModal';
import RiverModal from './components/RiverModal';
import InstallModal from './components/InstallModal';
import ShareModal from './components/ShareModal';
import ReportModal from './components/ReportModal';
import EmergencyModal from './components/EmergencyModal';
import ClusterLayer from './components/ClusterLayer';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [enableCluster, setEnableCluster] = useState(true);

  const [currentLocationName, setCurrentLocationName] = useState('📍 ທົ່ວປະເທດ');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [mapTarget, setMapTarget] = useState({
    center: [18.5, 103.5],
    zoom: 7
  });

  const [mapType, setMapType] = useState('street');
  const [showRadar, setShowRadar] = useState(false);
  const [radarTileUrl, setRadarTileUrl] = useState('');

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isRiverModalOpen, setIsRiverModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [shareReport, setShareReport] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');

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

  useEffect(() => {
    if (showRadar && !radarTileUrl) {
      fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
            const latest = data.radar.past[data.radar.past.length - 1];
            setRadarTileUrl(`${data.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`);
          }
        })
        .catch((err) => console.error('Radar error:', err));
    }
  }, [showRadar, radarTileUrl]);

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

  const handleSelectLocation = (loc) => {
    if (loc.id === 'all') {
      setCurrentLocationName('📍 ທົ່ວປະເທດ');
      setMapTarget({ center: [18.5, 103.5], zoom: 7 });
    } else {
      setCurrentLocationName(`📍 ${loc.name}`);
      setMapTarget({ center: [loc.lat, loc.lng], zoom: loc.zoom });
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    setIsPickingLocation(false);
    setIsModalOpen(true);
    setGpsMessage(`📍 ເລືອກເທິງແຜນທີ່: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
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

  const stats = {
    total: activeReports.length,
    sos: activeReports.filter((r) => r.type === 'sos' && r.status !== 'resolved').length,
    warning: activeReports.filter((r) => r.type === 'warning' && r.status !== 'resolved').length,
    shelter: activeReports.filter((r) => r.type === 'shelter' && r.status !== 'resolved').length,
    donation: activeReports.filter((r) => r.type === 'donation' && r.status !== 'resolved').length,
  };

  const filteredReports = activeReports
    .filter((r) => {
      if (filter === 'all') return true;
      return r.type === filter && r.status !== 'resolved';
    })
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (r.title || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      const loc = (r.location_name || '').toLowerCase();
      const phone = (r.phone || '').toLowerCase();
      return title.includes(q) || desc.includes(q) || loc.includes(q) || phone.includes(q);
    });

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <ShieldAlert color="#dc2626" size={24} />
          <div>
            <h1>Lao Relief Map</h1>
            <span>ແຜນທີ່ຊ່ວຍເຫຼືອໄພພິບັດ Real-time</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-emergency" onClick={() => setIsEmergencyModalOpen(true)}>
            <PhoneCall size={16} />
            ເບີສຸກເສີນ
          </button>

          <button className="btn-report" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            ລາຍງານເຫດ
          </button>

          <button className="btn-install" onClick={() => setIsInstallModalOpen(true)}>
            <Smartphone size={16} />
            ຕິດຕັ້ງແອັບ
          </button>
        </div>
      </header>

      {/* ແຖບເລືອກພື້ນທີ່, ຄົ້ນຫາ, ດາວທຽມ, ແລະ Filter */}
      <div className="filter-bar">
        <button 
          className="btn-location-picker"
          onClick={() => setIsLocationModalOpen(true)}
        >
          <MapPin size={14} />
          <span>{currentLocationName}</span>
          <ChevronDown size={14} />
        </button>

        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="ຄົ້ນຫາບ້ານ, ເມືອງ, ຫົວຂໍ້..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <X size={14} className="search-clear" onClick={() => setSearchQuery('')} />
          )}
        </div>

        {/* ປຸ່ມເປີດ/ປິດ ຮວມໝຸດ Cluster */}
        <button 
          className={`btn-cluster-toggle ${enableCluster ? 'active' : ''}`}
          onClick={() => setEnableCluster(!enableCluster)}
          title="ກົດເພື່ອເປີດ/ປິດ ການຮວມໝຸດ"
        >
          <Grid size={14} />
          {enableCluster ? '🧩 ຮວມໝຸດ: ເປີດ' : '📍 ແຍກໝຸດ: ປິດ'}
        </button>

        <button 
          className={`btn-satellite ${mapType === 'satellite' ? 'active' : ''}`}
          onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
        >
          <Layers size={14} />
          {mapType === 'street' ? '🛰️ ດາວທຽມ' : '🗺️ ຖະໜົນ'}
        </button>

        <button 
          className={`btn-radar ${showRadar ? 'active' : ''}`}
          onClick={() => setShowRadar(!showRadar)}
        >
          <CloudRain size={14} />
          {showRadar ? '🌧️ ປິດເຣດາ' : '🌧️ ເຣດາຝົນ'}
        </button>

        <button 
          className="btn-river"
          onClick={() => setIsRiverModalOpen(true)}
        >
          <Waves size={14} />
          🌊 ລະດັບນ້ຳ
        </button>

        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ທັງໝົດ <span className="stat-pill">{stats.total}</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'sos' ? 'active' : ''}`}
          onClick={() => setFilter('sos')}
        >
          🚨 ຂໍຄວາມຊ່ວຍເຫຼືອ <span className="stat-pill">{stats.sos}</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
          onClick={() => setFilter('warning')}
        >
          ⚠️ ແຈ້ງເຕືອນ <span className="stat-pill">{stats.warning}</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'shelter' ? 'active' : ''}`}
          onClick={() => setFilter('shelter')}
        >
          🏠 ສູນພັກເຊົາ <span className="stat-pill">{stats.shelter}</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'donation' ? 'active' : ''}`}
          onClick={() => setFilter('donation')}
        >
          📦 ຈຸດບໍລິຈາກ <span className="stat-pill">{stats.donation}</span>
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
          {mapType === 'street' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          )}

          {showRadar && radarTileUrl && (
            <TileLayer
              url={radarTileUrl}
              opacity={0.65}
              zIndex={500}
              attribution='&copy; <a href="https://www.rainviewer.com">RainViewer</a>'
            />
          )}

          <MapController 
            targetCenter={mapTarget.center} 
            targetZoom={mapTarget.zoom} 
          />

          <LocationPicker 
            isPicking={isPickingLocation} 
            onLocationSelect={handleLocationSelect} 
          />

          {/* ສະແດງໝຸດແບບ Cluster ຫຼື ແຍກປົກກະຕິ */}
          <ClusterLayer 
            reports={filteredReports}
            enableCluster={enableCluster}
            createCustomIcon={createCustomIcon}
            currentTime={currentTime}
            setShareReport={setShareReport}
            handleMarkResolved={handleMarkResolved}
            handleRenewReport={handleRenewReport}
            formatCountdown={formatCountdown}
          />
        </MapContainer>
      </div>

      {/* Components Modals */}
      <EmergencyModal 
        isOpen={isEmergencyModalOpen} 
        onClose={() => setIsEmergencyModalOpen(false)} 
      />

      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        onSelectLocation={handleSelectLocation} 
      />

      <RiverModal 
        isOpen={isRiverModalOpen} 
        onClose={() => setIsRiverModalOpen(false)} 
      />

      <InstallModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
      />

      <ShareModal 
        report={shareReport} 
        onClose={() => setShareReport(null)} 
      />

      <ReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        formData={formData} 
        setFormData={setFormData} 
        onStartPickingLocation={() => {
          setIsModalOpen(false);
          setIsPickingLocation(true);
        }} 
        gpsMessage={gpsMessage} 
        setGpsMessage={setGpsMessage} 
        onSuccess={fetchReports} 
      />
    </div>
  );
}
