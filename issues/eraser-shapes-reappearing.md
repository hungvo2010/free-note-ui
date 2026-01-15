# Issue: Erased Shapes Reappear When Switching Tools

## Problem
When using the eraser tool to delete shapes, the deleted shapes would reappear when switching to another tool in the toolbar.

## Root Cause
The `removeShapes()` method in `ReDrawController` was using `filter()` to remove shapes:

```typescript
public removeShapes(shapesToRemove: Shape[]): void {
  this.shapes = this.shapes.filter(
    (shape) => !shapesToRemove.includes(shape)
  );
}
```

This creates a **new array** and assigns it to `this.shapes`, breaking the reference to `shapes.current` in `WhiteboardContext`.

### Why this matters:
1. `WhiteboardContext` creates `shapes = useRef<Shape[]>([])`
2. `ReDrawController` is initialized with `shapes.current` (same array reference)
3. When `filter()` is called, `this.shapes` becomes a **new array**
4. `shapes.current` still points to the **original array** with all shapes
5. When tool switches trigger re-render, a new `ReDrawController` is created with `shapes.current` (original array)
6. Deleted shapes reappear!

## Solution
Use `splice()` to mutate the array in-place instead of creating a new array:

```typescript
public removeShapes(shapesToRemove: Shape[]): void {
  for (let i = this.shapes.length - 1; i >= 0; i--) {
    if (shapesToRemove.includes(this.shapes[i])) {
      this.shapes.splice(i, 1);
    }
  }
}
```

This keeps `this.shapes` and `shapes.current` pointing to the **same array**, so deletions persist across re-renders.

## Additional Fix
Also added a check in `WhiteboardContext.tsx` to prevent recreating `ReDrawController` on every render:

```typescript
if (!reDrawController.current) {
  reDrawController.current = new ReDrawController(roughCanvas, canvas, shapes.current);
} else {
  reDrawController.current.roughCanvas = roughCanvas;
  reDrawController.current.canvas = canvas;
}
```

## Key Takeaway
When sharing mutable state (like arrays) between React refs and class instances, be careful with methods that reassign vs mutate:
- `array.filter()` / `array.map()` / `array.slice()` → creates new array (breaks reference)
- `array.splice()` / `array.push()` / `array.pop()` → mutates in-place (keeps reference)
