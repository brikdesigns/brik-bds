# docs/reports

Committed BDS reports. Each one carries the ADR-046 metadata contract: seven
`report-*` `<meta>` tags in one marked block.

The contract is defined once, in brik-llm `docs/reports/README.md`
§ Metadata contract (brik-llm#4101). This folder follows it.

## How to add one

1. Save the report as `docs/reports/<kebab-slug>.html`. The name carries no
   data; the date lives in `report-generated`.
2. Stamp the contract (`--generated` defaults to today):

   ```sh
   scripts/reports/report-meta.py stamp <file> \
     --status current --subject bds --owner <login> \
     --supersedes none --cadence once --source manual
   ```

3. Regenerate the manifest: `scripts/reports/report-meta.py manifest --write`.
4. Commit both. CI (`report-meta-gate`) runs `report-meta.py check`.

`scripts/reports/report-meta.py` is a watched twin of brik-llm's canonical
copy. Fix it there and re-sync; never edit it here.
