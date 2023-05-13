/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.ParseModel.Contexts;
using YoggTree;

namespace EventUITestFramework.ParseModel.Tokens
{
    /// <summary>
    /// Marks the beginning of a directive.
    /// </summary>
    public class EventUITestDirectiveStartToken : TokenDefinition
    {
        public EventUITestDirectiveStartToken()
            : base(TestGenRegexStore.DirectiveStart, "/*#", TokenDefinitionFlags.ContextStarter, "Directive")
        {
        }

        public override TokenContextDefinition GetNewContextDefinition(TokenInstance start)
        {
            return EventUITestContexts.DirectiveContext;
        }

        public override bool CanComeBefore(TokenInstance nextToken, TokenInstance validatingToken)
        {
            if (nextToken.TokenInstanceType == TokenInstanceType.TextPlaceholder)
            {
                if (nextToken.GetNextToken().Is<EventUITestDirectiveEndToken>())
                {
                    return true; //if this token is the start of a comment with random text in it, we still consider it valid if it ends with the ending token
                }
            }

            if (nextToken.Is<EventUITestDirectiveTypeToken>()) return true; //the only token that can follow this one is a directive if its not followed by plain text and an ending token

            return true;
        }
    }

    /// <summary>
    /// Marks the end of a directive.
    /// </summary>
    public class EventUITestDirectiveEndToken : TokenDefinition
    {
        public EventUITestDirectiveEndToken()
             : base(TestGenRegexStore.DirectiveEnd, "#*/", TokenDefinitionFlags.ContextEnder, "Directive")
        {
        }

        public override bool CanComeAfter(TokenInstance previousToken, TokenInstance validatingToken)
        {
            if (previousToken.Is<EventUITestDirectiveTypeToken>()) return true; //directive was just a command with no parameters - valid
            if (previousToken.Is<DirectiveParametersEndToken>()) return true; //directive had an ending parameter token - valid

            if (previousToken.TokenInstanceType == TokenInstanceType.ContextPlaceholder)
            {
                var childContext = previousToken.GetChildContext();

                if (childContext.Is<EventUITestParameterContext>() || childContext.Is<EventUITestDirectiveStringContext>())
                {
                    return true; //if this token is the start of a comment with random text in it, we still consider it valid if it starts with the start token
                }
            }

            return false;
        }
    }

    /// <summary>
    /// Captures the specific directive command that was used.
    /// </summary>
    public class EventUITestDirectiveTypeToken : TokenDefinition
    {
        public EventUITestDirectiveTypeToken()
            : base(new Regex("((?>TEST_)(ROOT|SET|FILE|DEPENDENCY|START))|((?>(RUN_|SKIP_))(FILE|SET))"), "EventUITestDirectiveType")
        {

        }

        public override bool CanComeAfter(TokenInstance previousToken, TokenInstance validatingToken)
        {
            if (previousToken.Is<EventUITestDirectiveStartToken>()) return true; //can only follow a directive start token
            return false;
        }

        public override bool CanComeBefore(TokenInstance nextToken, TokenInstance validatingToken)
        {
            var previousIsValid = nextToken.Is<DirectiveParametersStartToken>() || nextToken.Is<EventUITestDirectiveEndToken>(); //can only come before a directive end token or a parameter start token.
            return previousIsValid;
        }
    }
}