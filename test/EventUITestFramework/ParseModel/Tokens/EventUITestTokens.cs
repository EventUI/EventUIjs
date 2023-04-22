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
    public static class EventUITestTokens
    {
        public static EventUITestDirectiveStartToken DirectiveStart { get; } = new EventUITestDirectiveStartToken();

        public static EventUITestDirectiveEndToken DirectiveEnd { get; } = new EventUITestDirectiveEndToken();

        public static DirectiveParametersStartToken ParametersStart { get; } = new DirectiveParametersStartToken();

        public static DirectiveParametersEndToken ParametersEnd { get; } = new DirectiveParametersEndToken();

        public static DirectiveParameterSeperatorToken ParameterSeperator { get; } = new DirectiveParameterSeperatorToken();

        public static DirectiveParameterStringToken ParameterString { get; } = new DirectiveParameterStringToken();

        public static EventUITestDirectiveTypeToken DirectiveType { get; } = new EventUITestDirectiveTypeToken();
    }
}
