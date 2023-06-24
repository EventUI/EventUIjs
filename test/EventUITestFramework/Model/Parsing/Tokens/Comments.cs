/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.Model.Parsing.Tokens
{
    public class EventUISingleLineCommentToken : TokenDefinition
    {
        public EventUISingleLineCommentToken()
            : base(TestGenRegexStore.SingleLineCommentStart, "SingleLineComment", TokenDefinitionFlags.ContextStarter, "SingleLineComment")
        {

        }

        public override TokenContextDefinition GetNewContextDefinition(TokenInstance start)
        {
            return EventUITestContexts.SingleLineCommentContext;
        }
    }
}
