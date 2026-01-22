
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const PLAYER_SPEED = 4; // Slightly slower for more relaxing exploration
export const SCAN_DURATION = 2000;
export const SCAN_COOLDOWN_MAX = 100;
export const RHYTHM_BPM = 100; // Slower tempo for relaxation

export const ISLANDS = [
  { 
    name: 'Jungle Drum Island', 
    theme: 'Deep Percussion', 
    color: '#15803d', 
    bg: '#ecfdf5',
    difficulty: 1,
    audioFreq: 73.42, // D2
    oscType: 'sine' as OscillatorType,
    accentType: 'sawtooth' as OscillatorType
  },
  { 
    name: 'Coral Steel Drums', 
    theme: 'Mellow Steel', 
    color: '#0369a1', 
    bg: '#f0f9ff',
    difficulty: 2,
    audioFreq: 261.63, // C4
    oscType: 'triangle' as OscillatorType,
    accentType: 'sine' as OscillatorType
  },
  { 
    name: 'Volcano Bass Island', 
    theme: 'Smooth Synth', 
    color: '#b91c1c', 
    bg: '#fff1f2',
    difficulty: 3,
    audioFreq: 55.00, // A1
    oscType: 'triangle' as OscillatorType,
    accentType: 'square' as OscillatorType
  },
  { 
    name: 'Bamboo Flute Lagoon', 
    theme: 'Whispering Wood', 
    color: '#0f766e', 
    bg: '#f0fdfa',
    difficulty: 4,
    audioFreq: 523.25, // C5
    oscType: 'sine' as OscillatorType,
    accentType: 'triangle' as OscillatorType
  },
  { 
    name: 'Ruined Echo Temple', 
    theme: 'Ancient Reverb', 
    color: '#92400e', 
    bg: '#fffbeb',
    difficulty: 5,
    audioFreq: 196.00, // G3
    oscType: 'sine' as OscillatorType,
    accentType: 'sawtooth' as OscillatorType
  }
];

export const INITIAL_SCANNER_RANGE = 200;
