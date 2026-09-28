#!/usr/bin/env python3
"""Ambil daftar berita dari RSS infobekasi.co.id -> berita.json.
Hanya judul, link, tanggal, kategori (tanpa isi berita). Kalau gagal, berita.json lama dibiarkan."""
import json, re, sys, urllib.request, xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import timezone, timedelta

FEED = "https://infobekasi.co.id/feed/"
UA = "RT08-VillaIndah-BeritaBot/1.0 (portal warga RT 08; ambil judul dan link saja)"
OUT = "berita.json"
MAX_ITEMS = 12
WIB = timezone(timedelta(hours=7))
NS = {"m": "http://search.yahoo.com/mrss/", "c": "http://purl.org/rss/1.0/modules/content/"}

def cari_gambar(it):
    """Cari alamat foto utama (hanya URL-nya; foto tidak disalin/diunduh)."""
    for tag in ("m:thumbnail", "m:content"):
        e = it.find(tag, NS)
        if e is not None and (e.get("url") or "").startswith("https://"):
            return e.get("url")
    e = it.find("enclosure")
    if e is not None and (e.get("type") or "").startswith("image") and (e.get("url") or "").startswith("https://"):
        return e.get("url")
    html = (it.findtext("c:encoded", namespaces=NS) or "") + (it.findtext("description") or "")
    m = re.search(r'<img[^>]+src=["\']([^"\']+)', html)
    if m and m.group(1).startswith("https://"):
        return m.group(1)
    return None

def main(src=None):
    if src:
        data = open(src, "rb").read()
    else:
        req = urllib.request.Request(FEED, headers={"User-Agent": UA})
        data = urllib.request.urlopen(req, timeout=30).read()
    root = ET.fromstring(data)
    items = []
    for it in root.iter("item"):
        judul = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        if not judul or not link.startswith("https://"):
            continue
        try:
            tgl = parsedate_to_datetime(it.findtext("pubDate")).astimezone(WIB).strftime("%Y-%m-%d")
        except Exception:
            continue
        cats = [c.text.strip() for c in it.findall("category") if c.text]
        cats = [c for c in cats if c.lower() not in ("berita", "uncategorized")]
        item = {"judul": judul, "link": link, "tgl": tgl, "kat": cats[0] if cats else "Berita"}
        img = cari_gambar(it)
        if img:
            item["img"] = img
        items.append(item)
        if len(items) >= MAX_ITEMS:
            break
    if not items:
        print("Feed kosong; berita.json tidak diubah."); return
    try:
        lama = json.load(open(OUT, encoding="utf-8")).get("items")
    except Exception:
        lama = None
    if lama == items:
        print("Tidak ada berita baru."); return
    json.dump({"sumber": "infobekasi.co.id", "items": items}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("berita.json diperbarui:", len(items), "item")

if __name__ == "__main__":
    try:
        main(sys.argv[1] if len(sys.argv) > 1 else None)
    except Exception as e:
        print("Gagal ambil feed:", e); sys.exit(0)  # jangan merahkan workflow
