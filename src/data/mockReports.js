// ຂໍ້ມູນຕົວຢ່າງ 15 ເຫດການທົ່ວປະເທດລາວ
const now = Date.now();
const hour = 1000 * 60 * 60;

export const mockReports = [
  // 1. ຂໍຄວາມຊ່ວຍເຫຼືອ (SOS) - ດ່ວນເກີນ 24h
  {
    id: 'mock-1',
    title: 'ນ້ຳຖ້ວມຊັ້ນ 1 ຕິດຄ້າງ 4 ຄົນ ຕ້ອງການເຮືອຊ່ວຍດ່ວນ',
    type: 'sos',
    description: 'ມີເດັກນ້ອຍ 2 ຄົນ ແລະ ຜູ້ເຖົ້າ 1 ຄົນ ນ້ຳຂຶ້ນໄວຫຼາຍ ຕັດໄຟແລ້ວ',
    location_name: 'ບ້ານຫ້ອມ, ເມືອງຫາດຊາຍຟອງ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '020 55512345',
    lat: 17.8920,
    lng: 102.6680,
    status: 'pending',
    created_at: new Date(now - 26 * hour).toISOString()
  },
  // 2. ຂໍຄວາມຊ່ວຍເຫຼືອ (SOS)
  {
    id: 'mock-2',
    title: 'ຕ້ອງການອາຫານ ແລະ ນ້ຳດື່ມ ຕິດຄ້າງເທິງຊັ້ນສອງ',
    type: 'sos',
    description: 'ນ້ຳຖ້ວມອ້ອມເຮືອນ ອອກໄປໃສບໍ່ໄດ້ ອາຫານໝົດແລ້ວ',
    location_name: 'ບ້ານດອນຊາຍ, ເມືອງທ່າແຂກ, ແຂວງຄຳມ່ວນ',
    phone: '020 54321987',
    lat: 17.4040,
    lng: 104.8320,
    status: 'pending',
    created_at: new Date(now - 8 * hour).toISOString()
  },
  // 3. ຂໍຄວາມຊ່ວຍເຫຼືອ (SOS)
  {
    id: 'mock-3',
    title: 'ນ້ຳເຊໂດນນົ້ນຝັ່ງ ໄຫຼເຂົ້າເຮືອນ',
    type: 'sos',
    description: 'ຕ້ອງການກຳລັງຊ່ວຍຍົກເຄື່ອງຂຶ້ນບ່ອນສູງ',
    location_name: 'ບ້ານປາກເຊ, ນະຄອນປາກເຊ, ແຂວງຈຳປາສັກ',
    phone: '020 99887766',
    lat: 15.1200,
    lng: 105.7800,
    status: 'pending',
    created_at: new Date(now - 3 * hour).toISOString()
  },
  // 4. ຂໍຄວາມຊ່ວຍເຫຼືອ (SOS) - ແກ້ໄຂແລ້ວ
  {
    id: 'mock-4',
    title: 'ຕິດຄ້າງກາງສວນ ໄດ້ຮັບການຊ່ວຍເຫຼືອແລ້ວ',
    type: 'sos',
    description: 'ໜ່ວຍກູ້ໄພນຳເຮືອເຂົ້າໄປຮັບອອກມາຢ່າງປອດໄພ',
    location_name: 'ບ້ານນາເລົ່າ, ເມືອງວັງວຽງ, ແຂວງວຽງຈັນ',
    phone: '020 22334455',
    lat: 18.9250,
    lng: 102.4480,
    status: 'resolved',
    resolved_at: new Date(now - 10 * 60 * 1000).toISOString(),
    created_at: new Date(now - 12 * hour).toISOString()
  },

  // 5. ສະພາບເສັ້ນທາງ (Road - ຕັດຂາດ 🔴)
  {
    id: 'mock-5',
    title: '[🔴 ຜ່ານບໍ່ໄດ້ເລີຍ] ທາງເລກ 13 ໃຕ້ ຫຼັກ 42 ນ້ຳຖ້ວມສູງ 80 ຊມ',
    type: 'road',
    description: 'ນ້ຳໄຫຼເຊີ່ຍແຮງ ລົດທຸກຊະນິດຫ້າມຜ່ານເດັດຂາດ ມີຕຳຫຼວດຕັ້ງດ່ານປິດທາງ',
    location_name: 'ບ້ານທ່າບົກ, ເມືອງທ່າພະບາດ, ແຂວງບໍລິຄຳໄຊ',
    phone: '020 11990000',
    lat: 18.3500,
    lng: 103.2000,
    status: 'pending',
    created_at: new Date(now - 4 * hour).toISOString()
  },
  // 6. ສະພາບເສັ້ນທາງ (Road - ຕັດຂາດ 🔴)
  {
    id: 'mock-6',
    title: '[🔴 ຜ່ານບໍ່ໄດ້ເລີຍ] ຂົວຂ້າມນ້ຳມາດິນເຈື່ອນ ຄໍຂົວຊຸດ',
    type: 'road',
    description: 'ຄໍຂົວຊຸດໂຊມລົງເລິກ 2 ແມັດ ກຳລັງລໍຖ້າທີມງານຂົວທາງລົງສ້ອມແປງ',
    location_name: 'ບ້ານກາສີ, ເມືອງກາສີ, ແຂວງວຽງຈັນ',
    phone: '',
    lat: 19.2250,
    lng: 102.2500,
    status: 'pending',
    created_at: new Date(now - 15 * hour).toISOString()
  },
  // 7. ສະພາບເສັ້ນທາງ (Road - ສະເພາະລົດໃຫຍ່ 🟡)
  {
    id: 'mock-7',
    title: '[🟡 ຜ່ານໄດ້ສະເພາະລົດໃຫຍ່] ທາງເລກ 13 ເໜືອ ນ້ຳຖ້ວມທາງ 40 ຊມ',
    type: 'road',
    description: 'ລົດກະບະຍົກສູງຜ່ານໄດ້ຊ້າໆ ລົດເກັງ ແລະ ລົດຈັກຫ້າມຜ່ານ',
    location_name: 'ບ້ານຊຽງເງິນ, ເມືອງຊຽງເງິນ, ແຂວງຫຼວງພະບາງ',
    phone: '',
    lat: 19.7500,
    lng: 102.1800,
    status: 'pending',
    created_at: new Date(now - 6 * hour).toISOString()
  },
  // 8. ສະພາບເສັ້ນທາງ (Road - ປົກກະຕິ 🟢)
  {
    id: 'mock-8',
    title: '[🟢 ຜ່ານໄດ້ປົກກະຕິ] ເສັ້ນທາງບ້ານດອນໜູນ ນ້ຳແຫ້ງໝົດແລ້ວ',
    type: 'road',
    description: 'ອະນາໄມຂີ້ຕົມຮຽບຮ້ອຍ ລົດທຸກຊະນິດສັນຈອນໄດ້ປົກກະຕິ',
    location_name: 'ບ້ານດອນໜູນ, ເມືອງໄຊທານີ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '',
    lat: 18.0400,
    lng: 102.6600,
    status: 'pending',
    created_at: new Date(now - 2 * hour).toISOString()
  },

  // 9. ແຈ້ງເຕືອນ (Warning)
  {
    id: 'mock-9',
    title: 'ລະດັບນ້ຳຂອງຂຶ້ນສູງ ໃກ້ຮອດຈຸດເຕືອນໄພສີແດງ',
    type: 'warning',
    description: 'ແຈ້ງເຕືອນປະຊາຊົນແຄມຂອງ ໃຫ້ເຝົ້າລະວັງ ແລະ ຍ້າຍສັດລ້ຽງຂຶ້ນບ່ອນສູງ',
    location_name: 'ບ້ານສີໄຄ, ເມືອງສີໂຄດຕະບອງ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '',
    lat: 17.9800,
    lng: 102.5800,
    status: 'pending',
    created_at: new Date(now - 5 * hour).toISOString()
  },
  // 10. ແຈ້ງເຕືອນ (Warning)
  {
    id: 'mock-10',
    title: 'ລະວັງດິນເຈື່ອນຕາມເນີນພູ ເນື່ອງຈາກຝົນຕົກໜັກຕິດຕໍ່ກັນ',
    type: 'warning',
    description: 'ມີສຽງດິນເລື່ອນໄຫຼ ຂໍໃຫ້ຜູ້ທີ່ຢູ່ໃກ້ຕີນພູຍ້າຍອອກຊົ່ວຄາວ',
    location_name: 'ບ້ານພູຄູນ, ເມືອງພູຄູນ, ແຂວງຫຼວງພະບາງ',
    phone: '',
    lat: 19.3500,
    lng: 102.4200,
    status: 'pending',
    created_at: new Date(now - 18 * hour).toISOString()
  },
  // 11. ແຈ້ງເຕືອນ (Warning)
  {
    id: 'mock-11',
    title: 'ເຂື່ອນແຈ້ງປ່ອຍນ້ຳ ເຝົ້າລະວັງລະດັບນ້ຳຊອງ',
    type: 'warning',
    description: 'ຄາດວ່ານ້ຳຈະຂຶ້ນສູງອີກ 50 ຊມ ໃນຄືນນີ້',
    location_name: 'ບ້ານວັງວຽງ, ເມືອງວັງວຽງ, ແຂວງວຽງຈັນ',
    phone: '',
    lat: 18.9100,
    lng: 102.4400,
    status: 'pending',
    created_at: new Date(now - 7 * hour).toISOString()
  },

  // 12. ສູນພັກເຊົາ (Shelter)
  {
    id: 'mock-12',
    title: 'ສູນພັກເຊົາຊົ່ວຄາວ ວັດບ້ານໂພນທັນ',
    type: 'shelter',
    description: 'ມີບ່ອນນອນຮອງຮັບໄດ້ 150 ຄົນ, ມີນ້ຳດື່ມສະອາດ ແລະ ຫ້ອງນ້ຳພ້ອມ',
    location_name: 'ວັດບ້ານໂພນທັນ, ເມືອງໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '020 55667788',
    lat: 17.9550,
    lng: 102.6350,
    status: 'pending',
    created_at: new Date(now - 14 * hour).toISOString()
  },
  // 13. ສູນພັກເຊົາ (Shelter)
  {
    id: 'mock-13',
    title: 'ສູນພັກເຊົາໂຮງຮຽນ ມສ ທ່າແຂກ',
    type: 'shelter',
    description: 'ເປີດອາຄານຮຽນ 3 ຫຼັງ ຮອງຮັບປະຊາຊົນທີ່ຖືກນ້ຳຖ້ວມ',
    location_name: 'ມສ ທ່າແຂກ, ເມືອງທ່າແຂກ, ແຂວງຄຳມ່ວນ',
    phone: '020 91234567',
    lat: 17.3950,
    lng: 104.8250,
    status: 'pending',
    created_at: new Date(now - 20 * hour).toISOString()
  },

  // 14. ຈຸດບໍລິຈາກ (Donation)
  {
    id: 'mock-14',
    title: 'ຈຸດຮັບບໍລິຈາກນ້ຳດື່ມ, ເຂົ້າສານ ແລະ ເຮືອຍາງ',
    type: 'donation',
    description: 'ເປີດຮັບເຄື່ອງບໍລິຈາກ 8:00 - 18:00 ໂມງ ທຸກມື້ ເພື່ອນຳໄປຊ່ວຍເຫຼືອເຂດນ້ຳຖ້ວມ',
    location_name: 'ສະໜາມກິລາເຈົ້າອານຸວົງ, ເມືອງຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ',
    phone: '020 55443322',
    lat: 17.9680,
    lng: 102.6080,
    status: 'pending',
    created_at: new Date(now - 10 * hour).toISOString()
  },
  // 15. ຈຸດບໍລິຈາກ (Donation)
  {
    id: 'mock-15',
    title: 'ຈຸດແຈກຢາຍເຂົ້າກ່ອງປຸງສຸກ ແລະ ຢາປິ່ນປົວພະຍາດ',
    type: 'donation',
    description: 'ແຈກຢາຍອາຫານວັນລະ 1,000 ກ່ອງ ສຳລັບຜູ້ປະສົບໄພ',
    location_name: 'ວັດຫຼວງ, ນະຄອນປາກເຊ, ແຂວງຈຳປາສັກ',
    phone: '020 77889900',
    lat: 15.1150,
    lng: 105.7750,
    status: 'pending',
    created_at: new Date(now - 12 * hour).toISOString()
  }
];
