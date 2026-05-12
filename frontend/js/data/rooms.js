// Tự động sinh ra danh sách phòng trọ mẫu đa dạng
const initialRooms = [];
const categories = ["Trọ", "Căn hộ", "Chung cư"];
const locations = ["Cầu Giấy, HN", "Đống Đa, HN", "Thanh Xuân, HN", "Hai Bà Trưng, HN", "Quận 10, TP.HCM", "Bình Thạnh, TP.HCM"];
const features = ["Mới Xây ✨", "Full Đồ Cực Đẹp", "Ban Công Thoáng", "Giờ Giấc Tự Do", "Khép Kín", "Sạch Sẽ Gần Chợ", "Có Thang Máy"];
const images = [
    "images/room1.jpg",
    "images/room2.jpg",
    "images/room3.jpg",
    "images/room4.jpg",
    "images/room5.jpg",
    "images/room6.jpg",
    "images/room7.jpg",
    "images/room8.jpg",
    "images/room9.jpg",
    "images/room10.jpg",
    "images/room11.jpg",
    "images/room12.jpg",
    "images/room13.jpg",
    "images/room14.jpg",
    "images/room15.jpg"
];

for (let i = 1; i <= 40; i++) {
    let cat = categories[Math.floor(Math.random() * categories.length)];
    let loc = locations[Math.floor(Math.random() * locations.length)];
    let feat = features[Math.floor(Math.random() * features.length)];
    let img = images[(i - 1) % images.length]; // Vòng lặp tuần tự qua 15 ảnh
    let price = Math.floor(Math.random() * 40 + 15) * 100000; // Random giá từ 1.5tr đến 5.4tr

    initialRooms.push({
        id: i,
        category: cat,
        title: `${cat} ${feat} Tai Khu Vuc ${loc.split(',')[0]}`,
        price: price,
        district: loc,
        image: img
    });
}

function seedRoomsIfNeeded() {
    let savedData = getStorage(STORAGE_KEYS.ROOMS_DATA, []);
    if (!savedData || savedData.length === 0) {
        setStorage(STORAGE_KEYS.ROOMS_DATA, initialRooms);
    } else {
        // Migration: Update old external images to use local uploaded images
        let needsUpdate = false;
        savedData = savedData.map((room, index) => {
            if (room.image && (room.image.includes("unsplash.com") || room.image.includes("picsum.photos"))) {
                room.image = images[index % images.length];
                needsUpdate = true;
            }
            return room;
        });
        if (needsUpdate) {
            setStorage(STORAGE_KEYS.ROOMS_DATA, savedData);
        }
    }
}

// Export ra window để gọi ở nơi khác (mặc dù function thông thường đã ở global scope, nhưng cẩn thận vẫn tốt)
window.seedRoomsIfNeeded = seedRoomsIfNeeded;
