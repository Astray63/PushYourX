export type Entry = {
  id: number;
  handle: string;
  display_handle: string;
  tagline: string;
  amount: number;
  clicks: number;
  created_at: number;
  updated_at: number;
  rank: number;
};

export type Takeover = {
  id: number;
  handle: string;
  tagline: string;
  amount: number;
  expires_at: number;
  created_at: number;
};

export type Stats = {
  online: number;
  visitors: number;
  listed: number;
  volume: number;
  top: number;
  next: number;
};

export type BoardData = {
  entries: Entry[];
  total: number;
  pages: number;
  page: number;
  perPage: number;
  stats: Stats;
  takeover: Takeover | null;
  takeoverPrice: number;
  activity: Activity[];
  trending: Trend[];
};

export type Activity = {
  id: number;
  display_handle: string;
  amount: number;
  updated_at: number;
  created_at: number;
};

export type Trend = {
  id: number;
  display_handle: string;
  amount: number;
  hits: number;
};
