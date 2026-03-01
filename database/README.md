# Database Setup Instructions

## Prerequisites
- PostgreSQL installed on your local machine (192.168.1.51)
- Network access from your dev machine to the database server

## Steps to Initialize Database

1. **Connect to PostgreSQL** on the remote machine:
   ```bash
   psql -h 192.168.1.51 -U ispank -d postgres
   ```

2. **Create the database**:
   ```sql
   CREATE DATABASE made_up_wiki;
   ```

3. **Connect to the new database**:
   ```bash
   psql -h 192.168.1.51 -U ispank -d made_up_wiki
   ```

4. **Run the initialization script**:
   ```bash
   psql -h 192.168.1.51 -U ispank -d made_up_wiki -f init.sql
   ```

## Backend Configuration

After setting up the database, update the `.env` file in the `backend` folder with:
- `DB_USER`: ispank
- `DB_PASSWORD`: Your PostgreSQL password for ispank user
- `DB_HOST`: 192.168.1.51
- `DB_PORT`: 5432 (default PostgreSQL port)
- `DB_NAME`: made_up_wiki
- `JWT_SECRET`: A strong random string for signing JWTs
- `FRONTEND_URL`: Your frontend URL (http://localhost:3000 for local dev)

## Network Security Note
Ensure that your PostgreSQL is configured to accept remote connections:
- Check `postgresql.conf` for `listen_addresses`
- Check `pg_hba.conf` to ensure your dev machine's IP is allowed to connect
