import express from "express";
import fs from "fs";
import fetch from "node-fetch";
import "dotenv/config";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));
const PORT = 3001;

const FILE = "./data/cities.json";
const API_KEY = process.env.VITE_API_KEY;
const TARGET = 10000;

app.get("/cities", async (req, res) => {
  if (fs.existsSync(FILE)) {
    const data = JSON.parse(fs.readFileSync(FILE));
    return res.json(data);
  }

  let allCities = [];
  const limit = 10;
  let offset = 0;

  while (allCities.length < TARGET) {
    const response = await fetch(
      `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=${limit}&offset=${offset}&minPopulation=10000&sort=population`,
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
        }
      }
    );

    const json = await response.json();
    const cities = json.data || [];
    if (!cities.length) break;

    allCities.push(...cities);
    offset += limit;

    await new Promise(r => setTimeout(r, 1500));
  }

  allCities = allCities.slice(0, TARGET);

  fs.mkdirSync("./data", { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(allCities, null, 2));

  res.json(allCities);
});

app.listen(PORT, () => console.log("Server rodando na porta", PORT));
