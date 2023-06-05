using EventUITestFramework.TestModel2.Deserialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFrameworkTests
{
    public class BasicJSONParse
    {
        [Fact]
        public void TestDeserializer()
        {
            string json = """
                                {
                  "version": "1.0",
                  "type": "root",
                  "name": "EVUI Test Suite",
                  "description": "Root test runner for all of the tests for EVUI and its associated testing library.",
                  "dependencies": [
                    {
                      "selector": {
                        "name": "evui-raw" //defined in the C# setup - the actual test files can be in an arbitrary location
                      },
                      "priority": -1
                    },
                    { //the actual test library
                      "name": "evui-test",
                      "path": "EVUITest.js",
                      "priority": -1
                    }
                  ],
                  "run": [
                    { //tests for the testing library
                      "type": "set",
                      "name": "meta-tests",
                      "failureMode": "terminate"
                    },
                    { //tests for the event ui modules
                      "type": "set",
                      "name": "module-tests"
                    }
                  ]
                }
                """;

            var deserializer = new JSONTestDeserializer2();
            var result = deserializer.Deserialize(json);    
        }
    }
}
