// Mock admin lots API
export default function handler(req, res) {
  const mockLots = [
    {
      id: 'lot-1',
      slug: '2024-honda-accord-lx-cv123',
      status: 'published',
      make: 'Honda',
      model: 'Accord',
      year: 2024,
      trim: 'LX',
      vin: '1HGCV1F30NA123456',
      drivetrain: 'FWD',
      engine: '1.5L Turbo I4',
      transmission: 'CVT',
      exteriorColor: 'White Pearl',
      interiorColor: 'Black Leather',
      msrp: 28900,
      discount: 3100,
      feesHint: 3445,
      state: 'CA',
      description: 'Новый Honda Accord 2024 года в комплектации LX. Экономичный и надежный седан с современными технологиями безопасности Honda Sensing.',
      tags: ['sedan', '2024', 'honda', 'reliable'],
      isWeeklyDrop: true,
      dropWindow: {
        start: '2025-01-13T08:00:00Z',
        end: '2025-01-19T23:59:59Z'
      },
      fomo: {
        mode: 'deterministic',
        viewers: 32,
        confirms15: 7
      },
      seo: {
        title: 'Honda Accord LX 2024 - Fleet предложение | CargwinNewCar',
        description: 'Эксклюзивное fleet-предложение на Honda Accord LX 2024. Экономия $3,100. Без допов и торгов.',
        noindex: false
      },
      images: [
        {
          id: 'img_1',
          url: 'https://images.unsplash.com/photo-1614687153862-b0e115ebcef1',
          alt: '2024 Honda Accord LX — вид спереди',
          ratio: '16:9',
          width: 1920,
          height: 1080,
          isHero: true
        }
      ],
      publishAt: null,
      createdAt: '2025-01-10T08:00:00Z',
      updatedAt: '2025-01-10T10:30:00Z',
      archivedAt: null
    },
    {
      id: 'lot-2',
      slug: '2025-kia-niro-ev-wind-ab456',
      status: 'draft',
      make: 'Kia',
      model: 'Niro EV',
      year: 2025,
      trim: 'Wind FWD',
      vin: '5XYP0DAE5RG456789',
      drivetrain: 'FWD',
      engine: 'Electric',
      transmission: 'Single-speed',
      exteriorColor: 'Gravity Gray',
      interiorColor: 'Black Cloth',
      msrp: 41225,
      discount: 5725,
      feesHint: 3860,
      state: 'CA',
      description: 'Новый электрический кроссовер Kia Niro EV 2025 года. Запас хода до 253 миль, быстрая зарядка DC и современные технологии.',
      tags: ['electric', '2025', 'kia', 'crossover', 'eco'],
      isWeeklyDrop: false,
      dropWindow: null,
      fomo: {
        mode: 'inherit'
      },
      seo: {
        title: 'Kia Niro EV Wind 2025 - Электрический кроссовер | CargwinNewCar',
        description: 'Fleet-предложение на новый Kia Niro EV 2025. Экономия $5,725. Электрический кроссовер с запасом хода 253 мили.',
        noindex: false
      },
      images: [
        {
          id: 'img_2',
          url: 'https://images.unsplash.com/photo-1714008384412-97137b26ab42',
          alt: '2025 Kia Niro EV Wind FWD — вид спереди',
          ratio: '16:9',
          width: 1920,
          height: 1080,
          isHero: true
        }
      ],
      publishAt: null,
      createdAt: '2025-01-10T09:00:00Z',
      updatedAt: '2025-01-10T09:15:00Z',
      archivedAt: null
    }
  ];

  if (req.method === 'GET') {
    // Handle filtering and pagination
    const { page = 1, limit = 20, search, status, make, year, isWeeklyDrop } = req.query;
    
    let filteredLots = [...mockLots];
    
    if (search) {
      filteredLots = filteredLots.filter(lot =>
        lot.make.toLowerCase().includes(search.toLowerCase()) ||
        lot.model.toLowerCase().includes(search.toLowerCase()) ||
        lot.vin.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status && status !== 'all') {
      filteredLots = filteredLots.filter(lot => lot.status === status);
    }
    
    if (make && make !== 'all') {
      filteredLots = filteredLots.filter(lot => lot.make === make);
    }
    
    if (year && year !== 'all') {
      filteredLots = filteredLots.filter(lot => lot.year === parseInt(year));
    }
    
    if (isWeeklyDrop && isWeeklyDrop !== 'all') {
      filteredLots = filteredLots.filter(lot => lot.isWeeklyDrop === (isWeeklyDrop === 'true'));
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLots = filteredLots.slice(startIndex, endIndex);

    res.status(200).json({
      items: paginatedLots,
      total: filteredLots.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } else if (req.method === 'POST') {
    // Create new lot
    const newLot = {
      id: `lot_${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating new lot:', newLot);

    res.status(201).json({
      ok: true,
      id: newLot.id,
      data: newLot
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}