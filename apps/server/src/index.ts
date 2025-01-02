import { api } from "@/routes/api";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Welcome to Woben API"));
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.route("/api", api);

export default app;
