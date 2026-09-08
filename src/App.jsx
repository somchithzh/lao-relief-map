import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Plus, Phone, X, MapPin, CheckCircle, RefreshCw, Crosshair, Loader2, Share2, MessageCircle, Copy, Send, Camera, Smartphone, Layers, CloudRain, Waves, Search, ChevronDown, ChevronRight, Navigation } from 'lucide-react';
import { supabase } from './supabase';
import './App.css';

// ຖານຂໍ້ມູນເມືອງ ແລະ ແຂວງທົ່ວປະເທດລາວ
const LAO_DISTRICTS = [
  // ນະຄອນຫຼວງວຽງຈັນ
  { id: 'vt_all', name: 'ນະຄອນຫຼວງວຽງຈັນ (ທັງໝົດ)', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 17.9757, lng: 102.6331, zoom: 10, isProv: true },
  { id: 'vt_chantabuly', name: 'ເມືອງຈັນທະບູລີ', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 17.9786, lng: 102.6105, zoom: 12 },
  { id: 'vt_sikhottabong', name: 'ເມືອງສີໂຄດຕະບອງ', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 17.9850, lng: 102.5780, zoom: 12 },
  { id: 'vt_xaysettha', name: 'ເມືອງໄຊເສດຖາ', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 17.9620, lng: 102.6500, zoom: 12 },
  { id: 'vt_sisattanak', name: 'ເມືອງສີສັດຕະນາກ', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 17.9400, lng: 102.6300, zoom: 12 },
  { id: 'vt_naxaithong', name: 'ເມືອງນາຊາຍທອງ', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 18.1200, lng: 102.5200, zoom: 11 },
  { id: 'vt_xaithany', name: 'ເມືອງໄຊທານີ', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 18.0600, lng: 102.7300, zoom: 11 },
  { id: 'vt_hadxayfong', name: 'ເມືອງຫາດຊາຍຟອງ', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 17.8800, lng: 102.6800, zoom: 11 },
  { id: 'vt_sangthong', name: 'ເມືອງສັງທອງ', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 18.2300, lng: 102.1800, zoom: 11 },
  { id: 'vt_pakngum', name: 'ເມືອງປາກງື່ມ', province: 'ນະຄອນຫຼວງວຽງຈັນ', lat: 18.1800, lng: 103.0500, zoom: 11 },

  // ແຂວງ ວຽງຈັນ
  { id: 'vp_all', name: 'ແຂວງ ວຽງຈັນ (ທັງໝົດ)', province: 'ແຂວງ ວຽງຈັນ', lat: 18.9242, lng: 102.4491, zoom: 9, isProv: true },
  { id: 'vp_vangvieng', name: 'ເມືອງວັງວຽງ', province: 'ແຂວງ ວຽງຈັນ', lat: 18.9240, lng: 102.4480, zoom: 12 },
  { id: 'vp_kasi', name: 'ເມືອງກາສີ', province: 'ແຂວງ ວຽງຈັນ', lat: 19.2312, lng: 102.2471, zoom: 12 },
  { id: 'vp_phonhong', name: 'ເມືອງໂພນໂຮງ', province: 'ແຂວງ ວຽງຈັນ', lat: 18.4980, lng: 102.4170, zoom: 12 },
  { id: 'vp_keooudom', name: 'ເມືອງແກ້ວອຸດົມ', province: 'ແຂວງ ວຽງຈັນ', lat: 18.5400, lng: 102.5500, zoom: 12 },
  { id: 'vp_thoulakhom', name: 'ເມືອງທຸລະຄົມ', province: 'ແຂວງ ວຽງຈັນ', lat: 18.3300, lng: 102.6700, zoom: 12 },
  { id: 'vp_feuang', name: 'ເມືອງເຟືອງ', province: 'ແຂວງ ວຽງຈັນ', lat: 18.8200, lng: 101.9800, zoom: 12 },
  { id: 'vp_hinhurp', name: 'ເມືອງຫີນເຫີບ', province: 'ແຂວງ ວຽງຈັນ', lat: 18.6600, lng: 102.3700, zoom: 12 },

  // ຫຼວງພະບາງ
  { id: 'lp_all', name: 'ແຂວງ ຫຼວງພະບາງ (ທັງໝົດ)', province: 'ຫຼວງພະບາງ', lat: 19.8893, lng: 102.1350, zoom: 9, isProv: true },
  { id: 'lp_city', name: 'ນະຄອນ ຫຼວງພະບາງ', province: 'ຫຼວງພະບາງ', lat: 19.8893, lng: 102.1350, zoom: 12 },
  { id: 'lp_nongkhiaw', name: 'ເມືອງງອຍ (ໜອງຂຽວ)', province: 'ຫຼວງພະບາງ', lat: 20.5714, lng: 102.6106, zoom: 12 },
  { id: 'lp_xienghone', name: 'ເມືອງຊຽງເງິນ', province: 'ຫຼວງພະບາງ', lat: 19.7500, lng: 102.2000, zoom: 12 },
  { id: 'lp_pakou', name: 'ເມືອງປາກອູ', province: 'ຫຼວງພະບາງ', lat: 20.0500, lng: 102.2300, zoom: 12 },
  { id: 'lp_nambak', name: 'ເມືອງນ້ຳບາກ', province: 'ຫຼວງພະບາງ', lat: 20.6200, lng: 102.3300, zoom: 12 },
  { id: 'lp_phoukhoun', name: 'ເມືອງພູຄູນ', province: 'ຫຼວງພະບາງ', lat: 19.3500, lng: 102.4300, zoom: 12 },

  // ຄຳມ່ວນ
  { id: 'km_all', name: 'ແຂວງ ຄຳມ່ວນ (ທັງໝົດ)', province: 'ຄຳມ່ວນ', lat: 17.4042, lng: 104.8306, zoom: 9, isProv: true },
  { id: 'km_thakhek', name: 'ເມືອງທ່າແຂກ', province: 'ຄຳມ່ວນ', lat: 17.4042, lng: 104.8306, zoom: 12 },
  { id: 'km_khounkham', name: 'ເມືອງຄູນຄຳ (ກອງລໍ)', province: 'ຄຳມ່ວນ', lat: 17.9800, lng: 104.6000, zoom: 12 },
  { id: 'km_hinboun', name: 'ເມືອງຫີນບູນ', province: 'ຄຳມ່ວນ', lat: 17.7500, lng: 104.6700, zoom: 12 },
  { id: 'km_mahaxay', name: 'ເມືອງມະຫາໄຊ', province: 'ຄຳມ່ວນ', lat: 17.4200, lng: 105.1800, zoom: 12 },
  { id: 'km_xebangfai', name: 'ເມືອງເຊບັ້ງໄຟ', province: 'ຄຳມ່ວນ', lat: 17.0700, lng: 104.9800, zoom: 12 },
  { id: 'km_nakai', name: 'ເມືອງນາກາຍ', province: 'ຄຳມ່ວນ', lat: 17.7200, lng: 105.1500, zoom: 12 },

  // ສະຫວັນນະເຂດ
  { id: 'sv_all', name: 'ແຂວງ ສະຫວັນນະເຂດ (ທັງໝົດ)', province: 'ສະຫວັນນະເຂດ', lat: 16.5413, lng: 104.7570, zoom: 9, isProv: true },
  { id: 'sv_kaysone', name: 'ນະຄອນ ໄກສອນ ພົມວິຫານ', province: 'ສະຫວັນນະເຂດ', lat: 16.5413, lng: 104.7570, zoom: 12 },
  { id: 'sv_outhoumphone', name: 'ເມືອງອຸທຸມພອນ (ເຊໂນ)', province: 'ສະຫວັນນະເຂດ', lat: 16.7000, lng: 105.0000, zoom: 12 },
  { id: 'sv_xepon', name: 'ເມືອງເຊໂປນ', province: 'ສະຫວັນນະເຂດ', lat: 16.7000, lng: 106.2000, zoom: 12 },
  { id: 'sv_songkhone', name: 'ເມືອງສອງຄອນ', province: 'ສະຫວັນນະເຂດ', lat: 16.3200, lng: 105.3100, zoom: 12 },

  // ຈຳປາສັກ
  { id: 'cp_all', name: 'ແຂວງ ຈຳປາສັກ (ທັງໝົດ)', province: 'ຈຳປາສັກ', lat: 15.1213, lng: 105.7818, zoom: 9, isProv: true },
  { id: 'cp_pakse', name: 'ນະຄອນ ປາກເຊ', province: 'ຈຳປາສັກ', lat: 15.1213, lng: 105.7818, zoom: 12 },
  { id: 'cp_champasak', name: 'ເມືອງຈຳປາສັກ (ວັດພູ)', province: 'ຈຳປາສັກ', lat: 14.8900, lng: 105.8800, zoom: 12 },
  { id: 'cp_khong', name: 'ເມືອງໂຂງ (ສີ່ພັນດອນ)', province: 'ຈຳປາສັກ', lat: 14.1200, lng: 105.9800, zoom: 12 },
  { id: 'cp_paksong', name: 'ເມືອງປາກຊ່ອງ', province: 'ຈຳປາສັກ', lat: 15.1800, lng: 106.2300, zoom: 12 },

  // ບໍລິຄຳໄຊ
  { id: 'bk_all', name: 'ແຂວງ ບໍລິຄຳໄຊ (ທັງໝົດ)', province: 'ບໍລິຄຳໄຊ', lat: 18.3778, lng: 103.6586, zoom: 9, isProv: true },
  { id: 'bk_paksan', name: 'ເມືອງປາກຊັນ', province: 'ບໍລິຄຳໄຊ', lat: 18.3778, lng: 103.6586, zoom: 12 },
  { id: 'bk_thaphabath', name: 'ເມືອງທ່າພະບາດ', province: 'ບໍລິຄຳໄຊ', lat: 18.2800, lng: 103.2000, zoom: 12 },
  { id: 'bk_khamkeuth', name: 'ເມືອງຄຳເກີດ (ຫຼັກ 20)', province: 'ບໍລິຄຳໄຊ', lat: 18.1700, lng: 104.9700, zoom: 12 },

  // ໄຊຍະບູລີ
  { id: 'xb_all', name: 'ແຂວງ ໄຊຍະບູລີ (ທັງໝົດ)', province: 'ໄຊຍະບູລີ', lat: 19.2553, lng: 101.7547, zoom: 9, isProv: true },
  { id: 'xb_xayabury', name: 'ເມືອງໄຊຍະບູລີ', province: 'ໄຊຍະບູລີ', lat: 19.2553, lng: 101.7547, zoom: 12 },
  { id: 'xb_hongsa', name: 'ເມືອງຫົງສາ', province: 'ໄຊຍະບູລີ', lat: 19.7000, lng: 101.3300, zoom: 12 },
  { id: 'xb_kenethao', name: 'ເມືອງແກ່ນທ້າວ', province: 'ໄຊຍະບູລີ', lat: 17.8500, lng: 101.3700, zoom: 12 },

  // ຊຽງຂວາງ
  { id: 'xk_all', name: 'ແຂວງ ຊຽງຂວາງ (ທັງໝົດ)', province: 'ຊຽງຂວາງ', lat: 19.4526, lng: 103.2208, zoom: 9, isProv: true },
  { id: 'xk_paek', name: 'ເມືອງແປກ (ໂພນສະຫວັນ)', province: 'ຊຽງຂວາງ', lat: 19.4526, lng: 103.2208, zoom: 12 },
  { id: 'xk_kham', name: 'ເມືອງຄຳ', province: 'ຊຽງຂວາງ', lat: 19.7800, lng: 103.6200, zoom: 12 },

  // ຫົວພັນ
  { id: 'hp_all', name: 'ແຂວງ ຫົວພັນ (ທັງໝົດ)', province: 'ຫົວພັນ', lat: 20.4208, lng: 104.0439, zoom: 9, isProv: true },
  { id: 'hp_samneua', name: 'ເມືອງຊຳເໜືອ', province: 'ຫົວພັນ', lat: 20.4208, lng: 104.0439, zoom: 12 },
  { id: 'hp_viengxay', name: 'ເມືອງວຽງໄຊ', province: 'ຫົວພັນ', lat: 20.4000, lng: 104.2200, zoom: 12 },

  // ອຸດົມໄຊ
  { id: 'ox_all', name: 'ແຂວງ ອຸດົມໄຊ (ທັງໝົດ)', province: 'ອຸດົມໄຊ', lat: 20.6908, lng: 101.9840, zoom: 9, isProv: true },
  { id: 'ox_xay', name: 'ເມືອງໄຊ', province: 'ອຸດົມໄຊ', lat: 20.6908, lng: 101.9840, zoom: 12 },

  // ຫຼວງນ້ຳທາ
  { id: 'ln_all', name: 'ແຂວງ ຫຼວງນ້ຳທາ (ທັງໝົດ)', province: 'ຫຼວງນ້ຳທາ', lat: 20.9578, lng: 101.4019, zoom: 9, isProv: true },
  { id: 'ln_namtha', name: 'ເມືອງຫຼວງນ້ຳທາ', province: 'ຫຼວງນ້ຳທາ', lat: 20.9578, lng: 101.4019, zoom: 12 },
  { id: 'ln_botene', name: 'ບໍ່ເຕັນ (ດ່ານຊາຍແດນ)', province: 'ຫຼວງນ້ຳທາ', lat: 21.1900, lng: 101.6800, zoom: 13 },

  // ບໍ່ແກ້ວ
  { id: 'bo_all', name: 'ແຂວງ ບໍ່ແກ້ວ (ທັງໝົດ)', province: 'ບໍ່ແກ້ວ', lat: 20.2764, lng: 100.4136, zoom: 9, isProv: true },
  { id: 'bo_houayxay', name: 'ເມືອງຫ້ວຍຊາຍ', province: 'ບໍ່ແກ້ວ', lat: 20.2764, lng: 100.4136, zoom: 12 },
  { id: 'bo_tonpheung', name: 'ເມືອງຕົ້ນເຜິ້ງ (ເຂດເສດຖະກິດພິເສດ)', province: 'ບໍ່ແກ້ວ', lat: 20.3500, lng: 100.1200, zoom: 12 },

  // ຜົ້ງສາລີ
  { id: 'ps_all', name: 'ແຂວງ ຜົ້ງສາລີ (ທັງໝົດ)', province: 'ຜົ້ງສາລີ', lat: 21.6833, lng: 102.1000, zoom: 9, isProv: true },
  { id: 'ps_phongsaly', name: 'ເມືອງຜົ້ງສາລີ', province: 'ຜົ້ງສາລີ', lat: 21.6833, lng: 102.1000, zoom: 12 },

  // ສາລະວັນ
  { id: 'sl_all', name: 'ແຂວງ ສາລະວັນ (ທັງໝົດ)', province: 'ສາລະວັນ', lat: 15.7167, lng: 106.4167, zoom: 9, isProv: true },
  { id: 'sl_salavan', name: 'ເມືອງສາລະວັນ', province: 'ສາລະວັນ', lat: 15.7167, lng: 106.4167, zoom: 12 },

  // ເຊກອງ
  { id: 'sk_all', name: 'ແຂວງ ເຊກອງ (ທັງໝົດ)', province: 'ເຊກອງ', lat: 15.3444, lng: 106.7208, zoom: 9, isProv: true },
  { id: 'sk_lammam', name: 'ເມືອງລະມາມ', province: 'ເຊກອງ', lat: 15.3444, lng: 106.7208, zoom: 12 },

  // ອັດຕະປື
  { id: 'at_all', name: 'ແຂວງ ອັດຕະປື (ທັງໝົດ)', province: 'ອັດຕະປື', lat: 14.8107, lng: 106.8327, zoom: 9, isProv: true },
  { id: 'at_samakkhixay', name: 'ເມືອງສາມັກຄີໄຊ', province: 'ອັດຕະປື', lat: 14.8107, lng: 106.8327, zoom: 12 },
  { id: 'at_sanamxay', name: 'ເມືອງສະໜາມໄຊ', province: 'ອັດຕະປື', lat: 14.7300, lng: 106.5200, zoom: 12 },

  // ໄຊສົມບູນ
  { id: 'xs_all', name: 'ແຂວງ ໄຊສົມບູນ (ທັງໝົດ)', province: 'ໄຊສົມບູນ', lat: 18.9167, lng: 103.1167, zoom: 9, isProv: true },
  { id: 'xs_anouvong', name: 'ເມືອງອະນຸວົງ', province: 'ໄຊສົມບູນ', lat: 18.9167, lng: 103.1167, zoom: 12 },
];

const MEKONG_STATIONS = [
  { province: 'ຫຼວງພະບາງ', station: 'ສະຖານີຫຼວງພະບາງ', warn: '17.50 ມ', danger: '18.00 ມ' },
  { province: 'ນະຄອນຫຼວງວຽງຈັນ', station: 'ຫຼັກ 4 / ດອນຈັນ', warn: '11.50 ມ', danger: '12.50 ມ' },
  { province: 'ຄຳມ່ວນ', station: 'ສະຖານີທ່າແຂກ', warn: '13.00 ມ', danger: '14.00 ມ' },
  { province: 'ສະຫວັນນະເຂດ', station: 'ສະຖານີສະຫວັນນະເຂດ', warn: '12.00 ມ', danger: '13.00 ມ' },
  { province: 'ຈຳປາສັກ', station: 'ສະຖານີປາກເຊ', warn: '11.00 ມ', danger: '12.00 ມ' },
];

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

  // ຈັດການສະຖານທີ່ທີ່ເລືອກ
  const [currentLocationName, setCurrentLocationName] = useState('📍 ທົ່ວປະເທດ');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [expandedProv, setExpandedProv] = useState(null);

  const [mapTarget, setMapTarget] = useState({
    center: [18.5, 103.5],
    zoom: 7
  });

  const [mapType, setMapType] = useState('street');
  const [showRadar, setShowRadar] = useState(false);
  const [radarTileUrl, setRadarTileUrl] = useState('');

  const [isRiverModalOpen, setIsRiverModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [shareReport, setShareReport] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

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

  // ເມື່ອກົດເລືອກເມືອງ/ແຂວງ ຈາກ Modal
  const handleSelectLocation = (loc) => {
    if (loc.id === 'all') {
      setCurrentLocationName('📍 ທົ່ວປະເທດ');
      setMapTarget({ center: [18.5, 103.5], zoom: 7 });
    } else {
      setCurrentLocationName(`📍 ${loc.name}`);
      setMapTarget({ center: [loc.lat, loc.lng], zoom: loc.zoom });
    }
    setIsLocationModalOpen(false);
    setLocationSearch('');
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

  // ກັ່ນຕອງເມືອງຕາມຄຳຄົ້ນຫາໃນ Modal
  const searchedDistricts = locationSearch.trim()
    ? LAO_DISTRICTS.filter((d) => 
        d.name.toLowerCase().includes(locationSearch.toLowerCase()) || 
        d.province.toLowerCase().includes(locationSearch.toLowerCase())
      )
    : [];

  // ແຍກລາຍຊື່ແຂວງສຳລັບສະແດງໃນ Modal
  const provinceList = Array.from(new Set(LAO_DISTRICTS.filter(d => !d.isCountry).map(d => d.province)));

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
        {/* ປຸ່ມກົດເປີດເລືອກແຂວງ/ເມືອງ */}
        <button 
          className="btn-location-picker"
          onClick={() => setIsLocationModalOpen(true)}
        >
          <MapPin size={14} />
          <span>{currentLocationName}</span>
          <ChevronDown size={14} />
        </button>

        {/* ຊ່ອງຄົ້ນຫາດ່ວນ */}
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
        </MapContainer>
      </div>

      {/* Modal ເລືອກພື້ນທີ່ ແລະ ເມືອງ (Location & District Picker Modal) */}
      {isLocationModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="#2563eb" />
                ເລືອກພື້ນທີ່ ຫຼື ຄົ້ນຫາເມືອງ
              </h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsLocationModalOpen(false)} />
            </div>

            {/* ຊ່ອງຄົ້ນຫາເມືອງ/ແຂວງ */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
              <input 
                type="text"
                className="loc-search-input"
                placeholder="ພິມຊື່ເມືອງ ຫຼື ແຂວງ (ເຊັ່ນ: ວັງວຽງ, ທ່າແຂກ...)"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                autoFocus
              />
            </div>

            {/* ຖ້າມີການພິມຄົ້ນຫາ -> ສະແດງຜົນການຄົ້ນຫາ */}
            {locationSearch.trim() ? (
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
                  ພົບ {searchedDistricts.length} ເມືອງ/ແຂວງ:
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {searchedDistricts.map((d) => (
                    <div 
                      key={d.id}
                      className="loc-district-item"
                      style={{ marginBottom: '6px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onClick={() => handleSelectLocation(d)}
                    >
                      <div>
                        <strong>{d.name}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{d.province}</div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#2563eb' }}>Zoom 🔍</span>
                    </div>
                  ))}
                  {searchedDistricts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                      ບໍ່ພົບຊື່ເມືອງນີ້
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ຖ້າບໍ່ໄດ້ພິມ -> ສະແດງລາຍຊື່ແຂວງ ແລະ ເມືອງພາຍໃນ */
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {/* ປຸ່ມທົ່ວປະເທດ */}
                <button 
                  className="loc-category-btn"
                  style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
                  onClick={() => handleSelectLocation({ id: 'all', name: 'ທົ່ວປະເທດ' })}
                >
                  <span>📍 ທົ່ວປະເທດ (ມຸມມອງໃຫຍ່)</span>
                  <ChevronRight size={16} />
                </button>

                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', margin: '12px 0 6px 4px' }}>
                  ເລືອກຕາມແຂວງ:
                </div>

                {provinceList.map((provName) => {
                  const provDistricts = LAO_DISTRICTS.filter((d) => d.province === provName);
                  const isExpanded = expandedProv === provName;

                  return (
                    <div key={provName} style={{ marginBottom: '4px' }}>
                      <button 
                        className="loc-category-btn"
                        onClick={() => setExpandedProv(isExpanded ? null : provName)}
                      >
                        <span>{provName} ({provDistricts.length} ເມືອງ)</span>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>

                      {isExpanded && (
                        <div className="loc-district-grid">
                          {provDistricts.map((d) => (
                            <button 
                              key={d.id}
                              className="loc-district-item"
                              onClick={() => handleSelectLocation(d)}
                            >
                              {d.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal ຂໍ້ມູນລະດັບນ້ຳຂອງ */}
      {isRiverModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRiverModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Waves size={20} color="#2563eb" />
                ເກນລະດັບນ້ຳຂອງເຝົ້າລະວັງ (Mekong Levels)
              </h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsRiverModalOpen(false)} />
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px', lineHeight: '1.5' }}>
              ລະດັບນ້ຳມາດຕະຖານຕາມແຕ່ລະສະຖານີວັດແທກຫຼັກ ແຄມແມ່ນ້ຳຂອງໃນ ສປປ ລາວ:
            </p>

            <table className="river-table">
              <thead>
                <tr>
                  <th>ແຂວງ / ຈຸດວັດແທກ</th>
                  <th>ລະດັບເຕືອນໄພ</th>
                  <th>ລະດັບອັນຕະລາຍ</th>
                </tr>
              </thead>
              <tbody>
                {MEKONG_STATIONS.map((st, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{st.province}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{st.station}</div>
                    </td>
                    <td><span className="badge-warn">{st.warn}</span></td>
                    <td><span className="badge-danger">{st.danger}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal ແນະນຳການຕິດຕັ້ງແອັບມືຖື */}
      {isInstallModalOpen && (
        <div className="modal-overlay" onClick={() => setIsInstallModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={20} color="#2563eb" />
                ຕິດຕັ້ງແອັບເທິງໜ້າຈໍມືຖື
              </h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsInstallModalOpen(false)} />
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                🍎 ສຳລັບ iPhone / iPad (Safari):
              </h4>
              <ol style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px', lineHeight: '1.7' }}>
                <li>ກົດປຸ່ມ <strong>Share</strong> (ຮູບສີ່ຫຼ່ຽມລູກສອນຊີ້ຂຶ້ນ ⬆️) ຢູ່ລຸ່ມສຸດຂອງ Safari.</li>
                <li>ເລື່ອນລົງແລ້ວກົດເລືອກ <strong>"Add to Home Screen (ເພີ່ມໃສ່ໜ້າຈໍໂຮມ ➕)"</strong>.</li>
                <li>ກົດປຸ່ມ <strong>"Add (ເພີ່ມ)"</strong> ຢູ່ມຸມຂວາເທິງ.</li>
              </ol>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                🤖 ສຳລັບ Android (Chrome):
              </h4>
              <ol style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px', lineHeight: '1.7' }}>
                <li>ກົດປຸ່ມເມນູ <strong>ຈຸດສາມຈຸດ (⋮)</strong> ຢູ່ມຸມຂວາເທິງຂອງ Chrome.</li>
                <li>ກົດເລືອກ <strong>"Install app (ຕິດຕັ້ງແອັບ)"</strong> ຫຼື <strong>"Add to Home screen"</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

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
