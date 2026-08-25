import type { FallbackBeat } from './types.js';

// ── Deterministic fallback beats for when AI generation fails ──
// Each scenario has 6 rounds of pre-written content.
// These ensure the game NEVER breaks, even without AI.

type FallbackMap = Record<string, FallbackBeat[]>;

export const FALLBACKS: FallbackMap = {
  'last-train': [
    {
      scene: "The phone keeps ringing. The screen shows a name you don't recognize. The other passengers pretend not to notice.",
      choices: ['Answer it', 'Check who it is first', 'Leave it ringing'],
      stateDelta: { danger: 5, trust: 0, mystery: 10, chaos: 0 },
    },
    {
      scene: "The train lurches forward, then stops again. The lights flicker. Someone at the end of the carriage stands up.",
      choices: ['Walk toward them', 'Stay in your seat', 'Move to another carriage'],
      stateDelta: { danger: 10, trust: -5, mystery: 5, chaos: 5 },
    },
    {
      scene: "You notice the emergency exit has been opened slightly. Cold air is coming in. The person who stood up is gone.",
      choices: ['Look outside', 'Close the exit', 'Alert the other passengers'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 0 },
    },
    {
      scene: "Through the window, you see someone standing on the tracks, looking directly at you.",
      writePrompt: 'What do you say?',
      choices: [],
      stateDelta: { danger: 10, trust: 0, mystery: 5, chaos: 5 },
    },
    {
      scene: "The train starts moving again. Slowly. The person on the tracks doesn't move. But the phone on your seat buzzes one more time.",
      choices: ['Read the message', 'Throw the phone out', 'Show it to someone'],
      stateDelta: { danger: 5, trust: 5, mystery: 5, chaos: 5 },
    },
    {
      scene: "The message is an address. Your address. The train is heading exactly there. The last stop is in two minutes.",
      choices: ['Get off at the next stop', 'Stay on until the end', 'Call the number back'],
      stateDelta: { danger: 10, trust: -5, mystery: 10, chaos: 5 },
    },
  ],

  'locked-room': [
    {
      scene: "The mirror says: \"CHECK OUT IS AT 6 AM.\" It's 5:47. Your phone is dead. Someone left a charger on the nightstand.",
      choices: ['Plug in and check your phone', 'Leave immediately', 'Look for more clues'],
      stateDelta: { danger: 5, trust: 0, mystery: 10, chaos: 0 },
    },
    {
      scene: "Your phone turns on. You have 14 missed calls from a number you don't recognize. And one text: \"Don't open the bathroom door.\"",
      choices: ['Open the bathroom door anyway', 'Call the number back', 'Pack up and leave'],
      stateDelta: { danger: 10, trust: -5, mystery: 10, chaos: 5 },
    },
    {
      scene: "You hear water running in the bathroom. It wasn't running a minute ago. The door handle is warm.",
      choices: ['Open it slowly', 'Block the door with a chair', 'Knock first'],
      stateDelta: { danger: 10, trust: 0, mystery: 5, chaos: 5 },
    },
    {
      scene: "The bathroom is empty. But the mirror has a new message: \"Wrong room.\" The water stops.",
      writePrompt: 'What do you do next?',
      choices: [],
      stateDelta: { danger: 5, trust: 0, mystery: 10, chaos: 0 },
    },
    {
      scene: "You step into the hallway. Every door on this floor is open. Except one — room 313. A key card is on the floor in front of it.",
      choices: ['Use the key card', 'Go to the lobby', 'Knock on 313'],
      stateDelta: { danger: 10, trust: -5, mystery: 5, chaos: 5 },
    },
    {
      scene: "Room 313 is identical to yours. Same layout. Same charger. Same wallet. But the name on the ID is not yours.",
      choices: ['Take the ID', 'Leave everything and run', 'Wait for whoever stays here'],
      stateDelta: { danger: 10, trust: 0, mystery: 10, chaos: 5 },
    },
  ],

  'missing-message': [
    {
      scene: "You try to reply to the message. It fails — \"number not reachable.\" Then a second message arrives: \"They're watching the front.\"",
      choices: ['Look outside', 'Turn off your phone', 'Reply again'],
      stateDelta: { danger: 10, trust: 0, mystery: 10, chaos: 5 },
    },
    {
      scene: "Outside, a car you don't recognize is parked across the street with its lights on. It's been there since you looked.",
      choices: ['Go outside and confront them', 'Call a friend', 'Leave through the back'],
      stateDelta: { danger: 10, trust: 5, mystery: 5, chaos: 5 },
    },
    {
      scene: "A third message arrives: \"The back door is open. That's not normal.\" You check — it is open. You definitely locked it.",
      choices: ['Close and lock it', 'Go through it', 'Set up something to block it'],
      stateDelta: { danger: 10, trust: -5, mystery: 10, chaos: 5 },
    },
    {
      scene: "Your phone rings. It's the unknown number. This time it connects.",
      writePrompt: 'What do you say?',
      choices: [],
      stateDelta: { danger: 5, trust: 5, mystery: 5, chaos: 0 },
    },
    {
      scene: "The voice on the other end is yours. Exact same voice. It says: \"I know this is confusing. But you need to leave in the next two minutes.\"",
      choices: ['Listen to the instructions', 'Hang up', 'Demand answers first'],
      stateDelta: { danger: 10, trust: 0, mystery: 10, chaos: 10 },
    },
    {
      scene: "Two minutes pass. Nothing happens. Then every light in your house turns off at once. Your phone shows one final message: \"Too late. Or not. Depends on what you do next.\"",
      choices: ['Stay completely still', 'Run out the front door', 'Use your phone flashlight and search the house'],
      stateDelta: { danger: 15, trust: 0, mystery: 10, chaos: 10 },
    },
  ],

  'empty-apartment': [
    {
      scene: "The footsteps stop directly above your bedroom. Then something drags across the floor. Slowly.",
      choices: ['Go upstairs to check', 'Call a neighbour', 'Make noise to scare them'],
      stateDelta: { danger: 10, trust: 0, mystery: 5, chaos: 5 },
    },
    {
      scene: "You step into the hallway. The stairwell light is already on. Someone left a shoe on the top step.",
      choices: ['Pick up the shoe', 'Go up anyway', 'Go back inside and lock the door'],
      stateDelta: { danger: 5, trust: 0, mystery: 10, chaos: 0 },
    },
    {
      scene: "The top floor landing has a door you've never noticed before. It's slightly open. You can hear breathing.",
      choices: ['Push the door open', 'Call out', 'Back away slowly'],
      stateDelta: { danger: 10, trust: -5, mystery: 10, chaos: 5 },
    },
    {
      scene: "Inside is a mattress, a lamp, and a half-eaten plate of food. Someone has been living here. They're not here now.",
      writePrompt: 'What do you do?',
      choices: [],
      stateDelta: { danger: 5, trust: 0, mystery: 10, chaos: 5 },
    },
    {
      scene: "You hear the front door of the building close. Heavy footsteps on the stairs. Coming up.",
      choices: ['Hide in the room', 'Go down to meet them', 'Find another exit'],
      stateDelta: { danger: 15, trust: 0, mystery: 5, chaos: 10 },
    },
    {
      scene: "It's a teenager. Headphones on, backpack, keys in hand. They see you and freeze. \"You're not supposed to be here,\" they say quietly.",
      choices: ['Ask them who they are', 'Help them', 'Leave without a word'],
      stateDelta: { danger: -5, trust: 10, mystery: 5, chaos: 0 },
    },
  ],

  '3-17-am': [
    {
      scene: "Tonight you're sitting by the door with the lights off. 3:16. One minute. Your heart is racing.",
      choices: ['Open the door before they knock', 'Wait for the knock', 'Set up your phone camera'],
      stateDelta: { danger: 10, trust: 0, mystery: 10, chaos: 0 },
    },
    {
      scene: "Three knocks. Exactly three. But this time, there's a fourth — quiet, hesitant, like they're not sure.",
      choices: ['Open it now', 'Ask who it is', 'Knock back'],
      stateDelta: { danger: 10, trust: 0, mystery: 5, chaos: 5 },
    },
    {
      scene: "Silence. Then a piece of paper slides under the door. It says: \"I know you're awake.\"",
      choices: ['Slide a note back', 'Rip open the door', 'Read it again'],
      stateDelta: { danger: 5, trust: 0, mystery: 10, chaos: 5 },
    },
    {
      scene: "You open the door. The hallway is empty. But the elevator at the end is going down. The number is counting: 3... 2... 1... B.",
      writePrompt: 'What do you do?',
      choices: [],
      stateDelta: { danger: 10, trust: 0, mystery: 10, chaos: 5 },
    },
    {
      scene: "In the basement, you find an old chair facing the wall. On the wall is a calendar with every date crossed out except today. And tomorrow.",
      choices: ['Take the calendar', 'Sit in the chair', 'Go back upstairs'],
      stateDelta: { danger: 10, trust: 0, mystery: 15, chaos: 5 },
    },
    {
      scene: "Back in your apartment, your clock reads 3:17 again. But it's definitely been longer than that. The knocking starts — but this time it's coming from inside.",
      choices: ['Follow the sound', 'Leave the apartment', 'Close your eyes and wait'],
      stateDelta: { danger: 15, trust: 0, mystery: 10, chaos: 10 },
    },
  ],

  'last-day-chennai': [
    {
      scene: "The message is simple: \"Are you really leaving tomorrow?\" You haven't spoken to them since that night at Marina Beach.",
      choices: ['Reply honestly', 'Ask how they got your number', 'Ignore it'],
      stateDelta: { danger: 0, trust: 10, mystery: 0, chaos: 0 },
    },
    {
      scene: "They reply: \"Meet me at the filter coffee place near Besant Nagar. 30 minutes.\" It's already 10 PM. Your flight is at 6 AM.",
      choices: ['Go', 'Say it\'s too late', 'Suggest somewhere closer'],
      stateDelta: { danger: 0, trust: 10, mystery: 5, chaos: 5 },
    },
    {
      scene: "You're there. They're already sitting in the corner, two coffees already ordered. They smile, but their eyes look tired.",
      choices: ['Sit down and say nothing first', 'Ask why they texted tonight', 'Apologize for everything'],
      stateDelta: { danger: 0, trust: 15, mystery: 0, chaos: 0 },
    },
    {
      scene: "\"I didn't text you to fix things,\" they say. \"I just didn't want you to leave without...\" They stop.",
      writePrompt: 'What do you say?',
      choices: [],
      stateDelta: { danger: 0, trust: 10, mystery: 0, chaos: 0 },
    },
    {
      scene: "The coffee shop is closing. The owner starts putting chairs up. You both step outside. The street is empty. Chennai is quieter than you've ever heard it.",
      choices: ['Walk them home', 'Ask them to come to the airport', 'Say goodbye here'],
      stateDelta: { danger: 0, trust: 10, mystery: 0, chaos: 0 },
    },
    {
      scene: "You're standing at the corner where you'd have to go different ways. Your phone buzzes — cab is 3 minutes away. Three years of silence, and all you have is three minutes.",
      choices: ['Stay until the cab comes', 'Cancel the cab', 'Give them something to remember you by'],
      stateDelta: { danger: 0, trust: 15, mystery: 0, chaos: 0 },
    },
  ],

  'wrong-train': [
    {
      scene: "\"So where were you actually going?\" they ask. You check Google Maps. You're heading in the exact opposite direction.",
      choices: ['Tell them honestly', 'Make up somewhere interesting', 'Ask where they were going first'],
      stateDelta: { danger: 0, trust: 10, mystery: 0, chaos: 5 },
    },
    {
      scene: "\"We could get off at the next station,\" they say. The next station is 40 minutes away. Neither of you has moved.",
      choices: ['Suggest staying on', 'Agree to get off', 'Ask their name first'],
      stateDelta: { danger: 0, trust: 10, mystery: 5, chaos: 0 },
    },
    {
      scene: "The train stops at a station you've never heard of. It's tiny — one bench, one light. \"Want to explore?\" they ask.",
      choices: ['Get off together', 'Stay on and wait', 'Dare them to get off first'],
      stateDelta: { danger: 5, trust: 10, mystery: 5, chaos: 5 },
    },
    {
      scene: "You're both standing on a platform at a station that might not even have a name. The last train in the other direction is in 20 minutes.",
      writePrompt: 'What do you say to them?',
      choices: [],
      stateDelta: { danger: 0, trust: 10, mystery: 0, chaos: 0 },
    },
    {
      scene: "They show you something on their phone — a photo from years ago of this exact station. \"I've been here before,\" they say. \"In a dream.\"",
      choices: ['Believe them', 'Laugh it off', 'Show them something from your phone too'],
      stateDelta: { danger: 0, trust: 10, mystery: 10, chaos: 0 },
    },
    {
      scene: "The other train arrives. It's the last one. You both have to decide now. They look at you and say: \"I don't usually do this.\"",
      choices: ['Neither do I. Get on the train.', 'Stay a little longer', 'Exchange numbers and go'],
      stateDelta: { danger: 0, trust: 15, mystery: 0, chaos: 0 },
    },
  ],

  'the-island': [
    {
      scene: "The dock is old but solid. Beyond the trees, you can hear something — maybe a generator. Maybe something else.",
      choices: ['Follow the sound', 'Stay near the boat', 'Call out and see if anyone responds'],
      stateDelta: { danger: 5, trust: 0, mystery: 10, chaos: 0 },
    },
    {
      scene: "There's a path through the trees, lit with small solar lamps. Someone maintains this place. At the end of the path: a small cabin with the door open.",
      choices: ['Go inside', 'Look through the window first', 'Go around to the back'],
      stateDelta: { danger: 5, trust: 0, mystery: 10, chaos: 5 },
    },
    {
      scene: "The cabin has a radio, a logbook, and a map of the island. The map shows a red X on the other side. The logbook's last entry is from yesterday.",
      choices: ['Read the logbook', 'Head to the red X', 'Try the radio'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 0 },
    },
    {
      scene: "You hear a boat engine. Your boat is still at the dock — this is a different one. Coming from the other side of the island.",
      writePrompt: 'What do you do?',
      choices: [],
      stateDelta: { danger: 10, trust: 0, mystery: 5, chaos: 5 },
    },
    {
      scene: "A woman steps off the other boat. She sees you and doesn't look surprised at all. \"You found it,\" she says. \"Good. We don't have much time.\"",
      choices: ['Ask what she means', 'Follow her', 'Refuse to go anywhere'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 5 },
    },
    {
      scene: "She leads you to the red X on the map. It's a clearing with a metal hatch in the ground. \"This is why the island isn't on any map,\" she says. \"Now — do we open it or leave?\"",
      choices: ['Open the hatch', 'Leave the island immediately', 'Ask her what\'s down there first'],
      stateDelta: { danger: 10, trust: 5, mystery: 15, chaos: 5 },
    },
  ],

  'the-rooftop': [
    {
      scene: "The rooftop has a table, two chairs, fairy lights, and a telescope. Someone set this up on purpose. The person standing there turns around.",
      choices: ['Ask who they are', 'Sit down', 'Hold up the key'],
      stateDelta: { danger: 0, trust: 10, mystery: 10, chaos: 0 },
    },
    {
      scene: "\"I've been waiting for someone to find the key,\" they say. \"It took three months.\" They pour two cups of chai from a thermos.",
      choices: ['Take the chai', 'Ask why they left the key', 'Ask how they know you\'d find it'],
      stateDelta: { danger: 0, trust: 15, mystery: 5, chaos: 0 },
    },
    {
      scene: "Through the telescope, you can see into an apartment across the street. Someone is waving — directly at your rooftop. Like they've been waiting too.",
      choices: ['Wave back', 'Look more carefully', 'Tell the stranger about it'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 5 },
    },
    {
      scene: "The stranger shows you a notebook filled with sketches of the city skyline — drawn from this exact spot, over months. \"This is the only place where the city makes sense,\" they say.",
      writePrompt: 'What do you say?',
      choices: [],
      stateDelta: { danger: 0, trust: 10, mystery: 5, chaos: 0 },
    },
    {
      scene: "A message arrives on your phone from the person in the apartment across the street: \"Ask them about the painting.\" There's a covered canvas leaning against the wall you hadn't noticed.",
      choices: ['Uncover the painting', 'Ask the stranger about it', 'Show them the message'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 5 },
    },
    {
      scene: "Under the cover is a painting of this rooftop — but with dozens of people on it. All looking up at the sky. The stranger says: \"It hasn't happened yet. But it will.\"",
      choices: ['Stay for whatever is coming', 'Leave and take the key', 'Invite someone else up'],
      stateDelta: { danger: 5, trust: 10, mystery: 10, chaos: 0 },
    },
  ],

  'one-more-call': [
    {
      scene: "3%. The phone could die any second. One missed call — from the person you've been avoiding. One unread message from your best friend: \"Call me. Urgent.\"",
      choices: ['Call the person you\'ve been avoiding', 'Call your best friend', 'Text them both instead'],
      stateDelta: { danger: 0, trust: 10, mystery: 0, chaos: 5 },
    },
    {
      scene: "The phone connects. You can hear them breathing. They were waiting. \"I didn't think you'd call,\" they say.",
      choices: ['Say what you need to say', 'Let them speak first', 'Ask if they\'re okay'],
      stateDelta: { danger: 0, trust: 10, mystery: 0, chaos: 0 },
    },
    {
      scene: "\"I have something to tell you,\" they say. \"I should have said it a long time ago.\" Your battery drops to 2%.",
      choices: ['Listen', 'Interrupt — say your thing first', 'Tell them the phone is dying'],
      stateDelta: { danger: 0, trust: 10, mystery: 5, chaos: 0 },
    },
    {
      scene: "They say something you didn't expect. Something honest. Something that changes how you see the last year.",
      writePrompt: 'What do you say back?',
      choices: [],
      stateDelta: { danger: 0, trust: 15, mystery: 0, chaos: 0 },
    },
    {
      scene: "1%. \"I have to go,\" you say. \"Wait —\" they say. The screen flickers.",
      choices: ['Say one last thing quickly', 'Just listen to whatever they\'re saying', 'Hang up to save the battery for a text'],
      stateDelta: { danger: 0, trust: 10, mystery: 0, chaos: 5 },
    },
    {
      scene: "The screen goes black. You don't know if they heard you. The room is very quiet. Your charger is in the next room.",
      choices: ['Go charge and call back', 'Sit with whatever just happened', 'Walk outside instead'],
      stateDelta: { danger: 0, trust: 10, mystery: 0, chaos: 0 },
    },
  ],

  'the-photograph': [
    {
      scene: "The photo is faded. You're standing in front of a house you don't recognize, holding hands with someone about your age. The handwriting on the back looks like your mother's.",
      choices: ['Ask your mother about it', 'Search for the house online', 'Try to remember'],
      stateDelta: { danger: 0, trust: 5, mystery: 10, chaos: 0 },
    },
    {
      scene: "The house is real. It's two streets away from where you grew up. You've walked past it hundreds of times and never noticed it.",
      choices: ['Go there now', 'Look up who lives there', 'Show the photo to someone who might know'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 0 },
    },
    {
      scene: "You're standing outside the house. It looks like nobody's lived there in years. The mailbox has a name on it — and it's your surname.",
      choices: ['Go inside', 'Check the mailbox', 'Take a photo and leave'],
      stateDelta: { danger: 5, trust: 0, mystery: 15, chaos: 0 },
    },
    {
      scene: "Inside, the living room has old furniture covered in sheets. On the wall is the same photograph — but bigger. And in this version, there are more people.",
      writePrompt: 'What do you think happened here?',
      choices: [],
      stateDelta: { danger: 0, trust: 5, mystery: 10, chaos: 0 },
    },
    {
      scene: "Behind the photo on the wall is a small safe. It's not locked. Inside: letters, another key, and a journal that starts with: \"For when you're ready.\"",
      choices: ['Read the journal', 'Take everything and leave', 'Call your family first'],
      stateDelta: { danger: 0, trust: 10, mystery: 10, chaos: 0 },
    },
    {
      scene: "The journal explains everything. The person in the photo. The house. Why nobody told you. The last page has today's date written in pencil, and below it: \"You came.\"",
      choices: ['Keep the journal', 'Put everything back exactly as it was', 'Go to the person in the photo'],
      stateDelta: { danger: 0, trust: 15, mystery: 5, chaos: 0 },
    },
  ],

  'wrong-wedding': [
    {
      scene: "\"Beta, where have you been? The baraat was supposed to start twenty minutes ago!\" An aunty throws a garland around your neck. The band starts playing.",
      choices: ['Go with it', 'Try to explain', 'Look for the actual groom'],
      stateDelta: { danger: 5, trust: 10, mystery: 0, chaos: 15 },
    },
    {
      scene: "The bride's father grabs your hand: \"Excellent! Very punctual!\" He's being sarcastic. The actual bride is walking toward you with a expression that says \"who are you?\"",
      choices: ['Whisper the truth to the bride', 'Maintain the act', 'Start walking toward the exit'],
      stateDelta: { danger: 10, trust: 0, mystery: 5, chaos: 10 },
    },
    {
      scene: "The bride looks at you, then whispers: \"You're not Rahul. But honestly? This is already going better. Just play along for five more minutes.\"",
      choices: ['Play along', 'Ask what happened to Rahul', 'Tell everyone the truth now'],
      stateDelta: { danger: 5, trust: 10, mystery: 5, chaos: 10 },
    },
    {
      scene: "The real Rahul walks in. He sees you wearing his garland. He doesn't look angry — he looks relieved.",
      writePrompt: 'What do you say to Rahul?',
      choices: [],
      stateDelta: { danger: 5, trust: 5, mystery: 5, chaos: 10 },
    },
    {
      scene: "Rahul pulls you aside: \"Listen, I need a favour. Can you be me for ten more minutes? I need to talk to someone outside. It's important.\"",
      choices: ['Help him', 'Refuse — this has gone too far', 'Negotiate — you want answers first'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 10 },
    },
    {
      scene: "The ten minutes are up. The wedding photographer wants a group photo. The bride winks at you. Rahul hasn't come back. The uncle is heading for the stage mic.",
      choices: ['Take the photo', 'Grab the mic first and come clean', 'Quietly disappear into the crowd'],
      stateDelta: { danger: 10, trust: 5, mystery: 5, chaos: 15 },
    },
  ],

  'the-mayor': [
    {
      scene: "Your phone won't stop ringing. A man in a suit is outside your door: \"Sir, the council meeting starts in 30 minutes. The road issue is getting out of hand.\"",
      choices: ['Get dressed and go', 'Ask what road issue', 'Close the door'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 10 },
    },
    {
      scene: "The town hall has a chair with your name on a gold plate. Fourteen people are staring at you expectantly. One of them says: \"Mayor, what's the decision on the bridge?\"",
      choices: ['Build the bridge', 'Ask for more information', 'Say you need time to think'],
      stateDelta: { danger: 5, trust: 10, mystery: 5, chaos: 10 },
    },
    {
      scene: "Whatever you said, half the room is clapping and the other half is furious. A reporter is taking notes. Someone hands you a coffee. It has \"MAYOR\" written on the cup.",
      choices: ['Hold a press conference', 'Sneak out the back', 'Find out who made you mayor'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 10 },
    },
    {
      scene: "You find the previous mayor's diary in the office. The last entry: \"They'll send someone to replace me. Don't trust the one with the gold pen.\" You look up — the person across from you has a gold pen.",
      writePrompt: 'What do you do?',
      choices: [],
      stateDelta: { danger: 10, trust: -5, mystery: 10, chaos: 5 },
    },
    {
      scene: "The gold-pen person smiles: \"You've read the diary. Good. Now you know this town is... complicated. But you're the mayor now. So what will it be?\"",
      choices: ['Demand the full truth', 'Accept the role', 'Resign immediately'],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 10 },
    },
    {
      scene: "It's midnight. The town is quiet. You're sitting in the mayor's chair, alone, with a stack of decisions to make and a town that somehow needs exactly you. The gold-pen person left you a note: \"Welcome to the job.\"",
      choices: ['Stay and actually be the mayor', 'Leave tonight and never come back', 'Call someone you trust to help'],
      stateDelta: { danger: 0, trust: 10, mystery: 5, chaos: 5 },
    },
  ],

  'four-minutes': [
    {
      scene: "3:47 on the oxygen display. The airlock ahead is sealed. Your suit radio crackles: static, then a voice — \"Module B. Oxygen cache. Go now.\"",
      choices: ['Run to Module B', 'Try to fix the radio first', 'Conserve oxygen and move slowly'],
      stateDelta: { danger: 10, trust: 0, mystery: 5, chaos: 5 },
    },
    {
      scene: "Module B is dark. Your helmet light shows oxygen canisters — three of them. Two are empty. One has about 8 minutes of air. The radio crackles again.",
      choices: ['Grab the canister', 'Answer the radio', 'Look for more supplies'],
      stateDelta: { danger: 5, trust: 5, mystery: 5, chaos: 5 },
    },
    {
      scene: "\"You're not alone,\" the voice says. \"Check the medical bay. And hurry — the storm hits in 6 minutes.\" Through the viewport, you can see red dust rising.",
      choices: ['Go to the medical bay', 'Seal yourself in Module B', 'Ask who is talking'],
      stateDelta: { danger: 10, trust: 5, mystery: 10, chaos: 5 },
    },
    {
      scene: "The medical bay has a cryo pod. Someone is inside. The display says: OCCUPANT STATUS — STABLE. WAKE PROTOCOL — MANUAL.",
      writePrompt: 'What do you do?',
      choices: [],
      stateDelta: { danger: 5, trust: 5, mystery: 10, chaos: 5 },
    },
    {
      scene: "The storm hits. The whole station shakes. Your oxygen is at 2 minutes. The radio voice says: \"There's an emergency shuttle under Module D. One seat.\"",
      choices: ['Go to the shuttle', 'Try to save the person in cryo', 'Split the remaining oxygen'],
      stateDelta: { danger: 15, trust: 5, mystery: 5, chaos: 10 },
    },
    {
      scene: "You reach Module D. The shuttle is there. One seat, like they said. Through the window you can see the storm is getting worse. Your oxygen beeps — 30 seconds.",
      choices: ['Take the shuttle alone', 'Broadcast your location and wait', 'Go back for the cryo pod person'],
      stateDelta: { danger: 15, trust: 10, mystery: 5, chaos: 10 },
    },
  ],

  'the-suitcase': [
    {
      scene: "The suitcase vibrates again. Stronger this time. A man on the next bench looks at it, then at you. \"That yours?\" he asks. It's not.",
      choices: ['Say yes', 'Say no', 'Open it right there'],
      stateDelta: { danger: 10, trust: 0, mystery: 10, chaos: 10 },
    },
    {
      scene: "The suitcase starts making a sound. Not a beep — more like a hum. Musical, almost. The man backs away. A kid walking by stops and stares.",
      choices: ['Pick it up', 'Call station security', 'Walk away from it'],
      stateDelta: { danger: 10, trust: 0, mystery: 10, chaos: 10 },
    },
    {
      scene: "The humming stops. For ten seconds, nothing. Then the suitcase clicks open on its own. Inside: a phone, a map, and a toy train that's moving on its own along tiny tracks.",
      choices: ['Pick up the phone', 'Follow the map', 'Take the toy train'],
      stateDelta: { danger: 5, trust: 5, mystery: 15, chaos: 5 },
    },
    {
      scene: "The phone has one contact saved: \"OWNER.\" The map leads to platform 7. The toy train is pointing in the same direction.",
      writePrompt: 'What do you do?',
      choices: [],
      stateDelta: { danger: 5, trust: 0, mystery: 10, chaos: 5 },
    },
    {
      scene: "Platform 7 has one train. No passengers. The doors are open. Inside, every seat has a suitcase. All identical. All humming.",
      choices: ['Get on the train', 'Open another suitcase', 'Call the OWNER number'],
      stateDelta: { danger: 10, trust: 0, mystery: 10, chaos: 15 },
    },
    {
      scene: "The train doors close. It starts moving. The suitcases all stop humming at once. A voice over the intercom says: \"Final destination: where you were always going.\" The phone rings.",
      choices: ['Answer the phone', 'Try to stop the train', 'Sit down and wait'],
      stateDelta: { danger: 10, trust: 5, mystery: 15, chaos: 10 },
    },
  ],
};

/**
 * Get a fallback beat for a given scenario and round number.
 * Returns a safe default if the scenario or round doesn't have a fallback.
 */
export function getFallbackBeat(scenarioId: string, roundNumber: number, isWriteRound: boolean): FallbackBeat {
  const beats = FALLBACKS[scenarioId];
  if (beats && beats[roundNumber - 1]) {
    const beat = beats[roundNumber - 1];
    if (isWriteRound) {
      return {
        scene: beat.scene,
        choices: [],
        writePrompt: beat.writePrompt || 'What do you do?',
        stateDelta: beat.stateDelta,
      };
    }
    return beat;
  }

  // Generic fallback if scenario not found
  if (isWriteRound) {
    return {
      scene: 'Something shifts. The moment feels important.',
      choices: [],
      writePrompt: 'What do you say?',
      stateDelta: { danger: 0, trust: 0, mystery: 5, chaos: 0 },
    };
  }

  return {
    scene: 'Things are getting interesting. You need to decide.',
    choices: ['Take action', 'Wait and watch', 'Try something unexpected'],
    stateDelta: { danger: 5, trust: 0, mystery: 5, chaos: 5 },
  };
}
