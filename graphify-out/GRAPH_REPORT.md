# Graph Report - kalguroo-app  (2026-10-23)

## Corpus Check
- 8 files · ~14,516 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 33 nodes · 33 edges · 5 communities (3 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `23a23e3c`
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
6. `config` - 1 edges
7. `short_name` - 1 edges
8. `start_url` - 1 edges
9. `scope` - 1 edges
10. `display` - 1 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `matchOfficialProduct()`  [EXTRACTED]
  api/analyze.js → data/products.js

## Import Cycles
- None detected.

## Communities (5 total, 2 thin omitted)

### Community 0 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, display, icons, id, name, orientation, prefer_related_applications, scope (+3 more)

### Community 2 - "api/products.js"
Cohesion: 0.39
Nodes (4): config, handler(), matchOfficialProduct(), OFFICIAL_PRODUCTS

### Community 3 - "scrape_7eleven.js"
Cohesion: 0.25
Nodes (5): DATA_FILE, __dirname, __filename, main(), searchOpenFoodFacts()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._