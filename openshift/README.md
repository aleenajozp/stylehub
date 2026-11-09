# Deploying StyleHub to Red Hat OpenShift

This guide explains how to deploy the entire StyleHub application (React Frontend + Django Backend + MySQL Database) to Red Hat OpenShift.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   OpenShift Router / HTTPS  |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               | (Route: /)                                | (Optional Route)
               v                                           v
    +----------------------+                    +----------------------+
    |  stylehub-frontend   |                    |   stylehub-backend   |
    |  React + Nginx:8080  | -- reverse proxy-> |   Django + Gunicorn  |
    +----------------------+     (/api, /admin) +-----------+----------+
                                                            |
                                                            v
                                                +----------------------+
                                                |    stylehub-mysql    |
                                                |     MySQL 8:3306     |
                                                |  (Persistent Storage)|
                                                +----------------------+
```

- **Frontend**: Nginx unprivileged container on port `8080` (compatible with OpenShift default `restricted-v2` SCC). Proxies `/api/` and `/admin/` calls directly to the Django backend service.
- **Backend**: Python 3.11 with Gunicorn on port `8000`, running as an unprivileged user (UID `1001`, GID `0`). Runs database migrations and collects static files automatically on startup.
- **Database**: Official Red Hat UBI MySQL 8.0 image with a PersistentVolumeClaim for durable storage.

---

## Method 1: Using the OpenShift Web Console (Recommended)

### Step 1: Push your latest changes to GitHub
Make sure all newly added Dockerfiles and configurations are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Add OpenShift Dockerfiles and manifests"
git push origin main
```

### Step 2: Open OpenShift Developer Console
1. Log in to your Red Hat OpenShift Web Console.
2. In the top-left dropdown, switch from **Administrator** to **Developer** perspective.
3. Select or create a project (e.g. `stylehub`).

### Step 3: Apply the Manifests
1. In the top bar, click the **+ (Import YAML)** icon.
2. Copy and paste the contents of [`openshift/all-in-one.yaml`](all-in-one.yaml) into the editor.
3. Click **Create**.

OpenShift will automatically:
- Create the MySQL storage and database pod.
- Trigger in-cluster container image builds for both `stylehub-backend` and `stylehub-frontend` directly from your Git repository.
- Deploy the applications once the builds finish.
- Expose secure HTTPS Routes (`stylehub-frontend` and `stylehub-backend`).

---

## Method 2: Using the OpenShift CLI (`oc`)

### 1. Log in to your OpenShift cluster
```bash
oc login --token=<your-token> --server=https://<your-cluster-api-url>:6443
```

### 2. Create and switch to a new project
```bash
oc new-project stylehub
```

### 3. Apply the manifests
```bash
oc apply -f openshift/all-in-one.yaml
```

### 4. Monitor the Builds & Deployments
```bash
# Check the build status
oc get builds -w

# Follow logs of the backend build
oc logs -f bc/stylehub-backend

# Follow logs of the frontend build
oc logs -f bc/stylehub-frontend

# Check running pods
oc get pods
```

### 5. Access your Application
Retrieve your public HTTPS routes:
```bash
oc get routes
```

Open the `stylehub-frontend` URL in your browser!

---

## Creating the Initial Admin User

When the backend pod boots up, it automatically creates the admin account if `STYLEHUB_ADMIN_PASSWORD` is supplied in the secret.

Default credentials configured in [`openshift/01-config-secret.yaml`](01-config-secret.yaml):
- **Username / Email**: `admin@stylehub.local`
- **Password**: `AdminPassword123!`

You can log into the Django Admin dashboard by navigating to `/admin/` in your browser.
*(Remember to change the secret keys and passwords before going live into production!)*
