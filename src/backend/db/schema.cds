// ============================================================
// Data Model — Products & Orders
//
// This is the physical data model. Each 'entity' becomes a
// database table. CAP creates the tables automatically when
// you start the service with 'cds watch'.
//
// ABAP analogy: These are like ABAP Dictionary tables.
// The 'Association' keyword works like a foreign key or
// a TO_ONE relationship in ABAP CDS Views.
// ============================================================

namespace products.db;

// ----------------------------------------------------------
// Categories
// Simple lookup table. Products reference a Category.
// ABAP analogy: Like a check table (T-table) for a domain.
// ----------------------------------------------------------
entity Categories {
    key ID   : Integer;
        Name : String(100);
}

// ----------------------------------------------------------
// Products
// Core product master data.
// ABAP analogy: Like MARA (material master general data).
//
// 'Association to Categories' creates a foreign key to the
// Categories entity. CAP will expose this as $expand=Category
// in OData — it follows the link and includes the full
// Category object in the response.
// ----------------------------------------------------------
entity Products {
    key ID       : Integer;
        Name     : String(200)   @mandatory;
        Category : Association to Categories;
        Price    : Decimal(10, 2) @mandatory;
        Stock    : Integer default 0;
}

// ----------------------------------------------------------
// Orders
// Order header. Each order has many OrderItems.
// ABAP analogy: Like VBAK (sales order header).
// ----------------------------------------------------------
entity Orders {
    key ID       : Integer;
        Customer : String(200)  @mandatory;
        Date     : Date;
        Status   : String(20) default 'Open'
                   @assert.range: ['Open', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        Items    : Composition of many OrderItems on Items.Order = $self;
}

// ----------------------------------------------------------
// OrderItems
// One row per product line in an order.
// ABAP analogy: Like VBAP (sales order items).
//
// 'Composition of many' means OrderItems are "owned" by the
// Order — if the Order is deleted, its Items are too.
// This is an OData containment relationship.
// ----------------------------------------------------------
entity OrderItems {
    key ID        : Integer;
        Order     : Association to Orders;
        Product   : Association to Products;
        Quantity  : Integer     @mandatory;
        UnitPrice : Decimal(10, 2);
}
