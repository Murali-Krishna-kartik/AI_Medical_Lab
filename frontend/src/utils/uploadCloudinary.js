const cloud_name = import.meta.env.VITE_CLOUD_NAME;
const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
const api_key = import.meta.env.VITE_CLOUDINARY_API_KEY;

// Simple signature generation for basic uploads
const generateSignature = (timestamp, folder = '') => {
  const params = `folder=${folder}&timestamp=${timestamp}`;
  // For client-side, we'll use a simple approach without the secret
  // This is a basic implementation - in production, signatures should be generated server-side
  return btoa(params).replace(/[^a-zA-Z0-9]/g, '').substring(0, 40);
};

const uploadImageToCloudinary = async (file) => {
  // Validate configuration
  if (!cloud_name || cloud_name === 'your_cloudinary_cloud_name') {
    throw new Error('Cloudinary cloud name is not configured. Please check your .env file.');
  }

  console.log('☁️ Cloudinary config:', { cloud_name, api_key: api_key ? 'configured' : 'missing' });

  // Try unsigned upload first (with preset)
  if (upload_preset && upload_preset !== 'your_cloudinary_upload_preset') {
    try {
      console.log(`🔄 Trying unsigned upload with preset: ${upload_preset}`);
      
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", upload_preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "post",
          body: uploadData,
        }
      );

      const data = await res.json();
      
      if (res.ok) {
        console.log(`✅ Unsigned upload successful:`, data.secure_url);
        return data;
      } else {
        console.log(`❌ Unsigned upload failed:`, data.error?.message);
      }
    } catch (error) {
      console.log(`❌ Unsigned upload error:`, error.message);
    }
  }

  // Try signed upload with API key
  if (api_key) {
    try {
      console.log(`🔄 Trying signed upload with API key`);
      
      const timestamp = Math.round(Date.now() / 1000);
      const folder = 'ai-medlab-uploads';
      
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", api_key);
      uploadData.append("timestamp", timestamp);
      uploadData.append("folder", folder);
      // Note: For production, signature should be generated server-side with the API secret
      uploadData.append("signature", generateSignature(timestamp, folder));

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        {
          method: "post",
          body: uploadData,
        }
      );

      const data = await res.json();
      
      if (res.ok) {
        console.log(`✅ Signed upload successful:`, data.secure_url);
        return data;
      } else {
        console.log(`❌ Signed upload failed:`, data.error?.message);
      }
    } catch (error) {
      console.log(`❌ Signed upload error:`, error.message);
    }
  }

  // If both methods failed, provide helpful error message
  throw new Error(`Cloudinary upload failed. Please either:
1. Create an unsigned upload preset named "${upload_preset}" in your Cloudinary dashboard, OR
2. Set up server-side signed uploads for better security.`);
};

export default uploadImageToCloudinary;
