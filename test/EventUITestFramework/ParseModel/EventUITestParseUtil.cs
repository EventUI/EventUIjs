/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.ParseModel.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.ParseModel
{
    public static class EventUITestParseUtil
    {
        public static TokenContextInstance ParseFile(string fileContents)
        {
            var parser = new TokenParser();
            return parser.Parse<EventUITestFileContext>(fileContents);
        }
    }
}
