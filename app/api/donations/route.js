import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received donation data:', body);

    const { project_id, donor_name, donor_email, donor_phone, amount, donation_type, message } = body;

    // Validate required fields
    const errors = [];
    if (!donor_name) errors.push('Name is required');
    if (!donor_email) errors.push('Email is required');
    if (!amount || amount <= 0) errors.push('Valid donation amount is required');

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (donor_email && !emailRegex.test(donor_email)) {
      errors.push('Invalid email format');
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    // Insert donation into Supabase
    const donationData = {
      project_id: project_id || null,
      donor_name: donor_name.trim(),
      donor_email: donor_email.trim(),
      donor_phone: donor_phone?.trim() || '',
      amount: parseFloat(amount),
      donation_type: donation_type || 'one-time',
      message: message?.trim() || '',
      status: 'completed'
    };

    console.log('Inserting donation data:', donationData);

    const { data: donation, error } = await supabase
      .from('donations')
      .insert([donationData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    console.log('Donation saved:', donation);

    // Update project raised amount if project_id exists
    if (project_id && donation) {
      try {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('raised_amount')
          .eq('id', parseInt(project_id))
          .single();

        if (projectError) {
          console.error('Error fetching project:', projectError);
        } else if (project) {
          const newRaisedAmount = (project.raised_amount || 0) + parseFloat(amount);
          await supabase
            .from('projects')
            .update({ raised_amount: newRaisedAmount })
            .eq('id', parseInt(project_id));
          console.log('Project raised amount updated to:', newRaisedAmount);
        }
      } catch (updateError) {
        console.error('Error updating project amount:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Donation successful',
      donation: {
        id: donation.id,
        amount: donation.amount,
        donor_name: donation.donor_name,
        status: donation.status
      }
    });

  } catch (error) {
    console.error('Donation error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch recent donations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    const { data: donations, error } = await supabase
      .from('donations')
      .select(`
        *,
        projects (
          title
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json(donations || []);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}