# -*- coding: utf-8 -*-
"""Jeu de donnees Orientation — guide MESRS Benin 2026-2027.

Modele retenu
-------------
Chaque filiere expose, pour chaque serie qu'elle accepte, une liste de
CRENEAUX. Un creneau = une position dans la formule de classement ; il peut
offrir plusieurs matieres alternatives (le candidat utilise celle qu'il a
passee). Le guide en attend trois pour les filieres sur CLASSEMENT.

Les filieres sur CONCOURS sont exclues du calcul : leur colonne « Matieres »
decrit les epreuves de l'examen d'entree, pas la moyenne de classement.
"""
import json, re, unicodedata

BASE = r"C:\Users\hp\AppData\Local\Temp\claude\C--Users-hp-reelle-mathwork\0b7c6af1-7029-4cf4-805b-1bcbbd83912f\scratchpad"
recs = json.load(open(BASE + r"\filieres.json", encoding="utf-8"))

UNIVS = [
    (23, 44, "Université d'Abomey-Calavi", "UAC"),
    (45, 53, "Université de Parakou", "UP"),
    (54, 67, "Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques", "UNSTIM"),
    (68, 79, "Université Nationale d'Agriculture", "UNA"),
    (80, 81, "Institut Universitaire d'Enseignement Professionnel", "IUEP"),
    (82, 83, "Écoles Inter-États", "INTER-ETATS"),
    (84, 86, "Université Africaine de Développement Coopératif", "UADC"),
    (87, 88, "Établissements de Sèmè City", "SEME"),
]

def universite(page):
    for a, b, nom, code in UNIVS:
        if a <= page <= b:
            return nom, code
    return None, None

def norm(s):
    s = (s or "").replace("’", "'").replace("–", "-").replace("−", "-")
    return re.sub(r"\s+", " ", s).strip()

def key(s):
    s = norm(s).lower()
    s = "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).strip(" .;,:")

# ---------------------------------------------------------------- decoupage
def split_hors_parentheses(txt, motif):
    """Decoupe sur `motif` uniquement a profondeur de parentheses nulle."""
    out, prof, debut = [], 0, 0
    i = 0
    while i < len(txt):
        c = txt[i]
        if c == "(":
            prof += 1
        elif c == ")":
            prof = max(0, prof - 1)
        elif prof == 0:
            m = motif.match(txt, i)
            if m and m.end() > i:
                out.append(txt[debut:i])
                i = debut = m.end()
                continue
        i += 1
    out.append(txt[debut:])
    return [x for x in (s.strip(" .;,") for s in out) if x]

SEP_ALTERNATIVE = re.compile(r"\s*/\s*|\s+ou\s+")

# ---------------------------------------------------------------- series
GEN = ["A1", "A2", "B", "C", "D", "E", "EA", "F1", "F2", "F3", "F4", "G1", "G2", "G3"]
TOK = re.compile(r"\b(A1|A2|G1|G2|G3|F1|F2|F3|F4|EA|A|B|C|D|E|F|G)\b")

def series_dans(txt):
    t = norm(txt)
    t = re.sub(r"\bLV\s*\d\b", " ", t, flags=re.I)
    t = re.sub(r"\b(DEAT|DT)\s*/?\s*[\w'’\- ]*", " ", t)
    out = []
    for m in TOK.finditer(t.upper()):
        v = m.group(1)
        if v == "A":   out += ["A1", "A2"]
        elif v == "G": out += ["G1", "G2", "G3"]
        elif v == "F": out += ["F1", "F2", "F3", "F4"]
        else:          out.append(v)
    return [s for s in dict.fromkeys(out) if s in GEN]

# Le guide ecrit la meme specialite de plusieurs facons — abreviation, graphie
# differente, libelle complet. Sans regroupement, un candidat DEAT/PA ne verrait
# que la filiere ecrite « DEAT/PA » et manquerait celles ecrites en clair.
# On ne regroupe que ce que le guide permet d'etablir avec certitude.
SYNONYMES_TECHNIQUE = {
    "deat/amenagement": "DEAT/AER",                     # Amenagement et equipement rural
    "deat/amenagement et equipement rural": "DEAT/AER",
    "deat/production animale": "DEAT/PA",
    "deat/production vegetale": "DEAT/PV",
    "dt/com": "DT/CoM",
    "dt/eap": "DT/EAp",                                 # Electrotechnique appliquee
    "dt/electrotechnique applique": "DT/EAp",
    "dt/electrotechnique appliquee": "DT/EAp",
    "dt/electrotechnique": "DT/Electrotech",
    "dt/fc": "DT/Froid",                                # Froid et climatisation
    "dt/froid": "DT/Froid",
    "dt/froid et climatisation": "DT/Froid",
    "dt/froid et clim": "DT/Froid",
}

# Premiere graphie rencontree pour chaque specialite, afin que les variantes de
# casse ou d'accentuation aboutissent toutes au meme code.
_graphies = {}

def canon_technique(code):
    cle = re.sub(r"\s*/\s*", "/", key(code))
    if cle in SYNONYMES_TECHNIQUE:
        return SYNONYMES_TECHNIQUE[cle]
    return _graphies.setdefault(cle, code)

def techniques_dans(txt):
    out = []
    for m in re.finditer(r"\b(DEAT|DT)\b\s*[/\-]?\s*([^,;()/]*)", norm(txt)):
        fam, opt = m.group(1), norm(m.group(2)).strip(" .-")
        # « DT/BTP et DT/DPB » : on coupe avant la specialite suivante, mais pas
        # au milieu d'un libelle comme « Pêche et aquaculture ».
        coupe = re.split(r"\s+(?:et|ou)\s+(?=(?:DEAT|DT)\b)", opt)[0].strip(" .-")
        if not coupe or re.match(r"^(toutes?|les\s+options?|options?|sp[ée]cialit[ée]s?)", coupe, re.I):
            coupe = "TOUTES"
        out.append(canon_technique(f"{fam}/{coupe}"))
    return list(dict.fromkeys(out))

def cibles_dans(txt):
    return series_dans(txt) + techniques_dans(txt)

# ---------------------------------------------------------------- matieres
ALIAS = {
    "francais": "Français", "franais": "Français", "fanais": "Français", "fancais": "Français",
    "dissertation francaise": "Dissertation française",
    "philo": "Philosophie", "philosophie": "Philosophie",
    "hist-geo": "Histoire-Géographie", "histgeo": "Histoire-Géographie", "hist geo": "Histoire-Géographie",
    "hist-geographie": "Histoire-Géographie", "histoire-geographie": "Histoire-Géographie",
    "histoire": "Histoire", "geographie": "Géographie", "geo": "Géographie",
    "anglais": "Anglais", "allemand": "Allemand", "espagnol": "Espagnol", "espagol": "Espagnol",
    "maths": "Mathématiques", "math": "Mathématiques", "mathematiques": "Mathématiques",
    "maths appliquees": "Mathématiques appliquées", "mathematiques appliquees": "Mathématiques appliquées",
    "pct": "PCT", "spct": "PCT",
    "svt": "SVT", "economie": "Économie",
    "etude de cas": "Étude de cas", "culture generale": "Culture générale",
    "sciences appliquees": "Sciences appliquées", "science appliquees": "Sciences appliquées",
    "etude electronique": "Étude électronique",
    "construction mecanique": "Construction mécanique", "mecanique": "Mécanique",
    "electrotech": "Électrotechnique", "electrotechnique": "Électrotechnique",
    "rdm": "RDM", "est": "EST", "technologie": "Technologie", "pratique eps": "Pratique EPS",
    "techn compta et mercatique": "Techniques comptables et mercatique",
    "technologie des systemes informatiques": "Technologie des systèmes informatiques",
    "beton arme": "Béton armé", "tech br": "Techniques de bar-restaurant",
    "puericulture": "Puériculture", "projet informatique": "Projet informatique",
    "montage": "Montage", "harmonie": "Harmonie", "theorie musicale": "Théorie musicale",
    "art applique": "Art appliqué", "histoire de l'art": "Histoire de l'art",
}
LV = re.compile(r"^\s*LV\s*\d\s*$", re.I)

def canon(nom):
    n = norm(nom).strip(" .;,:-")
    for k in (key(n), key(re.sub(r"\s*\(.*?\)\s*", " ", n))):
        if k in ALIAS:
            return ALIAS[k]
    return re.sub(r"\s*\([^)]*\)\s*", " ", n).strip(" .;,:-") or n

def connue(nom):
    return key(nom) in ALIAS or key(re.sub(r"\s*\(.*?\)\s*", " ", nom)) in ALIAS

# une alternative = une matiere + les series auxquelles elle s'applique
SUFFIXE_POUR = re.compile(r"^(.*?)\s+pour\s+(?:les\s+|la\s+|le\s+)?(.+)$", re.I)

LANGUES = {"Anglais", "Allemand", "Espagnol", "Français"}

def analyser_alternative(brut):
    b = norm(brut).strip(" .;,")
    if not b or SERIES_SEULES.match(b):
        return None
    parens = re.findall(r"\(([^)]*)\)", b)
    tete = re.sub(r"\s*\([^)]*\)\s*", " ", b).strip(" .;,")

    cibles, substituts = [], []
    # « Étude de cas pour les G » : restriction ecrite sans parentheses
    m = SUFFIXE_POUR.match(tete)
    if m and cibles_dans(m.group(2)) and not connue(m.group(2)):
        tete, cibles = m.group(1), cibles_dans(m.group(2))

    tete_langue = canon(tete) in LANGUES
    for p in parens:
        if LV.match(p):
            continue                                        # « (LV1) » : simple precision
        clauses = split_hors_parentheses(p, re.compile(r"\s*,\s*|\s+et\s+(?=[^,]*\bpour\b)"))
        pris = False
        for cl in clauses:
            mm = SUFFIXE_POUR.match(cl)
            if not mm:
                continue
            gauche, droite = mm.group(1).strip(), mm.group(2)
            if not cibles_dans(droite):
                continue
            # « Anglais (LV1 pour A et B) » : precision sur la langue, pas une substitution
            if LV.match(gauche) and tete_langue:
                pris = True
                continue
            # toute autre forme « X pour SÉRIES » remplace la matière pour ces séries,
            # que X figure ou non dans notre vocabulaire (ex. « PE pour EA »)
            substituts.append({"series": cibles_dans(droite), "matiere": canon(gauche)})
            pris = True
        if pris:
            continue
        c = cibles_dans(p)
        if c:
            cibles += c
    # « Étude de Cas (G2) et (G3) » : une fois les parentheses retirees, il
    # reste une conjonction orpheline a la fin du libelle.
    tete = re.sub(r"\s+(et|ou|,)\s*$", "", tete).strip(" .;,")
    nom = canon(tete)
    if not nom:
        return None
    return {"matiere": nom, "series": list(dict.fromkeys(cibles)), "substituts": substituts}

def analyser_creneau(brut):
    alts = []
    for seg in split_hors_parentheses(brut, SEP_ALTERNATIVE):
        a = analyser_alternative(seg)
        if a:
            alts.append(a)
    return alts or None

# ---------------------------------------------------------------- sections
ENTETE = re.compile(
    r"(?:Pour\s+(?:les\s+)?)?\b((?:A1|A2|G1|G2|G3|F1|F2|F3|F4|EA|DEAT|DT|[A-G])\b[^:•]{0,70}?)\s*:"
    # « Pour DT/Com • Techn Compta… » : en-tête sans deux-points
    r"|Pour\s+(?:les\s+)?((?:DEAT|DT)\s*/?\s*[\w'’]{0,20})\s*(?=•)"
    # « F1, F2, F3 • Maths… » : liste de séries en tête, sans deux-points
    r"|^((?:A1|A2|G1|G2|G3|F1|F2|F3|F4|EA|[A-G])(?:\s*,\s*(?:A1|A2|G1|G2|G3|F1|F2|F3|F4|EA|[A-G]))+)\s*(?=•)")

# une puce qui n'est qu'une énumération de séries n'est pas une matière
SERIES_SEULES = re.compile(
    r"^\s*(?:A1|A2|G1|G2|G3|F1|F2|F3|F4|EA|[A-G])(?:\s*[,;]?\s*(?:et\s+)?"
    r"(?:A1|A2|G1|G2|G3|F1|F2|F3|F4|EA|[A-G]))*\s*$", re.I)

# le PDF perd parfois la puce entre deux matières : on la restitue
COLLEES = re.compile(
    r"\b(Français|Anglais|Maths|SVT|PCT|SPCT)\s+(?=(?:Technologie des systèmes|Sites et Applications|"
    r"Organisation et Administration|Techn Compta)\b)")

def masquer_parentheses(txt):
    """Remplace le contenu des parentheses par des blancs, longueur inchangee.

    Sans cela, dans « SVT (PE pour EA) Pour les DEAT : », le « EA » interne
    amorce une correspondance d'en-tete qui consomme le vrai en-tete qui suit :
    la section DEAT passerait alors pour la regle de toutes les series.
    Filtrer les correspondances apres coup ne suffit pas — la zone est deja
    consommee par le parcours de l'expression reguliere.
    """
    out, prof = [], 0
    for c in txt:
        if c == "(":
            prof += 1
            out.append("\x00")
        elif c == ")":
            prof = max(0, prof - 1)
            out.append("\x00")
        else:
            out.append("\x00" if prof else c)
    return "".join(out)

def decouper_sections(brut):
    b = COLLEES.sub(r"\1 • ", norm(brut))
    masque = masquer_parentheses(b)
    parts, pos, cle = [], 0, "*"
    for m in ENTETE.finditer(masque):
        seg = b[pos:m.start()].strip(" .;•,")
        if seg:
            parts.append((cle, seg))
        # les positions valent pour les deux chaines (meme longueur), mais le
        # libelle doit etre relu sur l'original : le masque a efface les
        # parentheses eventuelles de l'en-tete.
        i = next(k for k in (1, 2, 3) if m.group(k) is not None)
        cle, pos = b[m.start(i):m.end(i)], m.end()
    seg = b[pos:].strip(" .;•,")
    if seg:
        parts.append((cle, seg))
    return parts or [("*", b)]

def resoudre(brut_mat, series):
    b = norm(brut_mat)
    if not b or b in ("-", "Non Fournies"):
        return {}, ["colonne « Matières » vide dans le guide"]

    globales, par_cle, alertes = [], {}, []
    for cle, corps in decouper_sections(b):
        if re.search(r"mati[èe]res?\s*[ée]crites", corps, re.I):
            for c in (cibles_dans(cle) or ["*"]):
                par_cle[c] = "ECRITES"
            continue
        creneaux = [c for c in (analyser_creneau(x) for x in corps.split("•")) if c]
        if cle == "*":
            globales += creneaux
        else:
            for c in (cibles_dans(cle) or ["*"]):
                if par_cle.get(c) != "ECRITES":
                    par_cle.setdefault(c, []).extend(creneaux)

    par_serie = {}
    for s in series:
        src = par_cle.get(s)
        if src is None and "/" in s:
            src = par_cle.get(s.split("/")[0] + "/TOUTES")
        if src is None:
            src = globales or par_cle.get("*")
        if src == "ECRITES":
            par_serie[s] = "TOUTES_MATIERES_ECRITES"
            continue
        if not src:
            alertes.append(f"{s} : aucune matière")
            continue
        creneaux = []
        for cr in src:
            options = []
            for alt in cr:
                if alt["series"] and s not in alt["series"]:
                    continue
                nom = alt["matiere"]
                for sub in alt["substituts"]:
                    if s in sub["series"]:
                        nom = sub["matiere"]
                if nom not in options:
                    options.append(nom)
            if options:
                creneaux.append(options)
        par_serie[s] = creneaux
    return par_serie, alertes

# ---------------------------------------------------------------- assemblage
def entier(v):
    v = norm(v)
    return int(v) if re.fullmatch(r"\d+", v) else None

def slug(s, n=40):
    return re.sub(r"[^a-z0-9]+", "-", key(s)).strip("-")[:n]

out, prev, vus = [], {}, {}
for r in recs:
    nom_u, code_u = universite(r["page"])
    if not nom_u:
        continue
    for champ in ("mode", "bac", "matieres"):
        if not r[champ] and prev.get("etablissement") == r["etablissement"]:
            r[champ] = prev.get(champ, "")

    brut_bac = norm(r["bac"])
    gen = GEN[:] if re.search(r"[Tt]outes\s+s[ée]ries", brut_bac) else series_dans(brut_bac)
    series = gen + techniques_dans(brut_bac)

    mode = key(r["mode"])
    mode = "concours" if "concours" in mode else ("classement" if "classement" in mode else "inconnu")

    par_serie, alertes = resoudre(r["matieres"], series)
    if not series:
        alertes.append("aucune série reconnue")
    if mode == "inconnu":
        alertes.append("mode d'entrée absent")
    # la regle des 3 creneaux ne vaut que pour le classement
    if mode == "classement":
        for s, v in par_serie.items():
            if v != "TOUTES_MATIERES_ECRITES" and len(v) != 3:
                noms = " + ".join("/".join(o) for o in v) or "∅"
                alertes.append(f"{s} : {len(v)} créneau(x) — {noms}")

    ident = f"{code_u}-{slug(r['etablissement'], 20)}-{slug(r['filiere'], 28)}"
    vus[ident] = vus.get(ident, 0) + 1
    if vus[ident] > 1:
        ident = f"{ident}-{vus[ident]}"

    # une filiere est calculable si, pour au moins une serie, on tient
    # exactement trois creneaux (ou la regle DEAT « toutes matieres ecrites »)
    series_ok = [s for s, v in par_serie.items()
                 if v == "TOUTES_MATIERES_ECRITES" or len(v) == 3]
    out.append({
        "id": ident,
        "calculable": mode == "classement" and bool(series_ok),
        "seriesCalculables": series_ok,
        "aVerifier": bool(alertes),
        "universite": nom_u, "codeUniversite": code_u,
        "etablissement": norm(r["etablissement"]), "filiere": norm(r["filiere"]),
        "quotaBourse": entier(r["bourse"]), "quotaAideFpp": entier(r["aide_fpp"]),
        "modeEntree": mode, "series": series,
        "creneauxParSerie": par_serie,
        "debouches": [d.strip(" .;,") for d in r["debouches"].split("•") if d.strip(" .;,")],
        "source": {"page": r["page"], "bacBrut": brut_bac, "matieresBrut": norm(r["matieres"])},
        "alertes": alertes,
    })
    prev = r

json.dump(out, open(BASE + r"\dataset.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# export vers le projet
PROJET = r"C:\Users\hp\reelle mathwork\matchwork\lib\orientation\donnees"
import os
os.makedirs(PROJET, exist_ok=True)
json.dump({
    "source": "Guide d'information et de sensibilisation des nouveaux bacheliers "
              "(Licence) 2026-2027 — MESRS Bénin",
    "plateformeOfficielle": "https://apresmonbac.bj",
    "anneeUniversitaire": "2026-2027",
    "filieres": out,
}, open(PROJET + r"\filieres-publiques.json", "w", encoding="utf-8"),
    ensure_ascii=False, indent=1)

clt = [o for o in out if o["modeEntree"] == "classement"]
net = [o for o in clt if not o["alertes"]]
paires = [(o, s, v) for o in clt for s, v in o["creneauxParSerie"].items()]
bons = [1 for _, _, v in paires if v == "TOUTES_MATIERES_ECRITES" or len(v) == 3]
print(f"filières                  : {len(out)}  (classement {len(clt)} · concours "
      f"{sum(1 for o in out if o['modeEntree']=='concours')} · inconnu "
      f"{sum(1 for o in out if o['modeEntree']=='inconnu')})")
print(f"filières classement nettes: {len(net)}/{len(clt)}")
print(f"couples (filière, série)  : {len(paires)} — {len(bons)} corrects "
      f"({len(bons)*100//max(len(paires),1)} %)")
