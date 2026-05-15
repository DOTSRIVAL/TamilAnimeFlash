export interface User {
  id: string;
  email: string;
  role: 'viewer' | 'studio_owner' | 'admin';
  avatar?: string;
  username?: string;
  displayName?: string;
  totalWatchTimeSeconds?: number;
}

export interface Studio {
  id: string;
  ownerId: string;
  name: string;
  logoUrl: string;
  createdAt: string;
}

export interface Anime {
  id: string;
  title: string;
  japaneseTitle: string;
  thumbnail: string;
  synopsis: string;
  rating: number;
  releaseDate: string;
  studioId: string;
  status: 'public' | 'private';
  categoryId?: string;
  bannerImage?: string;
  bannerMobile?: string;
  anilistId?: number | null;
  tmdbId?: number | null;
  kitsuId?: string | null;
  jikanId?: number | null;
  seasonsCount?: number;
  seasonNames?: {[key: number]: string};
  episodesCount?: number;
  quality?: string;
  format?: 'tv' | 'movie';
  language?: string;
  relatedAnimeIds?: string[];
  viewCount?: number;
}

export interface EpisodeSource {
  name: string;
  url: string;
  type: 'iframe' | 'video' | 'hls' | 'embed';
}

export interface Episode {
  id: string;
  animeId: string;
  season: number;
  episodeNumber: number;
  title: string;
  description: string;
  releaseDate: string;
  videoUrl: string; // Deprecated but kept for fallback
  videoUrl2?: string;
  sources?: EpisodeSource[];
  thumbnail: string;
  metadataJson?: string;
  status: 'public' | 'private';
  views: number;
  introStart?: number;
  introEnd?: number;
  outroStart?: number;
  importantText?: string;
}

export interface UserComment {
  id: string;
  animeId: string;
  episodeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: number; // timestamp
  likes: number;
  dislikes: number;
  parentId?: string;
}

export interface Issue {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  adminReply?: string;
  status: 'open' | 'replied' | 'closed';
  createdAt: number;
  updatedAt: number;
  animeId?: string;
  episodeId?: string;
  replySeen?: boolean;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  isSystem?: boolean;
  isLocked?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'new_episode' | 'system' | 'bookmark_update';
  animeId?: string;
  episodeId?: string;
  image?: string;
  isRead: boolean;
  createdAt: number;
}

export interface AnimeRequest {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  title: string;
  description?: string;
  votes: number;
  voters: string[];
  status: 'pending' | 'fulfilled' | 'rejected';
  createdAt: number;
}
