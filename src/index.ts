#!/usr/bin/env node
import minimist from "minimist";
import fs from "fs";

interface ExportItem {
  id: string;
  name: string;
  data: string;
  monthly: number | null;
  [key: string]: string | number | null;
}

interface PublisherUsageStats {
  total: number;
  currentMonth: number;
  currentDay: number;
  currentHour: number;
  currentLive: number;
}

interface UsageStats {
  usageStats: {
    total: number;
    currentMonth: number;
    currentDay: number;
    currentHour: number;
    currentLive: number;
  };
}

const args = minimist(process.argv.slice(2), {
  alias: {
    a: "account-id",
    k: "api-key",
    h: "help",
  },
  string: ["account-id", "api-key"],
});

if (args.help) {
  console.log(`
Usage: ringba-export -a <account-id> -k <api-key>

Options:
  -a, --account-id  Ringba account ID (required)
  -k, --api-key     Ringba API key (required)
  -h, --help        Show this help message
`);
  process.exit(0);
}

const accountId = args["account-id"];
const apiKey = args["api-key"];

if (!accountId || !apiKey) {
  console.error("Error: --account-id (-a) and --api-key (-k) are required");
  console.error("Run with --help for usage information");
  process.exit(1);
}

const outputDir = `output/${accountId}`;

(async () => {
  console.log("Exporting Ringba data...");
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Output directory: ${outputDir}`);

  await exportRingba();
  console.log("Export complete!");
  process.exit(0);
})().catch((error) => {
  console.error("Export failed:", error.message);
  process.exit(1);
});

async function exportRingba() {
  const publishers = await getObjects("publishers", "publishers", true);
  console.log(`Found ${publishers.length} publishers`);

  const buyers = await getObjects("buyers", "buyers", true);
  console.log(`Found ${buyers.length} buyers`);

  const pingtrees = await getObjects("pingtrees", "pingTrees", true);
  console.log(`Found ${pingtrees.length} pingtrees`);

  const pingtreetargets = await getObjects(
    "pingtreetargets",
    "pingTreeTargets",
    true
  );
  console.log(`Found ${pingtreetargets.length} pingtreetargets`);

  const targets = await getObjects("targets", "targets", true);
  console.log(`Found ${targets.length} targets`);

  // Convert to CSV
  const publishersCsv = convertToCSV(publishers);
  const buyersCsv = convertToCSV(buyers);
  const pingtreesCsv = convertToCSV(pingtrees);
  const pingtreetargetsCsv = convertToCSV(pingtreetargets);
  const targetsCsv = convertToCSV(targets);

  const date = new Date().toISOString().split("T")[0];

  const publishersFilename = `${outputDir}/publishers-${accountId}-${date}.csv`;
  fs.writeFileSync(publishersFilename, publishersCsv);
  console.log(`Exported publishers to ${publishersFilename}`);

  const buyersFilename = `${outputDir}/buyers-${accountId}-${date}.csv`;
  fs.writeFileSync(buyersFilename, buyersCsv);
  console.log(`Exported buyers to ${buyersFilename}`);

  const pingtreesFilename = `${outputDir}/pingtrees-${accountId}-${date}.csv`;
  fs.writeFileSync(pingtreesFilename, pingtreesCsv);
  console.log(`Exported pingtrees to ${pingtreesFilename}`);

  const pingtreetargetsFilename = `${outputDir}/pingtreetargets-${accountId}-${date}.csv`;
  fs.writeFileSync(pingtreetargetsFilename, pingtreetargetsCsv);
  console.log(`Exported pingtreetargets to ${pingtreetargetsFilename}`);

  const targetsFilename = `${outputDir}/targets-${accountId}-${date}.csv`;
  fs.writeFileSync(targetsFilename, targetsCsv);
  console.log(`Exported targets to ${targetsFilename}`);
}

async function getObjects(
  objectPath: string,
  objectType: string,
  includeStats: boolean = false
): Promise<ExportItem[]> {
  const url = `https://api.ringba.com/v2/${accountId}/${objectPath}${includeStats ? "?includeStats=true" : ""}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${objectType}: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  fs.writeFileSync(
    `${outputDir}/${objectType}-data.json`,
    JSON.stringify(data, null, 2)
  );

  const objects: Record<string, ExportItem> = {};

  for (const object of data[objectType]) {
    objects[object.id] = {
      id: object.id,
      name: object.name,
      data: JSON.stringify(object),
      monthly: null,
    };
  }

  if (includeStats && data.stats) {
    for (const [id, stats] of Object.entries(data.stats)) {
      // Ringba API returns stats with lowercase first letter, but object IDs have uppercase
      const normalizedId = id.charAt(0).toUpperCase() + id.slice(1);
      if (objects[normalizedId]) {
        // Publishers have a different stats structure than other object types
        if (objectType === "publishers") {
          objects[normalizedId].monthly = (
            stats as PublisherUsageStats
          ).currentMonth;
        } else {
          objects[normalizedId].monthly = (stats as UsageStats).usageStats
            .currentMonth;
        }
      }
    }
  }

  return Object.values(objects);
}

function convertToCSV(items: ExportItem[]): string {
  if (items.length === 0) {
    return "No rows found";
  }

  // Get all unique headers from all items
  const headers = new Set<string>();
  items.forEach((item) => {
    Object.keys(item).forEach((key) => headers.add(key));
  });

  const headerArray = Array.from(headers).sort();

  // Create CSV header row
  const csvRows = [headerArray.join(",")];

  // Create CSV data rows
  items.forEach((item) => {
    const row = headerArray.map((header) => {
      const value = item[header];

      // Handle different data types
      if (value === null || value === undefined) {
        return "";
      } else if (typeof value === "object") {
        // Convert objects/arrays to JSON string and escape quotes
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else if (
        typeof value === "string" &&
        (value.includes(",") || value.includes('"') || value.includes("\n"))
      ) {
        // Escape CSV special characters
        return `"${value.replace(/"/g, '""')}"`;
      } else {
        return String(value);
      }
    });

    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}
