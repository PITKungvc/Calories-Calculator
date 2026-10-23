# Graph Report - kalguroo-app  (2026-10-24)

## Corpus Check
- 10 files · ~19,399 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 40 nodes · 40 edges · 7 communities (4 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8dbe38f5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- manifest.json
- vercel.json
- api/products.js
- scrape_7eleven.js
- chat.js
- widget.js

## God Nodes (most connected - your core abstractions)
1. `matchOfficialProduct()` - 4 edges
2. `handler()` - 2 edges
3. `getThaiDateShort()` - 2 edges
4. `handler()` - 2 edges
5. `OFFICIAL_PRODUCTS` - 2 edges
6. `searchOpenFoodFacts()` - 2 edges
7. `main()` - 2 edges
8. `config` - 1 edges
9. `config` - 1 edges
10. `widgetCache` - 1 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `matchOfficialProduct()`  [EXTRACTED]
  api/analyze.js → data/products.js

## Import Cycles
- None detected.

## Communities (7 total, 3 thin omitted)

### Community 0 - "manifest.json"
Cohesion: 0.17
Nodes (11): background_color, display, icons, id, name, orientation, prefer_related_applications, scope (+3 more)

### Community 2 - "api/products.js"
Cohesion: 0.39
Nodes (4): config, handler(), matchOfficialProduct(), OFFICIAL_PRODUCTS

### Community 3 - "scrape_7eleven.js"
Cohesion: 0.29
Nodes (5): DATA_FILE, __dirname, __filename, main(), searchOpenFoodFacts()

### Community 6 - "widget.js"
Cohesion: 0.50
Nodes (3): getThaiDateShort(), handler(), widgetCache

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._