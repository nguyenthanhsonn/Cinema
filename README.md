
# CINEPRO - Nền Tảng Đặt Vé Xem Phim Trực Tuyến

CINEPRO là một ứng dụng web hiện đại giúp người dùng dễ dàng theo dõi lịch chiếu, khám phá các bộ phim bom tấn mới nhất và thực hiện đặt vé xem phim trực tuyến một cách nhanh chóng, tiện lợi. Dự án sở hữu giao diện tối (Dark Mode) rực rỡ, tối ưu trải nghiệm điện ảnh cho người dùng.

---

## 📸 Giao diện dự án (Screenshots)

![alt text](image.png)
*Giao diện trang chủ với Slider Banner hiển thị phim hot*

---

### 🖥️ Giao diện người dùng (Frontend)
*   **Hero Slider thông minh:** Banner trang chủ hiển thị các bộ phim đang chiếu nổi bật kèm hiệu ứng mượt mà, tích hợp bộ điều khiển Play/Pause/Next/Prev và hiển thị nhanh thông tin phim (Thời lượng, Điểm đánh giá, Ngày khởi chiếu).
*   **Hệ thống phân loại phim trực quan:** Gắn nhãn phân loại phim rõ ràng (ví dụ: `ĐANG CHIẾU`, nhãn giới hạn độ tuổi `T16`).
*   **Trải nghiệm người dùng mượt mà:** 
    *   Nút bấm **MUA VÉ NGAY** nổi bật thúc đẩy hành động (Call-to-Action).
    *   Xem trailer trực tiếp thông qua cửa sổ Modal (`XEM TRAILER`).
    *   Tích hợp Live Chat hỗ trợ nhanh cho khách hàng (nút chat góc phải dưới màn hình).
*   **Responsive Design:** Tối ưu hóa giao diện hiển thị đẹp mắt trên cả Máy tính, Máy tính bảng và Điện thoại di động.

### ⚙️ Tính năng hệ thống (System Features)
*   **Hệ thống xác thực (Authentication):** Đăng nhập và quản lý tài khoản thành viên để tích điểm, xem lịch sử đặt vé.
*   **Điều hướng thông minh:** Thanh điều hướng (Navbar) tinh gọn bao gồm Trang chủ, Phim, Lịch chiếu giúp người dùng tìm kiếm thông tin mong muốn chỉ với 1 cú click.


---

# 🛠️ Tech Stack

## Backend

* NestJS
* Node.js
* TypeScript

## Database

* PostgreSQL
* TypeORM

## Authentication & Security

* JWT Authentication
* Google OAuth2 Login
* Role-Based Access Control (RBAC)

## Payment

* PayOS Integration

## Email & Notification

* Nodemailer
* QRCode Generator

## Media & Storage

* Cloudinary

## Deployment

* Docker
* VPS Deployment

---

# 🏗️ Kiến Trúc & Các Tính Năng Chính (Architecture & Main Features)

## 🌟 Các Tính Năng Đã Hoàn Thành (Completed Features)

### 👤 Xác Thực & Phân Quyền (Authentication & Authorization)
* **Đăng ký & Đăng nhập:** Hệ thống đăng ký, đăng nhập bảo mật với JWT (JSON Web Token), tích hợp cơ chế Refresh Token để duy trì trạng thái đăng nhập tối ưu.
* **Đăng nhập bên thứ ba:** Hỗ trợ đăng nhập nhanh chóng bằng tài khoản Google OAuth2.
* **Phân quyền người dùng (Role-Based Access Control - RBAC):** Bảo mật hệ thống API phân cấp dựa trên vai trò:
  * `ADMIN`: Quản trị viên quản lý toàn bộ hệ thống (Quản lý Phim, Lịch chiếu, Rạp chiếu, Thống kê Doanh thu...).
  * `STAFF`: Nhân viên tại quầy check-in, kiểm tra và xác nhận vé xem phim thông qua việc quét mã QR.
  * `USER`: Khách hàng xem thông tin phim, đặt vé trực tuyến, thanh toán qua cổng và quản lý lịch sử đặt vé cá nhân.

---

### 🎥 Quản Lý Phim (Movie Management)
* **Quản lý thông tin phim:** CRUD đầy đủ danh sách phim (Thêm, xem, cập nhật, xóa phim).
* **Tải lên phương tiện:** Hỗ trợ tải lên ảnh Poster và Trailer của phim trực tiếp lên Cloudinary.
* **API chi tiết phim:** Hiển thị chi tiết về bộ phim bao gồm thể loại, thời lượng, đạo diễn, dàn diễn viên và nhãn giới hạn độ tuổi (`T16`, `T18`...).
* **Lịch phim hàng tuần:** API phân phối phim theo lịch chiếu của từng tuần tiện lợi.

---

### 🕒 Quản Lý Lịch Chiếu (Showtime Management)
* **Tạo lịch chiếu thủ công:** Quản trị viên dễ dàng thiết lập lịch chiếu cho từng phòng chiếu vào các khung giờ tùy ý.
* **Tự động tạo lịch chiếu:** Thuật toán thông minh tự động lên lịch chiếu theo tuần nhằm tối ưu hóa thời gian trống và công suất phòng.
* **Lịch chiếu nháp (Draft):** Hỗ trợ tạo lịch chiếu ở trạng thái Nháp (Draft) cho phép chỉnh sửa và tối ưu hóa trước khi công khai.
* **Công bố lịch chiếu:** Xuất bản các lịch chiếu nháp để hiển thị công khai tới người dùng.
* **API lịch chiếu tuần:** Cung cấp thông tin lịch chiếu chính xác nhất theo từng tuần cho người dùng đầu cuối.

---

### 🪑 Quản Lý Ghế Ngồi (Seat Management)
* **Tự động tạo sơ đồ ghế:** Tự động tạo hệ thống ghế ngồi dựa trên số lượng hàng, cột và sơ đồ phòng chiếu được cấu hình.
* **Phân loại loại ghế ngồi đa dạng:** Hỗ trợ các hạng ghế khác nhau bao gồm `VIP` (Ghế VIP), `STANDARD` (Ghế thường), `COUPLE` (Ghế đôi) với mức giá tương ứng.
* **Giữ ghế tạm thời (Seat Locking System):** Hệ thống khóa ghế tự động khi người dùng bắt đầu thanh toán để tránh tình trạng đặt trùng ghế.
* **Tự động giải phóng ghế:** Cơ chế tự động mở khóa ghế khi quá thời gian thanh toán (timeout) mà giao dịch chưa được hoàn tất.

---

### 🎟️ Hệ Thống Đặt Vé (Booking System)
* **Đặt vé thông minh:** Hỗ trợ chọn phim, suất chiếu, ghế ngồi và mua kèm các combo đồ ăn/nước uống (Food & Beverage).
* **Lịch sử đặt vé:** Lưu trữ và xem lại chi tiết lịch sử tất cả các giao dịch đặt vé của từng tài khoản.
* **Hủy đặt vé:** Hỗ trợ hủy đơn đặt vé và tự động hoàn trả/giải phóng các ghế đã chọn.
* **Tra cứu vé:** Tìm kiếm thông tin đơn hàng nhanh chóng dựa trên mã code đặt vé.

**Quy trình Đặt vé (Booking Flow):**
```text
Chọn suất chiếu (Showtime)
→ Giữ ghế tạm thời (Lock Seats)
→ Tạo đơn đặt vé (Trạng thái CHỜ THANH TOÁN - PENDING)
→ Tạo yêu cầu thanh toán (PayOS Payment)
→ Thanh toán thành công (Payment Success)
→ Xác nhận đơn đặt vé (Confirm Booking)
→ Tạo vé điện tử (Generate Ticket)
→ Gửi email xác nhận kèm mã QR vé
```

---

### 💳 Hệ Thống Thanh Toán (Payment System)
* **Tích hợp cổng thanh toán PayOS:** Hỗ trợ thanh toán nhanh chóng qua cổng thanh toán hiện đại PayOS.
* **Thanh toán QR / Chuyển khoản:** Người dùng có thể thanh toán qua mã QR Ngân hàng (VietQR), Internet Banking hoặc Ví điện tử.
* **Xử lý Webhook bảo mật:** Cơ chế lắng nghe webhook từ PayOS để cập nhật trạng thái đơn đặt vé ngay lập tức.
* **Xác nhận giao dịch tự động:** Đơn hàng được tự động xác nhận thành công và chuyển trạng thái ngay khi nhận được tín hiệu thanh toán hợp lệ.

**Quy trình Thanh toán (Payment Flow):**
```text
Tạo đơn đặt vé
→ Tạo link thanh toán PayOS
→ Người dùng quét mã QR thanh toán
→ Nhận Webhook từ PayOS báo thành công
→ Đơn đặt vé cập nhật ĐÃ THANH TOÁN (Booking PAID)
→ Trạng thái ghế chuyển sang ĐÃ BÁN (Seats SOLD)
```

---

### 📧 Vé Điện Tử & Check-in (E-Ticket & Verification)
* **Khởi tạo vé tự động:** Vé xem phim điện tử được tự động tạo ngay sau khi thanh toán thành công.
* **Tạo mã QR xác thực:** Mỗi vé chứa một mã QR Code độc nhất mã hóa thông tin vé để bảo mật và chống làm giả.
* **Gửi email vé điện tử:** Tự động gửi thông tin vé chi tiết kèm hình ảnh QR Code tới email người dùng qua Nodemailer.
* **Check-in nhanh tại quầy:** Nhân viên có thể quét mã QR trên vé để xác thực và cập nhật trạng thái check-in của vé tại rạp.

**Trạng thái Vé (Ticket Status):**
* `VALID` (Vé hợp lệ, chưa sử dụng)
* `USED` (Vé đã được sử dụng / check-in)
* `CANCELLED` (Vé đã bị hủy bỏ)

---

### 📊 Hệ Thống Thống Kê & Dashboard (Dashboard & Statistics)
* **Tổng quan doanh thu:** Dashboard hiển thị trực quan tổng doanh thu, số lượng vé bán ra và phần trăm tăng trưởng so với tuần trước đó.
* **Biểu đồ doanh thu 7 ngày:** Hiển thị chi tiết biến động doanh thu theo từng ngày trong tuần.
* **Cập nhật thời gian thực:** Dữ liệu thống kê được cập nhật liên tục hỗ trợ Admin quản lý tình hình kinh doanh hiệu quả.

---

# 🗂️ Folder Structure

```bash
src/
│
├── auth/           # Authentication & Authorization
├── booking/        # Booking management
├── cinema/         # Cinema management
├── common/         # Shared utilities, constants, helpers
├── config/         # App & environment configuration
├── dashboard/      # Dashboard & statistics
├── mail/           # Email service & templates
├── migrations/     # Database migrations
├── movie/          # Movie management
├── notification/   # Notifications system
├── payment/        # PayOS payment integration
├── product/        # Products / combos / food
├── seeds/          # Seed data
├── showtime/       # Showtime & seat logic
├── ticket/         # Ticket & QR verification
├── user/           # User management
│
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

---

# 🚀 Getting Started

## Install dependencies

```bash
npm install
```

# 👨‍💻 Contributors

* Nguyễn Sơn
* CINEPRO Development Team


