import GithubIcon from "../components/icons/GithubIcon";
import XIcon from "../components/icons/XIcon";
import LinkedinIcon from "../components/icons/LinkedinIcon";
import DiscordIcon from "../components/icons/DiscordIcon";

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
    url: "https://x.com/SOSAcademy_",
    icon: XIcon,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/shinobi-open-source-academy-sos-a/about/",
    icon: LinkedinIcon,
  },
  {
    name: "Discord",
    url: "https://discord.gg/9Wgx7bCh",
    icon: DiscordIcon,
  },
];
