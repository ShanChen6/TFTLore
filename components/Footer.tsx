import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 text-xs text-white/50">
      <div className="mx-auto max-w-6xl space-y-3">
        <nav className="flex flex-wrap gap-4 text-sm text-white/70">
          <Link href="/#timeline" className="hover:text-white">
            Các mùa
          </Link>
          <Link href="/builder" className="hover:text-white">
            Xếp đội hình
          </Link>
          <Link href="/nostalgia" className="hover:text-white">
            Kỷ Lục & Hoài Niệm
          </Link>
        </nav>
        {/* Văn bản bắt buộc theo "Legal Jibber Jabber" của Riot Games (giữ nguyên bản tiếng Anh). */}
        <p lang="en">
          TFTLore isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or
          anyone officially involved in producing or managing Riot Games properties. Riot Games, and all
          associated properties are trademarks or registered trademarks of Riot Games, Inc.
        </p>
        <p>
          TFTLore không được Riot Games chứng thực và không phản ánh quan điểm của Riot Games hay bất kỳ ai
          tham gia chính thức vào việc sản xuất hoặc quản lý các tài sản của Riot Games. Riot Games và mọi tài
          sản liên quan là thương hiệu hoặc thương hiệu đã đăng ký của Riot Games, Inc.
        </p>
        <p>
          Dữ liệu & hình ảnh trong game lấy từ{" "}
          <a href="https://www.communitydragon.org" className="underline hover:text-white" rel="noopener noreferrer">
            CommunityDragon
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
