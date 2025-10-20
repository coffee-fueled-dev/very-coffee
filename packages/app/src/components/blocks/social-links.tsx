import { ExternalLink } from "@/components/blocks/external-link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faLinkedin,
  faInstagram,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

library.add(faInstagram, faLinkedin, faGithub);

export const SocialLinks = () => (
  <span>
    <InstagramLink />
    <GitHubLink />
    <LinkedInLink />
  </span>
);

const GitHubLink = () => (
  <ExternalLink
    size="icon"
    variant="ghost"
    href="https://github.com/coffee-fueled-dev"
  >
    <FontAwesomeIcon icon={faGithub} size="lg" />
  </ExternalLink>
);

const InstagramLink = () => (
  <ExternalLink
    size="icon"
    variant="ghost"
    href="https://www.instagram.com/zachthearcher/"
  >
    <FontAwesomeIcon icon={faInstagram} size="lg" />
  </ExternalLink>
);

const LinkedInLink = () => (
  <ExternalLink
    size="icon"
    variant="ghost"
    href="https://www.linkedin.com/in/zachthearcher/"
  >
    <FontAwesomeIcon icon={faLinkedin} size="lg" />
  </ExternalLink>
);
