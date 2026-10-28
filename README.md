# Música Retro

Catálogo personal de vinilos y CDs. Es una app web estática (Vite + React + Tailwind) publicada en GitHub Pages, con los datos privados en Supabase (Postgres + Auth + Storage). Se instala en el celular como app y se puede consultar sin conexión.

- El código del repo es público y no contiene secretos.
- Es un catálogo compartido: lo ven y lo editan las cuentas listadas en `public.miembros`. El acceso es por mail y los datos están protegidos con RLS.

## Puesta en marcha

### 1. Supabase

1. Crear un proyecto nuevo (región São Paulo o US East).
2. Aplicar la estructura. Hay dos opciones:
   - **SQL Editor:** pegar y ejecutar, en orden, los archivos de `supabase/migrations/`.
   - **CLI:** `supabase link --project-ref <ref>` y después `supabase db push`.

   Con eso quedan creadas las tablas, los triggers, RLS, las funciones RPC, el bucket privado `imagenes` y sus policies.
3. **Authentication → Sign In / Providers → Email**:
   - Email habilitado.
   - **Allow new users to sign up: desactivado** (solo entran cuentas invitadas).
4. **Authentication → URL Configuration**:
   - Site URL: `https://<tu-usuario>.github.io/musica-retro/`
   - Redirect URLs: la misma y `http://localhost:5173/musica-retro/`
5. **(Opcional) Código en el mail.** Con el correo por defecto de Supabase el mail trae solo el link, que hay que abrir en el mismo dispositivo donde está la app. El correo por defecto envía solo a miembros de la organización (**Organization → Team**) y pocos mails por hora. Para sumar un código que sirva desde cualquier navegador, hay que configurar un SMTP propio (**Emails → SMTP Settings**) y editar **Templates → Magic link or OTP**:

   ```html
   <h2>Música Retro</h2>
   <p><a href="{{ .ConfirmationURL }}">Entrar</a></p>
   <p>O escribí este código en la app: <strong>{{ .Token }}</strong></p>
   ```
6. **Authentication → Users → Invite user**: invitar el mail de cada persona que va a usar la app. Después, en el **SQL Editor**, sumarlas al catálogo compartido:

   ```sql
   insert into public.miembros (user_id)
   select id from auth.users where email in ('uno@ejemplo.com', 'otra@ejemplo.com');
   ```

   Una cuenta que no está en `miembros` puede iniciar sesión, pero ve el catálogo vacío y no puede guardar nada.

   **Contraseñas** (para no depender del mail): cada persona elige la suya y la carga en el SQL Editor. Esto también confirma la cuenta aunque no haya aceptado la invitación:

   ```sql
   update auth.users
   set encrypted_password = extensions.crypt('LA-CONTRASEÑA', extensions.gen_salt('bf')),
       email_confirmed_at = coalesce(email_confirmed_at, now())
   where email = 'uno@ejemplo.com';
   ```

   Después, cada uno puede cambiarla desde **Ajustes → Cambiar contraseña**. Si alguien la olvida: **"¿Olvidaste tu contraseña?"** en el login manda un link por mail; si el mail no llega (por el límite de envíos), se repite este `update`.
7. **Project Settings → API**: copiar la **Project URL** y la **anon / publishable key**.

### 2. Desarrollo local

```bash
cp .env.example .env.local   # completar URL y clave
npm install
npm run dev                  # http://localhost:5173/musica-retro/
npm test
```

### 3. GitHub Pages

1. Crear el repo `musica-retro` y subir el código a `main`.
2. **Settings → Pages → Source: GitHub Actions**.
3. **Settings → Secrets and variables → Actions → Variables**: crear `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Son variables y no secretos, porque la clave anon es pública por diseño.
4. Cada push a `main` corre los tests, construye y publica (`.github/workflows/deploy.yml`).
5. **Actions → Keep-alive de Supabase → Run workflow**: correrlo una vez a mano para verificarlo.

Si el repo tiene otro nombre, cambiar `base` en `vite.config.js` y las rutas `/musica-retro/` de `index.html` y del manifest.

## Keep-alive

Supabase pausa los proyectos gratuitos sin actividad. `.github/workflows/keepalive.yml` llama cada 3 días a la función `ping()` (lo único accesible sin sesión). Si falla, GitHub manda un mail.

**GitHub desactiva los workflows programados después de 60 días sin actividad en el repo.** Para evitarlo, el mismo workflow hace un commit de "latido" (actualiza `.github/latido`) cuando el último commit tiene 50 días o más. En uso normal no genera commits. Si aun así se desactivara, GitHub avisa por mail y se reactiva con **Actions → Keep-alive de Supabase → Enable workflow**. Si el proyecto llegara a pausarse, se reactiva desde el panel de Supabase con **Restore**, sin perder datos.

## Cómo funciona

| Tema | Dónde |
|---|---|
| Modelo, RLS y RPC (`agregar_disco`, `importar_discos`, `renombrar_banda`, `fusionar_bandas`…) | `supabase/migrations/` |
| Normalización y formato tipo título | `src/lib/texto.js` (espejo de `public.normalizar()`) |
| Sincronización, caché offline y escrituras | `src/lib/catalogoContexto.jsx`, `src/lib/almacen.js` |
| Fotos: recorte cuadrado, 800 px, WebP; bucket privado y URLs firmadas | `src/lib/imagen.js` |
| Service worker: app shell + imágenes cacheadas por ruta (sin el token) | `vite.config.js` |
| Tokens de color: temas escenario/fanzine × acentos violeta/rojo | `src/index.css` |

Sin conexión, la app muestra el último catálogo sincronizado (datos y todas las tapas, que se descargan en segundo plano) y deshabilita las escrituras.

## Importar una lista

**Ajustes → Importar una lista**. Va una línea por disco, con los campos separados por `;` o por tabulación (sirve pegar tres columnas de una planilla):

```
Soda Stereo; Signos; CD
Sumo; After Chabón; vinilo
```

Formatos aceptados: `vinilo`, `vinil`, `lp`, `v`, `cd`, `c`. Antes de guardar se ve una vista previa. La importación es todo o nada.
