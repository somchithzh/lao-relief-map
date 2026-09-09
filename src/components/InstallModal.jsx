import React from 'react';
import { Smartphone, X } from 'lucide-react';

export default function InstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '17px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={20} color="#2563eb" />
            ຕິດຕັ້ງແອັບເທິງໜ້າຈໍມືຖື
          </h2>
          <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
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
  );
}
