# OpenUI5 / SAPUI5 — The Fiori Framework

OpenUI5 is the open-source JavaScript framework that SAP Fiori is built on.
SAPUI5 is the licensed version with additional SAP-specific controls.
For learning purposes, they are identical — we use OpenUI5 (free, from CDN).

---

## What Is OpenUI5?

OpenUI5 is a comprehensive JavaScript framework that provides:
- **UI controls** — buttons, tables, input fields, date pickers, etc.
- **ODataModel** — a built-in client for OData services
- **Data binding** — declarative connection between UI controls and data
- **Routing** — navigation between pages
- **Theming** — SAP's Fiori visual design

It abstracts away everything you did manually in Stages 1-3:
- The `fetch()` call → `ODataModel`
- Building HTML manually → declarative XML views
- Handling paging and filtering → built-in list binding

**The key question:** Now that you've done it by hand, do you see what it's doing?

---

## How It Relates to What You've Already Done

| You did manually (Stage 2-3) | OpenUI5 does for you |
|---|---|
| `fetch('/odata/v4/catalog/Products')` | `ODataModel` reads `$metadata`, knows the service |
| `?$filter=Price gt 500` | Filter bar control assembles the filter string |
| `?$orderby=Price desc` | Column sort click assembles the orderby string |
| `?$top=10&$skip=20` | Table paging triggers automatically |
| `?$expand=Category` | Association binding follows the relationship |
| `response.json()` then building DOM | Data binding updates the table automatically |

When a Fiori app's table sorts or filters, it is constructing and firing the same OData URLs
you typed by hand in Stage 3. You already know what's happening.

---

## Loading OpenUI5 from CDN

In Stage 5, we load OpenUI5 from a CDN (Content Delivery Network) — no build step, no npm.

```html
<script
  id="sap-ui-bootstrap"
  src="https://sdk.openui5.org/1.120/resources/sap-ui-core.js"
  data-sap-ui-theme="sap_horizon"
  data-sap-ui-libs="sap.m,sap.ui.layout,sap.ui.table"
  data-sap-ui-compatVersion="edge"
  data-sap-ui-async="true"
  data-sap-ui-onInit="module:stage5/App"
  data-sap-ui-resourceRoots='{"stage5": "./"}'
></script>
```

The URL uses `sdk.openui5.org` (the open-source OpenUI5 CDN) with `1.120` as a version
shorthand — this always resolves to the latest available `1.120.x` patch, so it won't 404
if a specific patch hasn't been published yet.

This one `<script>` tag:
- Loads the OpenUI5 framework (core + sap.m controls library)
- Applies the Fiori Horizon theme
- Sets the entry point to `App.js` in the current directory

**ABAP analogy:** Like loading a shared library and specifying an initialization routine.

---

## The ODataModel

The `ODataModel` is the bridge between your UI and the OData service.

```javascript
const model = new ODataModel({
    serviceUrl: "http://localhost:4004/odata/v4/catalog/",
    autoExpandSelect: true,  // Automatically adds $select for used properties
    groupId: "$direct"       // Send individual GET requests, not batched via $batch
});

// Set it on the App — all child controls inherit it
oApp.setModel(model);
```

Once attached, all controls in the view can bind to data from the OData service.
The model handles:
- Reading `$metadata` to understand the service structure
- Fetching data when controls need it
- Assembling query options (`$filter`, `$orderby`, etc.) from binding parameters
- Updating data when the user makes changes

**`groupId: "$direct"` — why it's needed here:**
By default, ODataModel v4 batches all requests into a single `POST $batch` call.
This is efficient in production but has two drawbacks in this learning setup:
1. The individual OData URLs (`?$filter=...`, `?$top=8`) are hidden inside the batch envelope — you can't see them in the Network tab
2. The `$batch` POST triggers a CORS preflight that CAP's dev server doesn't pass by default

Setting `groupId: "$direct"` sends each request as a plain GET, making the URLs
visible exactly as you'd expect from Stage 3.

**Note on CORS:** The backend (`src/backend/server.js`) is configured to allow
cross-origin requests from the `npx serve` dev server on port 3000. In a real SAP BTP
deployment, the Fiori app and the CAP service are served from the same origin, so CORS
does not arise.

**ABAP analogy:** The ODataModel is like a persistent RFC connection with a query cache.
The framework talks to the service; you just tell controls what data they should show.

---

## Data Binding

Data binding is OpenUI5's most powerful concept. Instead of:

```javascript
// Imperative (what you did in Stage 2):
const data = await fetch('/odata/v4/catalog/Products').then(r => r.json());
data.value.forEach(product => {
    const li = document.createElement('li');
    li.textContent = product.Name;
    list.appendChild(li);
});
```

You declare the binding in the control:

```javascript
// Declarative (OpenUI5 style):
const list = new sap.m.List({
    items: {
        path: "/Products",          // which entity set to read
        template: new sap.m.StandardListItem({
            title: "{Name}",        // bind the Name property to the title
            description: "{Price}"  // bind Price to the description
        })
    }
});
```

OpenUI5 reads `{Name}` and `{Price}` and replaces them with the actual values from
the OData response. When the data changes, the UI updates automatically.

**ABAP analogy:** Like filling a dynpro screen field with `WA_PRODUCT-NAME` —
you declare the relationship between the UI element and the data field, and the
runtime handles the population.

---

## List Binding with Filters

When a user types in a filter box, OpenUI5 builds an OData query:

```javascript
const filter = new sap.ui.model.Filter(
    "Price",
    sap.ui.model.FilterOperator.GT,
    500
);

list.getBinding("items").filter([filter]);
```

This fires:
```
GET /odata/v4/catalog/Products?$filter=Price gt 500
```

The exact URL you typed manually in Stage 3.

---

## XML Views

In real Fiori apps, the UI structure is defined in **XML Views** rather than JavaScript.
This is a further abstraction — the layout is declarative XML, and JavaScript only handles logic.

```xml
<!-- view/Main.view.xml -->
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m">
    <List
        id="productList"
        items="{/Products}">
        <StandardListItem
            title="{Name}"
            description="Price: {Price}" />
    </List>
</mvc:View>
```

OpenUI5 compiles this XML into the same JavaScript control objects. The binding syntax
`{Name}` and `{Price}` works the same way.

Stage 5 is JavaScript-only (no XML views) for clarity — you can see exactly what OpenUI5
is doing without any additional abstraction. Real Fiori apps use XML views, which is
covered in Stage 6.

---

## The MVC Pattern

OpenUI5 uses MVC (Model-View-Controller):

| Part | Role | In this repo |
|---|---|---|
| Model | Data and data access (ODataModel) | The CAP OData service |
| View | What the user sees (XML or JS) | `stage5-openui5/` (JS only — Stage 6 adds XML) |
| Controller | Logic, event handlers | Embedded in `App.js` (Stage 6 splits this out) |

**ABAP analogy:** MVC maps roughly to the ABAP separation of:
- Data layer (tables + CDS views) → Model
- Dynpro / screen layout → View
- PAI/PBO logic + business logic → Controller

---

## What Fiori Is

Fiori is a **design system** and **application framework** built on SAPUI5.

- **Fiori design system** — guidelines for how apps should look and feel (Horizon theme, floorplans)
- **Fiori launchpad** — the shell that hosts apps, handles navigation and theming
- **Fiori elements** — a way to generate entire app pages from OData annotations, with minimal code

In a real SAP BTP project, you'd build Fiori apps using SAPUI5 with Fiori elements.
What you're learning here is the foundation underneath all of that.

---

## Exercise: Stage 5

**Terminal 1 — data server** (skip if still running):
```bash
cd src/backend
npm run watch
```

**Terminal 2 — page server** (stop Stage 3's server first with `Ctrl+C`):
```bash
npx serve src/frontend/stage5-openui5
```

Open the URL it prints in your browser.

**What to observe:**

1. Open DevTools (**F12** → **Network** tab) before interacting with the page
2. Reload — you should see two requests fire automatically:
   - `GET $metadata` — OpenUI5 reads the service description first
   - `GET Products?...` — then fetches the first page of data
3. Type a name in the filter box and click **Search** — watch the Network tab. The URL should include `$filter=contains(Name,'...')` — exactly what you typed by hand in Stage 3
4. Click **More** at the bottom of the table — watch `$skip` appear in the URL

**Compare the code:**

Open `src/frontend/stage5-openui5/App.js` alongside `src/frontend/stage2-fetch/index.html`.

Notice:
- The `fetch()` call is gone — replaced by `ODataModel`
- The `response.json()` and DOM manipulation is gone — replaced by data binding
- `$filter`, `$orderby`, `$top`, `$skip` are assembled by the framework, not written by hand
- The code is shorter, yet does considerably more

The ODataModel is doing exactly what you did in Stages 2 and 3 — it has just automated it.

---

*Ask Claude: "Explain the difference between property binding ({Name}) and aggregation binding ({/Products}) in OpenUI5."*
*or: "What's happening between when I click the Search button and when the filtered data appears in the table?"*
