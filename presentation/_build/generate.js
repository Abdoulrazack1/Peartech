const pptxgen = require("pptxgenjs");
const DOMAINS = require("./domains.js");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.author = "PearTech";
pres.title = "PearTech — Architecture Backend (API REST)";

const W = 13.333, H = 7.5;
const INK = "11231A", INK2 = "1C3526", PEAR = "7CB342", PEARD = "4E7A24", MINT = "AED581";
const TEXT = "1A2620", MUTED = "5E6E60", PANEL = "F3F7EC", BORDER = "D9E2CC", WHITE = "FFFFFF";
const BLUET = "E3EEFB", BLUED = "1565C0", GREENT = "EAF3DD", AMBERT = "FBF0D8", AMBERD = "9A6A00", REDT = "FBE5E5", REDD = "C62828";

const SEM = {
  GET: { bg: BLUET, fg: BLUED }, POST: { bg: GREENT, fg: "2E7D32" }, PUT: { bg: AMBERT, fg: AMBERD }, DELETE: { bg: REDT, fg: REDD },
  C: { bg: GREENT, fg: "2E7D32" }, R: { bg: BLUET, fg: BLUED }, U: { bg: AMBERT, fg: AMBERD }, D: { bg: REDT, fg: REDD },
  public: { bg: GREENT, fg: "2E7D32" }, token: { bg: AMBERT, fg: AMBERD }, admin: { bg: REDT, fg: REDD },
};
const ACCLABEL = { public: "Public", token: "Connecte", admin: "Admin" };
const FH = "Cambria", FB = "Calibri", FM = "Courier New";
const NB_ENDPOINTS = DOMAINS.reduce((n, d) => n + d.ep.length, 0);

const MENU_SLIDE = 29;
const SEC_HUB = 16;
const ADMIN_HUB = 42;
let _n = 0;
function slide() { _n++; return pres.addSlide(); }
const shadow = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 90, opacity: 0.13 });

function card(s, x, y, w, h, fill, opt = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: opt.r || 0.1, fill: { color: fill }, line: opt.line ? { color: opt.line, width: opt.lw || 1 } : { type: "none" }, shadow: opt.shadow ? shadow() : undefined });
}
function badge(s, x, y, text, kind, w) {
  const c = SEM[kind] || { bg: PANEL, fg: TEXT };
  const ww = w || Math.max(0.55, text.length * 0.085 + 0.22);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: ww, h: 0.3, rectRadius: 0.04, fill: { color: c.bg }, line: { type: "none" } });
  s.addText(text, { x, y, w: ww, h: 0.3, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 11, bold: true, color: c.fg });
  return ww;
}
function pageFurniture(s, dark) {
  const col = dark ? "8FA38C" : MUTED;
  s.addText("PearTech · API REST backend", { x: 0.55, y: H - 0.42, w: 5, h: 0.3, margin: 0, fontFace: FB, fontSize: 9, color: col });
  s.addText(String(_n), { x: W - 1.05, y: H - 0.42, w: 0.5, h: 0.3, margin: 0, align: "right", fontFace: FB, fontSize: 9, color: col });
}
function menuButton(s, dark) {
  const bg = dark ? INK2 : PANEL, fg = dark ? MINT : PEARD;
  const x = W - 2.0, y = 0.42, w = 1.45, h = 0.4;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: bg }, line: { color: dark ? PEARD : BORDER, width: 1 } });
  s.addText("⌂  Menu", { x, y, w, h, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 12, bold: true, color: fg, hyperlink: { slide: MENU_SLIDE, tooltip: "Aller au menu" } });
}
function backChip(s, label, target) {
  const x = W - 3.55, y = 0.42, w = 1.5, h = 0.4;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: PANEL }, line: { color: BORDER, width: 1 } });
  s.addText(label, { x, y, w, h, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 12, bold: true, color: PEARD, hyperlink: { slide: target, tooltip: "Retour" } });
}
const secButton = (s) => backChip(s, "‹ Sécurité", SEC_HUB);
const adminButton = (s) => backChip(s, "‹ Admin", ADMIN_HUB);
function title(s, kicker, ttl, dark) {
  if (kicker) s.addText(kicker.toUpperCase(), { x: 0.55, y: 0.42, w: 9, h: 0.3, margin: 0, fontFace: FB, fontSize: 12, bold: true, charSpacing: 2, color: dark ? MINT : PEARD });
  s.addText(ttl, { x: 0.5, y: 0.68, w: 11, h: 0.7, margin: 0, fontFace: FH, fontSize: 28, bold: true, color: dark ? WHITE : TEXT });
}
function bullets(s, items, x, y, w, h, opt = {}) {
  s.addText(items.map((t) => (typeof t === "string"
    ? { text: t, options: { bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: opt.gap || 9 } }
    : { text: t.t, options: { bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: opt.gap || 9, bold: t.b, color: t.c || opt.color || TEXT } })),
    { x, y, w, h, margin: 0, fontFace: FB, fontSize: opt.fs || 13, color: opt.color || TEXT, lineSpacingMultiple: 1.07 });
}
function arrowDown(s, x, y1, y2, color) { s.addShape(pres.shapes.LINE, { x, y: y1, w: 0, h: y2 - y1, line: { color: color || PEAR, width: 2, endArrowType: "triangle" } }); }
function arrowRight(s, x1, x2, y, color) { s.addShape(pres.shapes.LINE, { x: x1, y, w: x2 - x1, h: 0, line: { color: color || PEAR, width: 2, endArrowType: "triangle" } }); }
function chainRow(s, x, y, items) {
  let cx = x;
  items.forEach((it, i) => {
    const w = Math.max(0.9, it.length * 0.085 + 0.34);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y, w, h: 0.42, rectRadius: 0.06, fill: { color: PANEL }, line: { color: BORDER, width: 1 } });
    s.addText(it, { x: cx, y, w, h: 0.42, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 11.5, color: TEXT });
    cx += w;
    if (i < items.length - 1) { s.addText("→", { x: cx, y, w: 0.34, h: 0.42, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 14, bold: true, color: PEAR }); cx += 0.34; }
  });
}
function codeBlock(s, x, y, w, h, lines, fs) {
  card(s, x, y, w, h, INK, { r: 0.1 });
  const runs = lines.map((ln) => {
    const c = ln.trim().startsWith("//") ? "8FB98C" : "E8F0E2";
    return { text: ln === "" ? " " : ln, options: { breakLine: true, color: c, fontFace: FM, fontSize: fs || 12 } };
  });
  s.addText(runs, { x: x + 0.28, y: y + 0.22, w: w - 0.55, h: h - 0.4, margin: 0, valign: "top", lineSpacingMultiple: 1.06 });
}

// ============================================================ 1 — TITLE
(() => {
  const s = slide(); s.background = { color: INK };
  s.addShape(pres.shapes.OVAL, { x: 10.2, y: 1.0, w: 4.2, h: 4.2, fill: { color: INK2 } });
  s.addShape(pres.shapes.OVAL, { x: 11.0, y: 1.8, w: 2.6, h: 2.6, fill: { color: PEARD } });
  s.addShape(pres.shapes.OVAL, { x: 11.55, y: 2.35, w: 1.5, h: 1.5, fill: { color: PEAR } });
  s.addText("DOSSIER TECHNIQUE · DWWM", { x: 0.7, y: 1.55, w: 8, h: 0.4, margin: 0, fontFace: FB, fontSize: 14, bold: true, charSpacing: 3, color: MINT });
  s.addText("PearTech — le backend en détail", { x: 0.62, y: 2.0, w: 9.2, h: 1.4, margin: 0, fontFace: FH, fontSize: 44, bold: true, color: WHITE });
  s.addText("API REST · Node.js + Express · MySQL — des fondamentaux du web jusqu'au code de chaque domaine.",
    { x: 0.7, y: 3.5, w: 8.8, h: 0.9, margin: 0, fontFace: FB, fontSize: 16, color: "C7D6BF", lineSpacingMultiple: 1.15 });
  const stats = [["9", "domaines"], ["4", "couches"], ["13", "tables"], [String(NB_ENDPOINTS), "endpoints"]];
  let sx = 0.7;
  stats.forEach(([n, l]) => {
    s.addText(n, { x: sx, y: 4.85, w: 1.6, h: 0.7, margin: 0, fontFace: FH, fontSize: 38, bold: true, color: PEAR });
    s.addText(l, { x: sx, y: 5.55, w: 1.9, h: 0.35, margin: 0, fontFace: FB, fontSize: 13, color: "C7D6BF" });
    sx += 2.15;
  });
  s.addText("Un parcours complet : fondamentaux → architecture → sécurité → données → domaines → code.", { x: 0.7, y: 6.55, w: 9.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 12, italic: true, color: "8FA38C" });
  s.addNotes("Intro. Parcours des fondamentaux au code. 9 domaines, 4 couches, 13 tables, " + NB_ENDPOINTS + " endpoints.");
})();

// ============================================================ 2 — API REST
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Fondamentaux", "Une API REST, c'est quoi ?"); menuButton(s);
  s.addText("L'API est la seule porte d'entrée du backend. Le front (pages HTML du dossier ordi/) ne touche jamais la base : il demande, l'API répond.",
    { x: 0.62, y: 1.62, w: 6.7, h: 0.9, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.12 });
  bullets(s, [
    { t: "API = Application Programming Interface : la liste des « commandes » offertes par le backend.", b: false },
    "REST : chaque ressource (produit, commande…) a une URL, manipulée avec les verbes HTTP.",
    "Échanges en JSON : un format texte léger que le JavaScript du front lit directement.",
    "Sans état (stateless) : chaque requête porte elle-même son identité (le token JWT).",
    "Découplage : le même backend peut servir le site, une future app mobile, un partenaire…",
  ], 0.62, 2.65, 6.7, 3.7, { fs: 13 });
  const dx = 7.75, dw = 4.85, boxes = [["Front — pages HTML (ordi/)", "le navigateur du client", "ECEFEA"], ["API REST — Express", "routes → controllers → services", GREENT], ["Base MySQL", "13 tables relationnelles", BLUET]], ys = [1.95, 3.55, 5.15];
  boxes.forEach((b, i) => {
    card(s, dx, ys[i], dw, 1.0, b[2], { line: BORDER, shadow: true, r: 0.1 });
    s.addText(b[0], { x: dx + 0.22, y: ys[i] + 0.16, w: dw - 0.4, h: 0.4, margin: 0, fontFace: FB, fontSize: 15, bold: true, color: TEXT });
    s.addText(b[1], { x: dx + 0.22, y: ys[i] + 0.56, w: dw - 0.4, h: 0.34, margin: 0, fontFace: FB, fontSize: 11.5, color: MUTED });
  });
  arrowDown(s, dx + 0.55, 2.98, 3.5, PEAR);
  s.addText("requête — GET /api/produits", { x: dx + 0.85, y: 3.02, w: 3.8, h: 0.4, margin: 0, fontFace: FB, fontSize: 11, italic: true, color: PEARD, valign: "middle" });
  arrowDown(s, dx + 0.55, 4.58, 5.1, BLUED);
  s.addText("requête SQL préparée", { x: dx + 0.85, y: 4.62, w: 3.8, h: 0.4, margin: 0, fontFace: FB, fontSize: 11, italic: true, color: BLUED, valign: "middle" });
  s.addText("↑ la réponse remonte en sens inverse : MySQL → API → JSON → front", { x: dx, y: 6.3, w: dw + 0.1, h: 0.4, margin: 0, fontFace: FB, fontSize: 11.5, italic: true, color: MUTED });
  pageFurniture(s);
})();

// ============================================================ 3 — ANATOMIE REQUETE/REPONSE
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Fondamentaux", "Anatomie d'une requête et d'une réponse"); menuButton(s);
  card(s, 0.62, 1.7, 6.0, 3.45, INK, { r: 0.1 });
  s.addText("LA REQUÊTE  (envoyée par le front)", { x: 0.85, y: 1.88, w: 5.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, charSpacing: 1, color: MINT });
  s.addText([
    { text: "POST /api/auth/connexion", options: { breakLine: true, color: PEAR, fontFace: FM, fontSize: 13, bold: true } },
    { text: "Authorization: Bearer eyJhbGciOi...", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "Content-Type: application/json", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: " ", options: { breakLine: true, fontSize: 6 } },
    { text: "{", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "  \"email\": \"lea@mail.fr\",", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "  \"motDePasse\": \"azerty123\"", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "}", options: { color: "E8F0E2", fontFace: FM, fontSize: 12 } },
  ], { x: 0.85, y: 2.3, w: 5.6, h: 2.7, margin: 0, valign: "top", lineSpacingMultiple: 1.2 });
  card(s, 6.85, 1.7, 6.0, 3.45, INK, { r: 0.1 });
  s.addText("LA RÉPONSE  (renvoyée par l'API)", { x: 7.08, y: 1.88, w: 5.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, charSpacing: 1, color: MINT });
  s.addText([
    { text: "200 OK", options: { breakLine: true, color: "AED581", fontFace: FM, fontSize: 13, bold: true } },
    { text: "Content-Type: application/json", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: " ", options: { breakLine: true, fontSize: 6 } },
    { text: "{", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "  \"message\": \"Connexion réussie.\",", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "  \"token\": \"eyJhbGciOiJIUzI1...\",", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "  \"utilisateur\": { \"id\": 4, \"role\": ", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "                   \"client\" }", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "}", options: { color: "E8F0E2", fontFace: FM, fontSize: 12 } },
  ], { x: 7.08, y: 2.3, w: 5.6, h: 2.7, margin: 0, valign: "top", lineSpacingMultiple: 1.2 });
  card(s, 0.62, 5.35, 12.23, 1.3, PANEL, { r: 0.1 });
  s.addText("LES 4 PARTIES", { x: 0.9, y: 5.5, w: 5, h: 0.3, margin: 0, fontFace: FB, fontSize: 10.5, bold: true, charSpacing: 1.5, color: PEARD });
  const parts = [["Méthode + URL", "l'action et la ressource visées"], ["En-têtes", "métadonnées, dont Authorization: Bearer"], ["Corps (body)", "les données envoyées, en JSON"], ["Réponse", "un code de statut + un corps JSON"]];
  let px = 0.9;
  parts.forEach(([h2, d]) => {
    s.addText([{ text: h2 + " — ", options: { bold: true, color: TEXT } }, { text: d, options: { color: MUTED } }], { x: px, y: 5.85, w: 2.95, h: 0.75, margin: 0, fontFace: FB, fontSize: 11.5, lineSpacingMultiple: 1.05 });
    px += 3.0;
  });
  pageFurniture(s);
})();

// ============================================================ 4 — CODES DE STATUT
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Fondamentaux", "Les codes de statut HTTP"); menuButton(s);
  s.addText("La réponse commence toujours par un nombre : il dit en un coup d'œil si la requête a réussi, et sinon pourquoi.",
    { x: 0.62, y: 1.55, w: 12, h: 0.4, margin: 0, fontFace: FB, fontSize: 13.5, italic: true, color: MUTED });
  const codes = [["200", "OK", "lecture / mise à jour réussie", "g"], ["201", "Created", "inscription · ajout panier · commande", "g"], ["400", "Bad Request", "saisie invalide (valider)", "a"], ["401", "Unauthorized", "non connecté / token invalide", "a"], ["403", "Forbidden", "connecté mais pas administrateur", "a"], ["404", "Not Found", "ressource introuvable", "a"], ["409", "Conflict", "email ou avis en double", "a"], ["500", "Server Error", "bug serveur (détail masqué)", "r"]];
  const FILL = { g: GREENT, a: AMBERT, r: REDT }, FG = { g: "2E7D32", a: AMBERD, r: REDD };
  const cw = 2.95, ch = 1.9, gx = 0.18, gy = 0.22;
  codes.forEach((c, i) => {
    const r = Math.floor(i / 4), col = i % 4, x = 0.62 + col * (cw + gx), y = 2.15 + r * (ch + gy);
    card(s, x, y, cw, ch, FILL[c[3]], { r: 0.1, shadow: true });
    s.addText(c[0], { x: x + 0.25, y: y + 0.22, w: 1.6, h: 0.7, margin: 0, fontFace: FH, fontSize: 36, bold: true, color: FG[c[3]] });
    s.addText(c[1], { x: x + 0.27, y: y + 0.98, w: cw - 0.5, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: FG[c[3]] });
    s.addText(c[2], { x: x + 0.27, y: y + 1.33, w: cw - 0.5, h: 0.5, margin: 0, fontFace: FB, fontSize: 11, color: TEXT, lineSpacingMultiple: 1.04 });
  });
  s.addText("Famille : 2xx = succès (vert) · 4xx = erreur côté client (ambre) · 5xx = erreur côté serveur (rouge).", { x: 0.62, y: 6.5, w: 12, h: 0.4, margin: 0, fontFace: FB, fontSize: 12, italic: true, color: MUTED });
  pageFurniture(s);
})();

// ============================================================ 5 — ROUTES & VERBES
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Fondamentaux", "Les routes : les portes d'entrée de l'API"); menuButton(s);
  s.addText("Une route = une URL + un verbe HTTP → une action précise. C'est le plan d'adressage de l'API.",
    { x: 0.62, y: 1.6, w: 6.6, h: 0.6, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.12 });
  const verbs = [["GET", "lire"], ["POST", "créer"], ["PUT", "modifier"], ["DELETE", "supprimer"]];
  let vx = 0.62;
  verbs.forEach(([v, a]) => {
    const c = SEM[v];
    card(s, vx, 2.4, 1.55, 0.95, c.bg, { r: 0.1 });
    s.addText(v, { x: vx, y: 2.51, w: 1.55, h: 0.35, align: "center", margin: 0, fontFace: FB, fontSize: 14, bold: true, color: c.fg });
    s.addText(a, { x: vx, y: 2.87, w: 1.55, h: 0.32, align: "center", margin: 0, fontFace: FB, fontSize: 12.5, color: c.fg });
    vx += 1.67;
  });
  bullets(s, [
    "Dans server.js on monte chaque groupe :  app.use('/api/produits', produitRoutes).",
    "Chaque fichier route relie une URL à un contrôleur :  router.get('/:id', produit.trouver).",
    "Le fichier route ne contient AUCUNE logique : il aiguille et y branche les middlewares.",
    "Un fichier route par domaine → toutes les portes d'un domaine se lisent d'un coup d'œil.",
  ], 0.62, 3.65, 6.7, 2.7, { fs: 13 });
  card(s, 7.7, 1.95, 5.15, 4.7, PANEL, { shadow: true, r: 0.12 });
  s.addText("EXEMPLE : LE DOMAINE PRODUITS", { x: 7.95, y: 2.18, w: 4.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, charSpacing: 1.5, color: PEARD });
  const rows = [["GET", "/api/produits", "lister le catalogue"], ["GET", "/api/produits/:id", "détail d'un produit"], ["POST", "/api/produits", "créer (admin)"], ["PUT", "/api/produits/:id", "modifier (admin)"], ["DELETE", "/api/produits/:id", "supprimer (admin)"]];
  let ry = 2.6;
  rows.forEach(([v, u, r]) => {
    const c = SEM[v];
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.95, y: ry, w: 0.95, h: 0.34, rectRadius: 0.04, fill: { color: c.bg } });
    s.addText(v, { x: 7.95, y: ry, w: 0.95, h: 0.34, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 10.5, bold: true, color: c.fg });
    s.addText(u, { x: 9.0, y: ry, w: 3.6, h: 0.34, valign: "middle", margin: 0, fontFace: FM, fontSize: 11, color: TEXT });
    s.addText(r, { x: 9.0, y: ry + 0.34, w: 3.6, h: 0.3, valign: "middle", margin: 0, fontFace: FB, fontSize: 10.5, italic: true, color: MUTED });
    ry += 0.78;
  });
  pageFurniture(s);
})();

// ============================================================ 6 — MVC
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Fondamentaux", "Le MVC : séparer pour mieux régner"); menuButton(s);
  card(s, 0.62, 1.6, 12.23, 0.95, GREENT, { r: 0.1 });
  s.addText([{ text: "L'analogie du restaurant —  ", options: { bold: true, color: "2E5A12" } }, { text: "le serveur (Controller) prend la commande et apporte le plat ; la cuisine (Service + Model) prépare ; le client (front) ne va jamais en cuisine. Chacun son rôle.", options: { color: "33502A" } }],
    { x: 0.95, y: 1.6, w: 11.5, h: 0.95, valign: "middle", margin: 0, fontFace: FB, fontSize: 13 });
  const cols = [["M — Model", "Les données. Seul à parler à MySQL, en requêtes préparées. Une table = un modèle.", PEAR], ["V — View", "Ce que voit le client. Ici, pas de templates : la vue est le JSON renvoyé au front.", MINT], ["C — Controller", "Le chef d'orchestre HTTP : lit la requête, appelle la logique, renvoie la réponse.", PEAR]];
  let x = 0.62;
  cols.forEach(([t, d, c]) => {
    card(s, x, 2.8, 3.97, 2.05, PANEL, { shadow: true, r: 0.12 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 3.05, w: 0.55, h: 0.55, fill: { color: c } });
    s.addText(t, { x: x + 1.0, y: 3.08, w: 2.8, h: 0.5, valign: "middle", margin: 0, fontFace: FH, fontSize: 17, bold: true, color: TEXT });
    s.addText(d, { x: x + 0.3, y: 3.7, w: 3.4, h: 1.05, margin: 0, fontFace: FB, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.1 });
    x += 4.13;
  });
  card(s, 0.62, 5.05, 12.23, 1.45, "F1F1EC", { r: 0.1 });
  s.addText("POURQUOI SÉPARER ?", { x: 0.95, y: 5.22, w: 5, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, charSpacing: 1.5, color: PEARD });
  const why = [["Maintenable", "un bug SQL ? on ne regarde que le Model."], ["Testable", "on teste un service sans lancer Express ni HTTP."], ["Évolutif", "changer MySQL n'impacte que les Models."]];
  let wx = 0.95;
  why.forEach(([h2, d]) => {
    s.addText([{ text: h2 + " — ", options: { bold: true, color: TEXT } }, { text: d, options: { color: MUTED } }], { x: wx, y: 5.6, w: 3.85, h: 0.8, margin: 0, fontFace: FB, fontSize: 12, lineSpacingMultiple: 1.05 });
    wx += 3.97;
  });
  pageFurniture(s);
})();

// ============================================================ 7 — 4 COUCHES
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Fondamentaux", "Les 4 couches, fichier par fichier"); menuButton(s);
  const cols = [["Routes", "routes/*.js", "Déclare l'URL et la méthode. Branche les middlewares et délègue au contrôleur. Aucune logique.", PEAR], ["Controller", "controllers/*.js", "Traduit HTTP ↔ métier : lit req, appelle le service, écrit res avec le bon code. Pas de SQL.", MINT], ["Service", "services/*.js", "Porte la logique métier : vérifications, calculs, orchestration de modèles. Lève { statut, message }.", PEAR], ["Model", "models/*.js", "Seul à parler à MySQL, en requêtes préparées. Mappe snake_case ↔ camelCase. Une table = un modèle.", MINT]];
  const cw = 2.95, gap = 0.2; let x = 0.62;
  cols.forEach(([t, f, d, c]) => {
    card(s, x, 1.85, cw, 3.6, PANEL, { shadow: true, r: 0.12 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 2.1, w: 0.55, h: 0.55, fill: { color: c } });
    s.addText(t, { x: x + 0.25, y: 2.85, w: cw - 0.5, h: 0.4, margin: 0, fontFace: FH, fontSize: 18, bold: true, color: TEXT });
    s.addText(f, { x: x + 0.25, y: 3.25, w: cw - 0.5, h: 0.32, margin: 0, fontFace: FM, fontSize: 11, color: PEARD });
    s.addText(d, { x: x + 0.25, y: 3.68, w: cw - 0.5, h: 1.7, margin: 0, fontFace: FB, fontSize: 12, color: MUTED, lineSpacingMultiple: 1.12 });
    x += cw + gap;
  });
  card(s, 0.62, 5.65, 12.23, 0.95, INK, { r: 0.1 });
  s.addText([{ text: "À retenir —  ", options: { bold: true, color: MINT } }, { text: "le flux descend Routes → Controller → Service → Model, puis la réponse remonte. À côté : middlewares (sécurité) en entrée, utils (calculs) appelés par les services.", options: { color: "C7D6BF" } }],
    { x: 0.95, y: 5.65, w: 11.5, h: 0.95, valign: "middle", margin: 0, fontFace: FB, fontSize: 13 });
  pageFurniture(s);
})();

// ============================================================ 7bis — 4 COUCHES EN ACTION
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Fondamentaux", "Les 4 couches en action : GET /api/produits/5"); menuButton(s);
  s.addText("Une seule requête, et chaque couche fait UNE chose puis passe le relais à sa voisine.", { x: 0.62, y: 1.5, w: 12, h: 0.32, margin: 0, fontFace: FB, fontSize: 13, italic: true, color: MUTED });
  const steps = [
    ["Routes", "produitRoutes.js", PEAR, ["router.get('/:id', a(produit.trouver))"], "reçoit l'URL /produits/5", "→ appelle le contrôleur"],
    ["Controller", "produitController.js", MINT, ["const p = await service.trouver(req.params.id);", "if (!p) throw { statut: 404 };  res.json(p);"], "reçoit req (id = 5)", "→ renvoie la réponse JSON"],
    ["Service", "produitService.js", PEAR, ["return /^\\d+$/.test(cle)", "  ? Produit.trouverParId(cle) : ...Slug(cle);"], "reçoit « 5 »", "→ choisit la bonne requête"],
    ["Model", "produitModel.js", MINT, ["pool.query(`SELECT ... WHERE id = ?`, [5])", "→ { id:5, nom:'iPhone 15', prix:1229 }"], "reçoit 5", "→ renvoie la ligne MySQL"],
  ];
  let y = 1.92;
  steps.forEach((r, i) => {
    card(s, 0.62, y, 2.55, 1.0, PANEL, { line: BORDER, shadow: true, r: 0.1 });
    s.addShape(pres.shapes.OVAL, { x: 0.82, y: y + 0.31, w: 0.4, h: 0.4, fill: { color: r[2] } });
    s.addText(String(i + 1), { x: 0.82, y: y + 0.31, w: 0.4, h: 0.4, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 13, bold: true, color: INK });
    s.addText(r[0], { x: 1.38, y: y + 0.18, w: 1.7, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: TEXT });
    s.addText(r[1], { x: 1.38, y: y + 0.54, w: 1.75, h: 0.3, margin: 0, fontFace: FM, fontSize: 9.5, color: PEARD });
    codeBlock(s, 3.35, y, 6.15, 1.0, r[3], 11);
    s.addText([{ text: r[4], options: { breakLine: true, color: TEXT, bold: true } }, { text: r[5], options: { color: MUTED } }], { x: 9.7, y: y + 0.16, w: 3.15, h: 0.7, margin: 0, fontFace: FB, fontSize: 11.5, lineSpacingMultiple: 1.1, valign: "middle" });
    if (i < 3) arrowDown(s, 1.9, y + 1.0, y + 1.18, PEAR);
    y += 1.18;
  });
  s.addText("Puis tout remonte : Model → Service → Controller → JSON renvoyé au front. Chaque couche ne connaît que sa voisine.", { x: 0.62, y: 6.7, w: 12, h: 0.4, margin: 0, fontFace: FB, fontSize: 12.5, italic: true, color: MUTED });
  pageFurniture(s);
})();

// ============================================================ 8 — SERVICES
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Architecture", "Pourquoi une couche services ?"); menuButton(s);
  s.addText("La logique métier est complexe et réutilisée par plusieurs routes. Plutôt que de la dupliquer dans les contrôleurs, on la met UNE fois dans un service.",
    { x: 0.62, y: 1.55, w: 12.2, h: 0.5, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  codeBlock(s, 0.62, 2.2, 7.6, 3.5, [
    "// services/commandeService.js",
    "async function creerDepuisListe(userId, articles, adr) {",
    "  const prep = await preparerArticles(articles); // prix+stock",
    "  const montants = calculerMontants(prep.sousTotal);",
    "  return Commande.creer(userId, montants, adr, prep.articles);",
    "}",
    "",
    "async function creerDepuisPanier(userId, adr) {",
    "  const lignes = await Panier.lister(userId);",
    "  const articles = lignes.map(l => ({ ... }));",
    "  return creerDepuisListe(userId, articles, adr); // reutilise !",
    "}",
  ], 11.5);
  bullets(s, [
    { t: "Deux routes, UN seul calcul : /commandes et /depuis-panier appellent creerDepuisListe.", b: false },
    "Le prix est recalculé une seule fois → pas de bug de caisse.",
    "Le contrôleur reste mince : il ne fait que l'HTTP.",
    "Testable sans lancer Express ni HTTP.",
  ], 8.45, 2.35, 4.4, 3.3, { fs: 12.5, gap: 10 });
  card(s, 0.62, 5.95, 12.23, 0.75, "F1F1EC", { r: 0.1 });
  s.addText([{ text: "Pas toujours nécessaire —  ", options: { bold: true, color: TEXT } }, { text: "favoris, adresses, contact et catégories sont du CRUD simple : leur contrôleur appelle directement le modèle, sans service.", options: { color: MUTED } }],
    { x: 0.9, y: 5.95, w: 11.7, h: 0.75, valign: "middle", margin: 0, fontFace: FB, fontSize: 12 });
  pageFurniture(s);
})();

// ============================================================ 9 — UTILS
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Architecture", "Pourquoi un dossier utils ?"); menuButton(s);
  s.addText("Des fonctions PURES (sans état, sans base) partagées par plusieurs services. Une seule source de vérité pour les calculs sensibles.",
    { x: 0.62, y: 1.55, w: 12.2, h: 0.5, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  codeBlock(s, 0.62, 2.2, 7.6, 3.2, [
    "// utils/prix.js  — appele par le panier ET la commande",
    "function prixUnitaire(produit, optionsChoisies) {",
    "  return Number(produit.prix)",
    "       + calculerSupplementOptions(produit, optionsChoisies);",
    "}",
    "",
    "// utils/config.js — les constantes metier, au meme endroit",
    "module.exports = { TAUX_TVA: 0.20, FRAIS_PORT: 5.90,",
    "                   SEUIL_PORT_GRATUIT: 100 };",
  ], 11.5);
  const ut = [["prix.js", "prix + suppléments d'options"], ["config.js", "TVA, frais de port, franco 100 €"], ["email.js", "confirmation de commande (simulée)"]];
  let uy = 2.3;
  ut.forEach(([f, d]) => {
    card(s, 8.45, uy, 4.4, 0.92, AMBERT, { r: 0.1 });
    s.addText(f, { x: 8.65, y: uy + 0.12, w: 4.0, h: 0.34, margin: 0, fontFace: FM, fontSize: 13, bold: true, color: AMBERD });
    s.addText(d, { x: 8.65, y: uy + 0.46, w: 4.05, h: 0.36, margin: 0, fontFace: FB, fontSize: 11.5, color: "6B5A2A" });
    uy += 1.04;
  });
  card(s, 0.62, 5.65, 12.23, 0.85, INK, { r: 0.1 });
  s.addText([{ text: "Service vs Util —  ", options: { bold: true, color: MINT } }, { text: "un service orchestre des modèles et porte les règles d'UN domaine ; un util est un outil générique, sans dépendance, que PLUSIEURS domaines réutilisent.", options: { color: "C7D6BF" } }],
    { x: 0.95, y: 5.65, w: 11.5, h: 0.85, valign: "middle", margin: 0, fontFace: FB, fontSize: 13 });
  pageFurniture(s);
})();

// ============================================================ PIPELINE (aller-retour)
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Architecture", "Le trajet d'une requête, aller-retour"); menuButton(s);
  s.addText("La requête descend couche par couche, la réponse remonte. À l'entrée, les middlewares filtrent ; en sortie, le bon code de statut est choisi.",
    { x: 0.62, y: 1.5, w: 12.2, h: 0.4, margin: 0, fontFace: FB, fontSize: 13, italic: true, color: MUTED });

  // colonne gauche : descente
  card(s, 0.62, 2.0, 6.0, 3.9, PANEL, { r: 0.12, shadow: true });
  s.addText("①  LA REQUÊTE DESCEND", { x: 0.9, y: 2.18, w: 5.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 12.5, bold: true, charSpacing: 1, color: PEARD });
  const down = [
    ["Middlewares globaux", "helmet · cors · json · journal"],
    ["Routeur", "associe l'URL + le verbe à une route"],
    ["Middlewares de route", "verifierToken · valider (bloquent si KO)"],
    ["Controller", "lit req.params / body / utilisateur"],
    ["Service", "règles métier + utils (prix, config)"],
    ["Model → MySQL", "requête SQL préparée (paramètres ?)"],
  ];
  s.addShape(pres.shapes.LINE, { x: 1.12, y: 2.78, w: 0, h: 2.7, line: { color: PEAR, width: 2 } });
  let dy = 2.66;
  down.forEach(([t, d], i) => {
    s.addShape(pres.shapes.OVAL, { x: 0.95, y: dy, w: 0.34, h: 0.34, fill: { color: PEAR } });
    s.addText(String(i + 1), { x: 0.95, y: dy, w: 0.34, h: 0.34, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 12, bold: true, color: INK });
    s.addText([{ text: t + "  ", options: { bold: true, color: TEXT } }, { text: "— " + d, options: { color: MUTED } }], { x: 1.45, y: dy - 0.05, w: 5.0, h: 0.44, margin: 0, fontFace: FB, fontSize: 11.5, valign: "middle" });
    dy += 0.55;
  });

  // colonne droite : remontée
  card(s, 6.85, 2.0, 6.0, 3.9, "EAF1FB", { r: 0.12, shadow: true });
  s.addText("②  LA RÉPONSE REMONTE", { x: 7.13, y: 2.18, w: 5.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 12.5, bold: true, charSpacing: 1, color: BLUED });
  const up = [
    ["MySQL → Model", "renvoie les lignes trouvées"],
    ["Service", "calcule prix, totaux, met en forme"],
    ["Controller", "res.status(201).json(...) — bon code"],
    ["Le front", "reçoit le JSON et l'affiche"],
  ];
  s.addShape(pres.shapes.LINE, { x: 7.35, y: 2.78, w: 0, h: 1.65, line: { color: BLUED, width: 2 } });
  let uy = 2.66;
  up.forEach(([t, d], i) => {
    s.addShape(pres.shapes.OVAL, { x: 7.18, y: uy, w: 0.34, h: 0.34, fill: { color: BLUED } });
    s.addText(String(i + 7), { x: 7.18, y: uy, w: 0.34, h: 0.34, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 12, bold: true, color: WHITE });
    s.addText([{ text: t + "  ", options: { bold: true, color: TEXT } }, { text: "— " + d, options: { color: MUTED } }], { x: 7.68, y: uy - 0.05, w: 5.0, h: 0.44, margin: 0, fontFace: FB, fontSize: 11.5, valign: "middle" });
    uy += 0.55;
  });
  s.addText("La descente est plus longue : c'est là qu'on vérifie l'identité, les droits et la saisie avant de toucher la base.",
    { x: 7.13, y: 4.95, w: 5.5, h: 0.85, margin: 0, fontFace: FB, fontSize: 11.5, italic: true, color: BLUED, lineSpacingMultiple: 1.1 });

  // bande erreur
  card(s, 0.62, 6.1, 12.23, 0.7, REDT, { r: 0.1 });
  s.addText([{ text: "À tout moment —  ", options: { bold: true, color: REDD } }, { text: "si une couche lève une erreur (throw), on saute directement à gestionErreurs, qui renvoie le bon code (400 / 401 / 403 / 404 / 409) ou un 500 générique.", options: { color: "7A2C2C" } }],
    { x: 0.92, y: 6.1, w: 11.7, h: 0.7, valign: "middle", margin: 0, fontFace: FB, fontSize: 12 });
  pageFurniture(s);
})();

// ============================================================ 11 — MIDDLEWARES
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Architecture", "Les middlewares : des filtres avant le contrôleur"); menuButton(s);
  s.addText("Un middleware s'exécute ENTRE la requête et le contrôleur. Il peut vérifier, bloquer (renvoyer une erreur) ou laisser passer avec next().",
    { x: 0.62, y: 1.5, w: 12.2, h: 0.45, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  const chain = [["helmet · cors · json", "ECEFEA"], ["verifierToken", AMBERT], ["verifierAdmin", REDT], ["valider", BLUET], ["CONTRÔLEUR", GREENT]];
  let cx = 0.62; const cy = 2.1, ch = 0.6;
  chain.forEach((c, i) => {
    const w = Math.max(1.5, c[0].length * 0.098 + 0.42);
    card(s, cx, cy, w, ch, c[1], { line: BORDER, r: 0.09 });
    s.addText(c[0], { x: cx, y: cy, w, h: ch, align: "center", valign: "middle", margin: 0, fontFace: i === 4 ? FB : FM, fontSize: 12, bold: i === 4, color: TEXT });
    cx += w;
    if (i < chain.length - 1) { arrowRight(s, cx + 0.04, cx + 0.4, cy + ch / 2, PEAR); cx += 0.5; }
  });
  codeBlock(s, 0.62, 3.05, 7.6, 3.05, [
    "// middlewares/auth.js",
    "function verifierToken(req, res, next) {",
    "  const e = req.headers.authorization;",
    "  if (!e || !e.startsWith('Bearer '))",
    "    return res.status(401).json({ erreur: 'Token manquant.' });",
    "  try {",
    "    req.utilisateur = jwt.verify(e.split(' ')[1], SECRET);",
    "    next();                       // OK -> on laisse passer",
    "  } catch { return res.status(401)...; }   // KO -> 401",
    "}",
  ], 11);
  bullets(s, [
    { t: "verifierToken → 401 si le token est absent ou invalide.", b: false },
    "verifierAdmin → 403 si l'utilisateur n'est pas admin.",
    "valider → 400 si la saisie est invalide.",
    "asyncHandler → capture les erreurs async.",
    "L'ordre compte : comme les contrôles à l'aéroport.",
  ], 8.45, 3.2, 4.4, 2.9, { fs: 12.5, gap: 9 });
  card(s, 0.62, 6.3, 12.23, 0.5, "F1F1EC", { r: 0.08 });
  s.addText([{ text: "Globaux vs par route —  ", options: { bold: true, color: TEXT } }, { text: "helmet, cors, json, journal dans server.js (toutes les requêtes) ; verifierToken et valider posés route par route.", options: { color: MUTED } }],
    { x: 0.9, y: 6.3, w: 11.7, h: 0.5, valign: "middle", margin: 0, fontFace: FB, fontSize: 12 });
  pageFurniture(s);
})();

// ============================================================ 12 — VARIABLES D'ENVIRONNEMENT
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Architecture", "La configuration : le fichier .env"); menuButton(s);
  s.addText("Les réglages et les secrets vivent hors du code, dans un fichier .env lu au démarrage par dotenv et exposé via process.env.",
    { x: 0.62, y: 1.6, w: 6.7, h: 0.7, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.12 });
  bullets(s, [
    { t: "Secrets hors du code : mot de passe BDD, clé JWT… jamais en dur dans les fichiers.", b: false },
    "Jamais committé (listé dans .gitignore) → les secrets ne partent pas sur GitHub.",
    "Config différente dev / production sans changer une ligne de code.",
    "Valeurs par défaut dans le code si une variable manque (ex. PORT || 3000).",
  ], 0.62, 2.45, 6.7, 2.8, { fs: 13 });
  codeBlock(s, 7.6, 1.95, 5.25, 4.5, [
    "// fichier .env (exemple)", "PORT=3000", "", "DB_HOST=127.0.0.1", "DB_USER=root", "DB_PASSWORD=", "DB_NAME=peartech", "", "JWT_SECRET=une_longue_chaine_secrete", "JWT_EXPIRES_IN=1h", "JWT_REFRESH_EXPIRES_IN=7d", "", "FRONT_URL=http://localhost:5500",
  ], 12.5);
  s.addText("Lu dans config/db.js et authService via process.env.DB_HOST, process.env.JWT_SECRET…", { x: 0.62, y: 5.6, w: 6.7, h: 0.6, margin: 0, fontFace: FB, fontSize: 12, italic: true, color: MUTED, lineSpacingMultiple: 1.1 });
  pageFurniture(s);
})();

// ============================================================ 13 — POOL MYSQL
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Architecture", "Le pool de connexions MySQL"); menuButton(s);
  s.addText("Ouvrir/fermer une connexion à chaque requête serait lent. Le pool garde un stock de connexions prêtes et les recycle.",
    { x: 0.62, y: 1.55, w: 12.2, h: 0.5, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  codeBlock(s, 0.62, 2.2, 6.8, 2.7, [
    "// config/db.js",
    "const pool = mysql.createPool({",
    "  host: process.env.DB_HOST,",
    "  user: process.env.DB_USER,",
    "  database: process.env.DB_NAME,",
    "  waitForConnections: true,",
    "  connectionLimit: 10,    // 10 connexions max",
    "  charset: 'utf8mb4'      // accents + emojis",
    "});",
    "module.exports = pool;    // partage par tous les modeles",
  ], 11);
  bullets(s, [
    { t: "10 connexions réutilisées en boucle (connectionLimit).", b: false },
    "Toutes occupées → la requête attend (waitForConnections).",
    "mysql2/promise → await pool.query(...) propre.",
  ], 0.62, 5.1, 6.8, 1.5, { fs: 12, gap: 8 });
  card(s, 7.65, 2.2, 5.2, 4.05, PANEL, { shadow: true, r: 0.12 });
  s.addText("requêtes", { x: 7.85, y: 2.45, w: 1.4, h: 0.3, margin: 0, fontFace: FB, fontSize: 12, bold: true, color: MUTED });
  for (let i = 0; i < 3; i++) arrowRight(s, 7.9, 9.15, 3.2 + i * 0.55, PEAR);
  card(s, 9.3, 3.05, 1.9, 2.6, INK, { r: 0.1 });
  s.addText("POOL (10)", { x: 9.3, y: 3.18, w: 1.9, h: 0.3, align: "center", margin: 0, fontFace: FB, fontSize: 11, bold: true, color: MINT });
  for (let i = 0; i < 5; i++) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.5, y: 3.55 + i * 0.4, w: 1.5, h: 0.28, rectRadius: 0.03, fill: { color: i < 3 ? PEAR : "3A5230" } });
  arrowRight(s, 11.25, 12.35, 4.35, BLUED);
  card(s, 11.55, 3.8, 1.1, 1.1, BLUET, { r: 0.08 });
  s.addText("MySQL", { x: 11.55, y: 3.8, w: 1.1, h: 1.1, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 12, bold: true, color: BLUED });
  s.addText("vert = libre · foncé = occupée", { x: 9.3, y: 5.75, w: 3.4, h: 0.3, margin: 0, fontFace: FB, fontSize: 10.5, italic: true, color: MUTED });
  pageFurniture(s);
})();

// ============================================================ 14 — GESTION DES ERREURS
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Architecture", "La gestion des erreurs, en un seul endroit"); menuButton(s);
  s.addText("Les contrôleurs sont enveloppés par asyncHandler : toute erreur est attrapée et envoyée au gestionnaire central, qui choisit la bonne réponse.",
    { x: 0.62, y: 1.6, w: 12.0, h: 0.6, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  // flow
  const fb = [["Contrôleur", "lève une erreur", PANEL], ["asyncHandler", ".catch(next)", GREENT], ["gestionErreurs", "choisit la réponse", PANEL]];
  let fx = 0.62;
  fb.forEach((b, i) => {
    card(s, fx, 2.45, 3.4, 0.9, b[2], { line: BORDER, shadow: true, r: 0.1 });
    s.addText(b[0], { x: fx, y: 2.55, w: 3.4, h: 0.4, align: "center", margin: 0, fontFace: FB, fontSize: 15, bold: true, color: TEXT });
    s.addText(b[1], { x: fx, y: 2.95, w: 3.4, h: 0.35, align: "center", margin: 0, fontFace: FM, fontSize: 11, color: MUTED });
    fx += 3.4;
    if (i < 2) { arrowRight(s, fx + 0.05, fx + 0.5, 2.9, PEAR); fx += 0.55; }
  });
  // two branches
  card(s, 0.62, 3.9, 6.0, 2.05, GREENT, { r: 0.12 });
  s.addText("Erreur métier  { statut, message }", { x: 0.9, y: 4.08, w: 5.5, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: "2E5A12" });
  s.addText("Levée volontairement par un service. Renvoyée telle quelle avec le bon code.", { x: 0.9, y: 4.45, w: 5.5, h: 0.6, margin: 0, fontFace: FB, fontSize: 12, color: "33502A", lineSpacingMultiple: 1.08 });
  s.addText("throw { statut: 409, message: 'Email déjà pris.' }  →  409", { x: 0.9, y: 5.15, w: 5.5, h: 0.6, margin: 0, fontFace: FM, fontSize: 11.5, color: "2E5A12" });
  card(s, 6.85, 3.9, 6.0, 2.05, REDT, { r: 0.12 });
  s.addText("Erreur inattendue  (bug, SQL…)", { x: 7.13, y: 4.08, w: 5.5, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: REDD });
  s.addText("Le détail est masqué au client (sécurité) et journalisé côté serveur.", { x: 7.13, y: 4.45, w: 5.5, h: 0.6, margin: 0, fontFace: FB, fontSize: 12, color: "7A2C2C", lineSpacingMultiple: 1.08 });
  s.addText("res.status(500) → 'Une erreur interne est survenue.'", { x: 7.13, y: 5.15, w: 5.5, h: 0.6, margin: 0, fontFace: FM, fontSize: 11.5, color: REDD });
  s.addText("Et toute URL inconnue tombe sur routeIntrouvable → 404. Sans ce système, une erreur async non gérée pourrait faire planter le serveur.", { x: 0.62, y: 6.15, w: 12.2, h: 0.5, margin: 0, fontFace: FB, fontSize: 12, italic: true, color: MUTED, lineSpacingMultiple: 1.05 });
  pageFurniture(s);
})();

// ============================================================ 16 — HUB SECURITE (interactif)
if (_n + 1 !== SEC_HUB) throw new Error("Hub sécurité attendu en " + SEC_HUB + " mais sera en " + (_n + 1));
(() => {
  const s = slide(); s.background = { color: INK };
  s.addText("SÉCURITÉ — PANORAMA INTERACTIF", { x: 0.7, y: 0.48, w: 11, h: 0.32, margin: 0, fontFace: FB, fontSize: 13, bold: true, charSpacing: 2, color: MINT });
  s.addText("8 mécanismes de défense — cliquez une carte", { x: 0.62, y: 0.78, w: 11.5, h: 0.65, margin: 0, fontFace: FH, fontSize: 29, bold: true, color: WHITE });
  s.addText("Chaque carte ouvre sa fiche détaillée (pourquoi, comment, code). Le bouton « ‹ Sécurité » y ramène ici.", { x: 0.7, y: 1.45, w: 11.5, h: 0.4, margin: 0, fontFace: FB, fontSize: 13, color: "B9CBB2" });
  const items = [
    ["Authentification JWT", "qui es-tu ? (token signé)"],
    ["Autorisation & rôles", "as-tu le droit ? (admin)"],
    ["Mots de passe (bcrypt)", "jamais stockés en clair"],
    ["Anti-injection SQL", "requêtes préparées ?"],
    ["Anti-force brute", "rate-limit sur la connexion"],
    ["En-têtes & CORS", "helmet + origine du front"],
    ["Validation des entrées", "rejet en 400 avant le métier"],
    ["Journalisation & erreurs", "logs, visites, 500 masqué"],
  ];
  const cols = 4, cw = 2.95, ch = 1.72, gx = 0.18, gy = 0.22, sx0 = 0.62, sy0 = 2.0;
  items.forEach((it, i) => {
    const r = Math.floor(i / cols), c = i % cols, x = sx0 + c * (cw + gx), y = sy0 + r * (ch + gy), target = SEC_HUB + 1 + i;
    card(s, x, y, cw, ch, INK2, { r: 0.1, line: PEARD, lw: 1 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: y + 0.2, w: 0.5, h: 0.5, fill: { color: PEAR } });
    s.addText(String(i + 1), { x: x + 0.22, y: y + 0.2, w: 0.5, h: 0.5, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 15, bold: true, color: INK });
    s.addText(it[0], { x: x + 0.22, y: y + 0.76, w: cw - 0.4, h: 0.5, margin: 0, fontFace: FB, fontSize: 13, bold: true, color: WHITE, valign: "top", lineSpacingMultiple: 1.0 });
    s.addText(it[1], { x: x + 0.22, y: y + 1.26, w: cw - 0.4, h: 0.4, margin: 0, fontFace: FB, fontSize: 10.5, color: "B9CBB2" });
    s.addText("", { x, y, w: cw, h: ch, margin: 0, fill: { color: "FFFFFF", transparency: 100 }, hyperlink: { slide: target, tooltip: "Ouvrir : " + it[0] } });
  });
  s.addText(String(_n), { x: W - 1.05, y: H - 0.42, w: 0.5, h: 0.3, margin: 0, align: "right", fontFace: FB, fontSize: 9, color: "8FA38C" });
})();

// ============================================================ 16 — JWT DETAIL
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Sécurité", "Le JSON Web Token (JWT) en détail"); menuButton(s); secButton(s);
  s.addText("Une carte d'identité signée : header . payload . signature. Le serveur la signe avec JWT_SECRET et la revérifie à chaque requête.",
    { x: 0.62, y: 1.5, w: 12.2, h: 0.4, margin: 0, fontFace: FB, fontSize: 13, color: TEXT });
  const seg = [["header", "{ alg: HS256, typ: JWT }", "ECEFEA", TEXT], ["payload", "{ id: 4, role: 'client', exp }", GREENT, "2E5A12"], ["signature", "HMAC(..., JWT_SECRET)", AMBERT, AMBERD]];
  let sx = 0.62;
  seg.forEach(([t, d, bg, fg]) => {
    card(s, sx, 2.0, 3.97, 1.15, bg, { line: BORDER, shadow: true, r: 0.1 });
    s.addText(t, { x: sx + 0.2, y: 2.13, w: 3.6, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: fg });
    s.addText(d, { x: sx + 0.2, y: 2.53, w: 3.65, h: 0.55, margin: 0, fontFace: FM, fontSize: 11, color: fg });
    sx += 4.13;
  });
  codeBlock(s, 0.62, 3.4, 7.6, 2.8, [
    "// a la connexion (authService.js)",
    "const token = jwt.sign(",
    "  { id: u.id, email: u.email, role: u.role },",
    "  JWT_SECRET, { expiresIn: '1h' });",
    "",
    "// a chaque requete (middleware verifierToken)",
    "const decode = jwt.verify(token, JWT_SECRET);",
    "// -> { id: 4, role: 'client', iat, exp }",
  ], 11);
  bullets(s, [
    { t: "Access token court (1 h) + refresh token long (7 j).", b: false },
    "Envoyé à chaque requête : Authorization: Bearer <token>.",
    "Signature vérifiée → identité fiable, sans session serveur.",
    "Expiré → /api/auth/refresh en délivre un nouveau.",
  ], 8.45, 3.55, 4.4, 2.7, { fs: 12.5, gap: 9 });
  pageFurniture(s);
})();

// ============================================================ SEC — AUTORISATION / RBAC
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Sécurité", "Autorisation : qui a le droit de faire quoi ?"); menuButton(s); secButton(s);
  s.addText("L'authentification dit QUI tu es ; l'autorisation dit ce que tu PEUX faire. Deux middlewares, dans cet ordre.",
    { x: 0.62, y: 1.5, w: 12.2, h: 0.45, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT });
  card(s, 0.62, 2.05, 6.0, 1.45, AMBERT, { r: 0.12 });
  s.addText("①  verifierToken — authentification", { x: 0.9, y: 2.2, w: 5.5, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: AMBERD });
  s.addText("Lit le JWT, pose req.utilisateur { id, email, role }. Pas de token valide → 401 (non connecté).", { x: 0.9, y: 2.56, w: 5.5, h: 0.85, margin: 0, fontFace: FB, fontSize: 12, color: "6B5A2A", lineSpacingMultiple: 1.12 });
  card(s, 6.85, 2.05, 6.0, 1.45, REDT, { r: 0.12 });
  s.addText("②  verifierAdmin — autorisation", { x: 7.13, y: 2.2, w: 5.5, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: REDD });
  s.addText("Vérifie req.utilisateur.role === 'admin'. Connecté mais pas admin → 403 (interdit).", { x: 7.13, y: 2.56, w: 5.5, h: 0.85, margin: 0, fontFace: FB, fontSize: 12, color: "7A2C2C", lineSpacingMultiple: 1.12 });
  codeBlock(s, 0.62, 3.7, 7.6, 2.5, [
    "// middlewares/auth.js",
    "function verifierAdmin(req, res, next) {",
    "  if (!req.utilisateur || req.utilisateur.role !== 'admin')",
    "    return res.status(403).json(",
    "      { erreur: 'Accès réservé aux administrateurs.' });",
    "  next();",
    "}",
    "// usage : router.use(verifierToken, verifierAdmin);",
  ], 11);
  bullets(s, [
    { t: "401 ≠ 403 : 401 = pas connecté ; 403 = connecté mais sans le droit.", b: false },
    "verifierAdmin s'utilise TOUJOURS après verifierToken.",
    "Tout /api/admin et les écritures produits sont protégés ainsi.",
    "Le rôle vient du JWT (aucun appel base) → vérification instantanée.",
  ], 8.45, 3.85, 4.4, 2.3, { fs: 12.5, gap: 9 });
  pageFurniture(s);
})();

// ============================================================ 17 — BCRYPT
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Sécurité", "Les mots de passe : bcrypt, jamais en clair"); menuButton(s); secButton(s);
  s.addText("On ne stocke jamais le mot de passe tel quel. bcrypt le transforme en une empreinte irréversible ; à la connexion, on compare les empreintes.",
    { x: 0.62, y: 1.6, w: 12, h: 0.6, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  // flow inscription
  card(s, 0.62, 2.45, 2.7, 0.9, PANEL, { line: BORDER, r: 0.1 });
  s.addText("\"azerty123\"", { x: 0.62, y: 2.45, w: 2.7, h: 0.9, align: "center", valign: "middle", margin: 0, fontFace: FM, fontSize: 14, color: TEXT });
  arrowRight(s, 3.42, 4.02, 2.9, PEAR);
  s.addText("bcrypt.hash(mdp, 10)", { x: 2.85, y: 2.08, w: 2.75, h: 0.3, align: "center", margin: 0, fontFace: FB, fontSize: 11, italic: true, color: PEARD });
  card(s, 4.1, 2.45, 4.6, 0.9, GREENT, { line: BORDER, r: 0.1 });
  s.addText("$2a$10$N9qo8uLO...", { x: 4.1, y: 2.55, w: 4.6, h: 0.4, align: "center", margin: 0, fontFace: FM, fontSize: 13, bold: true, color: "2E5A12" });
  s.addText("stocké en base", { x: 4.1, y: 2.95, w: 4.6, h: 0.3, align: "center", margin: 0, fontFace: FB, fontSize: 10.5, italic: true, color: "2E5A12" });
  s.addText("À la connexion :  bcrypt.compare(\"azerty123\", hash)  →  true / false   (on ne déchiffre jamais le hash, on le recompare)",
    { x: 0.62, y: 3.65, w: 12, h: 0.4, margin: 0, fontFace: FM, fontSize: 12, color: BLUED });
  bullets(s, [
    { t: "Irréversible : on ne peut pas retrouver le mot de passe à partir du hash.", b: false },
    "Salé : deux comptes avec le même mot de passe ont deux hash différents.",
    "Coût réglable (10 tours) : volontairement lent pour décourager le bruteforce.",
    "Conséquence : même en cas de fuite de la base, les mots de passe restent protégés.",
  ], 0.62, 4.3, 12, 2.2, { fs: 13 });
  pageFurniture(s);
})();

// ============================================================ 18 — INJECTION SQL
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Sécurité", "L'injection SQL, et comment on s'en protège"); menuButton(s); secButton(s);
  s.addText("L'injection SQL = glisser du code dans un champ de saisie pour détourner la requête. La parade : les requêtes préparées (paramètres ?).",
    { x: 0.62, y: 1.6, w: 12, h: 0.6, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  card(s, 0.62, 2.4, 6.0, 3.7, REDT, { r: 0.12 });
  s.addText("✗  Dangereux — concaténation", { x: 0.9, y: 2.55, w: 5.5, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: REDD });
  codeBlock(s, 0.9, 3.0, 5.45, 1.5, ["const sql =", "  \"... WHERE email = '\" + email + \"'\";"], 12);
  s.addText("Si email vaut   ' OR '1'='1   la condition devient toujours vraie → toute la table fuit.", { x: 0.9, y: 4.65, w: 5.45, h: 0.9, margin: 0, fontFace: FB, fontSize: 12, color: "7A2C2C", lineSpacingMultiple: 1.12 });
  card(s, 6.85, 2.4, 6.0, 3.7, GREENT, { r: 0.12 });
  s.addText("✓  Sûr — requête préparée", { x: 7.13, y: 2.55, w: 5.5, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: "2E5A12" });
  codeBlock(s, 7.13, 3.0, 5.45, 1.5, ["pool.query(", "  '... WHERE email = ?', [email]);"], 12);
  s.addText("La valeur passe à part : MySQL la traite comme une DONNÉE, jamais comme du code. Utilisé dans TOUS les modèles du projet.", { x: 7.13, y: 4.65, w: 5.45, h: 0.9, margin: 0, fontFace: FB, fontSize: 12, color: "33502A", lineSpacingMultiple: 1.12 });
  s.addText("Pour le tri (ORDER BY), où le ? n'est pas possible, on n'accepte que des valeurs d'une liste blanche (prix, nom, populaire…).", { x: 0.62, y: 6.25, w: 12.2, h: 0.4, margin: 0, fontFace: FB, fontSize: 12, italic: true, color: MUTED });
  pageFurniture(s);
})();

// ============================================================ SEC — ANTI-FORCE BRUTE
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Sécurité", "Anti-force brute : limiter les tentatives"); menuButton(s); secButton(s);
  s.addText("bcrypt rend chaque essai lent ; le rate-limit borne aussi le NOMBRE d'essais. Les deux ensemble découragent l'attaque par dictionnaire.",
    { x: 0.62, y: 1.55, w: 12.2, h: 0.6, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  codeBlock(s, 0.62, 2.35, 7.6, 2.85, [
    "// authRoutes.js",
    "const limiteurConnexion = rateLimit({",
    "  windowMs: 15 * 60 * 1000,   // fenetre de 15 minutes",
    "  max: 10,                    // 10 essais max / IP",
    "  message: { erreur: 'Trop de tentatives...' }",
    "});",
    "",
    "router.post('/connexion', limiteurConnexion, ...);",
  ], 11.5);
  card(s, 8.45, 2.35, 4.4, 1.35, AMBERT, { r: 0.12 });
  s.addText("10 / 15 min / IP", { x: 8.45, y: 2.55, w: 4.4, h: 0.55, align: "center", margin: 0, fontFace: FH, fontSize: 26, bold: true, color: AMBERD });
  s.addText("au-delà → 429 Too Many Requests", { x: 8.45, y: 3.12, w: 4.4, h: 0.4, align: "center", margin: 0, fontFace: FB, fontSize: 12, color: "6B5A2A" });
  bullets(s, [
    { t: "Cible la connexion : la porte la plus attaquée.", b: false },
    "L'IP fautive est temporairement bloquée (429).",
    "Réglable : fenêtre (windowMs) et nombre (max).",
    "Complète bcrypt : même un robot est stoppé.",
  ], 8.45, 3.85, 4.4, 2.3, { fs: 12.5, gap: 9 });
  pageFurniture(s);
})();

// ============================================================ SEC — EN-TETES & CORS
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Sécurité", "En-têtes HTTP & CORS"); menuButton(s); secButton(s);
  s.addText("Deux protections posées en GLOBAL dans server.js, avant toute route : elles durcissent le navigateur et filtrent l'origine des appels.",
    { x: 0.62, y: 1.55, w: 12.2, h: 0.6, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  codeBlock(s, 0.62, 2.35, 7.6, 2.0, [
    "// server.js — middlewares globaux",
    "app.use(helmet());                  // en-tetes de securite",
    "app.use(cors({ origin:",
    "    process.env.FRONT_URL || '*' }));// origine autorisee",
    "app.use(express.json());            // lecture du corps JSON",
  ], 11.5);
  card(s, 8.45, 2.35, 4.4, 0.95, BLUET, { r: 0.1 });
  s.addText("helmet", { x: 8.65, y: 2.48, w: 4.0, h: 0.32, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: BLUED });
  s.addText("en-têtes anti clickjacking, sniffing MIME, etc.", { x: 8.65, y: 2.8, w: 4.05, h: 0.4, margin: 0, fontFace: FB, fontSize: 11.5, color: BLUED });
  card(s, 8.45, 3.4, 4.4, 0.95, GREENT, { r: 0.1 });
  s.addText("cors", { x: 8.65, y: 3.53, w: 4.0, h: 0.32, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: "2E5A12" });
  s.addText("seul le front déclaré (FRONT_URL) peut appeler l'API", { x: 8.65, y: 3.85, w: 4.05, h: 0.4, margin: 0, fontFace: FB, fontSize: 11.5, color: "2E5A12" });
  bullets(s, [
    { t: "helmet : en-têtes de sécurité par défaut, sans configuration.", b: false },
    "cors : un site tiers ne peut pas appeler l'API depuis le navigateur d'un utilisateur connecté.",
    "Posés en global → s'appliquent à 100 % des routes.",
    "FRONT_URL vient du .env : une origine différente en dev et en prod.",
  ], 0.62, 4.65, 12.2, 1.8, { fs: 13 });
  pageFurniture(s);
})();

// ============================================================ 19 — VALIDATION
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Sécurité", "Valider les entrées avant tout traitement"); menuButton(s); secButton(s);
  s.addText("express-validator pose des règles sur chaque route. Le middleware valider() renvoie 400 avec le détail si une règle échoue — avant d'atteindre le métier.",
    { x: 0.62, y: 1.6, w: 12, h: 0.6, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  codeBlock(s, 0.62, 2.4, 6.0, 2.6, [
    "// règles d'inscription", "body('email').isEmail(),", "body('motDePasse')", "    .isLength({ min: 6 }),", "", "// règle d'un avis", "body('note').isInt({ min: 1, max: 5 })",
  ], 12.5);
  card(s, 6.85, 2.4, 6.0, 2.6, INK, { r: 0.1 });
  s.addText("Réponse si la saisie est invalide", { x: 7.1, y: 2.55, w: 5.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, color: MINT });
  s.addText([
    { text: "400 Bad Request", options: { breakLine: true, color: "FAC775", fontFace: FM, fontSize: 13, bold: true } },
    { text: "{", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "  \"erreur\": \"Données invalides.\",", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "  \"details\": [{ champ: 'email',", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "      message: 'Email invalide.' }]", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "}", options: { color: "E8F0E2", fontFace: FM, fontSize: 12 } },
  ], { x: 7.1, y: 2.95, w: 5.5, h: 1.9, margin: 0, valign: "top", lineSpacingMultiple: 1.18 });
  bullets(s, [
    { t: "Défense en profondeur : on ne fait pas confiance à la validation du front (qu'on peut contourner).", b: false },
    "Règles déclaratives, lisibles directement dans le fichier de routes.",
    "Un seul middleware valider() centralise la réponse d'erreur, identique partout.",
  ], 0.62, 5.2, 12, 1.4, { fs: 13 });
  pageFurniture(s);
})();

// ============================================================ SEC — JOURNALISATION
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Sécurité", "Journalisation : logs & visites"); menuButton(s); secButton(s);
  s.addText("Le middleware journal trace chaque appel /api en « fire-and-forget » (sans ralentir la réponse). Deux tables, deux usages.",
    { x: 0.62, y: 1.55, w: 12.2, h: 0.6, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  codeBlock(s, 0.62, 2.35, 7.6, 2.7, [
    "// middlewares/journal.js",
    "Log.ajouterVisite({ chemin, methode, ip })",
    "   .catch(() => {});           // fire-and-forget",
    "",
    "res.on('finish', () => {       // a la fin de la reponse",
    "  if (res.statusCode >= 400)",
    "    Log.ajouterLog({ niveau, route, statut })",
    "       .catch(() => {});",
    "});",
  ], 11);
  card(s, 8.45, 2.35, 4.4, 1.2, GREENT, { r: 0.1 });
  s.addText("table statistiques", { x: 8.65, y: 2.5, w: 4.0, h: 0.32, margin: 0, fontFace: FM, fontSize: 13, bold: true, color: "2E5A12" });
  s.addText("1 appel API = 1 visite (page, méthode, IP)", { x: 8.65, y: 2.85, w: 4.05, h: 0.55, margin: 0, fontFace: FB, fontSize: 11.5, color: "2E5A12", lineSpacingMultiple: 1.1 });
  card(s, 8.45, 3.7, 4.4, 1.2, REDT, { r: 0.1 });
  s.addText("table logs", { x: 8.65, y: 3.85, w: 4.0, h: 0.32, margin: 0, fontFace: FM, fontSize: 13, bold: true, color: REDD });
  s.addText("réponse ≥ 400 = 1 log (route + statut)", { x: 8.65, y: 4.2, w: 4.05, h: 0.55, margin: 0, fontFace: FB, fontSize: 11.5, color: "7A2C2C", lineSpacingMultiple: 1.1 });
  bullets(s, [
    { t: "« Fire-and-forget » (.catch) : aucune latence ajoutée à la réponse.", b: false },
    "On ne trace que /api (pas les fichiers statiques).",
    "Ces deux tables alimentent le tableau de bord admin (pages vues, erreurs récentes).",
  ], 0.62, 5.3, 12.2, 1.3, { fs: 13 });
  pageFurniture(s);
})();

// ============================================================ 20a — CATALOGUE DES TABLES
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Données", "Les 13 tables : à quoi sert chacune"); menuButton(s);
  s.addText("Chaque table a un rôle précis. Regroupées par thème, avec leurs colonnes clés.",
    { x: 0.62, y: 1.48, w: 12, h: 0.32, margin: 0, fontFace: FB, fontSize: 13, italic: true, color: MUTED });
  const groups = [
    { title: "CATALOGUE", color: BLUED, bg: BLUET, x: 0.62, y: 1.85, w: 6.1, rows: [
      ["categories", "les rayons", "id, nom, slug, icon, image"],
      ["produits", "le cœur du catalogue", "prix, stock, categorie_id→, specs/options/images (JSON)"],
    ] },
    { title: "COMPTES", color: "2E7D32", bg: GREENT, x: 0.62, y: 3.48, w: 6.1, rows: [
      ["utilisateurs", "clients & admins", "prenom, nom, email∗, mot_de_passe, role"],
      ["adresses", "carnet de livraison", "utilisateur_id→, rue, code_postal, ville, principale"],
    ] },
    { title: "ACHATS", color: AMBERD, bg: AMBERT, x: 0.62, y: 5.11, w: 6.1, rows: [
      ["cart + cart_items", "le panier persistant", "1 cart/client ; lignes : produit_id→, quantite, options"],
      ["commandes + commande_articles", "les achats", "montants, statut ; lignes figées : nom_produit, prix"],
    ] },
    { title: "INTERACTIONS", color: "993556", bg: "FBEAF0", x: 6.95, y: 1.85, w: 5.9, rows: [
      ["favoris", "produits aimés", "utilisateur_id→, produit_id→  (∗ unique)"],
      ["reviews", "avis & notes", "note 1-5, commentaire  (∗ 1 avis/produit)"],
      ["messages_contact", "formulaire de contact", "nom, email, sujet, message"],
    ] },
    { title: "TECHNIQUE", color: "5F5E5A", bg: "F1F1EC", x: 6.95, y: 4.0, w: 5.9, rows: [
      ["logs", "erreurs applicatives", "niveau, message, route, statut, ip"],
      ["statistiques", "visites du site", "chemin, methode, ip, user_agent"],
    ] },
  ];
  groups.forEach((g) => {
    const h = 0.42 + g.rows.length * 0.52 + 0.08;
    card(s, g.x, g.y, g.w, h, g.bg, { r: 0.1 });
    s.addText(g.title, { x: g.x + 0.25, y: g.y + 0.12, w: g.w - 0.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, charSpacing: 1.5, color: g.color });
    g.rows.forEach((r, i) => {
      const ry = g.y + 0.44 + i * 0.52;
      s.addText([{ text: r[0], options: { fontFace: FM, bold: true, color: TEXT } }, { text: "  — " + r[1], options: { color: g.color } }], { x: g.x + 0.25, y: ry, w: g.w - 0.45, h: 0.26, margin: 0, fontFace: FB, fontSize: 11.5 });
      s.addText(r[2], { x: g.x + 0.37, y: ry + 0.25, w: g.w - 0.55, h: 0.26, margin: 0, fontFace: FM, fontSize: 9.5, color: MUTED });
    });
  });
  card(s, 6.95, 5.5, 5.9, 1.1, INK, { r: 0.1 });
  s.addText([{ text: "∗", options: { bold: true, color: MINT } }, { text: " = UNIQUE   ·   ", options: { color: "C7D6BF" } }, { text: "→", options: { bold: true, color: MINT } }, { text: " = clé étrangère   ·   ", options: { color: "C7D6BF" } }, { text: "PK", options: { bold: true, color: MINT } }, { text: " = id auto-incrémenté", options: { color: "C7D6BF" } }],
    { x: 7.2, y: 5.62, w: 5.4, h: 0.4, margin: 0, fontFace: FB, fontSize: 11.5 });
  s.addText("JSON = champ flexible (specs, options…) ; le reste est 100 % relationnel.", { x: 7.2, y: 6.05, w: 5.4, h: 0.45, margin: 0, fontFace: FB, fontSize: 11, color: "9FB89A", lineSpacingMultiple: 1.05 });
  pageFurniture(s);
})();

// ============================================================ 20b — MODELE RELATIONNEL
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Données", "Le modèle relationnel : clés & intégrité"); menuButton(s);
  s.addText("utilisateurs et produits sont les pivots. Les lignes vertes = clés étrangères qui relient les tables.",
    { x: 0.62, y: 1.45, w: 12, h: 0.32, margin: 0, fontFace: FB, fontSize: 13, italic: true, color: MUTED });
  function edge(x1, y1, x2, y2) { s.addShape(pres.shapes.LINE, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color: "9BB86A", width: 1.5 } }); }
  edge(3.85, 2.21, 5.45, 2.21); edge(7.85, 2.21, 9.45, 2.21); edge(7.85, 2.42, 9.45, 3.22);
  edge(5.45, 2.46, 3.85, 3.22); edge(3.30, 3.77, 5.55, 4.28); edge(3.85, 4.61, 5.45, 4.61);
  edge(7.85, 4.61, 9.45, 4.61); edge(9.62, 4.25, 7.55, 2.57);
  function tbox(x, y, name, sub, c) {
    card(s, x, y, 2.4, 0.7, c === "u" ? GREENT : c === "p" ? BLUET : PANEL, { line: BORDER, shadow: true, r: 0.08 });
    s.addText(name, { x: x + 0.14, y: y + 0.07, w: 2.2, h: 0.3, margin: 0, fontFace: FM, fontSize: 12, bold: true, color: TEXT });
    s.addText(sub, { x: x + 0.14, y: y + 0.37, w: 2.2, h: 0.28, margin: 0, fontFace: FB, fontSize: 9, color: MUTED });
  }
  tbox(1.45, 1.85, "adresses", "1 user → N"); tbox(5.45, 1.85, "utilisateurs", "PK id · email∗", "u"); tbox(9.45, 1.85, "commandes", "+ articles");
  tbox(1.45, 3.05, "favoris", "(user,produit)∗"); tbox(9.45, 3.05, "cart", "+ cart_items");
  tbox(1.45, 4.25, "categories", "PK id", "p"); tbox(5.45, 4.25, "produits", "PK id · slug∗", "p"); tbox(9.45, 4.25, "reviews", "(user,produit)∗");
  const cons = [
    ["ON DELETE CASCADE", "FAECE7", "993C1D", "Supprimer un utilisateur supprime en chaîne ses adresses, favoris, panier, commandes et avis."],
    ["ON DELETE SET NULL", AMBERT, AMBERD, "commande_articles.produit_id passe à NULL : la commande garde son historique même si le produit disparaît."],
    ["RESTRICT & UNIQUE", "E1F5EE", "0F6E56", "Impossible de supprimer une catégorie utilisée. UNIQUE bloque les doublons : email, slug, 1 avis/produit."],
  ];
  let cx = 0.62; const ccw = 3.94;
  cons.forEach(([t, bg, fg, d]) => {
    card(s, cx, 5.25, ccw, 1.35, bg, { r: 0.1 });
    s.addText(t, { x: cx + 0.22, y: 5.38, w: ccw - 0.4, h: 0.32, margin: 0, fontFace: FM, fontSize: 12.5, bold: true, color: fg });
    s.addText(d, { x: cx + 0.22, y: 5.72, w: ccw - 0.4, h: 0.8, margin: 0, fontFace: FB, fontSize: 11, color: fg, lineSpacingMultiple: 1.12 });
    cx += ccw + 0.21;
  });
  s.addText("Sans clé étrangère : logs et statistiques — on garde la trace même si le compte est supprimé.", { x: 0.62, y: 6.75, w: 12, h: 0.3, margin: 0, fontFace: FB, fontSize: 10.5, italic: true, color: MUTED });
  pageFurniture(s);
})();

// ============================================================ 21 — PAS DE TABLE ADMIN
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Données", "Pourquoi pas de table « admin » ?"); menuButton(s);
  s.addText("Il y a un espace d'administration… mais aucune table admin dans la base. C'est volontaire.",
    { x: 0.62, y: 1.55, w: 12, h: 0.4, margin: 0, fontFace: FB, fontSize: 14, italic: true, color: TEXT });
  bullets(s, [
    { t: "Un administrateur n'est pas une entité différente d'un client : c'est un utilisateur avec plus de droits.", b: false },
    "Tous deux ont un email, un mot de passe, un profil… Une table admin dupliquerait tout ça.",
    "On ajoute donc une colonne role à la table utilisateurs :  'client' (défaut) ou 'admin'.",
    "C'est le principe RBAC — Role-Based Access Control : un seul compte, des droits selon le rôle.",
  ], 0.62, 2.15, 6.7, 2.6, { fs: 13 });
  card(s, 7.7, 2.15, 5.15, 2.95, PANEL, { shadow: true, r: 0.12 });
  s.addText("table  utilisateurs", { x: 7.95, y: 2.35, w: 4.5, h: 0.35, margin: 0, fontFace: FM, fontSize: 14, bold: true, color: TEXT });
  const fields = [["id", "INT"], ["prenom", "VARCHAR"], ["nom", "VARCHAR"], ["email", "VARCHAR (unique)"], ["mot_de_passe", "VARCHAR (bcrypt)"], ["role", "ENUM 'client' | 'admin'"]];
  let fy = 2.78;
  fields.forEach(([f, t], i) => {
    const hl = i === 5;
    if (hl) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.9, y: fy - 0.02, w: 4.75, h: 0.36, rectRadius: 0.04, fill: { color: GREENT }, line: { color: PEAR, width: 1 } });
    s.addText(f, { x: 8.05, y: fy, w: 1.9, h: 0.32, valign: "middle", margin: 0, fontFace: FM, fontSize: 11.5, bold: hl, color: hl ? "2E5A12" : TEXT });
    s.addText(t, { x: 9.95, y: fy, w: 2.6, h: 0.32, valign: "middle", margin: 0, fontFace: FM, fontSize: 10.5, color: hl ? "2E5A12" : MUTED });
    fy += 0.38;
  });
  card(s, 0.62, 5.25, 6.7, 1.35, INK, { r: 0.1 });
  s.addText("COMMENT C'EST APPLIQUÉ", { x: 0.9, y: 5.4, w: 6, h: 0.3, margin: 0, fontFace: FB, fontSize: 10.5, bold: true, charSpacing: 1.5, color: MINT });
  s.addText("À la connexion, le JWT embarque le role. verifierAdmin lit req.utilisateur.role : si ce n'est pas 'admin', il renvoie 403. Promouvoir un client = changer une seule valeur.", { x: 0.9, y: 5.72, w: 6.15, h: 0.85, margin: 0, fontFace: FB, fontSize: 12, color: "C7D6BF", lineSpacingMultiple: 1.12 });
  card(s, 7.7, 5.25, 2.45, 1.35, REDT, { r: 0.1 });
  s.addText("✗  Table admin séparée", { x: 7.9, y: 5.4, w: 2.15, h: 0.4, margin: 0, fontFace: FB, fontSize: 12, bold: true, color: REDD });
  s.addText("Comptes dupliqués, deux systèmes de login.", { x: 7.9, y: 5.78, w: 2.2, h: 0.8, margin: 0, fontFace: FB, fontSize: 11, color: "7A2C2C", lineSpacingMultiple: 1.08 });
  card(s, 10.3, 5.25, 2.55, 1.35, GREENT, { r: 0.1 });
  s.addText("✓  Colonne role", { x: 10.5, y: 5.4, w: 2.2, h: 0.4, margin: 0, fontFace: FB, fontSize: 12, bold: true, color: "2E5A12" });
  s.addText("Un seul compte, un seul login, droits selon le rôle.", { x: 10.5, y: 5.78, w: 2.25, h: 0.8, margin: 0, fontFace: FB, fontSize: 11, color: "33502A", lineSpacingMultiple: 1.08 });
  pageFurniture(s);
})();

// ============================================================ 22 — TRANSACTIONS
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Données", "Les transactions : tout ou rien"); menuButton(s);
  s.addText("Créer une commande = plusieurs écritures liées. Une transaction garantit qu'elles réussissent toutes ensemble, ou qu'aucune n'est appliquée.",
    { x: 0.62, y: 1.6, w: 12, h: 0.6, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT, lineSpacingMultiple: 1.1 });
  const steps = [["BEGIN", "ouvre la transaction", PANEL], ["INSERT commande", "la ligne principale", GREENT], ["INSERT articles", "chaque produit commandé", GREENT], ["UPDATE stock", "décrémente les quantités", GREENT], ["COMMIT", "tout est validé ✓", "D6EBC4"]];
  let x = 0.62; const sw = 2.18;
  steps.forEach((st, i) => {
    card(s, x, 2.5, sw, 1.0, st[2], { line: BORDER, shadow: true, r: 0.1 });
    s.addText(st[0], { x: x + 0.06, y: 2.62, w: sw - 0.12, h: 0.4, align: "center", margin: 0, fontFace: FM, fontSize: 12, bold: true, color: TEXT });
    s.addText(st[1], { x: x + 0.06, y: 3.02, w: sw - 0.12, h: 0.4, align: "center", margin: 0, fontFace: FB, fontSize: 10, color: MUTED });
    x += sw;
    if (i < steps.length - 1) { arrowRight(s, x + 0.02, x + 0.22, 3.0, PEAR); x += 0.27; }
  });
  card(s, 0.62, 3.85, 6.0, 1.5, REDT, { r: 0.12 });
  s.addText("Une étape échoue ?  →  ROLLBACK", { x: 0.9, y: 4.02, w: 5.5, h: 0.4, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: REDD });
  s.addText("Tout est annulé : pas de commande à moitié créée, pas de stock décrémenté à tort. La base reste cohérente.", { x: 0.9, y: 4.45, w: 5.5, h: 0.8, margin: 0, fontFace: FB, fontSize: 12, color: "7A2C2C", lineSpacingMultiple: 1.12 });
  card(s, 6.85, 3.85, 6.0, 1.5, GREENT, { r: 0.12 });
  s.addText("L'annulation aussi est protégée", { x: 7.13, y: 4.02, w: 5.5, h: 0.4, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: "2E5A12" });
  s.addText("SELECT … FOR UPDATE pose un verrou le temps de remettre les produits en stock — pas de double annulation concurrente.", { x: 7.13, y: 4.45, w: 5.5, h: 0.8, margin: 0, fontFace: FB, fontSize: 12, color: "33502A", lineSpacingMultiple: 1.12 });
  s.addText("C'est la garantie ACID : une transaction est Atomique (tout ou rien), Cohérente, Isolée et Durable.", { x: 0.62, y: 5.65, w: 12.2, h: 0.5, margin: 0, fontFace: FB, fontSize: 12.5, italic: true, color: MUTED });
  pageFurniture(s);
})();

// ============================================================ 23 — MENU
if (_n + 1 !== MENU_SLIDE) throw new Error("Menu attendu en " + MENU_SLIDE + " mais sera en " + (_n + 1));
(() => {
  const s = slide(); s.background = { color: INK };
  s.addText("MENU INTERACTIF", { x: 0.7, y: 0.5, w: 9, h: 0.35, margin: 0, fontFace: FB, fontSize: 13, bold: true, charSpacing: 3, color: MINT });
  s.addText("Explorez le backend par domaine", { x: 0.62, y: 0.82, w: 11, h: 0.7, margin: 0, fontFace: FH, fontSize: 32, bold: true, color: WHITE });
  s.addText("Cliquez une carte pour ouvrir sa fiche : endpoints, accès, chaîne d'appel et règles métier.", { x: 0.7, y: 1.55, w: 11, h: 0.4, margin: 0, fontFace: FB, fontSize: 14, color: "B9CBB2" });
  const cols = 3, cw = 3.95, ch = 1.42, gx = 0.22, gy = 0.22, startX = 0.62, startY = 2.15;
  DOMAINS.forEach((d, i) => {
    const r = Math.floor(i / cols), c = i % cols, x = startX + c * (cw + gx), y = startY + r * (ch + gy), target = MENU_SLIDE + 1 + i;
    card(s, x, y, cw, ch, INK2, { r: 0.12, line: PEARD, lw: 1 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.28, y: y + 0.3, w: 0.8, h: 0.8, fill: { color: PEAR } });
    s.addText(d.tag, { x: x + 0.28, y: y + 0.3, w: 0.8, h: 0.8, align: "center", valign: "middle", margin: 0, fontFace: FH, fontSize: 24, bold: true, color: INK });
    s.addText(d.n, { x: x + 1.25, y: y + 0.26, w: cw - 1.45, h: 0.55, margin: 0, fontFace: FB, fontSize: 16, bold: true, color: WHITE, valign: "middle" });
    s.addText([{ text: d.ep.length + " endpoints  ·  ", options: { color: MINT } }, { text: ACCLABEL[d.acc], options: { color: "B9CBB2" } }], { x: x + 1.25, y: y + 0.8, w: cw - 1.45, h: 0.35, margin: 0, fontFace: FB, fontSize: 11.5 });
    s.addText("", { x, y, w: cw, h: ch, margin: 0, fill: { color: "FFFFFF", transparency: 100 }, hyperlink: { slide: target, tooltip: "Ouvrir : " + d.n } });
  });
  s.addText(String(_n), { x: W - 1.05, y: H - 0.42, w: 0.5, h: 0.3, margin: 0, align: "right", fontFace: FB, fontSize: 9, color: "8FA38C" });
})();

// ============================================================ 24..32 — FICHES DOMAINES
DOMAINS.forEach((d, i) => {
  const s = slide(); s.background = { color: WHITE };
  s.addShape(pres.shapes.OVAL, { x: 0.62, y: 0.5, w: 0.95, h: 0.95, fill: { color: PEAR } });
  s.addText(d.tag, { x: 0.62, y: 0.5, w: 0.95, h: 0.95, align: "center", valign: "middle", margin: 0, fontFace: FH, fontSize: 30, bold: true, color: INK });
  s.addText(d.n, { x: 1.75, y: 0.52, w: 7.6, h: 0.55, margin: 0, fontFace: FH, fontSize: 28, bold: true, color: TEXT });
  s.addText(d.sub, { x: 1.78, y: 1.08, w: 7.8, h: 0.35, margin: 0, fontFace: FB, fontSize: 13, color: MUTED });
  badge(s, 9.55, 0.62, "Accès : " + ACCLABEL[d.acc], d.acc, 1.7);
  menuButton(s);
  s.addText("CHAÎNE D'APPEL", { x: 0.62, y: 1.62, w: 5, h: 0.25, margin: 0, fontFace: FB, fontSize: 10.5, bold: true, charSpacing: 2, color: PEARD });
  chainRow(s, 0.62, 1.9, d.chain);
  s.addText("ENDPOINTS", { x: 0.62, y: 2.55, w: 5, h: 0.25, margin: 0, fontFace: FB, fontSize: 10.5, bold: true, charSpacing: 2, color: PEARD });
  const rows = [[
    { text: "Méthode", options: { fill: { color: INK }, color: WHITE, bold: true, fontSize: 11.5, align: "center", valign: "middle" } },
    { text: "Chemin", options: { fill: { color: INK }, color: WHITE, bold: true, fontSize: 11.5, valign: "middle" } },
    { text: "CRUD", options: { fill: { color: INK }, color: WHITE, bold: true, fontSize: 11.5, align: "center", valign: "middle" } },
    { text: "Rôle de l'endpoint", options: { fill: { color: INK }, color: WHITE, bold: true, fontSize: 11.5, valign: "middle" } },
  ]];
  d.ep.forEach((e, ri) => {
    const zebra = ri % 2 ? "F6F8F1" : "FFFFFF", m = SEM[e[0]], cr = SEM[e[2]];
    rows.push([
      { text: e[0], options: { fill: { color: m.bg }, color: m.fg, bold: true, align: "center", valign: "middle", fontSize: 11 } },
      { text: e[1], options: { fill: { color: zebra }, color: TEXT, fontFace: FM, fontSize: 10.5, valign: "middle" } },
      { text: e[2], options: { fill: { color: cr.bg }, color: cr.fg, bold: true, align: "center", valign: "middle", fontSize: 11 } },
      { text: e[3], options: { fill: { color: zebra }, color: MUTED, fontSize: 10.5, valign: "middle" } },
    ]);
  });
  s.addTable(rows, { x: 0.62, y: 2.82, w: 7.85, colW: [1.05, 3.05, 0.8, 2.95], rowH: 0.33, border: { pt: 0.5, color: BORDER }, fontFace: FB, valign: "middle", margin: [2, 4, 2, 4] });
  card(s, 8.72, 2.55, 4.0, 4.3, PANEL, { shadow: true, r: 0.12 });
  s.addText("RÈGLES MÉTIER SERVEUR", { x: 9.0, y: 2.78, w: 3.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, charSpacing: 1.5, color: PEARD });
  s.addText(d.rules.map((t) => ({ text: t, options: { bullet: { code: "2022", indent: 12 }, breakLine: true, paraSpaceAfter: 7 } })), { x: 9.0, y: 3.15, w: 3.45, h: 3.55, margin: 0, fontFace: FB, fontSize: 11.5, color: TEXT, lineSpacingMultiple: 1.04 });
  pageFurniture(s);
});

// ============================================================ 33 — ZOOM PANIER
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Zoom métier", "Comment fonctionne le panier"); menuButton(s);
  bullets(s, [
    { t: "Un panier (cart) par utilisateur, créé à la volée au 1er ajout.", b: false },
    "1 produit = 1 ligne (cart_items). Clé unique (cart, produit).",
    "Le prix n'est PAS stocké : recalculé à l'affichage (utils/prix).",
    "Chaque ajout vérifie d'abord le stock du produit.",
  ], 0.62, 1.7, 6.9, 2.2, { fs: 12.5, gap: 9 });
  codeBlock(s, 0.62, 3.85, 6.9, 2.4, [
    "// panierModel.js — ajouter au panier",
    "INSERT INTO cart_items",
    "  (cart_id, produit_id, quantite, options)",
    "VALUES (?, ?, ?, ?)",
    "ON DUPLICATE KEY UPDATE         -- deja present ?",
    "  quantite = quantite + VALUES(quantite);",
  ], 11);
  s.addText("Ré-ajouter un produit cumule la quantité au lieu d'échouer.", { x: 0.62, y: 6.32, w: 6.9, h: 0.35, margin: 0, fontFace: FB, fontSize: 11.5, italic: true, color: MUTED });
  // diagram cart -> items
  card(s, 7.7, 1.95, 5.15, 4.4, PANEL, { shadow: true, r: 0.12 });
  card(s, 8.0, 2.25, 4.55, 0.7, GREENT, { line: BORDER, r: 0.08 });
  s.addText("cart  —  utilisateur #4", { x: 8.2, y: 2.25, w: 4.2, h: 0.7, valign: "middle", margin: 0, fontFace: FM, fontSize: 13, bold: true, color: "2E5A12" });
  const lines = [["iPhone 15 Pro", "x1 · 512 Go"], ["MacBook Air M3", "x2"], ["AirPods Pro", "x1"]];
  let ly = 3.15;
  lines.forEach(([n, q]) => {
    card(s, 8.2, ly, 4.2, 0.72, WHITE, { line: BORDER, r: 0.06 });
    s.addText(n, { x: 8.35, y: ly + 0.06, w: 3.9, h: 0.34, margin: 0, fontFace: FB, fontSize: 12.5, bold: true, color: TEXT });
    s.addText("cart_items · " + q, { x: 8.35, y: ly + 0.38, w: 3.9, h: 0.3, margin: 0, fontFace: FM, fontSize: 10.5, color: MUTED });
    ly += 0.85;
  });
  s.addText("1 cart  →  N cart_items", { x: 8.0, y: 5.95, w: 4.5, h: 0.3, align: "center", margin: 0, fontFace: FB, fontSize: 11, italic: true, color: PEARD });
  pageFurniture(s);
})();

// ============================================================ 34 — ZOOM AVIS
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Zoom métier", "La note moyenne se recalcule toute seule"); menuButton(s);
  bullets(s, [
    { t: "Un client connecté laisse une note (1 à 5) + un commentaire sur un produit.", b: false },
    "Clé unique (utilisateur, produit) : un seul avis par produit. Un second → erreur 409.",
    "On ne peut modifier / supprimer QUE son propre avis (sinon 403).",
    "Après chaque écriture, recalculerNoteProduit() met à jour le produit automatiquement.",
  ], 0.62, 1.75, 6.7, 2.8, { fs: 13 });
  // flow
  card(s, 7.7, 1.95, 5.15, 2.0, INK, { r: 0.12 });
  s.addText("recalculerNoteProduit()", { x: 7.95, y: 2.12, w: 4.6, h: 0.35, margin: 0, fontFace: FM, fontSize: 13, bold: true, color: MINT });
  s.addText([
    { text: "SELECT AVG(note), COUNT(*)", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "  FROM reviews WHERE produit_id = ?", options: { breakLine: true, color: "E8F0E2", fontFace: FM, fontSize: 12 } },
    { text: "→ UPDATE produits", options: { breakLine: true, color: "AED581", fontFace: FM, fontSize: 12 } },
    { text: "  SET note = ?, nb_avis = ?", options: { color: "AED581", fontFace: FM, fontSize: 12 } },
  ], { x: 7.95, y: 2.55, w: 4.7, h: 1.3, margin: 0, valign: "top", lineSpacingMultiple: 1.2 });
  card(s, 7.7, 4.2, 5.15, 1.5, GREENT, { r: 0.12 });
  s.addText("Résultat", { x: 7.95, y: 4.35, w: 4.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 12, bold: true, color: "2E5A12" });
  s.addText("Les colonnes note et nb_avis du produit reflètent toujours la réalité, sans calcul à refaire à l'affichage du catalogue.", { x: 7.95, y: 4.68, w: 4.6, h: 0.95, margin: 0, fontFace: FB, fontSize: 12, color: "33502A", lineSpacingMultiple: 1.12 });
  s.addText("Une donnée « dénormalisée » (la moyenne stockée) tenue à jour à chaque changement : lecture du catalogue ultra-rapide.", { x: 0.62, y: 5.0, w: 6.7, h: 0.8, margin: 0, fontFace: FB, fontSize: 12, italic: true, color: MUTED, lineSpacingMultiple: 1.12 });
  pageFurniture(s);
})();

// ============================================================ 35 — ZOOM STOCK
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Zoom métier", "Le stock, du panier à la commande"); menuButton(s);
  const steps = [["Ajout panier", "vérifie stock ≥ qté", BLUET, BLUED], ["Commande", "stock − qté (transaction)", GREENT, "2E7D32"], ["Annulation", "stock + qté (remise)", AMBERT, AMBERD], ["Dashboard", "alerte si stock ≤ 5", REDT, REDD]];
  let x = 0.62; const sw = 2.95, gx = 0.18;
  steps.forEach((st, i) => {
    card(s, x, 1.85, sw, 1.5, st[2], { shadow: true, r: 0.1 });
    s.addText(String(i + 1), { x: x + 0.25, y: 2.0, w: 0.8, h: 0.55, margin: 0, fontFace: FH, fontSize: 28, bold: true, color: st[3] });
    s.addText(st[0], { x: x + 0.25, y: 2.55, w: sw - 0.5, h: 0.35, margin: 0, fontFace: FB, fontSize: 14, bold: true, color: st[3] });
    s.addText(st[1], { x: x + 0.25, y: 2.9, w: sw - 0.5, h: 0.4, margin: 0, fontFace: FB, fontSize: 11, color: TEXT });
    x += sw + gx;
  });
  codeBlock(s, 0.62, 3.7, 6.7, 2.45, [
    "// commandeModel.js — dans la transaction",
    "UPDATE produits",
    "SET stock = GREATEST(stock - ?, 0)  -- jamais < 0",
    "WHERE id = ?;",
    "",
    "// annulation : on remet la quantite",
    "SET stock = stock + ?;",
  ], 11);
  bullets(s, [
    { t: "GREATEST(stock − q, 0) empêche tout stock négatif.", b: false },
    "Décrément DANS la transaction → stock et commande cohérents.",
    "Annuler une commande remet les quantités en stock.",
    "Dashboard admin : produits à stock bas (≤ 5) signalés.",
  ], 7.6, 3.85, 5.25, 2.3, { fs: 12.5, gap: 10 });
  pageFurniture(s);
})();

// ============================================================ ADMIN — HUB (interactif)
if (_n + 1 !== ADMIN_HUB) throw new Error("Hub admin attendu en " + ADMIN_HUB + " mais sera en " + (_n + 1));
(() => {
  const s = slide(); s.background = { color: INK };
  s.addText("ESPACE ADMINISTRATION", { x: 0.7, y: 0.48, w: 11, h: 0.32, margin: 0, fontFace: FB, fontSize: 13, bold: true, charSpacing: 2, color: MINT });
  s.addText("Le back-office : accès & périmètre", { x: 0.62, y: 0.78, w: 11.5, h: 0.65, margin: 0, fontFace: FH, fontSize: 29, bold: true, color: WHITE });
  card(s, 0.62, 1.6, 12.23, 1.2, INK2, { r: 0.12, line: PEARD, lw: 1 });
  s.addText([{ text: "Double verrou —  ", options: { bold: true, color: MINT } }, { text: "router.use(verifierToken, verifierAdmin) protège TOUTES les routes /api/admin : 401 si non connecté, 403 si connecté mais pas admin. Un admin est simplement un utilisateur avec role = 'admin' (cf. RBAC).", options: { color: "C7D6BF" } }],
    { x: 0.95, y: 1.6, w: 11.6, h: 1.2, valign: "middle", margin: 0, fontFace: FB, fontSize: 13 });
  s.addText("EXPLOREZ — cliquez une carte", { x: 0.7, y: 3.0, w: 8, h: 0.3, margin: 0, fontFace: FB, fontSize: 12, bold: true, charSpacing: 1.5, color: MINT });
  const areas = [
    ["Tableau de bord", "chiffres clés du site"],
    ["Statistiques", "top produits · CA/mois · visites"],
    ["Commandes", "voir tout · changer le statut"],
    ["Utilisateurs", "rôles · suppression sécurisée"],
    ["Messages & logs", "contacts reçus · journal"],
  ];
  const cw = 2.35, ch = 1.9, gx = 0.18, sx0 = 0.62, sy0 = 3.4;
  areas.forEach((a, i) => {
    const x = sx0 + i * (cw + gx), y = sy0, target = ADMIN_HUB + 1 + i;
    card(s, x, y, cw, ch, INK2, { r: 0.1, line: PEARD, lw: 1 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.22, w: 0.5, h: 0.5, fill: { color: PEAR } });
    s.addText(String(i + 1), { x: x + 0.2, y: y + 0.22, w: 0.5, h: 0.5, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 15, bold: true, color: INK });
    s.addText(a[0], { x: x + 0.2, y: y + 0.8, w: cw - 0.35, h: 0.55, margin: 0, fontFace: FB, fontSize: 13.5, bold: true, color: WHITE, valign: "top", lineSpacingMultiple: 1.0 });
    s.addText(a[1], { x: x + 0.2, y: y + 1.32, w: cw - 0.35, h: 0.5, margin: 0, fontFace: FB, fontSize: 10.5, color: "B9CBB2", lineSpacingMultiple: 1.05 });
    s.addText("", { x, y, w: cw, h: ch, margin: 0, fill: { color: "FFFFFF", transparency: 100 }, hyperlink: { slide: target, tooltip: "Ouvrir : " + a[0] } });
  });
  s.addText(String(_n), { x: W - 1.05, y: H - 0.42, w: 0.5, h: 0.3, margin: 0, align: "right", fontFace: FB, fontSize: 9, color: "8FA38C" });
})();

// ============================================================ ADMIN — TABLEAU DE BORD
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Espace admin", "Tableau de bord : les chiffres clés"); menuButton(s); adminButton(s);
  s.addText("GET /api/admin/stats agrège l'état du site en une seule réponse, via des agrégations SQL simples.",
    { x: 0.62, y: 1.5, w: 12.2, h: 0.4, margin: 0, fontFace: FB, fontSize: 13, color: TEXT });
  const tiles = [["128", "produits"], ["342", "commandes"], ["48 920 €", "chiffre d'affaires"], ["1 204", "clients"], ["536", "avis"], ["7", "stock bas ≤ 5"]];
  tiles.forEach((t, i) => {
    const c = i % 2, r = Math.floor(i / 2), x = 0.62 + c * 3.0, y = 2.1 + r * 1.25;
    card(s, x, y, 2.85, 1.12, i === 5 ? REDT : PANEL, { r: 0.1, shadow: true });
    s.addText(t[0], { x: x + 0.2, y: y + 0.12, w: 2.5, h: 0.55, margin: 0, fontFace: FH, fontSize: 23, bold: true, color: i === 5 ? REDD : PEARD });
    s.addText(t[1], { x: x + 0.2, y: y + 0.68, w: 2.5, h: 0.35, margin: 0, fontFace: FB, fontSize: 12, color: i === 5 ? "7A2C2C" : MUTED });
  });
  codeBlock(s, 6.85, 2.1, 6.0, 2.45, [
    "// statService.js — dashboard()",
    "SELECT COUNT(*), SUM(stock) FROM produits;",
    "SELECT COUNT(*), SUM(total) FROM commandes; -- CA",
    "SELECT COUNT(*) FROM utilisateurs",
    "   WHERE role = 'client';",
    "SELECT COUNT(*) FROM produits WHERE stock <= 5;",
  ], 11);
  bullets(s, [
    { t: "Une agrégation SQL (COUNT / SUM) par indicateur.", b: false },
    "Le chiffre d'affaires = SUM(total) de toutes les commandes.",
    "Le nombre de visites vient de la table statistiques (journal).",
  ], 6.85, 4.8, 6.0, 1.6, { fs: 12.5, gap: 8 });
  pageFurniture(s);
})();

// ============================================================ ADMIN — STATISTIQUES
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Espace admin", "Statistiques : agrégations avancées"); menuButton(s); adminButton(s);
  s.addText("GET /api/admin/statistics — le GROUP BY est le cœur des stats : regrouper les lignes pour les compter et les sommer.",
    { x: 0.62, y: 1.5, w: 12.2, h: 0.4, margin: 0, fontFace: FB, fontSize: 13, color: TEXT });
  codeBlock(s, 0.62, 2.05, 6.15, 3.7, [
    "-- top produits vendus",
    "SELECT nom_produit, SUM(quantite) AS vendu",
    "FROM commande_articles",
    "GROUP BY produit_id ORDER BY vendu DESC LIMIT 5;",
    "",
    "-- chiffre d'affaires par mois",
    "SELECT DATE_FORMAT(cree_le,'%Y-%m') AS mois,",
    "       SUM(total) FROM commandes GROUP BY mois;",
    "",
    "-- pages les plus visitees",
    "SELECT chemin, COUNT(*) FROM statistiques",
    "GROUP BY chemin ORDER BY COUNT(*) DESC;",
  ], 10.5);
  s.addText("Chiffre d'affaires par mois (€)", { x: 7.15, y: 2.0, w: 5.6, h: 0.35, margin: 0, fontFace: FB, fontSize: 13, bold: true, color: TEXT });
  s.addChart(pres.charts.BAR, [{ name: "CA", labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"], values: [6200, 7100, 5800, 8400, 9100, 12300] }], {
    x: 7.0, y: 2.4, w: 5.85, h: 3.4, barDir: "col", chartColors: [PEAR], showLegend: false, showValue: false,
    catAxisLabelColor: "5E6E60", valAxisLabelColor: "5E6E60", valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  });
  s.addText("Top produits via commande_articles · visites via la table statistiques alimentée par le middleware journal.", { x: 0.62, y: 5.95, w: 6.4, h: 0.5, margin: 0, fontFace: FB, fontSize: 11.5, italic: true, color: MUTED, lineSpacingMultiple: 1.1 });
  pageFurniture(s);
})();

// ============================================================ ADMIN — COMMANDES
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Espace admin", "Gérer les commandes de tous les clients"); menuButton(s); adminButton(s);
  s.addText("GET /api/admin/commandes liste toutes les commandes (avec le client) ; PUT /api/admin/commandes/:id fait avancer le statut.",
    { x: 0.62, y: 1.5, w: 12.2, h: 0.45, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT });
  s.addText("LE CYCLE DE VIE D'UNE COMMANDE", { x: 0.62, y: 2.05, w: 8, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, charSpacing: 1.5, color: PEARD });
  const st = [["en attente", PANEL], ["payée", BLUET], ["expédiée", AMBERT], ["livrée", GREENT]];
  let x = 0.62; const sw = 2.2, sh = 0.7;
  st.forEach((p, i) => {
    card(s, x, 2.4, sw, sh, p[1], { line: BORDER, r: 0.08 });
    s.addText(p[0], { x, y: 2.4, w: sw, h: sh, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 13, bold: true, color: TEXT });
    x += sw;
    if (i < 3) { arrowRight(s, x + 0.04, x + 0.36, 2.75, PEAR); x += 0.4; }
  });
  card(s, 10.85, 2.4, 1.9, sh, REDT, { line: BORDER, r: 0.08 });
  s.addText("✕ annulée", { x: 10.85, y: 2.4, w: 1.9, h: sh, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 12.5, bold: true, color: REDD });
  codeBlock(s, 0.62, 3.55, 7.6, 2.2, [
    "// adminController.js — changer le statut",
    "const STATUTS = ['en attente','payée',",
    "  'expédiée','livrée','annulée'];",
    "if (!STATUTS.includes(statut))",
    "  throw { statut: 400, message: 'Statut invalide.' };",
    "Commande.modifierStatut(id, statut);",
  ], 11);
  bullets(s, [
    { t: "L'admin voit TOUTES les commandes (jointure sur l'utilisateur).", b: false },
    "Le statut doit appartenir à la liste blanche → sinon 400.",
    "Chaque changement = un simple UPDATE du statut.",
    "Le client, lui, ne peut qu'annuler (et avant expédition).",
  ], 8.45, 3.7, 4.4, 2.3, { fs: 12.5, gap: 9 });
  pageFurniture(s);
})();

// ============================================================ ADMIN — UTILISATEURS
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Espace admin", "Gérer les comptes utilisateurs"); menuButton(s); adminButton(s);
  s.addText("Lister les comptes, changer un rôle, supprimer — avec des garde-fous contre les erreurs irréversibles.",
    { x: 0.62, y: 1.5, w: 12.2, h: 0.45, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT });
  codeBlock(s, 0.62, 2.1, 7.6, 3.1, [
    "// utilisateurService.js",
    "// garde-fou : ne pas se supprimer soi-meme",
    "if (parseInt(id) === adminConnecteId)",
    "  throw { statut: 400, message:",
    "    'Vous ne pouvez pas supprimer votre compte.' };",
    "",
    "// role valide sur liste blanche",
    "const ROLES = ['client', 'admin'];",
    "if (role && !ROLES.includes(role))",
    "  throw { statut: 400, message: 'Rôle invalide.' };",
  ], 11);
  bullets(s, [
    { t: "GET : la liste n'expose jamais les mots de passe.", b: false },
    "PUT : promouvoir un client en admin = changer son role.",
    "DELETE : un admin ne peut pas supprimer son propre compte.",
    "Rôle validé sur liste blanche : 'client' ou 'admin' uniquement.",
  ], 8.45, 2.25, 4.4, 3.0, { fs: 12.5, gap: 10 });
  pageFurniture(s);
})();

// ============================================================ ADMIN — MESSAGES & LOGS
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Espace admin", "Messages de contact & journal"); menuButton(s); adminButton(s);
  s.addText("Le formulaire de contact est public ; sa lecture et la consultation des logs sont réservées à l'admin.",
    { x: 0.62, y: 1.5, w: 12.2, h: 0.45, margin: 0, fontFace: FB, fontSize: 13.5, color: TEXT });
  s.addText("MESSAGES DE CONTACT", { x: 0.62, y: 2.05, w: 6, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, charSpacing: 1.5, color: PEARD });
  card(s, 0.62, 2.4, 6.0, 1.55, PANEL, { line: BORDER, r: 0.1, shadow: true });
  s.addText("Léa Martin · lea@mail.fr", { x: 0.85, y: 2.54, w: 5.5, h: 0.32, margin: 0, fontFace: FB, fontSize: 13, bold: true, color: TEXT });
  s.addText("Sujet : Délai de livraison", { x: 0.85, y: 2.86, w: 5.5, h: 0.3, margin: 0, fontFace: FB, fontSize: 12, color: MUTED });
  s.addText("« Bonjour, sous combien de temps êtes-vous livré ? »", { x: 0.85, y: 3.16, w: 5.5, h: 0.7, margin: 0, fontFace: FB, fontSize: 12, italic: true, color: MUTED, lineSpacingMultiple: 1.1 });
  s.addText("POST /api/contact (public) → table messages_contact ; GET /api/contact (admin) pour les lire.", { x: 0.62, y: 4.1, w: 6.0, h: 0.55, margin: 0, fontFace: FB, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.1 });
  s.addText("JOURNAL APPLICATIF", { x: 6.85, y: 2.05, w: 6, h: 0.3, margin: 0, fontFace: FB, fontSize: 11, bold: true, charSpacing: 1.5, color: PEARD });
  codeBlock(s, 6.85, 2.4, 6.0, 1.55, [
    "GET /api/admin/logs",
    "[warn]  GET /api/produits/999 -> 404",
    "[error] POST /api/commandes    -> 500",
    "[warn]  POST /api/auth/connexion -> 401",
  ], 11);
  s.addText("GET /api/admin/logs liste les dernières erreurs (issues du middleware journal) pour diagnostiquer.", { x: 6.85, y: 4.1, w: 6.0, h: 0.55, margin: 0, fontFace: FB, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.1 });
  card(s, 0.62, 4.95, 12.23, 1.35, "F1F1EC", { r: 0.1 });
  bullets(s, [
    { t: "Contact : ouvert à tous (validé), stocké, jamais perdu.", b: false },
    "Logs : consultés par l'admin, alimentés automatiquement par le journal.",
    "Aucune suppression automatique : tout l'historique reste consultable.",
  ], 0.92, 5.08, 11.6, 1.1, { fs: 12, gap: 6 });
  pageFurniture(s);
})();

// ============================================================ 36 — CODE : TRANSACTION
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Le code", "Une commande en transaction (commandeModel)"); menuButton(s);
  codeBlock(s, 0.62, 1.7, 7.7, 5.0, [
    "async function creer(userId, montants, adr, articles) {",
    "  const cnx = await pool.getConnection();",
    "  try {",
    "    await cnx.beginTransaction();          // on démarre",
    "    // 1) la commande principale",
    "    const [cmd] = await cnx.query(`INSERT INTO commandes",
    "       (...) VALUES (?, ?, ?, ?, ?, ?)`, [userId, ...]);",
    "    const commandeId = cmd.insertId;",
    "    // 2) chaque article + baisse du stock",
    "    for (const art of articles) {",
    "      await cnx.query(`INSERT INTO commande_articles ...`);",
    "      await cnx.query('UPDATE produits SET stock =",
    "         GREATEST(stock - ?, 0) WHERE id = ?', [...]);",
    "    }",
    "    await cnx.commit();                    // tout est OK",
    "    return commandeId;",
    "  } catch (e) {",
    "    await cnx.rollback();                  // sinon annule TOUT",
    "    throw e;",
    "  } finally { cnx.release(); }             // rend la connexion",
    "}",
  ], 11);
  bullets(s, [
    { t: "getConnection() : une connexion dédiée pour toute la transaction.", b: false },
    "commit() valide tout d'un bloc ; rollback() défait tout si une étape casse.",
    "finally release() : la connexion retourne TOUJOURS au pool.",
    "Résultat : jamais de commande sans ses lignes, ni de stock faux.",
  ], 8.5, 1.9, 4.3, 4.6, { fs: 12.5, gap: 11 });
  pageFurniture(s);
})();

// ============================================================ 37 — CODE : SQL PREPARE
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Le code", "Une requête préparée (produitModel)"); menuButton(s);
  codeBlock(s, 0.62, 1.7, 7.7, 4.4, [
    "// On choisit les colonnes (jamais SELECT *)",
    "const COLONNES = `id, nom, slug, prix, stock, ...`;",
    "",
    "// Recherche par id : la valeur passe en paramètre ?",
    "async function trouverParId(id) {",
    "  const [lignes] = await pool.query(",
    "    `SELECT ${COLONNES} FROM produits WHERE id = ?`,",
    "    [id]          // <- traité comme DONNÉE, pas comme code",
    "  );",
    "  return lignes[0] || null;",
    "}",
    "",
    "// Filtre construit dynamiquement, toujours avec des ?",
    "if (filtres.marque) {",
    "  where += ' AND marque = ?';",
    "  params.push(filtres.marque);",
    "}",
  ], 11.5);
  bullets(s, [
    { t: "Le ? sépare la requête (code) de la valeur (donnée) → anti-injection.", b: false },
    "On ne renvoie que les colonnes utiles, renommées en camelCase pour le front.",
    "Les filtres s'empilent avec AND … ? : flexible et toujours sûr.",
    "Le même schéma se retrouve dans tous les modèles du projet.",
  ], 8.5, 1.9, 4.3, 4.2, { fs: 12.5, gap: 11 });
  pageFurniture(s);
})();

// ============================================================ 38 — CAS CONCRET
(() => {
  const s = slide(); s.background = { color: WHITE };
  title(s, "Cas concret", "Passer une commande, étape par étape"); menuButton(s);
  s.addText("POST /api/commandes/depuis-panier", { x: 0.62, y: 1.5, w: 8, h: 0.35, margin: 0, fontFace: FM, fontSize: 15, bold: true, color: PEARD });
  const steps = [["1", "Auth", "verifierToken valide le JWT et pose req.utilisateur."], ["2", "Controller", "Lit l'utilisateur + l'adresse, délègue au service."], ["3", "Service", "Lit le panier serveur et le transforme en articles."], ["4", "Recalcul", "Recharge chaque produit, vérifie le stock, recalcule le prix (utils/prix)."], ["5", "Montants", "Applique TVA 20 % + frais de port (utils/config)."], ["6", "Transaction", "Insère commande + lignes, décrémente le stock. Rollback si erreur."], ["7", "Email + panier", "Confirmation simulée (utils/email), puis vide le panier."], ["8", "Réponse", "201 { commandeId, sousTotal, tva, fraisPort, total }."]];
  const cw = 2.95, ch = 2.0, gx = 0.18, gy = 0.22;
  steps.forEach((st, i) => {
    const r = Math.floor(i / 4), c = i % 4, x = 0.62 + c * (cw + gx), y = 2.05 + r * (ch + gy);
    card(s, x, y, cw, ch, i === 3 || i === 5 ? GREENT : PANEL, { shadow: true, line: BORDER, r: 0.1 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, fill: { color: PEAR } });
    s.addText(st[0], { x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, align: "center", valign: "middle", margin: 0, fontFace: FH, fontSize: 17, bold: true, color: INK });
    s.addText(st[1], { x: x + 0.9, y: y + 0.28, w: cw - 1.1, h: 0.5, margin: 0, fontFace: FB, fontSize: 15, bold: true, color: TEXT, valign: "middle" });
    s.addText(st[2], { x: x + 0.28, y: y + 0.85, w: cw - 0.5, h: 1.0, margin: 0, fontFace: FB, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.08 });
  });
  s.addText("Le fil rouge : à l'étape 4, le serveur recalcule TOUT depuis la base — le client ne peut pas imposer un prix. L'étape 6 garantit la cohérence par une transaction.",
    { x: 0.62, y: 6.5, w: 12.1, h: 0.6, margin: 0, fontFace: FB, fontSize: 13, italic: true, color: MUTED, lineSpacingMultiple: 1.1 });
  pageFurniture(s);
})();

// ============================================================ 39 — RECAP
(() => {
  const s = slide(); s.background = { color: INK };
  s.addText("EN RÉSUMÉ", { x: 0.7, y: 1.3, w: 9, h: 0.4, margin: 0, fontFace: FB, fontSize: 14, bold: true, charSpacing: 3, color: MINT });
  s.addText("Un backend lisible, sûr et testable", { x: 0.62, y: 1.7, w: 11.5, h: 0.9, margin: 0, fontFace: FH, fontSize: 38, bold: true, color: WHITE });
  const pts = [["Séparation nette", "Routes → Controllers → Services → Models : chaque fichier a une seule raison de changer."], ["Logique au bon endroit", "Services pour les règles, Utils pour les calculs partagés, Models pour le SQL préparé."], ["Sécurité par défaut", "JWT, bcrypt, validation, rate-limit, anti-injection, recalcul serveur systématique."], ["Cohérence des données", "Transactions sur les commandes, contraintes FK, rôle dans utilisateurs (pas de table admin)."]];
  const cw = 5.9, ch = 1.55, gx = 0.25, gy = 0.25;
  pts.forEach((p, i) => {
    const r = Math.floor(i / 2), c = i % 2, x = 0.62 + c * (cw + gx), y = 2.85 + r * (ch + gy);
    card(s, x, y, cw, ch, INK2, { r: 0.12, line: PEARD, lw: 0.75 });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.5, w: 0.55, h: 0.55, fill: { color: PEAR } });
    s.addText("✓", { x: x + 0.3, y: y + 0.5, w: 0.55, h: 0.55, align: "center", valign: "middle", margin: 0, fontFace: FB, fontSize: 18, bold: true, color: INK });
    s.addText(p[0], { x: x + 1.05, y: y + 0.22, w: cw - 1.3, h: 0.45, margin: 0, fontFace: FB, fontSize: 16, bold: true, color: WHITE });
    s.addText(p[1], { x: x + 1.05, y: y + 0.66, w: cw - 1.3, h: 0.8, margin: 0, fontFace: FB, fontSize: 12, color: "B9CBB2", lineSpacingMultiple: 1.05 });
  });
  s.addText("PearTech · API REST · Node + Express + MySQL", { x: 0.62, y: 6.75, w: 11, h: 0.35, margin: 0, fontFace: FB, fontSize: 12, italic: true, color: "8FA38C" });
})();

pres.writeFile({ fileName: "PearTech-Backend.pptx" }).then((f) => console.log("Écrit :", f, "—", _n, "slides"));
