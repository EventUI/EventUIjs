using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PogTree;
using PogTree.Core.Tokens;

namespace EventUITestFramework.Model.Parsing
{
    internal abstract class EventUITestDirective
    {
        public TokenContextInstance DirectiveContext { get; set; } = null;

        internal static EventUITestDirective GetDirective(TokenContextInstance context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (context.Is<EventUITestDirectiveContext>() == false) throw new ArgumentException($"Context must be an instance wrapping {nameof(EventUITestDirectiveContext)} definition.");

            var directiveToken = context.Tokens.First(t => t.Is<EventUITestDirectiveTypeToken>());
            if (directiveToken == null) throw new Exception($"Malformed {nameof(EventUITestDirectiveContext)} instance: Missing {nameof(EventUITestDirectiveTypeToken)} instance in context. Directive type is ambiguous.");

            string directiveName = directiveToken.GetText();
            if (directiveName == "TEST_START")
            {
                return ReadTestStartDirective(context);
            }
            else if (directiveName == "TEST_FILE")
            {
                return ReadTestFileDirective(context);
            }
            else if (directiveName == "TEST_DEPENDENCY")
            {
                return ReadTestDependencyDirective(context);
            }
            else
            {
                return null;
            }
        }

        internal static TestFileDirective ReadTestFileDirective(TokenContextInstance context)
        {
            TokenReader reader = context.GetReader();

            var nameParameter = reader.GetNextContext<EventUITestParameterContext>(true);
            if (nameParameter == null)
            {
                return new TestFileDirective()
                {
                    DirectiveContext = context,
                    FileName = Guid.NewGuid().ToString(),
                };
            }

            var nameContext = reader.GetNextContext<EventUITestDirectiveStringContext>(true);
            string actualName = nameContext.GetText(); //nameParameter.GetChildContext().Tokens.First(t => t.TokenInstanceType == TokenInstanceType.ContextPlaceholder && t.GetChildContext().Is<EventUITestDirectiveStringContext>() == true)?.GetText();
            return new TestFileDirective()
            {
                DirectiveContext = context,
                FileName = (String.IsNullOrWhiteSpace(actualName) ? Guid.NewGuid().ToString() : actualName),
            };
        }

        internal static TestStartDirective ReadTestStartDirective(TokenContextInstance context)
        {
            TokenReader reader = context.GetReader();
            var nameParameter = reader.GetNextContext<EventUITestParameterContext>(true);
            if (nameParameter == null)
            {
                return new TestStartDirective()
                {
                    DirectiveContext = context,
                    TestName = Guid.NewGuid().ToString(),
                };
            }

            string actualName = reader.GetNextContext<EventUITestDirectiveStringContext>(true).GetText(); //nameParameter.GetChildContext().Tokens.First(t => t.TokenInstanceType == TokenInstanceType.ContextPlaceholder && t.GetChildContext().Is<EventUITestDirectiveStringContext>() == true)?.GetText();
            return new TestStartDirective()
            {
                DirectiveContext = context,
                TestName = (String.IsNullOrWhiteSpace(actualName) ? Guid.NewGuid().ToString() : actualName),
            };
        }

        internal static TestDependencyDirective ReadTestDependencyDirective(TokenContextInstance context)
        {
            TokenReader reader = context.GetReader();
            var nameParameter = reader.GetNextContext<EventUITestParameterContext>(true);
            if (nameParameter == null) return null;

            string actualName = reader.GetNextContext<EventUITestDirectiveStringContext>(true).GetText();
            TestDependencyMode testMode = TestDependencyMode.Add;
            double priority = 0;

            var modeParameter = reader.GetNextContext<EventUITestParameterContext>();
            if (modeParameter != null)
            {
                string stringValue = reader.GetNextToken<TextContentToken>(true).GetText();
                if (Enum.TryParse<TestDependencyMode>(stringValue, out TestDependencyMode mode) == true)
                {
                    testMode = mode;
                }
            }
            
            var priorityParameter = reader.GetNextContext<EventUITestParameterContext>(true);
            if (priorityParameter != null)
            {
                string stringValue = reader.GetNextToken<TextContentToken>(true).GetText();
                if (double.TryParse(stringValue, out double prio) == true) 
                {
                    priority = prio;
                }
            }

            return new TestDependencyDirective()
            {
                DirectiveContext = context,
                DependencyName = actualName,
                Mode = testMode,
                Priority = priority
            };
        }
    }

    internal class TestFileDirective : EventUITestDirective
    {
        public string FileName { get; set; } = null;
    }

    internal class TestStartDirective : EventUITestDirective
    {
        public string TestName { get; set; } = null;
    }

    internal class TestDependencyDirective : EventUITestDirective
    {
        public string DependencyName { get; set; } = null;

        public TestDependencyMode Mode { get; set; } = TestDependencyMode.Add;

        public double Priority { get; set; } = 0;
    }


}
