import csv
from datetime import datetime
from django.core.management.base import BaseCommand
from content.models import Experience, Category, City


class Command(BaseCommand):
    help = "Import places with foreign keys mapped to Category and City"

    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=str)

    def handle(self, *args, **kwargs):
        file_path = kwargs["csv_file"]

        # Cache using lowercase key for lookup, store actual object
        categories = {c.name.strip().lower(): c for c in Category.objects.all()}
        cities = {c.name.strip().lower(): c for c in City.objects.all()}

        created_count = 0
        skipped_count = 0

        with open(file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            self.stdout.write(self.style.WARNING(f"Headers: {reader.fieldnames}"))

            for row in reader:
                try:
                    cat_name = row["CATEGORY"].strip()
                    cat_key = cat_name.lower()
                    category = categories.get(cat_key)
                    if not category:
                        category, _ = Category.objects.get_or_create(name=cat_name)
                        categories[cat_key] = category

                    city_name = row["LOCATION"].strip()
                    city_key = city_name.lower()
                    city_obj = cities.get(city_key)
                    if not city_obj:
                        city_obj, _ = City.objects.get_or_create(name=city_name)
                        cities[city_key] = city_obj

                    is_open = row["IS_OPEN"].strip().lower() in ["true", "1", "yes"]

                    opening_time = datetime.strptime(
                        row["OPENING_TIME"], "%H:%M:%S"
                    ).time()
                    closing_time = datetime.strptime(
                        row["CLOSING_TIME"], "%H:%M:%S"
                    ).time()
                    last_entry_time = datetime.strptime(
                        row["LAST_ENTRY_TIME"], "%H:%M:%S"
                    ).time()

                    # Use get_or_create to avoid duplicates on re-import
                    place, created = Experience.objects.get_or_create(
                        name=row["NAME"],
                        city=city_obj,
                        defaults={
                            "description": row["DESCRIPTION"],
                            "latitude": float(row["LATITUDE"]),
                            "longitude": float(row["LONGITUDE"]),
                            "image_url": row["IMAGE_URL"],
                            "max_daily_capacity": int(row["MAX_DAILY_CAPACITY"]),
                            "entry_fee_base": float(row["ENTRY_FEE_BASE"]),
                            "is_open": is_open,
                            "opening_time": opening_time,
                            "closing_time": closing_time,
                            "last_entry_time": last_entry_time,
                            "category": category,
                            "deleted_at": None,
                        },
                    )

                    if created:
                        created_count += 1
                    else:
                        skipped_count += 1

                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f"Skipping row: {row.get('NAME', '?')} | Error: {e}")
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported {created_count} places successfully! ({skipped_count} already existed, skipped)"
            )
        )
