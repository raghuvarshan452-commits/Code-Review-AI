import { Router, type IRouter } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
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
      {
        clientID,
        clientSecret,
        callbackURL: getCallbackUrl(),
      },
      (_accessToken, _refreshToken, profile, done) => {
        const user: AuthUser = {
          id: profile.id,
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
  (req, res) => {
    res.redirect("/");
  }
);

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
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });
});

export default router;
