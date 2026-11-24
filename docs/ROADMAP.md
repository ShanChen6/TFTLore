# LỘ TRÌNH TRIỂN KHAI DỰ ÁN: TFT ARCHIVE & TEAM BUILDER (MÙA 1 – 18 & ĐẾM NGƯỢC MÙA 19)

**Mục tiêu:** Xây dựng thư viện tra cứu bách khoa toàn thư (Wiki/Hoài niệm) cho trọn bộ 18 mùa giải Đấu Trường Chân Lý (TFT), tích hợp công cụ xếp đội hình (Team Builder) đa mùa và đồng hồ đếm ngược ngày ra mắt Mùa 19 (*Nhạc Hội Muôn Màu*).  
**Công nghệ lõi:** Next.js (App Router), TypeScript, Tailwind CSS, Node.js, `@dnd-kit/core`, `lz-string`.

---

## GIAI ĐOẠN 1: DATA PIPELINE, CHUẨN HÓA DỮ LIỆU & ĐẾM NGƯỢC MÙA 19 (TUẦN 1)

Mục tiêu của tuần đầu tiên là làm chủ dữ liệu tĩnh của 18 mùa giải và dựng khung dự án cơ bản.

- [ ] **Khởi tạo dự án & Cấu trúc thư mục:**
  - Cài đặt Next.js (TypeScript + Tailwind CSS + ESLint).
  - Thiết lập cấu trúc thư mục: `/data/sets` (chứa JSON 18 mùa), `/public/assets` (chứa ảnh tối ưu), `/components/builder`, `/components/wiki`.
- [ ] **Xây dựng Script cào & chuẩn hóa dữ liệu (Node.js):**
  - Tải file dữ liệu tổng hợp `vi_vn.json` từ **CommunityDragon** (`raw.communitydragon.org/latest/cdragon/tft/`).
  - Viết script tách dữ liệu thành 18 file độc lập (`set-1.json` đến `set-18.json`) theo chuẩn Schema thống nhất.
  - Bổ sung dữ liệu thủ công/scrape từ *League of Legends Wiki* cho các mùa đầu (Mùa 1 – Mùa 5) nếu thiếu thông tin trang bị hoặc chỉ số kỹ năng cũ.
- [ ] **Tối ưu hóa hình ảnh (Assets Pipeline):**
  - Viết script tải toàn bộ icon Tướng, Tộc/Hệ, Trang bị về lưu cục bộ hoặc đẩy lên CDN miễn phí (Cloudinary / Cloudflare R2), chuyển đổi sang định dạng `.webp` để tải trang cực nhanh.
- [ ] **Tính năng Đếm ngược Mùa 19 (Countdown Widget):**
  - Xây dựng component đếm ngược thời gian thực (Ngày : Giờ : Phút : Giây) đến thời điểm ra mắt chính thức Mùa 19 (*Nhạc Hội Muôn Màu*).
  - Đặt widget nổi bật trên Hero Banner trang chủ và thanh điều hướng (Navbar).

---

## GIAI ĐOẠN 2: THƯ VIỆN WIKI & DÒNG THỜI GIAN 18 MÙA (TUẦN 2)

Tập trung vào trải nghiệm tra cứu mượt mà và yếu tố "hoài niệm" qua từng giai đoạn lịch sử của TFT.

- [ ] **Trang chủ Dòng thời gian (Interactive Timeline):**
  - Hiển thị hành trình 18 mùa giải từ 2019 đến 2026 theo trục thời gian trực quan.
  - Mỗi thẻ mùa giải hiển thị: Tên mùa, Ảnh nền chủ đề, Thời gian diễn ra, Cơ chế đặc trưng (ví dụ: *Nguyên Tố, Tinh Anh, Lõi Công Nghệ, Cổng Dịch Chuyển, Kỳ Ngộ, Mở khóa tướng...*).
- [ ] **Trang chi tiết từng mùa (`/sets/[setId]`):**
  - **Danh sách Tướng:** Bộ lọc nhanh theo Giá tiền (1 – 5 vàng & các mốc đặc biệt như Rồng Thần 8/10 vàng, Tướng 6 vàng), lọc theo Tộc/Hệ và thanh tìm kiếm theo tên.
  - **Popup/Trang chi tiết Tướng:** Hiển thị ảnh splash art, chỉ số cơ bản (Máu, Giáp, Kháng phép, Mana, Tầm đánh), mô tả kỹ năng theo từng mốc sao (1★/2★/3★) và gợi ý 3 trang bị chuẩn của mùa đó.
  - **Danh sách Tộc/Hệ:** Hiển thị biểu tượng, mô tả hiệu ứng và các mốc kích hoạt kèm màu sắc cấp bậc (Đồng, Bạc, Vàng, Kim Cương).
  - **Bảng ghép Trang bị:** Lưới tương tác 8x8 (hoặc 9x9 tùy mùa) cho phép bấm vào mảnh trang bị cơ bản để xem công thức ghép đồ hoàn chỉnh, đồ Ánh Sáng (Radiant), đồ Tạo Tác (Artifact) và Ấn Tộc/Hệ của riêng mùa đó.
- [ ] **Tối ưu SEO tĩnh (SSG):**
  - Sử dụng `generateStaticParams` trong Next.js để build sẵn toàn bộ trang của 18 mùa thành HTML tĩnh, đảm bảo chuyển mùa tức thì không độ trễ.

---

## GIAI ĐOẠN 3: CÔNG CỤ TEAM BUILDER ĐA MÙA (TUẦN 3)

Xây dựng tính năng tương tác cốt lõi cho phép người dùng tự do sáng tạo đội hình ở bất kỳ mùa giải nào.

- [ ] **Giao diện Bàn cờ Lục giác (Hex Grid):**
  - Dựng lưới lục giác chuẩn bằng CSS `clip-path` kết hợp Flexbox/Grid.
  - **Điểm nhấn hoài niệm:** Tự động đổi kích thước bàn cờ thành **3 hàng x 7 cột** khi người dùng chọn Mùa 1, và **4 hàng x 7 cột** cho từ Mùa 2 đến Mùa 18.
- [ ] **Tính năng Kéo & Thả (`@dnd-kit/core`):**
  - Kéo tướng từ danh sách bên dưới thả vào ô lục giác trên bàn cờ (hoặc click chuột nhanh để tự động xếp vào ô trống).
  - Kéo trang bị thả trực tiếp lên tướng trên bàn cờ (tối đa 3 món/tướng, tự động kiểm tra quy tắc đồ Duy Nhất / Ấn Tộc Hệ).
  - Hỗ trợ nâng cấp sao (1★, 2★, 3★) và xóa tướng khỏi bàn cờ bằng chuột phải.
- [ ] **Logic tự động tính Tộc/Hệ (Synergy Engine):**
  - Tự động đếm số lượng tướng độc nhất trên bàn cờ (lưu ý xử lý các trường hợp đặc biệt như tướng tính 2 mốc Tộc/Hệ ở một số mùa hoặc Ấn trang bị).
  - Sắp xếp danh sách Tộc/Hệ theo thứ tự ưu tiên: Mốc Kim Cương -> Vàng -> Bạc -> Đồng -> Chưa kích hoạt.
- [ ] **Chia sẻ đội hình không cần Database (Stateless URL):**
  - Mã hóa trạng thái bàn cờ (ID mùa, danh sách tướng, tọa độ `x,y`, cấp sao, ID trang bị) thành JSON rút gọn và nén bằng **`lz-string`** đưa lên query param URL (ví dụ: `/builder?set=10&code=N4Igxg...`).
  - Thêm nút "Sao chép liên kết đội hình" và "Xuất ảnh đội hình (PNG)" bằng thư viện `html-to-image`.

---

## GIAI ĐOẠN 4: TÍNH NĂNG HOÀI NIỆM NÂNG CAO & HOÀN THIỆN (TUẦN 4)

Tạo sự khác biệt cho website so với các trang thống kê meta thông thường và chuẩn bị ra mắt.

- [ ] **Chuyên mục "Kỷ Lục & Hoài Niệm" (`/nostalgia`):**
  - **Bảng vàng lịch sử:** Thống kê những vị tướng xuất hiện nhiều mùa nhất (như Yasuo, Ahri, Leona, Ashe...) kèm lịch sử thay đổi giá tiền và kỹ năng qua các mùa.
  - **Tiến hóa Tộc/Hệ biểu tượng:** So sánh sự thay đổi của các Tộc/Hệ kinh điển như *Vệ Binh Tinh Tú, Hư Không, Ác Quỷ, Đấu Sĩ, Pháp Sư* xuyên suốt 18 mùa.
  - **Đại sảnh Danh vọng CKTG:** Lưu trữ thông tin các nhà vô địch Chung Kết Thế Giới TFT qua từng mùa kèm đội hình vô địch của họ (link thẳng vào Team Builder để người dùng xem lại).
- [ ] **Kiểm thử & Tối ưu hiệu năng:**
  - Kiểm tra hiển thị Responsive trên cả màn hình máy tính và điện thoại (đảm bảo thao tác chạm kéo thả hoạt động mượt trên mobile).
  - Kiểm tra điểm Lighthouse (mục tiêu Performance & SEO > 95).
- [ ] **Tuân thủ pháp lý & Triển khai (Deploy):**
  - Thêm thông báo miễn trừ trách nhiệm (Legal Disclaimer) theo đúng quy định của Riot Games ở chân trang (Footer).
  - Deploy lên **Vercel** hoặc **Cloudflare Pages** và gắn tên miền chính thức.

---

## PHỤ LỤC: CẤU TRÚC FILE JSON CHUẨN HÓA (`set-18.json`)

```json
{
  "setId": 18,
  "name": "Đại Ngàn Kỳ Bí",
  "releaseDate": "2026-08-12",
  "boardSize": { "rows": 4, "cols": 7 },
  "mechanic": "Mô tả cơ chế đặc trưng của mùa giải",
  "traits": [
    {
      "id": "TFT18_TraitID",
      "name": "Tên Tộc/Hệ",
      "description": "Mô tả hiệu ứng tổng quát",
      "icon": "/assets/set18/traits/trait-id.webp",
      "breakpoints": [
        { "count": 2, "style": "bronze", "effect": "+15% Tốc độ đánh" },
        { "count": 4, "style": "silver", "effect": "+35% Tốc độ đánh" },
        { "count": 6, "style": "gold", "effect": "+65% Tốc độ đánh" }
      ]
    }
  ],
  "champions": [
    {
      "id": "TFT18_ChampionID",
      "name": "Tên Tướng",
      "cost": 4,
      "traits": ["TFT18_TraitID_1", "TFT18_TraitID_2"],
      "stats": {
        "hp":,
        "mana": { "initial": 30, "max": 90 },
        "armor": 50,
        "mr": 50,
        "ad":,
        "as": 0.75,
        "range": 1
      },
      "ability": {
        "name": "Tên Kỹ Năng",
        "description": "Mô tả chi tiết sát thương và hiệu ứng theo cấp sao",
        "icon": "/assets/set18/abilities/champ-id.webp"
      },
      "icon": "/assets/set18/champions/champ-id.webp"
    }
  ],
  "items": [
    {
      "id": "TFT_Item_InfinityEdge",
      "name": "Vô Cực Kiếm",
      "components": ["TFT_Item_BFSword", "TFT_Item_SparringGloves"],
      "description": "Kỹ năng có thể gây chí mạng. +35% SMCK, +35% Tỉ lệ chí mạng.",
      "isUnique": false,
      "icon": "/assets/items/infinity-edge.webp"
    }
  ]
}
```

