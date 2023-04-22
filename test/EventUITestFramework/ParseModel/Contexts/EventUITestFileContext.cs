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
    /// Represents the context for an entire file and the root context for the test gen parser. Only searches for directives within the file.
    /// </summary>
    public class EventUITestFileContext : TokenContextDefinition
    {
        public EventUITestFileContext()
            : base("EventUITestContainer")
        {
            AddToken<EventUITestDirectiveStartToken>();
            AddToken<EventUITestDirectiveEndToken>();
        }
    }
}
