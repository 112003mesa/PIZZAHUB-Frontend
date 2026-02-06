export type UserRole = "user" | "delivery" | "admin";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  address?: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isSidebarOpen: boolean;
};

export type SizeOption = {
  id: string;
  name: string;
  price: number;
};

export type ExtraOption = {
  id: string;
  name: string;
  price: number;
};

export type MenuItem = {
  _id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  basePrice: number;
  sizes: SizeOption[];
  extras: ExtraOption[];
};

export interface CartItem {
  cartId: string; // Unique ID based on configuration (item + size + extras)
  itemId: string;
  _id?: string;
  name: string;
  image: string;
  selectedSize: SizeOption | null;
  selectedExtras: { name: string; price: number }[];
  quantity: number;
  unitPrice: number; // Price of one unit including size & extras
  totalPrice: number; // unitPrice * quantity
}


export type DeliveryUser = {
  _id: string;
  name: string;
  email: string;
  status: "idle" | "delivering";
  items: CartItem[];
  currentOrderId?: {
    _id: string;
    address: string;
    totalAmount: number;
    paymentMethod: string;
    createdAt: string;
  };
}

// ... (Your existing types: UserRole, User, AuthState, SizeOption, ExtraOption, MenuItem)

export type LatestOrder = {
  _id: string;
  items: MenuItem[]; // Or array of objects depending on your schema
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  status: "pending" |"accepted"| "on_the_way"| "delivered"| "cancelled"; // Added status
  address: string;
  createdAt: string;
  user: User;
};

export type LatestOrdersByPeriod = {
  day: LatestOrder[];
  week: LatestOrder[];
  month: LatestOrder[];
  threeMonths: LatestOrder[];
  sixMonths: LatestOrder[];
  year: LatestOrder[];
  all: LatestOrder[];
};

export type PeriodStats = {
  day: number;
  week: number;
  month: number;
  threeMonths: number;
  sixMonths: number;
  year: number;
  all: number;
};

// New Chart Types
export type RevenueChartItem = {
  _id: number; // Month number
  sales: number;
  revenue: number;
};

export type StatusChartItem = {
  _id: string; // Status name
  value: number;
};

export type DailyChartItem = {
  _id: number; // Day number
  value: number;
};

export type DashboardStats = {
  latestOrders: LatestOrdersByPeriod;
  pendingOrders: PeriodStats;
  productsCount: PeriodStats;
  totalOrders: PeriodStats;
  usersCount: PeriodStats;
  charts?: {
    revenueStats: RevenueChartItem[];
    ordersByStatus: StatusChartItem[];
    dailyProfit: DailyChartItem[];
  };
};

export interface DashboardResponse {
  orders: {
    todayCount: number;             // عدد الطلبات اللي اتسلمت النهاردة
    allDelivered: number;           // كل الأوردرات اللي اتسلمت
    percentage: number;             // نسبة أوردرات النهاردة من كل الأوردرات
    todayOrders: Order[];           // بيانات الأوردرات النهارده
    deliveryCompletionRate: number; // نسبة إتمام الطلبات من كل الأوردرات
    orderCancelRate: number;        // نسبة الطلبات الملغية من كل الأوردرات
    avgDeliveryTime: number;        // متوسط وقت التوصيل بالدقائق
  };

  earnings: {
    today: number;                  // أرباح النهارده
    month: number;                  // أرباح الشهر
    percentage: number;             // نسبة أرباح النهارده من الشهر
  };
}
export interface WeeklyStat {
  _id: string; // التاريخ (YYYY-MM-DD)
  orders: number;
  income: number;
}

export interface DashboardResponse {
  orders: {
    todayCount: number;
    allDelivered: number;
    percentage: number;
    todayOrders: Order[];
    deliveryCompletionRate: number;
    orderCancelRate: number;
    avgDeliveryTime: number;
  };
  earnings: {
    today: number;
    month: number;
    percentage: number;
  };
  // دي هنزودها في الباك اند عشان الـ Line Chart
  weeklyStats: WeeklyStat[];
}


export interface OrderItemDetail {
  name: string;
  quantity: number; // أو qty حسب ما انت مسميها في الموديل
  price: number;
}

export interface Order {
  _id: string;
  address: string;
  user: {
    _id: string;
    name: string;
    address: string;
    phone?: string;
  } | null;
  items: OrderItemDetail[]; // تأكد ان ده شكل الـ items في الداتابيز
  totalAmount: number;
  status: 'pending' | 'accepted' | 'on_the_way' | 'delivered' | 'cancelled';
  paymentMethod: 'Cash' | 'Visa';
  createdAt: string;
  deliveryFee?: number;
  distance?: string; // مش موجود في الباك حالياً فهنعمله Mock
}