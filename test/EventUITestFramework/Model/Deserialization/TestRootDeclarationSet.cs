/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Deserialization
{
    /// <summary>
    /// Represents a set of declarations where items are mapped to aliases.
    /// </summary>
    public class TestRootDeclarationSet
    {
        /// <summary>
        /// All of the dependencies to map.
        /// </summary>
        public List<TestDependency> Dependencies { get; set; } = null;
    }
}
