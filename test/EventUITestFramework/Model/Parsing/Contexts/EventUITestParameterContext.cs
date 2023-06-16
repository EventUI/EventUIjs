/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Parsing.Contexts
{
    public class EventUITestParameterContext : TokenContextDefinition
    {
        public EventUITestParameterContext()
            : base("EventUITestParameterContext")
        {
            AddTokens(new List<Type>()
            {
                typeof(DirectiveParametersStartToken),
                typeof(DirectiveParametersEndToken),
                typeof(DirectiveParameterStringToken),
                typeof(DirectiveParameterSeparatorToken)
            });
        }
    }
}
