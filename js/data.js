/**
 * Elder Connect - Initial Mock Data & Persistence Helpers
 */

const DEFAULT_USER = {
  name: "Eleanor Vance",
  age: 74,
  location: "Sunnyvale, Apt 4B",
  bloodGroup: "O-Positive",
  allergies: "Penicillin, Shellfish",
  conditions: "Mild Hypertension, Knee Osteoarthritis",
  doctor: {
    name: "Dr. Robert Sterling",
    specialty: "Primary Geriatrician",
    phone: "+1 (555) 234-8901",
    clinic: "Oakwood Medical Pavilion"
  },
  emergencyContacts: [
    {
      id: "ec1",
      name: "David Vance",
      relation: "Son",
      phone: "+1 (555) 432-8765",
      isPrimary: true,
      avatar: "👨‍💼"
    },
    {
      id: "ec2",
      name: "Sarah Vance-Miller",
      relation: "Daughter",
      phone: "+1 (555) 765-4321",
      isPrimary: false,
      avatar: "👩‍⚕️"
    },
    {
      id: "ec3",
      name: "Oakwood Senior Care Line",
      relation: "24/7 Care Coordinator",
      phone: "+1 (555) 911-CARE",
      isPrimary: false,
      avatar: "🏥"
    }
  ]
};

const DEFAULT_MEDICATIONS = [
  {
    id: "med-1",
    name: "Lisinopril",
    dosage: "10mg",
    timing: "Morning with breakfast (8:00 AM)",
    purpose: "Blood Pressure",
    pillColor: "blue",
    taken: true,
    timeTaken: "08:15 AM"
  },
  {
    id: "med-2",
    name: "Vitamin D3 & Calcium",
    dosage: "1000 IU",
    timing: "Lunch (12:30 PM)",
    purpose: "Bone & Joint Strength",
    pillColor: "gold",
    taken: false,
    timeTaken: null
  },
  {
    id: "med-3",
    name: "Omega-3 Fish Oil",
    dosage: "1000mg",
    timing: "Lunch (12:30 PM)",
    purpose: "Heart Health",
    pillColor: "amber",
    taken: false,
    timeTaken: null
  },
  {
    id: "med-4",
    name: "Glucosamine Chondroitin",
    dosage: "500mg",
    timing: "Evening dinner (7:00 PM)",
    purpose: "Knee Joint Comfort",
    pillColor: "green",
    taken: false,
    timeTaken: null
  }
];

const DEFAULT_ACTIVITIES = [
  {
    id: "act-1",
    title: "Gentle Morning Chair Yoga",
    category: "Exercise",
    time: "Today, 10:30 AM - 11:15 AM",
    location: "Oakwood Community Garden & Online Video",
    host: "Clara Higgins (Certified Senior Instructor)",
    description: "Gentle seated stretching, posture alignment, and mindful breathing designed to relax tight joints.",
    attendees: 12,
    rsvp: true,
    badge: "Recommended for you"
  },
  {
    id: "act-2",
    title: "Afternoon Herbal Tea & Story Circle",
    category: "Social",
    time: "Tomorrow, 3:00 PM - 4:30 PM",
    location: "Sunlight Lounge & Library",
    host: "Arthur Pendelton (Book Volunteer)",
    description: "Bring a cup of tea or your favorite memory. This week's topic: 'Cherished songs from our youth'.",
    attendees: 8,
    rsvp: false,
    badge: "Friendly Chat"
  },
  {
    id: "act-3",
    title: "Senior Tech Help: Smartphone & Video Calls",
    category: "Workshop",
    time: "Wednesday, 2:00 PM - 3:30 PM",
    location: "Community Tech Hub (Room 102)",
    host: "High School Youth Volunteer League",
    description: "Patient, one-on-one assistance with sending photos, WhatsApp voice notes, and setting large text on phones.",
    attendees: 15,
    rsvp: false,
    badge: "One-on-One Help"
  },
  {
    id: "act-4",
    title: "Weekend Virtual Bingo & Brain Puzzles",
    category: "Games",
    time: "Saturday, 4:00 PM - 5:15 PM",
    location: "Online Video Room (One-Tap Join)",
    host: "Elder Connect Activities Team",
    description: "Friendly bingo rounds with prizes, laughter, and light-hearted brain teasers. Very easy to join!",
    attendees: 24,
    rsvp: true,
    badge: "Popular"
  }
];

const DEFAULT_VOLUNTEERS = [
  {
    id: "vol-1",
    name: "Marcus Chen",
    role: "Verified Volunteer Companion",
    rating: "4.9 ★ (34 visits)",
    distance: "0.8 miles away",
    specialties: ["Grocery Runs", "Tech Assistance", "Walking Companion"],
    badge: "Background Checked & First Aid Certified",
    avatar: "🧑‍🌾",
    bio: "College student studying physical therapy. Loving grandson who enjoys gardening and reading historical books."
  },
  {
    id: "vol-2",
    name: "Hannah Robinson",
    role: "Community Health Nurse Volunteer",
    rating: "5.0 ★ (62 visits)",
    distance: "1.2 miles away",
    specialties: ["Doctor Escort", "Medication Organization", "Friendly Chats"],
    badge: "Registered Nurse & Background Verified",
    avatar: "👩‍💼",
    bio: "Passionate about elder care, cheerful listener, and happy to assist with rides to checkups or pharmacy pick-ups."
  },
  {
    id: "vol-3",
    name: "Liam O'Connor",
    role: "Neighborhood Handyman & Tech Helper",
    rating: "4.8 ★ (28 visits)",
    distance: "1.5 miles away",
    specialties: ["Tech Help", "Light Home Repairs", "Pet Walking"],
    badge: "Community Verified Volunteer",
    avatar: "👨‍🔧",
    bio: "Retired engineer who loves fixing gadgets, setting up TV remotes, and helping seniors feel safe at home."
  }
];

const DEFAULT_HELP_REQUESTS = [
  {
    id: "req-1",
    service: "Ride & Escort to Doctor Appointment",
    date: "Tomorrow, 1:45 PM",
    destination: "Oakwood Medical Pavilion (Dr. Sterling)",
    volunteer: "Hannah Robinson",
    status: "Confirmed",
    statusColor: "status-confirmed",
    notes: "Hannah will arrive at Apt 4B entrance with a clean, low-step vehicle."
  },
  {
    id: "req-2",
    service: "Grocery & Fresh Produce Delivery",
    date: "Friday, 11:00 AM",
    destination: "Sunnyvale Farmer's Market",
    volunteer: "Marcus Chen",
    status: "In Progress",
    statusColor: "status-pending",
    notes: "List: 2% organic milk, whole wheat bread, fresh apples, and chamomile tea."
  }
];

const DEFAULT_FAMILY_FEED = [
  {
    id: "fam-1",
    sender: "David (Son)",
    relation: "Son",
    time: "Today at 9:15 AM",
    avatar: "👨‍💼",
    photoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80",
    caption: "Good morning Mom! Leo just finished his school science project on volcanoes. He wanted to make sure grandma saw the colorful banner he made for you!",
    audioNote: "Voice note from Leo (0:22) - 'I love you grandma!'",
    hasVoice: true
  },
  {
    id: "fam-2",
    sender: "Sarah & Little Maya",
    relation: "Daughter & Granddaughter",
    time: "Yesterday at 4:30 PM",
    avatar: "👩‍⚕️",
    photoUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=700&auto=format&fit=crop&q=80",
    caption: "We spent the afternoon planting sunflowers in the backyard just like you taught me when I was little. Thinking of you always!",
    audioNote: "Voice note from Sarah (0:35)",
    hasVoice: true
  }
];

// LocalStorage Persistence Wrapper
const Storage = {
  get(key, defaultVal) {
    try {
      const item = localStorage.getItem(`elder_connect_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      console.error("Storage get error:", e);
      return defaultVal;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(`elder_connect_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error("Storage set error:", e);
    }
  }
};
