// ============================================================
// Custom Service Handler — CatalogService
//
// CAP handles basic CRUD automatically. This file adds
// custom logic on top — validation, calculated fields,
// or calls to external systems.
//
// ABAP analogy: This is like implementing a BAdI or
// an enhancement spot in a Business Object. The framework
// calls your code at defined hook points (before, after, on).
//
// This file is OPTIONAL. If you delete it, CAP still works —
// it just loses the custom behaviors defined here.
// ============================================================

const cds = require("@sap/cds");

module.exports = cds.service.impl(function () {
  const { Orders, OrderItems, Products } = this.entities;

  // ----------------------------------------------------------
  // BEFORE READ Products — profanity filter
  //
  // Runs before every Products query, including those triggered
  // by $filter=contains(Name,'...') from the browser.
  //
  // Note: this JavaScript runs on the Node.js server, not in
  // the browser. The browser sends an HTTP request; this code
  // intercepts it on the server before the database is touched.
  //
  // req.query is the parsed OData query in CAP's internal format
  // (CQN — Core Query Notation). Stringifying it lets us scan
  // the entire query — filter values, search terms, etc. — in
  // one pass without unpacking the CQN structure by hand.
  //
  // req.error() sends an HTTP error response to the caller and
  // stops processing. The browser receives a 400 with the message.
  //
  // ABAP analogy: Like a BAdI implementation on a READ operation
  // that raises a MESSAGE E to abort and return an error to the UI.
  // ----------------------------------------------------------
  this.before("READ", Products, (req) => {
    const BLOCKED = ["fuck", "shit", "bastard"];
    const query = JSON.stringify(req.query).toLowerCase();
    const found = BLOCKED.find((word) => query.includes(word));
    if (found) {
      req.error(400, "That search term is not permitted.");
    }
  });

  // ----------------------------------------------------------
  // BEFORE CREATE Orders
  //
  // Runs before a new Order is saved to the database.
  // We set the Date automatically if not provided.
  //
  // ABAP analogy: Like a BADI implementation for
  // BADI_SD_PRICINGD — modifying the document before save.
  // ----------------------------------------------------------
  this.before("CREATE", Orders, (req) => {
    if (!req.data.Date) {
      req.data.Date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    }
  });

  // ----------------------------------------------------------
  // AFTER READ Products
  //
  // Runs after products are fetched from the database.
  // Adds a calculated 'StockStatus' field that isn't in the DB.
  //
  // ABAP analogy: Like adding a virtual/calculated field in
  // an ABAP CDS view, or computing a value in a getter method.
  // ----------------------------------------------------------
  this.after("READ", Products, (products) => {
    // products is an array when reading a collection,
    // or a single object when reading by key
    const items = Array.isArray(products) ? products : [products];
    items.forEach((product) => {
      if (product.Stock !== undefined) {
        if (product.Stock === 0) {
          product.StockStatus = "Out of Stock";
        } else if (product.Stock < 10) {
          product.StockStatus = "Low Stock";
        } else {
          product.StockStatus = "In Stock";
        }
      }
    });
  });

  // ----------------------------------------------------------
  // BEFORE CREATE OrderItems
  //
  // Validate that the referenced Product exists and has
  // sufficient stock before creating an order item.
  //
  // ABAP analogy: Like checking availability in ATP
  // (Available-to-Promise) before confirming a sales order item.
  // ----------------------------------------------------------
  this.before("CREATE", OrderItems, async (req) => {
    const { Product_ID, Quantity } = req.data;

    if (!Product_ID) return; // let the DB constraint handle missing FK

    const [product] = await SELECT.from(Products).where({ ID: Product_ID });

    if (!product) {
      req.error(404, `Product with ID ${Product_ID} does not exist`);
      return;
    }

    if (product.Stock < Quantity) {
      req.error(
        400,
        `Insufficient stock. Requested: ${Quantity}, Available: ${product.Stock}`
      );
    }
  });
});
