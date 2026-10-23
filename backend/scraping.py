import requests 
from bs4 import BeautifulSoup

new_urls=[
    "https://egradnja.hr/intervju/kresimir-damjanovic-arhitektura-je-i-istrazivanje-ne-samo-gradnja-794",
    "https://egradnja.hr/intervju/kako-ce-3d-printanje-gradevina-utjecati-na-buducnost-odrzive-gradnje-218",
    "https://egradnja.hr/intervju/najzelenija-zgrada-je-ona-koja-vec-postoji-zasto-obnavljati-ne-rusiti-1028",
    "https://egradnja.hr/nekretnine/odrziva-adaptacija-stana-u-zagrebu-kako-obnoviti-prostor-uz-minimalan-ekoloski-otisak",
    "https://egradnja.hr/prostori/dgnb-alat-za-odrzivu-gradnju-u-sluzbi-zdravlja-1122"
]

def get_article_text(url):
    response = requests.get(url)
    if response.status_code != 200: 
        print(f"Ne mogu dohvatiti {url}")
        return ""

    soup = BeautifulSoup(response.text, "html.parser")
    paragraphs = soup.find("body").find_all("p")
    return "\n".join(p.get_text(strip=True) for p in paragraphs)

with open("architecture_context.md", "a", encoding="utf8") as f:
    for url in new_urls:
        print(f"Scrapam: {url}")
        article = get_article_text(url)
        f.write(article)