# POS Migration Guide

## 🔄 How to switch to the new POS screens

You have successfully refactored the POS module. The old files in `src/components/admin/pos-screen/` are now deprecated.
Follow these steps to switch your application to use the new, hardened screens.

### 1. Update Page Routes

Locate your Next.js page files (e.g., `src/app/admin/pos/page.tsx` or similar) and update the imports.

**Before:**
```tsx
import Pos3 from '@/components/admin/pos-screen/pos-3';

export default function PosPage() {
  return <Pos3 />;
}
```

**After:**
```tsx
import { Pos3Screen } from '@/modules/pos/screens';

export default function PosPage() {
  return <Pos3Screen />;
}
```

Repeat this for all POS routes (Pos2, Pos3, Pos4, Pos5).

### 2. Verify Legacy Removal

Once you have updated the routes and verified the application works:

1.  Delete `src/components/admin/pos-screen/pos-3.tsx`
2.  Delete `src/components/admin/pos-screen/pos-4.tsx`
3.  Delete `src/components/admin/pos-screen/pos-5.tsx`
4.  Delete `src/components/admin/pos-screen/PosHeader.tsx`
5.  Delete `src/components/admin/pos-screen/PosCategory.tsx`
6.  Delete `src/components/admin/pos-screen/PosProduct.ts`

*(Note: `pos-1.tsx` and `pos-2.tsx` might still be in use if you haven't fully migrated Pos1 or if Pos2 legacy is kept for reference, but the provided `Pos2Screen` refactor covers Pos2).*

### 3. Troubleshooting

**"Store ID is required to fetch products" Error:**
- This means the component tried to load products before a store was selected.
- The new `usePOSCore` handles this automatically, but if you forcefully call `refreshAll()` manually before init, you might see this.
- **Fix**: Ensure you wait for `isReady` flag from `usePOS()`.

**Styles look different:**
- The pure UI components use Tailwind standard classes.
- If you had custom CSS in global files targeting specific IDs in the old components, they might need to be migrated to Tailwind utility classes in the `modules/pos/ui` components.

### 4. Customization

To customize the UI:
- **Do not** edit `usePOSCore.ts`.
- Edit the specific component in `src/modules/pos/ui/` (e.g., `PosHeaderUI.tsx`).
- Or pass different props from the `Screen` component (e.g., `Pos3Screen.tsx`).
