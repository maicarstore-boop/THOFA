import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const category = searchParams.get('category');

    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    return NextResponse.json(posts || []);
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Creating blog post with data:', data);

    const { title, content, excerpt, category, status, author, featured_image, video_url, gallery_images } = data;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const postData = {
      title: title.trim(),
      slug,
      content: content.trim(),
      excerpt: excerpt?.trim() || '',
      category: category || 'news',
      status: status || 'published',
      author: author || 'THOFA Team',
      featured_image: featured_image || '',
      video_url: video_url?.trim() || '',
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting post:', postData);

    // Insert blog post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    console.log('Post created:', post);

    // Update gallery images if any
    if (gallery_images && gallery_images.length > 0) {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ gallery_images: gallery_images })
        .eq('id', post.id);

      if (updateError) {
        console.error('Gallery update error:', updateError);
        // Don't fail the whole request
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      post
    }, { status: 201 });
  } catch (error) {
    console.error('Blog POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}