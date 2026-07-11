import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// GET - Fetch all admin users
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, username, email, full_name, role, is_blocked, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(users || []);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new admin user
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Creating admin user with data:', body);

    const { username, password, email, full_name, role } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin user
    const { data: user, error } = await supabase
      .from('admin_users')
      .insert([{
        username,
        password: hashedPassword,
        email: email || '',
        full_name: full_name || '',
        role: role || 'editor',
        is_blocked: false
      }])
      .select('id, username, email, full_name, role, is_blocked, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    console.log('Admin user created:', user);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update admin user (block/unblock)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, is_blocked } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('admin_users')
      .update({ is_blocked: is_blocked || false })
      .eq('id', parseInt(id))
      .select('id, username, email, full_name, role, is_blocked, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: is_blocked ? 'User blocked successfully' : 'User unblocked successfully',
      user
    });
  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete an admin user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}