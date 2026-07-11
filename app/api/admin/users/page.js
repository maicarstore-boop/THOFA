const fetchUsers = async () => {
  try {
    setLoading(true);
    console.log('Fetching users...');
    
    const [adminsRes, clientsRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/clients')
    ]);

    const adminsData = await adminsRes.json();
    const clientsData = await clientsRes.json();

    console.log('Admin users received:', adminsData.length);
    console.log('Client users received:', clientsData.length);

    setAdminUsers(Array.isArray(adminsData) ? adminsData : []);
    setClientUsers(Array.isArray(clientsData) ? clientsData : []);
  } catch (error) {
    console.error('Error fetching users:', error);
    setAdminUsers([]);
    setClientUsers([]);
  } finally {
    setLoading(false);
  }
};