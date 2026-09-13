import React from 'react';
import { X, Lock, BarChart3, BookOpen, PhoneCall, Smartphone, ShieldAlert } from 'lucide-react';

export default function MenuModal({
  isOpen,
  onClose,
  onOpenAdmin,
  onOpenDashboard,
  onOpenGuide,
  onOpenEmergency,
  onOpenInstall
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content menu-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#dc2626" />
            <h2 style={{ margin: 0, fontSize: '16px' }}>ເມນູ & ຕົວເລືອກເພີ່ມເຕີມ</h2>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="menu-list-body">
          {/* ປຸ່ມເຂົ້າລະບົບຫຼັງບ້ານ */}
          <button
            className="menu-item-btn menu-item-admin"
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
          >
            <div className="menu-icon-wrap icon-admin">
              <Lock size={18} />
            </div>
            <div className="menu-item-text">
              <div className="menu-item-title">ລະບົບຫຼັງບ້ານ (Admin Panel)</div>
              <div className="menu-item-desc">ສຳລັບຜູ້ດູແລລະບົບ: ລຶບໝຸດປອມ, ຈັດການເຫດການ</div>
            </div>
          </button>

          {/* ປຸ່ມສະຖິຕິ Dashboard */}
          <button
            className="menu-item-btn"
            onClick={() => {
              onClose();
              onOpenDashboard();
            }}
          >
            <div className="menu-icon-wrap icon-blue">
              <BarChart3 size={18} />
            </div>
            <div className="menu-item-text">
              <div className="menu-item-title">ສະຫຼຸບສະຖານະການ & ສະຖິຕິ</div>
              <div className="menu-item-desc">ເບິ່ງພາບລວມ ແລະ ດາວໂຫຼດຮູບ Infographic</div>
            </div>
          </button>

          {/* ປຸ່ມຄູ່ມືເອົາຕົວລອດ */}
          <button
            className="menu-item-btn"
            onClick={() => {
              onClose();
              onOpenGuide();
            }}
          >
            <div className="menu-icon-wrap icon-green">
              <BookOpen size={18} />
            </div>
            <div className="menu-item-text">
              <div className="menu-item-title">ຄູ່ມືເອົາຕົວລອດ & ປະຖົມພະຍາບານ</div>
              <div className="menu-item-desc">ໄຟຟ້າຮົ່ວ, ຊ່ວຍຄົນຈົມນ້ຳ, ງູກັດ (Offline Ready)</div>
            </div>
          </button>

          {/* ປຸ່ມເບີສຸກເສີນ */}
          <button
            className="menu-item-btn"
            onClick={() => {
              onClose();
              onOpenEmergency();
            }}
          >
            <div className="menu-icon-wrap icon-red">
              <PhoneCall size={18} />
            </div>
            <div className="menu-item-text">
              <div className="menu-item-title">ສາຍດ່ວນສຸກເສີນ</div>
              <div className="menu-item-desc">ດັບເພີງ 1190, ກູ້ໄພ 1623, ແພດ 1195</div>
            </div>
          </button>

          {/* ປຸ່ມຕິດຕັ້ງແອັບ */}
          <button
            className="menu-item-btn"
            onClick={() => {
              onClose();
              onOpenInstall();
            }}
          >
            <div className="menu-icon-wrap icon-slate">
              <Smartphone size={18} />
            </div>
            <div className="menu-item-text">
              <div className="menu-item-title">ຕິດຕັ້ງແອັບ (PWA)</div>
              <div className="menu-item-desc">ເພີ່ມໃສ່ໜ້າຈໍໂຮມຂອງມືຖື ເພື່ອໃຊ້ງານສະດວກ</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
