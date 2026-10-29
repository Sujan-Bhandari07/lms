const VIDEO_FILE_EXTENSION =
  /\.(?:3gp|avi|m4v|mkv|mov|mp4|mpe?g|mts|m2ts|ogv|webm|wmv|m3u8|mpd)$/i;

export function isProtectedVideoUrl(value: string): boolean {
  let decoded = value;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
  }

  let url: URL;
  try {
    url = new URL(decoded);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(url.protocol)) return false;

  const path = url.pathname.toLowerCase();
  if (
    VIDEO_FILE_EXTENSION.test(path) ||
    /\/video\/upload(?:\/|$)/i.test(path) ||
    /\/(?:videos?|lessons?|playback|streams?|course[-_]?parts?)(?:\/|$)/i.test(
      path,
    )
  ) {
    return true;
  }

  const hostname = url.hostname.toLowerCase();
  if (
    ((hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtu.be") &&
      (url.searchParams.has("v") ||
        /\/(?:embed|shorts|live)\//i.test(path) ||
        hostname === "youtu.be")) ||
    ((hostname === "vimeo.com" || hostname.endsWith(".vimeo.com")) &&
      /\/(?:video\/)?\d+(?:\/|$)/i.test(path)) ||
    ((hostname === "dailymotion.com" ||
      hostname.endsWith(".dailymotion.com")) &&
      /\/video\//i.test(path))
  ) {
    return true;
  }

  for (const [key, queryValue] of url.searchParams) {
    if (
      /^(?:video(?:url|_url)?|playback(?:url|_url)?|stream(?:url|_url)?|lesson(?:url|_url)?)$/i.test(
        key,
      ) ||
      VIDEO_FILE_EXTENSION.test(queryValue)
    ) {
      return true;
    }
  }

  return false;
}

export function sanitizeAssistantResponse(text: string): string {
  const linkPattern = /(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+["'][^)]*["'])?\)/gi;
  const linksSanitized = text.replace(
    linkPattern,
    (markdownLink, imageMarker: string, label: string, url: string) =>
      isProtectedVideoUrl(url)
        ? imageMarker
          ? "[Video omitted]"
          : label || "[Video link removed]"
        : markdownLink,
  );

  return linksSanitized.replace(
    /https?:\/\/[^\s<>"'`]+/gi,
    (candidate) => {
      const url = candidate.replace(/[.,!?;:]+$/, "");
      return isProtectedVideoUrl(url)
        ? "[video link removed; open the course player to watch]"
        : candidate;
    },
  );
}

export function sanitizeCourseToolResult(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeCourseToolResult);
  }
  if (typeof value === "string") {
    return sanitizeAssistantResponse(value);
  }
  if (value === null || typeof value !== "object") {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    const normalizedKey = key.replace(/[^a-z]/gi, "").toLowerCase();
    if (
      /^(?:_?id|userid|tutorid|courseid|lessonid|partid|enrollmentid)$/i.test(
        normalizedKey,
      ) ||
      /(?:video|playback|stream).*(?:url|link)|(?:url|link).*(?:video|playback|stream)/i.test(
        key,
      )
    ) {
      continue;
    }

    if (
      normalizedKey === "parts" ||
      normalizedKey === "lessons" ||
      normalizedKey === "videos"
    ) {
      if (Array.isArray(item)) {
        result[
          normalizedKey === "parts"
            ? "partCount"
            : normalizedKey === "lessons"
              ? "lessonCount"
              : "videoCount"
        ] = item.length;
      }
      continue;
    }

    result[key] = sanitizeCourseToolResult(item);
  }
  return result;
}
