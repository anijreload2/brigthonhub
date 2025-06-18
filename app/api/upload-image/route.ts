import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadPurpose = formData.get('uploadPurpose') as string;
    const contentType = formData.get('contentType') as string || null;
    const contentId = formData.get('contentId') as string || null;
    const altText = formData.get('altText') as string || '';
    const isPrimary = formData.get('isPrimary') === 'true';

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!uploadPurpose || !['product', 'profile', 'content', 'general'].includes(uploadPurpose)) {
      return NextResponse.json(
        { error: 'Invalid upload purpose' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 1MB limit' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `${uploadPurpose}_${timestamp}_${randomString}.${fileExtension}`;
    
    // Create storage path
    const storagePath = `uploads/${uploadPurpose}/${authUser.id}/${filename}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, buffer, {
        contentType: file.type,
        duplex: 'half'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(storagePath);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get file URL' },
        { status: 500 }
      );
    }

    // If this is a primary image, update other images for the same content to not be primary
    if (isPrimary && contentType && contentId) {
      await supabase
        .from('image_uploads')
        .update({ is_primary: false })
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('uploaded_by', authUser.id);
    }

    // Save metadata to database
    const imageData = {
      filename,
      original_filename: file.name,
      file_size: file.size,
      mime_type: file.type,
      file_url: urlData.publicUrl,
      storage_path: storagePath,
      uploaded_by: authUser.id,
      upload_purpose: uploadPurpose,
      content_type: contentType,
      content_id: contentId,
      alt_text: altText,
      is_primary: isPrimary,
      status: 'active',
      metadata: {
        upload_timestamp: timestamp,
        user_agent: request.headers.get('user-agent'),
        file_extension: fileExtension
      }
    };

    const { data: dbData, error: dbError } = await supabase
      .from('image_uploads')
      .insert(imageData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('images')
        .remove([storagePath]);

      return NextResponse.json(
        { error: 'Failed to save image metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: {
        id: dbData.id,
        filename: dbData.filename,
        originalFilename: dbData.original_filename,
        fileSize: dbData.file_size,
        mimeType: dbData.mime_type,
        file_url: dbData.file_url,
        uploadPurpose: dbData.upload_purpose,
        contentType: dbData.content_type,
        contentId: dbData.content_id,
        altText: dbData.alt_text,
        isPrimary: dbData.is_primary,
        created_at: dbData.created_at
      }
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const uploadPurpose = searchParams.get('uploadPurpose');
    const contentType = searchParams.get('contentType');
    const contentId = searchParams.get('contentId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('image_uploads')
      .select('*')
      .eq('uploaded_by', authUser.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (uploadPurpose) {
      query = query.eq('upload_purpose', uploadPurpose);
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    if (contentId) {
      query = query.eq('content_id', contentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      images: data || [],
      hasMore: (data?.length || 0) === limit
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID required' },
        { status: 400 }
      );
    }

    // Get image data first
    const { data: imageData, error: fetchError } = await supabase
      .from('image_uploads')
      .select('*')
      .eq('id', imageId)
      .eq('uploaded_by', authUser.id)
      .single();

    if (fetchError || !imageData) {
      return NextResponse.json(
        { error: 'Image not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('images')
      .remove([imageData.storage_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Mark as deleted in database
    const { error: dbError } = await supabase
      .from('image_uploads')
      .update({ 
        status: 'deleted', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', imageId)
      .eq('uploaded_by', authUser.id);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
