import type { Scenario, SecretObjective, ScenarioSeed } from './types.js';

// ── 15 Story Bibles ──
// Each story is authored with a real premise, two named characters, a
// distinct color grade, and enough texture to survive the Briefing screen.

export const SCENARIOS: Scenario[] = [
  // MYSTERY
  {
    id: 'last-train',
    title: 'The Last Train',
    genre: 'mystery',
    logline: 'A stopped train, a stranger\'s ringing phone, and two people who have to decide what to do before it moves again.',
    synopsis: 'The last train of the night has stopped between stations. No announcement. No movement. A phone left on the seat beside you is ringing, and it hasn\'t stopped for three minutes.',
    opening: "The last train of the night has stopped. No announcement. No movement. Then you notice a phone on the seat next to you — and it's ringing.",
    initialState: { danger: 25, trust: 15, mystery: 60, chaos: 10 },
    runtime: '9–11 min',
    toneTags: ['tense', 'nocturnal', 'slow-burn'],
    castA: { name: 'You', role: 'the one who noticed the phone first', want: 'to get home without whatever this is following you' },
    castB: { name: 'The stranger in carriage four', role: 'someone who got on two stops after you', want: 'answers, even if they cost something' },
    grade: { accent: '#C9A24B', accentSoft: 'rgba(201,162,75,0.16)', ink: '#0B0D10', paper: '#EDE6D6' },
  },
  {
    id: 'locked-room',
    title: 'The Locked Room',
    genre: 'mystery',
    logline: 'You wake up in a hotel room you don\'t remember booking, and the mirror already knows your name.',
    synopsis: 'You wake up in a hotel room you don\'t remember booking. The door is unlocked. Your wallet is on the table, untouched. But the mirror has a message written on it in marker, and it wasn\'t there when you fell asleep.',
    opening: "You wake up in a hotel room you don't remember booking. The door is unlocked. Your wallet is on the table. But the mirror has a message written on it in marker.",
    initialState: { danger: 30, trust: 10, mystery: 70, chaos: 15 },
    runtime: '9–11 min',
    toneTags: ['paranoid', 'claustrophobic', 'twisty'],
    castA: { name: 'You', role: 'the one who woke up here', want: 'to remember last night before someone else fills in the blanks' },
    castB: { name: 'The voice on the phone', role: 'someone who already knows what happened', want: 'to see how much you\'ll figure out on your own' },
    grade: { accent: '#B08D57', accentSoft: 'rgba(176,141,87,0.16)', ink: '#0A0A0D', paper: '#E9E2D3' },
  },
  {
    id: 'missing-message',
    title: 'The Missing Message',
    genre: 'mystery',
    logline: 'Your phone buzzes with a warning from your own number — one you never sent.',
    synopsis: 'Your phone buzzes. A message from your own number: "Don\'t go home tonight." You check the sent folder. You definitely didn\'t send it. And whoever did knows exactly where you live.',
    opening: 'Your phone buzzes. A message from your own number: "Don\'t go home tonight." You check — you definitely didn\'t send it.',
    initialState: { danger: 40, trust: 10, mystery: 65, chaos: 20 },
    runtime: '9–11 min',
    toneTags: ['urgent', 'paranoid', 'contemporary'],
    castA: { name: 'You', role: 'the one who got the message', want: 'to find out who sent it before tonight ends' },
    castB: { name: 'The person who also got it', role: 'someone with the exact same message, sent the exact same minute', want: 'to figure out what the two of you have in common' },
    grade: { accent: '#C46A4E', accentSoft: 'rgba(196,106,78,0.16)', ink: '#0B0A0C', paper: '#EDE4D8' },
  },

  // HORROR
  {
    id: 'empty-apartment',
    title: 'The Empty Apartment',
    genre: 'horror',
    logline: 'You hear footsteps from the apartment above yours. You live on the top floor.',
    synopsis: 'It\'s 11 PM. You hear footsteps from the apartment above yours — clear, heavy, deliberate. But you live on the top floor. There is nothing above you. There never has been.',
    opening: "It's 11 PM. You hear footsteps from the apartment above yours. Clear, heavy footsteps. But you live on the top floor.",
    initialState: { danger: 55, trust: 10, mystery: 50, chaos: 15 },
    runtime: '8–10 min',
    toneTags: ['dread', 'domestic', 'quiet'],
    castA: { name: 'You', role: 'the one who heard it first', want: 'to convince yourself it\'s nothing before you have to act like it\'s something' },
    castB: { name: 'The neighbour on the phone', role: 'the only other person awake in the building', want: 'to not be the one who goes up there alone' },
    grade: { accent: '#8E2F2F', accentSoft: 'rgba(142,47,47,0.18)', ink: '#08090A', paper: '#E3DCD2' },
  },
  {
    id: '3-17-am',
    title: '3:17 AM',
    genre: 'horror',
    logline: 'Every night this week, at exactly 3:17, something knocks three times. Tonight you\'re ready.',
    synopsis: 'Every night this week, at exactly 3:17 AM, someone knocks on your door. Three knocks. Always three. Tonight you\'re not going to pretend you\'re asleep.',
    opening: "Every night this week, at exactly 3:17 AM, someone knocks on your door. Three knocks. Always three. Tonight you're ready.",
    initialState: { danger: 60, trust: 5, mystery: 55, chaos: 20 },
    runtime: '8–10 min',
    toneTags: ['dread', 'ritual', 'tight'],
    castA: { name: 'You', role: 'the one who\'s been counting the nights', want: 'to make it stop, whatever that takes' },
    castB: { name: 'The person one room over', role: 'the one who insists they haven\'t heard anything', want: 'to keep pretending, for both your sakes' },
    grade: { accent: '#9C3B3B', accentSoft: 'rgba(156,59,59,0.18)', ink: '#09090B', paper: '#E4DCD0' },
  },

  // ROMANCE
  {
    id: 'last-day-chennai',
    title: 'Last Day in Chennai',
    genre: 'romance',
    logline: 'You\'re leaving tomorrow morning. Then a message arrives from someone you haven\'t spoken to in three years.',
    synopsis: 'You\'re leaving Chennai tomorrow morning. You\'ve already packed, already said your goodbyes. Then your phone lights up — a message from someone you haven\'t talked to in three years, and neither of you has ever really explained why.',
    opening: "You're leaving Chennai tomorrow morning. You've already packed. Then your phone lights up — a message from someone you haven't talked to in three years.",
    initialState: { danger: 5, trust: 30, mystery: 20, chaos: 10 },
    runtime: '10–12 min',
    toneTags: ['slow-burn', 'bittersweet', 'monsoon'],
    castA: { name: 'You', role: 'the one who\'s leaving', want: 'one honest conversation before the flight' },
    castB: { name: 'The one who messaged first', role: 'the one who let three years pass in silence', want: 'to say the thing they never said, if there\'s still time' },
    grade: { accent: '#C97B93', accentSoft: 'rgba(201,123,147,0.16)', ink: '#100A0D', paper: '#F1E4E4' },
  },
  {
    id: 'wrong-train',
    title: 'The Wrong Train',
    genre: 'romance',
    logline: 'A stranger asks if this is the Andheri train. It isn\'t. Neither of you moves.',
    synopsis: 'You sit down on the train. The person next to you looks at the route map, then at you. "This isn\'t the Andheri train, is it?" It isn\'t. Neither of you gets off at the next stop.',
    opening: "You sit down on the train. The person next to you looks at the route map, then at you. \"This isn't the Andheri train, is it?\" It isn't. Neither of you moves.",
    initialState: { danger: 5, trust: 35, mystery: 15, chaos: 15 },
    runtime: '9–11 min',
    toneTags: ['warm', 'meet-cute', 'city-night'],
    castA: { name: 'You', role: 'the one who\'s definitely on the wrong train now', want: 'to keep talking to this person for as long as the excuse lasts' },
    castB: { name: 'The stranger with the wrong map', role: 'someone who might not actually be lost', want: 'to find out if you\'ll admit you\'re not lost either' },
    grade: { accent: '#CE8A5E', accentSoft: 'rgba(206,138,94,0.16)', ink: '#0F0B0A', paper: '#F0E5D8' },
  },

  // ADVENTURE
  {
    id: 'the-island',
    title: 'The Island',
    genre: 'adventure',
    logline: 'Your boat reaches an island that\'s on no map. Someone has already built a dock.',
    synopsis: 'Your boat reaches a small island. It\'s not on Google Maps. Not on any map. But someone has built a wooden dock, and there\'s a light coming from somewhere inside the trees.',
    opening: "Your boat reaches a small island. It's not on Google Maps. Not on any map. But someone has built a wooden dock — and there's a light coming from inside the trees.",
    initialState: { danger: 30, trust: 20, mystery: 55, chaos: 15 },
    runtime: '10–12 min',
    toneTags: ['exploratory', 'humid', 'wonder'],
    castA: { name: 'You', role: 'the one who insisted on coming ashore', want: 'to find out who built that dock' },
    castB: { name: 'Your co-pilot', role: 'the one who wanted to turn back an hour ago', want: 'to get both of you off this island in one piece' },
    grade: { accent: '#3F8F72', accentSoft: 'rgba(63,143,114,0.16)', ink: '#08100D', paper: '#E3EDE3' },
  },
  {
    id: 'the-rooftop',
    title: 'The Rooftop',
    genre: 'adventure',
    logline: 'A key taped under your door opens a rooftop you\'ve never seen — and someone\'s already up there.',
    synopsis: 'You find a key taped underneath your apartment door. No note. You try every lock in your building until the last one opens onto a rooftop you\'ve never seen. Someone is already up there.',
    opening: "You find a key taped underneath your apartment door. No note. You try every lock in your building. The last one opens a door to a rooftop you've never seen — and someone is already up there.",
    initialState: { danger: 20, trust: 20, mystery: 50, chaos: 10 },
    runtime: '9–11 min',
    toneTags: ['nocturnal', 'curious', 'skyline'],
    castA: { name: 'You', role: 'the one holding the key', want: 'to know why it was left for you specifically' },
    castB: { name: 'The one already on the roof', role: 'someone who\'s clearly been waiting', want: 'to see if you\'d actually come' },
    grade: { accent: '#4A7C8C', accentSoft: 'rgba(74,124,140,0.16)', ink: '#080B0D', paper: '#E1E8EA' },
  },

  // EMOTIONAL
  {
    id: 'one-more-call',
    title: 'One More Call',
    genre: 'emotional',
    logline: 'Your battery says 3%. One person has been trying to reach you all day.',
    synopsis: 'Your phone battery says 3%. One person has been trying to reach you all day, every hour, without saying why. You have time for one call. Maybe two minutes if you\'re lucky.',
    opening: "Your phone battery says 3%. One person has been trying to reach you all day. You have time for one call. Maybe two minutes if you're lucky.",
    initialState: { danger: 10, trust: 40, mystery: 10, chaos: 5 },
    runtime: '8–10 min',
    toneTags: ['tender', 'urgent', 'quiet'],
    castA: { name: 'You', role: 'the one running out of battery', want: 'to say the right thing while there\'s still time to say it' },
    castB: { name: 'The one who kept calling', role: 'the one who\'s been trying to reach you all day', want: 'to finally get the words out before the line drops' },
    grade: { accent: '#7C8FA6', accentSoft: 'rgba(124,143,166,0.16)', ink: '#0A0B0F', paper: '#E6E7EC' },
  },
  {
    id: 'the-photograph',
    title: 'The Photograph',
    genre: 'emotional',
    logline: 'A photograph from your childhood. A stranger in it. Someone wrote "don\'t forget" on the back.',
    synopsis: 'While cleaning out your old room, you find a photograph. It\'s you, maybe eight years old, standing next to someone you don\'t recognize. On the back, in handwriting you don\'t recognize either: "Don\'t forget."',
    opening: "While cleaning out your old room, you find a photograph. It's you, maybe eight years old, with someone you don't recognize. But on the back, someone wrote: \"Don't forget.\"",
    initialState: { danger: 5, trust: 30, mystery: 40, chaos: 5 },
    runtime: '9–11 min',
    toneTags: ['nostalgic', 'gentle', 'mystery-adjacent'],
    castA: { name: 'You', role: 'the one who found the photograph', want: 'to remember who\'s standing next to you in it' },
    castB: { name: 'The person you called about it', role: 'someone who was there, even if you weren\'t supposed to know that', want: 'to decide how much of the truth you actually get' },
    grade: { accent: '#A88A5C', accentSoft: 'rgba(168,138,92,0.15)', ink: '#0C0A08', paper: '#EDE4D6' },
  },

  // COMEDY
  {
    id: 'wrong-wedding',
    title: 'Wrong Wedding',
    genre: 'comedy',
    logline: 'You walked into the wrong wedding. The uncle at the door just called you the groom.',
    synopsis: 'You walked into the wrong wedding hall. Before you could leave, the uncle at the door grabbed your arm: "The groom is here! Finally!" Everyone starts clapping. You are, technically, not the groom.',
    opening: "You walked into the wrong wedding hall. Before you could leave, the uncle at the door grabbed your arm: \"The groom is here! Finally!\" Everyone starts clapping.",
    initialState: { danger: 10, trust: 25, mystery: 15, chaos: 55 },
    runtime: '8–10 min',
    toneTags: ['absurd', 'fast', 'crowd-pleaser'],
    castA: { name: 'You', role: 'the accidental groom', want: 'to get out before anyone asks a real question' },
    castB: { name: 'The bridesmaid who noticed first', role: 'the only person here who knows you\'re not him', want: 'to decide whether to blow your cover or help you fake it' },
    grade: { accent: '#D99A2B', accentSoft: 'rgba(217,154,43,0.18)', ink: '#0D0A05', paper: '#F3E9CF' },
  },
  {
    id: 'the-mayor',
    title: 'The Mayor',
    genre: 'comedy',
    logline: 'You wake up in a strange town wearing a sash that says MAYOR. You have 47 missed calls.',
    synopsis: 'You wake up in a small town you\'ve never visited. There\'s a sash on your bed that says "MAYOR." Your phone has 47 missed calls from the town council, and a meeting starts in ten minutes.',
    opening: "You wake up in a small town you've never visited. There's a sash on your bed that says \"MAYOR.\" Your phone has 47 missed calls from the town council.",
    initialState: { danger: 10, trust: 20, mystery: 30, chaos: 60 },
    runtime: '9–11 min',
    toneTags: ['absurd', 'chaotic', 'small-town'],
    castA: { name: 'You', role: 'the accidental Mayor', want: 'to figure out how this happened without losing the job you never asked for' },
    castB: { name: 'The Deputy Mayor', role: 'the one who\'s suspiciously calm about all of this', want: 'to keep the town running, with or without your help' },
    grade: { accent: '#C7842E', accentSoft: 'rgba(199,132,46,0.18)', ink: '#0C0906', paper: '#F1E6CE' },
  },

  // SCI-FI
  {
    id: 'four-minutes',
    title: 'Four Minutes of Oxygen',
    genre: 'scifi',
    logline: 'Red lights. An alarm you\'ve never heard. Your display reads OXYGEN — 4:00. You\'re alone on Mars. You think.',
    synopsis: 'You open your eyes to red lights and an alarm you\'ve never heard before. Your helmet display reads OXYGEN — 4:00. You\'re alone on Mars. Or at least, you think you are.',
    opening: "You open your eyes. Red lights. An alarm you've never heard before. Your helmet display reads: OXYGEN — 4:00. You're alone on Mars. Or at least, you think you are.",
    initialState: { danger: 70, trust: 10, mystery: 40, chaos: 30 },
    runtime: '9–11 min',
    toneTags: ['high-stakes', 'clinical', 'countdown'],
    castA: { name: 'You', role: 'the one whose suit is failing', want: 'to make the oxygen last long enough to matter' },
    castB: { name: 'The voice on the comms', role: 'the only other crew member still responding', want: 'to get you both back to the module before the timer hits zero' },
    grade: { accent: '#4FA0C9', accentSoft: 'rgba(79,160,201,0.18)', ink: '#06080C', paper: '#DCE7EE' },
  },

  // CHAOS
  {
    id: 'the-suitcase',
    title: 'The Suitcase',
    genre: 'chaos',
    logline: 'A suitcase on the bench beside you just moved two inches. Toward you.',
    synopsis: 'You\'re waiting at the railway station. A suitcase on the bench next to you vibrates. Then it moves. About two inches. Toward you. Nobody else seems to have noticed.',
    opening: "You're waiting at the railway station. A suitcase on the bench next to you vibrates. Then it moves. About two inches. Toward you.",
    initialState: { danger: 35, trust: 15, mystery: 50, chaos: 45 },
    runtime: '8–10 min',
    toneTags: ['unhinged', 'fast', 'darkly funny'],
    castA: { name: 'You', role: 'the one sitting closest to the suitcase', want: 'to find out what\'s inside before it decides for you' },
    castB: { name: 'The stranger who sat down after it moved', role: 'someone who seems to know more about the suitcase than they\'re letting on', want: 'to get the suitcase — or get away from it, hard to say which' },
    grade: { accent: '#9450A8', accentSoft: 'rgba(148,80,168,0.18)', ink: '#0A0810', paper: '#E7E0EC' },
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

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find(s => s.id === id);
}

/**
 * Convert a `stories` DB row (custom, user-created) into the same
 * Scenario shape the engine already consumes — this is the whole trick
 * that lets custom stories run on the existing engine with no parallel
 * code path.
 */
export function storyRowToScenario(row: { id: string; title: string; genre: Scenario['genre']; seed_json: string; length_rounds: number }): Scenario {
  const seed = JSON.parse(row.seed_json) as {
    logline: string; synopsis: string; opening: string; initialState: import('./types.js').GameState;
    toneTags: string[]; castA: import('./types.js').StoryCharacter; castB: import('./types.js').StoryCharacter;
    seedFlavor: ScenarioSeed;
  };
  const lengthOption = LENGTH_OPTIONS.find(o => o.rounds === row.length_rounds);

  return {
    id: row.id,
    title: row.title,
    genre: row.genre,
    opening: seed.opening,
    initialState: seed.initialState,
    logline: seed.logline,
    synopsis: seed.synopsis,
    runtime: lengthOption?.label || `${row.length_rounds} rounds`,
    toneTags: seed.toneTags,
    castA: seed.castA,
    castB: seed.castB,
    grade: GENRE_GRADES[row.genre],
    customSeed: seed.seedFlavor,
    lengthRounds: row.length_rounds,
  };
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

export function pickWriteRound(totalRounds: number = 6): number {
  // The single free-text round lands in the last two rounds, after the
  // two players have reconverged, regardless of overall story length.
  return Math.random() < 0.5 ? totalRounds - 1 : totalRounds;
}

// ── Length options for the Custom Story creator ──

export const LENGTH_OPTIONS = [
  { label: '10 min', rounds: 6 },
  { label: '20 min', rounds: 12 },
  { label: '30 min', rounds: 20 },
] as const;

export function isValidLengthRounds(rounds: number): boolean {
  return LENGTH_OPTIONS.some(o => o.rounds === rounds);
}

// ── Per-genre color grade for custom stories (built-in stories carry
// their own hand-picked grade; custom stories reuse one per genre so
// they still look intentional without needing bespoke art direction). ──

export const GENRE_GRADES: Record<Scenario['genre'], { accent: string; accentSoft: string; ink: string; paper: string }> = {
  mystery: { accent: '#C9A24B', accentSoft: 'rgba(201,162,75,0.16)', ink: '#0B0D10', paper: '#EDE6D6' },
  horror: { accent: '#9C3B3B', accentSoft: 'rgba(156,59,59,0.18)', ink: '#09090B', paper: '#E4DCD0' },
  romance: { accent: '#C97B93', accentSoft: 'rgba(201,123,147,0.16)', ink: '#100A0D', paper: '#F1E4E4' },
  adventure: { accent: '#3F8F72', accentSoft: 'rgba(63,143,114,0.16)', ink: '#08100D', paper: '#E3EDE3' },
  emotional: { accent: '#7C8FA6', accentSoft: 'rgba(124,143,166,0.16)', ink: '#0A0B0F', paper: '#E6E7EC' },
  comedy: { accent: '#D99A2B', accentSoft: 'rgba(217,154,43,0.18)', ink: '#0D0A05', paper: '#F3E9CF' },
  scifi: { accent: '#4FA0C9', accentSoft: 'rgba(79,160,201,0.18)', ink: '#06080C', paper: '#DCE7EE' },
  chaos: { accent: '#9450A8', accentSoft: 'rgba(148,80,168,0.18)', ink: '#0A0810', paper: '#E7E0EC' },
};
