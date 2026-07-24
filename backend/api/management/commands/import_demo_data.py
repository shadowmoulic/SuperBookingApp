import os
import csv
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from content.models import State, City, Category, Experience

class Command(BaseCommand):
    help = "Import all demo data (States, Categories, Cities, Experiences) from docs/demo-data/"

    def handle(self, *args, **kwargs):
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
        demo_data_dir = os.path.join(project_root, "docs", "demo-data")

        if not os.path.exists(demo_data_dir):
            self.stdout.write(self.style.ERROR(f"Demo data directory not found at: {demo_data_dir}"))
            return

        self.stdout.write(self.style.SUCCESS(f"Reading demo data from: {demo_data_dir}"))

        # 1. Load States
        states_file = os.path.join(demo_data_dir, "states.csv")
        if os.path.exists(states_file):
            self.stdout.write("Loading States...")
            with open(states_file, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    State.objects.get_or_create(
                        name=row["NAME"].strip(),
                        defaults={
                            "description": row.get("DESCRIPTION", "").strip(),
                            "image_url": row.get("IMAGE_URL", "").strip(),
                            "best_time": row.get("BEST_TIME", "").strip(),
                            "seo_title": row.get("SEO_TITLE", "").strip(),
                            "seo_description": row.get("SEO_DESCRIPTION", "").strip(),
                            "website": row.get("WEBSITE", "").strip(),
                        }
                    )
            self.stdout.write(self.style.SUCCESS("States loaded."))

        # 2. Load Categories
        categories_file = os.path.join(demo_data_dir, "categories.csv")
        if os.path.exists(categories_file):
            self.stdout.write("Loading Categories...")
            with open(categories_file, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    Category.objects.get_or_create(
                        name=row["NAME"].strip(),
                        defaults={
                            "description": row.get("DESCRIPTION", "").strip(),
                            "icon_url": row.get("ICON_URL", "").strip(),
                            "image_url": row.get("IMAGE_URL", "").strip(),
                            "seo_title": row.get("SEO_TITLE", "").strip(),
                            "seo_description": row.get("SEO_DESCRIPTION", "").strip(),
                        }
                    )
            self.stdout.write(self.style.SUCCESS("Categories loaded."))

        # 3. Load Cities
        cities_file = os.path.join(demo_data_dir, "cities.csv")
        if os.path.exists(cities_file):
            self.stdout.write("Loading Cities...")
            states_cache = {s.name.strip().lower(): s for s in State.objects.all()}
            with open(cities_file, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    state_name = row.get("STATE_NAME", "").strip()
                    state_obj = states_cache.get(state_name.lower())
                    if state_name and not state_obj:
                        state_obj, _ = State.objects.get_or_create(name=state_name)
                        states_cache[state_name.lower()] = state_obj
                    
                    latitude = row.get("LATITUDE", "").strip()
                    longitude = row.get("LONGITUDE", "").strip()

                    City.objects.get_or_create(
                        name=row["NAME"].strip(),
                        defaults={
                            "state": state_obj,
                            "description": row.get("DESCRIPTION", "").strip(),
                            "image_url": row.get("IMAGE_URL", "").strip(),
                            "icon_url": row.get("ICON_URL", "").strip(),
                            "best_time": row.get("BEST_TIME", "").strip(),
                            "seo_title": row.get("SEO_TITLE", "").strip(),
                            "seo_description": row.get("SEO_DESCRIPTION", "").strip(),
                            "latitude": float(latitude) if latitude else None,
                            "longitude": float(longitude) if longitude else None,
                        }
                    )
            self.stdout.write(self.style.SUCCESS("Cities loaded."))

        # 4. Load Experiences
        experiences_file = os.path.join(demo_data_dir, "experiences.csv")
        if os.path.exists(experiences_file):
            self.stdout.write("Loading Experiences...")
            categories_cache = {c.name.strip().lower(): c for c in Category.objects.all()}
            cities_cache = {c.name.strip().lower(): c for c in City.objects.all()}

            def parse_time(time_str):
                if not time_str or not time_str.strip():
                    return None
                try:
                    return datetime.strptime(time_str.strip(), "%H:%M:%S").time()
                except ValueError:
                    try:
                        return datetime.strptime(time_str.strip(), "%H:%M").time()
                    except ValueError:
                        parts = time_str.strip().split(":")
                        if len(parts) >= 2:
                            h, m = int(parts[0]), int(parts[1])
                            s = int(parts[2]) if len(parts) > 2 else 0
                            return datetime.min.time().replace(hour=h, minute=m, second=s)
                        return None

            def parse_duration(duration_str):
                if not duration_str or not duration_str.strip():
                    return None
                val = duration_str.strip()
                try:
                    parts = val.split(":")
                    if len(parts) == 3:
                        h, m, s = int(parts[0]), int(parts[1]), int(parts[2])
                        return timedelta(hours=h, minutes=m, seconds=s)
                    elif len(parts) == 2:
                        h, m = int(parts[0]), int(parts[1])
                        return timedelta(hours=h, minutes=m)
                    else:
                        return timedelta(hours=int(val))
                except Exception:
                    return None

            with open(experiences_file, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    cat_name = row["CATEGORY"].strip()
                    category = categories_cache.get(cat_name.lower())
                    if cat_name and not category:
                        category, _ = Category.objects.get_or_create(name=cat_name)
                        categories_cache[cat_name.lower()] = category

                    city_name = row["CITY"].strip()
                    city_obj = cities_cache.get(city_name.lower())
                    if city_name and not city_obj:
                        city_obj, _ = City.objects.get_or_create(name=city_name)
                        cities_cache[city_name.lower()] = city_obj

                    is_open = row.get("IS_OPEN", "true").strip().lower() in ["true", "1", "yes", "open"]

                    Experience.objects.get_or_create(
                        name=row["NAME"].strip(),
                        city=city_obj,
                        defaults={
                            "subtitle": row.get("SUBTITLE", "").strip(),
                            "description": row.get("DESCRIPTION", "").strip(),
                            "latitude": float(row["LATITUDE"]) if row.get("LATITUDE") else 0.0,
                            "longitude": float(row["LONGITUDE"]) if row.get("LONGITUDE") else 0.0,
                            "address": row.get("ADDRESS", "").strip(),
                            "image_url": row.get("IMAGE_URL", "").strip(),
                            "max_daily_capacity": int(row["MAX_DAILY_CAPACITY"]) if row.get("MAX_DAILY_CAPACITY") else 100,
                            "entry_fee_base": float(row["ENTRY_FEE_BASE"]) if row.get("ENTRY_FEE_BASE") else 0.0,
                            "is_open": is_open,
                            "opening_time": parse_time(row.get("OPENING_TIME", "")),
                            "closing_time": parse_time(row.get("CLOSING_TIME", "")),
                            "time_required": parse_duration(row.get("TIME_REQUIRED", "")),
                            "last_entry_time": parse_time(row.get("LAST_ENTRY_TIME", "")),
                            "category": category,
                            "deleted_at": None,
                        }
                    )
            self.stdout.write(self.style.SUCCESS("Experiences loaded."))
        self.stdout.write(self.style.SUCCESS("Demo data import completed successfully!"))
