import React, { useState } from 'react';
import { MapPin, X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { LAO_DISTRICTS } from '../data/districts';

export default function LocationModal({ isOpen, onClose, onSelectLocation }) {
  const [locationSearch, setLocationSearch] = useState('');
  const [expandedProv, setExpandedProv] = useState(null);

  if (!isOpen) return null;

  const searchedDistricts = locationSearch.trim()
    ? LAO_DISTRICTS.filter((d) =>
        d.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
        d.province.toLowerCase().includes(locationSearch.toLowerCase())
      )
    : [];

  const provinceList = Array.from(new Set(LAO_DISTRICTS.filter(d => !d.isCountry).map(d => d.province)));

  const handleSelect = (loc) => {
    onSelectLocation(loc);
    setLocationSearch('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#2563eb" />
            ເລືອກພື້ນທີ່ ຫຼື ຄົ້ນຫາເມືອງ
          </h2>
          <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>

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
                  onClick={() => handleSelect(d)}
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
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            <button
              className="loc-category-btn"
              style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
              onClick={() => handleSelect({ id: 'all', name: 'ທົ່ວປະເທດ' })}
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
                          onClick={() => handleSelect(d)}
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
  );
}
