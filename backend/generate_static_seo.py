import os
import sys
import django
from django.utils.text import slugify

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings.dev')
django.setup()

from content import models as ContentModel

base_url = "https://zeque.in"
urls = [
    f"{base_url}/",
    f"{base_url}/states",
    f"{base_url}/cities",
    f"{base_url}/categories",
    f"{base_url}/attractions",
    f"{base_url}/itineraries",
]

for state in ContentModel.State.objects.all():
    urls.append(f"{base_url}/state/{slugify(state.name) if state.name else state.id}")
    
for city in ContentModel.City.objects.all():
    urls.append(f"{base_url}/city/{slugify(city.name) if city.name else city.id}")
    
for cat in ContentModel.Category.objects.all():
    urls.append(f"{base_url}/category/{slugify(cat.name) if cat.name else cat.id}")
    
for exp in ContentModel.Experience.objects.filter(deleted_at__isnull=True):
    urls.append(f"{base_url}/attraction/{exp.public_id}")

xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for url in urls:
    xml.append('  <url>')
    xml.append(f'    <loc>{url}</loc>')
    xml.append('    <changefreq>weekly</changefreq>')
    xml.append('  </url>')
xml.append('</urlset>')

with open('../frontend/public/sitemap.xml', 'w') as f:
    f.write('\n'.join(xml))
    
s_count = ContentModel.State.objects.count()
c_count = ContentModel.City.objects.count()
e_count = ContentModel.Experience.objects.filter(deleted_at__isnull=True).count()

llms_content = f"""Zeque is a premier booking and travel platform.

Site Structure:
- Home: {base_url}/
- States: {base_url}/states
- Cities: {base_url}/cities
- Categories: {base_url}/categories
- Attractions: {base_url}/attractions

Current Data Statistics:
- States available: {s_count}
- Cities available: {c_count}
- Attractions available: {e_count}
"""

with open('../frontend/public/llms.txt', 'w') as f:
    f.write(llms_content)

print("Generated static sitemap.xml and llms.txt successfully.")
