import getpass
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create the initial StyleHub admin account if it does not exist."

    def handle(self, *args, **options):
        model = get_user_model()
        existing = model.objects.filter(username="admin").first()
        if existing:
            if existing.role != model.Role.ADMIN:
                raise CommandError("Username 'admin' belongs to a non-admin; refusing to elevate it.")
            self.stdout.write(self.style.SUCCESS("The 'admin' account already exists."))
            return
        password = os.getenv("STYLEHUB_ADMIN_PASSWORD")
        if not password:
            if not os.isatty(0):
                raise CommandError("Set STYLEHUB_ADMIN_PASSWORD or run in an interactive terminal.")
            password = getpass.getpass("Password for the initial admin: ")
            if password != getpass.getpass("Confirm admin password: "):
                raise CommandError("The passwords did not match.")
        if not password:
            raise CommandError("The admin password cannot be empty.")
        model.objects.create_superuser(
            username="admin",
            email="admin@stylehub.local",
            password=password,
            first_name="StyleHub",
        )
        self.stdout.write(self.style.SUCCESS("Created the initial 'admin' account."))
