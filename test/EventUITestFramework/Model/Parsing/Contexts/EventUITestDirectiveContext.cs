/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Parsing.Contexts
{
    /// <summary>
    /// Represents a context that follows the pattern for directives: /*#DIRECTIVE_NAME(possibleParameters|"or string parameters")#*/
    /// </summary>
    public class EventUITestDirectiveContext : TokenContextDefinition
    {
        public EventUITestDirectiveContext()
            : base("EventUIDirective")
        {
            AddTokens(new List<Type>() {
                typeof(EventUITestDirectiveStartToken),
                typeof(EventUITestDirectiveEndToken),
                typeof(EventUITestDirectiveTypeToken),
                typeof(DirectiveParametersStartToken),
                typeof(DirectiveParametersEndToken),
            });
        }

        public override bool StartsNewContext(TokenInstance tokenInstance)
        {
            return base.StartsNewContext(tokenInstance);
        }
    }
}
