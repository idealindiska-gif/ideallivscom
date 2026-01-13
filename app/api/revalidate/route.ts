import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const maxDuration = 30;

/**
 * WordPress/WooCommerce webhook handler for content revalidation
 * Supports both custom webhook format and native WooCommerce webhooks
 */

function verifyWooCommerceSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("base64");
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    let requestBody: Record<string, unknown>;

    try {
      requestBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Check for WooCommerce webhook headers
    const wcWebhookTopic = request.headers.get("x-wc-webhook-topic");
    const wcWebhookSignature = request.headers.get("x-wc-webhook-signature");
    const wcWebhookSource = request.headers.get("x-wc-webhook-source");
    const customSecret = request.headers.get("x-webhook-secret");

    let isAuthenticated = false;
    let contentType = "";
    let contentId: number | undefined;
    let slug: string | undefined;

    // Handle WooCommerce native webhooks
    if (wcWebhookTopic && wcWebhookSignature) {
      const secret = process.env.WORDPRESS_WEBHOOK_SECRET || "";
      isAuthenticated = verifyWooCommerceSignature(
        rawBody,
        wcWebhookSignature,
        secret
      );

      if (!isAuthenticated) {
        console.error("Invalid WooCommerce webhook signature");
        return NextResponse.json(
          { message: "Invalid webhook signature" },
          { status: 401 }
        );
      }

      // Parse WooCommerce topic (e.g., "product.updated", "product.created")
      const [resource, action] = wcWebhookTopic.split(".");

      if (resource === "product") {
        contentType = "product";
        contentId = requestBody.id as number;
        slug = requestBody.slug as string;
      } else if (resource === "order") {
        contentType = "order";
        contentId = requestBody.id as number;
      } else if (resource === "coupon") {
        contentType = "promotion";
      } else {
        contentType = resource;
        contentId = requestBody.id as number;
      }

      console.log(
        `WooCommerce webhook received: ${wcWebhookTopic} from ${wcWebhookSource}`
      );
    }
    // Handle custom webhook format (for manual triggers)
    else if (customSecret) {
      if (customSecret !== process.env.WORDPRESS_WEBHOOK_SECRET) {
        console.error("Invalid custom webhook secret");
        return NextResponse.json(
          { message: "Invalid webhook secret" },
          { status: 401 }
        );
      }
      isAuthenticated = true;
      contentType = requestBody.contentType as string;
      contentId = requestBody.contentId as number | undefined;
      slug = requestBody.slug as string | undefined;
    }
    // No authentication provided
    else {
      console.error("No webhook authentication provided");
      return NextResponse.json(
        { message: "Missing webhook authentication" },
        { status: 401 }
      );
    }

    if (!contentType) {
      return NextResponse.json(
        { message: "Missing content type" },
        { status: 400 }
      );
    }

    try {
      console.log(
        `Revalidating content: ${contentType}${contentId ? ` (ID: ${contentId})` : ""
        }`
      );

      // Revalidate specific content type tags
      revalidateTag("wordpress");

      if (contentType === "post") {
        revalidateTag("posts");
        if (contentId) {
          revalidateTag(`post-${contentId}`);
        }
        revalidateTag("posts-page-1");
      } else if (contentType === "category") {
        revalidateTag("categories");
        if (contentId) {
          revalidateTag(`posts-category-${contentId}`);
          revalidateTag(`category-${contentId}`);
        }
      } else if (contentType === "tag") {
        revalidateTag("tags");
        if (contentId) {
          revalidateTag(`posts-tag-${contentId}`);
          revalidateTag(`tag-${contentId}`);
        }
      } else if (contentType === "author" || contentType === "user") {
        revalidateTag("authors");
        if (contentId) {
          revalidateTag(`posts-author-${contentId}`);
          revalidateTag(`author-${contentId}`);
        }
      }
      // WooCommerce product revalidation (for promotions/price changes)
      else if (contentType === "product") {
        revalidateTag("woocommerce");
        revalidateTag("products");
        if (contentId) {
          if (slug) {
            revalidatePath(`/product/${slug}`);
          }
          revalidateTag(`product-${contentId}`);
        }
        // Revalidate shop and category pages
        revalidatePath("/shop", "page");
        revalidatePath("/", "page"); // Homepage shows products
      }
      // WooCommerce category revalidation
      else if (contentType === "product_category") {
        revalidateTag("woocommerce");
        revalidateTag("categories");
        if (contentId && slug) {
          revalidatePath(`/product-category/${slug}`);
        }
      }
      // Bulk revalidation for promotions (revalidate all products)
      else if (contentType === "promotion" || contentType === "sale") {
        revalidateTag("woocommerce");
        revalidateTag("products");
        revalidatePath("/shop", "page");
        revalidatePath("/", "page");
      }
      // Order updates (may affect stock)
      else if (contentType === "order") {
        revalidateTag("woocommerce");
        revalidateTag("products");
      }

      // Also revalidate the entire layout for safety
      revalidatePath("/", "layout");

      return NextResponse.json({
        revalidated: true,
        message: `Revalidated ${contentType}${contentId ? ` (ID: ${contentId})` : ""
          } and related content`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error revalidating path:", error);
      return NextResponse.json(
        {
          revalidated: false,
          message: "Failed to revalidate site",
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      {
        message: "Error revalidating content",
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
