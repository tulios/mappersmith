---
'mappersmith': patch
---

Fixed a regression introduced in 2.46.0 regarding the module imports of the Node.js built-in http and https.
They were changed to default imports in 2.45.0, in order to allow end users to apply patches to the native
modules, and have Mappersmith use those patches. The switch back to namespace imports caused the import
statement to return references to the original methods, thus ignoring any end user patches to those modules.
