# OData Concepts — The Protocol Under Fiori

OData is the query language that SAP Fiori uses to communicate between the browser and the backend.
When you work in SAP, every Fiori app is making OData requests under the hood.
This doc teaches you what those requests look like and what they mean.

---

## What Is OData?

OData (Open Data Protocol) is a **standard** — a set of conventions for building REST APIs
that support querying, filtering, sorting, and paging in a predictable way.

Think of it as **SQL for HTTP**. Instead of writing a SELECT statement, you write a URL.

**ABAP analogy:** OData is like having a standard RFC interface where the caller can specify
exactly which fields to return, which rows to filter, and how to sort — without the developer
needing to write custom SELECT logic for each combination.

OData was developed by Microsoft and adopted by SAP as the backbone of Fiori.
Version 2 (OData v2) was used by older Fiori apps; **OData v4** is the current standard
and what CAP exposes by default.

---

## The Service Root and Metadata

Every OData service has two fundamental endpoints:

### Service Root
```
GET http://localhost:4004/odata/v4/catalog
```
Returns a list of available entity sets (like a table of contents).

### $metadata
```
GET http://localhost:4004/odata/v4/catalog/$metadata
```
Returns the full service description in XML — all entity types, their properties,
their relationships, and available operations.

**ABAP analogy:** `$metadata` is like the WSDL for a web service, or the dictionary
entry for a structure — it describes the shape of the data before you retrieve any.

Open both in your browser once `cds watch` is running. Read the metadata XML.
You'll recognise the entity names from `src/backend/db/schema.cds`.

---

## Entity Sets — Reading Collections

To get all products:
```
GET /odata/v4/catalog/Products
```

Response:
```json
{
  "@odata.context": "$metadata#Products",
  "value": [
    { "ID": 1, "Name": "Laptop", "Price": 999.99, "Stock": 45 },
    { "ID": 2, "Name": "Monitor", "Price": 349.00, "Stock": 120 }
  ]
}
```

To get a single product by key:
```
GET /odata/v4/catalog/Products(1)
```

**ABAP analogy:** `Products` is like an internal table; `Products(1)` is like `READ TABLE ... WITH KEY ID = 1`.

---

## Query Options — The Dollar-Sign Parameters

OData query options always start with `$`. They go after a `?` in the URL.
You can combine them with `&`.

### $select — Choose Which Fields to Return

```
GET /odata/v4/catalog/Products?$select=Name,Price
```

**ABAP analogy:** Like `SELECT Name Price INTO TABLE lt_products FROM products`.

Only the specified fields come back:
```json
{ "value": [
  { "Name": "Laptop", "Price": 999.99 },
  { "Name": "Monitor", "Price": 349.00 }
]}
```

Use `$select` when you only need a few fields — reduces payload size, improves performance.

---

### $filter — Filter by Condition

```
GET /odata/v4/catalog/Products?$filter=Price gt 500
```

**ABAP analogy:** `SELECT * FROM products WHERE Price > 500`.

OData filter operators:

| OData | SQL equivalent | Example |
|---|---|---|
| `eq` | `=` | `$filter=Category_ID eq 10` |
| `ne` | `<>` | `$filter=Stock ne 0` |
| `gt` | `>` | `$filter=Price gt 500` |
| `ge` | `>=` | `$filter=Price ge 500` |
| `lt` | `<` | `$filter=Stock lt 10` |
| `le` | `<=` | `$filter=Stock le 10` |
| `and` | `AND` | `$filter=Price gt 100 and Stock gt 0` |
| `or` | `OR` | `$filter=Category_ID eq 1 or Category_ID eq 2` |
| `contains` | `LIKE '%x%'` | `$filter=contains(Name,'book')` |
| `startswith` | `LIKE 'x%'` | `$filter=startswith(Name,'Lap')` |

---

### $orderby — Sort Results

```
GET /odata/v4/catalog/Products?$orderby=Price desc
```

**ABAP analogy:** `ORDER BY Price DESCENDING`.

Multiple sort fields:
```
$orderby=Category_ID asc,Price desc
```

---

### $top and $skip — Paging

```
GET /odata/v4/catalog/Products?$top=10&$skip=20
```

Returns 10 records starting from record 21. This is how OData implements paging.

**ABAP analogy:** Like using `UP TO n ROWS` with an offset, or ABAP paging with `PACKAGE SIZE`.

---

### $expand — Follow Relationships (Like a JOIN)

```
GET /odata/v4/catalog/Products?$expand=Category
```

Instead of just returning the `Category_ID` field, this follows the relationship
and includes the full Category object inline:

```json
{ "value": [
  {
    "ID": 1,
    "Name": "Laptop",
    "Price": 999.99,
    "Category": {
      "ID": 10,
      "Name": "Electronics"
    }
  }
]}
```

**ABAP analogy:** Like joining MARA and MARC, or expanding a TO_ONE association in ABAP CDS.

You can expand multiple levels:
```
GET /odata/v4/catalog/Orders?$expand=Items($expand=Product)
```
This returns Orders with their OrderItems, and each OrderItem includes its full Product.

---

### Combining Query Options

Query options combine with `&`:

```
GET /odata/v4/catalog/Products
  ?$filter=Price gt 100
  &$select=Name,Price,Stock
  &$orderby=Price desc
  &$top=5
  &$expand=Category
```

(Written on multiple lines for readability — in a real URL it's all one line.)

This is exactly what Fiori apps do. The ODataModel library assembles these URLs automatically
based on filter controls, table settings, and data bindings. But the URL looks exactly like this.

---

## OData in the Browser Dev Tools

Open any stage in the browser, press **F12** → **Network tab**.
Every OData call appears here. Click one to see:
- The full request URL (including query params)
- Request headers
- Response headers
- The JSON response body (Preview tab)

This is the most powerful debugging tool you have. When a Fiori app behaves unexpectedly,
the Network tab shows you exactly what it asked for and what came back.

---

## Exercise: Stage 3

Open `src/frontend/stage3-odata/index.html`.

This page has filter controls that let you construct OData queries by typing.
Work through each query option:

1. Filter products by price (`$filter=Price gt X`)
2. Select only name and price (`$select=Name,Price`)
3. Sort by price descending (`$orderby=Price desc`)
4. Page through results (`$top=3&$skip=0`, then `&$skip=3`)
5. Expand the Category on each product (`$expand=Category`)

After this exercise, you will know exactly what is in an OData URL and why.
When you later see OpenUI5 generating these URLs automatically, you'll recognise them.

---

*Ask Claude: "Show me an OData query that finds all orders from a specific customer,*
*expanded with their order items and the product details for each item."*
