/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Parsing.Tokens
{
    public static class TestGenRegexStore
    {
        public static Regex DirectiveStart { get; } = new Regex("\\/\\*#", RegexOptions.NonBacktracking | RegexOptions.Compiled);

        public static Regex DirectiveEnd { get; } = new Regex("#\\*\\/", RegexOptions.NonBacktracking | RegexOptions.Compiled);

        public static Regex ParameterSeparator { get; } = new Regex("\\s*,\\s*", RegexOptions.NonBacktracking | RegexOptions.Compiled);

        public static Regex SingleLineCommentStart { get; } = new Regex("\\/\\/", RegexOptions.NonBacktracking | RegexOptions.Compiled);

        public static Regex RawString { get; } = new Regex("\"|'|`", RegexOptions.NonBacktracking | RegexOptions.Compiled);
    }
}
