import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total raised
    const { data: totalRaisedData, error: totalRaisedError } = await supabase
      .from('donations')
      .select('amount')
      .eq('status', 'completed');

    if (totalRaisedError) throw totalRaisedError;

    const totalRaised = totalRaisedData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    // Get total projects
    const { count: totalProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (projectsError) throw projectsError;

    // Get total beneficiaries
    const { data: beneficiariesData, error: beneficiariesError } = await supabase
      .from('projects')
      .select('beneficiaries')
      .in('status', ['active', 'completed']);

    if (beneficiariesError) throw beneficiariesError;

    const totalBeneficiaries = beneficiariesData?.reduce((sum, p) => sum + (p.beneficiaries || 0), 0) || 0;

    // Get total volunteers
    const { count: totalVolunteers, error: volunteersError } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (volunteersError) throw volunteersError;

    // Get active projects
    const { count: activeProjects, error: activeError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeError) throw activeError;

    return NextResponse.json({
      totalRaised: totalRaised || 0,
      totalProjects: totalProjects || 0,
      totalBeneficiaries: totalBeneficiaries || 0,
      totalVolunteers: totalVolunteers || 0,
      activeProjects: activeProjects || 0
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}