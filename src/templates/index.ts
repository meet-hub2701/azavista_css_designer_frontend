import { eventLandingTemplate } from './event-landing';
import { portfolioTemplate } from './portfolio';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  html: string;
  defaultContent: Record<string, string>;
}

export const templates: Template[] = [
  eventLandingTemplate,
  portfolioTemplate,
];

export { eventLandingTemplate, portfolioTemplate };
