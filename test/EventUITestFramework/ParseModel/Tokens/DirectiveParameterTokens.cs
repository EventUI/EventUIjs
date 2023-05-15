/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/


using EventUITestFramework.ParseModel.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.ParseModel.Tokens
{
    /// <summary>
    /// Marker interface for marking a TokenDefinition as pertaining to the tokens for directive parameters.
    /// </summary>
    public interface IEventUIParameterToken { };

    /// <summary>
    /// Token for the opening "(" in a directive's parameter list.
    /// </summary>
    public class DirectiveParametersStartToken : TokenDefinition, IEventUIParameterToken
    {
        public DirectiveParametersStartToken()
            : base(TokenRegexStore.Parenthesis_Open, "(", TokenDefinitionFlags.ContextStarter, "DirectiveParameters")
        {
        }

        public override bool CanComeAfter(TokenInstance previousToken, TokenInstance validatingToken)
        {
            if (previousToken.Is<EventUITestDirectiveTypeToken>()) return true; //parameters can only start AFTER the main directive telling us what the parameters are for
            return false;
        }

        public override bool CanComeBefore(TokenInstance nextToken, TokenInstance validatingToken)
        {
            if (nextToken.Is<DirectiveParametersEndToken>() || nextToken.Is<DirectiveParameterStringToken>()) return true; //empty parameter list - valid
            if (nextToken.TokenInstanceType == TokenInstanceType.TextPlaceholder) return true; //came after a string of text - valid
            if (nextToken.TokenInstanceType == TokenInstanceType.ContextPlaceholder) //if it comes after a context placeholder holding a quoted string context it is also valid
            {
                if (nextToken.GetChildContext().Is<EventUITestDirectiveStringContext>()) return true;
            }

            return false; //any other position for this token in a the directive context is invalid.
        }

        public override TokenContextDefinition GetNewContextDefinition(TokenInstance start)
        {
            return EventUITestContexts.ParameterContext;
        }
    }

    /// <summary>
    /// Token for the closing ")" in a directive's parameter list.
    /// </summary>
    public class DirectiveParametersEndToken : TokenDefinition, IEventUIParameterToken
    {
        public DirectiveParametersEndToken()
            : base(TokenRegexStore.Parenthesis_Close, ")", TokenDefinitionFlags.ContextEnder, "DirectiveParameters")
        {
        }

        public override bool CanComeAfter(TokenInstance previousToken, TokenInstance validatingToken)
        {
            if (previousToken.Is<DirectiveParametersStartToken>() || previousToken.Is<DirectiveParameterStringToken>()) return true; //empty parameter list - valid
            if (previousToken.TokenInstanceType == TokenInstanceType.ContextPlaceholder) //can come after a string text context placeholder
            {
                if (previousToken.GetChildContext().Is<EventUITestDirectiveStringContext>()) return true;
            }

            if (previousToken.TokenInstanceType == TokenInstanceType.TextPlaceholder) return true; //can also come after plain text

            return false; //otherwise its a syntax error
        }

        public override bool CanComeBefore(TokenInstance nextToken, TokenInstance validatingToken)
        {
            if (nextToken.Is<EventUITestDirectiveEndToken>()) return true; //the only token that can follow this one is a directive end token.
            return false;
        }
    }

    /// <summary>
    /// Token for the separating "," in a set of multiple parameters. Always sits between runs of text or quoted text contents.
    /// </summary>
    public class DirectiveParameterSeparatorToken : TokenDefinition, IEventUIParameterToken
    {
        public DirectiveParameterSeparatorToken()
            : base(TestGenRegexStore.ParameterSeparator, ",")
        {
        }

        public override bool CanComeAfter(TokenInstance previousToken, TokenInstance validatingToken)
        {
            if (previousToken.TokenInstanceType == TokenInstanceType.TextPlaceholder) return true; //can come after plain text
            if (previousToken.TokenInstanceType == TokenInstanceType.ContextPlaceholder) //can come after a quoted string context
            {
                if (previousToken.GetChildContext().Is<EventUITestDirectiveStringContext>() == false) return false;
                return true;
            }

            return false; //but nothing else
        }

        public override bool CanComeBefore(TokenInstance nextToken, TokenInstance validatingToken)
        {
            if (nextToken.TokenInstanceType == TokenInstanceType.TextPlaceholder) return true; //can come before a text placeholder
            if (nextToken.TokenInstanceType == TokenInstanceType.ContextPlaceholder) //can come before a quoted context as well
            {
                if (nextToken.GetChildContext()?.ContextDefinition is EventUITestDirectiveStringContext == false) return false;
                return true;
            }

            return false; //otherwise its invalid
        }
    }

    /// <summary>
    /// Represents a " character in a directive that marks the start or end of a string literal.
    /// </summary>
    public class DirectiveParameterStringToken : TokenDefinition
    {
        public DirectiveParameterStringToken()
            : base(TokenRegexStore.DoubleQuote, "ParameterString", TokenDefinitionFlags.ContextStarter | TokenDefinitionFlags.ContextEnder, "ParamString")
        {

        }

        public override TokenContextDefinition GetNewContextDefinition(TokenInstance start)
        {
            return EventUITestContexts.StringContext;
        }
    }
}
