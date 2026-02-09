# POS Module Architecture

## 📐 Design Philosophy

The refactored POS module follows a **Strict Separation of Concerns** principle:

1.  **Core (Logic)**: Handles state, API, validation, and business rules. Knows NOTHING about UI.
2.  **UI (Presentation)**: Pure React components. Receive data via props. Know NOTHING about API or logic.
3.  **Screens (Composition)**: Connect Core to UI using the `usePOS` hook.

---

## 🧩 Core Hooks Breakdown

The monolithic logic is split into specialized internal hooks for maintainability:

### 1. `usePOSStoreCore`
*   **Responsibility**: Store selection, fetching, and role-based access control.
*   **Security**: Prevents 'Cashier' role from changing stores.
*   **Safety**: Manages AbortControllers for store fetches.

### 2. `usePOSProductCore`
*   **Responsibility**: Product & Category fetching, filtering, and searching.
*   **Constraint**: `fetchProducts(storeId)` THROWS an error if `storeId` is missing.
*   **Concurrency**: Uses request ID tracking to ignore stale responses (race condition prevention).

### 3. `usePOSCartCore`
*   **Responsibility**: Order management (add/remove/update), calculations (tax/discount), and customer assignment.
*   **Logic**: Recalculates `subTotal`, `tax`, `grandTotal` automatically on any cart change.
*   **Feature**: exposes `resetCart()` to clear state cleanly on store change.

### 4. `usePOSUIState`
*   **Responsibility**: purely client-side UI behavior (fullscreen, dark mode, calculator toggle, clock).
*   **Isolation**: Keeps "UI state" separate from "Business data".

### 5. `usePOSCore` (The Facade)
*   **Responsibility**: Composes the above hooks into a single, cohesive API.
*   **Orchestration**: Handles the **dependency flow** (e.g., when Store changes -> Clear Cart -> Clear Products -> Fetch New Products).

---

## 🛡️ Hardening Measures

### API Safety
All API calls are wrapped in standard `try/catch` blocks within the hooks, normalizing errors into a `POSError` format.

### Request Cancellation
`AbortController` is used for:
*   `fetchStores`
*   `fetchProducts`
To ensure that rapid store switching or tab navigation doesn't result in "ghost" data loading from a previous request.

### StoreId Guarantee
The system is architected so that it is **impossible** to trigger a product load without a confirmed `storeId`.

---

## 🎨 UI Component Standards

*   All components in `src/modules/pos/ui/` are functional components.
*   **Props Interface**: Strictly typed.
*   **No hooks**: They do not use `usePOS` or `useContext`. They only use passed props.
*   **Styling**: Tailwind CSS with Dark Mode support (`dark:` modifiers).
