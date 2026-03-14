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

In Stage 4, we load OpenUI5 from a CDN (Content Delivery Network) — no build step, no npm.

```html
<script
  id="sap-ui-bootstrap"
  src="https://ui5.sap.com/1.120.0/resources/sap-ui-core.js"
  data-sap-ui-theme="sap_horizon"
  data-sap-ui-libs="sap.m"
  data-sap-ui-compatVersion="edge"
  data-sap-ui-async="true"
  data-sap-ui-onInit="module:myapp/App"
  data-sap-ui-resourceroots='{"myapp": "./"}'
></script>
```

This one `<script>` tag:
- Loads the OpenUI5 framework (core + sap.m controls library)
- Applies the Fiori Horizon theme
- Sets the entry point to `App.js` in the current directory

**ABAP analogy:** Like loading a shared library and specifying an initialization routine.

---

## The ODataModel

The `ODataModel` is the bridge between your UI and the OData service.

```javascript
const model = new sap.ui.model.odata.v4.ODataModel({
    serviceUrl: "/odata/v4/catalog/",
    synchronizationMode: "None"
});

// Attach it to the app
this.getView().setModel(model);
```

Once attached, all controls in the view can bind to data from the OData service.
The model handles:
- Reading `$metadata` to understand the service structure
- Fetching data when controls need it
- Assembling query options (`$filter`, `$orderby`, etc.) from binding parameters
- Updating data when the user makes changes

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

Stage 4 starts with JavaScript-only (no XML views) for clarity, then introduces the XML approach.

---

## The MVC Pattern

OpenUI5 uses MVC (Model-View-Controller):

| Part | Role | In this repo |
|---|---|---|
| Model | Data and data access (ODataModel) | The CAP OData service |
| View | What the user sees (XML or JS) | `stage4-openui5/view/` |
| Controller | Logic, event handlers | `stage4-openui5/controller/` |

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

## Exercise: Stage 4

Open `src/frontend/stage4-openui5/index.html`.

Compare it side by side with `stage2-fetch/index.html`.

Notice:
- The `fetch()` is gone — replaced by ODataModel
- The DOM manipulation is gone — replaced by data binding
- The code is shorter but does more (sorting, filtering, paging all come for free)

Try using the Filter button. Open the Network tab (F12) and watch what URL gets fired.
It should look exactly like the URLs you typed in Stage 3.

---

*Ask Claude: "Explain the difference between property binding ({Name}) and aggregation binding ({/Products}) in OpenUI5."*
*or: "What's happening between when I click the Filter button and when the filtered data appears in the list?"*
