==============================================
|W3C| Triplestore wrapper for HTML5 WebStorage
==============================================
This wrapper enables web applications to store triples ``subject-property-value`` into `WebStorage`_. The API looks like an extension of `W3C RDFa API`_.

Functionality
-------------
* Save semantic data as triples into WebStorage
* Get/Edit/Remove triples stored in WebStorage

Usage
-----
`library web site`_ describing how to use.

Dependency
----------
This library depends on only HTML5 WebStorage API

How to serialize API specification
----------------------------------
#. Install ``yuidoc``

#. Execute a script under $LIBRARY_ROOT::

     $ ./yuidoc.sh

#. API specification is serialized under ``$LIBRARY_ROOT/doc/html``

License
-------
`W3C Software Notice and License`_

Author
------
Hitoshi Uchida <uchida@w3.org>

.. |W3C| image:: http://www.w3.org/Icons/w3c_home
.. _`WebStorage`: http://www.w3.org/TR/webstorage/
.. _`W3C RDFa API`: http://www.w3.org/TR/rdfa-api/
.. _`library web site`: http://www.w3.org/2013/04/semweb-html5/triplestoreJS/index.html
.. _`W3C Software Notice and License`: http://www.w3.org/Consortium/Legal/2002/copyright-software-20021231
