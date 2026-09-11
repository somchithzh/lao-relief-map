import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Plus, MapPin, Smartphone, Layers, CloudRain, Waves, Search, ChevronDown, PhoneCall, Grid, X, List, Map, CloudSun, Crosshair, BookOpen, WifiOff } from 'lucide-react';
import { supabase } from './supabase';
import LocationModal from './components/LocationModal';
import RiverModal from './components/RiverModal';
import InstallModal from './components/InstallModal';
import ShareModal from './components/ShareModal';
import ReportModal from './components/ReportModal';
import EmergencyModal from './components/EmergencyModal';
import ClusterLayer from './components/ClusterLayer';
import ReportListView from './components/ReportListView';
import WeatherModal from './components/WeatherModal';
import SurvivalGuideModal from './components/SurvivalGuideModal';
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

const userLocationIcon = L.divIcon({
  className: 'user-location-marker-wrap',
  html: '<div class="user-pulse-dot" title="ເຈົ້າຢູ່ບ່ອນນີ້"></div>',
  iconSize: L.point(18, 18),
  iconAnchor: L.point(9, 9),
});

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
  const [viewMode, setViewMode] = useState('map');
  const [userLocation, setUserLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [currentLocationName, setCurrentLocationName] = useState('📍 ທົ່ວປະເທດ');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [mapTarget, setMapTarget] = useState({
    center: [18.5, 103.5],
    zoom: 7
  });

  const [mapType, setMapType] = useState('street');
  const [showRadar, setShowRadar] = useState(false);
  const [radarTileUrl, setRadarTileUrl] = useState('');

  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSurvivalGuideOpen, setIsSurvivalGuideOpen] = useState(false);
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

  // ກວດຈັບສະຖານະ Online/Offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('ອຸປະກອນຂອງທ່ານບໍ່ຮອງຮັບລະບົບ GPS');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        setMapTarget({ center: [userLat, userLng], zoom: 14 });
      },
      (err) => {
        console.error(err);
        alert('ບໍ່ສາມາດດຶງ GPS ໄດ້: ກະລຸນາກົດ "ອະນຸຍາດ (Allow)" ໃຫ້ເວັບໄຊເຂົ້າເຖິງຕຳແໜ່ງ Location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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

  const handleShowOnMap = (report) => {
    setViewMode('map');
    setMapTarget({ center: [report.lat, report.lng], zoom: 15 });
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
    urgent: activeReports.filter((r) => {
      const createdAt = new Date(r.created_at).getTime();
      const hoursPassed = (currentTime - createdAt) / (1000 * 60 * 60);
      return r.type === 'sos' && r.status !== 'resolved' && hoursPassed >= 24;
    }).length,
    sos: activeReports.filter((r) => r.type === 'sos' && r.status !== 'resolved').length,
    warning: activeReports.filter((r) => r.type === 'warning' && r.status !== 'resolved').length,
    shelter: activeReports.filter((r) => r.type === 'shelter' && r.status !== 'resolved').length,
    donation: activeReports.filter((r) => r.type === 'donation' && r.status !== 'resolved').length,
  };

  const filteredReports = activeReports
    .filter((r) => {
      if (filter === 'all') return true;
      if (filter === 'urgent') {
        const createdAt = new Date(r.created_at).getTime();
        const hoursPassed = (currentTime - createdAt) / (1000 * 60 * 60);
        return r.type === 'sos' && r.status !== 'resolved' && hoursPassed >= 24;
      }
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

  const [targetLat, targetLng] = mapTarget.center;

  return (
    <div className="app-container">
      {/* ແຖບເຕືອນສະຖານະ Offline (ຖ້າບໍ່ມີເນັດ) */}
      {!isOnline && (
        <div className="offline-banner-alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <WifiOff size={14} />
            <span>ໂໝດອອບໄລນ໌ (ບໍ່ມີເນັດ): ເບິ່ງຄູ່ມືເອົາຕົວລອດ & ເບີສຸກເສີນໄດ້ປົກກະຕິ</span>
          </div>
          <div className="offline-banner-actions">
            <button className="offline-banner-btn" onClick={() => setIsSurvivalGuideOpen(true)}>
              📖 ຄູ່ມື
            </button>
            <button className="offline-banner-btn" onClick={() => setIsEmergencyModalOpen(true)}>
              📞 ເບີໂທ
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-title">
          <ShieldAlert color="#dc2626" size={22} style={{ flexShrink: 0 }} />
          <div className="title-text-group">
            <h1>Lao Relief Map</h1>
            <span className="header-subtitle">ແຜນທີ່ຊ່ວຍເຫຼືອໄພພິບັດ</span>
          </div>
        </div>

        <div className="header-actions">
          {/* ປຸ່ມຄູ່ມືເອົາຕົວລອດ */}
          <button
            className="btn-guide"
            onClick={() => setIsSurvivalGuideOpen(true)}
            title="ຄູ່ມືເອົາຕົວລອດ & ປະຖົມພະຍາບານ (Offline Ready)"
          >
            <BookOpen size={13} />
            <span>ຄູ່ມືເອົາຕົວລອດ</span>
          </button>

          <button className="btn-emergency" onClick={() => setIsEmergencyModalOpen(true)}>
            <PhoneCall size={13} />
            <span>ເບີສຸກເສີນ</span>
          </button>

          <button className="btn-report" onClick={() => setIsModalOpen(true)}>
            <Plus size={13} />
            <span>ລາຍງານເຫດ</span>
          </button>

          <button className="btn-install" onClick={() => setIsInstallModalOpen(true)} title="ຕິດຕັ້ງແອັບ">
            <Smartphone size={13} />
            <span className="btn-text-install">ຕິດຕັ້ງແອັບ</span>
          </button>
        </div>
      </header>

      {/* ແຖວເລືອກເມືອງ ແລະ ຄົ້ນຫາ */}
      <div className="search-location-bar">
        <button 
          className="btn-location-picker"
          onClick={() => setIsLocationModalOpen(true)}
        >
          <MapPin size={13} />
          <span className="location-name-text">{currentLocationName}</span>
          <ChevronDown size={13} />
        </button>

        <div className="search-box">
          <Search size={13} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="ຄົ້ນຫາບ້ານ, ເມືອງ, ຫົວຂໍ້..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <X size={13} className="search-clear" onClick={() => setSearchQuery('')} />
          )}
        </div>
      </div>

      {/* ແຖວ Filter Pills */}
      <div className="category-scroll-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ທັງໝົດ <span className="stat-pill">{stats.total}</span>
        </button>

        <button 
          className={`filter-btn filter-btn-urgent ${filter === 'urgent' ? 'active' : ''}`}
          onClick={() => setFilter('urgent')}
        >
          🔥 ດ່ວນ (ເກີນ 24h) <span className="stat-pill">{stats.urgent}</span>
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

      {/* Map Area / List Area */}
      {viewMode === 'map' ? (
        <div className="map-wrapper">
          {/* ປຸ່ມລອຍສະພາບອາກາດ ມຸມຊ້າຍເທິງແຜນທີ່ */}
          <button 
            className="floating-weather-badge"
            onClick={() => setIsWeatherModalOpen(true)}
            title="ຄລິກເບິ່ງສະພາບອາກາດ & ພະຍາກອນຝົນ"
          >
            <span>🌤️ ສະພາບອາກາດ</span>
          </button>

          {/* ປຸ່ມເຄື່ອງມືລອຍເທິງແຜນທີ່ ດ້ານຂວາມື */}
          <div className="floating-map-controls">
            <button 
              className={`map-tool-btn ${userLocation ? 'active' : ''}`}
              onClick={handleLocateUser}
              title="ຊອກຫາຕຳແໜ່ງປັດຈຸບັນຂອງຂ້ອຍ"
            >
              <Crosshair size={17} />
              <span className="map-tool-label">ຕຳແໜ່ງຂ້ອຍ</span>
            </button>

            <button 
              className={`map-tool-btn ${mapType === 'satellite' ? 'active' : ''}`}
              onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
              title="ດາວທຽມ / ຖະໜົນ"
            >
              <Layers size={17} />
              <span className="map-tool-label">{mapType === 'street' ? 'ດາວທຽມ' : 'ຖະໜົນ'}</span>
            </button>

            <button 
              className="map-tool-btn"
              onClick={() => setIsWeatherModalOpen(true)}
              title="ສະພາບອາກາດ & ພະຍາກອນຝົນ"
            >
              <CloudSun size={17} />
              <span className="map-tool-label">ອາກາດ</span>
            </button>

            <button 
              className={`map-tool-btn ${showRadar ? 'active' : ''}`}
              onClick={() => setShowRadar(!showRadar)}
              title="ເຣດາຝົນ"
            >
              <CloudRain size={17} />
              <span className="map-tool-label">ເຣດາຝົນ</span>
            </button>

            <button 
              className="map-tool-btn"
              onClick={() => setIsRiverModalOpen(true)}
              title="ລະດັບນ້ຳຂອງ"
            >
              <Waves size={17} />
              <span className="map-tool-label">ລະດັບນ້ຳ</span>
            </button>

            <button 
              className={`map-tool-btn ${enableCluster ? 'active' : ''}`}
              onClick={() => setEnableCluster(!enableCluster)}
              title="ຮວມໝຸດ"
            >
              <Grid size={17} />
              <span className="map-tool-label">ຮວມໝຸດ</span>
            </button>
          </div>

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

            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                <Popup>
                  <div style={{ textAlign: 'center', padding: '4px', fontWeight: '700', fontSize: '13px' }}>
                    🔵 ເຈົ້າຢູ່ບ່ອນນີ້ (ຕຳແໜ່ງປັດຈຸບັນ)
                  </div>
                </Popup>
              </Marker>
            )}

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
      ) : (
        <ReportListView
          reports={filteredReports}
          currentTime={currentTime}
          setShareReport={setShareReport}
          handleMarkResolved={handleMarkResolved}
          handleRenewReport={handleRenewReport}
          formatCountdown={formatCountdown}
          onShowOnMap={handleShowOnMap}
          userLocation={userLocation}
          onLocateUser={handleLocateUser}
        />
      )}

      {/* ປຸ່ມລອຍສະຫຼັບມຸມມອງ */}
      <button
        className="btn-floating-view-toggle"
        onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
      >
        {viewMode === 'map' ? (
          <>
            <List size={15} />
            <span>ເບິ່ງແບບລາຍການ ({filteredReports.length})</span>
          </>
        ) : (
          <>
            <Map size={15} />
            <span>ເບິ່ງແບບແຜນທີ່ 🗺️</span>
          </>
        )}
      </button>

      {/* Modals */}
      <SurvivalGuideModal
        isOpen={isSurvivalGuideOpen}
        onClose={() => setIsSurvivalGuideOpen(false)}
        isOnline={isOnline}
      />

      <WeatherModal 
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        lat={targetLat}
        lng={targetLng}
        locationName={currentLocationName.replace('📍 ', '')}
      />

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
