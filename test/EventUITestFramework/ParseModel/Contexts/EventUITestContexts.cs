/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.ParseModel.Contexts
{
    public static class EventUITestContexts
    {
        public static EventUITestDirectiveStringContext StringContext { get; } = new EventUITestDirectiveStringContext();

        public static EventUITestDirectiveContext DirectiveContext { get; } = new EventUITestDirectiveContext();

        public static EventUITestFileContext FileContext { get; } = new EventUITestFileContext();

        public static EventUITestParameterContext ParameterContext { get; } = new EventUITestParameterContext();
    }
}
