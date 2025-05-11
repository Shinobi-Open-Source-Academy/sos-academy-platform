import GithubIcon from "../components/icons/GithubIcon";
import XIcon from "../components/icons/XIcon";
import LinkedinIcon from "../components/icons/LinkedinIcon";

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/Shinobi-Open-Source-Academy-SOS-Academy",
    icon: GithubIcon,
  },
  {
    name: "X",
    url: "#",
    icon: XIcon,
  },
  {
    name: "LinkedIn",
    url: "#",
    icon: LinkedinIcon,
  },
];
