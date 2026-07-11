import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// GET - Fetch all client users
export async function GET() {
  try {
    console.log('Fetching client users...');

    // Get ALL unique client users from donations (no limit)
    const { data: donationUsers, error: donationError } = await supabase
      .from('donations')
      .select('donor_name, donor_email, donor_phone, created_at')
      .order('created_at', { ascending: false });

    if (donationError) {
      console.error('Donation fetch error:', donationError);
      throw donationError;
    }

    console.log(`Found ${donationUsers?.length || 0} donation users`);

    // Get ALL unique client users from volunteers (no limit)
    const { data: volunteerUsers, error: volunteerError } = await supabase
      .from('volunteers')
      .select('full_name, email, phone, created_at')
      .order('created_at', { ascending: false });

    if (volunteerError) {
      console.error('Volunteer fetch error:', volunteerError);
      throw volunteerError;
    }

    console.log(`Found ${volunteerUsers?.length || 0} volunteer users`);

    // Get blocked users from settings
    let blockedEmails = new Set();
    try {
      const { data: settings, error: settingsError } = await supabaseAdmin
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'blocked_users')
        .maybeSingle();

      if (!settingsError && settings) {
        try {
          const blockedArray = JSON.parse(settings.setting_value);
          blockedEmails = new Set(blockedArray);
          console.log(`Found ${blockedArray.length} blocked users`);
        } catch (parseError) {
          console.log('Error parsing blocked users:', parseError);
        }
      }
    } catch (error) {
      console.log('Error fetching blocked users:', error);
    }

    // Combine and deduplicate users
    const userMap = new Map();

    // Add donation users
    if (donationUsers) {
      donationUsers.forEach(user => {
        const email = user.donor_email;
        if (email && !userMap.has(email)) {
          userMap.set(email, {
            name: user.donor_name || 'Unknown',
            email: email,
            phone: user.donor_phone || '',
            type: 'donor',
            created_at: user.created_at || new Date().toISOString(),
            is_blocked: blockedEmails.has(email)
          });
        }
      });
    }

    // Add volunteer users
    if (volunteerUsers) {
      volunteerUsers.forEach(user => {
        const email = user.email;
        if (email && !userMap.has(email)) {
          userMap.set(email, {
            name: user.full_name || 'Unknown',
            email: email,
            phone: user.phone || '',
            type: 'volunteer',
            created_at: user.created_at || new Date().toISOString(),
            is_blocked: blockedEmails.has(email)
          });
        }
      });
    }

    const users = Array.from(userMap.values());
    console.log(`Total client users: ${users.length}`);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching client users:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Block/Unblock a client user
export async function PUT(request) {
  try {
    const body = await request.json();
    const { email, is_blocked } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Updating client user:', { email, is_blocked });

    // Use admin client to bypass RLS
    let blockedEmails = [];
    try {
      const { data: settings, error: settingsError } = await supabaseAdmin
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'blocked_users')
        .maybeSingle();

      if (!settingsError && settings) {
        try {
          blockedEmails = JSON.parse(settings.setting_value);
          console.log('Current blocked list:', blockedEmails);
        } catch (parseError) {
          console.log('Error parsing blocked users:', parseError);
        }
      }
    } catch (error) {
      console.log('Error fetching blocked users:', error);
    }

    // Update the list
    if (is_blocked) {
      if (!blockedEmails.includes(email)) {
        blockedEmails.push(email);
      }
    } else {
      blockedEmails = blockedEmails.filter(e => e !== email);
    }

    // Save back to database using admin client
    const { error: updateError } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        setting_key: 'blocked_users',
        setting_value: JSON.stringify(blockedEmails),
        updated_at: new Date().toISOString()
      }, { onConflict: 'setting_key' });

    if (updateError) {
      console.error('Error updating blocked list:', updateError);
      return NextResponse.json(
        { error: 'Database error: ' + updateError.message },
        { status: 500 }
      );
    }

    console.log(`User ${email} ${is_blocked ? 'blocked' : 'unblocked'} successfully`);

    return NextResponse.json({
      success: true,
      message: is_blocked ? 'User blocked successfully' : 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Error updating client user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a client user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Deleting client user:', email);

    // Delete from donations
    const { error: donationDeleteError } = await supabase
      .from('donations')
      .delete()
      .eq('donor_email', email);

    if (donationDeleteError) {
      console.error('Error deleting from donations:', donationDeleteError);
    }

    // Delete from volunteers
    const { error: volunteerDeleteError } = await supabase
      .from('volunteers')
      .delete()
      .eq('email', email);

    if (volunteerDeleteError) {
      console.error('Error deleting from volunteers:', volunteerDeleteError);
    }

    // Remove from blocked list
    try {
      const { data: settings, error: settingsError } = await supabaseAdmin
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'blocked_users')
        .maybeSingle();

      if (!settingsError && settings) {
        let blockedEmails = JSON.parse(settings.setting_value);
        blockedEmails = blockedEmails.filter(e => e !== email);
        await supabaseAdmin
          .from('system_settings')
          .upsert({
            setting_key: 'blocked_users',
            setting_value: JSON.stringify(blockedEmails),
            updated_at: new Date().toISOString()
          }, { onConflict: 'setting_key' });
      }
    } catch (error) {
      console.log('Error removing from blocked list:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Client user deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}