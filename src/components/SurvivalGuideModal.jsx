import React, { useState } from 'react';
import { X, BookOpen, Zap, HeartPulse, ShieldAlert, Droplets, Search, Check, AlertCircle, Phone, WifiOff } from 'lucide-react';

const GUIDE_SECTIONS = [
  {
    id: 'electricity',
    title: '⚡ ໄຟຟ້າຮົ່ວ & ຄວາມປອດໄພ',
    icon: '⚡',
    badge: 'ອັນຕະລາຍຮອດຊີວິດ',
    badgeColor: '#ef4444',
    items: [
      {
        topic: 'ການຕັດໄຟຟ້າກ່ອນນ້ຳຖ້ວມ',
        dos: [
          'ສັບເບຣກເກີ (Cut-out) ຫຼື ຕັດສະວິດໄຟຊັ້ນລຸ່ມລົງທັນທີກ່ອນນ້ຳຈະຂຶ້ນຮອດປັກສຽບ.',
          'ຖອດປັກສຽບເຄື່ອງໃຊ້ໄຟຟ້າທຸກຊະນິດ ແລະ ຍ້າຍຂຶ້ນບ່ອນສູງພົ້ນລະດັບນ້ຳ.'
        ],
        donts: [
          'ຫ້າມແຕະຕ້ອງສະວິດໄຟ ຫຼື ສຽບປັກໄຟໃນຂະນະທີ່ມືປຽກ ຫຼື ຢືນຢູ່ໃນນ້ຳເດັດຂາດ.'
        ]
      },
      {
        topic: 'ສາຍໄຟຂາດຕົກລົງນ້ຳ & ນ້ຳມີໄຟຮົ່ວ',
        dos: [
          'ຖ້າເຫັນສາຍໄຟຂາດຕົກລົງນ້ຳ ໃຫ້ຢູ່ຫ່າງຢ່າງໜ້ອຍ 10 ແມັດ ແລະ ແຈ້ງໄຟຟ້າທັນທີ.',
          'ຖ້າກຳລັງຍ່າງລຸຍນ້ຳແລ້ວຮູ້ສຶກຊາໆປາຍຕີນ: ໃຫ້ຢຸດທັນທີ! ຫ້າມຍ່າງຕໍ່ ໃຫ້ຄ່ອຍໆຖອຍຫຼັງອອກມາທາງເກົ່າ.'
        ],
        donts: [
          'ຫ້າມຍ່າງຜ່ານ ຫຼື ພາຍເຮືອເຂົ້າໃກ້ເສົາໄຟຟ້າທີ່ຈົມນ້ຳ ເພາະອາດມີກະແສໄຟຟ້າຮົ່ວລົງນ້ຳ.'
        ]
      },
      {
        topic: 'ວິທີຊ່ວຍຄົນຖືກໄຟຊັອດໃນນ້ຳ',
        dos: [
          'ຕັດກະແສໄຟຟ້າ (ສັບເບຣກເກີໃຫຍ່) ກ່ອນເປັນອັນດັບທຳອິດສະເໝີ.',
          'ຖ້າຕັດໄຟບໍ່ໄດ້: ໃຫ້ໃຊ້ວັດຖຸແຫ້ງທີ່ເປັນສະນວນ (ໄມ້ໄຜ່ແຫ້ງ, ຜ້າແຫ້ງ, ສາຍຢາງແຫ້ງ) ດຶງ ຫຼື ເຂ່ຍຜູ້ເຄາະຮ້າຍອອກມາ.'
        ],
        donts: [
          'ຫ້າມໂດດລົງໄປຊ່ວຍ ຫຼື ໃຊ້ “ມືເປົ່າ” ຈັບຕ້ອງຕົວຜູ້ຖືກໄຟຊັອດເດັດຂາດ ເພາະຈະຖືກໄຟດູດຕາຍນຳກັນ!'
        ]
      }
    ]
  },
  {
    id: 'firstaid',
    title: '🫁 ຊ່ວຍຄົນຈົມນ້ຳ & ປ້ຳຫົວໃຈ (CPR)',
    icon: '🫁',
    badge: 'ການປະຖົມພະຍາບານ',
    badgeColor: '#2563eb',
    items: [
      {
        topic: 'ຫຼັກການຊ່ວຍຄົນຈົມນ້ຳ: "ຍື່ນ - ໂຍນ - ພາຍ"',
        dos: [
          'ຍື່ນ: ຢືນຢູ່ບ່ອນໝັ້ນຄົງເທິງບົກ ແລ້ວຍື່ນໄມ້ຍາວ, ກິ່ງໄມ້, ຫຼື ຜ້າຂາວມ້າໃຫ້ຄົນຈົມນ້ຳຈັບ.',
          'ໂຍນ: ໂຍນອຸປະກອນທີ່ລອຍນ້ຳໄດ້ໃຫ້ເກາະ ເຊັ່ນ: ຖັງນ້ຳປລາສຕິກເປົ່າ, ແກ້ວນ້ຳປລາສຕິກ, ຢາງລົດ, ເຊືອກ.',
          'ພາຍ: ຖ້າຕ້ອງອອກໄປຊ່ວຍ ໃຫ້ພາຍເຮືອ ຫຼື ໃຊ້ແພ ຫ້າມລອຍນ້ຳໄປດ້ວຍມືເປົ່າ.'
        ],
        donts: [
          'ຫ້າມໂດດລົງນ້ຳໄປກອດຊ່ວຍຄົນຈົມນ້ຳດ້ວຍມືເປົ່າ ເພາະຄົນກຳລັງຈົມຈະຕົກໃຈ ແລະ ກົດຕົວເຮົາຈົມນ້ຳນຳ.'
        ]
      },
      {
        topic: 'ວິທີປ້ຳຫົວໃຈ CPR (ເມື່ອຄົນເຈັບບໍ່ຫາຍໃຈ & ໝົດສະຕິ)',
        dos: [
          'ວາງຄົນເຈັບນອນຫງາຍເທິງພື້ນຮາບພຽງ ແລະ ແຂງ.',
          'ວາງສັນມືກາງໜ້າເອິກ (ລະຫວ່າງຫົວນົມສອງຂ້າງ) ເອົາມືອີກຂ້າງປະສານໄວ້ດ້ານເທິງ.',
          'ແຂນຊື່, ກົດລົງເລິກປະມານ 5 ຊັງຕີແມັດ, ຈັງຫວະກົດ 100 ຫາ 120 ຄັ້ງຕໍ່ນາທີ (ກົດໄວ ແລະ ສະໝ່ຳສະເໝີ).',
          'ກົດຕໍ່ເນື່ອງຈົນກວ່າໜ່ວຍກູ້ໄພຈະມາຮອດ ຫຼື ຄົນເຈັບເລີ່ມຫາຍໃຈ.'
        ],
        donts: [
          'ຫ້າມເອົາຄົນເຈັບຂຶ້ນແບກບ່າເພື່ອໃຫ້ນ້ຳອອກຈາກທ້ອງ ເພາະຈະເຮັດໃຫ້ນ້ຳເຂົ້າປອດ ແລະ ເສຍເວລາຊ່ວຍຊີວິດ!'
        ]
      },
      {
        topic: 'ທ່ານອນປອດໄພ (Recovery Position)',
        dos: [
          'ເມື່ອຄົນເຈັບເລີ່ມຫາຍໃຈແຕ່ຍັງບໍ່ທັນຮູ້ສຶກຕົວ ໃຫ້ຈັບນອນຕະແຄງຂ້າງ.',
          'ງໍຂາດ້ານເທິງຂຶ້ນເລັກນ້ອຍເພື່ອບໍ່ໃຫ້ລົ້ມ, ແຫງນຄາງຂຶ້ນເປີດທາງເດີນຫາຍໃຈ ເພື່ອບໍ່ໃຫ້ນ້ຳລາຍ ຫຼື ຮາກອຸດຕັນຄໍ.'
        ],
        donts: [
          'ຫ້າມໃຫ້ນອນຫງາຍຖ້າຄົນເຈັບຍັງໝົດສະຕິ ເພາະອາດສຳລັກນ້ຳລາຍຕົວເອງ.'
        ]
      }
    ]
  },
  {
    id: 'creatures',
    title: '🐍 ສັດມີພິດ (ງູ, ຂີ້ເຂັບ, ແມງງອດ)',
    icon: '🐍',
    badge: 'ລະວັງເປັນພິເສດ',
    badgeColor: '#d97706',
    items: [
      {
        topic: 'ການປ້ອງກັນສັດມີພິດໜີນ້ຳຂຶ້ນເຮືອນ',
        dos: [
          'ກວດກາບ່ອນສູງກ່ອນນອນສະເໝີ ເຊັ່ນ: ເທິງຕຽງ, ຫຼັງຕູ້, ຊອກຫຼັງຄາ, ແລະ ຂອບປ່ອງຢ້ຽມ ເພາະງູມັກໜີນ້ຳຂຶ້ນມາລີ້.',
          'ໃຊ້ໄມ້ເຄາະສຽງດັງໆກ່ອນຈະຍ່າງເຂົ້າໄປບ່ອນມືດ ຫຼື ບ່ອນມີເຄື່ອງກອງກັນ.'
        ],
        donts: [
          'ຫ້າມເອົາມືລ້ວງເຂົ້າໄປໃນໂພງໄມ້, ຊອກຫຼັງຄາ, ຫຼື ພຸ່ມໄມ້ໂດຍບໍ່ເອົາໄມ້ເຂ່ຍເບິ່ງກ່ອນ.'
        ]
      },
      {
        topic: 'ວິທີປະຖົມພະຍາບານເມື່ອງູກັດ',
        dos: [
          'ໃຫ້ຄົນເຈັບຢູ່ "ນິ້ງທີ່ສຸດ" ຫ້າມແລ່ນ ຫຼື ຕື່ນຕົກໃຈ ເພາະການເຄື່ອນໄຫວຈະເຮັດໃຫ້ພິດແຜ່ລາມໄວ.',
          'ລ້າງບາດແຜດ້ວຍນ້ຳສະອາດ ແລະ ສະບູ.',
          'ດາມອະໄວຍະວະສ່ວນທີ່ຖືກກັດດ້ວຍໄມ້ ແລະ ຜ້າພັນ (ຄືກັບການດາມກະດູກຫັກ) ບໍ່ໃຫ້ຂະຍັບ.',
          'ຖ່າຍຮູບງູໄວ້ (ຖ້າປອດໄພ) ເພື່ອໃຫ້ແພດເລືອກເຊຣຸ່ມແກ້ພິດຖືກຊະນິດ.'
        ],
        donts: [
          '❌ ຫ້າມເອົາປາກດູດພິດງູເດັດຂາດ!',
          '❌ ຫ້າມເອົາມີດກີດບາດແຜ!',
          '❌ ຫ້າມເອົາເຊືອກມັດຮັດແໜ້ນເກີນໄປ (Tourniquet) ເພາະຈະເຮັດໃຫ້ເລືອດບໍ່ໄປລ້ຽງຈົນຊີ້ນຕາຍ ແລະ ອາດຕ້ອງຕັດແຂນ/ຂາ!'
        ]
      }
    ]
  },
  {
    id: 'water_kit',
    title: '💧 ນ້ຳດື່ມສະອາດ & ກະເປົາສຸກເສີນ',
    icon: '💧',
    badge: 'ການດຳລົງຊີວິດ',
    badgeColor: '#059669',
    items: [
      {
        topic: 'ວິທີເຮັດນ້ຳຖ້ວມໃຫ້ນຳມາດື່ມໄດ້ (ສຸກເສີນ)',
        dos: [
          'ຕັກນ້ຳຖ້ວມມາປະໄວ້ໃນຖັງໃຫ້ຕົກຕະກອນ (ຖ້າມີສານສົ້ມ ໃຫ້ກວນສານສົ້ມຈະໃສໄວຂຶ້ນ).',
          'ກັ່ນຕອງນ້ຳໃສດ້ານເທິງຜ່ານຜ້າຂາວມ້າສະອາດ ຫຼື ສຳລີຫຼາຍໆຊັ້ນ.',
          'ຕົ້ມນ້ຳໃຫ້ຟົດຢ່າງໜ້ອຍ 3 ຫາ 5 ນາທີ ເພື່ອຂ້າເຊື້ອພະຍາດທຸກຊະນິດກ່ອນດື່ມ.'
        ],
        donts: [
          'ຫ້າມດື່ມນ້ຳຖ້ວມໂດຍບໍ່ຜ່ານການຕົ້ມເດັດຂາດ ເພາະມີທັງເຊື້ອພະຍາດຖອກທ້ອງ ແລະ ພະຍາດຍ່ຽວໜູ (Leptospirosis) ທີ່ຮ້າຍແຮງ.'
        ]
      },
      {
        topic: 'ສິ່ງຂອງທີ່ຕ້ອງໃສ່ກະເປົາສຸກເສີນກັນນ້ຳ (Go-Bag)',
        dos: [
          'ເອກະສານສຳຄັນ: ປຶ້ມສຳມະໂນຄົວ, ບັດປະຈຳຕົວ, ໃບຕາດິນ (ຫໍ່ຖົງຢາງມັດໃຫ້ແໜ້ນ).',
          'ຢາປະຈຳຕົວ ແລະ ຊຸດປະຖົມພະຍາບານເບື້ອງຕົ້ນ (ຢາພາຣາ, ຢາລ້າງແຜ, ເກືອແຮ່ ORS).',
          'ໄຟສາຍ, ໝໍ້ໄຟສຳຮອງ (Power Bank), ແລະ ສາຍສາກ.',
          'ອາຫານແຫ້ງ, ໝີ່, ປາກະປ໋ອງ, ແລະ ນ້ຳດື່ມຕຸກນ້ອຍ.'
        ],
        donts: [
          'ຢ່າຂົນເຄື່ອງທີ່ໜັກເກີນໄປຈົນເຄື່ອນຍ້າຍບໍ່ສະດວກ ໃຫ້ເອົາສະເພາະສິ່ງທີ່ຈຳເປັນຕໍ່ຊີວິດເທົ່ານັ້ນ.'
        ]
      }
    ]
  }
];

export default function SurvivalGuideModal({ isOpen, onClose, isOnline }) {
  const [activeTab, setActiveTab] = useState('electricity');
  const [searchKeyword, setSearchKeyword] = useState('');

  if (!isOpen) return null;

  const filteredSections = GUIDE_SECTIONS.map((sec) => {
    if (!searchKeyword.trim()) return sec;
    const kw = searchKeyword.toLowerCase();
    const matchedItems = sec.items.filter((item) => {
      const inTopic = item.topic.toLowerCase().includes(kw);
      const inDos = item.dos.some((d) => d.toLowerCase().includes(kw));
      const inDonts = item.donts.some((d) => d.toLowerCase().includes(kw));
      return inTopic || inDos || inDonts;
    });
    return { ...sec, items: matchedItems };
  }).filter((sec) => sec.items.length > 0);

  const currentSection =
    filteredSections.find((s) => s.id === activeTab) || filteredSections[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content survival-guide-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header survival-guide-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="survival-guide-icon-box">
              <BookOpen size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                ຄູ່ມືເອົາຕົວລອດ & ປະຖົມພະຍາບານ
              </h2>
              <span className="offline-badge-pill">
                <WifiOff size={11} /> ໃຊ້ໄດ້ຕະຫຼອດເວລາ (Offline Ready)
              </span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ຊ່ອງຄົ້ນຫາດ່ວນ */}
        <div className="survival-search-wrap">
          <Search size={14} className="survival-search-icon" />
          <input
            type="text"
            className="survival-search-input"
            placeholder="ຄົ້ນຫາ: ງູ, ໄຟຟ້າ, cpr, ນ້ຳດື່ມ, ໄຟຊັອດ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <button
              className="survival-search-clear"
              onClick={() => setSearchKeyword('')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ແຖວ Tab ໝວດໝູ່ */}
        <div className="survival-tabs-bar">
          {GUIDE_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              className={`survival-tab-btn ${activeTab === sec.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(sec.id);
                setSearchKeyword('');
              }}
            >
              <span>{sec.icon}</span>
              <span>{sec.title.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* ເນື້ອໃນຄູ່ມື */}
        <div className="survival-content-body">
          {currentSection && currentSection.items.length > 0 ? (
            <div className="guide-items-list">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >
                <h3 className="section-title-text">{currentSection.title}</h3>
                <span
                  className="section-status-tag"
                  style={{ backgroundColor: currentSection.badgeColor }}
                >
                  {currentSection.badge}
                </span>
              </div>

              {currentSection.items.map((item, idx) => (
                <div key={idx} className="survival-guide-card">
                  <h4 className="guide-card-topic">{item.topic}</h4>

                  {/* ຄວນເຮັດ (DO) */}
                  <div className="guide-box guide-box-do">
                    <div className="guide-box-header do-header">
                      <Check size={14} /> ຄວນປະຕິບັດ (✔️ ຄວນເຮັດ)
                    </div>
                    <ul className="guide-list">
                      {item.dos.map((d, dIdx) => (
                        <li key={dIdx}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  {/* ຫ້າມເຮັດ (DON'T) */}
                  <div className="guide-box guide-box-dont">
                    <div className="guide-box-header dont-header">
                      <AlertCircle size={14} /> ຂໍ້ຄວນລະວັງ (❌ ຫ້າມເຮັດເດັດຂາດ)
                    </div>
                    <ul className="guide-list">
                      {item.donts.map((d, dIdx) => (
                        <li key={dIdx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="survival-empty-search">
              <AlertCircle size={32} color="#94a3b8" />
              <p>ບໍ່ພົບຂໍ້ມູນທີ່ຕົງກັບຄຳຄົ້ນຫາ "{searchKeyword}"</p>
            </div>
          )}
        </div>

        {/* ປຸ່ມໂທສຸກເສີນດ່ວນດ້ານລຸ່ມ */}
        <div className="survival-footer-emergency">
          <span className="emergency-call-label">📞 ໂທສຸກເສີນດ່ວນ:</span>
          <div className="emergency-quick-buttons">
            <a href="tel:1190" className="quick-call-btn call-fire">
              1190 ດັບເພີງ
            </a>
            <a href="tel:1623" className="quick-call-btn call-rescue">
              1623 ກູ້ໄພ
            </a>
            <a href="tel:1195" className="quick-call-btn call-ambulance">
              1195 ແພດສຸກເສີນ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
