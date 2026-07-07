import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  try {
    const { data: donation, error } = await supabase
      .from('donations')
      .select('*')
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