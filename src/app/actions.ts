"use server";

// Types
export type VideoStat = {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  publishedAt: string;
};

export type ChannelData = {
  name: string;
  subscribers: string;
  totalViews: string;
  videos: VideoStat[];
  error?: string;
  isMock?: boolean;
};

export async function fetchYoutubeData(url: string): Promise<ChannelData> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return {
      name: "",
      subscribers: "",
      totalViews: "",
      videos: [],
      error: "YOUTUBE_API_KEY missing! Please provide your YouTube API key in the .env.local file to continue.",
      isMock: true,
    };
  }

  try {
    const defaultHeaders = { Accept: "application/json" };
    let channelId = "";

    // 1. Extract Handle or Channel ID from URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    if (pathname.startsWith("/@")) {
      const handle = pathname.substring(2).split("/")[0];
      // get channel by handle
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`
      );
      const searchData = await searchRes.json();
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].id;
      }
    } else if (pathname.startsWith("/channel/")) {
      channelId = pathname.split("/")[2];
    }

    if (!channelId) {
      // Sometimes URLs are different, attempt to search for the channel
      const q = pathname.replace("/", "");
      if (q) {
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(q)}&key=${apiKey}`
        );
        const searchData = await searchRes.json();
        if (searchData.items && searchData.items.length > 0) {
          channelId = searchData.items[0].snippet.channelId;
        }
      }
    }

    if (!channelId) {
      return { name: "", subscribers: "", totalViews: "", videos: [], error: "Channel not found. Please enter a valid link (e.g. youtube.com/@username)" };
    }

    // 2. Get Channel stats and Uploads playlist ID
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelRes.json();

    if (!channelData.items || channelData.items.length === 0) {
      return { name: "", subscribers: "", totalViews: "", videos: [], error: "Channel details not found." };
    }

    const channelItem = channelData.items[0];
    const channelName = channelItem.snippet.title;
    const subscribers = formatCount(channelItem.statistics.subscriberCount);
    const totalViews = formatCount(channelItem.statistics.viewCount);
    const uploadsPlaylistId = channelItem.contentDetails.relatedPlaylists.uploads;

    // 3. Fetch the last 50 videos from the Uploads playlist
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
    );
    const playlistData = await playlistRes.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return { name: channelName, subscribers, totalViews, videos: [] };
    }

    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(",");

    // 4. Fetch statistics (views, likes) for these videos
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
    );
    const videosData = await videosRes.json();

    const formattedVideos: VideoStat[] = videosData.items.map((v: any) => ({
      id: v.id,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
      views: parseInt(v.statistics.viewCount || "0", 10),
      likes: parseInt(v.statistics.likeCount || "0", 10),
      publishedAt: v.snippet.publishedAt,
    }));

    return {
      name: channelName,
      subscribers,
      totalViews,
      videos: formattedVideos,
    };
  } catch (error: any) {
    console.error("YouTube API Error:", error);
    return { name: "", subscribers: "", totalViews: "", videos: [], error: "An error occurred while fetching data: " + error.message };
  }
}

function formatCount(countStr: string) {
  const count = parseInt(countStr || "0", 10);
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count.toString();
}
