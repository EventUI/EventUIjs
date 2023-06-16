using EventUITestFramework.Model.Parsing.Contexts;
using YoggTree;

namespace EventUITestFrameworkTests
{
    public class BasicParseTests
    {
        [Fact]
        public void BasicParse()
        {
            var content = """/*#TEST_SET("apples")#*/""";

            var parser = new TokenParser();
            var result = parser.Parse<EventUITestFileContext>(content);

            Assert.Equal(1, result.ChildContexts.Count);
            Assert.True(result.ChildContexts[0].Is<EventUITestDirectiveContext>());//we should have only one child - an EventUITestDirectiveContext


            Assert.Equal(1, result.Tokens.Count);
            Assert.True(result.Tokens[0].TokenInstanceType == TokenInstanceType.ContextPlaceholder);
            Assert.True(result.Tokens[0].GetChildContext() == result.ChildContexts[0]); //we should have only one token - a placeholder that points to our 0th context.
        }

        [Fact]
        public void MultipleDirectiveParse()
        {
            string content = """
                /*#TEST_FILE("myFile")#*/
                /*#TEST_START("someJS")#*/

                var x = 7;
                for (var y = 0; y < x; y++)
                {
                    console.log(y);
                }
                """;

            var parser = new TokenParser();
            var result = parser.Parse<EventUITestFileContext>(content);

            Assert.Equal(2, result.ChildContexts.Count); //should have 2 child contexts - one for each directive
            Assert.True(result.ChildContexts[0].Is<EventUITestDirectiveContext>());
            Assert.True(result.ChildContexts[1].Is<EventUITestDirectiveContext>());

            Assert.Equal(4, result.Tokens.Count);

            Assert.True(result.Tokens[0].TokenInstanceType == TokenInstanceType.ContextPlaceholder);
            Assert.True(result.Tokens[0].GetChildContext() == result.ChildContexts[0]);

            Assert.True(result.Tokens[1].TokenInstanceType == TokenInstanceType.TextPlaceholder);
            Assert.True(result.Tokens[1].Contents.Length > 0);

            Assert.True(result.Tokens[2].TokenInstanceType == TokenInstanceType.ContextPlaceholder);
            Assert.True(result.Tokens[2].GetChildContext() == result.ChildContexts[1]);

            Assert.True(result.Tokens[3].TokenInstanceType == TokenInstanceType.TextPlaceholder);
            Assert.True(result.Tokens[3].Contents.Length > 0);
        }

        [Fact]
        public void MultipleTestParse()
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

            Assert.Equal(3, result.ChildContexts.Count); //should have 2 child contexts - one for each directive
            Assert.True(result.ChildContexts[0].Is<EventUITestDirectiveContext>());
            Assert.True(result.ChildContexts[1].Is<EventUITestDirectiveContext>());
            Assert.True(result.ChildContexts[2].Is<EventUITestDirectiveContext>());

            Assert.Equal(6, result.Tokens.Count);

            Assert.True(result.Tokens[0].TokenInstanceType == TokenInstanceType.ContextPlaceholder);
            Assert.True(result.Tokens[0].GetChildContext() == result.ChildContexts[0]);

            Assert.True(result.Tokens[1].TokenInstanceType == TokenInstanceType.TextPlaceholder);
            Assert.True(result.Tokens[1].Contents.Length > 0);

            Assert.True(result.Tokens[2].TokenInstanceType == TokenInstanceType.ContextPlaceholder);
            Assert.True(result.Tokens[2].GetChildContext() == result.ChildContexts[1]);

            Assert.True(result.Tokens[3].TokenInstanceType == TokenInstanceType.TextPlaceholder);
            Assert.True(result.Tokens[3].Contents.Length > 0);

            Assert.True(result.Tokens[4].TokenInstanceType == TokenInstanceType.ContextPlaceholder);
            Assert.True(result.Tokens[4].GetChildContext() == result.ChildContexts[2]);

            Assert.True(result.Tokens[5].TokenInstanceType == TokenInstanceType.TextPlaceholder);
            Assert.True(result.Tokens[5].Contents.Length > 0);
        }
    }
}