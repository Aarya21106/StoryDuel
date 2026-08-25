import type { Scenario, SecretObjective } from './types.js';

// ── 15 Pre-built Scenarios ──

export const SCENARIOS: Scenario[] = [
  // MYSTERY
  {
    id: 'last-train',
    title: 'The Last Train',
    genre: 'mystery',
    opening: "The last train of the night has stopped. No announcement. No movement. Then you notice a phone on the seat next to you — and it's ringing.",
    initialState: { danger: 25, trust: 15, mystery: 60, chaos: 10 },
  },
  {
    id: 'locked-room',
    title: 'The Locked Room',
    genre: 'mystery',
    opening: "You wake up in a hotel room you don't remember booking. The door is unlocked. Your wallet is on the table. But the mirror has a message written on it in marker.",
    initialState: { danger: 30, trust: 10, mystery: 70, chaos: 15 },
  },
  {
    id: 'missing-message',
    title: 'The Missing Message',
    genre: 'mystery',
    opening: 'Your phone buzzes. A message from your own number: "Don\'t go home tonight." You check — you definitely didn\'t send it.',
    initialState: { danger: 40, trust: 10, mystery: 65, chaos: 20 },
  },

  // HORROR
  {
    id: 'empty-apartment',
    title: 'The Empty Apartment',
    genre: 'horror',
    opening: "It's 11 PM. You hear footsteps from the apartment above yours. Clear, heavy footsteps. But you live on the top floor.",
    initialState: { danger: 55, trust: 10, mystery: 50, chaos: 15 },
  },
  {
    id: '3-17-am',
    title: '3:17 AM',
    genre: 'horror',
    opening: "Every night this week, at exactly 3:17 AM, someone knocks on your door. Three knocks. Always three. Tonight you're ready.",
    initialState: { danger: 60, trust: 5, mystery: 55, chaos: 20 },
  },

  // ROMANCE
  {
    id: 'last-day-chennai',
    title: 'Last Day in Chennai',
    genre: 'romance',
    opening: "You're leaving Chennai tomorrow morning. You've already packed. Then your phone lights up — a message from someone you haven't talked to in three years.",
    initialState: { danger: 5, trust: 30, mystery: 20, chaos: 10 },
  },
  {
    id: 'wrong-train',
    title: 'The Wrong Train',
    genre: 'romance',
    opening: "You sit down on the train. The person next to you looks at the route map, then at you. \"This isn't the Andheri train, is it?\" It isn't. Neither of you moves.",
    initialState: { danger: 5, trust: 35, mystery: 15, chaos: 15 },
  },

  // ADVENTURE
  {
    id: 'the-island',
    title: 'The Island',
    genre: 'adventure',
    opening: "Your boat reaches a small island. It's not on Google Maps. Not on any map. But someone has built a wooden dock — and there's a light coming from inside the trees.",
    initialState: { danger: 30, trust: 20, mystery: 55, chaos: 15 },
  },
  {
    id: 'the-rooftop',
    title: 'The Rooftop',
    genre: 'adventure',
    opening: "You find a key taped underneath your apartment door. No note. You try every lock in your building. The last one opens a door to a rooftop you've never seen — and someone is already up there.",
    initialState: { danger: 20, trust: 20, mystery: 50, chaos: 10 },
  },

  // EMOTIONAL
  {
    id: 'one-more-call',
    title: 'One More Call',
    genre: 'emotional',
    opening: "Your phone battery says 3%. One person has been trying to reach you all day. You have time for one call. Maybe two minutes if you're lucky.",
    initialState: { danger: 10, trust: 40, mystery: 10, chaos: 5 },
  },
  {
    id: 'the-photograph',
    title: 'The Photograph',
    genre: 'emotional',
    opening: "While cleaning out your old room, you find a photograph. It's you, maybe eight years old, with someone you don't recognize. But on the back, someone wrote: \"Don't forget.\"",
    initialState: { danger: 5, trust: 30, mystery: 40, chaos: 5 },
  },

  // COMEDY
  {
    id: 'wrong-wedding',
    title: 'Wrong Wedding',
    genre: 'comedy',
    opening: "You walked into the wrong wedding hall. Before you could leave, the uncle at the door grabbed your arm: \"The groom is here! Finally!\" Everyone starts clapping.",
    initialState: { danger: 10, trust: 25, mystery: 15, chaos: 55 },
  },
  {
    id: 'the-mayor',
    title: 'The Mayor',
    genre: 'comedy',
    opening: "You wake up in a small town you've never visited. There's a sash on your bed that says \"MAYOR.\" Your phone has 47 missed calls from the town council.",
    initialState: { danger: 10, trust: 20, mystery: 30, chaos: 60 },
  },

  // SCI-FI
  {
    id: 'four-minutes',
    title: 'Four Minutes of Oxygen',
    genre: 'scifi',
    opening: "You open your eyes. Red lights. An alarm you've never heard before. Your helmet display reads: OXYGEN — 4:00. You're alone on Mars. Or at least, you think you are.",
    initialState: { danger: 70, trust: 10, mystery: 40, chaos: 30 },
  },

  // CHAOS
  {
    id: 'the-suitcase',
    title: 'The Suitcase',
    genre: 'chaos',
    opening: "You're waiting at the railway station. A suitcase on the bench next to you vibrates. Then it moves. About two inches. Toward you.",
    initialState: { danger: 35, trust: 15, mystery: 50, chaos: 45 },
  },
];

// ── Secret Objectives Pool ──

export const OBJECTIVES: SecretObjective[] = [
  // Location-based
  { text: 'Get the story onto the rooftop.', genres: ['mystery', 'adventure', 'horror'] },
  { text: 'Make the story end at a train station.', genres: ['mystery', 'romance', 'emotional'] },
  { text: 'Get everyone outside.', genres: ['horror', 'adventure', 'chaos'] },
  { text: 'Keep the story indoors.', genres: ['mystery', 'horror', 'emotional'] },
  { text: 'Move the story to a completely new place.', genres: ['adventure', 'chaos', 'scifi'] },

  // Relationship-based
  { text: 'Make the other character trust you.', genres: ['mystery', 'romance', 'emotional', 'adventure'] },
  { text: 'Make the other character suspicious.', genres: ['mystery', 'horror', 'chaos'] },
  { text: 'Protect the stranger at all costs.', genres: ['mystery', 'adventure', 'emotional', 'horror'] },
  { text: 'Betray someone before the story ends.', genres: ['mystery', 'horror', 'chaos'] },
  { text: 'Become friends with the stranger.', genres: ['romance', 'adventure', 'comedy', 'emotional'] },
  { text: 'Keep your distance from everyone.', genres: ['horror', 'mystery', 'scifi'] },

  // Emotional
  { text: 'Make the ending hopeful.', genres: ['emotional', 'romance', 'adventure', 'scifi'] },
  { text: 'Make the story romantic.', genres: ['romance', 'emotional', 'comedy'] },
  { text: 'Create the saddest possible ending.', genres: ['emotional', 'mystery', 'horror'] },
  { text: 'Make someone laugh.', genres: ['comedy', 'chaos', 'romance'] },
  { text: 'Make the ending bittersweet.', genres: ['emotional', 'romance', 'mystery'] },

  // Action-based
  { text: 'Cause maximum chaos.', genres: ['chaos', 'comedy', 'adventure'] },
  { text: 'Keep everyone alive.', genres: ['horror', 'scifi', 'adventure', 'mystery'] },
  { text: 'Find the hidden object.', genres: ['mystery', 'adventure'] },
  { text: 'Make someone take a risk.', genres: ['adventure', 'chaos', 'scifi'] },
  { text: 'Avoid all danger.', genres: ['horror', 'scifi', 'mystery'] },
  { text: 'Discover the truth before anyone else.', genres: ['mystery', 'scifi'] },
  { text: 'Escape before time runs out.', genres: ['horror', 'scifi', 'mystery', 'chaos'] },
  { text: 'Convince everyone to stay.', genres: ['emotional', 'romance', 'mystery'] },

  // Object-based
  { text: 'Make sure the phone plays a key role.', genres: ['mystery', 'emotional', 'horror'] },
  { text: 'Find out what\'s in the bag.', genres: ['mystery', 'chaos', 'adventure'] },
  { text: 'Make the key important to the story.', genres: ['mystery', 'adventure'] },
  { text: 'Get someone to open the door.', genres: ['horror', 'mystery', 'adventure'] },

  // Tone-based
  { text: 'Make the story as weird as possible.', genres: ['chaos', 'comedy', 'scifi'] },
  { text: 'Keep things calm and peaceful.', genres: ['romance', 'emotional'] },
  { text: 'Build maximum tension.', genres: ['horror', 'mystery', 'scifi'] },
  { text: 'Turn a serious moment into comedy.', genres: ['comedy', 'chaos'] },
  { text: 'Make the story feel like a dream.', genres: ['mystery', 'scifi', 'emotional'] },

  // Character-based
  { text: 'Find someone named Maya.', genres: ['mystery', 'romance', 'emotional', 'adventure'] },
  { text: 'Make the other character confess something.', genres: ['romance', 'emotional', 'mystery'] },
  { text: 'Make sure you end up alone.', genres: ['horror', 'mystery', 'emotional'] },
  { text: 'Get the story to include a stranger.', genres: ['mystery', 'adventure', 'romance', 'chaos'] },
  { text: 'Make the villain turn good.', genres: ['mystery', 'adventure', 'emotional'] },
  { text: 'Become the leader of the group.', genres: ['adventure', 'comedy', 'chaos', 'scifi'] },
];

// ── Combinatorial Seed Pools ──

export const LOCATIONS = [
  'an empty metro station at midnight',
  'a rooftop with no railing',
  'a chai stall that\'s still open',
  'an overnight bus to somewhere',
  'a parking lot with one car left',
  'a hospital waiting room',
  'a library after closing time',
  'an abandoned school corridor',
  'someone\'s terrace in the rain',
  'a beach with no one around',
  'an old bookshop basement',
  'a temple at night',
  'a half-built construction site',
  'a crowded local train',
  'the last floor of a mall',
  'a petrol pump at 3 AM',
  'a bus stop in heavy rain',
  'an auto-rickshaw going the wrong way',
  'a cinema hall after the last show',
  'a park bench near the highway',
  'a narrow gully in an old part of town',
  'a houseboat at midnight',
  'a railway crossing gate',
  'a deserted highway dhaba',
  'a terrace with a broken water tank',
  'the back room of a paan shop',
  'an elevator stuck between floors',
  'an empty swimming pool',
  'a government office after hours',
  'a photocopy shop that\'s still open',
  'a cold storage warehouse',
  'a lighthouse that nobody uses',
  'a bridge over a dry river',
  'a phone booth (that somehow still works)',
  'a taxi stuck in traffic at 2 AM',
  'a wedding venue the day after',
  'a server room with blinking lights',
  'a hill station in fog',
  'a cycle shop in a village',
  'a pier with no boats',
  'a balcony overlooking an empty road',
  'a hostel common room at midnight',
  'a movie set after pack-up',
  'a tunnel that goes nowhere',
  'a kindergarten classroom at night',
  'a laundromat that smells like jasmine',
  'a car parked in a forest',
  'a broken escalator in a dead mall',
  'a playground with rusty swings',
  'a penthouse with all the lights off',
];

export const INCIDENTS = [
  'a phone starts ringing',
  'the lights go out',
  'someone calls your name',
  'a door opens by itself',
  'you receive a message from an unknown number',
  'a stranger sits down next to you',
  'the last bus just left',
  'you find a note in your pocket you didn\'t write',
  'someone drops a bag and runs',
  'the Wi-Fi network shows a message instead of a name',
  'a dog starts following you',
  'someone waves at you like they know you',
  'you hear music coming from an empty room',
  'the clock stops',
  'someone takes a photo of you and walks away',
  'a car pulls up and the window rolls down',
  'you notice you\'re being followed',
  'your reflection in the glass doesn\'t look right',
  'a voice announces something that makes no sense',
  'the ground shakes for exactly one second',
  'an ATM screen shows a message just for you',
  'a pigeon drops something at your feet',
  'someone starts arguing in a language you don\'t know',
  'you notice the same person for the third time today',
  'the temperature drops suddenly',
  'a siren starts but no vehicle passes',
  'someone taps your shoulder but nobody is there',
  'a street light flickers in a pattern',
  'you receive a delivery you never ordered',
  'all the screens around you show the same thing',
  'a child hands you a drawing of your face',
  'the elevator opens on a floor that shouldn\'t exist',
  'a bird flies into the room',
  'someone leaves an umbrella with your name on it',
  'you hear your voice on someone\'s phone',
  'a mirror shows something behind you',
  'the radio plays a song with your name in it',
  'an old newspaper has tomorrow\'s date',
  'the moon looks wrong',
  'someone sends you your own location',
  'a plant in the corner has a USB drive in the soil',
  'a vending machine gives you something that\'s not food',
  'a fire alarm goes off but nobody moves',
  'you get a notification from an app you never installed',
  'the person across from you is reading a book with your photo on the cover',
  'a countdown appears on your screen',
  'someone slides you a drink you didn\'t order',
  'the building starts making sounds',
  'you find a letter addressed to you, dated 10 years ago',
  'all the clocks show different times',
];

export const TONES = [
  'tense', 'playful', 'melancholic', 'chaotic', 'romantic',
  'eerie', 'hopeful', 'absurd', 'nostalgic', 'paranoid',
  'gentle', 'urgent', 'surreal', 'awkward', 'suspenseful',
  'darkly funny', 'warm', 'cold', 'dreamy', 'confrontational',
];

export const OBJECTS = [
  'a rusted key', 'a photograph of strangers', 'a dead phone',
  'a handwritten note', 'a flickering lighter', 'a train ticket to nowhere',
  'a cracked watch that still ticks', 'a paper crane', 'a cassette tape',
  'a torn map', 'a locket with no photo', 'a SIM card',
  'a glass marble', 'a matchbox from a hotel', 'a foreign coin',
  'a bracelet with initials', 'a USB drive', 'a bus pass from 2014',
  'a small mirror', 'a half-written postcard', 'a blank passport',
  'a pair of earphones', 'a pressed flower', 'a receipt from tomorrow',
  'a ring with no gemstone', 'a page torn from a diary', 'a rolled-up newspaper',
  'a bottle cap collection', 'a broken compass', 'a origami bird',
];

// ── Helper Functions ──

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickScenario(excludeIds: string[] = []): Scenario {
  const available = SCENARIOS.filter(s => !excludeIds.includes(s.id));
  if (available.length === 0) return randomPick(SCENARIOS);
  return randomPick(available);
}

export function generateSeed() {
  return {
    location: randomPick(LOCATIONS),
    incident: randomPick(INCIDENTS),
    tone: randomPick(TONES),
    object: randomPick(OBJECTS),
  };
}

export function pickObjectives(genre: Scenario['genre']): [string, string] {
  const matching = OBJECTIVES.filter(o => o.genres.includes(genre));
  if (matching.length < 2) {
    return [randomPick(OBJECTIVES).text, randomPick(OBJECTIVES).text];
  }
  // Pick two different objectives
  const first = randomPick(matching);
  const remaining = matching.filter(o => o.text !== first.text);
  const second = randomPick(remaining.length > 0 ? remaining : matching);
  return [first.text, second.text];
}

export function pickWriteRound(): number {
  // Round 3 or 4 (of 1-6)
  return Math.random() < 0.5 ? 3 : 4;
}
