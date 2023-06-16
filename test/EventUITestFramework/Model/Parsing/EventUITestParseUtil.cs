/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Parsing
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
