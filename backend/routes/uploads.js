import { Router } from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "node:crypto";
import { requireAdmin } from "../middleware/adminAuth.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

const s3 = new S3Client({ region: process.env.AWS_REGION || "eu-north-1" });

router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const ext = req.file.originalname.split(".").pop();
  const key = `products/images/${crypto.randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    })
  );

  const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "eu-north-1"}.amazonaws.com/${key}`;
  res.json({ url });
});

export default router;
