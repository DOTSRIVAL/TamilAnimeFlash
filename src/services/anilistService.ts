
export async function searchAniList(query: string) {
  const graphqlQuery = `
    query ($search: String) {
      Page(perPage: 25) {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
          }
          description
          coverImage {
            large
          }
          bannerImage
          averageScore
          startDate {
            year
            month
            day
          }
          status
          genres
          format
        }
      }
    }
  `;

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { search: query }
    })
  });

  const result = await response.json();
  return result.data.Page.media;
}
