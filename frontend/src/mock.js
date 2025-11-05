// Mock data for CargwinNewCar website
export const mockOffers = [
  {
    id: "accord-2024",
    title: "2024 Honda Accord LX",
    msrp: 28900,
    fleet: 25800,
    savings: 3100,
    stockLeft: 1,
    image: "https://images.unsplash.com/photo-1614687153862-b0e115ebcef1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxuZXclMjBjYXJ8ZW58MHx8fHwxNzU3NDQxNzA1fDA&ixlib=rb-4.1.0&q=85",
    dealer: "City Honda, OC",
    endsAt: new Date(Date.now() + 52 * 60 * 60 * 1000), // 52 hours from now
    addonsAvg: 3445,
    lease: { 
      termMonths: 36, 
      milesPerYear: 10000, 
      dueAtSigning: 2800, 
      monthly: 310, 
      incentives: 1800 
    },
    finance: { 
      apr: 3.5, 
      termMonths: 60, 
      downPayment: 2500 
    }
  },
  {
    id: "niro-ev-2025",
    title: "2025 Kia Niro EV Wind FWD",
    msrp: 41225,
    fleet: 35500,
    savings: 5725,
    stockLeft: 3,
    image: "https://images.unsplash.com/photo-1714008384412-97137b26ab42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxjYXIlMjBzdHVkaW98ZW58MHx8fHwxNzU3NDQxNzE1fDA&ixlib=rb-4.1.0&q=85",
    dealer: "Kia of Glendale",
    endsAt: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
    addonsAvg: 3860,
    lease: { 
      termMonths: 24, 
      milesPerYear: 10000, 
      dueAtSigning: 2767, 
      monthly: 257, 
      incentives: 13825 
    },
    finance: { 
      apr: 3.4, 
      termMonths: 60, 
      downPayment: 4000 
    }
  },
  {
    id: "tacoma-2wd-2025",
    title: "2025 Toyota Tacoma 2WD SR XtraCab 6' Bed",
    msrp: 34794,
    fleet: 31950,
    savings: 2844,
    stockLeft: 2,
    image: "https://images.unsplash.com/photo-1705563666935-4d0a72709948?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxjYXIlMjBzdHVkaW98ZW58MHx8fHwxNzU3NDQxNzE1fDA&ixlib=rb-4.1.0&q=85",
    dealer: "South Bay Toyota",
    endsAt: new Date(Date.now() + 33 * 60 * 60 * 1000), // 33 hours from now
    addonsAvg: 4210,
    lease: { 
      termMonths: 33, 
      milesPerYear: 10000, 
      dueAtSigning: 1625, 
      monthly: 280, 
      incentives: 4000 
    },
    finance: { 
      apr: 4.2, 
      termMonths: 60, 
      downPayment: 3500 
    }
  },
  {
    id: "elantra-n-2024",
    title: "2024 Hyundai Elantra N",
    msrp: 33200,
    fleet: 30450,
    savings: 2750,
    stockLeft: 1,
    image: "https://images.unsplash.com/photo-1692260122105-28c26fc3c882?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxjYXIlMjBzdHVkaW98ZW58MHx8fHwxNzU3NDQxNzE1fDA&ixlib=rb-4.1.0&q=85",
    dealer: "Hyundai of West Covina",
    endsAt: new Date(Date.now() + 28 * 60 * 60 * 1000), // 28 hours from now
    addonsAvg: 3780,
    lease: { 
      termMonths: 36, 
      milesPerYear: 12000, 
      dueAtSigning: 3200, 
      monthly: 425, 
      incentives: 2000 
    },
    finance: { 
      apr: 4.9, 
      termMonths: 60, 
      downPayment: 3000 
    }
  }
];

export const mockReviews = [
  {
    id: 1,
    name: "Anna K.",
    city: "Beverly Hills",
    text: "Saved $4,200 on Camry 2024. No haggling, no add-ons — just honest pricing. Everything arranged online in 20 minutes.",
    rating: 5,
    savings: 4200,
    model: "Toyota Camry 2024"
  },
  {
    id: 2,
    name: "Michael R.",
    city: "Santa Monica", 
    text: "Was afraid to buy a car because of pushy salespeople. Here no one called until I confirmed myself. Got exactly the price I saw on the website.",
    rating: 5,
    savings: 3650,
    model: "Honda Accord 2024"
  },
  {
    id: 3,
    name: "Elena T.",
    city: "Pasadena",
    text: "Fleet offer on Prius was $5,800 lower than at the dealership near my house. No add-ons or F&I nonsense.",
    rating: 5,
    savings: 5800,
    model: "Toyota Prius 2024"
  }
];

export const mockInstagramReviews = [
  {
    id: "reel1",
    url: "https://www.instagram.com/reel/DLbaM9wRaRG/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    title: "Tesla Model 3 Purchase Review",
    thumbnail: "https://images.pexels.com/photos/720815/pexels-photo-720815.jpeg"
  },
  {
    id: "reel2", 
    url: "https://www.instagram.com/reel/DLbZqgvxFjY/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    title: "Saved $6,000 on BMW 3 Series",
    thumbnail: "https://images.pexels.com/photos/244818/pexels-photo-244818.jpeg"
  },
  {
    id: "reel3",
    url: "https://www.instagram.com/reel/DLZCZUzubvg/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA==",
    title: "No haggling, no add-ons - my experience",
    thumbnail: "https://images.pexels.com/photos/17245476/pexels-photo-17245476.jpeg"
  }
];

export const mockFAQ = [
  {
    id: 1,
    question: "Передаёте ли вы мои данные дилерам?",
    answer: "Нет, мы не передаём ваши контактные данные дилерам для обзвонов. Контакт происходит только с одним дилером после 100% согласования всех условий сделки."
  },
  {
    id: 2,
    question: "Что происходит после бронирования?",
    answer: "После бронирования мы согласовываем с вами все детали сделки. Только после вашего полного согласия вы приезжаете к дилеру и забираете полностью готовый автомобиль."
  },
  {
    id: 3,
    question: "Какие условия по кредитной истории?",
    answer: "Финальные условия финансирования зависят от вашего кредитного профиля. Мы делаем мягкую проверку (soft-check), которая не влияет на ваш кредитный балл."
  },
  {
    id: 4,
    question: "Можно ли отказаться от сделки?",
    answer: "Да, вы можете отказаться от сделки в любой момент до подписания документов у дилера. Депозит возвращается полностью."
  },
  {
    id: 5,
    question: "Что такое fleet-цены?",
    answer: "Fleet-цены — это специальные цены для корпоративных клиентов, которые обычно значительно ниже розничных. Мы предоставляем доступ к этим ценам частным покупателям."
  }
];

// FOMO counter logic - deterministic pseudo-random based on hash
export const getFOMOCounters = (dealId) => {
  const now = new Date();
  const hourSeed = `${dealId}_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < hourSeed.length; i++) {
    const char = hourSeed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Map hash to ranges
  const viewers = Math.abs(hash) % 30 + 18; // 18-47 range
  const confirmed = Math.abs(hash >> 8) % 10 + 3; // 3-12 range
  
  return { viewers, confirmed };
};