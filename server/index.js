import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
import { calculateQuote, RULES, TIERS } from "./pricing.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, "store.json");
const port = Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === "production";
const app = express();
let writeQueue = Promise.resolve();

app.use(express.json());

async function readStore() {
  return JSON.parse(await fs.readFile(storePath, "utf8"));
}

async function updateStore(mutator) {
  let result;
  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    result = await mutator(store);
    await fs.writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`);
  });
  await writeQueue;
  return result;
}

function getShow(store, showId) {
  return store.shows.find((show) => show.id === showId);
}

function quoteForShow(store, body) {
  const show = getShow(store, body.showId);
  if (!show) {
    const error = new Error("Showtime not found.");
    error.status = 404;
    throw error;
  }

  return {
    show,
    quote: calculateQuote({
      basket: body.basket,
      availability: show.availability,
      festivalEnabled: Boolean(body.festivalEnabled),
      memberEnabled: Boolean(body.memberEnabled),
    }),
  };
}

app.get("/api/config", (_request, response) => {
  response.json({ tiers: TIERS, rules: RULES });
});

app.get("/api/shows", async (_request, response, next) => {
  try {
    const store = await readStore();
    response.json(store.shows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/quotes", async (request, response, next) => {
  try {
    const store = await readStore();
    const { quote } = quoteForShow(store, request.body);
    response.json(quote);
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", async (request, response, next) => {
  try {
    const booking = await updateStore((store) => {
      const { show, quote } = quoteForShow(store, request.body);
      for (const line of quote.ticketLines) {
        show.availability[line.id] -= line.quantity;
      }

      const savedBooking = {
        id: `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        showId: show.id,
        showTime: show.time,
        hall: show.hall,
        movie: "The Night Shift",
        basket: request.body.basket,
        festivalEnabled: Boolean(request.body.festivalEnabled),
        memberEnabled: Boolean(request.body.memberEnabled),
        quote,
      };
      store.bookings.push(savedBooking);
      return savedBooking;
    });
    response.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

app.get("/api/bookings/:id", async (request, response, next) => {
  try {
    const store = await readStore();
    const booking = store.bookings.find((item) => item.id === request.params.id);
    if (!booking) {
      return response.status(404).json({ error: "Booking not found." });
    }
    response.json(booking);
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  const status = error.status || 400;
  response.status(status).json({ error: error.message || "Something went wrong." });
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.use((request, response, next) => {
    if (request.method !== "GET" || request.path.startsWith("/api")) {
      return next();
    }
    return response.sendFile(path.join(__dirname, "../dist/index.html"));
  });
} else {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      allowedHosts: true,
    },
  });
  app.use(vite.middlewares);
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Cine Ledger server listening on port ${port}`);
});