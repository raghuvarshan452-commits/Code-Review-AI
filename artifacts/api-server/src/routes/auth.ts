import { Router, type IRouter } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, localUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

function getCallbackUrl(): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const primary = domains.split(",")[0].trim();
    return `https://${primary}/api/auth/google/callback`;
  }
  return `http://localhost:${process.env.PORT ?? 8080}/api/auth/google/callback`;
}

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientID && clientSecret) {
  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL: getCallbackUrl() },
      (_accessToken, _refreshToken, profile, done) => {
        const user: AuthUser = {
          id: `google_${profile.id}`,
          name: profile.displayName ?? "",
          email: profile.emails?.[0]?.value ?? "",
          image: profile.photos?.[0]?.value ?? "",
        };
        return done(null, user);
      }
    )
  );
} else {
  logger.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled");
}

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const [row] = await db
        .select()
        .from(localUsersTable)
        .where(eq(localUsersTable.email, email.toLowerCase().trim()));

      if (!row) return done(null, false, { message: "No account found with that email." });

      const valid = await bcrypt.compare(password, row.passwordHash);
      if (!valid) return done(null, false, { message: "Incorrect password." });

      const user: AuthUser = {
        id: `local_${row.id}`,
        name: row.name,
        email: row.email,
        image: "",
      };
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user as AuthUser));

const router: IRouter = Router();

router.get("/google", (req, res, next) => {
  if (!clientID || !clientSecret) {
    res.status(503).json({ error: "Google OAuth not configured" });
    return;
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { failureRedirect: "/?auth_error=1" })(req, res, next);
  },
  (req, res) => { res.redirect("/"); }
);

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required." });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const [existing] = await db
    .select()
    .from(localUsersTable)
    .where(eq(localUsersTable.email, normalizedEmail));

  if (existing) {
    res.status(409).json({ error: "An account with that email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const id = crypto.randomBytes(16).toString("hex");

  await db.insert(localUsersTable).values({
    id,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
  });

  const user: AuthUser = { id: `local_${id}`, name: name.trim(), email: normalizedEmail, image: "" };

  req.login(user, (err) => {
    if (err) {
      res.status(500).json({ error: "Registration succeeded but login failed." });
      return;
    }
    res.json(user);
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: unknown, user: AuthUser | false, info: { message?: string } | undefined) => {
    if (err) { next(err); return; }
    if (!user) {
      res.status(401).json({ error: info?.message ?? "Invalid credentials." });
      return;
    }
    req.login(user, (loginErr) => {
      if (loginErr) { next(loginErr); return; }
      res.json(user);
    });
  })(req, res, next);
});

router.get("/me", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      req.log.error(err, "logout error");
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    req.session.destroy(() => { res.json({ ok: true }); });
  });
});

export default router;
