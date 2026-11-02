import aboutPhotoImg from './assets/about.jpg';

export const CONFIG = {
  date: '2026-12-20T09:00:00+05:30',
  registerEndpoint: '',
  externalRegisterUrl: '',
  leaderboardEndpoint: '',
  aboutPhoto: aboutPhotoImg,
  teamSize: '1–4 operatives',
  eligibility: 'Open to all students and professionals',
  scoring: 'Dynamic points per flag; first blood bonus',
  stages: [
    ['RECONNAISSANCE', 'Map the surface. Every open door leaves a footprint.'],
    ['ENUMERATION', 'Name what you found. Services, users, versions, mistakes.'],
    ['EXPLOITATION', 'Turn a weakness into a way in.'],
    ['INVESTIGATION', 'Follow the trace. Logs, memory, disk, metadata.'],
    ['FLAG CAPTURE', 'Submit the string. The network remembers.']
  ],
  domains: [
    ['Web Exploitation', 'Injection, broken auth, logic flaws.', 'M10 10h50v50H10zM10 25h50M22 17h1'],
    ['Cryptography', 'Ciphers, keys and broken math.', 'M20 40a15 15 0 1 1 30 0M10 40h50v20H10z'],
    ['Digital Forensics', 'Disks, memory and packet captures.', 'M35 10a25 25 0 1 0 0 50 25 25 0 0 0 0-50M20 35h30M35 20v30'],
    ['Reverse Engineering', 'Take the binary apart.', 'M10 60l20-50 10 25 20-25v50'],
    ['Binary Exploitation', 'Memory, stacks and shellcode.', 'M10 10h20v20H10zM40 10h20v20H40zM10 40h20v20H10zM40 40h20v20'],
    ['OSINT', 'Public traces, private answers.', 'M35 35m-8 0a8 8 0 1 0 16 0 8 8 0 1 0-16 0M5 35c15-25 45-25 60 0-15 25-45 25-60 0'],
    ['Steganography', 'Data hidden inside data.', 'M10 10h50v50H10zM18 18h14v14H18zM38 38h14v14H38z'],
    ['Miscellaneous', 'Everything that does not fit.', 'M35 8l8 20 20 7-20 7-8 20-8-20-20-7 20-7z']
  ],
  board: [
    ['0xGh0st', 'NullByte', 14, 4210],
    ['v0idwalker', 'Kernel Panic', 13, 3980],
    ['r00tless', 'Kernel Panic', 12, 3720],
    ['cipherfox', 'Dead Drop', 11, 3105],
    ['stack_smash', 'Dead Drop', 9, 2650],
    ['pwnlet', 'Ghost Shell', 8, 2310]
  ],
  timeline: [
    ['Registration opens', '2026-11-01'],
    ['Registration closes', '2026-12-15'],
    ['Competition begins', '2026-12-20'],
    ['Final flag submission', '2026-12-21'],
    ['Results announced', '2026-12-22'],
    ['Awards ceremony', '2026-12-23']
  ],
  prizes: [
    ['1st', '₹15,000'],
    ['2nd', '₹9,000'],
    ['3rd', '₹6,000'],
    ['Special recognition', 'First blood & best writeup']
  ],
  faq: [
    ['What is OBSCURA?', 'A capture-the-flag competition. You solve security puzzles and submit hidden flags for points.'],
    ['Who can participate?', 'CONFIG.eligibility'],
    ['Do I need CTF experience?', 'No. Challenges range from beginner to expert.'],
    ['Can I play individually?', 'Yes. Team size: CONFIG.teamSize'],
    ['What tools are allowed?', 'Any tool you can legally run. Attacking the platform or other teams is banned.'],
    ['How are flags submitted?', 'Paste the flag string into the CTF platform. Correct flags score instantly.'],
    ['How does scoring work?', 'CONFIG.scoring'],
    ['Is there a registration fee?', 'Set by the organizers. Check the registration panel.']
  ],
  sponsors: ['SPONSOR_01', 'SPONSOR_02', 'PARTNER_01', 'PARTNER_02', 'ORGANIZER']
};

export const TI = [
  [
    'Gold',
    '10K',
    '',
    [
      'Logo on posters',
      'Logo on Banners',
      'Logo on Event Merchandise',
      'Logo on event emails',
      'Logo on Volunteer Tshirts',
      'Special mention in inaugural and closing ceremonies',
      'Logo on Delegate Certificates',
      'Survey from participants'
    ]
  ],
  [
    'Platinum',
    '15K',
    'pl',
    [
      'Logo on posters',
      'Logo on Banners',
      'Logo on Event Merchandise',
      'Logo on event emails',
      'Exclusive talk/Interaction with participants',
      'Logo on Volunteer Tshirts',
      'Special mention in inaugural and closing ceremonies',
      'Logo on Delegate Certificates',
      'Exclusive stall space for brand promotion at the venue',
      'Survey from participants'
    ]
  ],
  [
    'Silver',
    '5k',
    '',
    [
      'Logo on posters',
      'Logo on Banners',
      'Logo on Event Merchandise',
      'Logo on event emails'

    ]
  ]
];

export const SPONSOR_DELIVERABLES = [
  { item: 'Logo on posters', platinum: true, gold: true, silver: true },
  { item: 'Logo on Banners', platinum: true, gold: true, silver: true },
  { item: 'Logo on Event Merchandise', platinum: true, gold: true, silver: true },
  { item: 'Logo on event emails', platinum: true, gold: true, silver: true },
  { item: 'Exclusive talk/Interaction with participants', platinum: true, gold: false, silver: false },
  { item: 'Logo on Volunteer Tshirts', platinum: true, gold: true, silver: false },
  { item: 'Special mention in inaugural and closing ceremonies', platinum: true, gold: true, silver: false },
  { item: 'Logo on Delegate Certificates', platinum: true, gold: true, silver: false },
  { item: 'Exclusive stall space for brand promotion at the venue', platinum: true, gold: false, silver: false },
  { item: 'Survey from participants', platinum: true, gold: true, silver: false },
  { item: 'Package', platinum: '15K', gold: '10K', silver: '5k', isPackage: true }
];

export const HX = '0123456789ABCDEF@#$%&*<>/';
export const sc = (n) => Array.from({ length: n }, () => HX[(Math.random() * HX.length) | 0]).join('');
export const decrypt = (t, p) =>
  [...t].map((c, i) => (c === ' ' ? c : i / t.length < p ? c : HX[(Math.random() * HX.length) | 0])).join('');

