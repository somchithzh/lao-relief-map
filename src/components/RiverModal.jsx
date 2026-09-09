import React from 'react';
import { Waves, X } from 'lucide-react';
import { MEKONG_STATIONS } from '../data/stations';

export default function RiverModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Waves size={20} color="#2563eb" />
            ເກນລະດັບນ້ຳຂອງເຝົ້າລະວັງ (Mekong Levels)
          </h2>
          <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
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
  );
}
