/**
 * autoSeed.ts
 *
 * Runs automatically on server startup.
 * Creates the Admin and Member demo users ONLY if they don't already exist.
 * Safe to run on every deploy — fully idempotent.
 */

import bcrypt from 'bcrypt'
import User from '../models/User'

const BCRYPT_COST = 12

const SEEDS = [
  {
    name:     'Admin User',
    email:    'admin@example.com',
    password: 'Admin1234!',
    role:     'Admin' as const,
  },
  {
    name:     'Member User',
    email:    'member@example.com',
    password: 'Member1234!',
    role:     'Member' as const,
  },
]

export async function autoSeed(): Promise<void> {
  try {
    for (const s of SEEDS) {
      const existing = await User.findOne({ email: s.email })
      if (existing) {
        // User exists — make sure the role is correct (fix any wrong-role issue)
        if (existing.role !== s.role) {
          await User.updateOne({ email: s.email }, { role: s.role })
          console.log(`[autoSeed] Fixed role for ${s.email}: ${existing.role} → ${s.role}`)
        } else {
          console.log(`[autoSeed] ${s.role} "${s.email}" already exists — skipping`)
        }
        continue
      }

      const passwordHash = await bcrypt.hash(s.password, BCRYPT_COST)
      await User.create({ name: s.name, email: s.email, passwordHash, role: s.role })
      console.log(`[autoSeed] Created ${s.role}: ${s.email}`)
    }
  } catch (err) {
    // Never crash the server over a seed failure
    console.error('[autoSeed] Seed error (non-fatal):', err)
  }
}
