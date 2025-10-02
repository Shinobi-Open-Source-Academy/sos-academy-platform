import Link from "next/link";

const QUICK_LINKS = [
  { href: "/#about", label: "About Us" },
  { href: "/#communities", label: "Our Communities" },
  { href: "/#projects", label: "Projects" },
  { href: "/#mentors", label: "Our Mentors" },
  { href: "/blog", label: "Blog" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

export default function QuickLinks() {
  return (
    <div>
      <h4 className="text-lg font-bold mb-4">Quick Links</h4>
      <ul className="space-y-2">
        {QUICK_LINKS.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
