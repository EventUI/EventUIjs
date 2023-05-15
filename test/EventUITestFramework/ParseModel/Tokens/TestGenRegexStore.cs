/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.ParseModel.Tokens
{
    public static class TestGenRegexStore
    {
        public static Regex DirectiveStart { get; } = new Regex("\\/\\*#", RegexOptions.NonBacktracking | RegexOptions.Compiled);

        public static Regex DirectiveEnd { get; } = new Regex("#\\*\\/", RegexOptions.NonBacktracking | RegexOptions.Compiled);

        public static Regex ParameterSeparator { get; } = new Regex("\\s*,\\s*", RegexOptions.NonBacktracking | RegexOptions.Compiled);
    }
}
