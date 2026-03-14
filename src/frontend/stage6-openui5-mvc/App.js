// ============================================================
// Stage 6 — Application Entry Point
//
// This file is much shorter than Stage 5's App.js.
// Its only job is:
//   1. Create the ODataModel (same as Stage 5)
//   2. Load the XML view (which loads the controller automatically)
//   3. Attach the model to the view
//   4. Render the view into the page
//
// The UI structure has moved to view/Main.view.xml.
// The event handlers have moved to controller/Main.controller.js.
//
// Compare this to Stage 5's App.js — all of that control
// construction code is now expressed declaratively in the XML view.
// ============================================================

sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/ui/model/odata/v4/ODataModel",
  "sap/m/App"
], function (XMLView, ODataModel, App) {
  "use strict";

  // ODataModel: same as Stage 5, unchanged.
  // The model is created here (not in the view or controller)
  // so it can be shared across multiple views in a larger app.
  const model = new ODataModel({
    serviceUrl: "http://localhost:4004/odata/v4/catalog/",
    autoExpandSelect: true,
    groupId: "$direct"   // Send individual GET requests instead of $batch,
                         // so requests are visible in the Network tab
  });

  // sap.m.App is required even here — it adds the sapUiBody CSS class to
  // <body>, which is what triggers the Fiori theme layout and gives
  // sap.m.Page the height context it needs to render correctly.
  const oApp = new App();
  oApp.setModel(model);  // Set on App — all child controls inherit it

  // XMLView.create() loads view/Main.view.xml.
  // OpenUI5 also loads controller/Main.controller.js automatically
  // because the view declares controllerName="stage6.controller.Main".
  XMLView.create({
    viewName: "stage6.view.Main"
  }).then(function (oView) {
    // The XMLView's root control is the sap.m.Page declared in Main.view.xml.
    // We add it to the App (not the view itself) so the App shell is in charge
    // of navigation and layout — the standard Fiori pattern.
    oApp.addPage(oView.getContent()[0]);
    oApp.placeAt("content");
  });
});
