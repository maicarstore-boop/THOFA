import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received donation data:', body);

    const { project_id, donor_name, donor_email, donor_phone, amount, donation_type, message } = body;

    // Validate required fields
    if (!donor_name || !donor_email || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and valid amount are required' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donor_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Parse amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    // Insert donation with status 'pending'
    const donationData = {
      project_id: project_id || null,
      donor_name: donor_name.trim(),
      donor_email: donor_email.trim(),
      donor_phone: donor_phone?.trim() || '',
      amount: parsedAmount,
      donation_type: donation_type || 'one-time',
      message: message?.trim() || '',
      status: 'pending' // Default to pending
    };

    console.log('Inserting donation:', donationData);

    const { data: donation, error } = await supabase
      .from('donations')
      .insert([donationData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    console.log('Donation saved with pending status:', donation);

    // DO NOT update project raised amount here - only when admin marks as completed

    return NextResponse.json({
      success: true,
      message: 'Donation submitted successfully. Awaiting verification.',
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

// GET - Fetch donations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');

    let query = supabase
      .from('donations')
      .select(`
        *,
        projects (
          title
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: donations, error } = await query;

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