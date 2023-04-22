/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.ParseModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.ParseModel.Contexts
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
                typeof(DirectiveParameterSeperatorToken)
            });
        }
    }
}
