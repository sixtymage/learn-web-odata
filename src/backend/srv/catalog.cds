// ============================================================
// Service Definition — CatalogService
//
// This file defines what OData endpoints are exposed to the
// outside world. The service is a projection (a view) over
// the physical data model in db/schema.cds.
//
// ABAP analogy: This is like defining a service in SEGW
// (SAP Gateway Service Builder), or a Business Object
// interface in RAP. The physical tables are hidden;
// the service exposes only what the API should show.
//
// When CAP starts, it reads this file and automatically:
//   - Creates the OData $metadata document
//   - Handles GET, POST, PATCH, DELETE for each entity
//   - Translates $filter, $orderby, $top, $skip, $expand
//     into SQL queries against the database
// ============================================================

using products.db from '../db/schema';

// CatalogService is accessible at: /odata/v4/catalog
// For example: http://localhost:4004/odata/v4/catalog/Products
service CatalogService @(path: '/odata/v4/catalog') {

    // Products — readable and annotated as "read only" for the learning path.
    // Remove @readonly to allow POST/PATCH/DELETE from the UI.
    @readonly
    entity Products   as projection on products.db.Products;

    // Categories — lookup values for product categories
    @readonly
    entity Categories as projection on products.db.Categories;

    // Orders — full CRUD (create, read, update, delete)
    // Try: POST to /odata/v4/catalog/Orders with a JSON body
    entity Orders     as projection on products.db.Orders;

    // OrderItems — typically accessed via $expand on Orders,
    // but also directly accessible here
    entity OrderItems as projection on products.db.OrderItems;
}
