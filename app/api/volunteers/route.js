import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Submit volunteer application
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received volunteer data:', body);

    const { full_name, email, phone, skills, availability, message } = body;

    // Validate required fields
    const errors = [];
    if (!full_name) errors.push('Full name is required');
    if (!email) errors.push('Email is required');
    if (!phone) errors.push('Phone number is required');
    if (!message) errors.push('Message is required');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    const volunteerData = {
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      skills: skills?.trim() || '',
      availability: availability || 'flexible',
      message: message.trim(),
      status: 'pending'
    };

    console.log('Inserting volunteer data:', volunteerData);

    const { data: volunteer, error } = await supabase
      .from('volunteers')
      .insert([volunteerData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    console.log('Volunteer saved:', volunteer);

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      volunteer: {
        id: volunteer.id,
        full_name: volunteer.full_name,
        email: volunteer.email,
        status: volunteer.status
      }
    });

  } catch (error) {
    console.error('Volunteer submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch volunteers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 10;

    let query = supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: volunteers, error } = await query;

    if (error) throw error;

    return NextResponse.json(volunteers || []);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update volunteer status
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const { data: volunteer, error } = await supabase
      .from('volunteers')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteer status updated successfully',
      volunteer
    });
  } catch (error) {
    console.error('Volunteer update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a volunteer
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Volunteer ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting volunteer with ID:', id);

    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteer deleted successfully'
    });
  } catch (error) {
    console.error('Volunteer delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}