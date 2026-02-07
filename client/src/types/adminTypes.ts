export type AdminContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt?: string;
};

export type AdminContactMessagesResponse = {
  messages: AdminContactMessage[];
  total: number;
  limit: number;
  skip: number;
};

export type AdminAnalyticsResponse = {
  contacts: {
    total: number;
    last7d: number;
    lastAt: string | null;
  };
  calls: {
    total: number;
    upcoming: number;
    lastAt: string | null;
  };
  revenue: {
    currency: string;
    totalMinor: number;
    last30dMinor: number;
  };
  timeZone: string;
  generatedAt: string;
};

