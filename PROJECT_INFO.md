# ໂຄງການ: Lao Relief Map (ແຜນທີ່ຊ່ວຍເຫຼືອໄພພິບັດ)
- ເວັບໄຊຕົວຈິງ: https://somchithzh.github.io/lao-relief-map/
- GitHub: somchithzh/lao-relief-map
- ຖານຂໍ້ມູນ: Supabase (ຕາຕະລາງ reports, bucket: report-images)
- Tech Stack: React (Vite) + Leaflet + OpenStreetMap + Esri Satellite

## ໂຄງສ້າງໄຟລ໌ໂຄງການ (Modular Structure):
- `src/App.jsx`: ແຜນທີ່ ແລະ ໜ້າຫຼັກ
- `src/App.css`: Stylesheet ທັງໝົດ
- `src/data/districts.js`: ຖານຂໍ້ມູນເມືອງ 18 ແຂວງທົ່ວລາວ
- `src/data/stations.js`: ສະຖານີວັດແທກລະດັບນ້ຳຂອງ
- `src/data/emergencyContacts.js`: ເບີໂທສຸກເສີນ ແລະ ໜ່ວຍກູ້ໄພທົ່ວປະເທດ
- `src/components/EmergencyModal.jsx`: ໜ້າຕ່າງເບີໂທສຸກເສີນ ແລະ ກູ້ໄພ
- `src/components/LocationModal.jsx`: ໜ້າຕ່າງເລືອກເມືອງ/ແຂວງ
- `src/components/RiverModal.jsx`: ໜ້າຕ່າງລະດັບນ້ຳຂອງ
- `src/components/InstallModal.jsx`: ໜ້າຕ່າງແນະນຳຕິດຕັ້ງແອັບ
- `src/components/ShareModal.jsx`: ໜ້າຕ່າງແບ່ງປັນເຫດການ
- `src/components/ReportModal.jsx`: ໜ້າຕ່າງຟອມລາຍງານເຫດ

## ຟັງຊັນທີ່ສຳເລັດແລ້ວ:
1. ໝຸດ 4 ປະເພດ: 🚨 SOS, ⚠️ ແຈ້ງເຕືອນ, 🏠 ສູນພັກເຊົາ, 📦 ຈຸດບໍລິຈາກ
2. ລະບົບຖານຂໍ້ມູນ Real-time ຜ່ານ Supabase
3. ປຸ່ມດຶງ GPS ຕຳແໜ່ງປັດຈຸບັນ
4. ລະບົບແນບຮູບພາບສະພາບຕົວຈິງ (Supabase Storage)
5. ປຸ່ມແຊຣ໌ເຂົ້າ WhatsApp, Facebook/Messenger, Copy Link
6. ເລືອກ ແລະ ຄົ້ນຫາ 18 ແຂວງ ແລະ ເມືອງທົ່ວລາວ (FlyTo Zoom)
7. ສະຫຼັບແຜນທີ່ດາວທຽມ Esri Satellite
8. ເຣດາຝົນ Real-time (RainViewer) & ເກນລະດັບນ້ຳຂອງ
9. ລະບົບໝຸດໝົດອາຍຸ: ໂມງນັບຖອຍຫຼັງ 1 ຊົ່ວໂມງຫຼັງຊ່ວຍແລ້ວ & ປ້າຍດ່ວນ 24 ຊົ່ວໂມງ
10. ຮອງຮັບ PWA (Add to Home Screen)
11. ປຸ່ມນຳທາງ Google Maps ເທິງໝຸດ ເປີດເສັ້ນທາງຫາພິກັດຈຸດເກີດເຫດທັນທີ
12. ປຸ່ມເບີສຸກເສີນ ແລະ ໜ່ວຍກູ້ໄພທົ່ວປະເທດ 18 ແຂວງ (One-touch call)
