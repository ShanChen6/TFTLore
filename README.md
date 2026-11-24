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
