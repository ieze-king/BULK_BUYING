# Why lhr1

`vercel.json` pins functions to London. The Neon database is in AWS Europe West 2
(London), and every page in this app is dynamic and issues several queries per
render, so functions and database must sit together.

Left on the default `iad1` (Washington DC), each query crossed the Atlantic to
reach London: worse than putting both in the United States. Serving the edge from
Cape Town while the function ran in Virginia and the database in London was the
worst of the three options.

If the database ever moves region, move this with it.
