// Simple mock API with artificial latency
import { mockHealthNews, mockLivingStyle, mockFeaturedArticles } from '../data/mockData';

// A simple sleep function to simulate network latency
// A simple sleep function to simulate network latency for a more realistic user experience.
const delay = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Mock login function.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - A promise that resolves with user data upon successful login.
 * @throws {Error} - Throws an error for invalid credentials.
 */
export async function loginApi(username, password) {
  await delay(1000); // Simulate network delay
  if (username === 'user' && password === 'password123') {
    return { 
      id: '1', 
      username: 'user', 
      email: 'user@example.com', 
      token: 'fake-jwt-token'
    };
  }
  throw new Error('Invalid username or password');
}

/**
 * Fetches the featured articles.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of featured articles.
 */
export async function fetchFeaturedArticles() {
  await delay(400);
  // Preserve original data; do not inject default youtubeId
  return mockFeaturedArticles;
}

// Mock: list of ad videos for right column (title + youtubeId)
/**
 * Fetches a list of advertisement videos.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of ad videos.
 */
export async function fetchAdVideos() {
  await delay(400);
  return [
    { id: 'ad1', title: '7 Heart-Healthy Habits', youtubeId: 'dQw4w9WgXcQ', description: 'Rick Astley Channel' },
    { id: 'ad2', title: 'Sleep Better in 3 Minutes', youtubeId: 'C0DPdy98e4c', description: 'Health Tips Channel' },
    { id: 'ad3', title: '10 Morning Stretching Moves', youtubeId: 'ysz5S6PUM-U', description: 'Morning Routine' },
  ];
}

/**
 * Fetches the top 3 health news articles.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of health news articles.
 */
export async function fetchHealthNewsTop3() {
  await delay(500);
  return mockHealthNews;
}

/**
 * Fetches the top 3 lifestyle articles.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of lifestyle articles.
 */
export async function fetchLivingStyleTop3() {
  await delay(500);
  return mockLivingStyle;
}

// Mock: list of videos for Living Style section
/**
 * Fetches a list of lifestyle videos.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of lifestyle videos.
 */
export async function fetchLivingStyleVideos() {
  await delay(400);
  return [
    { id: 'ls1', title: 'What Are the Health Benefits of Laughter?', youtubeId: 'kO1i2iLzO_c', description: 'TEDx Talks' },
    { id: 'ls2', title: 'Mindfulness Practices for Daily Life', youtubeId: 'ZToicYcHIOU', description: 'Goodful' },
    { id: 'ls3', title: 'Sleep Hygiene: Tips for Better Rest', youtubeId: 'Ri_Y_b2s_yQ', description: 'Sleep Foundation' },
  ];
}

// Rich, video‑specific articles keyed by card id. Keeps detail pages unique and relevant.
// A dictionary of rich, video-specific articles keyed by their ID to provide unique content for detail pages.
const videoArticlesById = {
  ad1: {
    id: 'ad1',
    title: '7 Heart-Healthy Habits',
    author: 'Rick Astley Channel',
    audioDuration: '4:01',
    youtubeId: 'dQw4w9WgXcQ',
    image: 'Image/Video',
    content:
      "Strong cardiovascular health is built through repeatable daily choices. Focus first on the habits with the biggest impact: moving your body, eating whole foods, and sleeping enough. None of these require perfection—only consistency.\n\nA simple weekly plan can help: schedule brisk walks (or light cycling) on five days, swap refined snacks for fruit or nuts, and aim for a steady bedtime that gives you 7–9 hours. Track these habits for two weeks and you’ll likely notice better energy and mood.\n\nWhy it matters: small lifestyle upgrades improve blood pressure, insulin sensitivity, and cholesterol over time. Combine movement with high‑fiber meals and you’ll support your heart from multiple angles. Start today with one habit you can keep for seven days.",
  },
  // Tech list items
  tech1: {
    id: 'tech1',
    title: "The Future of AI: What's Next in 2024",
    author: 'Editorial Team',
  youtubeId: 'dQw4w9WgXcQ',
    image: 'Image/Video',
    content:
      "AI continues to evolve rapidly with breakthroughs in multimodal models, agent workflows, and on-device inference. This article explores where the next 12 months might take us and how to prepare your stack.",
  },
  tech2: {
    id: 'tech2',
    title: 'Quantum Computing Breakthroughs',
    author: 'Editorial Team',
  youtubeId: 'ysz5S6PUM-U',
    image: 'Image/Video',
    content:
      "Quantum hardware is scaling qubits and reducing error rates. We unpack what these milestones mean for chemistry, optimization, and cryptography use cases.",
  },
  tech3: {
    id: 'tech3',
    title: 'The Rise of Web3 and Decentralization',
    author: 'Editorial Team',
  youtubeId: 'kO1i2iLzO_c',
    image: 'Image/Video',
    content:
      "Decentralized primitives are moving beyond speculation toward consumer and enterprise utility. Here are pragmatic lenses to evaluate projects in 2024.",
  },
  tech4: {
    id: 'tech4',
    title: 'Sustainable Tech: Building a Greener Future',
    author: 'Editorial Team',
  youtubeId: 'C0DPdy98e4c',
    image: 'Image/Video',
    content:
      "From energy-efficient chips to carbon-aware scheduling, we explore the practical steps the industry is taking to reduce its footprint.",
  },
  // Sport list items
  sport1: {
    id: 'sport1',
    title: '2024 Olympics: New Records and Rising Stars',
    author: 'Sports Desk',
  youtubeId: 'ysz5S6PUM-U',
    image: 'Image/Video',
    content:
      "A roundup of standout performances, training philosophies, and narratives that defined the games.",
  },
  sport2: {
    id: 'sport2',
    title: 'The Science of Athletic Performance',
    author: 'Sports Desk',
  youtubeId: 'kO1i2iLzO_c',
    image: 'Image/Video',
    content:
      "How biomechanics, recovery protocols, and data analytics are changing the way athletes train and compete.",
  },
  sport3: {
    id: 'sport3',
    title: 'Football Transfers: Summer 2024 Roundup',
    author: 'Sports Desk',
  youtubeId: 'C0DPdy98e4c',
    image: 'Image/Video',
    content:
      "The biggest moves, tactical fits, and what they signal for the coming season across major leagues.",
  },
  ad2: {
    id: 'ad2',
    title: 'Sleep Better in 3 Minutes',
    author: 'Health Tips Channel',
    audioDuration: '4:01',
    youtubeId: 'C0DPdy98e4c',
    image: 'Image/Video',
    content:
      "High‑quality sleep starts long before your head hits the pillow. Create a short wind‑down ritual: dim lights, silence notifications, and do a two‑minute box‑breathing set (inhale 4s, hold 4s, exhale 4s, hold 4s).\n\nKeep your room cool and dark. Caffeine can linger for 6–8 hours, so set a personal cutoff by early afternoon. If you can’t fall asleep, step out of bed and read a few pages of a boring book until drowsy—this trains your brain to associate bed with sleep, not frustration.\n\nWithin a week, most people notice faster sleep onset and fewer awakenings. Protect your sleep window like an appointment; everything else works better when you’re well‑rested.",
  },
  ad3: {
    id: 'ad3',
    title: '10 Morning Stretching Moves',
    author: 'Morning Routine',
    audioDuration: '4:01',
    youtubeId: 'ysz5S6PUM-U',
    image: 'Image/Video',
    content:
      "Gentle morning mobility primes joints and muscles for the day. Start with neck rotations and shoulder rolls, then open the hips with a world’s‑greatest stretch. Add a 30‑second calf stretch and a slow forward fold to wake up the posterior chain.\n\nMove deliberately and breathe. The goal isn’t intensity—it’s circulation and range of motion. Over time, this five‑minute flow reduces stiffness, improves posture, and lowers injury risk during workouts or long desk sessions.\n\nIf time is tight, pick three moves and do them daily. Consistency beats complexity.",
  },
  ls1: {
    id: 'ls1',
    title: 'What Are the Health Benefits of Laughter?',
    author: 'TEDx Talks',
    audioDuration: '4:01',
    youtubeId: 'kO1i2iLzO_c',
    image: 'Image/Video',
    content:
      "Laughter nudges the nervous system toward relaxation. Short bursts of genuine laughter lower stress hormones and trigger small spikes in endorphins—our natural painkillers.\n\nSocial laughter matters most. Sharing a joke strengthens connection, which is itself protective for mental and cardiovascular health.\n\nTry a practical habit: save a 60‑second funny clip and watch it between taxing tasks. Over a month, these micro‑resets can improve focus and reduce perceived stress.",
  },
  ls2: {
    id: 'ls2',
    title: 'Mindfulness Practices for Daily Life',
    author: 'Goodful',
    audioDuration: '4:01',
    youtubeId: 'ZToicYcHIOU',
    image: 'Image/Video',
    content:
      "Mindfulness is attention on purpose, in the present moment, without judgment. Start with a two‑minute check‑in: notice five things you can see, four you can feel, three you can hear, two you can smell, and one you can taste.\n\nUse anchors throughout the day—breath while waiting in line, one mindful bite at lunch, or a single focused minute before meetings.\n\nOver time, these micro‑practices reduce reactivity, improve decision‑making, and help you respond rather than react to stressors.",
  },
  ls3: {
    id: 'ls3',
    title: 'Sleep Hygiene: Tips for Better Rest',
    author: 'Sleep Foundation',
    audioDuration: '4:01',
    youtubeId: 'Ri_Y_b2s_yQ',
    image: 'Image/Video',
    content:
      "Think of sleep hygiene as the environment and behaviors that make great sleep likely. Keep a consistent schedule—even on weekends—so your circadian rhythm knows when to power down.\n\nBlock blue light in the evening, limit alcohol (it fragments sleep), and finish heavy meals two hours before bed. If racing thoughts keep you up, do a quick brain dump on paper—emptying your head reduces rumination.\n\nTrack one metric that matters to you (time to fall asleep, number of awakenings) and iterate weekly.",
  },
};

/**
 * Fetches a single article by its ID.
 * It first checks for video-specific articles and then falls back to the general mock data.
 * @param {string} id - The ID of the article to fetch.
 * @returns {Promise<object>} - A promise that resolves with the article data.
 * @throws {Error} - Throws an error if the article is not found.
 */
export async function fetchArticleById(id) {
  await delay(350);
  // First check known video cards with rich content
  if (videoArticlesById[id]) {
    return videoArticlesById[id];
  }
  const all = [...mockFeaturedArticles, ...mockHealthNews, ...mockLivingStyle];
  const found = all.find((a) => String(a.id) === String(id));
  if (!found) throw new Error('Article not found');
  // Ensure required fields exist for detail page
  return {
    ...found,
    author: found.author || 'Daniel',
    audioDuration: found.audioDuration || '4:01',
    content:
      found.content ||
      `${found.description || ''}\n\nThis is extended mock content for the article "${found.title}" to simulate a realistic detail page per Figma.`,
    image: found.image || 'Image/Video',
    // Preserve youtubeId only if provided; do not inject defaults
    youtubeId: found.youtubeId,
  };
}

