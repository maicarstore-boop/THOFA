import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Get project
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Project fetch error:', error);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get project images
    const { data: images, error: imagesError } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', id)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true });

    if (imagesError) {
      console.error('Images fetch error:', imagesError);
    }

    return NextResponse.json({ 
      ...project, 
      images: images || [] 
    });
  } catch (error) {
    console.error('Project detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    // Remove gallery_images from the data (it's handled separately)
    const { gallery_images, ...projectData } = data;

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        ...projectData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Project update error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Handle gallery images
    if (gallery_images && gallery_images.length > 0) {
      // Delete existing images
      await supabase
        .from('project_images')
        .delete()
        .eq('project_id', id);

      // Insert new gallery images
      const galleryData = gallery_images.map((image, index) => ({
        project_id: id,
        image_path: image,
        is_primary: index === 0,
        sort_order: index
      }));

      await supabase
        .from('project_images')
        .insert(galleryData);
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    // Delete project images first
    await supabase
      .from('project_images')
      .delete()
      .eq('project_id', id);

    // Delete project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Project delete error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}