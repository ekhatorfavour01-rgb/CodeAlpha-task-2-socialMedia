// data/seedData.js
// Sample data for our TikTok-style social media app.
// Includes users, video posts, image posts, and comments.
const V = [
  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188156/henved_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188273/tyler_glass_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188255/variablexcrew_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188248/The_Real_Rahul_Rai_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188243/Tolu_A_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188247/The_BlackFemale_Engineer_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188233/mixed_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188274/PeachyyBombb_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188227/saleema_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188219/WoP_Gym_Templates_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188206/Juice_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188217/sydney_blandford_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188219/lvlrrn_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188229/MelonadeHYPE_video_no_watermark.mp4',

  'https://res.cloudinary.com/vseaai5b/video/upload/v1793188226/Ymir_video_no_watermark.mp4',

]

const users = [
  {
    name: 'Favour Ekhator',
    username: 'favour',
    bio: 'Developer in training. Building cool things. 💻',
  },
  {
    name: 'Ada Okafor',
    username: 'ada_codes',
    bio: 'Frontend lover. Coffee, CSS and chill. ☕',
  },
  {
    name: 'Tunde Bakare',
    username: 'tunde_b',
    bio: 'Travel, food and good vibes. 🌍',
  },
  {
    name: 'Zainab Musa',
    username: 'zee_creates',
    bio: 'Short videos. Big dreams. 🎬',
  },
  {
    name: 'Chidi Eze',
    username: 'chidi_runs',
    bio: 'Run. Eat. Sleep. Repeat. 🏃',
  },
  {
    name: 'Mary Johnson',
    username: 'mary_j',
    bio: 'Daily life of a Lagos girl. 💕',
  },
  {
    name: 'Daniel James',
    username: 'daniel_j',
    bio: 'Capturing life one frame at a time. 📸',
  },
  {
    name: 'Amara Bello',
    username: 'amara_style',
    bio: 'Fashion, beauty and confidence. ✨',
  },
  {
    name: 'Samuel Peter',
    username: 'sam_foodie',
    bio: 'If it looks good, I am eating it. 🍔',
  },
  {
    name: 'Grace Williams',
    username: 'grace_travels',
    bio: 'Collecting memories, not things. ✈️',
  },
  {
    name: 'Emeka David',
    username: 'emeka_fitness',
    bio: 'Getting stronger every day. 💪',
  },
  {
    name: 'Aisha Ibrahim',
    username: 'aisha_daily',
    bio: 'Lifestyle, skincare and little joys. 🌸',
  },
  {
    name: 'Michael Cole',
    username: 'mike_gaming',
    bio: 'Gaming clips and funny moments. 🎮',
  },
  {
    name: 'Precious John',
    username: 'precious_art',
    bio: 'Art is how I tell my story. 🎨',
  },
  {
    name: 'David Okoro',
    username: 'dave_comedy',
    bio: 'Here to make you laugh. 😂',
  },
];

// Image URLs use Unsplash's image service.
// Video URLs use public sample-video locations.
// These are demonstration URLs, not media uploaded by our users.

const posts = [
  // ==========================================
  // VIDEO POSTS
  // ==========================================

  {
    by: 'ada_codes',
    caption: 'Big Buck Bunny is my spirit animal today 😂',
    videoUrl: V[0],
    imageUrl: '',
  },
  {
    by: 'tunde_b',
    caption: 'Road trip energy! Where should we go next? 🚗',
    videoUrl: V[1],
    imageUrl: '',
  },
  {
    by: 'zee_creates',
    caption: 'Fun times with the crew ❤️',
    videoUrl: V[2],
    imageUrl: '',
  },
  {
    by: 'chidi_runs',
    caption: 'Escape the Monday blues. Move your body! 🏃',
    videoUrl: V[3],
    imageUrl: '',
  },
  {
    by: 'mary_j',
    caption: 'When the WiFi finally connects 😂',
    videoUrl: V[4],
    imageUrl: '',
  },
  {
    by: 'favour',
    caption: 'Building my own mini TikTok, one feature at a time 💻',
    videoUrl: V[5],
    imageUrl: '',
  },
  {
    by: 'ada_codes',
    caption: 'Sintel and the dragon. Animation is art! 🎬',
    videoUrl: V[6],
    imageUrl: '',
  },
  {
    by: 'tunde_b',
    caption: 'Meltdown mode: ON 🔥',
    videoUrl: V[7],
    imageUrl: '',
  },
  {
    by: 'zee_creates',
    caption: 'Just another day making memories ✨',
    videoUrl: V[8],
    imageUrl: '',
  },
  {
    by: 'chidi_runs',
    caption: 'No excuses today. We show up! 💪',
    videoUrl: V[9],
    imageUrl: '',
  },
  {
    by: 'sam_foodie',
    caption: 'POV: You said you were only going to taste it 😂',
    videoUrl: V[10],
    imageUrl: '',
  },
  {
    by: 'grace_travels',
    caption: 'Adding another adventure to the memories ✈️',
    videoUrl: V[11],
    imageUrl: '',
  },
  {
    by: 'emeka_fitness',
    caption: 'Your only competition is who you were yesterday 💯',
    videoUrl: V[12],
    imageUrl: '',
  },
  {
    by: 'mike_gaming',
    caption: 'That moment when everything goes wrong 🎮',
    videoUrl: V[13],
    imageUrl: '',
  },
  {
    by: 'dave_comedy',
    caption: 'Me pretending I understand the assignment 😭😂',
    videoUrl: V[14],
    imageUrl: '',
  },

  // ==========================================
  // IMAGE POSTS
  // ==========================================

  {
    by: 'favour',
    caption: 'Small steps every day. One day, the dream will be reality. 💻✨',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'ada_codes',
    caption: 'A little workspace inspiration for today ☕',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'tunde_b',
    caption: 'Somewhere beautiful, far away from the noise 🌍',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'zee_creates',
    caption: 'A little colour makes everything better 🎨',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'mary_j',
    caption: 'Main character energy. Every single day. 💕',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'daniel_j',
    caption: 'Chasing beautiful light and unforgettable moments 📸',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'amara_style',
    caption: 'Wear what makes you feel confident. ✨',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'sam_foodie',
    caption: 'Good food, good mood. What are you eating today? 🍕',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'grace_travels',
    caption: 'Take the scenic route whenever you can 🌄',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'emeka_fitness',
    caption: 'Discipline today. Progress tomorrow. 💪',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'aisha_daily',
    caption: 'Soft mornings and peaceful moments 🌸',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'mike_gaming',
    caption: 'Setup ready. Snacks ready. Game on! 🎮',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'precious_art',
    caption: 'Creating something beautiful, one idea at a time 🎨',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=85',
  },
  {
    by: 'dave_comedy',
    caption: 'Smile. Life is already serious enough 😂',
    videoUrl: '',
    imageUrl:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85',
  },

  // ==========================================
  // TEXT-ONLY POSTS
  // ==========================================

  {
    by: 'favour',
    caption: 'Learning backend development. One bug at a time. 🚀',
    videoUrl: '',
    imageUrl: '',
  },
  {
    by: 'mary_j',
    caption: 'What is one thing that made you smile today? ❤️',
    videoUrl: '',
    imageUrl: '',
  },
  {
    by: 'ada_codes',
    caption: 'Reminder: every developer started as a beginner. Keep going! 💻',
    videoUrl: '',
    imageUrl: '',
  },
];

// Random comments used by the seed script.
const comments = [
  'This is so good! 🔥',
  'Love this ❤️',
  'Where was this taken?',
  'Haha, I can relate 😂',
  'Following you now!',
  'Okay, this made my day.',
  'More of this please!',
  'First! 🙌',
  'This deserves more likes.',
  'You understood the assignment.',
  'The quality is amazing 📸',
  'I needed to hear this today.',
  'Too funny 😂',
  'Keep creating!',
  'This is beautiful ✨',
  'Can we get a part two?',
  'Absolutely love the vibes.',
  'This is your sign to keep going.',
  'Who else agrees?',
  'Adding this to my favourites!',
];

module.exports = { users, posts, comments };