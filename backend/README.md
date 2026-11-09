# STYLEHUB Django REST backend

This backend lives at `D:\React\stylehub\backend`, beside the React app's `src` folder. Frontend files are unchanged. Product JSON includes `id`, `name`, `category`, `type`, `price`, `image`, `sizes`, and `color` to match the current UI.

## Setup (Windows PowerShell)

Open PowerShell in `D:\React\stylehub\backend`:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate again.

Install/start MySQL and create the database and app user:

```sql
CREATE DATABASE stylehub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'stylehub_user'@'localhost' IDENTIFIED BY 'use-a-unique-password';
GRANT ALL PRIVILEGES ON stylehub.* TO 'stylehub_user'@'localhost';
FLUSH PRIVILEGES;
```

Set `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `.env`, and replace `DJANGO_SECRET_KEY` with a random secret. `.env` is ignored by git. The committed placeholder values are for local setup only. Leave `STYLEHUB_ADMIN_PASSWORD` blank to enter a password via hidden terminal prompt.

Run migrations, create the initial admin, and start Django:

```powershell
python manage.py makemigrations accounts products cart orders
python manage.py migrate
python manage.py create_initial_admin
python manage.py runserver
```

The API is at `http://127.0.0.1:8000/api/`. CORS allows `http://localhost:5173`. Send `Authorization: Bearer <access>` for protected endpoints. Login accepts `username` or `email` and returns `access`, `refresh`, `user`, and `role`. Registration accepts `{ "name", "email", "password" }`; submitted role values are ignored and users are always assigned `user`.

Create categories as admin first (`POST /api/products/categories/`, `{ "name": "Men" }`), then create products with a category name. Product sizes are arrays of strings. Admin order status values are `pending`, `processing`, `shipped`, `delivered`, `cancelled`; payment remains pending until a payment integration is added.

## API

| Method | Path | Access |
|---|---|---|
| POST | `/api/accounts/register/` | Public |
| POST | `/api/accounts/login/` | Public |
| POST | `/api/accounts/logout/` | Authenticated; `{"refresh":"..."}` |
| GET, PUT, PATCH | `/api/accounts/profile/` | Authenticated |
| GET | `/api/accounts/users/` | Admin |
| GET, POST | `/api/products/` | Public read; admin write |
| GET, PUT, PATCH, DELETE | `/api/products/<id>/` | Public read; admin write |
| GET, POST | `/api/products/categories/` | Public read; admin write |
| GET, PUT, PATCH, DELETE | `/api/products/categories/<id>/` | Admin |
| GET | `/api/cart/` | Authenticated |
| POST | `/api/cart/add/` | Authenticated; `product_id`, `size`, optional `quantity` |
| PUT | `/api/cart/update/` | Authenticated; `product_id`, `size`, `quantity` |
| DELETE | `/api/cart/remove/<product_id>/?size=<size>` | Authenticated |
| GET | `/api/wishlist/` | Authenticated |
| POST | `/api/wishlist/add/` | Authenticated; `product_id` |
| DELETE | `/api/wishlist/remove/<product_id>/` | Authenticated |
| POST | `/api/orders/place/` | Authenticated; `delivery_address`, `phone_number` |
| GET | `/api/orders/my-orders/` | Authenticated; own orders only |
| GET | `/api/orders/` | Admin |
| PUT, PATCH | `/api/orders/<id>/status/` | Admin |
| GET | `/api/orders/dashboard/` | Admin |
