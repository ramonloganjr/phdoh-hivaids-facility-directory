# Deploying to cPanel (Node.js)

This app is a **TanStack Start** SSR application. cPanel must have **"Setup Node.js App"** support (Node 20 or 22). Pure static / PHP-only cPanel plans will not work without giving up SSR.

---

## 1. Build locally

Requires Node.js 20+ and either [Bun](https://bun.sh) or npm.

```bash
# install deps
bun install        # or: npm install

# production build (Node server preset)
bun run build:cpanel
```

This produces a `dist/` folder:

```
dist/
├── client/      # static assets (served by Node)
└── server/
    └── index.mjs  # the Node entrypoint
```

---

## 2. Prepare the upload bundle

You only need to upload:

```
dist/
package.json
package-lock.json   (or bun.lock)
.env                (create from .env.example, see step 4)
```

Zip them:

```bash
zip -r phdoh-cpanel.zip dist package.json package-lock.json
```

---

## 3. Upload to cPanel

1. Log in to cPanel → **File Manager**.
2. Create a folder outside `public_html`, e.g. `~/apps/phdoh`.
3. Upload `phdoh-cpanel.zip` into that folder and **Extract**.

---

## 4. Configure environment variables

In cPanel → **Setup Node.js App** → your app → **Environment variables**, add anything your app needs at runtime. At minimum:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | (leave blank — cPanel assigns one) |

If you later enable Supabase / AI features, add their public + secret keys here too.

---

## 5. Create the Node.js app in cPanel

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|-------|-------|
| Node.js version | **20.x** or **22.x** |
| Application mode | **Production** |
| Application root | `apps/phdoh` (the folder you extracted into) |
| Application URL | your domain or subdomain |
| Application startup file | `dist/server/index.mjs` |

Click **Create**, then:

1. Click **Run NPM Install** (installs production deps).
2. Click **Start App** (or **Restart**).

cPanel will reverse-proxy your domain to the Node process automatically. Enable **AutoSSL** on the domain for HTTPS (required for the PWA service worker).

---

## 6. Updating later

After pulling new code (or re-uploading a new `dist/`):

```bash
# from cPanel Terminal, inside the app folder
bun run build:cpanel    # if building on the server
# then in Setup Node.js App: Restart
```

If you build locally instead, just re-upload `dist/` and click **Restart**.

---

## Troubleshooting

- **502 / app won't start** → check the Node.js app log in cPanel. Usually the startup file path is wrong or `NODE_ENV` is missing.
- **CSS / JS 404s** → `dist/client/` was not uploaded, or the Node app isn't actually serving it. Confirm `dist/server/index.mjs` is the startup file.
- **Service worker errors** → must be served over HTTPS. Turn on AutoSSL.
- **Native module errors during NPM install** → set Node to 20.x (not 18.x).
