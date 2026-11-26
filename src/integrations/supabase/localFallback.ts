import type { Tables } from "./types";

interface LocalAccount {
  id: string;
  email: string;
  passwordHash: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface LocalDatabase {
  users: LocalAccount[];
  profiles: Tables<"profiles">[];
  user_roles: Tables<"user_roles">[];
  pandits: Tables<"pandits">[];
  bookings: Tables<"bookings">[];
  contact_messages: Tables<"contact_messages">[];
}

const STORAGE_KEY = "karmapath_local_db_v1";

const SEEDED_PANDITS: Tables<"pandits">[] = [
  {
    id: "11111111-1111-4111-8111-111111111101",
    user_id: null,
    name: "Pt. Ram Prasad Sharma",
    specializations: ["Vivah", "Bratabandha", "Satyanarayan Puja", "Griha Pravesh"],
    experience_years: 25,
    city: "Kathmandu",
    bio: "Renowned Vedic scholar with 25 years of experience performing sacred ceremonies across Kathmandu Valley. Specializes in Vivah and Bratabandha ceremonies with authentic Yajurveda traditions.",
    photo_url: null,
    phone: "+977 9841000001",
    verified: true,
    rating: 4.9,
    total_ceremonies: 3200,
    created_at: "2026-04-01T09:00:00.000Z",
    updated_at: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111102",
    user_id: null,
    name: "Pt. Keshav Acharya",
    specializations: ["Shraddha", "Rudri Path", "Navagraha Puja", "Pinda Daan"],
    experience_years: 30,
    city: "Bhaktapur",
    bio: "Senior Purohit from Bhaktapur dedicated to Shraddha, Pitru Karma, and Rudri Path. Known for compassionate guidance and strict adherence to Vedic procedures.",
    photo_url: null,
    phone: "+977 9841000002",
    verified: true,
    rating: 4.85,
    total_ceremonies: 4500,
    created_at: "2026-04-01T09:05:00.000Z",
    updated_at: "2026-04-01T09:05:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111103",
    user_id: null,
    name: "Pt. Hari Datta Upadhyay",
    specializations: ["Namakaran", "Griha Pravesh", "Vastu Shanti", "Annaprashan"],
    experience_years: 20,
    city: "Pokhara",
    bio: "Combines traditional Karmakanda mastery with Jyotish Muhurta selection across Western Nepal, ensuring every ceremony begins under auspicious planetary alignment.",
    photo_url: null,
    phone: "+977 9841000003",
    verified: true,
    rating: 4.8,
    total_ceremonies: 2100,
    created_at: "2026-04-01T09:10:00.000Z",
    updated_at: "2026-04-01T09:10:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111104",
    user_id: null,
    name: "Pt. Vishnu Dev Pant",
    specializations: ["Vivah", "Namakaran", "Rudri Path", "Kundali Milan"],
    experience_years: 28,
    city: "Lalitpur",
    bio: "One of Lalitpur's most respected Acharyas with nearly three decades of service in elaborate Vedic weddings, Janam Kundali preparation, and Vastu consultations.",
    photo_url: null,
    phone: "+977 9841000004",
    verified: true,
    rating: 4.95,
    total_ceremonies: 3800,
    created_at: "2026-04-01T09:15:00.000Z",
    updated_at: "2026-04-01T09:15:00.000Z",
  },
  {
    id: "11111111-1111-4111-8111-111111111105",
    user_id: null,
    name: "Pt. Surya Nath Joshi",
    specializations: ["Durga Puja", "Lakshmi Puja", "Ganesh Puja", "Rudri Path"],
    experience_years: 16,
    city: "Chitwan",
    bio: "Devoted to Shakti upasana, festival pujas, and Rudri Path. Brings clarity and warmth so younger generations understand the meaning behind every mantra.",
    photo_url: null,
    phone: "+977 9841000005",
    verified: true,
    rating: 4.75,
    total_ceremonies: 1450,
    created_at: "2026-04-01T09:20:00.000Z",
    updated_at: "2026-04-01T09:20:00.000Z",
  },
];

let remoteOffline = false;

export const isSupabaseRemoteOffline = () => remoteOffline;

const makeId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const toBase64Url = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (b64url: string): string => {
  const padded = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};

const hashPassword = async (password: string): Promise<string> => {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`karmapath:${password}`));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return toBase64Url(`karmapath:${password}`);
};

const loadDb = (): LocalDatabase => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalDatabase>;
      return {
        users: parsed.users || [],
        profiles: parsed.profiles || [],
        user_roles: parsed.user_roles || [],
        pandits: parsed.pandits && parsed.pandits.length > 0 ? parsed.pandits : SEEDED_PANDITS,
        bookings: parsed.bookings || [],
        contact_messages: parsed.contact_messages || [],
      };
    }
  } catch {
    // Reset corrupted state if needed
  }
  return {
    users: [],
    profiles: [],
    user_roles: [],
    pandits: SEEDED_PANDITS,
    bookings: [],
    contact_messages: [],
  };
};

const saveDb = (db: LocalDatabase) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const buildSupabaseUser = (acct: LocalAccount) => ({
  id: acct.id,
  aud: "authenticated",
  role: "authenticated",
  email: acct.email,
  email_confirmed_at: acct.created_at,
  phone: acct.phone || "",
  confirmed_at: acct.created_at,
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {
    full_name: acct.full_name,
    phone: acct.phone,
  },
  identities: [
    {
      id: acct.id,
      user_id: acct.id,
      identity_data: { email: acct.email, sub: acct.id },
      provider: "email",
      last_sign_in_at: acct.created_at,
      created_at: acct.created_at,
      updated_at: acct.updated_at,
    },
  ],
  created_at: acct.created_at,
  updated_at: acct.updated_at,
});

const buildSessionPayload = (acct: LocalAccount) => {
  const nowSec = Math.floor(Date.now() / 1000);
  const expiresIn = 86400;
  const expiresAt = nowSec + expiresIn;
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      aud: "authenticated",
      exp: expiresAt,
      iat: nowSec,
      sub: acct.id,
      email: acct.email,
      role: "authenticated",
      user_metadata: { full_name: acct.full_name, phone: acct.phone },
    }),
  );
  const accessToken = `${header}.${payload}.karmapath_local_signature`;
  const refreshToken = `kp_rt_${acct.id}_${nowSec}`;
  return {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: expiresIn,
    expires_at: expiresAt,
    refresh_token: refreshToken,
    user: buildSupabaseUser(acct),
  };
};

const extractUserIdFromHeaders = (headers?: HeadersInit): string | null => {
  if (!headers) return null;
  const h = new Headers(headers);
  const auth = h.get("Authorization") || h.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(fromBase64Url(parts[1])) as { sub?: string };
    return payload.sub || null;
  } catch {
    return null;
  }
};

const jsonResponse = (body: unknown, status = 200, extraHeaders?: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });

const parseBody = async (init?: RequestInit): Promise<Record<string, unknown>> => {
  if (!init?.body) return {};
  if (typeof init.body === "string") {
    try {
      return JSON.parse(init.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
};

const handleAuthEndpoint = async (url: URL, method: string, init?: RequestInit): Promise<Response> => {
  const path = url.pathname.replace(/^\/auth\/v1/, "");
  const db = loadDb();

  if (method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (path === "/signup" && method === "POST") {
    const body = await parseBody(init);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const meta = (body.data && typeof body.data === "object" ? body.data : {}) as Record<string, unknown>;
    const fullName = String(meta.full_name || "").trim();
    const phone = meta.phone ? String(meta.phone).trim() : null;

    if (!email || !email.includes("@")) {
      return jsonResponse({ code: "validation_failed", msg: "Please provide a valid email address." }, 400);
    }
    if (password.length < 6) {
      return jsonResponse({ code: "weak_password", msg: "Password should be at least 6 characters." }, 422);
    }
    if (db.users.some((u) => u.email === email)) {
      return jsonResponse({ code: "user_already_exists", msg: "User already registered" }, 422);
    }

    const now = new Date().toISOString();
    const id = makeId();
    const passwordHash = await hashPassword(password);
    const newAcct: LocalAccount = {
      id,
      email,
      passwordHash,
      full_name: fullName,
      phone,
      created_at: now,
      updated_at: now,
    };

    db.users.push(newAcct);
    db.profiles.push({
      id: makeId(),
      user_id: id,
      full_name: fullName || null,
      phone,
      role: "devotee",
      avatar_url: null,
      bio: null,
      city: null,
      created_at: now,
      updated_at: now,
    });
    db.user_roles.push({
      id: makeId(),
      user_id: id,
      role: db.users.length === 1 ? "admin" : "user",
    });
    saveDb(db);

    return jsonResponse(buildSessionPayload(newAcct), 200);
  }

  if (path === "/token" && method === "POST") {
    const grantType = url.searchParams.get("grant_type");
    const body = await parseBody(init);

    if (grantType === "password") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const acct = db.users.find((u) => u.email === email);
      if (!acct) {
        return jsonResponse({ code: "invalid_credentials", msg: "Invalid login credentials" }, 400);
      }
      const candidateHash = await hashPassword(password);
      if (acct.passwordHash !== candidateHash) {
        return jsonResponse({ code: "invalid_credentials", msg: "Invalid login credentials" }, 400);
      }
      return jsonResponse(buildSessionPayload(acct), 200);
    }

    if (grantType === "refresh_token") {
      const rt = String(body.refresh_token || "");
      const match = rt.match(/^kp_rt_([0-9a-f-]+)_/i);
      const acct = match ? db.users.find((u) => u.id === match[1]) : undefined;
      if (!acct) {
        return jsonResponse({ code: "session_not_found", msg: "Session expired" }, 400);
      }
      return jsonResponse(buildSessionPayload(acct), 200);
    }
  }

  if (path === "/user" && method === "GET") {
    const userId = extractUserIdFromHeaders(init?.headers);
    const acct = userId ? db.users.find((u) => u.id === userId) : undefined;
    if (!acct) {
      return jsonResponse({ code: "session_not_found", msg: "Not authenticated" }, 401);
    }
    return jsonResponse(buildSupabaseUser(acct), 200);
  }

  if (path === "/user" && method === "PUT") {
    const userId = extractUserIdFromHeaders(init?.headers);
    const acct = userId ? db.users.find((u) => u.id === userId) : undefined;
    if (!acct) {
      return jsonResponse({ code: "session_not_found", msg: "Not authenticated" }, 401);
    }
    const body = await parseBody(init);
    if (typeof body.password === "string" && body.password.length >= 6) {
      acct.passwordHash = await hashPassword(body.password);
    }
    acct.updated_at = new Date().toISOString();
    saveDb(db);
    return jsonResponse(buildSupabaseUser(acct), 200);
  }

  if (path === "/logout") {
    return new Response(null, { status: 204 });
  }

  if (path === "/recover" || path === "/resend") {
    return jsonResponse({}, 200);
  }

  return jsonResponse({}, 200);
};

type TableName = keyof Omit<LocalDatabase, "users">;

const applyPostgrestFilters = (rows: Record<string, unknown>[], params: URLSearchParams) => {
  let result = [...rows];

  params.forEach((rawVal, key) => {
    if (key === "select" || key === "order" || key === "limit" || key === "offset" || key === "on_conflict") {
      return;
    }
    if (rawVal.startsWith("eq.")) {
      const target = rawVal.slice(3);
      result = result.filter((row) => {
        const cell = row[key];
        if (typeof cell === "boolean") return String(cell) === target;
        if (typeof cell === "number") return String(cell) === target;
        return String(cell ?? "") === target;
      });
    }
  });

  const orderParam = params.get("order");
  if (orderParam) {
    const [col, dir] = orderParam.split(".");
    const desc = dir === "desc";
    result.sort((a, b) => {
      const va = a[col];
      const vb = b[col];
      if (va === vb) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      return (va > vb ? 1 : -1) * (desc ? -1 : 1);
    });
  }

  const limitParam = params.get("limit");
  if (limitParam) {
    const n = Number(limitParam);
    if (!Number.isNaN(n) && n >= 0) {
      result = result.slice(0, n);
    }
  }

  const selectParam = params.get("select");
  if (selectParam && selectParam !== "*") {
    const cols = selectParam
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length > 0 && !cols.includes("*")) {
      result = result.map((row) => {
        const projected: Record<string, unknown> = {};
        for (const col of cols) {
          if (col in row) projected[col] = row[col];
        }
        return projected;
      });
    }
  }

  return result;
};

const handleRestEndpoint = async (url: URL, method: string, init?: RequestInit): Promise<Response> => {
  if (method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const table = url.pathname.replace(/^\/rest\/v1\//, "").split("/")[0] as TableName;
  const db = loadDb();
  if (!(table in db) || table === ("users" as string)) {
    return jsonResponse([], 200);
  }

  const headers = new Headers(init?.headers);
  const accept = headers.get("Accept") || "";
  const prefer = headers.get("Prefer") || "";
  const wantsSingleObject = accept.includes("application/vnd.pgrst.object+json");
  const rows = db[table] as unknown as Record<string, unknown>[];

  if (method === "HEAD" || method === "GET") {
    const filtered = applyPostgrestFilters(rows, url.searchParams);
    const rangeHeader =
      filtered.length > 0 ? `0-${filtered.length - 1}/${filtered.length}` : `*/0`;

    if (method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers: { "Content-Range": rangeHeader },
      });
    }

    if (wantsSingleObject) {
      if (filtered.length !== 1) {
        return jsonResponse(
          {
            code: "PGRST116",
            details: `The result contains ${filtered.length} rows`,
            hint: null,
            message: "JSON object requested, multiple (or no) rows returned",
          },
          406,
        );
      }
      return jsonResponse(filtered[0], 200, { "Content-Range": rangeHeader });
    }

    return jsonResponse(filtered, 200, { "Content-Range": rangeHeader });
  }

  if (method === "POST") {
    const rawBody = init?.body ? JSON.parse(String(init.body)) : {};
    const incomingList = Array.isArray(rawBody) ? rawBody : [rawBody];
    const now = new Date().toISOString();
    const onConflict = url.searchParams.get("on_conflict");
    const isUpsert = prefer.includes("resolution=merge-duplicates") && Boolean(onConflict);
    const inserted: Record<string, unknown>[] = [];

    for (const item of incomingList) {
      const record = { ...(item as Record<string, unknown>) };
      if (isUpsert && onConflict && record[onConflict] != null) {
        const existingIdx = rows.findIndex((r) => r[onConflict] === record[onConflict]);
        if (existingIdx !== -1) {
          rows[existingIdx] = { ...rows[existingIdx], ...record, updated_at: now };
          inserted.push(rows[existingIdx]);
          continue;
        }
      }

      const newRow: Record<string, unknown> = {
        id: (record.id as string) || makeId(),
        created_at: (record.created_at as string) || now,
        ...record,
      };
      if (table === "bookings") {
        newRow.status = newRow.status || "pending";
        newRow.updated_at = now;
        newRow.address = newRow.address ?? null;
        newRow.notes = newRow.notes ?? null;
        newRow.pandit_id = newRow.pandit_id ?? null;
        newRow.phone = newRow.phone ?? null;
      } else if (table === "contact_messages") {
        newRow.is_read = false;
      } else if (table === "profiles") {
        newRow.role = newRow.role || "devotee";
        newRow.updated_at = now;
      }
      rows.push(newRow);
      inserted.push(newRow);
    }

    saveDb(db);
    if (wantsSingleObject) {
      return jsonResponse(inserted[0] ?? null, 201);
    }
    return jsonResponse(inserted, 201);
  }

  if (method === "PATCH") {
    const patch = await parseBody(init);
    const matching = applyPostgrestFilters(rows, url.searchParams);
    const ids = new Set(matching.map((m) => m.id));
    const now = new Date().toISOString();
    const updated: Record<string, unknown>[] = [];

    for (let i = 0; i < rows.length; i++) {
      if (ids.has(rows[i].id)) {
        rows[i] = { ...rows[i], ...patch, updated_at: now };
        updated.push(rows[i]);
      }
    }
    saveDb(db);
    return jsonResponse(wantsSingleObject ? (updated[0] ?? null) : updated, 200);
  }

  if (method === "DELETE") {
    const matching = applyPostgrestFilters(rows, url.searchParams);
    const ids = new Set(matching.map((m) => m.id));
    (db[table] as unknown as Record<string, unknown>[]) = rows.filter((r) => !ids.has(r.id));
    saveDb(db);
    return jsonResponse(matching, 200);
  }

  return jsonResponse([], 200);
};

const buildCuratedSamagri = (pujaType: string) => {
  const base = [
    { name: "Pure Cow Ghee", nameNepali: "गाईको शुद्ध घिउ", category: "oils", description: `Sacred oblation for Agni Havan and Panchamrit in ${pujaType}.`, quantity: "500 g", estimatedPriceNPR: 750, essential: true, whereToFind: "Dairy pasal or Asan Bazaar" },
    { name: "Kalash (Copper Pot)", nameNepali: "तामाको कलश", category: "metals", description: "Installed at the northeast altar to invoke Varuna and sacred rivers.", quantity: "1 piece", estimatedPriceNPR: 650, essential: true, whereToFind: "Any puja bhandar / Patan metal shop" },
    { name: "Whole Coconut with Husk", nameNepali: "जटा नरिवल", category: "fruits", description: "Placed atop the mango-leaf Kalash wrapped in sacred red cloth.", quantity: "2 pieces", estimatedPriceNPR: 240, essential: true, whereToFind: "Puja pasal near temple" },
    { name: "Fresh Mango Leaves", nameNepali: "आँपको पल्लव", category: "flowers", description: "Five or seven leaves arranged around the Kalash rim for auspiciousness.", quantity: "2 bunches", estimatedPriceNPR: 80, essential: true, whereToFind: "Local flower vendor" },
    { name: "Akshata (Unbroken Rice)", nameNepali: "अक्षता चामल", category: "grains", description: "Mixed with abir and curd for Sankalpa, invocation, and Tika blessings.", quantity: "1 kg", estimatedPriceNPR: 180, essential: true, whereToFind: "Kirana / grocery shop" },
    { name: "Kush / Darbha Grass", nameNepali: "कुश", category: "sacred", description: "Worn as Pavitri ring by the Karta for ritual purification during mantras.", quantity: "1 bundle", estimatedPriceNPR: 60, essential: true, whereToFind: "Puja pasal" },
    { name: "Sacred Thread (Janai & Rakshabandhan)", nameNepali: "जनै र रक्षासूत्र (मौली)", category: "sacred", description: "Offered to deities and tied on the wrist during Sankalpa protection.", quantity: "2 rolls / 3 threads", estimatedPriceNPR: 90, essential: true, whereToFind: "Puja pasal" },
    { name: "Havan Samagri Herbs Mix", nameNepali: "हवन सामग्री (चरु)", category: "spices", description: "Blend of sandalwood, til, jau, guggul, and herbs offered with Svaha.", quantity: "500 g", estimatedPriceNPR: 280, essential: true, whereToFind: "Any puja pasal" },
    { name: "Black Sesame & Barley", nameNepali: "कालो तिल र जौ", category: "grains", description: "Essential Vedic grains for Arghya, Homa, and planetary shanti.", quantity: "250 g each", estimatedPriceNPR: 160, essential: true, whereToFind: "Asan Bazaar / puja pasal" },
    { name: "Abir, Kesari & Kumkum", nameNepali: "अबिर, केशरी र सिन्दूर", category: "sacred", description: "Sacred vermillion and saffron powders for Ganesh, Kalash, and Navagraha puja.", quantity: "3 packets", estimatedPriceNPR: 120, essential: true, whereToFind: "Any puja pasal" },
    { name: "Betel Nuts & Cloves", nameNepali: "सुपारी र ल्वाङ", category: "spices", description: "Represents symbolic seat of Ganesh and Navagraha deities on rice mounds.", quantity: "25 pieces", estimatedPriceNPR: 150, essential: true, whereToFind: "Puja pasal" },
    { name: "Camphor & Cotton Wicks", nameNepali: "कपुर र कपासको बत्ती", category: "oils", description: "Used for Pancha Aarti and concluding Karpur Gauram aarti.", quantity: "1 box + 108 wicks", estimatedPriceNPR: 140, essential: true, whereToFind: "Puja pasal" },
    { name: "Marigold Garland & Loose Flowers", nameNepali: "सयपत्री फूल र माला", category: "flowers", description: "Fresh floral offerings for Pushpanjali and mandap decoration.", quantity: "3 malas + 500 g", estimatedPriceNPR: 350, essential: true, whereToFind: "Pashupati / local flower market" },
    { name: "Red & White Altar Cloth", nameNepali: "रातो र सेतो वस्त्र", category: "fabrics", description: "Spread over wooden chowki for deity sthapana and Navagraha mandala.", quantity: "2 meters", estimatedPriceNPR: 320, essential: false, whereToFind: "Cloth shop / puja bhandar" },
    { name: "Panchamrit Ingredients (Honey & Mishri)", nameNepali: "मह र मिश्री", category: "fruits", description: "Blended with milk, curd, and ghee for sacred Abhishek snan.", quantity: "100 g each", estimatedPriceNPR: 260, essential: false, whereToFind: "Grocery / puja pasal" },
    { name: "Seasonal Five Fruits (Panchaphal)", nameNepali: "पञ्चफल (केरा, स्याउ आदि)", category: "fruits", description: "Naivedya offering distributed as blessed prasad after completion.", quantity: "2 kg assorted", estimatedPriceNPR: 480, essential: false, whereToFind: "Local fruit market" },
  ];
  return base;
};

const buildPanditReply = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes("satyanarayan")) {
    return `Namaste 🙏\n\nFor **सत्यनारायण पूजा (Satyanarayan Puja)**, Purnima (Full Moon) and Ekadashi/Sankranti are especially auspicious.\n\n### Essential Preparation\n- **Altar:** Place a clean wooden chowki facing **East** covered with red/yellow cloth, a **Kalash** with mango leaves & coconut, and Lord Vishnu's image.\n- **Panchamrit & Prasad:** Prepare *Panjeeri* (roasted wheat flour in cow ghee with sugar & fruits), *Panchamrit*, Tulsi leaves, and bananas.\n- **Procedure:** Begin with **Ganesh & Navagraha Puja**, listen attentively to all **5 chapters of Satyanarayan Katha**, and conclude with **Karpur Aarti**.\n\nYou can generate the full NPR shopping checklist in [Samagri Marketplace](/marketplace) or book a verified Pandit on [Services](/services#booking).\n\nॐ नमो भगवते वासुदेवाय 🙏`;
  }
  if (q.includes("bratabandha") || q.includes("upanayana") || q.includes("janai")) {
    return `Namaste 🙏\n\n**ब्रतबन्ध / उपनयन संस्कार (Bratabandha)** marks spiritual initiation and receiving the **Gayatri Mantra**.\n\n### Key Steps\n1. **पूर्वाङ्ग र मुण्डन (Purification & Mundan):** Ritual bath and head-shaving on the auspicious Lagna.\n2. **यज्ञोपवीत धारण (Janai Dharan):** Investing the three-stranded sacred thread over the left shoulder.\n3. **गायत्री दीक्षा (Gayatri Diksha):** The Acharya whispers *ॐ भूर्भुवः स्वः...* into the initiate's right ear.\n4. **अग्नि हवन र भिक्षा (Havan & Bhiksha):** Offering oblations to Agni and symbolically receiving first alms from the mother.\n\nVisit [Services](/services#booking) to match with a Yajurveda/Rigveda Pandit for your family's kul-parampara.\n\nॐ शान्तिः शान्तिः शान्तिः 🙏`;
  }
  if (q.includes("griha") || q.includes("house") || q.includes("vastu")) {
    return `Namaste 🙏\n\n**गृह प्रवेश (Griha Pravesh & Vastu Shanti)** sanctifies your new home before moving in.\n\n### Auspicious Guidelines\n- **Best Months:** Baishakh, Jestha, Mangsir, Magh, and Falgun during Shukla Paksha.\n- **Entrance Ritual:** Hang fresh mango-leaf *torans*, carry the **Mangal Kalash** inside leading with the right foot, and boil milk in the new kitchen until it overflows (symbolizing abundance).\n- **Havan:** Perform **Ganesh, Navagraha, Dikpala, and Vastu Purusha Homa** in the Northeast (*Ishan*) corner.\n\nBook a Jyotish-verified Muhurta and Pandit on [Services](/services#booking).\n\n शुभम् भवतु 🙏`;
  }
  if (q.includes("gayatri") || q.includes("mantra")) {
    return `Namaste 🙏\n\n### गायत्री मन्त्र (Gayatri Mantra)\n> **ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥**\n\n- **Transliteration:** *Om Bhur Bhuvah Svah, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat.*\n- **Meaning:** We meditate upon the divine spiritual effulgence of Savitur (the Creator); may that supreme light illuminate our intellect along the path of Dharma.\n- **How to Chant:** Sit facing **East** at *Brahma Muhurta* or sunrise on a clean asana, keeping spine upright, and chant **11, 21, or 108 times** with steady breath.\n\nॐ शान्ति 🙏`;
  }
  return `Namaste 🙏\n\nThank you for your question on **Sanatan Dharma & Nepali Karmakanda**.\n\n- **For Ceremony Preparation:** Begin every ritual with physical cleanliness (*Achaman*), a clear **Sankalpa** (stating Tithi, Nakshatra, Gotra, and purpose), **Ganesh Puja**, and **Kalash Sthapana**.\n- **Samagri Checklist:** Use our [Samagri Marketplace](/marketplace) for exact Nepali item names, quantities, and local prices.\n- **Verified Purohits:** Visit [Services](/services#booking) to schedule an experienced Pandit in Kathmandu, Lalitpur, Bhaktapur, Pokhara, or across Nepal.\n\nAsk me about any specific ritual (*Namakaran, Bratabandha, Vivah, Griha Pravesh, Satyanarayan, Rudri, or Shraddha*) for step-by-step guidance!\n\nॐ सर्वे भवन्तु सुखिनः 🙏`;
};

const handleFunctionsEndpoint = async (url: URL, method: string, init?: RequestInit): Promise<Response> => {
  if (method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  const fnName = url.pathname.replace(/^\/functions\/v1\//, "").split("/")[0];
  const body = await parseBody(init);

  if (fnName === "recommend-samagri") {
    const pujaType = String(body.pujaType || "Vedic Puja");
    return jsonResponse(buildCuratedSamagri(pujaType), 200);
  }

  if (fnName === "ask-pandit") {
    const messages = Array.isArray(body.messages) ? (body.messages as { role?: string; content?: string }[]) : [];
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const answer = buildPanditReply(lastUser);
    const encoder = new TextEncoder();
    const words = answer.split(/(\s+)/);

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of words) {
          const payload = JSON.stringify({ choices: [{ delta: { content: chunk } }] });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/event-stream; charset=utf-8" },
    });
  }

  return jsonResponse({}, 200);
};

export const handleLocalSupabaseRequest = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const url = new URL(rawUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();

  if (url.pathname.startsWith("/auth/v1")) {
    return handleAuthEndpoint(url, method, init);
  }
  if (url.pathname.startsWith("/rest/v1")) {
    return handleRestEndpoint(url, method, init);
  }
  if (url.pathname.startsWith("/functions/v1")) {
    return handleFunctionsEndpoint(url, method, init);
  }
  return jsonResponse({}, 200);
};

export const resilientSupabaseFetch: typeof fetch = async (input, init) => {
  if (remoteOffline) {
    return handleLocalSupabaseRequest(input, init);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const mergedInit: RequestInit = {
      ...init,
      signal: init?.signal || controller.signal,
    };
    try {
      const response = await globalThis.fetch(input, mergedInit);
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  } catch {
    remoteOffline = true;
    return handleLocalSupabaseRequest(input, init);
  }
};

export const checkSupabaseCloudOnline = async (supabaseUrl?: string, anonKey?: string): Promise<boolean> => {
  if (remoteOffline || !supabaseUrl) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await globalThis.fetch(`${supabaseUrl}/auth/v1/health`, {
      method: "GET",
      headers: anonKey ? { apikey: anonKey } : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok || res.status < 500;
  } catch {
    remoteOffline = true;
    return false;
  }
};
