import request from "supertest";
import app from "../app";
import "./setup";

describe("Authentication & Authorization API", () => {
  describe("POST /api/auth/signup", () => {
    it("should register a student successfully with HTTP 201 and return token", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test Student",
          email: "student@test.edu",
          password: "password123",
          role: "student",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user.email).toBe("student@test.edu");
      expect(res.body.data.user.role).toBe("student");
      expect(res.body.data.user).not.toHaveProperty("password");
    });

    it("should prevent privilege escalation: reject direct admin self-registration", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Malicious User",
          email: "hacker@test.edu",
          password: "password123",
          role: "admin",
        });

      // Zod or controller catches admin role
      expect([400, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it("should reject registration with invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Bad Email",
          email: "not-an-email",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should reject registration with password under 6 characters", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Short Pass",
          email: "short@test.edu",
          password: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject registration with already registered email", async () => {
      await request(app).post("/api/auth/signup").send({
        name: "First User",
        email: "duplicate@test.edu",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/signup").send({
        name: "Second User",
        email: "duplicate@test.edu",
        password: "password456",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/signup").send({
        name: "Login User",
        email: "login@test.edu",
        password: "correctpassword",
      });
    });

    it("should login with valid credentials and return JWT token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@test.edu",
        password: "correctpassword",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user.email).toBe("login@test.edu");
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@test.edu",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "ghost@test.edu",
        password: "anypassword",
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
