let isRegisterMode = true; // Mặc định là đang ở form Đăng ký

function getUserRole(user) {
    if (!user) return "guest";
    if (user.role) return user.role;
    if (user.email === "Vu69@gmail.com") return "admin";
    if (user.email === "landlord@example.com") return "landlord";
    return "user";
}

function redirectByRole(user) {
    const role = getUserRole(user);
    if (role === "admin") {
        window.location.href = "admin.html";
        return;
    }
    if (role === "landlord") {
        window.location.href = "landlord.html";
    }
}

// 1. Hàm chuyển đổi qua lại giữa Đăng Ký và Đăng Nhập
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    
    // Đổi tiêu đề và mô tả
    const authTitle = document.getElementById('auth-title');
    const authDesc = document.getElementById('auth-desc');
    const nameGroup = document.getElementById('name-group');
    const roleGroup = document.getElementById('role-group');
    const authBtn = document.getElementById('auth-btn');
    const authToggleText = document.getElementById('auth-toggle-text');

    if (authTitle) authTitle.innerText = isRegisterMode ? "Đăng Ký Tài Khoản" : "Đăng Nhập";
    if (authDesc) authDesc.innerText = isRegisterMode ? "Tham gia cộng đồng để lưu lại phòng yêu thích!" : "Mừng bạn quay trở lại!";
    if (nameGroup) nameGroup.style.display = isRegisterMode ? "block" : "none";
    if (roleGroup) roleGroup.style.display = isRegisterMode ? "block" : "none";
    if (authBtn) authBtn.innerText = isRegisterMode ? "Đăng Ký Ngay" : "Đăng Nhập";
    if (authToggleText) {
        authToggleText.innerHTML = isRegisterMode
            ? 'Bạn đã có tài khoản? <a href="javascript:void(0)" onclick="toggleAuthMode()">Đăng nhập ngay</a>'
            : 'Chưa có tài khoản? <a href="javascript:void(0)" onclick="toggleAuthMode()">Đăng ký tại đây</a>';
    }
}

// 2. Thiết lập sự kiện cho form Đăng ký / Đăng nhập
function setupAuthForm() {
    const authForm = document.getElementById('auth-form');
    if (!authForm) return;

    authForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Chặn web tự tải lại
        
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-pass').value;

        if (isRegisterMode) {
            // ---> ĐANG Ở CHẾ ĐỘ ĐĂNG KÝ
            const nameInput = document.getElementById('auth-name');
            const roleInput = document.getElementById('auth-role');
            const name = (nameInput && nameInput.value) ? nameInput.value : 'Người dùng ẩn danh';
            const role = roleInput ? roleInput.value : 'user';
            
            const userData = { name: name, email: email, password: pass, role }; // API dùng 'password', localStorage cũ dùng 'pass'
            const localData = { name: name, email: email, pass: pass, role };

            try {
                const response = await authApi.register(userData);
                localStorage.setItem('authToken', response.data.token);
                setStorage(STORAGE_KEYS.CURRENT_USER, response.data.user);
                alert("Đăng ký thành công qua API! Hệ thống đã tự động đăng nhập cho bạn.");
                redirectByRole(response.data.user);
            } catch (error) {
                console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
                setStorage(STORAGE_KEYS.CURRENT_USER, localData);
                alert("Đăng ký thành công (Offline)! Hệ thống đã tự động đăng nhập cho bạn.");
                redirectByRole(localData);
            }
        } else {
            // ---> ĐANG Ở CHẾ ĐỘ ĐĂNG NHẬP
            const credentials = { email: email, password: pass };

            try {
                const response = await authApi.login(credentials);
                localStorage.setItem('authToken', response.data.token);
                setStorage(STORAGE_KEYS.CURRENT_USER, response.data.user);
                alert("Đăng nhập thành công qua API! Chào mừng trở lại.");
                redirectByRole(response.data.user);
            } catch (error) {
                console.warn("API lỗi/chưa bật, fallback sang localStorage:", error.message);
                let savedUser = getStorage(STORAGE_KEYS.CURRENT_USER);
                const demoUsers = {
                    "Vu69@gmail.com": { name: "Vũ Admin", email: "Vu69@gmail.com", pass: "admin123", role: "admin" },
                    "landlord@example.com": { name: "Minh Landlord", email: "landlord@example.com", pass: "landlord123", role: "landlord" },
                    "user@example.com": { name: "Student User", email: "user@example.com", pass: "user123", role: "user" }
                };

                if (demoUsers[email]) {
                    savedUser = demoUsers[email];
                }
                
                if (savedUser && savedUser.email === email && savedUser.pass === pass) {
                    setStorage(STORAGE_KEYS.CURRENT_USER, savedUser);
                    alert("Đăng nhập thành công (Offline)! Chào mừng trở lại.");
                    redirectByRole(savedUser);
                } else {
                    alert("Sai email hoặc mật khẩu! Vui lòng thử lại.");
                    return; // Sai thì dừng lại không cho đăng nhập
                }
            }
        }

        // Xóa trống các ô nhập sau khi thành công
        this.reset();
        
        // Gọi hàm cập nhật thanh Header
        updateHeader();
    });
}

// 3. Hàm kiểm tra và cập nhật thanh Header 
function updateHeader() {
    const savedUser = getStorage(STORAGE_KEYS.CURRENT_USER);
    const userIconsDiv = document.querySelector('.user-icons');
    const navLinks = document.querySelector('.nav-links'); 
    const authSection = document.getElementById('auth-section');

    if (!userIconsDiv || !navLinks) return; // Tránh lỗi ở trang không có header

    // 1. Xóa các nút cũ trong menu để tránh bị lặp khi load lại
    // Giữ lại các mục mặc định (Trang chủ, Tìm phòng...)
    navLinks.innerHTML = `
        <li class="nav-item"><a href="index.html" class="nav-link">Trang chủ</a></li>
        <li class="nav-item"><a href="#room-grid" class="nav-link">Tìm phòng</a></li>
        <li class="dropdown nav-item">
            <a href="javascript:void(0)" class="dropbtn nav-link">Hỗ trợ ▾</a>
            <div class="dropdown-content">
                <a href="javascript:void(0)" onclick="toggleAIChat()"><i class="bi bi-chat-dots"></i> Chat với AI</a>
                <a href="tel:0987654321"><i class="bi bi-telephone"></i> Gọi: 0987.654.321</a>
            </div>
        </li>
    `;

    if (savedUser) {
        // 2. KIỂM TRA QUYỀN ADMIN: 
        const role = getUserRole(savedUser);
        if (role === "admin") {
            navLinks.innerHTML += `<li class="nav-item"><a href="admin.html" class="admin-link nav-link"><i class="bi bi-speedometer2"></i> Admin</a></li>`;
        }
        if (role === "landlord") {
            navLinks.innerHTML += `<li class="nav-item"><a href="landlord.html" class="admin-link nav-link"><i class="bi bi-houses"></i> Chủ trọ</a></li>`;
        }

        // 3. Hiển thị lời chào và nút Đăng xuất
        userIconsDiv.innerHTML = `
            <span class="welcome-text"><i class="bi bi-person-circle"></i> Chào, ${escapeHTML(savedUser.name)}!</span>
            <a href="javascript:void(0)" onclick="logout()" class="btn btn-danger btn-sm"><i class="bi bi-box-arrow-right"></i> Đăng xuất</a>
        `;
        
        // Ẩn khung đăng ký ở cuối trang
        if(authSection) authSection.style.display = 'none';
    } else {
        // 4. Nếu chưa đăng nhập -> Hiện nút Đăng ký ban đầu
        userIconsDiv.innerHTML = `
            <a href="#auth-section" class="btn btn-primary btn-header"><i class="bi bi-person-circle"></i> Đăng ký / Đăng nhập</a>
        `;
        if(authSection) authSection.style.display = 'block';
    }
}

// 4. Hàm Đăng xuất
function logout() {
    if(confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        removeStorage(STORAGE_KEYS.CURRENT_USER); 
        localStorage.removeItem('authToken');
        if (window.location.pathname.endsWith('/admin.html') || window.location.pathname.endsWith('/landlord.html')) {
            window.location.href = "index.html";
            return;
        }
        updateHeader(); // Vẽ lại Header
    }
}

window.toggleAuthMode = toggleAuthMode;
window.logout = logout;
window.updateHeader = updateHeader;
window.getUserRole = getUserRole;
window.redirectByRole = redirectByRole;
window.setupAuthForm = setupAuthForm;
