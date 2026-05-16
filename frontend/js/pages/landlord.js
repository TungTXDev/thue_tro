const landlordUser = getStorage(STORAGE_KEYS.CURRENT_USER);
const authToken = localStorage.getItem('authToken');

// Kiểm tra cả user và token
if (!landlordUser || !authToken) {
    alert("Vui lòng đăng nhập để truy cập trang Chủ trọ.");
    window.location.href = "index.html";
}

const landlordRole = typeof getUserRole === "function" ? getUserRole(landlordUser) : (landlordUser && landlordUser.role);

if (landlordRole !== "landlord" && landlordRole !== "admin") {
    alert("Bạn không có quyền truy cập màn Chủ trọ.");
    window.location.href = "index.html";
}

let currentEditingRoomId = null;
let roomModalInstance = null;
let selectedFiles = [];

async function loadLandlordData() {
    if (!landlordUser) return;
    let rooms = [];
    let orders = [];

    try {
        const response = await roomApi.getAllRooms({ ownerId: landlordUser._id });
        rooms = response.data.rooms || [];
    } catch (error) {
        console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
        rooms = getStorage(STORAGE_KEYS.ROOMS_DATA, []);
    }

    orders = getStorage(STORAGE_KEYS.ALL_ORDERS, []);

    const myRooms = rooms;
    const myRoomNames = new Set(myRooms.map(room => room.title));
    const myOrders = orders.filter(order => myRoomNames.has(order.roomName)).slice(0, 10);

    const totalRooms = document.getElementById('landlord-total-rooms');
    const availableRooms = document.getElementById('landlord-available-rooms');
    const totalOrders = document.getElementById('landlord-total-orders');
    const userName = document.getElementById('dashboard-user-name');

    if (totalRooms) totalRooms.innerText = myRooms.length;
    if (availableRooms) availableRooms.innerText = myRooms.filter(r => r.status === 'available').length;
    if (totalOrders) totalOrders.innerText = myOrders.length;
    if (userName) userName.innerText = landlordUser.name || 'Chủ trọ';

    renderLandlordRooms(myRooms);
    renderLandlordOrders(myOrders);
    await loadRentalHistory();
}

function renderLandlordRooms(rooms) {
    const roomList = document.getElementById('landlord-room-list');
    if (!roomList) return;

    if (!rooms.length) {
        roomList.innerHTML = '<p class="text-muted">Chưa có phòng nào để quản lý.</p>';
        return;
    }

    roomList.innerHTML = rooms.map(room => {
        const mainImage = room.images && room.images.length > 0 ? room.images[0] : room.image;
        const imageCount = room.images ? room.images.length : (room.image ? 1 : 0);
        const hasTenant = room.tenant && room.tenant.name;
        const statusBadge = room.status === 'available' ? 'text-bg-success' :
            room.status === 'rented' ? 'text-bg-warning' : 'text-bg-secondary';
        const statusText = room.status === 'available' ? 'Đang hiển thị' :
            room.status === 'rented' ? 'Đã cho thuê' : 'Đã ẩn';

        return `
        <article class="landlord-room-card">
            <div class="room-image-wrapper">
                <img src="${escapeHTML(mainImage)}" alt="${escapeHTML(room.title)}">
                ${imageCount > 1 ? `<span class="image-count-badge"><i class="bi bi-images"></i> ${imageCount}</span>` : ''}
            </div>
            <div class="room-card-body">
                <h3>${escapeHTML(room.title)}</h3>
                <p class="room-category"><i class="bi bi-tag"></i> ${escapeHTML(room.category)}</p>
                <p class="room-location"><i class="bi bi-geo-alt"></i> ${escapeHTML(room.district)}</p>
                <p class="room-price">${formatVND(room.price)}/tháng</p>
                <span class="badge ${statusBadge}">
                    ${statusText}
                </span>
                ${hasTenant ? `
                <div class="tenant-info mt-2">
                    <div class="tenant-badge">
                        <i class="bi bi-person-check-fill"></i> Người thuê: ${escapeHTML(room.tenant.name)}
                    </div>
                    <small class="text-muted d-block">
                        <i class="bi bi-envelope"></i> ${escapeHTML(room.tenant.email)}<br>
                        <i class="bi bi-telephone"></i> ${escapeHTML(room.tenant.phone)}
                    </small>
                </div>
                ` : ''}
                <div class="room-actions">
                    ${!hasTenant ? `
                    <button class="btn btn-sm btn-success" onclick="openAddTenantModal('${room._id}')">
                        <i class="bi bi-person-plus"></i> Thêm người thuê
                    </button>
                    ` : `
                    <button class="btn btn-sm btn-warning" onclick="removeTenantConfirm('${room._id}')">
                        <i class="bi bi-person-dash"></i> Trả phòng
                    </button>
                    `}
                    <button class="btn btn-sm btn-outline-primary" onclick="openEditRoomModal('${room._id}')">
                        <i class="bi bi-pencil"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteRoomConfirm('${room._id}')">
                        <i class="bi bi-trash"></i> Xóa
                    </button>
                </div>
            </div>
        </article>
    `;
    }).join('');
}

function renderLandlordOrders(orders) {
    const tableBody = document.getElementById('landlord-order-table-body');
    if (!tableBody) return;

    if (!orders.length) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-muted">Chưa có đơn đặt phòng liên quan.</td></tr>';
        return;
    }

    tableBody.innerHTML = orders.map(order => `
        <tr>
            <td>${escapeHTML(order.date || 'N/A')}</td>
            <td><strong>${escapeHTML(order.userName || 'N/A')}</strong></td>
            <td>${escapeHTML(order.roomName || 'N/A')}</td>
            <td class="order-price">${formatVND(order.pricePaid || 0)}</td>
            <td><span class="badge text-bg-success">Thành công</span></td>
        </tr>
    `).join('');
}

function openCreateRoomModal() {
    currentEditingRoomId = null;
    selectedFiles = [];
    document.getElementById('roomModalLabel').textContent = 'Thêm phòng mới';
    document.getElementById('roomForm').reset();

    // Load provinces when opening modal
    loadProvinces();

    // Render initial add button
    renderImagePreviews();

    if (!roomModalInstance) {
        roomModalInstance = new bootstrap.Modal(document.getElementById('roomModal'));
    }
    roomModalInstance.show();
}

async function openEditRoomModal(roomId) {
    currentEditingRoomId = roomId;
    selectedFiles = [];
    document.getElementById('roomModalLabel').textContent = 'Chỉnh sửa phòng';

    try {
        const response = await roomApi.getRoomById(roomId);
        const room = response.data.room;

        document.getElementById('roomTitle').value = room.title || '';
        document.getElementById('roomCategory').value = room.category || '';

        // Set price with formatting
        setPriceValue(room.price);

        // Parse and set address
        await parseAndSetAddress(room.district);

        document.getElementById('roomDescription').value = room.description || '';

        // Set amenities checkboxes
        const amenitiesCheckboxes = document.querySelectorAll('input[name="amenities"]');
        amenitiesCheckboxes.forEach(checkbox => {
            checkbox.checked = room.amenities && room.amenities.includes(checkbox.value);
        });

        // Show current images in grid
        const grid = document.getElementById('imageUploadGrid');
        if (grid) {
            grid.innerHTML = '';

            if (room.images && room.images.length > 0) {
                room.images.forEach((img, idx) => {
                    const slotDiv = document.createElement('div');
                    slotDiv.className = 'image-upload-slot filled';
                    slotDiv.innerHTML = `
                        <img src="${img}" alt="Image ${idx + 1}">
                        <span class="image-number">${idx + 1}</span>
                        <span class="image-label">Ảnh hiện tại</span>
                    `;
                    grid.appendChild(slotDiv);
                });
            } else if (room.image) {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'image-upload-slot filled';
                slotDiv.innerHTML = `
                    <img src="${room.image}" alt="Current image">
                    <span class="image-number">1</span>
                    <span class="image-label">Ảnh hiện tại</span>
                `;
                grid.appendChild(slotDiv);
            }

            // Add button to upload new images
            const addSlot = document.createElement('div');
            addSlot.className = 'image-upload-slot';
            addSlot.onclick = () => document.getElementById('roomImages').click();
            addSlot.innerHTML = `
                <i class="bi bi-plus-lg"></i>
                <span>Thêm ảnh mới</span>
            `;
            grid.appendChild(addSlot);
        }

        if (!roomModalInstance) {
            roomModalInstance = new bootstrap.Modal(document.getElementById('roomModal'));
        }
        roomModalInstance.show();
    } catch (error) {
        alert('Không thể tải thông tin phòng: ' + error.message);
    }
}

function handleImageSelect(event) {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // Merge with existing files
    const totalFiles = selectedFiles.length + files.length;

    if (totalFiles > 5) {
        alert('Chỉ được chọn tối đa 5 ảnh');
        event.target.value = '';
        return;
    }

    // Kiểm tra dung lượng từng file (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = [];

    for (let file of files) {
        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            invalidFiles.push(`${file.name} (${sizeMB}MB)`);
        }
    }

    if (invalidFiles.length > 0) {
        alert(`Các file sau vượt quá dung lượng 5MB:\n\n${invalidFiles.join('\n')}\n\nVui lòng chọn ảnh có dung lượng nhỏ hơn.`);
        event.target.value = '';
        return;
    }

    // Kiểm tra định dạng file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidTypes = [];

    for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
            invalidTypes.push(file.name);
        }
    }

    if (invalidTypes.length > 0) {
        alert(`Các file sau không đúng định dạng (chỉ chấp nhận JPG, PNG, WebP):\n\n${invalidTypes.join('\n')}`);
        event.target.value = '';
        return;
    }

    selectedFiles = [...selectedFiles, ...files];
    renderImagePreviews();
    event.target.value = ''; // Reset input để có thể chọn lại
}

function renderImagePreviews() {
    const grid = document.getElementById('imageUploadGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Render existing images
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'image-upload-slot filled';

            // Calculate file size
            const fileSizeKB = (file.size / 1024).toFixed(1);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const sizeDisplay = file.size > 1024 * 1024 ? `${fileSizeMB}MB` : `${fileSizeKB}KB`;

            // Determine badge class based on size
            let badgeClass = '';
            if (file.size > 5 * 1024 * 1024) {
                badgeClass = 'error';
            } else if (file.size > 3 * 1024 * 1024) {
                badgeClass = 'warning';
            }

            slotDiv.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}">
                <button type="button" class="remove-image-btn" onclick="removeImage(${index})">
                    <i class="bi bi-x-circle-fill"></i>
                </button>
                <span class="image-number">${index + 1}</span>
                <span class="file-size-badge ${badgeClass}">${sizeDisplay}</span>
            `;
            grid.appendChild(slotDiv);
        };
        reader.readAsDataURL(file);
    });

    // Always show add button if less than 5 images
    if (selectedFiles.length < 5) {
        const addSlot = document.createElement('div');
        addSlot.className = 'image-upload-slot';
        addSlot.onclick = () => document.getElementById('roomImages').click();
        addSlot.innerHTML = `
            <i class="bi bi-plus-lg"></i>
            <span>Thêm ảnh</span>
        `;
        grid.appendChild(addSlot);
    }
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    renderImagePreviews();
}

async function handleRoomSubmit(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;

    try {
        // Validate required fields
        const title = document.getElementById('roomTitle').value.trim();
        const category = document.getElementById('roomCategory').value;
        const rawPrice = getRawPrice();
        const fullAddress = getFullAddress();

        if (!title || !category || !rawPrice || !fullAddress) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề, Loại phòng, Giá thuê, Địa chỉ)');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('price', rawPrice);
        formData.append('district', fullAddress);
        formData.append('description', document.getElementById('roomDescription').value.trim());

        // Get selected amenities
        const amenities = Array.from(document.querySelectorAll('input[name="amenities"]:checked'))
            .map(cb => cb.value);
        formData.append('amenities', JSON.stringify(amenities));

        // Add images from selectedFiles array
        if (selectedFiles.length > 0) {
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang upload ' + selectedFiles.length + ' ảnh lên Cloudinary...';

            // Append each file to FormData
            selectedFiles.forEach((file, index) => {
                formData.append('images', file, file.name);
                console.log(`Image ${index + 1}:`, file.name, `${(file.size / 1024).toFixed(2)}KB`);
            });
        } else {
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang lưu thông tin...';
        }

        let response;
        if (currentEditingRoomId) {
            response = await roomApi.updateRoom(currentEditingRoomId, formData);
        } else {
            response = await roomApi.createRoom(formData);
        }

        // Only show success after Cloudinary upload completes
        const successMsg = currentEditingRoomId
            ? (selectedFiles.length > 0 ? 'Cập nhật phòng và upload ảnh thành công!' : 'Cập nhật phòng thành công!')
            : (selectedFiles.length > 0 ? 'Tạo phòng và upload ảnh thành công!' : 'Tạo phòng thành công!');

        alert(response.message || successMsg);
        roomModalInstance.hide();
        selectedFiles = []; // Clear selected files
        await loadLandlordData();
    } catch (error) {
        let errorMsg = 'Lỗi: ' + error.message;

        // Specific error messages
        if (error.message.includes('File size')) {
            errorMsg = 'Lỗi: Một hoặc nhiều ảnh vượt quá dung lượng 5MB cho phép';
        } else if (error.message.includes('Invalid file type')) {
            errorMsg = 'Lỗi: Chỉ chấp nhận file ảnh định dạng JPG, PNG, WebP';
        } else if (error.message.includes('đăng nhập')) {
            errorMsg = 'Vui lòng đăng nhập lại để tiếp tục';
        }

        alert(errorMsg);
        console.error('Submit error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteRoomConfirm(roomId) {
    if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;

    try {
        await roomApi.deleteRoom(roomId);
        alert('Xóa phòng thành công!');
        await loadLandlordData();
    } catch (error) {
        alert('Lỗi khi xóa phòng: ' + error.message);
    }
}

document.addEventListener("DOMContentLoaded", loadLandlordData);


// ==================== TENANT MANAGEMENT ====================

function openAddTenantModal(roomId) {
    const modalHTML = `
        <div class="modal fade" id="tenantModal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-person-plus-fill"></i> Thêm người thuê phòng
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="tenantForm" onsubmit="handleAddTenant(event, '${roomId}')">
                        <div class="modal-body">
                            <!-- Search User -->
                            <div class="mb-3">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-search"></i> Tìm kiếm người thuê
                                </label>
                                <p class="text-muted small mb-2">Nhập email để tìm kiếm thông tin trong hệ thống</p>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                                    <input type="email" class="form-control" id="tenantEmail" 
                                           placeholder="example@gmail.com" required>
                                    <button type="button" class="btn btn-success" onclick="searchUserByEmail()">
                                        <i class="bi bi-search"></i> Tìm
                                    </button>
                                </div>
                            </div>

                            <!-- User Info (Hidden by default) -->
                            <div id="userInfoSection" style="display: none;">
                                <div class="alert alert-success d-flex align-items-center mb-3">
                                    <i class="bi bi-check-circle-fill me-2"></i>
                                    <span>Đã tìm thấy thông tin người dùng</span>
                                </div>

                                <div class="row g-3 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">
                                            <i class="bi bi-person"></i> Họ và tên
                                        </label>
                                        <input type="text" class="form-control" id="tenantName" readonly>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">
                                            <i class="bi bi-telephone"></i> Số điện thoại
                                        </label>
                                        <input type="tel" class="form-control" id="tenantPhone" readonly>
                                    </div>
                                </div>

                                <hr class="my-3">

                                <h6 class="fw-bold mb-3">
                                    <i class="bi bi-calendar-range"></i> Thời gian thuê
                                </h6>
                                <div class="row g-3 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Ngày bắt đầu <span class="text-danger">*</span></label>
                                        <input type="date" class="form-control" id="tenantStartDate" 
                                               value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Ngày kết thúc <span class="text-muted">(Tùy chọn)</span></label>
                                        <input type="date" class="form-control" id="tenantEndDate">
                                    </div>
                                </div>

                                <div class="alert alert-info d-flex align-items-start">
                                    <i class="bi bi-info-circle-fill me-2 mt-1"></i>
                                    <small>
                                        Sau khi thêm người thuê, phòng sẽ tự động chuyển sang trạng thái 
                                        <strong>"Đã cho thuê"</strong> và ẩn khỏi danh sách tìm kiếm.
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="bi bi-x-circle"></i> Hủy
                            </button>
                            <button type="submit" class="btn btn-success" id="submitTenantBtn" disabled>
                                <i class="bi bi-check-circle-fill"></i> Xác nhận
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('tenantModal');
    if (existingModal) existingModal.remove();

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('tenantModal'));
    modal.show();
}

async function handleAddTenant(event, roomId) {
    event.preventDefault();

    const name = document.getElementById('tenantName').value;
    const email = document.getElementById('tenantEmail').value;
    const userId = document.getElementById('tenantEmail').dataset.userId;
    const phone = document.getElementById('tenantPhone').value;
    const startDate = document.getElementById('tenantStartDate').value;
    const endDate = document.getElementById('tenantEndDate').value;

    try {
        const body = {
            name,
            email,
            phone,
            startDate,
            endDate: endDate || null
        };

        // Add userId if available
        if (userId) {
            body.userId = userId;
        }

        const response = await fetchAPI(`/rooms/${roomId}/tenant`, {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (response.success) {
            showToast('Đã thêm người thuê thành công!', 'success');

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('tenantModal'));
            modal.hide();

            // Reload data
            await loadLandlordData();
        }
    } catch (error) {
        console.error('Add tenant error:', error);
        showToast(error.message || 'Có lỗi xảy ra khi thêm người thuê', 'error');
    }
}

function removeTenantConfirm(roomId) {
    if (confirm('Bạn có chắc muốn trả phòng này? Phòng sẽ chuyển về trạng thái "Đang hiển thị" và có thể cho thuê lại.')) {
        removeTenant(roomId);
    }
}

async function removeTenant(roomId) {
    try {
        const response = await fetchAPI(`/rooms/${roomId}/tenant`, {
            method: 'DELETE'
        });

        if (response.success) {
            showToast('Đã trả phòng thành công!', 'success');
            await loadLandlordData();
        }
    } catch (error) {
        console.error('Remove tenant error:', error);
        showToast(error.message || 'Có lỗi xảy ra khi trả phòng', 'error');
    }
}

// Make functions global
window.openAddTenantModal = openAddTenantModal;
window.handleAddTenant = handleAddTenant;
window.removeTenantConfirm = removeTenantConfirm;
window.searchUserByEmail = searchUserByEmail;

async function searchUserByEmail() {
    const emailInput = document.getElementById('tenantEmail');
    const email = emailInput.value.trim();

    if (!email) {
        showToast('Vui lòng nhập email', 'error');
        return;
    }

    try {
        const response = await fetchAPI(`/users/search/email?email=${encodeURIComponent(email)}`, {
            method: 'GET'
        });

        if (response.success && response.data.user) {
            const user = response.data.user;

            // Store userId for later use
            document.getElementById('tenantEmail').dataset.userId = user._id;

            // Fill in user info
            document.getElementById('tenantName').value = user.name || '';
            document.getElementById('tenantPhone').value = user.phone || 'Chưa cập nhật';

            // Show user info section
            document.getElementById('userInfoSection').style.display = 'block';

            // Enable submit button
            document.getElementById('submitTenantBtn').disabled = false;

            showToast('Đã tìm thấy thông tin người dùng!', 'success');
        }
    } catch (error) {
        console.error('Search user error:', error);

        // Hide user info section
        document.getElementById('userInfoSection').style.display = 'none';
        document.getElementById('submitTenantBtn').disabled = true;

        showToast(error.message || 'Không tìm thấy người dùng với email này', 'error');
    }
}


// ==================== RENTAL HISTORY ====================

let allRentalHistory = [];
let currentHistoryFilter = 'all';

async function loadRentalHistory() {
    try {
        const response = await rentalHistoryApi.getRentalHistory(landlordUser._id);
        allRentalHistory = response.data.history || [];
        renderRentalHistory(allRentalHistory);
    } catch (error) {
        console.error('Load rental history error:', error);
        const tableBody = document.getElementById('rental-history-table-body');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-muted">Không thể tải lịch sử thuê phòng</td></tr>';
        }
    }
}

function filterHistory(status) {
    currentHistoryFilter = status;

    // Update button states
    document.querySelectorAll('#history .btn-group button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter and render
    let filtered = allRentalHistory;
    if (status !== 'all') {
        filtered = allRentalHistory.filter(h => h.status === status);
    }

    renderRentalHistory(filtered);
}

function renderRentalHistory(history) {
    const tableBody = document.getElementById('rental-history-table-body');
    if (!tableBody) return;

    if (!history || history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-muted">Chưa có lịch sử cho thuê phòng</td></tr>';
        return;
    }

    tableBody.innerHTML = history.map(record => {
        const startDate = new Date(record.startDate).toLocaleDateString('vi-VN');
        const endDate = record.endDate ? new Date(record.endDate).toLocaleDateString('vi-VN') : 'Không xác định';
        const actualEndDate = record.actualEndDate ? new Date(record.actualEndDate).toLocaleDateString('vi-VN') : null;

        const statusBadge = record.status === 'active'
            ? '<span class="badge bg-success">Đang thuê</span>'
            : '<span class="badge bg-secondary">Đã trả</span>';

        const displayEndDate = record.status === 'completed' && actualEndDate
            ? actualEndDate
            : endDate;

        return `
            <tr>
                <td><strong>${escapeHTML(record.roomTitle)}</strong></td>
                <td>${escapeHTML(record.tenantName)}</td>
                <td>
                    <small>
                        <i class="bi bi-envelope"></i> ${escapeHTML(record.tenantEmail)}<br>
                        <i class="bi bi-telephone"></i> ${escapeHTML(record.tenantPhone)}
                    </small>
                </td>
                <td>${startDate}</td>
                <td>${displayEndDate}</td>
                <td class="fw-bold">${formatVND(record.price)}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');
}

// Make function global
window.filterHistory = filterHistory;
