// pages/api/ipn.js
// Pesapal IPN handler — inapokea notification baada ya malipo kukamilika

const SUPABASE_URL = "https://aitawnxmfgsyjbnaejvf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PESAPAL_KEY = process.env.PESAPAL_KEY;
const PESAPAL_SECRET = process.env.PESAPAL_SECRET;
const PESAPAL_BASE = "https://pay.pesapal.com/v3";

const getToken = async () => {
  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ consumer_key: PESAPAL_KEY, consumer_secret: PESAPAL_SECRET }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Token failed: " + JSON.stringify(data));
  return data.token;
};

const sbService = async (path, method = "GET", body = null) => {
  const opts = {
    method,
    headers: {
      "apikey": SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export default async function handler(req, res) {
  // Pesapal anatuma GET au POST
  const orderTrackingId =
    req.query.OrderTrackingId ||
    req.query.orderTrackingId ||
    req.body?.OrderTrackingId;

  console.log("IPN received:", req.query, req.body);

  if (!orderTrackingId) {
    return res.status(200).json({ status: "ok", message: "No tracking ID" });
  }

  try {
    // Thibitisha malipo na Pesapal
    const token = await getToken();
    const verifyRes = await fetch(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      }
    );
    const verifyData = await verifyRes.json();
    console.log("Verify result:", JSON.stringify(verifyData));

    if (verifyData.payment_status_description === "Completed") {
      const merchantRef = verifyData.merchant_reference;

      // Tafuta order kwenye pending_orders
      const orders = await sbService(
        `pending_orders?order_id=eq.${merchantRef}&status=eq.pending`
      );

      if (orders && orders.length > 0) {
        const order = orders[0];
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + order.duration);

        const updates = {
          is_premium: true,
          premium_expiry: endDate.toISOString(),
          plan: order.plan_type,
        };

        if (order.plan_type && order.plan_type.startsWith("vip_")) {
          updates.is_vip = true;
          updates.vip_expiry = endDate.toISOString();
        }

        // Washa premium kwa mtumiaji
        await sbService(`users?id=eq.${order.user_id}`, "PATCH", updates);

        // Update order status
        await sbService(
          `pending_orders?order_id=eq.${merchantRef}`,
          "PATCH",
          { status: "completed", tracking_id: orderTrackingId }
        );

        console.log("✅ Premium activated for user:", order.user_id);
      }
    }

    // Pesapal wanahitaji response hii specifically
    return res.status(200).json({ orderNotificationType: "IPNCHANGE", orderTrackingId, orderMerchantReference: orderTrackingId, status: "200" });

  } catch (err) {
    console.error("IPN error:", err.message);
    return res.status(200).json({ status: "ok" }); // Always return 200 to Pesapal
  }
}
