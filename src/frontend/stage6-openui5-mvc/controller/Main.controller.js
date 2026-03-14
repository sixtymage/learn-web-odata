// ============================================================
// Main.controller.js — The Logic
//
// This file handles WHAT the page does.
// It contains no UI structure — that is in view/Main.view.xml.
//
// A controller extends sap.ui.core.mvc.Controller.
// OpenUI5 creates one instance per view and wires them together.
//
// Key concepts:
//   this.byId("nameInput")    Find a control declared in the view by its id=""
//   binding.filter([...])     Apply OData $filter via the model binding
//   formatter functions       Called from XML: formatter=".formatPrice"
//                             'this' inside a formatter is the controller instance
//
// ABAP analogy:
//   This file is the PAI/PBO logic and the subroutines it calls.
//   The view is the screen layout; this is the program logic behind it.
// ============================================================

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("stage6.controller.Main", {

    // ----------------------------------------------------------
    // onSearch — called when the Search button is pressed
    //
    // Reads the filter controls, builds Filter objects,
    // and applies them to the table's items binding.
    // The ODataModel assembles the $filter URL parameter.
    //
    // Compare to Stage 5's onSearch() function — identical logic,
    // just now living in a separate file with a proper class structure.
    // ----------------------------------------------------------
    onSearch: function () {
      const filters = [];

      const nameVal = this.byId("nameInput").getValue().trim();
      if (nameVal) {
        filters.push(new Filter("Name", FilterOperator.Contains, nameVal));
      }

      const priceOp  = this.byId("priceOp").getSelectedKey();
      const priceVal = parseFloat(this.byId("priceInput").getValue());
      if (priceOp && !isNaN(priceVal)) {
        filters.push(new Filter("Price", FilterOperator[priceOp], priceVal));
      }

      this.byId("productTable").getBinding("items").filter(filters);
    },

    // ----------------------------------------------------------
    // onReset — clears all filters and reloads the full list
    // ----------------------------------------------------------
    onReset: function () {
      this.byId("nameInput").setValue("");
      this.byId("priceInput").setValue("");
      this.byId("priceOp").setSelectedKey("");
      this.byId("productTable").getBinding("items").filter([]);
    },

    // ----------------------------------------------------------
    // Formatter functions
    //
    // These are called from the XML view via formatter=".formatPrice"
    // etc. They receive the raw data value and return a display string.
    //
    // The dot (.) prefix in the XML means "look in this controller".
    //
    // ABAP analogy: Like a FORM routine that converts a raw field value
    // into a display string for a screen field.
    // ----------------------------------------------------------

    formatPrice: function (price) {
      if (price === undefined || price === null) return "—";
      return "$" + parseFloat(price).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    formatStockText: function (stock) {
      if (stock === 0)   return "Out of Stock";
      if (stock < 20)    return stock + " (Low)";
      return String(stock);
    },

    // Returns a ValueState string used by ObjectStatus for colour coding:
    //   "Error"   → red
    //   "Warning" → orange
    //   "Success" → green
    formatStockState: function (stock) {
      if (stock === 0)  return "Error";
      if (stock < 20)   return "Warning";
      return "Success";
    }

  });
});
