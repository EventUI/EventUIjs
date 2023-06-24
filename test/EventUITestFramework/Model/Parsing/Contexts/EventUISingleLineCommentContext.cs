/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.Model.Parsing.Contexts
{
    public class EventUISingleLineCommentContext : TokenContextDefinition
    {
        public EventUISingleLineCommentContext() 
            : base("SingleLineCommentContext")
        {
            AddToken<WhitespaceVerticalToken>();
        }

        public override bool EndsCurrentContext(TokenInstance tokenInstance)
        {
            if (tokenInstance.Is<WhitespaceVerticalToken>()) return true;

            return false;
        }

        public override bool StartsNewContext(TokenInstance tokenInstance)
        {
            return false;
        }
    }
}
