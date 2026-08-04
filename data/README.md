# Public Data Registry

The portal reads its public evidence model from version-controlled, human-readable files in this directory.

## Files

- `metadata.json` — release, evidence date, decision state, and expected counts.
- `evidence-levels.json` — public E0–E7 evidence definitions.
- `trunks.csv` — public-safe research trunk definitions.
- `sources.csv` — source ledger with support and reliability boundaries.
- `claims.csv` — atomic claims with evidence, counterevidence, deployment, intent, and next actions.
- `pathways.csv` — qualified cross-trunk pathways with reachability, infrastructure, constraints, and tests needed.
- `corrections.csv` — active public correction records.

## Restricted placeholders

Restricted canonical records remain represented by sanitized placeholders so public record counts and cross-record references stay internally consistent. Placeholder records do not expose private testimony, access paths, protected methods, or controlled evidence.

## Validation

Run:

```bash
python3 scripts/validate_public_data.py
node --check assets/portal.js
```

The validator checks:

- unique IDs;
- source, trunk, correction, claim, and pathway references;
- evidence and reachability values;
- public/restricted visibility values;
- metadata counts;
- URL structure for public external sources.
