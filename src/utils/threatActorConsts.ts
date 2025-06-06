export const SOPHISTICATION_LEVELS: Record<string, number> = {
  None: 1 - 6 / 7,
  Minimal: 1 - 5 / 7,
  Intermediate: 1 - 4 / 7,
  Advanced: 1 - 3 / 7,
  Expert: 1 - 2 / 7,
  Innovator: 1 - 1 / 7,
  Strategic: 1,
};

export const RESOURCE_LEVELS: Record<string, number> = {
  Government: 1,
  Organization: 1 - 1 / 6,
  Team: 1 - 2 / 6,
  Contest: 1 - 3 / 6,
  Club: 1 - 4 / 6,
  Individual: 1 - 5 / 6,
};

export const RELEVANCE_LEVELS: Record<string, number> = {
  'Very High': 1,
  High: 0.8,
  Moderate: 0.5,
  Low: 0.2,
  'Very Low': 0.1,
};

export const LOCATIONS = ["U.S.", "Europe", "Asia", "Africa", "South America", "North America"];
export const SECTORS = [
  "Energy", "Materials", "Industrials", "Consumer Discretionary",
  "Consumer Staples", "Health Care", "Financials", "Information Technology",
  "Communication Services", "Utilities", "Real Estate"
];

export const COLORS = ['#8884d8', '#82ca9d'];
