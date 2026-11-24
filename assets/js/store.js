const STORAGE_KEYS = {
  ORDERS: 'sativa_orders_v1',
  CUSTOMERS: 'sativa_customers_v1',
  EXPENSES: 'sativa_expenses_v1',
  AUTH: 'sativa_auth_session'
};

const INITIAL_ORDERS = [
  {
    id: 'STL-261114-021',
    customerName: 'Rani',
    customerPhone: '0812-0000-0021',
    customerAddress: 'Jl. Sigura-Gura, Malang',
    service: 'Cuci + setrika',
    serviceType: 'Cuci + setrika reguler',
    weight: 3,
    rate: 7000,
    items: 'Pakaian campur',
    total: 21000,
    status: 'Disetrika',
    paymentStatus: 'LUNAS',
    paymentMethod: 'Tunai',
    orderDate: '14 Nov 2026 · 09.00',
    estimateDate: '16 Nov 2026 · 17.00 WIB',
    notes: 'Pisahkan pakaian putih',
    shelf: '01',
    history: [
      { time: '16 Nov · 10.30', status: 'Disetrika' },
      { time: '15 Nov · 08.30', status: 'Dicuci' },
      { time: '14 Nov · 09.00', status: 'Diterima' }
    ]
  },
  {
    id: 'STL-261116-026',
    customerName: 'Nadia',
    customerPhone: '0812-0000-0026',
    customerAddress: 'Jl. Bendungan Sigura-Gura No. 5',
    service: 'Cuci + setrika',
    serviceType: 'Cuci + setrika reguler',
    weight: 2,
    rate: 7000,
    items: 'Pakaian harian',
    total: 14000,
    status: 'Diterima',
    paymentStatus: 'LUNAS',
    paymentMethod: 'Tunai',
    orderDate: '16 Nov 2026 · 08.15',
    estimateDate: '18 Nov 2026 · 17.00 WIB',
    notes: '-',
    shelf: '',
    history: [
      { time: '16 Nov · 08.15', status: 'Diterima' }
    ]
  },
  {
    id: 'STL-261116-025',
    customerName: 'Bima',
    customerPhone: '0812-0000-0025',
    customerAddress: 'Jl. Galunggung No. 44',
    service: 'Cuci + setrika',
    serviceType: 'Cuci + setrika reguler',
    weight: 1,
    rate: 7000,
    items: 'Kemeja kerja',
    total: 7000,
    status: 'Diterima',
    paymentStatus: 'LUNAS',
    paymentMethod: 'Tunai',
    orderDate: '16 Nov 2026 · 07.45',
    estimateDate: '18 Nov 2026 · 15.00 WIB',
    notes: 'Kerah disetrika rapi',
    shelf: '',
    history: [
      { time: '16 Nov · 07.45', status: 'Diterima' }
    ]
  },
  {
    id: 'STL-261116-024',
    customerName: 'Nisa',
    customerPhone: '0812-0000-0024',
    customerAddress: 'Jl. Veteran No. 8',
    service: 'Cuci + setrika',
    serviceType: 'Cuci + setrika reguler',
    weight: 1,
    rate: 7000,
    items: 'Gamis dan jilbab',
    total: 7000,
    status: 'Diterima',
    paymentStatus: 'LUNAS',
    paymentMethod: 'Tunai',
    orderDate: '16 Nov 2026 · 07.00',
    estimateDate: '18 Nov 2026 · 14.00 WIB',
    notes: '-',
    shelf: '',
    history: [
      { time: '16 Nov · 07.00', status: 'Diterima' }
    ]
  },
  {
    id: 'STL-261115-023',
    customerName: 'Dimas',
    customerPhone: '0812-0000-0023',
    customerAddress: 'Jl. MT Haryono No. 19',
    service: 'Cuci + setrika',
    serviceType: 'Cuci + setrika reguler',
    weight: 3,
    rate: 7000,
    items: 'Celana jeans & kaos',
    total: 21000,
    status: 'Dicuci',
    paymentStatus: 'LUNAS',
    paymentMethod: 'Tunai',
    orderDate: '15 Nov 2026 · 14.00',
    estimateDate: '17 Nov 2026 · 17.00 WIB',
    notes: '-',
    shelf: '',
    history: [
      { time: '16 Nov · 09.00', status: 'Dicuci' },
      { time: '15 Nov · 14.00', status: 'Diterima' }
    ]
  },
  {
    id: 'STL-261115-022',
    customerName: 'Sari',
    customerPhone: '0812-0000-0022',
    customerAddress: 'Jl. Gajayana No. 10',
    service: 'Cuci + setrika',
    serviceType: 'Cuci + setrika reguler',
    weight: 2,
    rate: 7000,
    items: 'Selimut tipis & sprei',
    total: 14000,
    status: 'Dicuci',
    paymentStatus: 'LUNAS',
    paymentMethod: 'Tunai',
    orderDate: '15 Nov 2026 · 11.30',
    estimateDate: '17 Nov 2026 · 15.00 WIB',
    notes: 'Pewangi ekstra',
    shelf: '',
    history: [
      { time: '16 Nov · 08.45', status: 'Dicuci' },
      { time: '15 Nov · 11.30', status: 'Diterima' }
    ]
  },
  {
    id: 'STL-261113-020',
    customerName: 'Fajar',
    customerPhone: '0812-0000-0020',
    customerAddress: 'Jl. Sumbersari No. 3',
    service: 'Cuci + setrika',
    serviceType: 'Cuci + setrika reguler',
    weight: 2,
    rate: 7000,
    items: 'Kaos & celana pendek',
    total: 14000,
    status: 'Selesai',
    paymentStatus: 'LUNAS',
    paymentMethod: 'Tunai',
    orderDate: '13 Nov 2026 · 10.00',
    estimateDate: '15 Nov 2026 · 17.00 WIB',
    notes: '-',
    shelf: '02',
    history: [
      { time: '15 Nov · 16.30', status: 'Selesai' },
      { time: '14 Nov · 10.00', status: 'Disetrika' },
      { time: '13 Nov · 14.00', status: 'Dicuci' },
      { time: '13 Nov · 10.00', status: 'Diterima' }
    ]
  },
  {
    id: 'STL-261113-019',
    customerName: 'Ayu',
    customerPhone: '0812-0000-0019',
    customerAddress: 'Jl. Candi Panggung No. 15',
    service: 'Cuci + setrika',
    serviceType: 'Cuci + setrika reguler',
    weight: 3,
    rate: 7000,
    items: 'Baju kerja',
    total: 21000,
    status: 'Selesai',
    paymentStatus: 'LUNAS',
    paymentMethod: 'Tunai',
    orderDate: '13 Nov 2026 · 09.15',
    estimateDate: '15 Nov 2026 · 15.00 WIB',
    notes: '-',
    shelf: '03',
    history: [
      { time: '15 Nov · 14.45', status: 'Selesai' },
      { time: '14 Nov · 09.00', status: 'Disetrika' },
      { time: '13 Nov · 12.00', status: 'Dicuci' },
      { time: '13 Nov · 09.15', status: 'Diterima' }
    ]
  }
];

const INITIAL_CUSTOMERS = [
  { id: 'CUST-001', name: 'Rani', phone: '0812-0000-0021', address: 'Jl. Sigura-Gura, Malang' },
  { id: 'CUST-002', name: 'Rani Putri', phone: '0812-0000-0042', address: 'Jl. Soekarno Hatta No. 12, Malang' },
  { id: 'CUST-003', name: 'Nadia', phone: '0812-0000-0026', address: 'Jl. Bendungan Sigura-Gura No. 5, Malang' },
  { id: 'CUST-004', name: 'Bima', phone: '0812-0000-0025', address: 'Jl. Galunggung No. 44, Malang' },
  { id: 'CUST-005', name: 'Nisa', phone: '0812-0000-0024', address: 'Jl. Veteran No. 8, Malang' },
  { id: 'CUST-006', name: 'Dimas', phone: '0812-0000-0023', address: 'Jl. MT Haryono No. 19, Malang' },
  { id: 'CUST-007', name: 'Sari', phone: '0812-0000-0022', address: 'Jl. Gajayana No. 10, Malang' },
  { id: 'CUST-008', name: 'Fajar', phone: '0812-0000-0020', address: 'Jl. Sumbersari No. 3, Malang' },
  { id: 'CUST-009', name: 'Ayu', phone: '0812-0000-0019', address: 'Jl. Candi Panggung No. 15, Malang' }
];

const INITIAL_EXPENSES = [
  { id: 'EXP-001', category: 'Bahan laundry', description: 'Detergen', time: '08.00', amount: 30000, date: '16 November 2026' },
  { id: 'EXP-002', category: 'Bahan laundry', description: 'Plastik kemasan', time: '09.00', amount: 15000, date: '16 November 2026' }
];

class SativaStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    }
  }

  getOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  }

  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find(o => o.id.toLowerCase() === id.trim().toLowerCase());
  }

  searchOrders(query) {
    const orders = this.getOrders();
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
    );
  }

  saveOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return order;
  }

  updateOrderStatus(orderId, newStatus, shelf = '') {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id.toLowerCase() === orderId.trim().toLowerCase());
    if (index !== -1) {
      orders[index].status = newStatus;
      if (shelf) orders[index].shelf = shelf;
      const now = new Date();
      const timeStr = `${now.getDate()} Nov · ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
      orders[index].history = orders[index].history || [];
      orders[index].history.unshift({ time: timeStr, status: newStatus });
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return orders[index];
    }
    return null;
  }

  getDashboardStats() {
    const orders = this.getOrders();
    const activeOrders = orders.filter(o => ['Diterima', 'Dicuci', 'Disetrika'].includes(o.status));
    const readyOrders = orders.filter(o => o.status === 'Selesai');
    const activeWeight = activeOrders.reduce((sum, o) => sum + (Number(o.weight) || 0), 0);
    const maxCapacity = 200;
    const remaining = Math.max(0, maxCapacity - activeWeight);

    return {
      activeCount: activeOrders.length,
      readyCount: readyOrders.length,
      activeWeight,
      maxCapacity,
      remaining,
      isFull: activeWeight >= maxCapacity
    };
  }

  getCustomers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
  }

  getCustomerByName(name) {
    const customers = this.getCustomers();
    return customers.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
  }

  searchCustomers(query) {
    const customers = this.getCustomers();
    if (!query) return customers;
    const q = query.toLowerCase().trim();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }

  saveCustomer(customer) {
    const customers = this.getCustomers();
    const existingIndex = customers.findIndex(c => c.name.toLowerCase() === customer.name.toLowerCase() || (customer.id && c.id === customer.id));
    if (existingIndex !== -1) {
      customers[existingIndex] = { ...customers[existingIndex], ...customer };
    } else {
      customer.id = customer.id || `CUST-${String(customers.length + 1).padStart(3, '0')}`;
      customers.push(customer);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    return customer;
  }

  getExpenses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  }

  saveExpense(expense) {
    const expenses = this.getExpenses();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
    const newExpense = {
      id: `EXP-${String(expenses.length + 1).padStart(3, '0')}`,
      time: timeStr,
      date: expense.date || '16 November 2026',
      ...expense
    };
    expenses.unshift(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return newExpense;
  }

  getTodayExpensesTotal() {
    const expenses = this.getExpenses();
    const total = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return {
      total,
      count: expenses.length,
      items: expenses
    };
  }
}

window.sativaStore = new SativaStore();
