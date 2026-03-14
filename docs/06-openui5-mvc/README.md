# OpenUI5 XML Views + MVC — The Real Fiori Structure

Stage 5 showed OpenUI5 working. Stage 6 shows how real Fiori apps are structured.

The application is functionally identical to Stage 5 — same product table,
same filter bar, same OData queries. The difference is entirely structural.

---

## Why XML Views?

In Stage 5, the UI structure (what the page looks like) and the logic (what it does)
were all mixed together in one `App.js` file. This is fine for learning, but it does
not scale to real applications.

Real Fiori apps split these concerns into separate files:

| File | Responsibility |
|---|---|
| `App.js` | Bootstrap: create the ODataModel, load the view |
| `view/Main.view.xml` | Structure: what controls exist and where they are |
| `controller/Main.controller.js` | Logic: event handlers, formatters, business rules |

This is the MVC pattern (Model-View-Controller) applied to UI development.

**ABAP analogy:**

| OpenUI5 | ABAP |
|---|---|
| `view/Main.view.xml` | Dynpro screen layout (the `.screen` definition) |
| `controller/Main.controller.js` | Flow logic and PAI/PBO modules |
| `App.js` | The main REPORT program bootstrap |
| `ODataModel` | Persistent RFC connection with query cache |

---

## The File Structure

```
stage6-openui5-mvc/
├── index.html                    Bootstrap — loads OpenUI5, points to App.js
├── App.js                        Creates ODataModel, loads the XML view
├── view/
│   └── Main.view.xml             Declares the UI: Page, filter bar, table
└── controller/
    └── Main.controller.js        Event handlers and formatter functions
```

Compare this to Stage 5:
```
stage5-openui5/
├── index.html                    Bootstrap
└── App.js                        Everything: model, controls, handlers, formatters
```

Same result, different structure. In a real project with many screens,
each screen would have its own view + controller pair.

---

## App.js — The Entry Point

`App.js` is now much shorter than in Stage 5. Its only responsibilities are:
1. Create the ODataModel (same configuration as Stage 5)
2. Create an `sap.m.App` shell and attach the model to it
3. Load the XML view — which automatically loads its controller
4. Add the view's root Page to the App shell and place it in the page

```javascript
const oApp = new App();
oApp.setModel(model);  // Set on App — all child controls inherit it

XMLView.create({
    viewName: "stage6.view.Main"
}).then(function (oView) {
    oApp.addPage(oView.getContent()[0]); // getContent()[0] is the sap.m.Page
    oApp.placeAt("content");
});
```

The `viewName` string `"stage6.view.Main"` maps to `view/Main.view.xml` via the
`resourceRoots` configuration in `index.html`. The `stage6` prefix is the module
namespace; `view.Main` is the path within it.

**Why `sap.m.App` is required here:**
`sap.m.App` does more than act as a container — when rendered, it adds the CSS class
`sapUiBody` to `<body>`. This class is what activates the Fiori theme layout: it sets
`height: 100%` and `overflow: hidden` on the body, giving `sap.m.Page` the height
reference it needs to fill the viewport correctly. Without it, the Page's content area
collapses to zero height and only the unstyled title text is visible.

In a real SAP BTP deployment the Fiori Launchpad plays this role, but in a standalone
app you always need `sap.m.App` (or `sap.m.Shell`) at the root.

---

## view/Main.view.xml — The UI Structure

The view declares all the controls using XML. Every element maps directly to an
OpenUI5 JavaScript class:

```xml
<mvc:View
    controllerName="stage6.controller.Main"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:core="sap.ui.core">

  <Page title="Stage 6">
    <content>
      <Table id="productTable"
             items="{path: '/Products', parameters: {$count: true, $$operationMode: 'Server'}}"
             growing="true"
             growingThreshold="8">
        <columns>
          <Column><Label text="Name"/></Column>
          <Column><Label text="Price"/></Column>
        </columns>
        <items>
          <ColumnListItem>
            <cells>
              <Text text="{Name}"/>
              <Text text="{path: 'Price', formatter: '.formatPrice'}"/>
            </cells>
          </ColumnListItem>
        </items>
      </Table>
    </content>
  </Page>

</mvc:View>
```

Key XML binding syntax:

| Syntax | Meaning |
|---|---|
| `items="{/Products}"` | Aggregation binding — reads the whole Products entity set |
| `text="{Name}"` | Property binding — fills this control with the Name field value |
| `formatter=".formatPrice"` | Pipe the value through the controller's `formatPrice()` method |
| `press=".onSearch"` | Call the controller's `onSearch()` method on button press |

The dot (`.`) prefix means "look in this view's controller".

**Namespace note:** Every XML element resolves against a namespace. The default
`xmlns="sap.m"` means unqualified tags like `<Button>` resolve to `sap.m.Button`.
Controls from other libraries need an explicit prefix — for example, `sap.ui.core.Item`
(used inside `<Select>`) must be declared as `xmlns:core="sap.ui.core"` and written
as `<core:Item>`. Writing it as `<Item>` would look for `sap.m.Item`, which doesn't
exist, and silently fail to load the view.

**ABAP analogy:** `{Name}` is like `WA_PRODUCT-NAME` in a dynpro screen field —
you declare the data source, and the runtime fills the value.

---

## controller/Main.controller.js — The Logic

The controller extends `sap.ui.core.mvc.Controller` and implements the methods
referenced in the view:

```javascript
return Controller.extend("stage6.controller.Main", {

    onSearch: function () {
        // this.byId("nameInput") finds the Input declared in the view
        const nameVal = this.byId("nameInput").getValue().trim();
        // ... build filters and apply to table binding
    },

    formatPrice: function (price) {
        // Called from the view's formatter=".formatPrice"
        return "$" + parseFloat(price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
});
```

`this.byId("nameInput")` finds the `<Input id="nameInput">` declared in the view.
The controller has no direct knowledge of DOM — it works entirely through OpenUI5's
control API, which handles the DOM underneath.

---

## What Hasn't Changed

Everything you learned in Stage 5 still applies:

- The ODataModel is created the same way
- Data binding syntax (`{Name}`, `{/Products}`) is the same
- Filter objects and FilterOperator are used exactly the same way
- The OData URLs sent to the backend are identical

XML views are not a different way to talk to OData — they are just a different way
to organise the code that was already working in Stage 5.

---

## Exercise: Stage 6

**Terminal 1 — data server** (skip if still running):
```bash
cd src/backend
npm run watch
```

**Terminal 2 — page server** (stop Stage 5's server first with `Ctrl+C`):
```bash
npx serve src/frontend/stage6-openui5-mvc
```

Open the URL it prints in your browser. The app should look and behave
exactly like Stage 5.

**What to do:**

1. Open DevTools (F12 → Network) and confirm the same OData requests fire as in Stage 5
2. Open the four files side by side in VS Code:
   - `stage5-openui5/App.js`
   - `stage6-openui5-mvc/App.js`
   - `stage6-openui5-mvc/view/Main.view.xml`
   - `stage6-openui5-mvc/controller/Main.controller.js`
3. Find the `onSearch` logic in Stage 5's `App.js` and locate the equivalent in `Main.controller.js` — they are the same logic
4. Find where Stage 5 constructs the `Table` control in JavaScript and find the equivalent `<Table>` declaration in `Main.view.xml`

The behaviour is identical. The structure is what changed.

---

*Ask Claude: "What is a Component.js and when would I need one?"*
*or: "How would I add a second screen to this app?"*
*or: "What are Fiori elements and how do they build on what I've learned here?"*
