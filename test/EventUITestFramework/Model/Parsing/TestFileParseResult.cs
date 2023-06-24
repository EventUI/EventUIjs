/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.Model.Parsing
{
    public class TestFileParseResult
    {
        public string FullPath { get; internal set; }

        public TestFile TestFile { get; internal set; } = null;

        public ImmutableList<TestCode> Tests { get; internal set; } = ImmutableList<TestCode>.Empty;
    }
}
