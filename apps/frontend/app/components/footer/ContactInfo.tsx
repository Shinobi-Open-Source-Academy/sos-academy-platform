import { SOCIAL_LINKS } from '../../config/socialLinks';
import { FOOTER_DATA } from '../../data/siteData';

const CONTACT_ITEMS = [
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
    text: FOOTER_DATA.contact.email,
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
      />
    ),
    text: FOOTER_DATA.contact.discord,
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    text: FOOTER_DATA.contact.schedule,
  },
];

export default function ContactInfo() {
  return (
    <div>
      <h4 className="text-lg font-bold mb-4">Contact Us</h4>
      <ul className="space-y-4">
        {CONTACT_ITEMS.map((item, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="h-5 w-5 text-primary mr-3 mt-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {item.icon}
            </svg>
            <span className="text-gray-400">{item.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex space-x-4">
        {SOCIAL_LINKS.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={social.name}
          >
            <social.icon />
          </a>
        ))}
      </div>
    </div>
  );
}
