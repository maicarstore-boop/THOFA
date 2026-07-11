import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch single donation
export async function GET(request, { params }) {
  try {
    const { data: donation, error } = await supabase
      .from('donations')
      .select(`
        *,
        projects (
          title,
          raised_amount,
          goal_amount
        )
      `)
      .eq('id', parseInt(params.id))
      .single();

    if (error) throw error;

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error('Error fetching donation:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update donation status (Admin only)
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { status } = body;
    const id = parseInt(params.id);

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Get current donation to know previous status
    const { data: currentDonation, error: fetchError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current donation:', fetchError);
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Update donation status
    const { data: donation, error } = await supabase
      .from('donations')
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

    // If status changed to 'completed', update project raised amount
    if (status === 'completed' && currentDonation.status !== 'completed') {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('raised_amount, goal_amount')
        .eq('id', currentDonation.project_id)
        .single();

      if (!projectError && project) {
        const newRaisedAmount = (project.raised_amount || 0) + currentDonation.amount;
        await supabase
          .from('projects')
          .update({ raised_amount: newRaisedAmount })
          .eq('id', currentDonation.project_id);
        console.log('✅ Project raised amount updated from', project.raised_amount, 'to', newRaisedAmount);
      }
    }

    // If status changed from 'completed' to something else, subtract amount
    if (currentDonation.status === 'completed' && status !== 'completed') {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('raised_amount')
        .eq('id', currentDonation.project_id)
        .single();

      if (!projectError && project) {
        const newRaisedAmount = Math.max(0, (project.raised_amount || 0) - currentDonation.amount);
        await supabase
          .from('projects')
          .update({ raised_amount: newRaisedAmount })
          .eq('id', currentDonation.project_id);
        console.log('⬇️ Project raised amount reduced from', project.raised_amount, 'to', newRaisedAmount);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Donation status updated to ${status}`,
      donation
    });
  } catch (error) {
    console.error('Donation update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a donation
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    // Get donation details to reverse the amount from project
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching donation:', fetchError);
    }

    // Delete donation
    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    // If donation was completed, subtract from project raised amount
    if (donation && donation.status === 'completed') {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('raised_amount')
        .eq('id', donation.project_id)
        .single();

      if (!projectError && project) {
        const newRaisedAmount = Math.max(0, (project.raised_amount || 0) - donation.amount);
        await supabase
          .from('projects')
          .update({ raised_amount: newRaisedAmount })
          .eq('id', donation.project_id);
        console.log('⬇️ Project raised amount reduced to', newRaisedAmount);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Donation delete error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}