/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Deserialization
{
    /// <summary>
    /// Represents a file that contains actual test code.
    /// </summary>
    public class TestFile : INamedRunnableItem
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public TestRunnableType ItemType { get; } = TestRunnableType.File;

        /// <summary>
        /// The dependencies that are specific to this file.
        /// </summary>
        public List<TestDependency> Dependencies { get; } = new List<TestDependency>();
    }
}
