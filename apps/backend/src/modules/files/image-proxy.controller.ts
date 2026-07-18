import { Request, Response, NextFunction } from "express";
import http from "http";
import https from "https";
import dns from "dns";
import { logger } from "@/shared/logger";

const resolver = new dns.promises.Resolver();
resolver.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

export async function proxyImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { src } = req.query;
    if (!src || typeof src !== "string") {
      res
        .status(400)
        .json({ success: false, message: "src query parameter is required" });
      return;
    }

    const url = new URL(src);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      res.status(400).json({ success: false, message: "Invalid protocol" });
      return;
    }

    logger.info(`[image-proxy] Proxying image: ${src}`);

    // Explicitly resolve DNS using our custom resolver (Cloudflare/Google DNS)
    // This bypasses the system DNS which may not resolve R2 domains correctly
    let resolvedIp: string;
    try {
      const addresses = await resolver.resolve4(url.hostname);
      resolvedIp = addresses[0];
      logger.info(
        `[image-proxy] DNS resolved ${url.hostname} -> ${resolvedIp} using Cloudflare/Google DNS`,
      );
    } catch (dnsError: any) {
      logger.error(
        `[image-proxy] DNS resolution failed for ${url.hostname}: ${dnsError.message}`,
      );
      res.status(502).json({
        success: false,
        message: "DNS resolution failed",
        error: dnsError.message,
      });
      return;
    }

    const client = url.protocol === "https:" ? https : http;

    // Create request options with explicit Host header
    const requestOptions = {
      hostname: resolvedIp,
      port: url.protocol === "https:" ? 443 : 80,
      path: url.pathname + url.search,
      method: "GET",
      headers: {
        Host: url.hostname, // Important: send original hostname as Host header
        "User-Agent": "BetterLibmanan-ImageProxy/1.0",
      },
    };

    const proxyReq = client.request(requestOptions, (proxyRes) => {
      res.status(proxyRes.statusCode || 500);

      const headersToForward = [
        "content-type",
        "content-length",
        "cache-control",
        "etag",
        "last-modified",
      ];
      for (const header of headersToForward) {
        const value = proxyRes.headers[header];
        if (value) {
          if (Array.isArray(value)) {
            for (const v of value) {
              res.append(header, v);
            }
          } else {
            res.setHeader(header, value);
          }
        }
      }

      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      logger.error(`[image-proxy] Request error: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to proxy image",
          error: err.message,
        });
      }
    });

    proxyReq.end();
  } catch (err: any) {
    logger.error(`[image-proxy] Failed to proxy image`, {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to proxy image",
        error: err.message,
      });
    }
  }
}
