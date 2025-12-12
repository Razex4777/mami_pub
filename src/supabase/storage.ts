// Supabase Storage Utilities
import { supabase } from './core';

const PRODUCT_IMAGES_BUCKET = 'product-images';
const BANNER_IMAGES_BUCKET = 'banner-images';

/**
 * Upload a product image to Supabase Storage
 * @param file - The file to upload
 * @param productId - Optional product ID for organizing files
 * @returns The public URL of the uploaded image
 */
export async function uploadProductImage(
  file: File,
  productId?: string
): Promise<string> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const fileName = productId 
    ? `${productId}/${timestamp}-${randomId}.${fileExt}`
    : `uploads/${timestamp}-${randomId}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload multiple product images
 * @param files - Array of files to upload
 * @param productId - Optional product ID for organizing files
 * @returns Array of public URLs
 */
export async function uploadProductImages(
  files: File[],
  productId?: string
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadProductImage(file, productId));
  return Promise.all(uploadPromises);
}

/**
 * Delete a product image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  // Validate input
  if (!imageUrl) {
    console.warn('deleteProductImage: No image URL provided');
    return;
  }

  // Extract path from URL with defensive error handling
  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch (error) {
    console.warn('deleteProductImage: Invalid URL provided:', imageUrl, error);
    return;
  }

  const pathParts = url.pathname.split(`/${PRODUCT_IMAGES_BUCKET}/`);
  
  if (pathParts.length < 2) {
    console.warn('Could not extract path from image URL:', imageUrl);
    return;
  }

  const filePath = pathParts[1];

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Validate image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default 5MB)
 * @returns Object with isValid and error message
 */
export function validateImageFile(file: File, maxSizeMB = 5): { isValid: boolean; error?: string } {
  const MAX_SIZE = maxSizeMB * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Format non supporté. Utilisez JPG, PNG, WebP ou GIF.',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: `Image trop volumineuse. Maximum ${maxSizeMB} Mo.`,
    };
  }

  return { isValid: true };
}

/**
 * Upload a banner image to Supabase Storage
 * @param file - The file to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadBannerImage(file: File): Promise<string> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const fileName = `banners/${timestamp}-${randomId}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BANNER_IMAGES_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload banner image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BANNER_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete a banner image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteBannerImage(imageUrl: string): Promise<void> {
  // Validate input
  if (!imageUrl) {
    console.warn('deleteBannerImage: No image URL provided');
    return;
  }

  // Extract path from URL with defensive error handling
  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch (error) {
    console.warn('deleteBannerImage: Invalid URL provided:', imageUrl, error);
    return;
  }

  const pathParts = url.pathname.split(`/${BANNER_IMAGES_BUCKET}/`);
  
  if (pathParts.length < 2) {
    console.warn('Could not extract path from banner image URL:', imageUrl);
    return;
  }

  const filePath = pathParts[1];

  const { error } = await supabase.storage
    .from(BANNER_IMAGES_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete banner image: ${error.message}`);
  }
}
