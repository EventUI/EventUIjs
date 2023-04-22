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
    /// <summary>
    /// Represents a run of literal text (between two double-quotes) that should not have any other tokens processed in it.
    /// </summary>
    public class EventUITestDirectiveStringContext : TokenContextDefinition
    {
        public EventUITestDirectiveStringContext()
            : base("EventUITestDirectiveStringContext")
        {
            AddToken<DirectiveParameterStringToken>();
            AddToken<BackslashToken>();
        }

        public override bool EndsCurrentContext(TokenInstance tokenInstance)
        {
            if (base.EndsCurrentContext(tokenInstance) == true)
            {
                if (tokenInstance.GetPreviousToken().Is<BackslashToken>()) return false;
                return true;
            }

            return false;
        }

        public override bool StartsNewContext(TokenInstance tokenInstance)
        {
            return false;
        }
    }
}
