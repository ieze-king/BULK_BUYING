# Migrations

`drizzle-kit push` is fine for a fresh database but wrong for one holding real
data: it reconciles by dropping and recreating, which is how a schema change
becomes data loss.

Each file here is plain SQL, safe to run more than once, and applied by hand in
the Neon SQL Editor against the production branch. Run them in order.

Verify before you trust one: recreate the current production schema in a scratch
local database, apply the file twice, and boot the app against it. That is how
`001` was checked.
