# Firebase Firestore Security Specification (ABAC Mode)

## 1. Data Invariants

1. **Authentication Requirement**: No reading or writing is allowed by unauthenticated users on any collection.
2. **Path Hardening**: All document ID path variables (`keyId`, `auditId`) must be strictly formatted alphanumeric identifiers (`^[a-zA-Z0-9_\-]+$`) under 128 characters to prevent injection attacks.
3. **Immutability Protection**: The fields `id`, `created` on `vaultKeys`, and `id`, `timestamp` on `vaultAudits` are strictly immutable after creation.
4. **Defensive Sizing**: String values in payloads must not exceed predefined lengths (e.g., key content under 500 characters, names under 100 characters) to prevent Denial of Wallet memory exhaustion.
5. **No Blind Collection Queries**: All list/query operations on `vaultKeys` and `vaultAudits` are restricted to signed-in users. (Note: These keys are simulated for agent orchestration, but we enforce sign-in of developers/operators on the database level).

---

## 2. The "Dirty Dozen" Adversarial Payloads

Here are 12 specific payloads attempting to violate identity, integrity, state, or role bounds:

### Payload 1: Injection in Path Variable (Resource Poisoning)
* **Goal**: Write a key using a 2KB junk character string containing shell characters or SQL injection strings.
* **Expected Result**: `PERMISSION_DENIED` due to `isValidId` block.

### Payload 2: Key Creation by Unauthenticated Client
* **Goal**: Create a key with a null auth payload.
* **Expected Result**: `PERMISSION_DENIED`.

### Payload 3: Shadow Update / Ghost Fields (Privilege Escalation)
* **Goal**: Inject an unrequested property like `isAdmin: true` or `bypassAuth: true` on key creation or update.
* **Expected Result**: `PERMISSION_DENIED` via exact key size check and `affectedKeys().hasOnly()`.

### Payload 4: Arbitrary Creator Spoofing
* **Goal**: Write a key claiming to be created by another user (`creator: 'SOMEONE_ELSE'`).
* **Expected Result**: `PERMISSION_DENIED` since keys must match the actual logged-in user or remain immutable.

### Payload 5: Over-sized Key Value Payload (Denial of Wallet)
* **Goal**: Create a credential where the `val` parameter contains a 10MB string.
* **Expected Result**: `PERMISSION_DENIED` due to `.size() <= 500` limit.

### Payload 6: Modifying Key Creation Timestamp
* **Goal**: Update `created` field on a `vaultKey` document to change its history.
* **Expected Result**: `PERMISSION_DENIED` due to immutability.

### Payload 7: Update Bypassing Allowed Roles Field
* **Goal**: Change the roles allowed to access a credential without holding correct privileges.
* **Expected Result**: `PERMISSION_DENIED` via strict update action blocks.

### Payload 8: Mutating Audit Logs
* **Goal**: Attempt to modify, falsify, or delete an entry in the `vaultAudits` collection.
* **Expected Result**: `PERMISSION_DENIED` (Audit logs are write-only / append-only).

### Payload 9: Faking Audit Levels
* **Goal**: Insert a log with an invalid status/level like `SUPER_CRITICAL`.
* **Expected Result**: `PERMISSION_DENIED` due to enum verification on `level`.

### Payload 10: Client-provided Time Spoofing
* **Goal**: Create an audit or key using a future/arbitrary client-generated timestamp instead of `request.time`.
* **Expected Result**: `PERMISSION_DENIED` due to enforced `request.time` equality.

### Payload 11: Bulk Retrieval of Sibling Data (Query scraping)
* **Goal**: Run a generic query to list all audit entries without valid sign-in.
* **Expected Result**: `PERMISSION_DENIED`.

### Payload 12: Updating VaultKey Active State to Invalid Data Type
* **Goal**: Perform an update setting `active: "true"` (string instead of boolean).
* **Expected Result**: `PERMISSION_DENIED` due to type checking.

---

## 3. The Test Runner Structure (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0453603926',
      firestore: {
        rules: require('fs').readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('blocks unauthenticated reads/writes', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('vaultKeys').get());
    await assertFails(db.collection('vaultKeys').add({ name: 'Secret' }));
  });

  it('rejects oversized inputs or invalid ID paths', async () => {
    const db = testEnv.authenticatedContext('user_123').firestore();
    const badId = 'some-key-id-that-is-way-too-long-and-violates-the-regex-rules-$$$';
    await assertFails(db.collection('vaultKeys').doc(badId).set({
      id: badId,
      name: 'Test',
      prog: 'ZQ_AGENTS',
      val: 'sk-123',
      created: '2026-07-16',
      active: true,
      allowedRoles: ['DEVELOPER'],
      usageCount: 0
    }));
  });
});
```
