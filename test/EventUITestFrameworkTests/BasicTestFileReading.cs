using EventUITestFramework.Model.Parsing.Contexts;
using EventUITestFramework.Model.Parsing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PogTree;

namespace EventUITestFrameworkTests
{
    public class BasicTestFileReading
    {
        [Fact]
        public void GetTestParseResult()
        {

            string content = """
                /*#TEST_FILE("myFile")#*/
                /*#TEST_START("someJS")#*/

                var x = 7;
                for (var y = 0; y < x; y++)
                {
                    console.log(y);
                }

                /*#TEST_START("second test")#*/

                console.log("asdf");
                """;

            var parser = new TokenParser();
            var result = parser.Parse<EventUITestFileContext>(content);

            var testFileResult = EventUITestFileParser.ParseTestFile(result, "blah");
        }
    }
}
