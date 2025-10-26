# RLS Policy Templates

## Basic RLS Policy Pattern

### Enable RLS
```sql
-- Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Standard CRUD Policies
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);
```

## Artist Profile Policies

### Artist Profile Management
```sql
-- Enable RLS on artist_profiles
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- Artists can view their own profile
CREATE POLICY "Artists can view own profile" ON artist_profiles
  FOR SELECT USING (user_id = auth.uid()::text);

-- Artists can update their own profile
CREATE POLICY "Artists can update own profile" ON artist_profiles
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Artists can insert their own profile
CREATE POLICY "Artists can insert own profile" ON artist_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
```

### Painting Management
```sql
-- Enable RLS on paintings
ALTER TABLE paintings ENABLE ROW LEVEL SECURITY;

-- Artists can manage their own paintings
CREATE POLICY "Artists can view own paintings" ON paintings
  FOR SELECT USING (artist_id IN (
    SELECT id FROM artist_profiles WHERE user_id = auth.uid()::text
  ));

CREATE POLICY "Artists can insert own paintings" ON paintings
  FOR INSERT WITH CHECK (artist_id IN (
    SELECT id FROM artist_profiles WHERE user_id = auth.uid()::text
  ));

CREATE POLICY "Artists can update own paintings" ON paintings
  FOR UPDATE USING (artist_id IN (
    SELECT id FROM artist_profiles WHERE user_id = auth.uid()::text
  ));

CREATE POLICY "Artists can delete own paintings" ON paintings
  FOR DELETE USING (artist_id IN (
    SELECT id FROM artist_profiles WHERE user_id = auth.uid()::text
  ));
```

## Admin Policies

### Admin Access
```sql
-- Admins can access all data
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );
```

## Public Access Policies

### Public Gallery
```sql
-- Anyone can view published paintings
CREATE POLICY "Public can view published paintings" ON paintings
  FOR SELECT USING (is_published = true);
```

## Subscription Policies

### Subscription Management
```sql
-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid()::text);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid()::text);
```

## Policy Testing

### Test Queries
```sql
-- Test as different users
SET LOCAL "request.jwt.claims" TO '{"sub": "user-id-here"}';

-- Test policy enforcement
SELECT * FROM paintings; -- Should only return user's paintings
```

## Policy Management

### Drop Policies
```sql
-- Drop existing policy
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### List Policies
```sql
-- List all policies for a table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'table_name';
```

## Future Enhancements
- [ ] Add more complex relationship policies
- [ ] Include time-based access policies
- [ ] Add geographic restriction policies
- [ ] Include audit trail policies
- [ ] Add performance optimization tips
