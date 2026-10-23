# Graph Report - kalguroo-app  (2026-10-23)

## Corpus Check
- 7 files · ~8,421 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 27 nodes · 28 edges · 4 communities (3 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da079f36`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- manifest.json
- vercel.json
- api/products.js
- scrape_7eleven.js

## God Nodes (most connected - your core abstractions)
1. `matchOfficialProduct()` - 4 edges
2. `handler()` - 2 edges
3. `OFFICIAL_PRODUCTS` - 2 edges
4. `searchOpenFoodFacts()` - 2 edges
5. `main()` - 2 edges
6. `short_name` - 1 edges
7. `start_url` - 1 edges
8. `display` - 1 edges
9. `background_color` - 1 edges
10. `theme_color` - 1 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `matchOfficialProduct()`  [EXTRACTED]
  api/analyze.js → data/products.js

## Import Cycles
- None detected.

## Communities (4 total, 1 thin omitted)

### Community 0 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 2 - "api/products.js"
Cohesion: 0.48
Nodes (3): handler(), matchOfficialProduct(), OFFICIAL_PRODUCTS

### Community 3 - "scrape_7eleven.js"
Cohesion: 0.25
Nodes (5): DATA_FILE, __dirname, __filename, main(), searchOpenFoodFacts()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._