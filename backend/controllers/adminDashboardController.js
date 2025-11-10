import { getSupabaseClient } from '../repositories/supabaseClient.js';

export const getAdminCustomerStats = async (req, res) => {
  try {
    const supabase = getSupabaseClient();

    // Count from users table by role to reflect whole platform
    const [educatorsRes, studentsRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'instructor'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    ]);

    const totalEducators = educatorsRes.count || 0;
    const totalStudents = studentsRes.count || 0;

    const { data: activeSubs, error: activeErr } = await supabase
      .from('subscriptions')
      .select('instructor_id')
      .eq('status', 'active');
    const activeInstructorIds = new Set((activeSubs || []).map((s) => s.instructor_id));

    const { data: trialInstructors, error: trialErr } = await supabase
      .from('instructors')
      .select('id, premium_ends');
    const now = new Date();
    const trials = (trialInstructors || []).filter((i) => {
      if (!i.premium_ends) return false;
      return new Date(i.premium_ends) >= now && !activeInstructorIds.has(i.id);
    }).length;

    // Total revenue in dollars
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount_total, status');
    const totalRevenueCents = (payments || [])
      .filter(p => (p.status || '').toLowerCase() === 'paid')
      .reduce((sum, p) => sum + (p.amount_total || 0), 0);
    const totalRevenue = Math.round((totalRevenueCents / 100) * 100) / 100;

    res.json({
      totalEducators,
      totalStudents,
      totalRevenue,
      trials,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminRevenueTimeseries = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const timeframe = (req.query.timeframe || 'days').toString();

    const { data: payments, error } = await supabase
      .from('payments')
      .select('amount_total, status, purchased_at');
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }

    const paid = (payments || []).filter(p => (p.status || '').toLowerCase() === 'paid');

    // Build buckets
    const now = new Date();
    let buckets = [];
    if (timeframe === 'days') {
      const len = 14;
      for (let i = len - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0,10);
        buckets.push({ key, start: new Date(d), end: new Date(d.getTime() + 24*60*60*1000), totalCents: 0 });
      }
    } else if (timeframe === 'months') {
      const len = 12;
      for (let i = len - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        buckets.push({ key, start, end, totalCents: 0 });
      }
    } else { // year
      const len = 5;
      for (let i = len - 1; i >= 0; i--) {
        const y = now.getFullYear() - i;
        const start = new Date(y, 0, 1);
        const end = new Date(y + 1, 0, 1);
        const key = String(y);
        buckets.push({ key, start, end, totalCents: 0 });
      }
    }

    // Aggregate
    for (const p of paid) {
      const ts = new Date(p.purchased_at || p.created_at || p.updated_at || Date.now());
      for (const b of buckets) {
        if (ts >= b.start && ts < b.end) {
          b.totalCents += (p.amount_total || 0);
          break;
        }
      }
    }

    const points = buckets.map(b => ({ x: b.key, y: Math.round((b.totalCents / 100) * 100) / 100 }));
    res.json({ metric: 'revenue', points });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminEducatorsTimeseries = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const timeframe = (req.query.timeframe || 'days').toString();

    const { data: users, error } = await supabase
      .from('users')
      .select('created_at, role')
      .eq('role', 'instructor');
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    const now = new Date();
    let buckets = [];
    if (timeframe === 'days') {
      const len = 14;
      for (let i = len - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0,10);
        buckets.push({ key, start: new Date(d), end: new Date(d.getTime() + 24*60*60*1000), count: 0 });
      }
    } else if (timeframe === 'months') {
      const len = 12;
      for (let i = len - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        buckets.push({ key, start, end, count: 0 });
      }
    } else {
      const len = 5;
      for (let i = len - 1; i >= 0; i--) {
        const y = now.getFullYear() - i;
        const start = new Date(y, 0, 1);
        const end = new Date(y + 1, 0, 1);
        const key = String(y);
        buckets.push({ key, start, end, count: 0 });
      }
    }

    for (const u of users || []) {
      const ts = new Date(u.created_at || Date.now());
      for (const b of buckets) {
        if (ts >= b.start && ts < b.end) {
          b.count += 1;
          break;
        }
      }
    }

    const points = buckets.map(b => ({ x: b.key, y: b.count }));
    res.json({ metric: 'educators', points });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminStudentsTimeseries = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const timeframe = (req.query.timeframe || 'days').toString();

    const { data: users, error } = await supabase
      .from('users')
      .select('created_at, role')
      .eq('role', 'student');
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    const now = new Date();
    let buckets = [];
    if (timeframe === 'days') {
      const len = 14;
      for (let i = len - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0,10);
        buckets.push({ key, start: new Date(d), end: new Date(d.getTime() + 24*60*60*1000), count: 0 });
      }
    } else if (timeframe === 'months') {
      const len = 12;
      for (let i = len - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        buckets.push({ key, start, end, count: 0 });
      }
    } else {
      const len = 5;
      for (let i = len - 1; i >= 0; i--) {
        const y = now.getFullYear() - i;
        const start = new Date(y, 0, 1);
        const end = new Date(y + 1, 0, 1);
        const key = String(y);
        buckets.push({ key, start, end, count: 0 });
      }
    }

    for (const u of users || []) {
      const ts = new Date(u.created_at || Date.now());
      for (const b of buckets) {
        if (ts >= b.start && ts < b.end) {
          b.count += 1;
          break;
        }
      }
    }

    const points = buckets.map(b => ({ x: b.key, y: b.count }));
    res.json({ metric: 'students', points });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listEducators = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const page = Math.max(1, parseInt((req.query.page || '1').toString(), 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit || '10').toString(), 10)));
    const search = (req.query.search || '').toString().trim().toLowerCase();
    const status = (req.query.status || 'any').toString();
    const sort = (req.query.sort || 'signup').toString();

    // base query for instructors by users table
    let query = supabase
      .from('users')
      .select('id,email,first_name,last_name,phone,location,created_at,updated_at,instructors(id,premium_ends)', { count: 'exact' })
      .eq('role', 'instructor');

    if (search) {
      // Supabase needs ilike per field; simple OR on email/first/last
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    // Compute paid/trial filter using active subscriptions and premium_ends
    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('instructor_id')
      .eq('status', 'active');
    const activeInstructorIds = new Set((activeSubs || []).map(s => s.instructor_id));

    if (status === 'paid' || status === 'trial') {
      // Add a lightweight filter by joining instructors to know ids, then post-filter
      query = query.select('id,email,first_name,last_name,phone,location,created_at,updated_at,instructors(id,premium_ends)', { count: 'exact' });
    }

    // Fetch a superset; we'll sort and paginate server-side for derived fields (students/status)
    const { data, error, count } = await query.order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    // Gather instructor ids for student counts
    const now = new Date();
    const instructorIds = ((data || []).map(u => (u.instructors && u.instructors[0] ? u.instructors[0].id : null)).filter(Boolean));

    let studentsCountByInstructor = new Map();
    if (instructorIds.length > 0) {
      const { data: studentsRows, error: studentsErr } = await supabase
        .from('students')
        .select('instructor_id');
      if (!studentsErr && studentsRows) {
        for (const row of studentsRows) {
          if (!row.instructor_id) continue;
          const prev = studentsCountByInstructor.get(row.instructor_id) || 0;
          studentsCountByInstructor.set(row.instructor_id, prev + 1);
        }
      }
    }

    // shape minimal fields
    let rows = (data || []);
    if (status === 'paid' || status === 'trial') {
      const nowF = new Date();
      rows = rows.filter(u => {
        const instructor = (u.instructors && u.instructors[0]) || null;
        const paid = instructor && activeInstructorIds.has(instructor.id);
        const trial = instructor && instructor.premium_ends && new Date(instructor.premium_ends) >= nowF && !paid;
        return status === 'paid' ? paid : trial;
      });
    }

    let items = rows.map((u) => {
      const instructor = (u.instructors && u.instructors[0]) || null;
      let status = 'trial';
      if (instructor && activeInstructorIds.has(instructor.id)) status = 'paid';
      else if (instructor && instructor.premium_ends && new Date(instructor.premium_ends) >= now) status = 'trial';

      const students = instructor ? (studentsCountByInstructor.get(instructor.id) || 0) : 0;

      return {
        id: u.id,
        email: u.email,
        firstName: u.first_name || '',
        lastName: u.last_name || '',
        phone: u.phone || '',
        status,
        createdAt: u.created_at,
        lastLogin: u.updated_at || null,
        country: u.location || '',
        students,
      };
    });

    // Sort
    if (sort === 'students') {
      items.sort((a, b) => (b.students || 0) - (a.students || 0));
    } else if (sort === 'status') {
      const rank = (s) => (s === 'paid' ? 0 : 1);
      items.sort((a, b) => rank(a.status) - rank(b.status));
    } else { // signup
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const totalCountFinal = items.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems = items.slice(start, end);

    res.json({ items: pageItems, totalCount: totalCountFinal, page, limit });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


