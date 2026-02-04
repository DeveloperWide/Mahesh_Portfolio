export type Project = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  descriptionMd?: string;
  tech: string[];
  imageUrl?: string;
  imagePublicId?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
};

