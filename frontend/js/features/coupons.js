// Coupon phía người dùng (dùng trong detail.html)
async function applyCoupon() {
    const input = document.getElementById('coupon-input').value.trim().toUpperCase();
    const msg = document.getElementById('coupon-msg');
    const modalPriceDisplay = document.getElementById('modal-price');
    
    if (!window.DetailPageState || !window.DetailPageState.currentRoom) return;
    
    const roomPrice = window.DetailPageState.currentRoom.price;

    try {
        const response = await couponApi.applyCoupon(input, roomPrice);
        const data = response.data;

        window.DetailPageState.finalPrice = data.finalPrice;
        
        modalPriceDisplay.innerHTML = `<span class="old-price">${formatVND(roomPrice)}</span> <br> ${formatVND(data.finalPrice)}`;
        
        msg.innerText = `✅ Đã áp dụng mã ${input}: Giảm ${formatVND(data.discount)}`;
        msg.className = "coupon-msg-success";
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        
        // Logic localStorage cũ
        const coupons = getStorage(STORAGE_KEYS.APP_COUPONS, []);
        const found = coupons.find(c => c.code === input);

        if (found) {
            window.DetailPageState.finalPrice = roomPrice - found.value;
            if (window.DetailPageState.finalPrice < 0) window.DetailPageState.finalPrice = 0; 

            modalPriceDisplay.innerHTML = `<span class="old-price">${formatVND(roomPrice)}</span> <br> ${formatVND(window.DetailPageState.finalPrice)}`;
            msg.innerText = `✅ Đã áp dụng mã ${found.code}: Giảm ${formatVND(found.value)}`;
            msg.className = "coupon-msg-success";
        } else {
            msg.innerText = "❌ Mã giảm giá không tồn tại hoặc đã hết hạn!";
            msg.className = "coupon-msg-error";
            
            window.DetailPageState.finalPrice = roomPrice;
            modalPriceDisplay.innerText = formatVND(window.DetailPageState.finalPrice);
        }
    }
}

// Coupon phía admin (dùng trong admin.html)
async function addCoupon() {
    const code = document.getElementById('cp-code').value.toUpperCase();
    const val = document.getElementById('cp-val').value;
    if(!code || !val) return alert("Nhập đủ thông tin Vũ ơi!");

    try {
        await couponApi.createCoupon({ code, value: parseInt(val) });
        alert("Thêm mã giảm giá trên server thành công");
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        const coupons = getStorage(STORAGE_KEYS.APP_COUPONS, []);
        coupons.push({ code, value: parseInt(val) });
        setStorage(STORAGE_KEYS.APP_COUPONS, coupons);
    }
    
    location.reload();
}

window.applyCoupon = applyCoupon;
window.addCoupon = addCoupon;
