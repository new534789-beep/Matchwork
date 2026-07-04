"""Test Scrapling sur les sites de bourses qui bloquent fetch+cheerio."""
from scrapling import Fetcher

fetcher = Fetcher(auto_match=False)

sources = [
    ("ARES", "https://www.ares-ac.be/fr/cooperation-au-developpement/bourses"),
    ("Campus France", "https://www.campusfrance.org/fr/bourses-pour-etudiants-etrangers"),
    ("Campus France v2", "https://www.campusfrance.org/fr/les-bourses"),
    ("AUF", "https://www.auf.org/appels-a-candidatures/"),
    ("VLIR-UOS", "https://www.vliruos.be/en/scholarships/"),
    ("EduCanada", "https://www.educanada.ca/scholarships-bourses/non_can/index.aspx?lang=fra"),
    ("CampusChina", "https://www.campuschina.org/scholarships/index.html"),
    ("StudyInKorea", "https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do"),
    ("NIIED", "https://www.niied.go.kr/eng/contents.do?contentsNo=78"),
    ("Boell", "https://www.boell.de/en/scholarships"),
    ("Eiffel", "https://www.campusfrance.org/fr/le-programme-de-bourses-d-excellence-eiffel"),
    ("CEDIES", "https://cedies.public.lu/fr/bourses-aides.html"),
    ("FWO", "https://www.fwo.be/en/fellowships-funding/"),
    ("WBI", "https://www.wbi.be/bourses"),
    ("Uni.lu", "https://www.uni.lu/studies/scholarships-and-financial-aid/"),
]

for name, url in sources:
    print(f"\n--- {name} ---")
    try:
        page = fetcher.get(url, timeout=20)
        status = page.status
        body_len = len(page.text) if page.text else 0
        links = page.css("a[href]")
        print(f"  Status: {status} | HTML: {body_len} chars | Liens: {len(links)}")
        for a in links[:3]:
            href = a.attrib.get("href", "")[:80]
            text = a.text.strip()[:50] if a.text else ""
            print(f"    {text} → {href}")
    except Exception as e:
        print(f"  ERREUR: {e}")

print("\nTest terminé.")
