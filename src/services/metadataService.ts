let dynamicKeys: Record<string, string> = {};

export function setMetadataKeys(keys: any[]) {
  if (!keys) return;
  dynamicKeys = {}; // Reset before mapping
  keys.forEach((k: any) => {
    dynamicKeys[k.provider] = k.key;
  });
}

function getKey(provider: string, envVar: string, fallback?: string): string {
  const keys = Object.keys(dynamicKeys);
  const matchedKey = keys.find(k => k.toLowerCase() === provider.toLowerCase() || k.toLowerCase().includes(provider.toLowerCase()));
  
  return (matchedKey && dynamicKeys[matchedKey]) || (import.meta as any).env[envVar] || fallback || '';
}

export async function searchTMDB(query: string) {
  const key = getKey('tmdb', 'VITE_TMDB_API_KEY');
  if (!key) { throw new Error("TMDB API Key missing. Please add it to API Keys manager."); }
  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${key}&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data.status_code) { throw new Error(data.status_message || "TMDB API Error"); }
    if (!data || !data.results) return [];
    return data.results.map((item: any) => ({
      id: `tmdb-${item.id}`,
      title: item.name || item.original_name || 'Unknown',
      description: item.overview || '',
      coverImage: { large: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://placehold.co/500x750?text=No+Poster' },
      bannerImage: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '',
      averageScore: item.vote_average ? item.vote_average * 10 : 0,
      startDate: { year: item.first_air_date ? item.first_air_date.split('-')[0] : null },
      status: item.status,
      format: 'TV',
      source: 'tmdb',
      rawId: item.id
    }));
  } catch (e: any) {
    console.error("TMDB Search Error:", e);
    throw e;
  }
}

export async function searchKitsu(query: string) {
  try {
    const response = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=25`);
    const data = await response.json();
    if (!data || !data.data) return [];
    
    return data.data.map((item: any) => {
      const attr = item.attributes;
      return {
        id: `kitsu-${item.id}`,
        title: attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp,
        description: attr.synopsis,
        coverImage: { large: attr.posterImage?.large || attr.posterImage?.original },
        bannerImage: attr.coverImage?.large || attr.coverImage?.original,
        averageScore: parseFloat(attr.averageRating) || 0,
        startDate: { year: attr.startDate ? attr.startDate.split('-')[0] : null },
        status: attr.status,
        format: attr.showType,
        source: 'kitsu',
        rawId: item.id
      };
    });
  } catch (e) {
    console.error("Kitsu Search Error:", e);
    return [];
  }
}

export async function getKitsuEpisodes(kitsuId: string) {
  try {
    const response = await fetch(`https://kitsu.io/api/edge/anime/${kitsuId}/episodes?page[limit]=100`);
    const data = await response.json();
    if (!data || !data.data) return [];
    
    return data.data.map((ep: any) => ({
      episodeNumber: ep.attributes.number,
      title: ep.attributes.canonicalTitle || ep.attributes.titles?.en_us || ep.attributes.titles?.en_jp || `Episode ${ep.attributes.number}`,
      thumbnail: ep.attributes.thumbnail?.original || '',
      synopsis: ep.attributes.synopsis || '',
      season: 1 // Kitsu flat list usually
    }));
  } catch (e) {
    console.error("Kitsu Episodes Error:", e);
    return [];
  }
}

export async function searchJikan(query: string) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=25`);
    const data = await response.json();
    if (!data || !data.data) return [];
    
    return data.data.map((item: any) => ({
      id: `jikan-${item.mal_id}`,
      title: item.title_english || item.title,
      description: item.synopsis || '',
      coverImage: { large: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url },
      bannerImage: item.images?.jpg?.large_image_url || '',
      averageScore: item.score ? item.score * 10 : 0,
      startDate: { year: item.year },
      status: item.status,
      episodesCount: item.episodes,
      format: item.type,
      source: 'jikan',
      rawId: item.mal_id
    }));
  } catch (e) {
    console.error("Jikan Search Error:", e);
    return [];
  }
}

export async function searchJikanCharacter(query: string) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=25`);
    const data = await response.json();
    if (!data || !data.data) return [];
    
    return data.data.map((c: any) => ({
      id: String(c.mal_id),
      name: c.name,
      image: c.images?.jpg?.image_url || c.images?.webp?.image_url
    }));
  } catch (e) {
    console.error("Jikan Character Error:", e);
    return [];
  }
}

export async function getJikanEpisodes(malId: number) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/episodes`);
    const data = await response.json();
    if (!data || !data.data) return [];
    
    return data.data.map((ep: any) => ({
      episodeNumber: ep.mal_id,
      title: ep.title || ep.title_romanji || ep.title_japanese || `Episode ${ep.mal_id}`,
      thumbnail: '', // Jikan doesn't provide episode images directly in this endpoint
      synopsis: ep.synopsis || '',
      season: 1
    }));
  } catch (e) {
    console.error("Jikan Episodes Error:", e);
    return [];
  }
}

export async function getTMDBDetails(tvId: number) {
  const key = getKey('tmdb', 'VITE_TMDB_API_KEY');
  if (!key) { throw new Error("TMDB API Key missing. Please add it to API Keys manager."); }
  const response = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${key}`);
  const data = await response.json();
  return {
    seasonsCount: data.number_of_seasons,
    episodesCount: data.number_of_episodes,
    seasons: data.seasons // List of seasons with episode counts
  };
}

export async function getTMDBEpisodes(tvId: number, seasonNumber: number = 1) {
  const key = getKey('tmdb', 'VITE_TMDB_API_KEY');
  if (!key) { throw new Error("TMDB API Key missing. Please add it to API Keys manager."); }
  const response = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${key}`);
  const data = await response.json();

  if (!data.episodes) return [];

  return data.episodes.map((ep: any) => ({
    title: ep.name,
    episodeNumber: ep.episode_number,
    seasonNumber: ep.season_number,
    description: ep.overview,
    thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null
  }));
}

export async function searchDanbooru(query: string) {
  try {
    // Basic search - can use tags like 'anime_title' or characters
    const safeQuery = query.toLowerCase().replace(/\s+/g, '_');
    const response = await fetch(`https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(safeQuery)}&limit=25`);
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
      id: `danbooru-${item.id}`,
      thumbnail: item.preview_file_url || item.large_file_url || item.file_url,
      large: item.large_file_url || item.file_url,
      source: 'danbooru'
    }));
  } catch (e) {
    console.error("Danbooru Error:", e);
    return [];
  }
}

export async function searchGoogleImages(query: string) {
  const apiKey = getKey('google', 'VITE_GOOGLE_SEARCH_API_KEY', 'AIzaSyCOM45G0AM_zIn157Fdugw66IGDH9HuivM');
  const cx = getKey('google_cx', 'VITE_GOOGLE_SEARCH_CX', 'c0ab6faddbf9e4956');
  
  if (!apiKey || !cx) {
    console.warn("Google Search API Key or CX missing. Configure in Settings.");
    return [{ id: 'error', isMessage: true, errorMsg: "Google Search API Key or CX missing. Please set it in Settings -> API Keys.", thumbnail: '', large: '', source: 'google' }];
  }

  try {
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=10`);
    const data = await response.json();
    if (data.error) {
       return [{ id: 'error-api', isMessage: true, errorMsg: `Google API Error: ${data.error.message || 'Quota exceeded or invalid key'}`, thumbnail: '', large: '', source: 'google' }];
    }
    if (!data.items) return [{ id: 'empty', isMessage: true, errorMsg: "No images found on Google.", thumbnail: '', large: '', source: 'google'}];
    return data.items.map((item: any, idx: number) => ({
      id: `google-${idx}`,
      thumbnail: item.image.thumbnailLink,
      large: item.link,
      source: 'google'
    }));
  } catch (e) {
    console.error("Google Search Error:", e);
    return [{ id: 'fetch-error', isMessage: true, errorMsg: "Google Image Search failed. Check console.", thumbnail: '', large: '', source: 'google' }];
  }
}

export async function searchUnsplash(query: string) {
  const accessKey = getKey('unsplash', 'VITE_UNSPLASH_ACCESS_KEY');
  if (!accessKey) {
     return [{ id: 'error', isMessage: true, errorMsg: "Unsplash API Key missing. Please set it in Settings -> API Keys.", thumbnail: '', large: '', source: 'unsplash' }];
  }
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20`, {
      headers: { 'Authorization': `Client-ID ${accessKey}` }
    });
    const data = await response.json();
    if (data.errors) return [{ id: 'error', isMessage: true, errorMsg: data.errors[0] || "Unsplash error", thumbnail: '', large: '', source: 'unsplash' }];
    return data.results.map((item: any) => ({
      id: `unsplash-${item.id}`,
      thumbnail: item.urls.thumb,
      large: item.urls.regular,
      source: 'unsplash'
    }));
  } catch (e) {
    return [{ id: 'error', isMessage: true, errorMsg: "Unsplash API Request failed.", thumbnail: '', large: '', source: 'unsplash' }];
  }
}

export async function searchPexels(query: string) {
  const apiKey = getKey('pexels', 'VITE_PEXELS_API_KEY');
  if (!apiKey) {
      return [{ id: 'error', isMessage: true, errorMsg: "Pexels API Key missing. Please set it in Settings -> API Keys.", thumbnail: '', large: '', source: 'pexels' }];
  }
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20`, {
      headers: { 'Authorization': apiKey }
    });
    const data = await response.json();
    if (data.error) return [{ id: 'error', isMessage: true, errorMsg: data.error, thumbnail: '', large: '', source: 'pexels' }];
    return data.photos.map((item: any) => ({
      id: `pexels-${item.id}`,
      thumbnail: item.src.medium,
      large: item.src.large,
      source: 'pexels'
    }));
  } catch (e) {
    return [{ id: 'error', isMessage: true, errorMsg: "Pexels API Request failed.", thumbnail: '', large: '', source: 'pexels' }];
  }
}

export async function searchPixabay(query: string) {
  const apiKey = getKey('pixabay', 'VITE_PIXABAY_API_KEY');
  if (!apiKey) {
    return [{ id: 'error', isMessage: true, errorMsg: "Pixabay API Key missing. Please set it in Settings -> API Keys.", thumbnail: '', large: '', source: 'pixabay' }];
  }
  try {
    const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20`);
    const data = await response.json();
    if (!data.hits) return [{ id: 'error', isMessage: true, errorMsg: "Pixabay returned no data or errored.", thumbnail: '', large: '', source: 'pixabay' }];
    return data.hits.map((item: any) => ({
      id: `pixabay-${item.id}`,
      thumbnail: item.previewURL,
      large: item.largeImageURL,
      source: 'pixabay'
    }));
  } catch (e) {
    return [{ id: 'error', isMessage: true, errorMsg: "Pixabay API Request failed.", thumbnail: '', large: '', source: 'pixabay' }];
  }
}
export async function getAniListEpisodes(animeId: number) {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        episodes
        streamingEpisodes {
          title
          thumbnail
        }
        relations {
          edges {
            relationType
            node {
              id
              title { romaji english }
              status
              episodes
            }
          }
        }
      }
    }
  `;
  
  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id: animeId } })
  });
  
  const result = await response.json();
  if (!result.data || !result.data.Media) return [];
  
  const media = result.data.Media;
  const episodes: any[] = [];
  
  if (media.streamingEpisodes?.length > 0) {
    const rawEpisodes: any[] = [];
    media.streamingEpisodes.forEach((ep: any, idx: number) => {
      const match = ep.title.match(/Episode\s+(\d+)/i);
      const epNum = match ? parseInt(match[1], 10) : media.streamingEpisodes.length - idx;
      rawEpisodes.push({
        title: ep.title.split(' - ').slice(1).join(' - ').trim() || ep.title,
        episodeNumber: epNum,
        description: '',
        thumbnail: ep.thumbnail,
        season: 1
      });
    });
    rawEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
    episodes.push(...rawEpisodes);
  } else {
    // Fallback
    for (let i = 1; i <= (media.episodes || 12); i++) {
      episodes.push({
        title: `Episode ${i}`,
        episodeNumber: i,
        description: '',
        thumbnail: null,
        season: 1
      });
    }
  }

  return episodes;
}
