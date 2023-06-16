/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Deserialization
{
    /// <summary>
    /// Represents a dependency item for a test.
    /// </summary>
    public class TestDependency : INamedRunnableItem
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public TestRunnableType ItemType { get; } = TestRunnableType.Dependency;

        /// <summary>
        /// The way in which the file(s) will be selected.
        /// </summary>
        public TestFileSelector Selector { get; set; } = null;

        /// <summary>
        /// Dependencies are normally added in order of addition in TestSets or TestRoots - this field can be used to change the order of dependency injection into the test. All members with the same ordinal are added as a set in order of addition. Lower ordinals are injected before higher ordinals.
        /// </summary>
        public double Priority { get; set; } = 0;
    }
}
