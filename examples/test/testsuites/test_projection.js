TestCase('Test Projectoin', {
  setUp: function() {
    this.st = new Triplestore();
  },
  tearDown: function() {
    this.st.remove();
  },
  'test getProjection': function() {
    {
      this.st.remove();
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("a:bob", "a:phone", "617");      
      this.st.push("b:john", "a:name", "b:John");
      this.st.push("b:john", "b:address", "Cambridge");
      
      //check
      {
        var projection = this.st.getProjection(null);
        assertEquals(null, projection);
      }
      {
        var projection = this.st.getProjection("xxx");
        assertEquals(null, projection);
      }
      {
        var projection = this.st.getProjection("a:bob");
        assertEquals("http://a.org/bob", projection.getSubject());
      }
      {
        var projection = this.st.getProjection("b:john");
        assertEquals("http://b.org/john", projection.getSubject());
      }
      {
        var projection = this.st.getProjection("http://a.org/bob");
        assertEquals("http://a.org/bob", projection.getSubject());
      }
      {
        var projection = this.st.getProjection("http://b.org/john");
        assertEquals("http://b.org/john", projection.getSubject());
      }
    }
  },
  'test get': function() {
    {
      this.st.remove();
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("a:bob", "a:phone", "617");      
      this.st.push("b:john", "a:name", "b:John");
      this.st.push("b:john", "b:address", "Cambridge");
      
      //check
      {
        var projection = this.st.getProjection("a:bob");
        assertEquals("http://a.org/Bob", projection.get("a:name"));
        assertEquals("Cambridge", projection.get("a:address"));
        assertEquals("617", projection.get("a:phone"));
        assertEquals("http://a.org/Bob", projection.get("http://a.org/name"));
        assertEquals("Cambridge", projection.get("http://a.org/address"));
        assertEquals("617", projection.get("http://a.org/phone"));
        assertEquals(null, projection.get("xxx"));
        assertEquals(null, projection.get(null));
      }
    }
  },
  'test getAll': function() {
    {
      this.st.remove();
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("a:bob", "a:phone", "617");      
      this.st.push("b:john", "a:name", "b:John");
      this.st.push("b:john", "b:address", "Cambridge");
      
      //check
      {
        var projection = this.st.getProjection("a:bob");
        assertEquals(1, projection.getAll("a:name").length);
        assertEquals("http://a.org/Bob", projection.getAll("a:name")[0]);
        assertEquals(1, projection.getAll("a:address").length);
        assertEquals("Cambridge", projection.getAll("a:address")[0]);
      }
      {
        var projection = this.st.getProjection("a:bob");
        assertEquals(0, projection.getAll("xxx").length);
      }
      {
        var projection = this.st.getProjection("a:bob");
        assertEquals(0, projection.getAll(null).length);
      }
    }
  },
  'test getProperties': function() {
    {
      this.st.remove();
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("a:bob", "a:phone", "617");      
      this.st.push("b:john", "a:name", "b:John");
      this.st.push("b:john", "b:address", "Cambridge");
      
      //check
      {
        var projection = this.st.getProjection("a:bob");
        var properties = projection.getProperties();
        assertEquals(3, properties.length);
        assertEquals("http://a.org/name", properties[0]);
        assertEquals("http://a.org/address", properties[1]);
        assertEquals("http://a.org/phone", properties[2]);
      }
      {
        var projection = this.st.getProjection("http://a.org/bob");
        var properties = projection.getProperties();
        assertEquals(3, properties.length);
        assertEquals("http://a.org/name", properties[0]);
        assertEquals("http://a.org/address", properties[1]);
        assertEquals("http://a.org/phone", properties[2]);
      }
      {
        var projection = this.st.getProjection("b:john");
        var properties = projection.getProperties();
        assertEquals(2, properties.length);
        assertEquals("http://a.org/name", properties[0]);
        assertEquals("http://b.org/address", properties[1]);
      }
    }
  },
});