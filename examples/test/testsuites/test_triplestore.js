console = jstestdriver.console;

TestCase('Test push show', {
  setUp: function() {
    this.st = new Triplestore();
  },
  tearDown: function() {
    this.st.removeSubject();
  },
  'test push to save triples into WebStorage': function() {
    {
      this.st.push("s1", "name", "Bob");
      
      //check
      var props = this.st.getProperties("s1");
      assertEquals(1, props.length);
      assertEquals("name", props[0]);
      
      assertEquals("Bob", this.st.getValues("s1", "name")[0]);
    }
    {
      this.st.push("s1", "address", "Cambridge");
      
      //check
      var props = this.st.getProperties("s1");
      assertEquals(2, props.length);
      assertEquals("name", props[0]);
      assertEquals("address", props[1]);
      assertEquals("Bob", this.st.getValues("s1", "name")[0]);
      assertEquals("Cambridge", this.st.getValues("s1", "address")[0]);
    }
    {
      this.st.push("s2", "name", "John");
      this.st.push("s2", "address", "Boston");
      this.st.push("s2", "phone", "xxx");
      this.st.push("s2", "phone", "617");
      
      //check
      var props = this.st.getProperties("s2");
      assertEquals(3, props.length);
      assertEquals("name", props[0]);
      assertEquals("address", props[1]);
      assertEquals("phone", props[2]);
      assertEquals("John", this.st.getValues("s2", "name"))[0];
      assertEquals("Boston", this.st.getValues("s2", "address")[0]);
      assertEquals("617", this.st.getValues("s2", "phone")[0]);
    }
  },
  'test getProperties': function() {
    {
      this.st.push("s1", "name", "Bob");
      this.st.push("s1", "address", "Cambridge");
      this.st.push("s2", "name", "John");
      this.st.push("s2", "address", "Boston");
      this.st.push("s2", "phone", "617");
      
      {
        //check
        var props = this.st.getProperties("s1");
        assertEquals(2, props.length);
        assertEquals("name", props[0]);
        assertEquals("address", props[1]);
      }
      {
        //check
        var props = this.st.getProperties("s2");
        assertEquals(3, props.length);
        assertEquals("name", props[0]);
        assertEquals("address", props[1]);
        assertEquals("phone", props[2]);
      }
      {
        //check
        var props = this.st.getProperties();
        assertEquals(3, props.length);
        assertEquals("name", props[0]);
        assertEquals("address", props[1]);
        assertEquals("phone", props[2]);
      }
    }
  },
  'test setMapping with prefix mapping': function() {
    {
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("b:john", "b:site", "http://sns.org/john");
      
      //check
      {
        var props = this.st.getProperties("a:bob");
        assertEquals(2, props.length);
        assertEquals("http://a.org/name", props[0]);
        assertEquals("http://a.org/address", props[1]);
        assertEquals("http://a.org/Bob", this.st.getValues("http://a.org/bob", "http://a.org/name")[0]);
        assertEquals("Cambridge", this.st.getValues("a:bob", "a:address")[0]);
      }
      {
        var props = this.st.getProperties("http://a.org/bob");
        assertEquals(2, props.length);
        assertEquals("http://a.org/name", props[0]);
        assertEquals("http://a.org/address", props[1]);
        assertEquals("http://a.org/Bob", this.st.getValues("http://a.org/bob", "http://a.org/name")[0]);
        assertEquals("Cambridge", this.st.getValues("a:bob", "a:address")[0]);
      }
      {
        var props = this.st.getProperties("bob");
        assertEquals(0, props.length);
      }
      {
        var props = this.st.getProperties("b:john");
        assertEquals(1, props.length);
        assertEquals("http://b.org/site", props[0]);
        assertEquals("http://sns.org/john", this.st.getValues("b:john", "b:site")[0]);
      }
      {
        var props = this.st.getProperties("http://b.org/john");
        assertEquals(1, props.length);
        assertEquals("http://b.org/site", props[0]);
        assertEquals("http://sns.org/john", this.st.getValues("b:john", "b:site")[0]);
      }
      {
        var props = this.st.getProperties("john");
        assertEquals(0, props.length);
      }
    }
  },
  'test setMapping with no mapping': function() {
    {
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("b:john", "b:site", "http://sns.org/john");
      
      //check
      {
        var props = this.st.getProperties("a:bob");
        assertEquals(2, props.length);
        assertEquals("a:name", props[0]);
        assertEquals("a:address", props[1]);
      }
      {
        var props = this.st.getProperties("bob");
        assertEquals(0, props.length);
      }
    }
  },
  'test getValues': function() {
    {
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("b:john", "a:name", "John");
      this.st.push("b:john", "b:site", "http://sns.org/john");
      
      //check with subject + property
      {
        var values = this.st.getValues("a:bob", "a:name");
        assertEquals("Bob", values);
      }
      {
        var values = this.st.getValues("http://a.org/bob", "a:name");
        assertEquals("Bob", values);
      }
      {
        var values = this.st.getValues("a:bob", "http://a.org/name");
        assertEquals("Bob", values);
      }
      {
        var values = this.st.getValues("http://a.org/bob", "http://a.org/name");
        assertEquals("Bob", values);
      }
      {
        var values = this.st.getValues("a:bob", "a:address");
        assertEquals("Cambridge", values);
      }
      {
        var values = this.st.getValues("http://a.org/bob", "a:address");
        assertEquals("Cambridge", values);
      }
      {
        var values = this.st.getValues("a:bob", "http://a.org/address");
        assertEquals("Cambridge", values);
      }
      {
        var values = this.st.getValues("http://a.org/bob", "http://a.org/address");
        assertEquals("Cambridge", values);
      }
      {
        var values = this.st.getValues("a:bob", "xxx");
        assertEquals(0, values.length);
      }
      {
        var values = this.st.getValues("xxx", "a:name");
        assertEquals(0, values.length);
      }
      {
        var values = this.st.getValues("xxx", "xxx");
        assertEquals(0, values.length);
      }
      //check with subject + no-property
      {
        var values = this.st.getValues("a:bob", null);
        assertEquals(2, values.length);
        assertEquals("Bob", values[0]);
        assertEquals("Cambridge", values[1]);
      }
      {
        var values = this.st.getValues("b:john", null);
        assertEquals(2, values.length);
        assertEquals("John", values[0]);
        assertEquals("http://sns.org/john", values[1]);
      }
      {
        var values = this.st.getValues("xxx", null);
        assertEquals(0, values.length);
      }
      //check with no-subject + property
      {
        var values = this.st.getValues(null, "a:name");
        assertEquals(2, values.length);
        assertEquals("Bob", values[0]);
        assertEquals("John", values[1]);
      }
      {
        var values = this.st.getValues(null, "b:site");
        assertEquals(1, values.length);
        assertEquals("http://sns.org/john", values[0]);
      }
      {
        var values = this.st.getValues(null, "xxx");
        assertEquals(0, values.length);
      }
      //check with no-subject + no-property
      {
        var values = this.st.getValues(null, null);
        assertEquals(4, values.length);
        assertEquals("Bob", values[0]);
        assertEquals("Cambridge", values[1]);
        assertEquals("John", values[2]);
        assertEquals("http://sns.org/john", values[3]);
      }
    }
  },
  'test getSubjects': function() {
    {
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("b:john", "a:name", "b:John");
      this.st.push("b:john", "b:address", "Cambridge");
      
      //check with property + value
      {
        var subjects = this.st.getSubjects("a:name", "a:Bob");
        assertEquals(1, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
      }
      {
        var subjects = this.st.getSubjects("http://a.org/name", "http://a.org/Bob");
        assertEquals(1, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
      }
      {
        var subjects = this.st.getSubjects("a:name", "xxx");
        assertEquals(0, subjects.length);
      }
      {
        var subjects = this.st.getSubjects("xxx", "a:Bob");
        assertEquals(0, subjects.length);
      }
      {
        var subjects = this.st.getSubjects("xxx", "xxx");
        assertEquals(0, subjects.length);
      }
      //check with no-property + value
      {
        var subjects = this.st.getSubjects(null, "a:Bob");
        assertEquals(1, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
      }
      {
        var subjects = this.st.getSubjects(null, "http://a.org/Bob");
        assertEquals(1, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
      }
      {
        var subjects = this.st.getSubjects(null, "Cambridge");
        assertEquals(2, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
        assertEquals("http://b.org/john", subjects[1]);
      }
      {
        var subjects = this.st.getSubjects(null, "xxx");
        assertEquals(0, subjects.length);
      }
      //check with property + no-value
      {
        var subjects = this.st.getSubjects("a:name");
        assertEquals(2, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
        assertEquals("http://b.org/john", subjects[1]);
      }
      {
        var subjects = this.st.getSubjects("http://a.org/name");
        assertEquals(2, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
        assertEquals("http://b.org/john", subjects[1]);
      }
      {
        var subjects = this.st.getSubjects("xxx");
        assertEquals(0, subjects.length);
      }
      //check with no-property + no-value
      {
        var subjects = this.st.getSubjects();
        assertEquals(2, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
        assertEquals("http://b.org/john", subjects[1]);
      }
    }
  },
  'test removeSubject': function() {
    {
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("b:john", "a:name", "b:John");
      this.st.push("b:john", "b:address", "Cambridge");
      
      //check
      {
        this.st.removeSubject("xxx");
        
        subjects = this.st.getSubjects();
        assertEquals(2, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
        assertEquals("http://b.org/john", subjects[1]);
      }
      {
        this.st.removeSubject("bob");
        
        subjects = this.st.getSubjects();
        assertEquals(2, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
        assertEquals("http://b.org/john", subjects[1]);
      }
      {
        this.st.removeSubject("b:bob");
        
        subjects = this.st.getSubjects();
        assertEquals(2, subjects.length);
        assertEquals("http://a.org/bob", subjects[0]);
        assertEquals("http://b.org/john", subjects[1]);
      }
      {
        this.st.removeSubject("a:bob");
        
        subjects = this.st.getSubjects();
        assertEquals(1, subjects.length);
        assertEquals("http://b.org/john", subjects[0]);
      }
      {
        this.st.removeSubject("b:john");
        
        subjects = this.st.getSubjects();
        assertEquals(0, subjects.length);
      }
    }
  },
  'test localStorage.clear() with removeSubject': function() {
    {
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("b:john", "a:name", "b:John");
      this.st.push("b:john", "b:address", "Cambridge");
      
      //check
      {
        this.st.removeSubject();
        
        subjects = this.st.getSubjects();
        assertEquals(0, subjects.length);
      }
    }
  },
  'test removeProperty': function() {
    {
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("a:bob", "a:phone", "617");      
      this.st.push("b:john", "a:name", "b:John");
      this.st.push("b:john", "b:address", "Cambridge");
      
      //check
      {
        this.st.removeProperty("xxx");
        
        var properties = this.st.getProperties("a:bob");
        assertEquals(3, properties.length);
        assertEquals("http://a.org/name", properties[0]);
        assertEquals("http://a.org/address", properties[1]);
        assertEquals("http://a.org/phone", properties[2]);
        var properties = this.st.getProperties("b:john");
        assertEquals(2, properties.length);
        assertEquals("http://a.org/name", properties[0]);
        assertEquals("http://b.org/address", properties[1]);
      }
      {
        this.st.removeProperty("a:name", "xxx");
        
        var properties = this.st.getProperties("a:bob");
        assertEquals(3, properties.length);
        assertEquals("http://a.org/name", properties[0]);
        assertEquals("http://a.org/address", properties[1]);
        assertEquals("http://a.org/phone", properties[2]);
        var properties = this.st.getProperties("b:john");
        assertEquals(2, properties.length);
        assertEquals("http://a.org/name", properties[0]);
        assertEquals("http://b.org/address", properties[1]);
      }
      {
        this.st.removeProperty("xxx", "Cambridge");
        
        var properties = this.st.getProperties("a:bob");
        assertEquals(3, properties.length);
        assertEquals("http://a.org/name", properties[0]);
        assertEquals("http://a.org/address", properties[1]);
        assertEquals("http://a.org/phone", properties[2]);
        var properties = this.st.getProperties("b:john");
        assertEquals(2, properties.length);
        assertEquals("http://a.org/name", properties[0]);
        assertEquals("http://b.org/address", properties[1]);
      }
      {
        this.st.removeProperty("a:name");
        
        var properties = this.st.getProperties("a:bob");
        assertEquals(2, properties.length);
        assertEquals("http://a.org/address", properties[0]);
        assertEquals("http://a.org/phone", properties[1]);
        var properties = this.st.getProperties("b:john");
        assertEquals(1, properties.length);
        assertEquals("http://b.org/address", properties[0]);
      }
      {
        this.st.removeProperty(null, "Cambridge");
        
        var properties = this.st.getProperties("a:bob");
        assertEquals(1, properties.length);
        assertEquals("http://a.org/phone", properties[0]);
        var properties = this.st.getProperties("b:john");
        assertEquals(0, properties.length);
      }
      {
        this.st.removeProperty("a:phone", "617");
        
        var properties = this.st.getProperties("a:bob");
        assertEquals(0, properties.length);
        var properties = this.st.getProperties("b:john");
        assertEquals(0, properties.length);
      }
    }
    {//remove all properties
      this.st.removeSubject();
      this.st.setMapping("a", "http://a.org/");
      this.st.setMapping("b", "http://b.org/");
      this.st.push("a:bob", "a:name", "a:Bob");
      this.st.push("a:bob", "a:address", "Cambridge");
      this.st.push("a:bob", "a:phone", "617");      
      this.st.push("b:john", "a:name", "b:John");
      this.st.push("b:john", "b:address", "Cambridge");
      
      {//check
        this.st.removeProperty();
        
        var properties = this.st.getProperties("a:bob");
        assertEquals(0, properties.length);
        var properties = this.st.getProperties("b:john");
        assertEquals(0, properties.length);
      }
    }
  },
});
