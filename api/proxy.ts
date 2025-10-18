import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backendBase = "http://161.97.134.211/xp/api";

  const path = req.url?.replace(/^\/api/, "") ?? "";
  const targetUrl = `${backendBase}${path}`;

  console.log("Proxying request to:", targetUrl); // 👈 Add this line

  try {
    // ✅ Convert Node headers to a proper fetch-friendly object
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers[key] = value;
      }
    }

    // Remove problematic headers
    delete headers["host"];
    delete headers["content-length"];

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined,
    });

    const contentType = response.headers.get("content-type");
    res.status(response.status);

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (err: any) {
    console.error("Proxy error:", err);
    res.status(500).json({ message: "Proxy error", error: err.message });
  }
}
