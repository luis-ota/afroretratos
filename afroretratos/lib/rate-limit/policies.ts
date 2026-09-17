export type RateWindow = {
  limit: number;
  seconds: number;
};

export type RatePolicy = {
  name: string;
  windows: RateWindow[];
};

function envInt(name: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function postPolicy(): RatePolicy {
  return {
    name: "posts",
    windows: [
      {
        limit: envInt("RATE_LIMIT_POSTS_PER_MINUTE", 5),
        seconds: 60,
      },
      {
        limit: envInt("RATE_LIMIT_POSTS_PER_HOUR", 20),
        seconds: 60 * 60,
      },
    ],
  };
}

export function reportPolicy(): RatePolicy {
  return {
    name: "reports",
    windows: [
      {
        limit: envInt("RATE_LIMIT_REPORTS_PER_HOUR", 10),
        seconds: 60 * 60,
      },
    ],
  };
}

export function adminLoginPolicy(): RatePolicy {
  return {
    name: "admin-login",
    windows: [
      {
        limit: envInt("RATE_LIMIT_ADMIN_LOGIN_PER_10_MIN", 10),
        seconds: 10 * 60,
      },
    ],
  };
}
