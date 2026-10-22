# Graph Report - kalguroo-app  (2026-10-23)

## Corpus Check
- 3 files · ~5,297 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 15 nodes · 13 edges · 3 communities (2 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8542662a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- manifest.json
- vercel.json
- analyze.js

## God Nodes (most connected - your core abstractions)
1. `matchOfficialProduct()` - 2 edges
2. `handler()` - 2 edges
3. `OFFICIAL_STORE_PRODUCTS` - 1 edges
4. `short_name` - 1 edges
5. `start_url` - 1 edges
6. `display` - 1 edges
7. `background_color` - 1 edges
8. `theme_color` - 1 edges
9. `icons` - 1 edges
10. `cleanUrls` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (3 total, 1 thin omitted)

### Community 0 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 2 - "analyze.js"
Cohesion: 0.67
Nodes (3): handler(), matchOfficialProduct(), OFFICIAL_STORE_PRODUCTS

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._