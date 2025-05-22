// /pages/api/notifications/mark-all-read.js

import db from "../../../db/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  await db.run(
    "UPDATE notifications SET read = 1 WHERE user_id = ?",
    [user_id]
  );
  res.status(200).json({ success: true });
}
