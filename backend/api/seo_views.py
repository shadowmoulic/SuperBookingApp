from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from content import models as ContentModel
from django.utils.text import slugify

class SitemapView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
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
        
        return HttpResponse("\n".join(xml), content_type="application/xml")

class LLMsView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        s_count = ContentModel.State.objects.count()
        c_count = ContentModel.City.objects.count()
        e_count = ContentModel.Experience.objects.filter(deleted_at__isnull=True).count()
        
        content = f"""Zeque is a premier booking and travel platform.

Site Structure:
- Home: https://zeque.in/
- States: https://zeque.in/states
- Cities: https://zeque.in/cities
- Categories: https://zeque.in/categories
- Attractions: https://zeque.in/attractions

Current Data Statistics:
- States available: {s_count}
- Cities available: {c_count}
- Attractions available: {e_count}
"""
        return HttpResponse(content, content_type="text/plain")
