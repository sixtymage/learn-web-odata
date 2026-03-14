# Web Basics — HTTP, HTML, JavaScript, JSON

Before touching OData or CAP, you need to understand what the browser is doing.
This is the foundation everything else sits on.

---

## The Browser as a Client

In SAP, the SAP GUI is a thick client — it understands ABAP data types, IDocs, BAPIs.
It has deep protocol knowledge built in.

A web browser is a **thin, general-purpose client**. It knows only three things:
1. How to make **HTTP requests** (send a message, receive a response)
2. How to render **HTML** (display a document)
3. How to run **JavaScript** (execute logic in the page)

That's it. Everything else — OData, Fiori, data binding — is built on top of these three.

---

## HTTP: The Language of the Web

HTTP (HyperText Transfer Protocol) is a request-response protocol.

**The pattern:**
1. Client sends a **request** (a structured text message)
2. Server processes it and sends back a **response**

**ABAP analogy:** Like an RFC call. You call a function module on a remote system,
pass parameters, and get a result back. Same idea, different protocol.

### A Raw HTTP Request

```
GET /odata/v4/catalog/Products HTTP/1.1
Host: localhost:4004
Accept: application/json
```

Three parts:
- **Method** (`GET`) — what you want to do
- **Path** (`/odata/v4/catalog/Products`) — what resource you want
- **Headers** — metadata about the request (what format you accept, authentication, etc.)

### A Raw HTTP Response

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "value": [
    { "ID": 1, "Name": "Laptop", "Price": 999.99 },
    ...
  ]
}
```

Three parts:
- **Status code** (`200 OK`) — did it work?
- **Headers** — metadata about the response (what format the data is in)
- **Body** — the actual data

### HTTP Methods (Verbs)

| Method | Meaning | ABAP/SAP Analogy |
|---|---|---|
| `GET` | Read data | SELECT |
| `POST` | Create new data | INSERT |
| `PUT`/`PATCH` | Update existing data | UPDATE |
| `DELETE` | Delete data | DELETE |

OData uses all four. In this learning path, we mostly use `GET`.

### Status Codes

| Code | Meaning |
|---|---|
| 200 | OK — request succeeded |
| 201 | Created — POST succeeded, new record created |
| 400 | Bad Request — your request had an error |
| 401 | Unauthorized — you need to log in |
| 403 | Forbidden — you're logged in but don't have permission |
| 404 | Not Found — that resource doesn't exist |
| 500 | Internal Server Error — the server crashed |

---

## HTML: The Document

HTML (HyperText Markup Language) describes the **structure** of a page.
It uses **tags** — labels in angle brackets — to mark up content.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Products</h1>
    <ul id="product-list">
      <li>Laptop — $999.99</li>
      <li>Monitor — $349.00</li>
    </ul>
  </body>
</html>
```

- `<html>` wraps the whole document
- `<head>` contains metadata (title, linked stylesheets)
- `<body>` contains what the user sees
- `<h1>` is a heading; `<ul>` is an unordered list; `<li>` is a list item
- `id="product-list"` is a label we can use from JavaScript to find this element

**ABAP analogy:** HTML is like the layout definition of a dynpro — it describes what
should be displayed and where, but not the logic.

---

## JavaScript: The Logic

JavaScript runs in the browser and can:
- Read and change the HTML (called **manipulating the DOM**)
- Make HTTP requests (`fetch()`)
- Respond to user actions (button clicks, input changes)

### Basic Syntax

```javascript
// Variables
const productName = "Laptop";         // const: can't be reassigned
let price = 999.99;                   // let: can be reassigned

// Function
function formatPrice(amount) {
  return "$" + amount.toFixed(2);     // toFixed(2) = 2 decimal places
}

// Arrow function (shorter syntax, same result)
const formatPrice = (amount) => "$" + amount.toFixed(2);

// Array
const products = ["Laptop", "Monitor", "Keyboard"];

// Object (like a structure in ABAP)
const product = {
  id: 1,
  name: "Laptop",
  price: 999.99
};

// Access object properties
console.log(product.name);            // prints "Laptop" to browser console
```

### The DOM (Document Object Model)

The DOM is the browser's in-memory representation of your HTML.
JavaScript can find elements and change them:

```javascript
// Find the element with id="product-list"
const list = document.getElementById("product-list");

// Create a new list item
const item = document.createElement("li");
item.textContent = "Laptop — $999.99";

// Add it to the list
list.appendChild(item);
```

**ABAP analogy:** The DOM is like an internal table that represents the screen layout.
JavaScript manipulating the DOM is like ABAP modifying a dynpro at runtime.

---

## JSON: The Data Format

JSON (JavaScript Object Notation) is how data travels over HTTP in modern APIs.
OData uses JSON by default.

```json
{
  "value": [
    {
      "ID": 1,
      "Name": "Laptop",
      "Category_ID": 10,
      "Price": 999.99,
      "Stock": 45
    },
    {
      "ID": 2,
      "Name": "Monitor",
      "Category_ID": 10,
      "Price": 349.00,
      "Stock": 120
    }
  ]
}
```

- `{...}` is an **object** (like an ABAP structure)
- `[...]` is an **array** (like an ABAP internal table)
- Property names are always quoted strings
- Values can be strings, numbers, booleans, objects, or arrays

**The `value` key** is an OData convention — collections are always wrapped in `{ "value": [...] }`.

---

## What Happens When You Open a Web Page

1. You type a URL (or click a link)
2. Browser sends an HTTP GET request to the server
3. Server responds with HTML
4. Browser parses the HTML and builds the DOM
5. Browser finds any `<script>` tags and runs the JavaScript
6. JavaScript may make additional `fetch()` calls to get data
7. JavaScript updates the DOM with the fetched data
8. You see the final page

This whole cycle happens in milliseconds.

---

## Exercise: Stage 1

Open `src/frontend/stage1-basics/index.html` in your browser.
(Right-click the file in VS Code Explorer → **Open with Live Server**, or just double-click the file in Windows explorer.)

Read the code alongside the page. Notice:
- The HTML structure that becomes what you see
- The JavaScript array that holds the product data
- The JavaScript function that turns that data into HTML list items

**There is no network call yet.** The data lives entirely in the JavaScript code.
That changes in Stage 2.

---

*Ask Claude: "Walk me through stage1-basics/index.html line by line"*
*or: "What is the DOM and why does it matter for Fiori apps?"*
