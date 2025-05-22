// /pages/api/notifications/[id]/read.js

import db from "../../../../db/db.js";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "POST") {
    await db.run(
      "UPDATE notifications SET read = 1 WHERE id = ?",
      [id]
    );
    res.status(200).json({ success: true });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
