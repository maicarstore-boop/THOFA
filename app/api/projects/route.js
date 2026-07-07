import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit')) || 0;
    
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('project_type', type);
    if (limit > 0) query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Creating project with data:', data);
    
    // Validate required fields
    if (!data.title || !data.description || !data.goal_amount) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, and goal_amount are required' },
        { status: 400 }
      );
    }

    // Parse numeric values safely
    const goalAmount = parseFloat(data.goal_amount) || 0;
    const raisedAmount = parseFloat(data.raised_amount) || 0;
    const beneficiaries = parseInt(data.beneficiaries) || 0;

    if (goalAmount > 1000000000) {
      return NextResponse.json(
        { error: 'Goal amount exceeds maximum limit of RWF 1,000,000,000' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const projectData = {
      title: data.title,
      slug: slug,
      description: data.description,
      location: data.location || '',
      goal_amount: goalAmount,
      raised_amount: raisedAmount,
      project_type: data.project_type || 'other',
      beneficiaries: beneficiaries,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      status: data.status || 'active',
      featured_image: data.featured_image || '',
      video_url: data.video_url || '',
      owner_name: data.owner_name || '',
      owner_contact: data.owner_contact || '',
      account_holder_name: data.account_holder_name || '',
      account_number: data.account_number || '',
      bank_name: data.bank_name || '',
      mobile_money_number: data.mobile_money_number || '',
      mobile_money_provider: data.mobile_money_provider || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting project:', projectData);
    
    // Insert project
    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    console.log('Project created:', project);

    // Insert gallery images into project_images table
    if (data.gallery_images && data.gallery_images.length > 0) {
      const galleryData = data.gallery_images.map((image, index) => ({
        project_id: project.id,
        image_path: image,
        is_primary: index === 0,
        sort_order: index
      }));

      const { error: galleryError } = await supabase
        .from('project_images')
        .insert(galleryData);

      if (galleryError) {
        console.error('Gallery insert error:', galleryError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      project
    }, { status: 201 });
    
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}