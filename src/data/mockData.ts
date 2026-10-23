import {
  Product,
  Supplier,
  DailySale,
  StoreSettings,
  WastageRecord,
  WeatherData,
} from '../types/inventory';

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Sri Meenakshi Dairy & Provisions',
    contact: 'K. Rajasekaran',
    phone: '+91 98401 23456',
    default_lead_time: 1,
    is_primary: true,
  },
  {
    id: 'sup_2',
    name: 'Metro FMCG Wholesalers',
    contact: 'V. Sundaram',
    phone: '+91 98402 34567',
    default_lead_time: 3,
  },
  {
    id: 'sup_3',
    name: 'Golden Harvest Grains Ltd',
    contact: 'M. Prabhakar',
    phone: '+91 98403 45678',
    default_lead_time: 4,
  },
  {
    id: 'sup_4',
    name: 'FreshBake Bakery Distributors',
    contact: 'S. Anthony',
    phone: '+91 98404 56789',
    default_lead_time: 1,
  },
  {
    id: 'sup_5',
    name: 'Apex FMCG Distributors',
    contact: 'G. Narayanan',
    phone: '+91 98405 67890',
    default_lead_time: 2,
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  store_name: 'Sri Murugan Kirana & Provisions',
  owner_name: 'Muruganandham S.',
  phone: '+91 94432 87654',
  city: 'Salem, Tamil Nadu',
  service_level: 0.95,
  review_cycle_days: 3,
  expiry_buffer: 0.2, // 20% shelf life buffer
  budget_cap: null,
  currency: '₹',
  week_start: 'monday',
};

export const INITIAL_WEATHER: WeatherData = {
  city: 'Salem, Tamil Nadu',
  temp_c: 32,
  condition: 'Passing Thunderstorms',
  rain_probability: 65,
  humidity: 78,
  retail_impact:
    'High afternoon humidity and thunderstorm forecast. Hot beverage sales (Tea, Coffee) and emergency umbrellas surge +25%; dairy shelf-life vulnerable if unchilled.',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p_milk',
    sku: 'DAI-MILK-500',
    name: 'Amul Taaza Homogenised Milk 500ml',
    category: 'Dairy & Bakery',
    unit: 'pouches',
    stock_on_hand: 8, // Stocks out in hours!
    in_transit: 0,
    supplier_id: 'sup_1',
    supplier_name: 'Sri Meenakshi Dairy & Provisions',
    lead_time_days: 1,
    shelf_life_days: 2, // Perishable!
    cost_price: 27,
    selling_price: 30,
    moq: 24,
    pack_size: 12,
    demand_multiplier: 1.0,
    batches: [{ qty: 8, expiry_date: '2026-10-24' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-22',
  },
  {
    id: 'p_curd',
    sku: 'DAI-DAHI-400',
    name: 'Amul Masti Dahi Pouch 400g',
    category: 'Dairy & Bakery',
    unit: 'pouches',
    stock_on_hand: 5,
    in_transit: 0,
    supplier_id: 'sup_1',
    supplier_name: 'Sri Meenakshi Dairy & Provisions',
    lead_time_days: 1,
    shelf_life_days: 4,
    cost_price: 32,
    selling_price: 36,
    moq: 10,
    pack_size: 10,
    demand_multiplier: 1.0,
    batches: [{ qty: 5, expiry_date: '2026-10-26' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-21',
  },
  {
    id: 'p_bread',
    sku: 'BAK-BREAD-400',
    name: 'Modern White Bread Sliced 400g',
    category: 'Dairy & Bakery',
    unit: 'loaves',
    stock_on_hand: 4,
    in_transit: 0,
    supplier_id: 'sup_4',
    supplier_name: 'FreshBake Bakery Distributors',
    lead_time_days: 1,
    shelf_life_days: 3,
    cost_price: 38,
    selling_price: 45,
    moq: 12,
    pack_size: 6,
    demand_multiplier: 1.0,
    batches: [{ qty: 4, expiry_date: '2026-10-25' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-22',
  },
  {
    id: 'p_maggi',
    sku: 'SNK-MAGGI-70',
    name: 'Maggi 2-Minute Masala Noodles 70g',
    category: 'Snacks & Confectionery',
    unit: 'packs',
    stock_on_hand: 14,
    in_transit: 0,
    supplier_id: 'sup_2',
    supplier_name: 'Metro FMCG Wholesalers',
    lead_time_days: 2,
    shelf_life_days: 240,
    cost_price: 12,
    selling_price: 14,
    moq: 48,
    pack_size: 24,
    demand_multiplier: 1.15, // Rainy day demand spike
    batches: [{ qty: 14, expiry_date: '2027-04-15' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-18',
  },
  {
    id: 'p_atta',
    sku: 'GRO-ATTA-5KG',
    name: 'Aashirvaad Shudh Chakki Atta 5kg',
    category: 'Grocery & Staples',
    unit: 'bags',
    stock_on_hand: 6,
    in_transit: 0,
    supplier_id: 'sup_3',
    supplier_name: 'Golden Harvest Grains Ltd',
    lead_time_days: 3,
    shelf_life_days: 120,
    cost_price: 240,
    selling_price: 275,
    moq: 6,
    pack_size: 6,
    demand_multiplier: 1.0,
    batches: [{ qty: 6, expiry_date: '2027-01-10' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-15',
  },
  {
    id: 'p_oil',
    sku: 'GRO-OIL-1L',
    name: 'Fortune Sunlite Sunflower Oil 1L Pouch',
    category: 'Grocery & Staples',
    unit: 'pouches',
    stock_on_hand: 11,
    in_transit: 0,
    supplier_id: 'sup_3',
    supplier_name: 'Golden Harvest Grains Ltd',
    lead_time_days: 3,
    shelf_life_days: 270,
    cost_price: 128,
    selling_price: 145,
    moq: 10,
    pack_size: 10,
    demand_multiplier: 1.0,
    batches: [{ qty: 11, expiry_date: '2027-05-20' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-14',
  },
  {
    id: 'p_tea',
    sku: 'BEV-TEA-250',
    name: 'Brooke Bond Red Label Tea 250g',
    category: 'Beverages',
    unit: 'boxes',
    stock_on_hand: 9,
    in_transit: 0,
    supplier_id: 'sup_5',
    supplier_name: 'Apex FMCG Distributors',
    lead_time_days: 2,
    shelf_life_days: 365,
    cost_price: 135,
    selling_price: 155,
    moq: 12,
    pack_size: 12,
    demand_multiplier: 1.25, // Rainy weather boost
    batches: [{ qty: 9, expiry_date: '2027-09-01' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-16',
  },
  {
    id: 'p_salt',
    sku: 'GRO-SALT-1KG',
    name: 'Tata Salt Vacuum Evaporated 1kg',
    category: 'Grocery & Staples',
    unit: 'packets',
    stock_on_hand: 18,
    in_transit: 0,
    supplier_id: 'sup_2',
    supplier_name: 'Metro FMCG Wholesalers',
    lead_time_days: 2,
    shelf_life_days: null, // Non-perishable
    cost_price: 24,
    selling_price: 28,
    moq: 25,
    pack_size: 25,
    demand_multiplier: 1.0,
    batches: [{ qty: 18, expiry_date: '2028-01-01' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-19',
  },
  {
    id: 'p_sugar',
    sku: 'GRO-SUGAR-1KG',
    name: 'Madhur Pure & Hygienic Sugar 1kg',
    category: 'Grocery & Staples',
    unit: 'packets',
    stock_on_hand: 15,
    in_transit: 0,
    supplier_id: 'sup_3',
    supplier_name: 'Golden Harvest Grains Ltd',
    lead_time_days: 3,
    shelf_life_days: null,
    cost_price: 44,
    selling_price: 50,
    moq: 20,
    pack_size: 20,
    demand_multiplier: 1.0,
    batches: [{ qty: 15, expiry_date: '2028-01-01' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-12',
  },
  {
    id: 'p_toor_dal',
    sku: 'GRO-TOOR-1KG',
    name: 'Tata Sampann Unpolished Toor Dal 1kg',
    category: 'Grocery & Staples',
    unit: 'packets',
    stock_on_hand: 12,
    in_transit: 0,
    supplier_id: 'sup_3',
    supplier_name: 'Golden Harvest Grains Ltd',
    lead_time_days: 4,
    shelf_life_days: 180,
    cost_price: 152,
    selling_price: 175,
    moq: 10,
    pack_size: 10,
    demand_multiplier: 1.0,
    batches: [{ qty: 12, expiry_date: '2027-02-15' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-13',
  },
  {
    id: 'p_parleg',
    sku: 'SNK-PARLEG-250',
    name: 'Parle-G Glucose Biscuits 250g',
    category: 'Snacks & Confectionery',
    unit: 'packs',
    stock_on_hand: 22,
    in_transit: 0,
    supplier_id: 'sup_2',
    supplier_name: 'Metro FMCG Wholesalers',
    lead_time_days: 2,
    shelf_life_days: 180,
    cost_price: 25,
    selling_price: 30,
    moq: 24,
    pack_size: 24,
    demand_multiplier: 1.0,
    batches: [{ qty: 22, expiry_date: '2027-03-30' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-17',
  },
  {
    id: 'p_surf',
    sku: 'HOU-SURF-1KG',
    name: 'Surf Excel Easy Wash Detergent Powder 1kg',
    category: 'Personal Care',
    unit: 'packets',
    stock_on_hand: 8,
    in_transit: 0,
    supplier_id: 'sup_5',
    supplier_name: 'Apex FMCG Distributors',
    lead_time_days: 2,
    shelf_life_days: null,
    cost_price: 130,
    selling_price: 148,
    moq: 12,
    pack_size: 6,
    demand_multiplier: 1.0,
    batches: [{ qty: 8, expiry_date: '2028-06-01' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-16',
  },
  {
    id: 'p_dettol',
    sku: 'HOU-DETTOL-125',
    name: 'Dettol Original Bathing Soap 125g (Pack of 3)',
    category: 'Personal Care',
    unit: 'packs',
    stock_on_hand: 7,
    in_transit: 0,
    supplier_id: 'sup_5',
    supplier_name: 'Apex FMCG Distributors',
    lead_time_days: 2,
    shelf_life_days: 730,
    cost_price: 132,
    selling_price: 150,
    moq: 12,
    pack_size: 6,
    demand_multiplier: 1.0,
    batches: [{ qty: 7, expiry_date: '2028-08-15' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-06', // 17 days ago (Old stock)
  },
  // OVERSTOCKED / DEAD STOCK ITEMS
  {
    id: 'p_olive_oil',
    sku: 'GRO-OLIVE-500',
    name: 'Borges Extra Virgin Olive Oil 500ml Glass Bottle',
    category: 'Grocery & Staples',
    unit: 'bottles',
    stock_on_hand: 28, // Sells ~0.2 per day! Overstocked by ~24 bottles!
    in_transit: 0,
    supplier_id: 'sup_2',
    supplier_name: 'Metro FMCG Wholesalers',
    lead_time_days: 4,
    shelf_life_days: 540,
    cost_price: 495,
    selling_price: 599,
    moq: 6,
    pack_size: 6,
    demand_multiplier: 1.0,
    batches: [{ qty: 28, expiry_date: '2027-01-20' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-09-18', // 35 days ago (Stagnant old stock)
  },
  {
    id: 'p_peanuts',
    sku: 'SNK-PEANUT-200',
    name: 'Haldiram Salted Peanuts 200g Foil Pack',
    category: 'Snacks & Confectionery',
    unit: 'packs',
    stock_on_hand: 54, // High stock, slow clearance
    in_transit: 0,
    supplier_id: 'sup_2',
    supplier_name: 'Metro FMCG Wholesalers',
    lead_time_days: 3,
    shelf_life_days: 90,
    cost_price: 40,
    selling_price: 50,
    moq: 12,
    pack_size: 12,
    demand_multiplier: 1.0,
    batches: [{ qty: 54, expiry_date: '2026-11-20' }], // Expiry approaching!
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-09-24', // 29 days ago (Old stock, 2-week removal overdue)
  },
  {
    id: 'p_muesli',
    sku: 'SNK-MUESLI-400',
    name: "Kellogg's Crunchy Muesli Fruit & Nut 400g",
    category: 'Snacks & Confectionery',
    unit: 'boxes',
    stock_on_hand: 19,
    in_transit: 0,
    supplier_id: 'sup_2',
    supplier_name: 'Metro FMCG Wholesalers',
    lead_time_days: 3,
    shelf_life_days: 180,
    cost_price: 260,
    selling_price: 310,
    moq: 6,
    pack_size: 6,
    demand_multiplier: 1.0,
    batches: [{ qty: 19, expiry_date: '2026-12-10' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-01', // 22 days ago (Old stock)
  },
  // INTERMITTENT ITEM
  {
    id: 'p_vaporizer',
    sku: 'HOU-VAP-REFILL',
    name: 'All Out Liquid Vaporizer Refill Twin Pack',
    category: 'Personal Care',
    unit: 'packs',
    stock_on_hand: 10,
    in_transit: 0,
    supplier_id: 'sup_5',
    supplier_name: 'Apex FMCG Distributors',
    lead_time_days: 2,
    shelf_life_days: 730,
    cost_price: 140,
    selling_price: 160,
    moq: 12,
    pack_size: 6,
    demand_multiplier: 1.3, // Monsoon mosquito season
    batches: [{ qty: 10, expiry_date: '2028-02-01' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-03', // 20 days ago (Old stock)
  },
  {
    id: 'p_lays',
    sku: 'SNK-LAYS-SALT-50',
    name: "Lay's Classic Salted Potato Chips 50g",
    category: 'Snacks & Confectionery',
    unit: 'bags',
    stock_on_hand: 16,
    in_transit: 0,
    supplier_id: 'sup_2',
    supplier_name: 'Metro FMCG Wholesalers',
    lead_time_days: 2,
    shelf_life_days: 90,
    cost_price: 16,
    selling_price: 20,
    moq: 30,
    pack_size: 15,
    demand_multiplier: 1.0,
    batches: [{ qty: 16, expiry_date: '2026-12-30' }],
    updated_at: '2026-10-23T04:00:00Z',
    received_date: '2026-10-20', // 3 days ago (New stock)
  },
];

// Pre-generate 60 days of realistic daily sales history for each product
export function generateDemoSalesHistory(): Map<string, DailySale[]> {
  const salesMap = new Map<string, DailySale[]>();
  const today = new Date('2026-10-23');

  INITIAL_PRODUCTS.forEach((p) => {
    const list: DailySale[] = [];

    // Base daily velocity by product
    let baseQty = 10;
    let isIntermittent = false;

    if (p.id === 'p_milk') baseQty = 38;
    else if (p.id === 'p_curd') baseQty = 16;
    else if (p.id === 'p_bread') baseQty = 20;
    else if (p.id === 'p_maggi') baseQty = 24;
    else if (p.id === 'p_atta') baseQty = 5;
    else if (p.id === 'p_oil') baseQty = 7;
    else if (p.id === 'p_tea') baseQty = 8;
    else if (p.id === 'p_salt') baseQty = 6;
    else if (p.id === 'p_sugar') baseQty = 9;
    else if (p.id === 'p_toor_dal') baseQty = 5;
    else if (p.id === 'p_parleg') baseQty = 18;
    else if (p.id === 'p_surf') baseQty = 4;
    else if (p.id === 'p_dettol') baseQty = 5;
    else if (p.id === 'p_olive_oil') {
      baseQty = 0.3;
      isIntermittent = true;
    } else if (p.id === 'p_peanuts') baseQty = 1.8;
    else if (p.id === 'p_muesli') baseQty = 0.8;
    else if (p.id === 'p_vaporizer') {
      baseQty = 1.2;
      isIntermittent = true;
    } else if (p.id === 'p_lays') baseQty = 19;

    for (let d = 60; d >= 1; d--) {
      const curDate = new Date(today);
      curDate.setDate(today.getDate() - d);
      const dayOfWeek = curDate.getDay();
      const dateStr = curDate.toISOString().split('T')[0];

      let dayQty = 0;
      if (isIntermittent) {
        // Intermittent random sales
        const r = Math.random();
        if (r < (p.id === 'p_olive_oil' ? 0.15 : 0.35)) {
          dayQty = Math.floor(Math.random() * 2) + 1;
        } else {
          dayQty = 0;
        }
      } else {
        // Weekly pattern: weekend higher
        const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 1.35 : 0.95;
        // Random variance
        const noise = (Math.random() - 0.5) * 0.4;
        dayQty = Math.max(0, Math.round(baseQty * weekendFactor * (1 + noise)));
      }

      list.push({
        date: dateStr,
        qty: dayQty,
        price: p.selling_price,
      });
    }

    salesMap.set(p.id, list);
  });

  return salesMap;
}

export const INITIAL_WASTAGE_RECORDS: WastageRecord[] = [
  {
    id: 'w_1',
    productId: 'p_milk',
    productName: 'Amul Taaza Homogenised Milk 500ml',
    qty: 3,
    unit: 'pouches',
    reason: 'Expired',
    date: '2026-10-21',
    cost_value: 81,
    notes: 'Unsold from Saturday batch (2-day shelf life exceeded)',
  },
  {
    id: 'w_2',
    productId: 'p_bread',
    productName: 'Modern White Bread Sliced 400g',
    qty: 2,
    unit: 'loaves',
    reason: 'Spoiled/Mould',
    date: '2026-10-19',
    cost_value: 76,
    notes: 'Foil seal damaged in transit',
  },
  {
    id: 'w_3',
    productId: 'p_peanuts',
    productName: 'Haldiram Salted Peanuts 200g Foil Pack',
    qty: 4,
    unit: 'packs',
    reason: 'Expired',
    date: '2026-10-14',
    cost_value: 160,
    notes: 'Overstocked batch reached printed expiry',
  },
];

// Sample CSV templates for Kirana, Pharmacy, and Bakery
export const SAMPLE_CSV_KIRANA = `date,product_name,sku,quantity_sold,selling_price
2026-10-01,Amul Taaza Homogenised Milk 500ml,DAI-MILK-500,42,30
2026-10-01,Modern White Bread Sliced 400g,BAK-BREAD-400,24,45
2026-10-01,Maggi 2-Minute Masala Noodles 70g,SNK-MAGGI-70,28,14
2026-10-01,Aashirvaad Shudh Chakki Atta 5kg,GRO-ATTA-5KG,6,275
2026-10-01,Fortune Sunlite Sunflower Oil 1L Pouch,GRO-OIL-1L,8,145
2026-10-01,Brooke Bond Red Label Tea 250g,BEV-TEA-250,9,155
2026-10-02,Amul Taaza Homogenised Milk 500ml,DAI-MILK-500,39,30
2026-10-02,Modern White Bread Sliced 400g,BAK-BREAD-400,21,45
2026-10-02,Maggi 2-Minute Masala Noodles 70g,SNK-MAGGI-70,25,14
2026-10-02,Aashirvaad Shudh Chakki Atta 5kg,GRO-ATTA-5KG,7,275
2026-10-02,Tata Salt Vacuum Evaporated 1kg,GRO-SALT-1KG,6,28
2026-10-03,Amul Taaza Homogenised Milk 500ml,DAI-MILK-500,45,30
2026-10-03,Modern White Bread Sliced 400g,BAK-BREAD-400,26,45
2026-10-03,Parle-G Glucose Biscuits 250g,SNK-PARLEG-250,22,30
2026-10-03,Haldiram Salted Peanuts 200g Foil Pack,SNK-PEANUT-200,2,50`;

export const SAMPLE_CSV_PHARMACY = `date,product_name,sku,quantity_sold,selling_price
2026-10-01,Paracetamol 650mg Dolo Strip of 15,MED-DOLO-650,34,31
2026-10-01,Cetirizine 10mg Strip of 10,MED-CET-10,18,22
2026-10-01,Electral ORS 21.8g Sachet,MED-ORS-21,28,21
2026-10-01,Betadine 10% Ointment 20g,MED-BETA-20,6,115
2026-10-02,Paracetamol 650mg Dolo Strip of 15,MED-DOLO-650,40,31
2026-10-02,Vitamin C Chewable Limcee 500mg,MED-LIM-500,15,25
2026-10-02,Digene Antacid Gel 200ml,MED-DIG-200,9,140`;

export const SAMPLE_CSV_BAKERY = `date,product_name,sku,quantity_sold,selling_price
2026-10-01,Whole Wheat Bread 400g,BAK-WHEAT-400,32,50
2026-10-01,Chocolate Truffle Pastry,BAK-TRUF-100,22,80
2026-10-01,Butter Croissant,BAK-CRST-1,16,65
2026-10-01,Eggless Red Velvet Cupcake,BAK-CUP-RV,14,55
2026-10-02,Whole Wheat Bread 400g,BAK-WHEAT-400,35,50
2026-10-02,Fresh Cream Pineapple Cake 500g,BAK-CAKE-PIN,8,380`;
