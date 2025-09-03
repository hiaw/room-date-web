# R2 Storage Setup Instructions

## Required Environment Variables

You need to set the following environment variables in your Convex deployment:

```bash
# Set these in your Convex dashboard or via CLI
npx convex env set R2_ACCESS_KEY_ID your_access_key_id_here
npx convex env set R2_SECRET_ACCESS_KEY your_secret_access_key_here
npx convex env set R2_ENDPOINT your_r2_endpoint_here
npx convex env set R2_BUCKET your_bucket_name_here
```

## How to Get These Values

### 1. Create Cloudflare R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a new bucket (choose any name you like)

### 2. Set CORS Policy

Add this CORS policy to your bucket:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-Type"]
  }
]
```

### 3. Create API Token

1. On the R2 main page, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Set permissions to **Object Read & Write**
4. Under **Specify bucket**, select your bucket
5. Click **Create API Token**

### 4. Copy the Values

After creating the token, you'll see:

- **Access Key ID** → Use as `R2_ACCESS_KEY_ID`
- **Secret Access Key** → Use as `R2_SECRET_ACCESS_KEY`
- **Endpoint** → Use as `R2_ENDPOINT` (should look like `https://accountid.r2.cloudflarestorage.com`)

## Image Storage Migration

### New Image Uploads

- All new image uploads now use R2 instead of Convex file storage
- Images are stored as R2 keys (not URLs) in the database
- Short-lived URLs (15 minutes default) are generated on-demand

### URL Expiration Settings

- Profile images: 1 hour (3600 seconds)
- Room/Event images: 15 minutes (900 seconds) - default
- Sensitive images: 5 minutes (300 seconds)

### Schema Changes

Database fields now store R2 keys instead of URLs:

- `rooms.images[]` - R2 keys for room photos
- `rooms.primaryImageUrl` - Primary R2 key
- `events.eventImages[]` - R2 keys for event images
- `events.primaryEventImageUrl` - Primary R2 key
- `userProfiles.profileImageUrl` - R2 key for primary profile image
- `userProfiles.profileImages[]` - R2 keys for multiple profile photos

## Usage in Components

### Upload Images

```svelte
<script>
  import ImageUploader from "$lib/components/ui/ImageUploader.svelte";

  let images = []; // Will contain R2 keys

  function handleImagesChange(newImages) {
    images = newImages; // These are R2 keys, not URLs
  }
</script>

<ImageUploader {images} onImagesChange={handleImagesChange} />
```

### Display Images

```svelte
<script>
  import R2Image from "$lib/components/ui/R2Image.svelte";
</script>

<!-- Display single image -->
<R2Image
  imageKey={profile.profileImageUrl}
  alt="Profile photo"
  class="h-20 w-20 rounded-full object-cover"
  expiresInSeconds={3600}
/>

<!-- Display multiple images -->
{#each room.images as imageKey}
  <R2Image
    {imageKey}
    alt="Room photo"
    class="h-48 w-full rounded-lg object-cover"
  />
{/each}
```

## Security Benefits

✅ **URL Expiration**: Links expire automatically (15 min default)  
✅ **Access Control**: Users must be authenticated to generate URLs  
✅ **Cost Effective**: Much cheaper than Convex file storage  
✅ **Better Performance**: Direct R2 serving vs Convex proxy  
✅ **Scalable**: No storage limits like Convex's 1GB limit
