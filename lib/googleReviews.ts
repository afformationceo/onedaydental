import "server-only";

export interface GooglePlaceReview {
  authorName: string;
  authorPhotoUrl?: string;
  rating: number; // 1-5
  text: string;
  relativeTime: string;
  publishTime: string; // ISO
  authorUrl?: string;
}

export interface GooglePlaceReviewsResult {
  branchId: string;
  rating: number | null;
  userRatingCount: number | null;
  reviews: GooglePlaceReview[];
  mapsUrl: string;
}

/**
 * Google Places API (New) — Place Details, fields=reviews,rating,userRatingCount.
 * Google caps this at the 5 most relevant reviews per place; we cache the
 * response for a day (REVALIDATE_SECONDS) since this block renders on every
 * page — fetching live on every request would multiply API cost by traffic.
 */
const REVALIDATE_SECONDS = 60 * 60 * 24;

export async function getGooglePlaceReviews(
  branchId: string,
  placeId: string,
): Promise<GooglePlaceReviewsResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) {
      console.error(`[googleReviews] ${branchId} place details failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const reviews: GooglePlaceReview[] = (data.reviews ?? []).map(
      (r: {
        authorAttribution?: { displayName?: string; photoUri?: string; uri?: string };
        rating?: number;
        text?: { text?: string };
        relativePublishTimeDescription?: string;
        publishTime?: string;
      }) => ({
        authorName: r.authorAttribution?.displayName ?? "Google 사용자",
        authorPhotoUrl: r.authorAttribution?.photoUri,
        rating: r.rating ?? 5,
        text: r.text?.text ?? "",
        relativeTime: r.relativePublishTimeDescription ?? "",
        publishTime: r.publishTime ?? "",
        authorUrl: r.authorAttribution?.uri,
      }),
    );

    return {
      branchId,
      rating: data.rating ?? null,
      userRatingCount: data.userRatingCount ?? null,
      reviews,
      mapsUrl: data.googleMapsUri ?? `https://maps.google.com/?cid=${placeId}`,
    };
  } catch (err) {
    console.error(`[googleReviews] ${branchId} fetch error`, err);
    return null;
  }
}

export async function getAllGooglePlaceReviews(
  branches: { id: string; placeId?: string }[],
): Promise<GooglePlaceReviewsResult[]> {
  const withPlaceId = branches.filter((b) => b.placeId);
  if (!withPlaceId.length) return [];
  const results = await Promise.all(
    withPlaceId.map((b) => getGooglePlaceReviews(b.id, b.placeId!)),
  );
  return results.filter((r): r is GooglePlaceReviewsResult => r !== null);
}
