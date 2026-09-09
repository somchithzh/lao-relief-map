import React, { useState } from 'react';
import { Phone, PhoneCall, X, Search, ShieldAlert } from 'lucide-react';
import { NATIONAL_HOTLINES, PROVINCIAL_CONTACTS } from '../data/emergencyContacts';

export default function EmergencyModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredProv = search.trim()
    ? PROVINCIAL_CONTACTS.filter(c => 
        c.province.toLowerCase().includes(search.toLowerCase()) || 
        c.org.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      )
    : PROVINCIAL_CONTACTS;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
            <PhoneCall size={20} color="#dc2626" />
            ເບີໂທສຸກເສີນ ແລະ ໜ່ວຍກູ້ໄພ
          </h2>
          <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>

        <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px', lineHeight: '1.5' }}>
          ກົດທີ່ປຸ່ມໂທເພື່ອໂທອອກສຸກເສີນໄດ້ທັນທີ (ຟຣີສຳລັບເບີດ່ວນ 4 ໂຕ):
        </p>

        {/* ເບີດ່ວນຫຼັກທົ່ວປະເທດ */}
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
          🚨 ເບີດ່ວນສຸກເສີນຫຼັກ (ໂທຟຣີ):
        </div>

        <div className="emergency-hotline-grid">
          {NATIONAL_HOTLINES.map((h, idx) => (
            <a key={idx} href={`tel:${h.number}`} className="hotline-card">
              <div className="hotline-number">
                <Phone size={15} /> {h.number}
              </div>
              <div className="hotline-title">{h.title}</div>
            </a>
          ))}
        </div>

        {/* ເບີກູ້ໄພ ແລະ ໂຮງໝໍແຕ່ລະແຂວງ */}
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: '14px 0 8px 0' }}>
          📍 ໜ່ວຍກູ້ໄພ ແລະ ສຸກເສີນປະຈຳແຂວງ:
        </div>

        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
          <input 
            type="text" 
            className="loc-search-input" 
            placeholder="ຄົ້ນຫາຊື່ແຂວງ (ເຊັ່ນ: ຜົ້ງສາລີ, ຄຳມ່ວນ...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px 8px 32px', marginBottom: '4px', fontSize: '12.5px' }}
          />
        </div>

        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {filteredProv.map((c, idx) => (
            <div key={idx} className="prov-contact-item">
              <div className="prov-contact-info">
                <h4>{c.province}</h4>
                <p>{c.org}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="btn-call-mini">
                  <Phone size={12} /> {c.phone}
                </a>
                {c.altPhone && (
                  <a href={`tel:${c.altPhone.replace(/\s+/g, '')}`} className="btn-call-mini" style={{ background: '#0284c7' }}>
                    <Phone size={12} /> {c.altPhone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
