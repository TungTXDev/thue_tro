// API địa giới hành chính Việt Nam
const ADDRESS_API_URL = 'https://provinces.open-api.vn/api';

let provincesData = [];
let districtsData = [];
let wardsData = [];

// Load danh sách tỉnh/thành
async function loadProvinces() {
    try {
        const response = await fetch(`${ADDRESS_API_URL}/p/`);
        provincesData = await response.json();

        const provinceSelect = document.getElementById('roomProvince');
        if (provinceSelect) {
            provinceSelect.innerHTML = '<option value="">Chọn tỉnh/thành</option>';
            provincesData.forEach(province => {
                const option = document.createElement('option');
                option.value = province.code;
                option.textContent = province.name;
                option.dataset.name = province.name;
                provinceSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Lỗi load tỉnh/thành:', error);
    }
}

// Load danh sách quận/huyện theo tỉnh
async function loadDistricts() {
    const provinceSelect = document.getElementById('roomProvince');
    const districtSelect = document.getElementById('roomDistrict');
    const wardSelect = document.getElementById('roomWard');

    if (!provinceSelect || !districtSelect) return;

    const provinceCode = provinceSelect.value;

    // Reset quận/huyện và phường/xã
    districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
    districtsData = [];
    wardsData = [];

    if (!provinceCode) return;

    try {
        const response = await fetch(`${ADDRESS_API_URL}/p/${provinceCode}?depth=2`);
        const data = await response.json();
        districtsData = data.districts || [];

        districtsData.forEach(district => {
            const option = document.createElement('option');
            option.value = district.code;
            option.textContent = district.name;
            option.dataset.name = district.name;
            districtSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi load quận/huyện:', error);
    }
}

// Load danh sách phường/xã theo quận/huyện
async function loadWards() {
    const districtSelect = document.getElementById('roomDistrict');
    const wardSelect = document.getElementById('roomWard');

    if (!districtSelect || !wardSelect) return;

    const districtCode = districtSelect.value;

    // Reset phường/xã
    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
    wardsData = [];

    if (!districtCode) return;

    try {
        const response = await fetch(`${ADDRESS_API_URL}/d/${districtCode}?depth=2`);
        const data = await response.json();
        wardsData = data.wards || [];

        wardsData.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward.code;
            option.textContent = ward.name;
            option.dataset.name = ward.name;
            wardSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi load phường/xã:', error);
    }
}

// Lấy địa chỉ đầy đủ dạng string
function getFullAddress() {
    const provinceSelect = document.getElementById('roomProvince');
    const districtSelect = document.getElementById('roomDistrict');
    const wardSelect = document.getElementById('roomWard');

    if (!provinceSelect || !districtSelect || !wardSelect) return '';

    const provinceName = provinceSelect.options[provinceSelect.selectedIndex]?.dataset.name || '';
    const districtName = districtSelect.options[districtSelect.selectedIndex]?.dataset.name || '';
    const wardName = wardSelect.options[wardSelect.selectedIndex]?.dataset.name || '';

    const parts = [wardName, districtName, provinceName].filter(p => p);
    return parts.join(', ');
}

// Format số tiền
function formatPriceInput(input) {
    // Chỉ cho phép nhập số
    let value = input.value.replace(/[^\d]/g, '');

    // Lưu giá trị số thuần
    input.dataset.rawValue = value;

    // Format hiển thị
    if (value) {
        const formatted = new Intl.NumberFormat('vi-VN').format(value);
        input.value = formatted;

        // Hiển thị bằng chữ
        const priceDisplay = document.getElementById('priceDisplay');
        if (priceDisplay) {
            priceDisplay.textContent = formatVND(parseInt(value)) + '/tháng';
        }
    } else {
        input.value = '';
        const priceDisplay = document.getElementById('priceDisplay');
        if (priceDisplay) {
            priceDisplay.textContent = '';
        }
    }
}

// Lấy giá trị số thuần từ input đã format
function getRawPrice() {
    const priceInput = document.getElementById('roomPrice');
    return priceInput?.dataset.rawValue || priceInput?.value.replace(/[^\d]/g, '') || '';
}

// Export functions
window.loadProvinces = loadProvinces;
window.loadDistricts = loadDistricts;
window.loadWards = loadWards;
window.getFullAddress = getFullAddress;
window.formatPriceInput = formatPriceInput;
window.getRawPrice = getRawPrice;


// Parse địa chỉ từ string để edit
async function parseAndSetAddress(addressString) {
    if (!addressString) return;

    // Split address: "Phường X, Quận Y, TP.HCM"
    const parts = addressString.split(',').map(s => s.trim());

    if (parts.length < 2) {
        // Fallback: nếu chỉ có 1 phần, set vào district
        document.getElementById('roomDistrict').innerHTML = `<option value="${addressString}" selected>${addressString}</option>`;
        return;
    }

    // Load provinces first
    await loadProvinces();

    // Find and select province (last part)
    const provinceName = parts[parts.length - 1];
    const provinceSelect = document.getElementById('roomProvince');

    for (let option of provinceSelect.options) {
        if (option.dataset.name && option.dataset.name.includes(provinceName)) {
            provinceSelect.value = option.value;
            break;
        }
    }

    // Load districts for selected province
    await loadDistricts();

    // Find and select district (middle part)
    if (parts.length >= 2) {
        const districtName = parts[parts.length - 2];
        const districtSelect = document.getElementById('roomDistrict');

        for (let option of districtSelect.options) {
            if (option.dataset.name && option.dataset.name.includes(districtName)) {
                districtSelect.value = option.value;
                break;
            }
        }

        // Load wards for selected district
        await loadWards();

        // Find and select ward (first part)
        if (parts.length >= 3) {
            const wardName = parts[0];
            const wardSelect = document.getElementById('roomWard');

            for (let option of wardSelect.options) {
                if (option.dataset.name && option.dataset.name.includes(wardName)) {
                    wardSelect.value = option.value;
                    break;
                }
            }
        }
    }
}

// Set price with formatting
function setPriceValue(price) {
    const priceInput = document.getElementById('roomPrice');
    if (priceInput && price) {
        priceInput.value = price.toString();
        formatPriceInput(priceInput);
    }
}

// Export new functions
window.parseAndSetAddress = parseAndSetAddress;
window.setPriceValue = setPriceValue;
