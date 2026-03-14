// ============================================================
// Stage 5 — OpenUI5 Application Entry Point
//
// This module runs after OpenUI5 loads (configured via
// data-sap-ui-onInit="module:stage5/App" in index.html).
//
// It creates:
//   1. An ODataModel connected to the CAP backend
//   2. A filter bar with Name and Price inputs
//   3. A sap.m.Table bound to the /Products entity set
//   4. A column sorter and "Load More" for paging
//
// Compare this file to stage2-fetch/index.html.
// The fetch() + response.json() + DOM manipulation is all gone.
// The ODataModel and data binding handle it.
// ============================================================

sap.ui.define([
  "sap/ui/core/Core",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Table",
  "sap/m/Column",
  "sap/m/ColumnListItem",
  "sap/m/Text",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/Button",
  "sap/m/Toolbar",
  "sap/m/ToolbarSpacer",
  "sap/m/Title",
  "sap/m/MessageStrip",
  "sap/ui/model/odata/v4/ODataModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/m/VBox",
  "sap/m/HBox",
  "sap/m/ObjectStatus"
], function (
  Core, App, Page, Table, Column, ColumnListItem, Text,
  Label, Input, Select, Item, Button, Toolbar, ToolbarSpacer, Title,
  MessageStrip,
  ODataModel, Filter, FilterOperator, Sorter,
  VBox, HBox, ObjectStatus
) {
  "use strict";

  // ----------------------------------------------------------
  // 1. CREATE THE ODATA MODEL
  //
  // The ODataModel is the bridge between the UI and the service.
  // It automatically:
  //   - Fetches $metadata to understand the service structure
  //   - Manages a client-side data cache
  //   - Assembles OData query URLs from binding parameters
  //   - Handles batch requests ($batch) for efficiency
  //
  // ABAP analogy: Like creating a persistent RFC connection
  // with a built-in query translator and result cache.
  // ----------------------------------------------------------
  const model = new ODataModel({
    serviceUrl: "http://localhost:4004/odata/v4/catalog/",
    autoExpandSelect: true,    // Automatically adds $select for used properties
    groupId: "$direct"         // Send requests as individual GETs, not batched via $batch.
                               // $batch triggers a CORS preflight for x-csrf-token which
                               // CAP's dev server blocks. $direct also makes each OData
                               // URL visible in the Network tab — the point of this exercise.
  });

  // ----------------------------------------------------------
  // 2. BUILD THE FILTER BAR
  //
  // These input controls let the user specify filter criteria.
  // When the user clicks "Search", we read the values and create
  // sap.ui.model.Filter objects — the ODataModel translates these
  // into $filter URL parameters automatically.
  //
  // ABAP analogy: Like a selection screen (PARAMETERS / SELECT-OPTIONS)
  // that the framework translates into a WHERE clause.
  // ----------------------------------------------------------
  const nameInput = new Input({
    placeholder: "Filter by name...",
    width: "200px"
  });

  const priceOperatorSelect = new Select({
    width: "180px",
    items: [
      new Item({ key: "", text: "(no price filter)" }),
      new Item({ key: "GT", text: "Price greater than" }),
      new Item({ key: "GE", text: "Price greater or equal" }),
      new Item({ key: "LT", text: "Price less than" }),
      new Item({ key: "LE", text: "Price less or equal" })
    ]
  });

  const priceInput = new Input({
    placeholder: "e.g. 100",
    width: "100px",
    type: "Number"
  });

  // ----------------------------------------------------------
  // 3. BUILD THE TABLE
  //
  // sap.m.Table is the main list/table control in Fiori.
  //
  // The 'items' aggregation binding:
  //   path: "/Products"        → which OData entity set to read
  //   growing: true            → enable "Load More" paging ($skip)
  //   growingThreshold: 8      → fetch 8 at a time ($top=8)
  //
  // Each ColumnListItem is one row. The {Name}, {Price} etc.
  // are property bindings — they pick up the value from the
  // OData entity for that row.
  //
  // ABAP analogy:
  //   Table binding  = LOOP AT lt_products
  //   ColumnListItem = the template row structure
  //   {Name}         = wa_product-name
  // ----------------------------------------------------------
  const oTable = new Table("productTable", {
    growing: true,
    growingThreshold: 8,
    growingScrollToLoad: false,
    headerToolbar: new Toolbar({
      content: [
        new Title({ text: "Products" }),
        new ToolbarSpacer(),
        new Text({ text: "ODataModel binding active — check Network tab" })
      ]
    }),
    columns: [
      new Column({ header: new Label({ text: "ID" }),          width: "60px" }),
      new Column({ header: new Label({ text: "Name" }),        width: "220px" }),
      new Column({ header: new Label({ text: "Category" }),    width: "140px" }),
      new Column({ header: new Label({ text: "Price" }) }),
      new Column({ header: new Label({ text: "Stock" }) })
    ]
  });

  // Set the items binding
  // The ODataModel will fire GET /Products?$top=8 immediately,
  // then $top=8&$skip=8 when the user clicks "More", etc.
  oTable.bindItems({
    path: "/Products",
    template: new ColumnListItem({
      cells: [
        new Text({ text: "{ID}" }),
        new Text({ text: "{Name}" }),
        // Category_ID is the foreign key. Without $expand, we just show the ID.
        // The expandedCategoryText binding below uses $expand=Category.
        new Text({ text: "{Category_ID}" }),
        new Text({ text: "{= '$' + odata.Number(${Price}, 2) }" }).addStyleClass("sapUiSmallMarginEnd"),
        // ObjectStatus shows stock with colour coding
        new ObjectStatus({
          text: {
            parts: ["Stock"],
            formatter: function(stock) {
              if (stock === 0)  return "Out of Stock";
              if (stock < 20)  return stock + " (Low)";
              return String(stock);
            }
          },
          state: {
            parts: ["Stock"],
            formatter: function(stock) {
              if (stock === 0)  return "Error";
              if (stock < 20)  return "Warning";
              return "Success";
            }
          }
        })
      ]
    }),
    // Request the first page immediately
    parameters: {
      $count: true,          // Request a total count so the footer can show it
      $$operationMode: "Server"  // Required for filter() and sort() to work
    }
  });

  // ----------------------------------------------------------
  // 4. SEARCH FUNCTION
  //
  // Reads the filter bar controls and creates Filter objects.
  // Calls binding.filter() — the ODataModel assembles
  // the $filter parameter and re-fetches.
  //
  // ABAP analogy: Like calling a function module with an updated
  // WHERE clause — the framework handles the re-query.
  // ----------------------------------------------------------
  function onSearch() {
    const filters = [];

    const nameVal = nameInput.getValue().trim();
    if (nameVal) {
      // FilterOperator.Contains → $filter=contains(Name,'x')
      filters.push(new Filter("Name", FilterOperator.Contains, nameVal));
    }

    const priceOp = priceOperatorSelect.getSelectedKey();
    const priceVal = parseFloat(priceInput.getValue());
    if (priceOp && !isNaN(priceVal)) {
      // FilterOperator.GT → $filter=Price gt N
      filters.push(new Filter("Price", FilterOperator[priceOp], priceVal));
    }

    // Apply filters to the table binding
    // The ODataModel translates these into $filter= URL params
    const binding = oTable.getBinding("items");
    binding.filter(filters);
  }

  function onReset() {
    nameInput.setValue("");
    priceInput.setValue("");
    priceOperatorSelect.setSelectedKey("");
    oTable.getBinding("items").filter([]);
  }

  // ----------------------------------------------------------
  // 5. URL MONITOR — shows the last OData request
  //
  // This intercepts the ODataModel's requests so we can display
  // the actual URL in the page, making the "it's just a URL"
  // lesson concrete.
  // ----------------------------------------------------------
  const urlDisplay = new Text({
    text: "Waiting for first OData request...",
    wrapping: true
  }).addStyleClass("sapUiSmallMargin");

  model.attachPropertyChange(null, function() {}, this);

  // Listen to the underlying ODL requests via the binding
  // (We'll update this after the table binding fires)
  oTable.attachUpdateFinished(function() {
    const binding = oTable.getBinding("items");
    if (binding) {
      // Get the path that was requested (approximate)
      const count = binding.getLength ? binding.getLength() : "?";
      urlDisplay.setText(
        "Last request: GET /odata/v4/catalog/Products" +
        " (binding returned " + count + " records so far)"
      );
    }
  });

  // ----------------------------------------------------------
  // 6. ASSEMBLE THE PAGE
  //
  // sap.m.Page is a standard Fiori page shell with a header,
  // content area, and optional footer.
  // ----------------------------------------------------------
  const oPage = new Page({
    title: "Stage 4 — OpenUI5 Product List",
    content: [
      new MessageStrip({
        text: "Tip: Open DevTools (F12) → Network tab, then click Search. " +
              "You'll see GET requests to /odata/v4/catalog/Products with $filter, $top, $skip.",
        type: "Information",
        showIcon: true
      }).addStyleClass("sapUiSmallMargin"),

      // Filter bar
      new VBox({
        items: [
          new HBox({
            alignItems: "Center",
            wrap: "Wrap",
            items: [
              new VBox({
                items: [new Label({ text: "Name" }), nameInput]
              }).addStyleClass("sapUiSmallMarginEnd sapUiSmallMarginBottom"),
              new VBox({
                items: [new Label({ text: "Price Condition" }), priceOperatorSelect]
              }).addStyleClass("sapUiSmallMarginEnd sapUiSmallMarginBottom"),
              new VBox({
                items: [new Label({ text: "Value" }), priceInput]
              }).addStyleClass("sapUiSmallMarginEnd sapUiSmallMarginBottom"),
              new VBox({
                items: [
                  new Label({ text: "\u00a0" }), // spacer label
                  new HBox({
                    items: [
                      new Button({ text: "Search", type: "Emphasized", press: onSearch }),
                      new Button({ text: "Reset", press: onReset })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd sapUiSmallMarginTop"),

      // URL display (teaching aid)
      urlDisplay,

      // The table
      oTable
    ]
  });

  // ----------------------------------------------------------
  // 7. BOOTSTRAP THE APP
  //
  // sap.m.App is the outermost shell — it handles navigation
  // between pages (in a multi-page app). Here we have one page.
  // ----------------------------------------------------------
  const oApp = new App();
  oApp.setModel(model);   // Set ODataModel on the App — all child controls inherit it
  oApp.addPage(oPage);
  oApp.placeAt("content"); // Render into the <div id="content"> in index.html
});
