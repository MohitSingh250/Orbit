const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

console.log("Cloudinary Config Check:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Missing");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Set" : "Missing");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Set" : "Missing");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

const discussionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "discussions",
    resource_type: "auto",
  },
});

const upload = multer({ storage });
const discussionUpload = multer({ storage: discussionStorage });

module.exports = { cloudinary, upload, discussionUpload };
