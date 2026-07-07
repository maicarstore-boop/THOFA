import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch single blog post
export async function GET(request, { params }) {
  try {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', parseInt(params.id))
      .single();

    if (error) throw error;

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', parseInt(params.id));

    return NextResponse.json(post);
  } catch (error) {
    console.error('Blog GET by ID error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a blog post
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a blog post
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    data.updated_at = new Date().toISOString();

    const { data: post, error } = await supabase
      .from('blog_posts')
      .update(data)
      .eq('id', parseInt(params.id))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      post
    });
  } catch (error) {
    console.error('Blog PUT error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}