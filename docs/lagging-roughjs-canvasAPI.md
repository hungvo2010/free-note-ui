✦ The "root cause" was actually a synchronization-performance loop involving three distinct layers of the system. It wasn't just one thing; they were feeding into each other:


  1. The Rendering Engine Bottleneck (Primary)
  The biggest issue was that Position and Geometry were tightly coupled.
   * RoughJS is expensive because it uses trigonometry and random offsets to simulate hand-drawing.
   * The Problem: The shapes were baking the x, y coordinates directly into the RoughJS path. Every time you moved the mouse even 1 pixel, the shape destroyed its cache and forced RoughJS to recalculate the entire path.
   * The "Lag": Because recalculating a complex path (especially for FreeStyleShape) is slow, the "Redraw" phase of a frame couldn't finish before the mouse had already moved to the next position. This made the red bounding box (raw
     canvas, extremely fast) appear to "pull away" from the shape.


  2. The WebSocket "Echo" (The Optimization Killer)
  Even after we fixed the caching locally, the WebSocket was sabotaging us.
   * The Problem: Every move you made was sent to the server and echoed back to you. When your client received its own update, it created a fresh instance of the shape.
   * The Result: Fresh instance = Empty cache. Even if you moved perfectly, the WebSocket was "resetting" your performance optimization every time a network packet arrived, forcing a high-cost redraw mid-drag.


  3. The Collision Math Error (The "Ghost" Edges)
   * The Problem: The redraw logic was too "literal." It only redrew neighbors if their strict mathematical coordinates overlapped the clear area.
   * The Result: Because RoughJS is "rough," pixels often bleed outside the mathematical box. When you moved a shape, the system cleared a padded area but didn't realize it had just "erased" the rough edge of a neighbor. Since that
     neighbor's strict box didn't overlap the clear zone, the system didn't redraw it, leaving a "bite" out of the neighbor.


  Summary of the Final Fix:
   1. Decoupled Position from Geometry: We now generate shapes at (0,0) and use GPU-accelerated canvas translate to move them. This makes moving a shape cost near-zero CPU.
   2. Generator vs. Drawer: We switched to the generator to stop the "double drawing" at (0,0).
   3. Echo Filtering: We now ignore our own WebSocket messages during a session, preserving our local "hot" cache.
   4. Normalized Padded Bounds: We expanded the redraw detection to use the padded BoundingBox instead of the strict Rect, ensuring rough edges are always repaired.