# TFTLore

Thư viện tra cứu (Wiki/Hoài niệm) cho trọn bộ các mùa giải Đấu Trường Chân Lý (TFT): 18 mùa chính và 7 mùa giữa kỳ (3.5 – 9.5), kèm công cụ xếp đội hình (Team Builder) đa mùa và đồng hồ đếm ngược Mùa 19 (*Nhạc Hội Muôn Màu*).

**Công nghệ:** Next.js (App Router), TypeScript, Tailwind CSS, Node.js, `@dnd-kit/core`, `lz-string`.

## Nhánh làm việc

- `main` — nhánh ổn định, dùng để deploy.
- `develop` — nhánh phát triển, mọi commit hằng ngày nằm ở đây.

Xem lộ trình chi tiết tại [docs/ROADMAP.md](docs/ROADMAP.md).

## Phát triển

```bash
npm install
npm run dev
```

## Các trang

| Đường dẫn | Nội dung |
|---|---|
| `/` | Hero + đếm ngược Mùa 19, dòng thời gian toàn bộ các mùa |
| `/sets/[setId]` | Chi tiết mùa (`1`, `3.5`, `18`…): danh sách tướng có bộ lọc và popup chi tiết, Tộc/Hệ kèm mốc kích hoạt, bảng ghép trang bị |
| `/builder?set=<id>&code=<…>` | Team Builder đa mùa: bàn cờ lục giác (3×7 ở Mùa 1, 4×7 các mùa khác), kéo thả tướng/trang bị, tự tính Tộc/Hệ, chia sẻ bằng liên kết và xuất ảnh PNG |
| `/nostalgia` | Kỷ Lục & Hoài Niệm: bảng vàng tướng xuất hiện nhiều mùa nhất, tiến hóa Tộc/Hệ kinh điển, Đại sảnh Danh vọng CKTG |
| `/api/builder/[setId]` | JSON rút gọn cho Team Builder, sinh tĩnh lúc build |
| `/api/sets/[setId]/details` | Chi tiết tướng & mô tả trang bị, chỉ tải khi mở popup (giảm dung lượng trang mùa) |

### Team Builder

- Trạng thái bàn cờ (tướng, vị trí, cấp sao, trang bị) được nén bằng `lz-string` vào tham số `code` trên URL – không cần database.
- Synergy Engine (`lib/builder.ts`): đếm tướng độc nhất, cộng Tộc/Hệ từ Ấn; sắp xếp Kim Cương → Vàng → Bạc → Đồng → chưa kích hoạt.
- Luật trang bị: tối đa 3 món, không trùng đồ Duy Nhất, không gắn Ấn cho tướng đã có Tộc/Hệ đó.
- Ấn → Tộc/Hệ được suy ra tự động (`lib/builder-data.ts`) theo tên, apiName hoặc mô tả trang bị.

Tất cả trang mùa được build tĩnh (SSG) qua `generateStaticParams`. Mô tả kỹ năng/Tộc-Hệ/trang bị được
chuyển từ định dạng của Riot sang HTML trong `lib/format.ts` (thay biến `@Tên@` theo mốc sao/mốc kích hoạt).
Giá trị được game tính trong trận (không có trong dữ liệu công khai) hiển thị là `?`.

## Dữ liệu & hình ảnh

Dữ liệu 25 mùa (`data/sets/set-<id>.json`, id dạng `1`, `3.5`, `18`; mục lục ở `data/sets/index.json`) và icon (`public/assets/set<id>/`) đã được commit sẵn.
Để sinh lại từ [CommunityDragon](https://raw.communitydragon.org):

```bash
npm run data:fetch      # sinh lại JSON (cache tại .cache/cdragon, thêm --refresh để tải lại bản mới nhất)
npm run assets:fetch    # tải icon, chuyển sang .webp và cập nhật đường dẫn trong JSON
```

- Nguồn bản vá của từng mùa khai báo trong `SET_SOURCES` (`scripts/fetch-cdragon.mjs`).
- Mùa giữa kỳ 3.5 – 9.5 được tính là một mùa riêng. Mỗi mùa lấy bản vá cuối trước khi mùa kế tiếp ra mắt.
- Mùa 1 – 6.5 chỉ còn dữ liệu tiếng Anh; tên Tộc/Hệ và trang bị được dịch sang tiếng Việt khi khớp với dữ liệu các bản vá sau.
- Tên tiếng Việt, ngày ra mắt và cơ chế từng mùa được chỉnh tay trong `data/set-meta.json`.
- Nếu môi trường đi qua proxy, chạy kèm `NODE_USE_ENV_PROXY=1` (Node ≥ 22.21).

## Kỷ Lục & Hoài Niệm

- Bảng vàng và Tiến hóa Tộc/Hệ được tính tự động từ dữ liệu (`lib/nostalgia.ts`), nhận diện tướng/Tộc-Hệ xuyên mùa qua apiName.
- Danh sách Tộc/Hệ kinh điển cấu hình trong `CLASSIC_TRAITS`.
- Đại sảnh CKTG lấy từ `data/worlds.json`. Mỗi mục có `verified` (đã đối chiếu nguồn chính thức chưa) và `comp` – mã
  đội hình vô địch (giá trị `code` copy từ URL Team Builder) để hiện nút “Xem đội hình vô địch”.

## Deploy (Vercel)

1. Vào [vercel.com/new](https://vercel.com/new), import repo `ShanChen6/TFTLore` (framework: Next.js, không cần cấu hình build).
2. Trong **Settings → Git**, đặt **Production Branch** là `main`; nhánh `develop` sẽ tự có bản Preview.
3. Thêm biến môi trường `NEXT_PUBLIC_SITE_URL` = tên miền chính thức (vd. `https://tftlore.vn`) để sitemap,
   robots và Open Graph dùng đúng domain. Nếu bỏ trống, site dùng domain `*.vercel.app` mà Vercel cấp.
4. Gắn tên miền ở **Settings → Domains**.

Toàn bộ trang và JSON được build tĩnh nên cũng có thể deploy lên Cloudflare Pages qua `@cloudflare/next-on-pages`.

## Ghi chú pháp lý

Footer hiển thị nguyên văn thông báo “Legal Jibber Jabber” theo yêu cầu của Riot Games (kèm bản dịch tiếng Việt)
và ghi nguồn dữ liệu CommunityDragon.
